import React, { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import "./CartPage.css";

// --- Utilities ---
/**
 * Calculates the total price of items in the cart.
 * @param {Array} cart - Array of cart items.
 * @returns {number} - Total price in VND.
 */
const calculateCartTotal = (cart) =>
  Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0)
    : 0;

// --- Custom Hook ---
/**
 * Custom hook to manage cart-related logic and navigation.
 * @returns {Object} - Cart data, handlers, and state.
 */
const useCart = () => {
  const cartContext = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Validate context availability
  if (!cartContext || !authContext) {
    console.error("CartContext or AuthContext is not provided.");
  }

  const {
    cart = [],
    removeFromCart = () => console.warn("removeFromCart not implemented"),
    updateQuantity = () => console.warn("updateQuantity not implemented"),
  } = cartContext || {};
  const { isLoggedIn = false } = authContext || {};

  // Memoize cart total
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  // Handle checkout navigation
  const handleProceedToCheckout = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      alert("Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để tiến hành thanh toán.");
      navigate("/");
      return;
    }
    navigate("/checkout");
  };

  return {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart,
    updateQuantity,
    handleProceedToCheckout,
  };
};

// --- Child Components ---
/**
 * Displays a single cart item with quantity controls and remove button.
 * @param {Object} props - Component props.
 * @param {Object} props.item - Cart item data.
 * @param {Function} props.onUpdateQuantity - Updates item quantity.
 * @param {Function} props.onRemove - Removes item from cart.
 */
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

/**
 * Displays cart summary with total price and checkout button.
 * @param {Object} props - Component props.
 * @param {number} props.cartTotal - Total cart price.
 * @param {boolean} props.isLoggedIn - User authentication status.
 * @param {Function} props.onProceedToCheckout - Handles checkout navigation.
 */
const CartSummary = React.memo(({ cartTotal, isLoggedIn, onProceedToCheckout }) => (
  <div className="cart-summary">
    <p className="total-price">
      <strong>Tổng cộng:</strong> {cartTotal.toLocaleString("vi-VN")} VNĐ
    </p>
    <button
      className="proceed-to-checkout-button"
      onClick={onProceedToCheckout}
      disabled={!isLoggedIn}
      aria-label="Tiến hành thanh toán"
    >
      Tiến hành Thanh toán
    </button>
    {!isLoggedIn && (
      <p className="login-required-message">Vui lòng đăng nhập để thanh toán.</p>
    )}
  </div>
));

// --- Main Component ---
/**
 * Cart page displaying cart items, summary, and checkout option.
 */
const CartPage = () => {
  const {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart,
    updateQuantity,
    handleProceedToCheckout,
  } = useCart();

  // Render cart items or empty state
  const renderCartItems = () =>
    !Array.isArray(cart) || cart.length === 0 ? (
      <div className="empty-cart-message">
        <p>Giỏ hàng của bạn đang trống.</p>
        <Link to="/home" className="back-to-home" aria-label="Quay lại cửa hàng">
          Quay lại cửa hàng
        </Link>
      </div>
    ) : (
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
    );

  return (
    <div className="cart-container">
      <h1 className="page-title">Giỏ hàng của bạn</h1>
      {renderCartItems()}
      {cart.length > 0 && (
        <CartSummary
          cartTotal={cartTotal}
          isLoggedIn={isLoggedIn}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}
    </div>
  );
};

export default CartPage;