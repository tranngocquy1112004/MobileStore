import React, { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
import "./CartPage.css";

// --- Utilities ---
const calculateCartTotal = (cart) =>
  Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0) : 0;

// --- Child Components ---
const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  if (!item || !item.id) {
    console.error("Dữ liệu sản phẩm không hợp lệ:", item);
    return null;
  }

  return (
    <li className="cart-item" aria-label={`Sản phẩm ${item.name || "không rõ"} trong giỏ hàng`}>
      <img src={item.image} alt={item.name || "Sản phẩm"} className="item-image" loading="lazy" />
      <div className="item-details">
        <span className="item-name">{item.name || "Sản phẩm không rõ"}</span>
        <span className="item-price">{(item.price || 0).toLocaleString("vi-VN")} VNĐ</span>
        <div className="quantity-control">
          <button
            onClick={() => onUpdateQuantity(item.id, (item.quantity || 0) - 1)}
            disabled={(item.quantity || 0) <= 1}
            aria-label="Giảm số lượng"
          >
            -
          </button>
          <span>{item.quantity || 0}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, (item.quantity || 0) + 1)}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        <span className="item-subtotal">
          Tổng: {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
        </span>
      </div>
      <button onClick={() => onRemove(item.id)} className="remove-item-button" aria-label="Xóa sản phẩm">
        Xóa
      </button>
    </li>
  );
});

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
    {!isLoggedIn && <p className="login-required-message">Vui lòng đăng nhập để thanh toán.</p>}
  </div>
));

// --- Main Component ---
const CartPage = () => {
  const { cart = [], removeFromCart = () => {}, updateQuantity = () => {} } = useContext(CartContext) || {};
  const { isLoggedIn = false } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  const handleProceedToCheckout = () => {
    if (!cart?.length) {
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
        {cart.map((item, index) => (
          <CartItem
            key={item?.id || index}
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
      {cart?.length > 0 && (
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