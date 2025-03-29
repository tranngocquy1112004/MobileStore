// pages/CartPage.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import CheckoutModal from "../components/CheckoutModal";
import "./CartPage.css";

// Constants
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống",
  CHECKOUT_SUCCESS: "Đặt hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

// Component CartItem
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      <img src={item.image} alt={item.name} className="cart-image" />
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p>
        <p className="cart-price">💰 {item.price.toLocaleString("vi-VN")} VNĐ</p>
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

// Component CartSummary
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

// Component EmptyCart
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>
);

// Component CartPage
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };
  const [showModal, setShowModal] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      return navigate("/");
    }
    setShowModal(true);
  };

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

  const handleCancelCheckout = () => {
    setShowModal(false);
  };

  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng</h2> {/* Giữ tiêu đề này vì đây là nội dung chính */}

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