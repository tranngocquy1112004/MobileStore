import React from "react";
import "../../../styles/CheckoutPage.css";

const SavedAddressSelector = ({
  addresses,
  selectedAddressId,
  onSelect,
  onToggleForm,
}) => (
  <div className="saved-addresses-selection">
    <h3>Chọn địa chỉ đã lưu:</h3>
    <ul className="address-options-list" role="listbox">
      {addresses.map((addr) => (
        <li key={addr.id} role="option" aria-selected={selectedAddressId === addr.id}>
          <input
            type="radio"
            id={`saved-address-${addr.id}`}
            name="shippingAddressOption"
            checked={selectedAddressId === addr.id}
            onChange={() => onSelect(addr.id)}
            aria-label={`Chọn địa chỉ: ${addr.name}, ${addr.phone}, ${addr.address}`}
          />
          <label htmlFor={`saved-address-${addr.id}`} className="address-option-label">
            <strong>{addr.name}</strong> - {addr.phone} - {addr.address}
          </label>
        </li>
      ))}
    </ul>
    <button
      className="toggle-address-form-button"
      onClick={() => onToggleForm(true)}
      aria-label="Nhập địa chỉ giao hàng mới"
    >
      Nhập địa chỉ mới
    </button>
    <hr />
  </div>
);

export default React.memo(SavedAddressSelector);
