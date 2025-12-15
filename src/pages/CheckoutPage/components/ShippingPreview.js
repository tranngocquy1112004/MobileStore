import React from "react";
import "../../../styles/CheckoutPage.css";

const ShippingPreview = ({ hasValidShippingInfo, shippingInfo }) => (
  <div className="final-shipping-preview">
    <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
    {hasValidShippingInfo ? (
      <p className="shipping-details">
        <strong>{shippingInfo.name}</strong> - {shippingInfo.phone}
        <br />
        {shippingInfo.address}
      </p>
    ) : (
      <p className="shipping-placeholder">
        Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên.
      </p>
    )}
  </div>
);

export default React.memo(ShippingPreview);
