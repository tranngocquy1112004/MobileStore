import React from "react";
import "../../styles/CartPage.css";
import { useCartPage } from "./services/useCartPage";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import EmptyCartMessage from "./components/EmptyCartMessage";
import { MESSAGES } from "./models/constants";
import { Link } from "react-router-dom";

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
              <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
            ))}
          </ul>
          <CartSummary cartTotal={cartTotal} isLoggedIn={isLoggedIn} onProceedToCheckout={handleProceedToCheckout} />
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  );
};

export default CartPage;
