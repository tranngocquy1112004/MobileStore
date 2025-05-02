// src/components/CheckoutModal.js

// Import necessary React hooks: useState, useCallback
import React, { useState, useCallback } from "react";
// Import the CSS file for styling
import "./CheckoutModal.css";

// --- Component CheckoutModal ---
// Hiển thị một modal để xác nhận thanh toán.
// Nhận các props: cart (mảng sản phẩm), totalPrice (số), onConfirm (hàm), onCancel (hàm).
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // --- Hằng số cục bộ ---
  const EMPTY_CART_MODAL_MESSAGE = "Không có sản phẩm trong giỏ hàng để thanh toán.";

  // --- State cho form nhập thông tin giao hàng ---
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // Tên người nhận
    address: "", // Địa chỉ giao hàng
    phone: "", // Số điện thoại liên hệ
  });

  // --- State cho các lỗi validation ---
  // Lưu trữ các thông báo lỗi cho từng trường input (key là tên trường, value là thông báo lỗi)
  const [validationErrors, setValidationErrors] = useState({});

  // --- Handler cho sự kiện thay đổi input ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Cập nhật state shippingInfo, sử dụng functional update để đảm bảo lấy giá trị state mới nhất
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi validation cho trường input hiện tại khi người dùng bắt đầu nhập
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  }, []); // Không phụ thuộc vào biến nào từ scope ngoài cần theo dõi sự thay đổi

  // --- Hàm validation form ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const validateForm = useCallback(() => {
    const errors = {}; // Đối tượng lưu trữ các lỗi tìm thấy
    const { name, address, phone } = shippingInfo; // Lấy thông tin từ state shippingInfo

    // Kiểm tra các trường bắt buộc (không được rỗng sau khi loại bỏ khoảng trắng ở đầu/cuối)
    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên.";
    }
    if (!address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng.";
    }

    // Kiểm tra và validate định dạng số điện thoại (Regex cho số điện thoại Việt Nam)
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) { // Thêm trim() cho phone
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.";
    }

    // Cập nhật state validationErrors với các lỗi tìm thấy
    setValidationErrors(errors);
    // Trả về true nếu không có lỗi nào (số lượng key trong đối tượng errors là 0)
    return Object.keys(errors).length === 0;
  }, [shippingInfo]); // Phụ thuộc vào state shippingInfo để kiểm tra giá trị hiện tại

  // --- Handler cho việc submit form ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const handleSubmit = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit form mặc định của trình duyệt

    // Thực hiện validation form. Nếu form hợp lệ:
    if (validateForm()) {
      // Gọi hàm onConfirm (được truyền từ component cha) và truyền thông tin giao hàng
      onConfirm(shippingInfo);
    }
    // Nếu form không hợp lệ, hàm validateForm đã tự động cập nhật state validationErrors
  }, [validateForm, onConfirm, shippingInfo]); // Phụ thuộc vào validateForm, onConfirm, và shippingInfo

  // Kiểm tra nếu giỏ hàng rỗng để hiển thị thông báo thay vì form
  const isCartEmpty = !Array.isArray(cart) || cart.length === 0;

  return (
    // --- Lớp phủ Modal ---
    // Click vào lớp phủ sẽ gọi hàm onCancel để đóng modal.
    <div className="modal-overlay" onClick={onCancel}>
      {/* --- Nội dung chính của Modal --- */}
      {/* Ngăn chặn sự kiện click lan truyền từ nội dung modal ra lớp phủ */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2> {/* Tiêu đề Modal */}

        {/* --- Phần Tóm tắt đơn hàng --- */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3> {/* Tiêu đề phần */}
          {isCartEmpty ? (
            // Nếu giỏ hàng rỗng, hiển thị thông báo
            <p className="empty-cart-message">{EMPTY_CART_MODAL_MESSAGE}</p>
          ) : (
            // Nếu giỏ hàng có sản phẩm, hiển thị danh sách và tổng tiền
            <div>
              <ul className="cart-items-list">
                {/* Đảm bảo cart là mảng trước khi map */}
                {Array.isArray(cart) && cart.map((item, index) => (
                   // Sử dụng item.id làm key, fallback về index nếu thiếu id (ít lý tưởng hơn)
                  <li key={item?.id || index} className="cart-item">
                    {/* Hiển thị thông tin sản phẩm an toàn */}
                    <span className="item-name">{item?.name || 'Sản phẩm không rõ'}</span>
                    <span className="item-quantity">x {item?.quantity || 0}</span>
                    <span className="item-price">
                      {/* Tính và định dạng giá an toàn */}
                      {((item?.price || 0) * (item?.quantity || 0)).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              <p className="total-price">
                {/* Hiển thị tổng tiền an toàn và định dạng */}
                <strong>Tổng tiền:</strong> {(totalPrice || 0).toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          )}
        </div>

        {/* --- Form Thông tin giao hàng --- */}
        {/* Chỉ hiển thị form nếu giỏ hàng KHÔNG rỗng */}
        {!isCartEmpty && (
          <form onSubmit={handleSubmit} className="shipping-form">
            <h3>🚚 Thông tin giao hàng</h3> {/* Tiêu đề phần */}

            {/* Input group cho Tên */}
            <div className="form-group">
              <label htmlFor="name">Họ và tên:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nhập họ và tên người nhận"
                value={shippingInfo.name} // Controlled component
                onChange={handleChange} // Gắn handler thay đổi
                className={validationErrors.name ? "error" : ""} // Thêm class 'error' nếu có lỗi validation cho trường này
                aria-label="Nhập họ và tên người nhận"
                required // Sử dụng validation của HTML5 (tùy chọn, vì đã có validation bằng JS)
              />
              {/* Hiển thị thông báo lỗi validation nếu có */}
              {validationErrors.name && (
                <span className="error-message">{validationErrors.name}</span>
              )}
            </div>

            {/* Input group cho Địa chỉ */}
            <div className="form-group">
              <label htmlFor="address">Địa chỉ:</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Nhập địa chỉ giao hàng chi tiết"
                value={shippingInfo.address} // Controlled component
                onChange={handleChange} // Gắn handler thay đổi
                className={validationErrors.address ? "error" : ""} // Thêm class 'error' nếu có lỗi validation cho trường này
                aria-label="Nhập địa chỉ giao hàng"
                required // Sử dụng validation của HTML5
              />
              {/* Hiển thị thông báo lỗi validation nếu có */}
              {validationErrors.address && (
                <span className="error-message">{validationErrors.address}</span>
              )}
            </div>

            {/* Input group cho Số điện thoại */}
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại:</label>
              <input
                type="tel" // Gợi ý bàn phím số trên thiết bị di động
                id="phone"
                name="phone"
                placeholder="Nhập số điện thoại liên hệ"
                value={shippingInfo.phone} // Controlled component
                onChange={handleChange} // Gắn handler thay đổi
                className={validationErrors.phone ? "error" : ""} // Thêm class 'error' nếu có lỗi validation cho trường này
                aria-label="Nhập số điện thoại liên hệ"
                required // Sử dụng validation của HTML5
              />
              {/* Hiển thị thông báo lỗi validation nếu có */}
              {validationErrors.phone && (
                <span className="error-message">{validationErrors.phone}</span>
              )}
            </div>

            {/* --- Nhóm các nút hành động --- */}
            <div className="modal-buttons">
              {/* Nút Xác nhận đặt hàng (submit form) */}
              <button
                type="submit" // Kích hoạt sự kiện submit form
                className="confirm-button"
                aria-label="Xác nhận đặt hàng"
                 // Có thể thêm disabled={isCartEmpty} nếu muốn nút này cũng bị disabled khi giỏ hàng rỗng
              >
                ✅ Xác nhận đặt hàng
              </button>
              {/* Nút Hủy */}
              <button
                type="button" // Ngăn nút này submit form
                className="cancel-button"
                onClick={onCancel} // Gọi hàm onCancel
                aria-label="Hủy đặt hàng"
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        )}

      </div> {/* Kết thúc modal-content */}
    </div> // Kết thúc modal-overlay
  );
};

export default CheckoutModal; // Export component
