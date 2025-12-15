import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../utils/formatters";
import "../../../styles/CheckoutPage.css";

const OrderSummary = ({ cart, cartTotal, navigate }) => (
  <div className="order-summary-section">
    <h2>🧾 Thông tin đơn hàng</h2>
    {cart?.length > 0 ? (
      <>
        <ul className="checkout-cart-items-list">
          {cart.map((item, index) => (
            <li key={item.id || index} className="checkout-cart-item">
              <span className="item-name">{item.name || "Sản phẩm không rõ"}</span>
              <span className="item-quantity">x{item.quantity || 0}</span>
              <span className="item-price">
                {formatCurrency((item.price || 0) * (item.quantity || 0))}
              </span>
            </li>
          ))}
        </ul>
        <p className="checkout-total-price">
          <strong>Tổng tiền:</strong> {formatCurrency(cartTotal)}
        </p>
      </>
    ) : (
      <div className="empty-cart-message">
        <h2>Giỏ hàng của bạn</h2>
        <p>Giỏ hàng của bạn đang trống.</p>
        <button
          className="back-to-shopping-button"
          onClick={() => navigate("/cart")}
          aria-label="Quay lại giỏ hàng"
        >
          Quay lại giỏ hàng
        </button>
      </div>
    )}
  </div>
);

export default React.memo(OrderSummary);
