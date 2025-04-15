import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import CheckoutModal from "../components/CheckoutModal";
import "./CartPage.css";

const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống",
  CHECKOUT_SUCCESS: "Đặt hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      <img src={item.image} alt={item.name} className="cart-image" loading="lazy" />
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
            aria-label={`Giảm số lượng ${item.name}`}
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => onIncrease(item.id)}
            aria-label={`Tăng số lượng ${item.name}`}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="remove-button"
        onClick={() => onRemove(item.id)}
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
      >
        Xóa
      </button>
    </li>
  );
};

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

const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>
);

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
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

  const handleClearCart = () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
    clearCart();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

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
          <button
            className="clear-cart-button"
            onClick={handleClearCart}
            aria-label="Xóa toàn bộ giỏ hàng"
          >
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