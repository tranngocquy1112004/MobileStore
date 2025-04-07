import React, { useState } from "react";
import "./CheckoutModal.css";

// Component CheckoutModal - Hiển thị modal xác nhận thanh toán
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // Họ và tên người nhận
    address: "", // Địa chỉ giao hàng
    phone: "", // Số điện thoại liên hệ
  });
  const [validationErrors, setValidationErrors] = useState({}); // State lưu lỗi xác thực form

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value })); // Cập nhật thông tin giao hàng
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Xóa lỗi nếu người dùng nhập lại
    }
  };

  // Kiểm tra tính hợp lệ của form
  const validateForm = () => {
    const errors = {};
    const { name, address, phone } = shippingInfo;

    if (!name.trim()) errors.name = "Vui lòng nhập họ và tên"; // Kiểm tra họ tên rỗng
    if (!address.trim()) errors.address = "Vui lòng nhập địa chỉ giao hàng"; // Kiểm tra địa chỉ rỗng
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại"; // Kiểm tra số điện thoại rỗng
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      errors.phone = "Số điện thoại không hợp lệ"; // Kiểm tra định dạng số điện thoại VN
    }

    setValidationErrors(errors); // Cập nhật lỗi vào state
    return Object.keys(errors).length === 0; // Trả về true nếu không có lỗi
  };

  // Xử lý xác nhận đơn hàng
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn form submit mặc định
    if (validateForm()) {
      onConfirm(shippingInfo); // Gọi hàm onConfirm với thông tin giao hàng nếu form hợp lệ
    }
  };

  // Giao diện modal
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2> {/* Tiêu đề modal */}

        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3> {/* Tiêu đề phần thông tin đơn hàng */}
          {cart.length > 0 ? (
            <>
              <ul className="cart-items-list">
                {cart.map((item) => (
                  <li key={item.id} className="cart-item">
                    <span className="item-name">{item.name}</span> {/* Tên sản phẩm */}
                    <span className="item-quantity">x {item.quantity}</span> {/* Số lượng */}
                    <span className="item-price">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ {/* Tổng giá từng sản phẩm */}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")} VNĐ {/* Tổng tiền đơn hàng */}
              </p>
            </>
          ) : (
            <p className="empty-cart-message">Không có sản phẩm trong giỏ hàng</p> // Thông báo nếu giỏ hàng rỗng
          )}
        </div>

        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3> {/* Tiêu đề phần thông tin giao hàng */}

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
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span> // Hiển thị lỗi nếu có
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
              className={validationErrors.address ? "error" : ""} // Thêm class error nếu có lỗi
            />
            {validationErrors.address && (
              <span className="error-message">{validationErrors.address}</span> // Hiển thị lỗi nếu có
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
              className={validationErrors.phone ? "error" : ""} // Thêm class error nếu có lỗi
            />
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span> // Hiển thị lỗi nếu có
            )}
          </div>

          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              ✅ Xác nhận đặt hàng {/* Nút xác nhận */}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel} // Đóng modal khi nhấn
            >
              ❌ Hủy {/* Nút hủy */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal; // Xuất component để sử dụng ở nơi khác