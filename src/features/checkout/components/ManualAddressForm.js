import React from "react";
import "../../../styles/CheckoutPage.css";

const ManualAddressForm = ({
  shippingInfo,
  onChange,
  onSubmit,
  onToggleForm,
  hasSavedAddresses,
}) => (
  <form className="manual-address-entry" onSubmit={onSubmit}>
    <h3>Nhập địa chỉ mới:</h3>
    {hasSavedAddresses && (
      <button
        type="button"
        className="toggle-address-form-button"
        onClick={() => onToggleForm(false)}
        aria-label="Quay lại chọn địa chỉ đã lưu"
      >
        ↩ Quay lại chọn địa chỉ đã lưu
      </button>
    )}
    <div className="form-group">
      <label htmlFor="manual-address-input">Địa chỉ:</label>
      <input
        type="text"
        id="manual-address-input"
        name="address"
        placeholder="Nhập địa chỉ chi tiết"
        value={shippingInfo.address}
        onChange={onChange}
        required
        aria-label="Nhập địa chỉ giao hàng"
      />
    </div>
    <div className="form-group">
      <label htmlFor="manual-name-input">Người nhận:</label>
      <input
        type="text"
        id="manual-name-input"
        name="name"
        placeholder="Tên người nhận"
        value={shippingInfo.name}
        onChange={onChange}
        required
        aria-label="Nhập tên người nhận"
      />
    </div>
    <div className="form-group">
      <label htmlFor="manual-phone-input">Điện thoại:</label>
      <input
        type="tel"
        id="manual-phone-input"
        name="phone"
        placeholder="Số điện thoại liên hệ"
        value={shippingInfo.phone}
        onChange={onChange}
        required
        aria-label="Nhập số điện thoại liên hệ"
      />
    </div>
    <button
      type="submit"
      className="place-order-button"
      disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone}
      aria-label="Xác nhận đặt hàng"
    >
      🛒 Đặt hàng
    </button>
  </form>
);

export default React.memo(ManualAddressForm);
