import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
import "../styles/CartPage.css";
import { useCartPage } from "../hooks/useCartPage";

const MESSAGES = {
  BACK_TO_SHOP: "Quay lại cửa hàng",
  PROCEED_TO_CHECKOUT: "Tiến hành thanh toán",
  TOTAL_LABEL: "Tổng cộng:",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
};

const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  if (!item?.id || !item.name || !item.image || typeof item.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", item);
    return null;
  }

  const handleDecrease = () => onUpdateQuantity(item.id, item.quantity - 1);
  const handleIncrease = () => onUpdateQuantity(item.id, item.quantity + 1);
  const handleRemove = () => onRemove(item.id);

  return (
    <li className="cart-item" aria-label={`Sản phẩm ${item.name} trong giỏ hàng`}>
      <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
      <div className="item-details">
        <span className="item-name">{item.name}</span>
        <div className="quantity-control">
          <button onClick={handleDecrease} disabled={item.quantity <= 1} aria-label="Giảm số lượng">
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={handleIncrease} aria-label="Tăng số lượng">
            +
          </button>
        </div>
        <span className="item-subtotal">
          Tổng: {formatCurrency((item.price || 0) * (item.quantity || 0))}
        </span>
      </div>
      <button onClick={handleRemove} className="remove-item-button" aria-label="Xóa sản phẩm">
        Xóa
      </button>
    </li>
  );
});

const CartSummary = React.memo(({ cartTotal, isLoggedIn, onProceedToCheckout }) => (
  <div className="cart-summary">
    <p className="total-price">
      <strong>{MESSAGES.TOTAL_LABEL}</strong> {formatCurrency(cartTotal)}
    </p>
    <button
      className="proceed-to-checkout-button"
      onClick={onProceedToCheckout}
      disabled={!isLoggedIn}
      aria-label="Tiến hành thanh toán"
    >
      {MESSAGES.PROCEED_TO_CHECKOUT}
    </button>
    {!isLoggedIn && <p className="login-required-message">{MESSAGES.LOGIN_REQUIRED}</p>}
  </div>
));

const EmptyCartMessage = () => (
  <div className="empty-cart-message">
    <p>Giỏ hàng của bạn đang trống.</p>
    <Link to="/home" className="back-to-home" aria-label="Quay lại cửa hàng">
      {MESSAGES.BACK_TO_SHOP}
    </Link>
  </div>
);

const CartPage = () => {
  const {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart,
    updateQuantity,
    handleProceedToCheckout,
    guardMessage,
    error,
  } = useCartPage();

  if (error) return <div className="cart-error-message">{error}</div>;

  if (!isLoggedIn) {
    return (
      <div className="cart-container">
        <div className="cart-error-message">{MESSAGES.LOGIN_REQUIRED}</div>
        <Link to="/" className="back-to-home">
          {MESSAGES.BACK_TO_SHOP}
        </Link>
      </div>
    );
  }

  const hasItems = cart.length > 0;

  return (
    <div className="cart-container">
      <h1 className="page-title">Giỏ hàng của bạn</h1>
      {guardMessage && <div className="cart-error-message">{guardMessage}</div>}
      {hasItems ? (
        <>
          <ul className="cart-items-list" role="list">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </ul>
          <CartSummary
            cartTotal={cartTotal}
            isLoggedIn={isLoggedIn}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  );
};

export default CartPage;
