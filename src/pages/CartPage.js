import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import CheckoutModal from "../components/CheckoutModal";
import "./CartPage.css";

// Định nghĩa các thông báo cố định để sử dụng trong ứng dụng
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống",
  CHECKOUT_SUCCESS: "Đặt hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

// Component hiển thị từng sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  // Kiểm tra nếu số lượng sản phẩm là 1, nút giảm sẽ bị vô hiệu hóa
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      {/* Hình ảnh sản phẩm */}
      <img src={item.image} alt={item.name} className="cart-image" />
      <div className="cart-item-details">
        {/* Tên sản phẩm */}
        <p className="cart-name">{item.name}</p>
        {/* Giá sản phẩm, định dạng tiền tệ VNĐ */}
        <p className="cart-price">💰 {item.price.toLocaleString("vi-VN")} VNĐ</p>
        {/* Điều khiển số lượng sản phẩm */}
        <div className="quantity-controls">
          <button
            onClick={() => onDecrease(item.id)}
            disabled={isDecreaseDisabled}
            className={isDecreaseDisabled ? "disabled" : ""}
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => onIncrease(item.id)}>+</button>
        </div>
      </div>
      {/* Nút xóa sản phẩm khỏi giỏ hàng */}
      <button className="remove-button" onClick={() => onRemove(item.id)}>
        Xóa
      </button>
    </li>
  );
};

// Component hiển thị tổng tiền và nút mua hàng
const CartSummary = ({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    {/* Hiển thị tổng tiền, định dạng tiền tệ VNĐ */}
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
    </h3>
    {/* Nút để tiến hành thanh toán */}
    <button className="checkout-button" onClick={onCheckout}>
      🛍 Mua hàng
    </button>
  </div>
);

// Component hiển thị thông báo khi giỏ hàng trống
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>
);

// Component chính của trang giỏ hàng
const CartPage = () => {
  // Hook để điều hướng người dùng
  const navigate = useNavigate();

  // Lấy dữ liệu từ CartContext (giỏ hàng) và AuthContext (trạng thái đăng nhập)
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };

  // State để kiểm soát việc hiển thị modal thanh toán
  const [showModal, setShowModal] = useState(false);

  // Tính tổng tiền và tổng số sản phẩm trong giỏ hàng
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Xử lý khi người dùng nhấn nút "Mua hàng"
  const handleCheckout = () => {
    if (!isLoggedIn) {
      // Nếu chưa đăng nhập, hiển thị thông báo và chuyển hướng về trang chủ
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    // Hiển thị modal thanh toán nếu đã đăng nhập
    setShowModal(true);
  };

  // Xử lý khi người dùng xác nhận thanh toán
  const handleConfirmCheckout = (shippingInfo) => {
    // Tạo đơn hàng mới với thông tin giỏ hàng và thông tin giao hàng
    const order = {
      id: Date.now(),
      items: cart,
      totalPrice,
      shippingInfo,
      date: new Date().toISOString(),
    };

    // Lưu đơn hàng vào localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));

    // Hiển thị thông báo thành công, xóa giỏ hàng và đóng modal
    alert(MESSAGES.CHECKOUT_SUCCESS);
    clearCart();
    setShowModal(false);
    navigate("/home");
  };

  // Xử lý khi người dùng hủy thanh toán
  const handleCancelCheckout = () => {
    setShowModal(false);
  };

  // Xử lý khi người dùng muốn xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
    }
  };

  return (
    <div className="cart-container">
      {/* Tiêu đề giỏ hàng, hiển thị tổng số sản phẩm */}
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2>

      {/* Kiểm tra nếu giỏ hàng trống thì hiển thị thông báo, ngược lại hiển thị danh sách sản phẩm */}
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Danh sách các sản phẩm trong giỏ hàng */}
          <ul className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </ul>

          {/* Nút xóa toàn bộ giỏ hàng */}
          <button className="clear-cart-button" onClick={handleClearCart}>
            Xóa tất cả
          </button>

          {/* Hiển thị tổng tiền và nút mua hàng */}
          <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} />
        </>
      )}

      {/* Hiển thị modal thanh toán nếu showModal là true */}
      {showModal && (
        <CheckoutModal
          cart={cart}
          totalPrice={totalPrice}
          onConfirm={handleConfirmCheckout}
          onCancel={handleCancelCheckout}
        />
      )}

      {/* Các liên kết điều hướng */}
      <div className="cart-links">
        <Link to="/orders" className="order-history-link">
          📜 Xem lịch sử đơn hàng
        </Link>
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage;