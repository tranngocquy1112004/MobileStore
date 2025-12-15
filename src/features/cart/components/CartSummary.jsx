import React from "react";
import { formatCurrency } from "../../../utils/formatters";
import { MESSAGES } from "../models/constants";

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

CartSummary.displayName = "CartSummary";

export default CartSummary;
