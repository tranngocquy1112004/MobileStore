import React, { useContext, useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ React: useContext, useState, useEffect, và useCallback để memoize hàm
import { Link, useNavigate } from "react-router-dom"; // Import Link để tạo liên kết điều hướng và useNavigate để điều hướng bằng code
import { CartContext } from "./CartContext"; // Import CartContext để truy cập dữ liệu và các hàm quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Import AuthContext để kiểm tra trạng thái đăng nhập của người dùng
import CheckoutModal from "../components/CheckoutModal"; // Import component Modal để hiển thị form thanh toán
import "./CartPage.css"; // Import file CSS tùy chỉnh cho component CartPage

// --- Định nghĩa hằng số ---

// Object chứa các thông báo sẽ hiển thị cho người dùng
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống", // Thông báo khi giỏ hàng không có sản phẩm
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Thông báo khi đặt hàng thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi cần đăng nhập để thanh toán
};

// Định nghĩa key dùng cho localStorage để lưu trữ đơn hàng (nên nhất quán với OrderHistory)
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- Component con: CartItem (Hiển thị thông tin một sản phẩm trong giỏ hàng) ---
// Sử dụng React.memo để tối ưu hóa hiệu suất
const CartItem = React.memo(({ item, onIncrease, onDecrease, onRemove }) => {
  // Xác định xem nút giảm số lượng có nên bị vô hiệu hóa hay không (khi số lượng sản phẩm là 1)
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item"> {/* Container chính cho một sản phẩm trong giỏ */}
      {/* Hình ảnh sản phẩm */}
      <img
        src={item.image}
        alt={item.name} // Alt text cho ảnh
        className="cart-image"
        loading="lazy" // Sử dụng lazy loading cho ảnh để cải thiện hiệu suất tải trang
      />
      {/* Phần chi tiết thông tin sản phẩm (tên, giá, điều khiển số lượng) */}
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Tên sản phẩm */}
        <p className="cart-price">
          💰 {item.price.toLocaleString("vi-VN")} VNĐ{" "}
          {/* Giá sản phẩm, định dạng theo tiền tệ Việt Nam */}
        </p>
        {/* Điều khiển tăng/giảm số lượng sản phẩm */}
        <div className="quantity-controls">
          {/* Nút giảm số lượng */}
          <button
            onClick={() => onDecrease(item.id)} // Gọi hàm onDecrease (từ props) với ID sản phẩm
            disabled={isDecreaseDisabled} // Vô hiệu hóa nút nếu isDecreaseDisabled là true
            className={isDecreaseDisabled ? "disabled" : ""} // Thêm class 'disabled' để styling khi bị vô hiệu hóa
            aria-label={`Giảm số lượng ${item.name}`} // Aria label cho khả năng tiếp cận
          >
            -
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng hiện tại */}
          {/* Nút tăng số lượng */}
          <button
            onClick={() => onIncrease(item.id)} // Gọi hàm onIncrease (từ props) với ID sản phẩm
            aria-label={`Tăng số lượng ${item.name}`} // Aria label cho khả năng tiếp cận
          >
            +
          </button>
        </div>
      </div>
      {/* Nút xóa sản phẩm khỏi giỏ hàng */}
      <button
        className="remove-button"
        onClick={() => onRemove(item.id)} // Gọi hàm onRemove (từ props) với ID sản phẩm
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`} // Aria label cho khả năng tiếp cận
      >
        Xóa
      </button>
    </li>
  );
}); // Kết thúc React.memo cho CartItem

// --- Component con: CartSummary (Hiển thị tóm tắt giỏ hàng và nút thanh toán) ---
// Sử dụng React.memo để tối ưu hóa hiệu suất
const CartSummary = React.memo(({ totalPrice, onCheckout }) => (
  <div className="cart-summary"> {/* Container cho phần tóm tắt */}
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ{" "}
      {/* Hiển thị tổng tiền của giỏ hàng, định dạng tiền tệ */}
    </h3>
    {/* Nút "Mua hàng" để bắt đầu quá trình thanh toán */}
    <button className="checkout-button" onClick={onCheckout}>
      🛍 Mua hàng
    </button>
  </div>
)); // Kết thúc React.memo cho CartSummary

// --- Component con: EmptyCart (Hiển thị thông báo khi giỏ hàng rỗng) ---
// Sử dụng React.memo để tối ưu hóa hiệu suất
const EmptyCart = React.memo(() => (
  <div className="empty-cart-message-container"> {/* Container cho thông báo giỏ hàng trống */}
    {/* Có thể thêm icon hoặc hình ảnh minh họa giỏ hàng trống */}
    <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>{" "}
    {/* Hiển thị thông báo "Giỏ hàng trống" */}
    {/* Nút hoặc liên kết mời người dùng quay lại trang mua sắm */}
    <Link to="/products" className="shop-now-link">
      🛒 Tiếp tục mua sắm
    </Link>
  </div>
)); // Kết thúc React.memo cho EmptyCart


// --- Component chính: CartPage (Trang hiển thị giỏ hàng) ---
const CartPage = () => {
  const navigate = useNavigate(); // Sử dụng hook useNavigate để điều hướng giữa các route
  // Sử dụng useContext để truy cập state 'cart' và các hàm quản lý giỏ hàng từ CartContext
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);
  // Sử dụng useContext để truy cập trạng thái đăng nhập 'isLoggedIn' từ AuthContext.
  // Cung cấp giá trị mặc định { isLoggedIn: false } để tránh lỗi nếu context chưa được cung cấp.
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };

  // --- State quản lý trạng thái của Component CartPage ---
  const [showModal, setShowModal] = useState(false); // State boolean kiểm soát việc hiển thị modal thanh toán
  // State boolean quản lý trạng thái loading (ví dụ: giả lập thời gian tải dữ liệu giỏ hàng ban đầu)
  const [isLoading, setIsLoading] = useState(true);

  // --- Effect hook để giả lập thời gian tải dữ liệu khi component mount ---
  // Effect này chạy một lần duy nhất sau lần render đầu tiên.
  useEffect(() => {
    // Tạo một setTimeout để đặt isLoading về false sau 1000ms (1 giây), giả lập thời gian tải.
    // Trong ứng dụng thực tế, bạn sẽ fetch dữ liệu giỏ hàng từ API ở đây và set isLoading sau khi fetch xong.
    const timer = setTimeout(() => setIsLoading(false), 1000);
    // Cleanup function: Hủy bỏ timeout nếu component unmount trước khi timeout kịp chạy.
    return () => clearTimeout(timer);
  }, []); // Mảng dependencies rỗng []: effect chỉ chạy MỘT LẦN duy nhất.

  // --- Tính toán các giá trị dẫn xuất từ state 'cart' ---
  // Tính tổng giá trị của tất cả sản phẩm trong giỏ hàng
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, // Hàm callback: cộng dồn giá * số lượng
    0 // Giá trị khởi tạo ban đầu cho 'sum'
  );
  // Tính tổng số lượng các mặt hàng (tổng quantity của tất cả sản phẩm) trong giỏ hàng
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity, // Hàm callback: cộng dồn số lượng
    0 // Giá trị khởi tạo ban đầu cho 'sum'
  );

  // --- Hàm xử lý khi người dùng nhấn nút "Mua hàng" ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi các dependencies thay đổi.
  const handleCheckout = useCallback(() => {
    // 1. Kiểm tra trạng thái đăng nhập của người dùng
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập
      navigate("/"); // Chuyển hướng người dùng đến trang đăng nhập (hoặc trang chủ tùy cấu hình route)
      return; // Dừng hàm, không thực hiện tiếp
    }
    // 2. Nếu đã đăng nhập, hiển thị modal thanh toán
    setShowModal(true);
  }, [isLoggedIn, navigate]); // Dependency array: hàm phụ thuộc vào isLoggedIn và navigate

  // --- Hàm xử lý khi người dùng xác nhận thanh toán trong modal ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi các dependencies thay đổi.
  const handleConfirmCheckout = useCallback((shippingInfo) => {
    // 1. Tạo một đối tượng đơn hàng mới
    const order = {
      id: Date.now(), // Tạo một ID đơn hàng duy nhất dựa trên timestamp hiện tại
      items: cart, // Danh sách các sản phẩm trong giỏ hàng tại thời điểm đặt
      totalPrice, // Tổng giá trị của đơn hàng
      shippingInfo, // Thông tin giao hàng do người dùng nhập từ modal
      date: new Date().toISOString(), // Lưu lại thời gian đặt hàng dưới dạng chuỗi ISO 8601
    };

    // 2. Lưu đơn hàng vào localStorage (đây là phương pháp demo, thực tế cần lưu vào Database ở backend)
    // Lấy danh sách các đơn hàng hiện có từ localStorage. Nếu chưa có, mặc định là mảng rỗng.
    const existingOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
    // Thêm đơn hàng mới vào danh sách hiện có và lưu lại vào localStorage (chuyển thành chuỗi JSON)
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify([...existingOrders, order]));

    // 3. Thông báo thành công và cập nhật UI
    alert(MESSAGES.CHECKOUT_SUCCESS); // Hiển thị thông báo đặt hàng thành công
    clearCart(); // Gọi hàm clearCart từ CartContext để xóa toàn bộ sản phẩm khỏi giỏ hàng
    setShowModal(false); // Ẩn modal thanh toán
    navigate("/orders"); // Chuyển hướng người dùng đến trang lịch sử đơn hàng
  }, [cart, totalPrice, clearCart, navigate]); // Dependency array: hàm phụ thuộc vào cart, totalPrice, clearCart, và navigate

  // --- Hàm xử lý khi người dùng hủy bỏ modal thanh toán ---
  // Sử dụng useCallback để hàm này chỉ được tạo lại khi các dependencies thay đổi (ở đây là không có dependency nào)
  const handleCancelCheckout = useCallback(() => {
    setShowModal(false); // Đặt state showModal về false để ẩn modal
  }, []); // Dependency array rỗng []: hàm không phụ thuộc vào biến nào từ scope ngoài cần theo dõi.

  // --- Hàm xử lý khi người dùng nhấn nút "Xóa tất cả" trong giỏ hàng ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi các dependencies thay đổi.
  const handleClearCart = useCallback(() => {
    // Hiển thị hộp thoại xác nhận trước khi xóa toàn bộ giỏ hàng
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      return; // Nếu người dùng chọn 'Cancel', dừng hàm tại đây.
    }
    clearCart(); // Gọi hàm clearCart từ CartContext để xóa hết sản phẩm trong giỏ
  }, [clearCart]); // Dependency array: hàm phụ thuộc vào hàm clearCart từ Context

  // --- Render giao diện dựa trên trạng thái loading ---

  // Nếu đang trong trạng thái tải dữ liệu (isLoading là true)
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container cho loading */}
        <div className="loading-spinner"></div> {/* Biểu tượng spinner quay */}
        <p className="loading-text">Đang tải...</p> {/* Thông báo "Đang tải..." */}
      </div>
    );
  }

  // --- Render giao diện chính của trang Giỏ hàng ---
  return (
    <div className="cart-container"> {/* Container chính bao quanh nội dung trang Giỏ hàng */}
      {/* Tiêu đề trang hiển thị số lượng sản phẩm trong giỏ hàng */}
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2>

      {/* --- Hiển thị nội dung dựa trên trạng thái giỏ hàng (có rỗng hay không) --- */}
      {cart.length === 0 ? ( // Nếu giỏ hàng rỗng
        <EmptyCart /> // Hiển thị component EmptyCart
      ) : (
        // Nếu giỏ hàng có sản phẩm
        <> {/* Sử dụng Fragment để nhóm nhiều phần tử mà không thêm DOM node dư thừa */}
          {/* Danh sách các sản phẩm trong giỏ hàng */}
          <ul className="cart-list">
            {cart.map((item) => ( // Map qua mảng 'cart' để render từng CartItem
              <CartItem
                key={item.id} // Key duy nhất cho mỗi CartItem
                item={item} // Truyền dữ liệu sản phẩm hiện tại
                onIncrease={increaseQuantity} // Truyền hàm tăng số lượng từ Context
                onDecrease={decreaseQuantity} // Truyền hàm giảm số lượng từ Context
                onRemove={removeFromCart} // Truyền hàm xóa sản phẩm từ Context
              />
            ))}
          </ul>
          {/* Nút xóa toàn bộ giỏ hàng */}
          <button
            className="clear-cart-button"
            onClick={handleClearCart} // Gắn hàm xử lý xóa toàn bộ giỏ hàng (đã memoize)
            aria-label="Xóa toàn bộ giỏ hàng" // Aria label cho khả năng tiếp cận
          >
            Xóa tất cả
          </button>
          {/* Hiển thị component tóm tắt giỏ hàng (tổng tiền và nút mua hàng) */}
          <CartSummary
            totalPrice={totalPrice} // Truyền tổng tiền đã tính
            onCheckout={handleCheckout} // Truyền hàm xử lý khi nhấn nút mua hàng (đã memoize)
          />
        </>
      )}

      {/* --- Hiển thị Modal thanh toán --- */}
      {/* Nếu state showModal là true, render component CheckoutModal */}
      {showModal && (
        <CheckoutModal
          cart={cart} // Truyền dữ liệu giỏ hàng vào modal (có thể cần hiển thị lại trong modal)
          totalPrice={totalPrice} // Truyền tổng tiền vào modal
          onConfirm={handleConfirmCheckout} // Truyền hàm xử lý xác nhận thanh toán (đã memoize)
          onCancel={handleCancelCheckout} // Truyền hàm xử lý hủy bỏ (đã memoize)
        />
      )}

      {/* --- Các liên kết điều hướng khác --- */}
      <div className="cart-links">
        {/* Liên kết đến trang lịch sử đơn hàng */}
        <Link to="/orders" className="order-history-link">
          📜 Xem lịch sử đơn hàng
        </Link>
        {/* Liên kết quay lại trang chủ hoặc trang danh sách sản phẩm */}
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Export component CartPage để có thể sử dụng ở nơi khác (trong phần routing)