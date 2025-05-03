// src/components/ProductDetail.js

// Import necessary React hooks: useState, useEffect, useContext, useCallback
import React, { useEffect, useState, useContext, useCallback } from "react";
// Import components from react-router-dom for routing and URL parameters
import { Link, useParams, useNavigate } from "react-router-dom";
// Import Contexts for accessing cart and auth state/functions
import { CartContext } from "../pages/CartContext"; // Import Cart context
import { AuthContext } from "../account/AuthContext"; // Import Auth context
// Import CSS for styling
import "./ProductDetail.css";

// --- Hằng số ---

// URL cho nguồn dữ liệu sản phẩm (file JSON)
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Các thông báo hiển thị cho người dùng
const MESSAGES = {
  LOADING: "Loading product details...",
  ERROR_FETCH: "Failed to load product data!",
  ERROR_NOT_FOUND: "Product not found!",
  SUCCESS_ADD_TO_CART: "Added to cart successfully!",
  LOGIN_REQUIRED: "Please login to add items to cart!",
};
// Key để lưu trữ danh sách sản phẩm vào localStorage làm cache
const LOCAL_STORAGE_PRODUCTS_KEY = "products";


// --- Component ProductDetail ---
// Hiển thị chi tiết của một sản phẩm cụ thể dựa trên ID từ URL.
const ProductDetail = () => {
  // Lấy ID sản phẩm từ URL parameters. useParams trả về một object.
  const { id } = useParams();
  // Hook điều hướng chương trình
  const navigate = useNavigate();
  // Lấy hàm addToCart từ CartContext để thêm sản phẩm vào giỏ hàng
  const { addToCart } = useContext(CartContext);
  // Lấy trạng thái isLoggedIn từ AuthContext một cách an toàn.
  // Sử dụng optional chaining và giá trị mặc định false nếu AuthContext chưa sẵn sàng.
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  // --- Quản lý State ---
  const [product, setProduct] = useState(null); // Lưu trữ chi tiết sản phẩm đã fetch
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading (true khi đang fetch)
  const [error, setError] = useState(null); // Lưu trữ thông báo lỗi nếu có
  const [message, setMessage] = useState(""); // Lưu trữ thông báo thành công/thông tin cho người dùng

  // --- Hook Effect để fetch dữ liệu sản phẩm khi component mount hoặc ID thay đổi ---
  // Effect này chạy mỗi khi ID sản phẩm trên URL thay đổi hoặc khi component mount lần đầu.
  useEffect(() => {
    // AbortController giúp hủy bỏ request fetch nếu component bị unmount hoặc effect chạy lại
    const controller = new AbortController();
    const signal = controller.signal;

    // Hàm bất đồng bộ để thực hiện fetch dữ liệu sản phẩm
    const fetchProduct = async () => {
      try {
        // Reset state trước khi bắt đầu fetch mới
        setIsLoading(true);
        setError(null);
        setProduct(null);
        setMessage(""); // Xóa thông báo trước đó

        let productList; // Biến để lưu trữ danh sách sản phẩm (từ cache hoặc fetch mới)

        // --- Kiểm tra Cache trong localStorage ---
        const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);

        if (cachedProducts) {
          try {
            // Cố gắng parse dữ liệu từ cache
            productList = JSON.parse(cachedProducts);
            // console.log("Sử dụng dữ liệu sản phẩm từ localStorage (cache)."); // Dev log
            // Đảm bảo dữ liệu từ cache là một mảng
            if (!Array.isArray(productList)) {
              console.warn("Cached product data is not an array, fetching from API");
              productList = [];
            }
          } catch (parseError) {
            // Xử lý lỗi khi parse dữ liệu từ cache
            console.error("Error parsing cached product data:", parseError);
            productList = [];
          }
        }

        // --- Fetch từ API nếu cache trống hoặc bị lỗi ---
        if (!Array.isArray(productList) || productList.length === 0) {
          console.log("Fetch dữ liệu sản phẩm từ API (cache trống hoặc lỗi).");
          const response = await fetch(API_URL, { signal }); // Thực hiện fetch

          // Kiểm tra nếu response không thành công
          if (!response.ok) {
            throw new Error(MESSAGES.ERROR_FETCH); // Ném lỗi với thông báo tùy chỉnh
          }

          const data = await response.json(); // Parse response thành JSON
          // Lấy danh sách sản phẩm, xử lý trường hợp data là mảng hoặc object có key 'products'
          productList = Array.isArray(data) ? data : data.products || [];

          // Lưu danh sách sản phẩm vừa fetch vào localStorage làm cache (nếu danh sách không rỗng)
          if (productList.length > 0) {
            try {
              localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
            } catch (storageError) {
              console.error("Error saving product data to localStorage:", storageError);
            }
          }
        }


        // --- Tìm sản phẩm theo ID trong danh sách đã có ---
        // Chuyển ID từ URL (chuỗi) sang số để so sánh chính xác
        const productIdNumber = Number(id);
        // Tìm sản phẩm trong productList (đảm bảo productList là mảng)
        const foundProduct = Array.isArray(productList) ? productList.find((p) => p.id === productIdNumber) : undefined;
        // console.log(`Tìm sản phẩm với ID: ${id}`, foundProduct); // Dev log

        // Nếu không tìm thấy sản phẩm
        if (!foundProduct) {
          setError(MESSAGES.ERROR_NOT_FOUND); // Đặt thông báo lỗi "Không tìm thấy"
          setProduct(null); // Đảm bảo state product là null
          return; // Dừng hàm
        }

        // Nếu tìm thấy sản phẩm, cập nhật state product
        setProduct(foundProduct);

      } catch (err) {
        // Bắt các lỗi xảy ra trong quá trình fetch (trừ AbortError đã xử lý)
        if (err.name !== "AbortError") {
          console.error("Error in fetchProduct:", err); // Log lỗi chi tiết
          setError(err.message || MESSAGES.ERROR_FETCH); // Đặt thông báo lỗi (ưu tiên lỗi từ fetch, fallback về lỗi chung)
          setProduct(null); // Đảm bảo state product là null khi có lỗi
        }
      } finally {
        setIsLoading(false); // Kết thúc trạng thái loading
      }
    };

    fetchProduct(); // Bắt đầu quá trình fetch khi effect chạy

    // Cleanup function: hủy bỏ fetch request khi component unmount hoặc effect chạy lại (ID thay đổi)
    return () => controller.abort();
  }, [id]); // Dependency array: effect chạy lại khi giá trị của 'id' thay đổi

  // --- Handler cho nút "Thêm vào giỏ hàng" ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const handleAddToCart = useCallback((event) => {
    // 1. Kiểm tra trạng thái đăng nhập của người dùng
    if (!isLoggedIn) {
      setMessage(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập
      // Chuyển hướng đến trang đăng nhập sau một khoảng trễ
      setTimeout(() => {
        setMessage(""); // Xóa thông báo
        navigate("/"); // Chuyển hướng về trang chủ/đăng nhập
      }, 1500); // Trễ 1.5 giây
      return; // Dừng hàm nếu chưa đăng nhập
    }

    // 2. Kiểm tra xem dữ liệu sản phẩm có sẵn và hợp lệ không
    // Đảm bảo product tồn tại và có thuộc tính id
    if (!product || typeof product.id === 'undefined') {
      console.warn("Invalid product data for cart");
      return; // Dừng hàm nếu không có sản phẩm hợp lệ
    }

    // 3. Thêm sản phẩm vào giỏ hàng bằng hàm từ CartContext
    addToCart(product); // Thêm đối tượng sản phẩm hiện tại vào giỏ hàng

    // 4. Cập nhật UI: Hiển thị thông báo thành công
    setMessage(MESSAGES.SUCCESS_ADD_TO_CART);

    // --- Kích hoạt Animation "Bay tới giỏ hàng" (Thao tác DOM trực tiếp) ---
    // Lưu ý: Logic animation này thao tác trực tiếp với DOM bên ngoài chu trình render của React.
    // Cách tiếp cận này có thể khó quản lý hơn trong các ứng dụng phức tạp so với việc sử dụng các thư viện animation dựa trên state của React.

    // Tìm phần tử hình ảnh sản phẩm (tìm trong component cha gần nhất có class 'product-detail') một cách an toàn
    const productImage = event.target.closest('.product-detail')?.querySelector('.product-image');
    // Tìm phần tử nút giỏ hàng trên header (selector giả định cấu trúc header có class 'cart-button')
    const cartButton = document.querySelector('.header .cart-button');

    // Chỉ thực hiện animation nếu tìm thấy cả hình ảnh sản phẩm và nút giỏ hàng
    if (productImage && cartButton) {
        // Lấy vị trí và kích thước của hình ảnh sản phẩm và nút giỏ hàng
        const productImageRect = productImage.getBoundingClientRect();
        const cartButtonRect = cartButton.getBoundingClientRect();

        // Tạo một bản sao (clone) của hình ảnh sản phẩm để làm animation
        const flyingImg = productImage.cloneNode();
        flyingImg.classList.add('flying-to-cart'); // Thêm class để áp dụng CSS animation/transition
        // Đặt các style inline ban đầu cho hình ảnh bay
        Object.assign(flyingImg.style, {
            position: 'fixed', // Đặt vị trí cố định trên màn hình
            top: `${productImageRect.top}px`,
            left: `${productImageRect.left}px`,
            width: `${productImageRect.width}px`,
            height: `${productImageRect.height}px`,
            zIndex: 1000, // Đảm bảo nó hiển thị trên cùng
            // Định nghĩa transition cho các thuộc tính sẽ thay đổi
            transition: 'top 1s ease-in-out, left 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, opacity 0.8s ease-in',
            pointerEvents: 'none', // Ngăn chặn tương tác chuột với hình ảnh bay
        });

        // Thêm hình ảnh bay vào body của tài liệu
        document.body.appendChild(flyingImg);

        // Bắt đầu transition trong frame animation tiếp theo để đảm bảo DOM đã cập nhật
        requestAnimationFrame(() => {
             // Đặt các style cuối cùng để hình ảnh bay đến vị trí của nút giỏ hàng và thu nhỏ lại
             Object.assign(flyingImg.style, {
                 // Tính toán vị trí trung tâm của nút giỏ hàng và đặt hình ảnh bay đến đó
                 top: `${cartButtonRect.top + cartButtonRect.height / 2 - flyingImg.height / 2}px`,
                 left: `${cartButtonRect.left + cartButtonRect.width / 2 - flyingImg.width / 2}px`,
                 width: '30px', // Kích thước cuối cùng nhỏ hơn
                 height: '30px',
                 opacity: '0.5', // Làm mờ dần hình ảnh
             });
        });


        // Xóa hình ảnh bay khỏi DOM sau khi animation kết thúc
        flyingImg.addEventListener('transitionend', () => {
            flyingImg.remove(); // Xóa phần tử
             // Chuyển hướng đến trang giỏ hàng sau một khoảng trễ ngắn sau khi animation kết thúc
             setTimeout(() => {
                 setMessage(""); // Xóa thông báo
                 navigate("/cart"); // Chuyển hướng
             }, 200); // Khoảng trễ bổ sung
        });

    } else {
      // Fallback: nếu không tìm thấy phần tử cho animation, chỉ chuyển hướng sau một khoảng trễ
       console.warn("Không tìm thấy các phần tử cần thiết cho animation (hình ảnh sản phẩm hoặc nút giỏ hàng). Bỏ qua animation."); // Log cảnh báo
       setTimeout(() => {
           setMessage(""); // Xóa thông báo
           navigate("/cart"); // Chuyển hướng
       }, 1000); // Trễ 1 giây
    }

  }, [product, addToCart, isLoggedIn, navigate]); // Dependencies: product, addToCart, isLoggedIn, navigate

  // --- Render UI dựa trên trạng thái ---

  // Hiển thị spinner loading khi đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{MESSAGES.LOADING}</p>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có lỗi
  if (error) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">❌ {error}</p>
        {/* Nút quay lại trang chủ */}
        <div className="button-group">
          <Link to="/home" className="back-button" aria-label="Back to home">
            ⬅ Back
          </Link>
        </div>
      </div>
    );
  }

  // Nếu không loading, không lỗi, nhưng product là null (trường hợp ngoại lệ, nên được bắt bởi error state)
  // Thêm kiểm tra an toàn cuối cùng trước khi render chi tiết sản phẩm.
   if (!product) {
       // Trường hợp này lý tưởng là không bao giờ xảy ra nếu logic xử lý lỗi và tải dữ liệu đúng.
       // Nếu đến đây mà product vẫn null, có thể có lỗi logic ở đâu đó.
       // Trả về null hoặc một thông báo lỗi mặc định là an toàn nhất.
       console.error("Lỗi logic: Product state là null sau khi loading hoàn thành mà không có lỗi.");
       return <div className="product-detail error-state"><p className="error-message">An unexpected error occurred.</p></div>;
   }


  // --- Render UI chi tiết sản phẩm ---
  return (
    <div className="product-detail">
      {/* Phần nội dung chính của sản phẩm */}
      <section className="product-content">
        <h2>{product.name || 'Product Details'}</h2> {/* Hiển thị tên sản phẩm an toàn */}
        {/* Hình ảnh sản phẩm */}
        <img
          src={product.image || ''} // Hiển thị hình ảnh an toàn (dùng chuỗi rỗng nếu thiếu)
          alt={product.name || 'Product'} // Alt text an toàn
          className="product-image"
          loading="lazy" // Lazy load hình ảnh
        />
        {/* Phần giá */}
        <div className="price-section">
          {/* Hiển thị giá an toàn và định dạng */}
          <p className="price">
            💰 {(product.price || 0).toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
        <p className="description">{product.description || 'No description available.'}</p> {/* Hiển thị mô tả an toàn */}
        {/* Phần thông số kỹ thuật */}
        <div className="specs">
          <h3>⚙️ Specifications</h3>
          <ul>
            {/* Hiển thị thông số kỹ thuật an toàn sử dụng optional chaining và giá trị mặc định */}
            <li>📱 Screen: {product?.screen || "N/A"}</li>
            <li>⚡ Chip: {product?.chip || "N/A"}</li>
            <li>💾 RAM: {product?.ram || "N/A"}</li>
            <li>💽 Storage: {product?.storage || "N/A"}</li>
            <li>📷 Camera: {product?.camera || "N/A"}</li>
            <li>🔋 Battery: {product?.battery || "N/A"}</li>
             {/* Thông báo nếu không có thông số nào được hiển thị */}
             {!(product?.screen || product?.chip || product?.ram || product?.storage || product?.camera || product?.battery) && (
                 <p className="empty-state-small">No specifications available.</p>
             )}
          </ul>
        </div>
        {/* Hiển thị thông báo thành công/thông tin */}
        {message && (
          // Áp dụng class CSS dựa trên nội dung thông báo (thành công, cảnh báo, lỗi)
          <p className={`status-message ${message.includes("successfully") ? "success" : message.includes("login") ? "warning" : "info"}`}>
            {message}
          </p>
        )}
      </section>
      {/* Nhóm các nút hành động */}
      <div className="button-group">
        {/* Nút "Thêm vào giỏ hàng" */}
        <button
          className="add-to-cart"
          onClick={handleAddToCart} // Gắn handler
          // Disable nút nếu không có sản phẩm, đang loading, hoặc có lỗi
          disabled={!product || isLoading || error}
          aria-label={`Add ${product?.name || 'this product'} to cart`}
        >
          🛒 Add to Cart
        </button>
        {/* Nút "Quay lại" */}
        <Link to="/home" className="back-button" aria-label="Back to home">
          ⬅ Back
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Export component
