import React, { useEffect, useState, useContext, useCallback } from "react"; // Import các hook cần thiết từ React: useEffect để thực hiện side effect, useState để quản lý state, useContext để truy cập Context, useCallback để memoize hàm
import { Link, useParams, useNavigate } from "react-router-dom"; // Import Link để điều hướng, useParams để lấy tham số từ URL, useNavigate để điều hướng bằng code
import { CartContext } from "../pages/CartContext"; // Import CartContext để truy cập hàm thêm vào giỏ hàng (addToCart)
import { AuthContext } from "../account/AuthContext"; // Import AuthContext để kiểm tra trạng thái đăng nhập (isLoggedIn)
import "./ProductDetail.css"; // Import file CSS để định dạng giao diện chi tiết sản phẩm

// --- Định nghĩa các hằng số ---

// Đường dẫn tới file JSON chứa dữ liệu sản phẩm (hoặc API endpoint thực tế)
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Object chứa các thông báo trạng thái và lỗi sẽ hiển thị cho người dùng
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải dữ liệu
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!", // Thông báo lỗi khi fetch dữ liệu thất bại
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Thông báo khi không tìm thấy sản phẩm với ID tương ứng
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Thông báo khi thêm sản phẩm vào giỏ thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo yêu cầu đăng nhập trước khi thêm vào giỏ
};
// Định nghĩa key dùng cho localStorage để lưu trữ danh sách sản phẩm
const LOCAL_STORAGE_PRODUCTS_KEY = "products";


// --- Component chính: ProductDetail (Hiển thị chi tiết một sản phẩm cụ thể) ---
const ProductDetail = () => {
  // Lấy giá trị của tham số 'id' từ URL. Ví dụ: URL /products/123 thì id = "123" (string).
  const { id } = useParams();
  // Sử dụng hook useNavigate để có thể điều hướng người dùng đến các route khác sau khi thực hiện hành động.
  const navigate = useNavigate();
  // Sử dụng useContext để truy cập CartContext và lấy hàm 'addToCart' để thêm sản phẩm vào giỏ.
  const { addToCart } = useContext(CartContext);
  // Sử dụng useContext để truy cập AuthContext và lấy trạng thái 'isLoggedIn'.
  // Cung cấp giá trị mặc định ({}) và destructure với giá trị mặc định false cho isLoggedIn
  // để đảm bảo code không lỗi ngay cả khi AuthContext hoặc isLoggedIn chưa có/được cung cấp.
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  // --- State quản lý dữ liệu và trạng thái của component ---
  const [product, setProduct] = useState(null); // State lưu thông tin chi tiết sản phẩm tìm được (ban đầu là null)
  const [isLoading, setIsLoading] = useState(true); // State boolean theo dõi trạng thái đang tải dữ liệu (ban đầu là true)
  const [error, setError] = useState(null); // State lưu thông báo lỗi nếu quá trình tải hoặc tìm sản phẩm gặp vấn đề (ban đầu là null)
  // State lưu thông báo thành công (ví dụ: thêm vào giỏ thành công) hoặc thông báo yêu cầu đăng nhập
  const [successMessage, setSuccessMessage] = useState("");

  // --- Effect hook để fetch dữ liệu sản phẩm khi component mount hoặc id trên URL thay đổi ---
  useEffect(() => {
    // Tạo một AbortController. Signal của nó sẽ được dùng để hủy yêu cầu fetch
    // nếu effect chạy lại hoặc component unmount trước khi fetch hoàn thành.
    const controller = new AbortController();
    const signal = controller.signal; // Lấy signal để truyền vào fetch options.

    // Hàm async để thực hiện việc fetch và xử lý dữ liệu sản phẩm
    const fetchProduct = async () => {
      try {
        setIsLoading(true); // Bắt đầu quá trình tải, đặt state isLoading về true
        setError(null); // Xóa bất kỳ thông báo lỗi nào từ lần fetch/tìm kiếm trước

        let productList; // Biến tạm để lưu danh sách sản phẩm

        // --- Cải thiện hiệu suất: Kiểm tra localStorage trước khi fetch từ API ---
        const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY); // Thử lấy dữ liệu sản phẩm từ localStorage

        if (cachedProducts) {
          // Nếu tìm thấy dữ liệu trong localStorage
          try {
             productList = JSON.parse(cachedProducts); // Parse chuỗi JSON thành mảng/đối tượng JavaScript
             console.log("Sử dụng dữ liệu sản phẩm từ localStorage"); // Ghi log để theo dõi nguồn dữ liệu
          } catch (parseError) {
             // Xử lý lỗi nếu dữ liệu trong localStorage bị hỏng
             console.error("Lỗi khi parse dữ liệu sản phẩm từ localStorage:", parseError);
             localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY); // Xóa dữ liệu lỗi
             productList = []; // Đặt productList rỗng để buộc fetch lại từ API
             console.log("Xóa dữ liệu lỗi trong localStorage, sẽ fetch lại.");
          }

        }

        // Nếu productList rỗng (do cache trống hoặc bị lỗi và xóa) HOẶC không phải mảng, thì mới fetch từ API
        if (!Array.isArray(productList) || productList.length === 0) {
           console.log("Fetch dữ liệu sản phẩm từ API (cache trống hoặc lỗi)"); // Ghi log để theo dõi
           const response = await fetch(API_URL, { signal }); // Gửi yêu cầu fetch đến API_URL với signal

           // Kiểm tra nếu response không thành công (ví dụ: lỗi mạng, 404 server side)
           if (!response.ok) {
             throw new Error(MESSAGES.ERROR_FETCH); // Ném lỗi với thông báo lỗi fetch
           }

           const data = await response.json(); // Chuyển đổi dữ liệu nhận được sang JSON
           // Lấy danh sách sản phẩm từ dữ liệu JSON (kiểm tra cấu trúc như trong ProductPage)
           productList = Array.isArray(data) ? data : data.products || [];
           // Lưu dữ liệu sản phẩm vừa fetch vào localStorage để dùng cho các lần sau
           localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
        }


        // --- Tìm sản phẩm trong danh sách đã có (từ cache hoặc API) theo ID ---
        // ID lấy từ useParams là chuỗi (string). id trong JSON là số (number).
        // Sử dụng Number(id) để chuyển đổi chuỗi ID từ URL sang số để so sánh chính xác bằng strict equality (===).
        const foundProduct = productList.find((p) => p.id === Number(id));

        // Nếu không tìm thấy sản phẩm nào với ID tương ứng trong danh sách productList
        if (!foundProduct) {
          setError(MESSAGES.ERROR_NOT_FOUND); // Đặt thông báo lỗi sản phẩm không tồn tại
          setProduct(null); // Đảm bảo state product là null
          return; // Dừng hàm fetchProduct
        }

        setProduct(foundProduct); // Cập nhật state 'product' với thông tin sản phẩm tìm được
        // Không cần xóa successMessage ở đây vì nó liên quan đến hành động "thêm vào giỏ"
      } catch (err) {
        // Bắt các lỗi xảy ra trong khối try (ví dụ: lỗi fetch, lỗi parse JSON)
        // Kiểm tra nếu lỗi KHÔNG phải là AbortError (lỗi do cleanup gọi controller.abort())
        if (err.name !== "AbortError") {
          console.error("Error in fetchProduct:", err); // Ghi log lỗi thật
          setError(err.message); // Cập nhật state 'error' với thông báo lỗi
          setProduct(null); // Đảm bảo product là null khi có lỗi
        }
        // Nếu là AbortError, không làm gì cả vì đó là hành vi mong muốn khi unmount
      } finally {
        // Khối finally luôn chạy sau try/catch, bất kể có lỗi hay không
        setIsLoading(false); // Kết thúc quá trình tải, đặt state isLoading về false
      }
    };

    fetchProduct(); // Gọi hàm fetchProduct khi effect chạy (component mount hoặc id thay đổi)

    // Cleanup function: Hàm này chạy khi component unmount hoặc khi dependencies ([id]) thay đổi
    // Hủy yêu cầu fetch đang chờ xử lý nếu nó vẫn chạy, tránh memory leaks và cập nhật state trên component đã unmount.
    return () => controller.abort();
  }, [id]); // Dependency array: Effect sẽ chạy lại mỗi khi giá trị của 'id' thay đổi trên URL.

  // --- Hàm xử lý khi người dùng nhấn nút "Thêm vào giỏ" ---
  // Sử dụng useCallback để memoize hàm. Hàm này chỉ được tạo lại khi các dependencies thay đổi.
  const handleAddToCart = useCallback(() => {
    // 1. Kiểm tra trạng thái đăng nhập của người dùng
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập
      // Sử dụng setTimeout để người dùng kịp đọc thông báo trước khi chuyển hướng
      setTimeout(() => {
        setSuccessMessage(""); // Xóa thông báo trước khi chuyển hướng
        navigate("/login"); // Chuyển hướng người dùng đến trang đăng nhập
      }, 1000); // Chờ 1 giây
      return; // Dừng hàm, không thực hiện tiếp
    }

    // 2. Kiểm tra xem dữ liệu sản phẩm đã được tải và tìm thấy chưa
    if (!product) {
      console.warn("Không có dữ liệu sản phẩm để thêm vào giỏ.");
      return; // Dừng hàm nếu không có dữ liệu sản phẩm (ví dụ: trang đang loading hoặc có lỗi)
    }

    // 3. Thêm sản phẩm vào giỏ hàng bằng hàm từ CartContext
    addToCart(product); // Gọi hàm addToCart, truyền đối tượng product hiện tại

    // 4. Hiển thị thông báo thành công và chuyển hướng người dùng
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Đặt thông báo thêm vào giỏ thành công
    // Sử dụng setTimeout để người dùng kịp thấy thông báo trước khi chuyển sang trang giỏ hàng
    setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo sau khi hết thời gian
      navigate("/cart"); // Chuyển hướng người dùng đến trang giỏ hàng
    }, 1000); // Chờ 1 giây

  }, [product, addToCart, isLoggedIn, navigate]); // Dependency array: hàm này phụ thuộc vào state 'product', hàm 'addToCart', state 'isLoggedIn', và hook 'navigate'.

  // --- Render giao diện dựa trên trạng thái loading và lỗi ---

  // Nếu đang trong trạng thái tải dữ liệu ban đầu (isLoading là true)
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container hiển thị trạng thái loading */}
        <div className="loading-spinner"></div> {/* Biểu tượng spinner quay */}
        <p className="loading-text">{MESSAGES.LOADING}</p> {/* Thông báo "Đang tải..." */}
      </div>
    );
  }

  // Nếu có lỗi trong quá trình tải hoặc tìm sản phẩm (error khác null)
  if (error) {
    return (
      <div className="product-detail error-state"> {/* Container hiển thị lỗi */}
        <p className="error-message">❌ {error}</p> {/* Hiển thị nội dung lỗi */}
        {/* Nút "Quay lại trang chủ" khi có lỗi */}
        <div className="button-group">
          <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
             ⬅ Quay lại
          </Link>
        </div>
      </div>
    );
  }

  // Nếu không loading, không có lỗi, nhưng product vẫn là null (trường hợp này hiếm xảy ra nếu logic đúng)
  // Đã xử lý lỗi và setProduct(null) trong khối catch/not found, nên kiểm tra này có thể dư thừa nếu logic kia đảm bảo.
  // Tuy nhiên, giữ lại cũng không hại.
  if (!product) {
     // Nếu product là null sau khi isLoading=false và không có lỗi, có thể là do logic tìm kiếm bị sai hoặc dữ liệu rỗng.
     // Trong trường hợp này, thông báo lỗi "Sản phẩm không tồn tại!" đã được hiển thị ở khối if (error) trên.
     return null; // Không render gì thêm nếu product là null
  }


  // --- Render giao diện chi tiết sản phẩm khi dữ liệu đã tải xong và sản phẩm được tìm thấy ---
  return (
    <div className="product-detail"> {/* Container chính của trang chi tiết sản phẩm */}
      {/* Phần nội dung chính của sản phẩm (thông tin, hình ảnh, specs) */}
      <section className="product-content">
        <h2>{product.name}</h2> {/* Hiển thị tên sản phẩm */}
        {/* Hình ảnh sản phẩm */}
        <img
          src={product.image}
          alt={product.name} // Alt text cho ảnh
          className="product-image"
          loading="lazy" // Lazy loading cho ảnh để cải thiện hiệu suất
        />
        {/* Phần hiển thị giá sản phẩm */}
        <div className="price-section">
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ{" "}
            {/* Giá sản phẩm, định dạng tiền tệ VNĐ */}
          </p>
        </div>
        <p className="description">{product.description}</p> {/* Hiển thị mô tả sản phẩm */}

        {/* Phần hiển thị thông số kỹ thuật */}
        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3> {/* Tiêu đề phần thông số kỹ thuật */}
          <ul>
            {/* Hiển thị từng thông số kỹ thuật. Sử dụng || "Không có thông tin"
                để cung cấp giá trị mặc định nếu thuộc tính không tồn tại hoặc rỗng trong dữ liệu. */}
            <li>📱 Màn hình: {product.screen || "Không có thông tin"}</li>
            <li>⚡ Chip: {product.chip || "Không có thông tin"}</li>
            <li>💾 RAM: {product.ram || "Không có thông tin"}</li>
            <li>💽 Bộ nhớ: {product.storage || "Không có thông tin"}</li>
            <li>📷 Camera: {product.camera || "Không có thông tin"}</li>
            <li>🔋 Pin: {product.battery || "Không có thông tin"}</li>
          </ul>
        </div>

        {/* Hiển thị thông báo thành công (thêm vào giỏ) hoặc yêu cầu đăng nhập nếu có */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>

      {/* --- Nhóm các nút hành động (Thêm vào giỏ, Quay lại) --- */}
      <div className="button-group">
        {/* Nút "Thêm vào giỏ hàng" */}
        <button
          className="add-to-cart"
          onClick={handleAddToCart} // Gắn hàm xử lý khi click (đã memoize)
          disabled={!product} // Vô hiệu hóa nút nếu dữ liệu sản phẩm chưa có (!product là true)
          aria-label={`Thêm ${product?.name || 'sản phẩm này'} vào giỏ hàng`} // Aria label cho khả năng tiếp cận
        >
          🛒 Thêm vào giỏ
        </button>
        {/* Nút "Quay lại" để điều hướng về trang chủ hoặc trang danh sách sản phẩm */}
        <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
          ⬅ Quay lại
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Export component ProductDetail để có thể sử dụng ở nơi khác (trong phần routing)