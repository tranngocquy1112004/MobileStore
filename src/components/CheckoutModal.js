// Import React và useState hook từ thư viện React
import React, { useState } from "react";
// Import file CSS cho component
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
  // State lưu thông tin giao hàng với các trường ban đầu rỗng
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
  });
  
  // State lưu các thông báo lỗi validate form
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Xử lý thay đổi giá trị trong form
   * @param {Event} e - Event từ input field
   */
  const handleChange = (e) => {
    // Lấy name và value từ input thay đổi
    const { name, value } = e.target;
    
    // Cập nhật state shippingInfo với giá trị mới
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    
    // Nếu trường này đang có lỗi thì xóa lỗi khi người dùng bắt đầu nhập
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

    // Validate tên - không được để trống
    if (!shippingInfo.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên";
      isValid = false;
    }

    // Validate địa chỉ - không được để trống
    if (!shippingInfo.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng";
      isValid = false;
    }

    // Validate số điện thoại
    if (!shippingInfo.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(shippingInfo.phone)) {
      // Kiểm tra định dạng số điện thoại Việt Nam
      errors.phone = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    // Cập nhật state validationErrors
    setValidationErrors(errors);
    return isValid;
  };

  /**
   * Xử lý khi người dùng xác nhận đơn hàng
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    
    // Chỉ gọi onConfirm nếu form hợp lệ
    if (validateForm()) {
      onConfirm(shippingInfo);
    }
  };

  // Render component
  return (
    // Overlay modal, click bên ngoài sẽ gọi onCancel
    <div className="modal-overlay" onClick={onCancel}>
      {/* Nội dung modal, stopPropagation để click bên trong không trigger overlay */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Tiêu đề modal */}
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2>
        
        {/* Phần tóm tắt đơn hàng */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3>
          {/* Kiểm tra nếu có sản phẩm trong giỏ */}
          {cart.length > 0 ? (
            <>
              {/* Danh sách sản phẩm */}
              <ul className="cart-items-list">
                {cart.map((item) => (
                  <li key={item.id} className="cart-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x {item.quantity}</span>
                    <span className="item-price">
                      {/* Hiển thị giá theo định dạng tiền Việt Nam */}
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              {/* Tổng giá trị đơn hàng */}
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")} VNĐ
              </p>
            </>
          ) : (
            /* Thông báo khi giỏ hàng trống */
            <p className="empty-cart-message">Không có sản phẩm trong giỏ hàng</p>
          )}
        </div>
        
        {/* Form thông tin giao hàng */}
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3>
          
          {/* Nhóm input họ tên */}
          <div className="form-group">
            <label htmlFor="name">Họ và tên:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nhập họ và tên người nhận"
              value={shippingInfo.name}
              onChange={handleChange}
              className={validationErrors.name ? "error" : ""} // Thêm class error nếu có lỗi
            />
            {/* Hiển thị thông báo lỗi nếu có */}
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
          </div>
          
          {/* Nhóm input địa chỉ */}
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
          
          {/* Nhóm input số điện thoại */}
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
          
          {/* Nhóm button hành động */}
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

// Export component CheckoutModal
export default CheckoutModal;