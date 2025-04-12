import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import CheckoutModal from "../components/CheckoutModal";
import "./CartPage.css";

// Thông báo cố định
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống",
  CHECKOUT_SUCCESS: "Đặt hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

// Component hiển thị 1 sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      <img src={item.image} alt={item.name} className="cart-image" />
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p>
        <p className="cart-price">
          💰 {item.price.toLocaleString("vi-VN")} VNĐ
        </p>
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
      <button className="remove-button" onClick={() => onRemove(item.id)}>
        Xóa
      </button>
    </li>
  );
};

// Component hiển thị tổng tiền và nút thanh toán
const CartSummary = ({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
    </h3>
    <button className="checkout-button" onClick={onCheckout}>
      🛍 Mua hàng
    </button>
  </div>
);

// Component hiển thị khi giỏ hàng trống
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>
);

// Component chính: Trang giỏ hàng
const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hiệu ứng mô phỏng tải dữ liệu khi mở trang
  useEffect(() => {
    const simulateLoading = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    simulateLoading();
  }, []);

  // Hiển thị spinner trong khi đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

  // Tính tổng tiền và tổng số sản phẩm
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Xử lý khi nhấn "Mua hàng"
  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    setShowModal(true);
  };

  // Xác nhận thanh toán
  const handleConfirmCheckout = (shippingInfo) => {
    const order = {
      id: Date.now(),
      items: cart,
      totalPrice,
      shippingInfo,
      date: new Date().toISOString(),
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));

    alert(MESSAGES.CHECKOUT_SUCCESS);
    clearCart();
    setShowModal(false);
    navigate("/home");
  };

  // Hủy thanh toán
  const handleCancelCheckout = () => {
    setShowModal(false);
  };

  // Xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
    }
  };

  // JSX render
  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2>

      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
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

          <button className="clear-cart-button" onClick={handleClearCart}>
            Xóa tất cả
          </button>

          <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} />
        </>
      )}

      {showModal && (
        <CheckoutModal
          cart={cart}
          totalPrice={totalPrice}
          onConfirm={handleConfirmCheckout}
          onCancel={handleCancelCheckout}
        />
      )}

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
