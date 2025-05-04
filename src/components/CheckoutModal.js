import React, { useState, useCallback } from "react";
import "./CheckoutModal.css";

// Constants
const EMPTY_CART_MESSAGE = "Không có sản phẩm trong giỏ hàng để thanh toán.";

// Utility function to validate shipping information
const validateShippingInfo = (shippingInfo) => {
  const errors = {};
  const { name, address, phone } = shippingInfo;

  if (!name.trim()) errors.name = "Vui lòng nhập họ và tên.";
  if (!address.trim()) errors.address = "Vui lòng nhập địa chỉ giao hàng.";
  if (!phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.";
  }

  return errors;
};

const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const errors = validateShippingInfo(shippingInfo);
      setValidationErrors(errors);
      if (Object.keys(errors).length === 0) {
        onConfirm(shippingInfo);
      }
    },
    [shippingInfo, onConfirm]
  );

  // Render cart items
  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return <p className="empty-cart-message">{EMPTY_CART_MESSAGE}</p>;
    }

    return (
      <div>
        <ul className="cart-items-list">
          {cart.map((item, index) => (
            <li key={item?.id || index} className="cart-item">
              <span className="item-name">{item?.name || 'Sản phẩm không rõ'}</span>
              <span className="item-quantity">x {item?.quantity || 0}</span>
              <span className="item-price">
                {((item?.price || 0) * (item?.quantity || 0)).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
        <p className="total-price">
          <strong>Tổng tiền:</strong> {(totalPrice || 0).toLocaleString("vi-VN")} VNĐ
        </p>
      </div>
    );
  };

  // Render shipping form
  const renderShippingForm = () => (
    <form onSubmit={handleSubmit} className="shipping-form">
      <h3>🚚 Thông tin giao hàng</h3>
      <div className="form-group">
        <label htmlFor="name">Họ và tên:</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Nhập họ và tên người nhận"
          value={shippingInfo.name}
          onChange={handleChange}
          className={validationErrors.name ? "error" : ""}
          aria-label="Nhập họ và tên người nhận"
          required
        />
        {validationErrors.name && (
          <span className="error-message">{validationErrors.name}</span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="address">Địa chỉ:</label>
        <input
          type="text"
          id="address"
          name="address"
          placeholder="Nhập địa chỉ giao hàng chi tiết"
          value={shippingInfo.address}
          onChange={handleChange}
          className={validationErrors.address ? "error" : ""}
          aria-label="Nhập địa chỉ giao hàng"
          required
        />
        {validationErrors.address && (
          <span className="error-message">{validationErrors.address}</span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="phone">Số điện thoại:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Nhập số điện thoại liên hệ"
          value={shippingInfo.phone}
          onChange={handleChange}
          className={validationErrors.phone ? "error" : ""}
          aria-label="Nhập số điện thoại liên hệ"
          required
        />
        {validationErrors.phone && (
          <span className="error-message">{validationErrors.phone}</span>
        )}
      </div>
      <div className="modal-buttons">
        <button
          type="submit"
          className="confirm-button"
          aria-label="Xác nhận đặt hàng"
        >
          ✅ Xác nhận đặt hàng
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          aria-label="Hủy đặt hàng"
        >
          ❌ Hủy
        </button>
      </div>
    </form>
  );

  const isCartEmpty = !Array.isArray(cart) || cart.length === 0;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2>
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3>
          {renderCartItems()}
        </div>
        {!isCartEmpty && renderShippingForm()}
      </div>
    </div>
  );
};

export default CheckoutModal;