import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import "./CartPage.css";

// Component: CartItem
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      <img src={item.image} alt={item.name} className="cart-image" />
      <p className="cart-name">{item.name}</p>
      <p className="cart-price">💰 {item.price} VNĐ</p>

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

      <button className="remove-button" onClick={() => onRemove(item.id)}>
        Xóa
      </button>
    </li>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handle checkout
  const handleCheckout = () => {
    alert("Đặt hàng thành công!");
    clearCart();
    navigate("/home");
  };

  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng</h2>

      {cart.length === 0 ? (
        <p className="empty-cart-message">Giỏ hàng trống</p>
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

          <h3 className="total-price">Tổng tiền: {totalPrice} VNĐ</h3>

          <button className="checkout-button" onClick={handleCheckout}>
            🛍 Mua hàng
          </button>
        </>
      )}

      {/* Wrapper div để căn giữa nút "Quay lại" */}
      <div className="back-button-container">
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage;