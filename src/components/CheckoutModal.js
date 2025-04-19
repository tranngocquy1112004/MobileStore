import React, { useState, useCallback } from "react"; // Import các hook cần thiết từ React: useState để quản lý state, useCallback để memoize hàm
import "./CheckoutModal.css"; // Import file CSS để định dạng giao diện modal thanh toán

// --- Component CheckoutModal ---
// Hiển thị một modal để người dùng xác nhận đơn hàng và nhập thông tin giao hàng
// Nhận các props:
// - cart: danh sách các sản phẩm trong giỏ hàng
// - totalPrice: tổng giá trị của giỏ hàng
// - onConfirm: hàm sẽ được gọi khi người dùng xác nhận thanh toán (truyền kèm thông tin giao hàng)
// - onCancel: hàm sẽ được gọi khi người dùng hủy bỏ modal
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // --- Hằng số cục bộ ---
  // Thông báo hiển thị khi giỏ hàng rỗng trong modal checkout
  const EMPTY_CART_MODAL_MESSAGE = "Không có sản phẩm trong giỏ hàng";

  // --- State quản lý thông tin giao hàng người dùng nhập vào form ---
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // State lưu Họ và tên người nhận (ban đầu rỗng)
    address: "", // State lưu Địa chỉ giao hàng chi tiết (ban đầu rỗng)
    phone: "", // State lưu Số điện thoại liên hệ (ban đầu rỗng)
  });

  // --- State quản lý các thông báo lỗi xác thực cho từng trường của form ---
  // Object này có key là tên trường (name, address, phone) và value là chuỗi thông báo lỗi tương ứng
  const [validationErrors, setValidationErrors] = useState({});

  // --- Hàm xử lý sự kiện khi giá trị của các input trong form thay đổi ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi các dependencies thay đổi (ở đây là không có)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target; // Lấy tên (name) và giá trị (value) của input đang thay đổi
    // Cập nhật state shippingInfo: giữ lại các giá trị cũ (...prev), chỉ cập nhật giá trị
    // của trường có tên (name) tương ứng với giá trị mới (value).
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    // Xóa thông báo lỗi cho trường input hiện tại ngay khi người dùng bắt đầu gõ
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  }, []); // Dependency array rỗng: hàm không phụ thuộc vào biến nào cần theo dõi từ scope ngoài

  // --- Hàm kiểm tra tính hợp lệ của toàn bộ form trước khi submit ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi 'shippingInfo' thay đổi
  const validateForm = useCallback(() => {
    const errors = {}; // Tạo một object rỗng để lưu trữ các lỗi tìm thấy
    const { name, address, phone } = shippingInfo; // Lấy thông tin từ state shippingInfo

    // --- Kiểm tra các trường bắt buộc không được để trống ---
    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên"; // Thêm lỗi nếu tên rỗng hoặc chỉ chứa khoảng trắng
    }
    if (!address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng"; // Thêm lỗi nếu địa chỉ rỗng
    }
    // Kiểm tra số điện thoại rỗng trước
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại"; // Thêm lỗi nếu số điện thoại rỗng
    } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone)) { // Regex kiểm tra định dạng SĐT VN (có thể bắt đầu bằng 0 hoặc +84, theo sau là 8 số)
      // Nếu không rỗng, kiểm tra định dạng số điện thoại Việt Nam bằng Regular Expression (regex)
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx"; // Thêm lỗi nếu định dạng không khớp và gợi ý định dạng
    }

    setValidationErrors(errors); // Cập nhật state validationErrors với các lỗi tìm được
    // Trả về true nếu object errors rỗng (nghĩa là không có lỗi nào), ngược lại trả về false
    return Object.keys(errors).length === 0;
  }, [shippingInfo]); // Dependency array: hàm phụ thuộc vào state 'shippingInfo' để kiểm tra validation

  // --- Hàm xử lý sự kiện khi form được submit ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi 'validateForm' hoặc 'onConfirm' thay đổi.
  const handleSubmit = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit mặc định của form (trang không bị reload)
    // Gọi hàm validateForm để kiểm tra tính hợp lệ của form
    if (validateForm()) {
      // Nếu form hợp lệ, gọi hàm onConfirm được truyền từ props, truyền kèm thông tin giao hàng
      onConfirm(shippingInfo); // shippingInfo được closure giữ lại từ scope ngoài
    }
  }, [validateForm, onConfirm, shippingInfo]); // Dependency array: hàm phụ thuộc vào hàm validateForm và hàm onConfirm từ props.

  return (
    // --- Overlay cho Modal ---
    // Overlay bao phủ toàn màn hình, tạo hiệu ứng nền mờ.
    // onClick={onCancel}: Khi click vào overlay (bên ngoài nội dung modal), gọi hàm onCancel để đóng modal.
    <div className="modal-overlay" onClick={onCancel}>
      {/* --- Nội dung chính của Modal --- */}
      {/* onClick={(e) => e.stopPropagation()}: Ngăn chặn sự kiện click từ modal-content
          lan tỏa (propagate) lên lớp modal-overlay, để click vào nội dung modal không làm đóng modal. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2> {/* Tiêu đề của modal */}

        {/* --- Phần tóm tắt thông tin đơn hàng --- */}
        {/* Hiển thị danh sách sản phẩm trong giỏ và tổng tiền */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3> {/* Tiêu đề phần tóm tắt */}
          {/* Kiểm tra nếu giỏ hàng có sản phẩm để hiển thị chi tiết */}
          {cart.length > 0 ? (
            <> {/* Sử dụng Fragment */}
              {/* Danh sách các sản phẩm trong giỏ hàng hiển thị trong modal */}
              <ul className="cart-items-list">
                {cart.map((item) => ( // Map qua mảng 'cart'
                  <li key={item.id} className="cart-item">
                    <span className="item-name">{item.name}</span>{" "}
                    {/* Tên sản phẩm */}
                    <span className="item-quantity">x {item.quantity}</span>{" "}
                    {/* Số lượng */}
                    <span className="item-price">
                      {/* Tổng giá của sản phẩm đó (giá * số lượng), định dạng tiền tệ VN */}
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              {/* Hiển thị tổng tiền của toàn bộ đơn hàng */}
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")}{" "}
                VNĐ {/* Tổng tiền, định dạng tiền tệ VN */}
              </p>
            </>
          ) : (
            // Hiển thị thông báo nếu giỏ hàng trống (dù nút "Mua hàng" nên bị disabled trong trường hợp này)
            <p className="empty-cart-message">{EMPTY_CART_MODAL_MESSAGE}</p>
          )}
        </div>

        {/* --- Form nhập thông tin giao hàng --- */}
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3> {/* Tiêu đề phần form */}

          {/* Group input cho Họ và tên */}
          <div className="form-group">
            <label htmlFor="name">Họ và tên:</label>{" "}
            {/* Label liên kết với input bằng thuộc tính 'htmlFor' và 'id' */}
            <input
              type="text"
              id="name" // ID của input
              name="name" // Tên input, dùng để cập nhật state
              placeholder="Nhập họ và tên người nhận"
              value={shippingInfo.name} // Gán giá trị từ state shippingInfo.name
              onChange={handleChange} // Gắn hàm xử lý khi giá trị input thay đổi
              className={validationErrors.name ? "error" : ""} // Thêm class 'error' nếu có lỗi xác thực cho trường này
              aria-label="Nhập họ và tên người nhận" // Aria label cho khả năng tiếp cận
            />
            {/* Hiển thị thông báo lỗi nếu có lỗi cho trường 'name' */}
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
          </div>

          {/* Group input cho Địa chỉ */}
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
            />
            {validationErrors.address && (
              <span className="error-message">{validationErrors.address}</span>
            )}
          </div>

          {/* Group input cho Số điện thoại */}
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel" // Loại input tel gợi ý bàn phím số trên thiết bị di động
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại liên hệ"
              value={shippingInfo.phone}
              onChange={handleChange}
              className={validationErrors.phone ? "error" : ""}
              aria-label="Nhập số điện thoại liên hệ"
            />
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>

          {/* --- Nhóm các nút hành động trong modal --- */}
          <div className="modal-buttons">
            {/* Nút Xác nhận đặt hàng (submit form) */}
            <button
              type="submit" // Type="submit" để kích hoạt sự kiện submit form
              className="confirm-button"
              aria-label="Xác nhận đặt hàng"
            >
              ✅ Xác nhận đặt hàng
            </button>
            {/* Nút Hủy bỏ (đóng modal) */}
            <button
              type="button" // Quan trọng: đặt type="button" để ngăn nút này submit form
              className="cancel-button"
              onClick={onCancel} // Gắn hàm onCancel từ props
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

export default CheckoutModal; // Export component để sử dụng ở nơi khác (ví dụ: CartPage)