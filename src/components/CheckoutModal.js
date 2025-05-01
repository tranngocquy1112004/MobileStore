// Import necessary React hooks: useState, useCallback
import React, { useState, useCallback } from "react";
// Import the CSS file for styling
import "./CheckoutModal.css";

// --- CheckoutModal Component ---
// Displays a modal for confirming checkout.
// Receives props: cart (array), totalPrice (number), onConfirm (function), onCancel (function).
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // --- Local Constant ---
  const EMPTY_CART_MODAL_MESSAGE = "Không có sản phẩm trong giỏ hàng để thanh toán.";

  // --- State for shipping information form ---
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // Recipient's name
    address: "", // Shipping address
    phone: "", // Contact phone number
  });

  // --- State for validation errors ---
  const [validationErrors, setValidationErrors] = useState({}); // Stores error messages per field

  // --- Handler for input changes ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value })); // Update shippingInfo state
    setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for this field
  }, []); // No external dependencies needed

  // --- Function to validate the form ---
  const validateForm = useCallback(() => {
    const errors = {};
    const { name, address, phone } = shippingInfo;

    // Check required fields
    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên";
    }
    if (!address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng";
    }
    // Validate phone number format (Vietnamese mobile number Regex)
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx";
    }

    setValidationErrors(errors); // Update validationErrors state
    return Object.keys(errors).length === 0; // Return true if no errors
  }, [shippingInfo]); // Depends on shippingInfo state

  // --- Handler for form submission ---
  const handleSubmit = useCallback((e) => {
    e.preventDefault(); // Prevent default browser form submission
    // Validate form and call onConfirm if valid
    if (validateForm()) {
      onConfirm(shippingInfo); // Call parent's confirm function with shipping info
    }
    // If invalid, validateForm already updated the error state
  }, [validateForm, onConfirm, shippingInfo]); // Depends on validateForm, onConfirm, and shippingInfo

  return (
    // --- Modal Overlay ---
    // Clicking on the overlay calls onCancel to close the modal.
    <div className="modal-overlay" onClick={onCancel}>
      {/* --- Main Modal Content --- */}
      {/* Stop propagation to prevent clicks inside from closing the modal via the overlay. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2> {/* Modal title */}

        {/* --- Order Summary Section --- */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3> {/* Section title */}
          {Array.isArray(cart) && cart.length > 0 ? (
            <div>
              <ul className="cart-items-list">
                {Array.isArray(cart) && cart.map((item, index) => ( 
                  <li key={item.id || index} className="cart-item">
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
          ) : (
            // If cart is empty, display message
            <p className="empty-cart-message">{EMPTY_CART_MODAL_MESSAGE}</p>
          )}
        </div>

        {/* --- Shipping Information Form --- */}
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3> {/* Section title */}

          {/* Input group for Name */}
          <div className="form-group">
            <label htmlFor="name">Họ và tên:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nhập họ và tên người nhận"
              value={shippingInfo.name} // Controlled component
              onChange={handleChange} // Attach handler
              className={validationErrors.name ? "error" : ""} // Conditional error class
              aria-label="Nhập họ và tên người nhận"
              required // HTML5 validation
            />
            {/* Display error message */}
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
          </div>

          {/* Input group for Address */}
          <div className="form-group">
            <label htmlFor="address">Địa chỉ:</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Nhập địa chỉ giao hàng chi tiết"
              value={shippingInfo.address} // Controlled component
              onChange={handleChange} // Attach handler
              className={validationErrors.address ? "error" : ""} // Conditional error class
              aria-label="Nhập địa chỉ giao hàng"
              required // HTML5 validation
            />
            {/* Display error message */}
            {validationErrors.address && (
              <span className="error-message">{validationErrors.address}</span>
            )}
          </div>

          {/* Input group for Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel" // Suggests numeric keyboard on mobile
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại liên hệ"
              value={shippingInfo.phone} // Controlled component
              onChange={handleChange} // Attach handler
              className={validationErrors.phone ? "error" : ""} // Conditional error class
              aria-label="Nhập số điện thoại liên hệ"
              required // HTML5 validation
            />
            {/* Display error message */}
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>

          {/* --- Action Buttons Group --- */}
          <div className="modal-buttons">
            {/* Confirm Order button (submits the form) */}
            <button
              type="submit" // Triggers form submit event
              className="confirm-button"
              aria-label="Xác nhận đặt hàng"
               // Add disabled={Array.isArray(cart) && cart.length === 0} if relying solely on modal button state
            >
              ✅ Xác nhận đặt hàng
            </button>
            {/* Cancel button */}
            <button
              type="button" // Prevents form submission
              className="cancel-button"
              onClick={onCancel} // Call onCancel prop
              aria-label="Hủy đặt hàng"
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