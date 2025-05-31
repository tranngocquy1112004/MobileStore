import React, { useEffect, useState, useContext, useCallback } from "react"; // Import các hook cần thiết từ React
import { Link, useParams, useNavigate } from "react-router-dom"; // Import các component và hook định tuyến từ react-router-dom
import { CartContext } from "../pages/CartContext"; // Import context giỏ hàng để sử dụng trong component
import { AuthContext } from "../account/AuthContext"; // Import context xác thực người dùng
import "./ProductDetail.css"; // Import file CSS dành cho component ProductDetail

// Khai báo các hằng số sử dụng trong component
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu sản phẩm từ file db.json trong thư mục public
const LOCAL_STORAGE_PRODUCTS_KEY = "products"; // Khóa lưu trữ sản phẩm trong localStorage
const MESSAGES = {  
  LOADING: "Loading product details...",         // Thông báo khi đang tải chi tiết sản phẩm
  ERROR_FETCH: "Failed to load product data!",     // Thông báo lỗi khi không tải được dữ liệu sản phẩm
  ERROR_NOT_FOUND: "Product not found!",            // Thông báo lỗi khi không tìm thấy sản phẩm
  SUCCESS_ADD_TO_CART: "Added to cart successfully!", // Thông báo thành công khi thêm sản phẩm vào giỏ hàng
  LOGIN_REQUIRED: "Please login to add items to cart!", // Thông báo yêu cầu đăng nhập để thêm sản phẩm vào giỏ hàng
};

// Hàm bất đồng bộ lấy dữ liệu sản phẩm từ API
const fetchProductsFromApi = async (signal) => {
  // Gửi request fetch đến API với hỗ trợ signal để có thể hủy nếu cần
  const response = await fetch(API_URL, { signal });
  if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH); // Nếu không thành công, ném lỗi với thông báo tương ứng
  const data = await response.json(); // Chuyển đổi dữ liệu nhận về sang định dạng JSON
  // Nếu data là mảng, trả về data, nếu không thử lấy thuộc tính products hoặc trả về mảng rỗng
  return Array.isArray(data) ? data : data.products || [];
};

// Hàm lấy dữ liệu sản phẩm từ localStorage
const loadProductsFromStorage = () => {
  try {
    const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY); // Lấy chuỗi dữ liệu từ localStorage
    return cachedProducts ? JSON.parse(cachedProducts) : []; // Nếu có dữ liệu, chuyển đổi từ JSON sang mảng; nếu không, trả về mảng rỗng
  } catch (error) {
    console.error("Error parsing cached product data:", error); // In ra lỗi nếu không parse được dữ liệu
    return [];
  }
};

// Hàm lưu dữ liệu sản phẩm vào localStorage
const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products)); // Chuyển mảng product sang chuỗi JSON và lưu vào localStorage
  } catch (error) {
    console.error("Error saving product data to localStorage:", error); // In ra lỗi nếu không thể lưu
  }
};

// Hàm tạo hiệu ứng bay chuyển hình ảnh sản phẩm đến nút giỏ hàng
const createFlyingImageAnimation = (productImage, cartButton) => {
  // Lấy kích thước và tọa độ hiện tại của hình ảnh sản phẩm
  const productImageRect = productImage.getBoundingClientRect();
  // Lấy kích thước và tọa độ hiện tại của nút giỏ hàng
  const cartButtonRect = cartButton.getBoundingClientRect();

  const flyingImg = productImage.cloneNode(); // Tạo bản sao của hình ảnh
  flyingImg.classList.add('flying-to-cart'); // Thêm class CSS để áp dụng hiệu ứng

  // Cài đặt các thuộc tính CSS ban đầu cho flyingImg
  Object.assign(flyingImg.style, {
    position: 'fixed',
    top: `${productImageRect.top}px`,
    left: `${productImageRect.left}px`,
    width: `${productImageRect.width}px`,
    height: `${productImageRect.height}px`,
    zIndex: 1000,
    transition: 'all 1s ease-in-out, opacity 0.8s ease-in',
    pointerEvents: 'none',
  });

  document.body.appendChild(flyingImg); // Thêm flyingImg vào DOM

  // Khởi động quá trình chuyển động của hình ảnh
  requestAnimationFrame(() => {
    Object.assign(flyingImg.style, {
      top: `${cartButtonRect.top + cartButtonRect.height / 2 - 15}px`,
      left: `${cartButtonRect.left + cartButtonRect.width / 2 - 15}px`,
      width: '30px',
      height: '30px',
      opacity: '0.5',
    });
  });

  return flyingImg; // Trả về phần tử hình ảnh để có thể lắng nghe sự kiện kết thúc chuyển động
};

// Component chính hiển thị chi tiết sản phẩm
const ProductDetail = () => {
  const { id } = useParams(); // Lấy tham số "id" từ URL
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng trang
  const { addToCart } = useContext(CartContext); // Lấy hàm thêm sản phẩm vào giỏ hàng từ CartContext
  const { isLoggedIn = false } = useContext(AuthContext) || {}; // Lấy trạng thái đăng nhập từ AuthContext (mặc định false nếu không có)

  // Khai báo các state để quản lý dữ liệu và thông báo
  const [product, setProduct] = useState(null); // State lưu trữ thông tin sản phẩm
  const [isLoading, setIsLoading] = useState(true); // State theo dõi trạng thái tải dữ liệu
  const [error, setError] = useState(null); // State lưu trữ thông báo lỗi
  const [message, setMessage] = useState(""); // State lưu trữ thông báo cho người dùng (ví dụ: thành công, yêu cầu đăng nhập)

  // Sử dụng useEffect để tải dữ liệu sản phẩm khi component mount hoặc khi "id" thay đổi
  useEffect(() => {
    const controller = new AbortController(); // Tạo abort controller để hủy request nếu component unmount

    const loadProduct = async () => {
      try {
        setIsLoading(true); // Bắt đầu trạng thái loading
        setError(null);     // Xoá lỗi cũ
        setProduct(null);   // Xoá sản phẩm cũ
        setMessage("");     // Xoá thông báo cũ

        let products = loadProductsFromStorage(); // Lấy dữ liệu sản phẩm từ localStorage
        // Nếu localStorage không có dữ liệu, fetch dữ liệu từ API
        if (!products.length) {
          products = await fetchProductsFromApi(controller.signal);
          saveProductsToStorage(products); // Lưu sản phẩm đã fetch vào localStorage
        }

        const productId = Number(id); // Chuyển "id" từ chuỗi sang số
        const foundProduct = products.find(p => p.id === productId); // Tìm sản phẩm trùng với id

        if (!foundProduct) {
          // Nếu không tìm thấy sản phẩm, ném lỗi với thông báo
          throw new Error(MESSAGES.ERROR_NOT_FOUND);
        }

        setProduct(foundProduct); // Cập nhật state sản phẩm với thông tin tìm được
      } catch (err) {
        if (err.name !== "AbortError") {
          // Nếu lỗi không phải do hủy request, cập nhật state lỗi
          setError(err.message || MESSAGES.ERROR_FETCH);
        }
      } finally {
        setIsLoading(false); // Kết thúc trạng thái loading
      }
    };

    loadProduct(); // Gọi hàm loadProduct để lấy dữ liệu
    return () => controller.abort(); // Cleanup: hủy request khi component unmount
  }, [id]); // useEffect chạy lại khi tham số "id" thay đổi

  // Hàm xử lý khi người dùng nhấn nút "Add to Cart"
  const handleAddToCart = useCallback((event) => {
    // Nếu người dùng chưa đăng nhập, hiển thị thông báo và chuyển hướng về trang chủ
    if (!isLoggedIn) {
      setMessage(MESSAGES.LOGIN_REQUIRED);
      setTimeout(() => navigate("/"), 1500);
      return;
    }

    // Kiểm tra dữ liệu sản phẩm hợp lệ trước khi thêm vào giỏ hàng
    if (!product?.id) {
      console.warn("Invalid product data for cart");
      return;
    }

    addToCart(product); // Thêm sản phẩm vào giỏ hàng
    setMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Cập nhật thông báo thành công

    // Tìm hình ảnh của sản phẩm và nút giỏ hàng trên giao diện để tạo hiệu ứng di chuyển
    const productImage = event.target.closest('.product-detail')?.querySelector('.product-image');
    const cartButton = document.querySelector('.header .cart-button');

    if (productImage && cartButton) {
      // Nếu tìm thấy hai phần tử cần thiết, tạo hiệu ứng bay chuyển hình ảnh
      const flyingImg = createFlyingImageAnimation(productImage, cartButton);
      
      // Lắng nghe sự kiện kết thúc của hiệu ứng chuyển động
      flyingImg.addEventListener('transitionend', () => {
        flyingImg.remove(); // Khi hiệu ứng kết thúc, xoá hình ảnh bay
        setTimeout(() => navigate("/cart"), 200); // Điều hướng đến trang giỏ hàng
      });
    } else {
      // Nếu không thể tạo hiệu ứng, điều hướng đến trang giỏ hàng sau 1 giây
      setTimeout(() => navigate("/cart"), 1000);
    }
  }, [product, addToCart, isLoggedIn, navigate]); // useCallback phụ thuộc vào các biến product, addToCart, isLoggedIn và navigate

  // Nếu đang trong trạng thái tải dữ liệu, hiển thị giao diện loading
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container trạng thái loading */}
        <div className="loading-spinner"></div> {/* Spinner hiển thị loading */}
        <p className="loading-text">{MESSAGES.LOADING}</p> {/* Thông báo loading */}
      </div>
    );
  }

  // Nếu có lỗi xảy ra, hiển thị giao diện lỗi
  if (error) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">❌ {error}</p> {/* Thông báo lỗi */}
        <div className="button-group">
          <Link to="/home" className="back-button">
            ⬅ Back {/* Nút trở về trang chủ */}
          </Link>
        </div>
      </div>
    );
  }

  // Nếu không có sản phẩm nào được tìm thấy (tình huống không mong đợi), hiển thị thông báo lỗi chung
  if (!product) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">An unexpected error occurred.</p>
      </div>
    );
  }

  // Giao diện chi tiết sản phẩm khi dữ liệu đã có sẵn
  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name || 'Product Details'}</h2> {/* Hiển thị tên sản phẩm hoặc default */}
        <img
          src={product.image}             // Đường dẫn hình ảnh sản phẩm
          alt={product.name || 'Product'} // Văn bản thay thế nếu hình ảnh không tải được
          className="product-image"       // Class CSS cho hình ảnh sản phẩm
          loading="lazy"                  // Tải hình ảnh theo kiểu lazy loading
        />
        
        <div className="price-section">
          <p className="price">
            💰 {product.price?.toLocaleString("vi-VN") || '0'} VNĐ {/* Định dạng giá sản phẩm theo tiền tệ Việt Nam */}
          </p>
        </div>
        
        <p className="description">
          {product.description || 'No description available.'} {/* Hiển thị mô tả sản phẩm hoặc thông báo nếu không có */}
        </p>
        
        <div className="specs">
          <h3>⚙️ Specifications</h3> {/* Tiêu đề phần thông số kỹ thuật */}
          <ul>
            {product.screen && <li>📱 Screen: {product.screen}</li>}     {/* Hiển thị kích thước màn hình nếu có */}
            {product.chip && <li>⚡ Chip: {product.chip}</li>}             {/* Hiển thị chip xử lý nếu có */}
            {product.ram && <li>💾 RAM: {product.ram}</li>}                {/* Hiển thị dung lượng RAM nếu có */}
            {product.storage && <li>💽 Storage: {product.storage}</li>}      {/* Hiển thị dung lượng lưu trữ nếu có */}
            {product.camera && <li>📷 Camera: {product.camera}</li>}         {/* Hiển thị thông số camera nếu có */}
            {product.battery && <li>🔋 Battery: {product.battery}</li>}      {/* Hiển thị thông số pin nếu có */}
            
            {/*
              Nếu không có bất kỳ thông số nào được cung cấp,
              hiển thị thông báo "No specifications available."
            */}
            {!product.screen && !product.chip && !product.ram && 
             !product.storage && !product.camera && !product.battery && (
              <p className="empty-state-small">No specifications available.</p>
            )}
          </ul>
        </div>
        
        {message && (
          // Hiển thị thông báo trạng thái (thành công hay cảnh báo) dựa vào nội dung message
          <p className={`status-message ${message === MESSAGES.SUCCESS_ADD_TO_CART ? "success" : "warning"}`}>
            {message}
          </p>
        )}
      </section>
      
      <div className="button-group">
        <button
          className="add-to-cart"       /* Nút thêm sản phẩm vào giỏ hàng */
          onClick={handleAddToCart}      /* Gắn hàm xử lý sự kiện khi nhấn nút */
          disabled={!product || isLoading || error} // Vô hiệu hóa nếu sản phẩm không tồn tại, đang tải hoặc có lỗi
        >
          🛒 Add to Cart
        </button>
        <Link to="/home" className="back-button">
          ⬅ Back {/* Nút quay về trang chủ */}
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Xuất component ProductDetail để sử dụng ở nơi khác