import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext"; // Context để quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Context để quản lý trạng thái đăng nhập
import CheckoutModal from "../components/CheckoutModal"; // Component modal thanh toán
import "./CartPage.css";

// Các thông báo cố định
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống", // Thông báo khi không có sản phẩm trong giỏ
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Thông báo khi thanh toán thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo yêu cầu đăng nhập
};

// Component hiển thị từng sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1; // Kiểm tra nếu số lượng là 1 thì vô hiệu hóa nút giảm

  return (
    <li className="cart-item">
      <img
        src={item.image} // Đường dẫn hình ảnh sản phẩm
        alt={item.name} // Văn bản thay thế cho hình ảnh
        className="cart-image" // Class CSS để định dạng ảnh
      />
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Hiển thị tên sản phẩm */}
        <p className="cart-price">
          💰 {item.price.toLocaleString("vi-VN")} VNĐ
        </p> {/* Hiển thị giá sản phẩm, định dạng tiền Việt Nam */}
        <div className="quantity-controls">
          <button
            onClick={() => onDecrease(item.id)} // Giảm số lượng khi nhấp
            disabled={isDecreaseDisabled} // Vô hiệu hóa nút nếu số lượng là 1
            className={isDecreaseDisabled ? "disabled" : ""} // Thêm class disabled nếu nút bị vô hiệu hóa
          >
            -
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng hiện tại */}
          <button onClick={() => onIncrease(item.id)}>+</button> {/* Tăng số lượng khi nhấp */}
        </div>
      </div>
      <button
        className="remove-button" // Class CSS cho nút xóa
        onClick={() => onRemove(item.id)} // Xóa sản phẩm khi nhấp
      >
        Xóa {/* Nút xóa sản phẩm khỏi giỏ hàng */}
      </button>
    </li>
  );
};

// Component hiển thị tổng tiền và nút mua hàng
const CartSummary = ({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
    </h3> {/* Hiển thị tổng tiền của giỏ hàng, định dạng tiền Việt Nam */}
    <button
      className="checkout-button" // Class CSS cho nút thanh toán
      onClick={onCheckout} // Gọi hàm thanh toán khi nhấp
    >
      🛍 Mua hàng {/* Nút tiến hành thanh toán */}
    </button>
  </div>
);

// Component hiển thị thông báo khi giỏ hàng trống
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p> // Thông báo khi giỏ hàng không có sản phẩm
);

// Component chính: Trang giỏ hàng
const CartPage = () => {
  const navigate = useNavigate(); // Hook để điều hướng người dùng đến các trang khác
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext); // Lấy dữ liệu giỏ hàng và các hàm xử lý từ CartContext
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false }; // Lấy trạng thái đăng nhập từ AuthContext, mặc định là false nếu không có
  const [showModal, setShowModal] = useState(false); // State kiểm soát việc hiển thị modal thanh toán
  const [isLoading, setIsLoading] = useState(true); // State kiểm soát trạng thái tải dữ liệu

  // Giả lập thời gian tải dữ liệu khi component mount
  useEffect(() => {
    const simulateLoading = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay 1 giây để giả lập tải dữ liệu
      setIsLoading(false); // Tắt trạng thái đang tải
    };
    simulateLoading(); // Gọi hàm giả lập tải
  }, []); // Dependency rỗng: chỉ chạy một lần khi mount

  // Hiển thị giao diện khi đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div> {/* Hiệu ứng spinner khi tải */}
        <p className="loading-text">Đang tải...</p> {/* Thông báo đang tải */}
      </div>
    );
  }

  // Tính tổng tiền và tổng số sản phẩm trong giỏ hàng
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ); // Tổng tiền = giá từng sản phẩm * số lượng, cộng dồn
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Tổng số sản phẩm trong giỏ

  // Xử lý khi nhấn nút "Mua hàng"
  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // Thông báo nếu chưa đăng nhập
      navigate("/"); // Chuyển hướng về trang chủ
      return;
    }
    setShowModal(true); // Hiển thị modal thanh toán nếu đã đăng nhập
  };

  // Xử lý xác nhận thanh toán từ modal
  const handleConfirmCheckout = (shippingInfo) => {
    const order = {
      id: Date.now(), // Tạo ID đơn hàng dựa trên timestamp hiện tại
      items: cart, // Danh sách sản phẩm trong giỏ hàng
      totalPrice, // Tổng tiền của đơn hàng
      shippingInfo, // Thông tin giao hàng từ modal
      date: new Date().toISOString(), // Thời gian đặt hàng (định dạng ISO)
    };

    // Lưu đơn hàng vào localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || []; // Lấy danh sách đơn hàng cũ, nếu không có thì mảng rỗng
    localStorage.setItem(
      "orders",
      JSON.stringify([...existingOrders, order])
    ); // Thêm đơn hàng mới vào danh sách và lưu lại

    // Thông báo thành công và làm sạch giỏ hàng
    alert(MESSAGES.CHECKOUT_SUCCESS); // Hiển thị thông báo thành công
    clearCart(); // Xóa toàn bộ sản phẩm trong giỏ hàng
    setShowModal(false); // Đóng modal thanh toán
    navigate("/home"); // Chuyển hướng về trang chủ
  };

  // Xử lý hủy thanh toán
  const handleCancelCheckout = () => {
    setShowModal(false); // Đóng modal thanh toán
  };

  // Xử lý xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) { // Hiển thị xác nhận trước khi xóa
      clearCart(); // Xóa toàn bộ giỏ hàng
    }
  };

  // Giao diện chính của trang giỏ hàng
  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2> {/* Tiêu đề hiển thị tổng số sản phẩm */}
      {cart.length === 0 ? (
        <EmptyCart /> // Hiển thị thông báo nếu giỏ hàng trống
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.id} // Key duy nhất cho mỗi sản phẩm
                item={item} // Dữ liệu sản phẩm
                onIncrease={increaseQuantity} // Hàm tăng số lượng
                onDecrease={decreaseQuantity} // Hàm giảm số lượng
                onRemove={removeFromCart} // Hàm xóa sản phẩm
              />
            ))}
          </ul>
          <button
            className="clear-cart-button" // Class CSS cho nút xóa tất cả
            onClick={handleClearCart} // Gọi hàm xóa toàn bộ giỏ hàng
          >
            Xóa tất cả {/* Nút xóa toàn bộ giỏ hàng */}
          </button>
          <CartSummary
            totalPrice={totalPrice} // Tổng tiền truyền vào
            onCheckout={handleCheckout} // Hàm xử lý khi nhấn nút mua hàng
          />
        </>
      )}
      {showModal && (
        <CheckoutModal
          cart={cart} // Danh sách sản phẩm trong giỏ hàng
          totalPrice={totalPrice} // Tổng tiền của giỏ hàng
          onConfirm={handleConfirmCheckout} // Hàm xác nhận thanh toán
          onCancel={handleCancelCheckout} // Hàm hủy thanh toán
        />
      )}
      <div className="cart-links">
        <Link to="/orders" className="order-history-link">
          📜 Xem lịch sử đơn hàng {/* Liên kết đến trang lịch sử đơn hàng */}
        </Link>
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng {/* Liên kết quay lại trang chủ */}
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Xuất component để sử dụng ở nơi khác