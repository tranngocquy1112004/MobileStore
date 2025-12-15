import React from "react";
import { Link } from "react-router-dom";
import { MESSAGES } from "../models/constants";

const EmptyCartMessage = () => (
  <div className="empty-cart-message">
    <p>Giỏ hàng của bạn đang trống.</p>
    <Link to="/home" className="back-to-home" aria-label="Quay lại cửa hàng">
      {MESSAGES.BACK_TO_SHOP}
    </Link>
  </div>
);

export default EmptyCartMessage;
