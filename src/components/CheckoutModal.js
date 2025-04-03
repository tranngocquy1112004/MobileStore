import React, { useState } from "react";
import "./CheckoutModal.css";

// Component CheckoutModal
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Kiểm tra tính hợp lệ của form
  const validateForm = () => {
    const errors = {};
    const { name, address, phone } = shippingInfo;

    if (!name.trim()) errors.name = "Vui lòng nhập họ và tên";
    if (!address.trim()) errors.address = "Vui lòng nhập địa chỉ giao hàng";
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý xác nhận đơn hàng
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(shippingInfo);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2>

        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3>
          {cart.length > 0 ? (
            <>
              <ul className="cart-items-list">
                {cart.map((item) => (
                  <li key={item.id} className="cart-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x {item.quantity}</span>
                    <span className="item-price">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")} VNĐ
              </p>
            </>
          ) : (
            <p className="empty-cart-message">Không có sản phẩm trong giỏ hàng</p>
          )}
        </div>

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
            />
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>

          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              ✅ Xác nhận đặt hàng
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;