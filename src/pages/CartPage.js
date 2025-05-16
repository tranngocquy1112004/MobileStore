import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import "./CartPage.css";

// --- Hằng số ---
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng của bạn đang trống.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để thanh toán.",
  CONTEXT_ERROR: "Lỗi hệ thống: Không thể truy cập giỏ hàng hoặc thông tin đăng nhập.",
  BACK_TO_SHOP: "Quay lại cửa hàng",
  PROCEED_TO_CHECKOUT: "Tiến hành Thanh toán",
  TOTAL_LABEL: "Tổng cộng:",
};

// --- Hàm tiện ích ---
const calculateCartTotal = (cart) =>
  Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0)
    : 0;

// --- Custom Hook ---
const useCart = () => {
  const cartContext = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Kiểm tra context
  if (!cartContext || !authContext) {
    setError(MESSAGES.CONTEXT_ERROR);
    return { error };
  }

  const { cart = [], removeFromCart, updateQuantity } = cartContext;
  const { isLoggedIn = false } = authContext;

  // Tính tổng giỏ hàng
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  const handleProceedToCheckout = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      alert(MESSAGES.EMPTY_CART);
      return;
    }
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    navigate("/checkout");
  };

  return {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart: removeFromCart || (() => console.warn("removeFromCart not implemented")),
    updateQuantity: updateQuantity || (() => console.warn("updateQuantity not implemented")),
    handleProceedToCheckout,
    error,
  };
};

// --- Thành phần con ---
const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  if (!item?.id || !item.name || !item.image || typeof item.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", item);
    return null;
  }

  return (
    <li className="cart-item" aria-label={`Sản phẩm ${item.name} trong giỏ hàng`}>
      <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
      <div className="item-details">
        <span className="item-name">{item.name}</span>
        <span className="item-price">{item.price.toLocaleString("vi-VN")} VNĐ</span>
        <div className="quantity-control">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Giảm số lượng"
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        <span className="item-subtotal">
          Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
        </span>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="remove-item-button"
        aria-label="Xóa sản phẩm"
      >
        Xóa
      </button>
    </li>
  );
});

const CartSummary = React.memo(({ cartTotal, isLoggedIn, onProceedToCheckout }) => (
  <div className="cart-summary">
    <p className="total-price">
      <strong>{MESSAGES.TOTAL_LABEL}</strong> {cartTotal.toLocaleString("vi-VN")} VNĐ
    </p>
    <button
      className="proceed-to-checkout-button"
      onClick={onProceedToCheckout}
      disabled={!isLoggedIn}
      aria-label="Tiến hành thanh toán"
    >
      {MESSAGES.PROCEED_TO_CHECKOUT}
    </button>
    {!isLoggedIn && (
      <p className="login-required-message">{MESSAGES.LOGIN_REQUIRED}</p>
    )}
  </div>
));

const EmptyCartMessage = () => (
  <div className="empty-cart-message">
    <p>{MESSAGES.EMPTY_CART}</p>
    <Link to="/home" className="back-to-home" aria-label="Quay lại cửa hàng">
      {MESSAGES.BACK_TO_SHOP}
    </Link>
  </div>
);

// --- Thành phần chính ---
const CartPage = () => {
  const {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart,
    updateQuantity,
    handleProceedToCheckout,
    error,
  } = useCart();

  if (error) {
    return <div className="cart-error-message">{error}</div>;
  }

  const hasItems = Array.isArray(cart) && cart.length > 0;

  return (
    <div className="cart-container">
      <h1 className="page-title">Giỏ hàng của bạn</h1>
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