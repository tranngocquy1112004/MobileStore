import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext"; // Context quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Context quản lý trạng thái đăng nhập
import CheckoutModal from "../components/CheckoutModal"; // Modal thanh toán
import "./CartPage.css";

// Các thông báo cố định
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống", // Thông báo khi giỏ hàng rỗng
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Thông báo khi đặt hàng thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi chưa đăng nhập
};

// Component hiển thị từng sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1; // Kiểm tra nếu số lượng là 1 thì vô hiệu hóa nút giảm

  return (
    <li className="cart-item">
      <img src={item.image} alt={item.name} className="cart-image" /> {/* Hình ảnh sản phẩm */}
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Tên sản phẩm */}
        <p className="cart-price">💰 {item.price.toLocaleString("vi-VN")} VNĐ</p> {/* Giá sản phẩm, định dạng VNĐ */}
        <div className="quantity-controls">
          <button
            onClick={() => onDecrease(item.id)}
            disabled={isDecreaseDisabled}
            className={isDecreaseDisabled ? "disabled" : ""} // Vô hiệu hóa nút nếu số lượng là 1
          >
            -
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng */}
          <button onClick={() => onIncrease(item.id)}>+</button> {/* Nút tăng số lượng */}
        </div>
      </div>
      <button className="remove-button" onClick={() => onRemove(item.id)}>
        Xóa {/* Nút xóa sản phẩm */}
      </button>
    </li>
  );
};

// Component hiển thị tổng tiền và nút mua hàng
const CartSummary = ({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ {/* Tổng tiền, định dạng VNĐ */}
    </h3>
    <button className="checkout-button" onClick={onCheckout}>
      🛍 Mua hàng {/* Nút tiến hành thanh toán */}
    </button>
  </div>
);

// Component hiển thị thông báo khi giỏ hàng trống
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p> // Thông báo giỏ hàng trống
);

// Component chính: Trang giỏ hàng
const CartPage = () => {
  const navigate = useNavigate(); // Hook để điều hướng người dùng
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useContext(CartContext); // Lấy dữ liệu và hàm từ CartContext
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false }; // Lấy trạng thái đăng nhập, mặc định là false nếu không có
  const [showModal, setShowModal] = useState(false); // State để hiển thị modal thanh toán

  // Tính tổng tiền và tổng số sản phẩm
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // Tổng tiền
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Tổng số sản phẩm

  // Xử lý khi nhấn nút "Mua hàng"
  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // Thông báo nếu chưa đăng nhập
      navigate("/"); // Chuyển hướng về trang chủ
      return;
    }
    setShowModal(true); // Hiển thị modal thanh toán nếu đã đăng nhập
  };

  // Xử lý xác nhận thanh toán
  const handleConfirmCheckout = (shippingInfo) => {
    const order = {
      id: Date.now(), // ID đơn hàng dựa trên timestamp
      items: cart, // Danh sách sản phẩm trong giỏ
      totalPrice, // Tổng tiền
      shippingInfo, // Thông tin giao hàng
      date: new Date().toISOString(), // Thời gian đặt hàng
    };

    // Lưu đơn hàng vào localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));

    // Thông báo thành công và làm sạch giỏ hàng
    alert(MESSAGES.CHECKOUT_SUCCESS);
    clearCart(); // Xóa toàn bộ giỏ hàng
    setShowModal(false); // Đóng modal
    navigate("/home"); // Chuyển hướng về trang chủ
  };

  // Xử lý hủy thanh toán
  const handleCancelCheckout = () => {
    setShowModal(false); // Đóng modal thanh toán
  };

  // Xử lý xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) { // Xác nhận trước khi xóa
      clearCart(); // Xóa giỏ hàng
    }
  };

  // Giao diện chính
  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2> {/* Tiêu đề hiển thị số lượng sản phẩm */}
      {cart.length === 0 ? (
        <EmptyCart /> // Hiển thị thông báo nếu giỏ hàng trống
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={increaseQuantity} // Hàm tăng số lượng
                onDecrease={decreaseQuantity} // Hàm giảm số lượng
                onRemove={removeFromCart} // Hàm xóa sản phẩm
              />
            ))}
          </ul>
          <button className="clear-cart-button" onClick={handleClearCart}>
            Xóa tất cả {/* Nút xóa toàn bộ giỏ hàng */}
          </button>
          <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} /> {/* Hiển thị tổng tiền và nút mua hàng */}
        </>
      )}
      {showModal && (
        <CheckoutModal
          cart={cart}
          totalPrice={totalPrice}
          onConfirm={handleConfirmCheckout} // Xác nhận thanh toán
          onCancel={handleCancelCheckout} // Hủy thanh toán
        />
      )}
      <div className="cart-links">
        <Link to="/orders" className="order-history-link">
          📜 Xem lịch sử đơn hàng {/* Liên kết đến lịch sử đơn hàng */}
        </Link>
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng {/* Liên kết quay lại cửa hàng */}
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Xuất component để sử dụng ở nơi khác