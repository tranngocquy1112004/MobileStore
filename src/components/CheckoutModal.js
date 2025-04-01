// components/CheckoutModal.jsx
import React, { useState } from "react";
import "./CheckoutModal.css";

/**
 * Component CheckoutModal - Hiển thị modal xác nhận thanh toán và thông tin giao hàng
 * 
 * @param {Object} props - Props của component
 * @param {Array} props.cart - Mảng các sản phẩm trong giỏ hàng
 * @param {number} props.totalPrice - Tổng giá trị đơn hàng
 * @param {Function} props.onConfirm - Callback khi xác nhận thanh toán
 * @param {Function} props.onCancel - Callback khi hủy thanh toán
 * @returns {JSX.Element} - Modal thanh toán
 */
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // State lưu thông tin giao hàng
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
  });
  
  // State hiển thị lỗi validate
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Xử lý thay đổi giá trị trong form
   * @param {Event} e - Event từ input field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Cập nhật state
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Kiểm tra tính hợp lệ của form
   * @returns {boolean} - True nếu form hợp lệ, false nếu không
   */
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Kiểm tra tên
    if (!shippingInfo.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên";
      isValid = false;
    }

    // Kiểm tra địa chỉ
    if (!shippingInfo.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng";
      isValid = false;
    }

    // Kiểm tra số điện thoại
    if (!shippingInfo.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(shippingInfo.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  /**
   * Xử lý khi người dùng xác nhận đơn hàng
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra form trước khi submit
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
            <button type="button" className="cancel-button" onClick={onCancel}>
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;