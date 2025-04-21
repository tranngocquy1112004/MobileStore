import React, { useState, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useState để quản lý trạng thái cục bộ, và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện, giúp tối ưu hiệu suất
import "./CheckoutModal.css"; // Import file CSS để định dạng giao diện cho component modal thanh toán này

// --- Component CheckoutModal ---
// Component này hiển thị một hộp thoại (modal) cho phép người dùng xem lại đơn hàng
// và nhập thông tin giao hàng trước khi xác nhận đặt hàng.
// Nhận các props:
// - cart: Mảng chứa danh sách các sản phẩm hiện có trong giỏ hàng của người dùng.
// - totalPrice: Tổng giá trị tiền của tất cả sản phẩm trong giỏ hàng.
// - onConfirm: Hàm sẽ được gọi từ component cha khi người dùng nhấn nút "Xác nhận đặt hàng". Hàm này thường nhận đối tượng thông tin giao hàng làm tham số.
// - onCancel: Hàm sẽ được gọi từ component cha khi người dùng nhấn nút "Hủy" hoặc click ra ngoài modal để đóng nó.
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // --- Hằng số cục bộ ---
  // Chuỗi thông báo hiển thị bên trong modal nếu giỏ hàng trống (tình huống hiếm gặp nếu nút "Mua hàng" bị disabled đúng).
  const EMPTY_CART_MODAL_MESSAGE = "Không có sản phẩm trong giỏ hàng";

  // --- State quản lý thông tin giao hàng người dùng nhập vào form ---
  // State 'shippingInfo' là một đối tượng lưu trữ dữ liệu từ các trường nhập liệu trong form thông tin giao hàng.
  // Giá trị khởi tạo là một object với các thuộc tính 'name', 'address', 'phone' đều là chuỗi rỗng.
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // Lưu trữ Họ và tên người nhận
    address: "", // Lưu trữ Địa chỉ giao hàng chi tiết
    phone: "", // Lưu trữ Số điện thoại liên hệ
  });

  // --- State quản lý các thông báo lỗi xác thực cho từng trường của form ---
  // State 'validationErrors' là một đối tượng, nơi các khóa là tên của các trường form ('name', 'address', 'phone')
  // và giá trị là chuỗi thông báo lỗi tương ứng nếu có lỗi cho trường đó. Nếu không có lỗi, giá trị là chuỗi rỗng hoặc thuộc tính không tồn tại.
  const [validationErrors, setValidationErrors] = useState({});

  // --- Hàm xử lý sự kiện khi giá trị của các trường nhập liệu trong form thay đổi ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại một lần
  // vì không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi sự thay đổi.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target; // Lấy thuộc tính 'name' (tên của input: "name", "address", "phone") và 'value' (giá trị hiện tại của input) từ phần tử đã kích hoạt sự kiện
    // Cập nhật state 'shippingInfo'. Sử dụng functional update để đảm bảo state được cập nhật dựa trên giá trị trước đó.
    // Sao chép tất cả các thuộc tính hiện có của 'shippingInfo' (...prev) và cập nhật giá trị cho thuộc tính có tên [name] thành 'value'.
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    // Xóa thông báo lỗi cho trường input hiện tại ngay khi người dùng bắt đầu gõ vào, để thông báo lỗi biến mất ngay lập tức.
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  }, []); // Mảng dependency rỗng []: Hàm này không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi sự thay đổi.

  // --- Hàm kiểm tra tính hợp lệ của toàn bộ form trước khi submit ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi state 'shippingInfo' thay đổi
  // vì logic kiểm tra dựa trên dữ liệu trong 'shippingInfo'.
  const validateForm = useCallback(() => {
    const errors = {}; // Tạo một đối tượng rỗng để thu thập tất cả các lỗi xác thực tìm thấy
    const { name, address, phone } = shippingInfo; // Lấy các giá trị hiện tại từ state 'shippingInfo'

    // --- Kiểm tra các trường bắt buộc không được để trống (sau khi loại bỏ khoảng trắng ở đầu/cuối) ---
    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên"; // Thêm thông báo lỗi vào object 'errors' nếu trường 'name' trống
    }
    if (!address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng"; // Thêm thông báo lỗi nếu trường 'address' trống
    }
    // Kiểm tra trường số điện thoại: Đầu tiên kiểm tra xem có trống không
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại"; // Thêm thông báo lỗi nếu trường 'phone' trống
    } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      // Nếu không trống, kiểm tra định dạng số điện thoại.
      // Sử dụng Regular Expression (Regex) để kiểm tra định dạng số điện thoại di động Việt Nam.
      // Regex này chấp nhận số bắt đầu bằng '0' hoặc '+84' (có thể có hoặc không), theo sau là một chữ số từ 3, 5, 7, 8, 9, và kết thúc bằng 8 chữ số bất kỳ.
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx"; // Thêm thông báo lỗi và gợi ý định dạng nếu không khớp regex
    }

    setValidationErrors(errors); // Cập nhật state 'validationErrors' với đối tượng 'errors' vừa tạo (chứa tất cả lỗi tìm thấy)
    // Trả về true nếu đối tượng 'errors' không có thuộc tính nào (nghĩa là không có lỗi), ngược lại trả về false.
    return Object.keys(errors).length === 0;
  }, [shippingInfo]); // Mảng dependency: Hàm phụ thuộc vào state 'shippingInfo'.

  // --- Hàm xử lý sự kiện khi form được submit ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi hàm 'validateForm'
  // hoặc hàm 'onConfirm' (từ props) thay đổi.
  const handleSubmit = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit mặc định của form (ngăn trang bị tải lại)
    // Gọi hàm 'validateForm' để kiểm tra tính hợp lệ của dữ liệu trong form.
    if (validateForm()) {
      // Nếu hàm 'validateForm' trả về true (form hợp lệ):
      // Gọi hàm 'onConfirm' được truyền từ component cha, truyền kèm đối tượng 'shippingInfo' (dữ liệu người dùng đã nhập hợp lệ).
      onConfirm(shippingInfo); // 'shippingInfo' được truy cập thông qua closure từ scope của component.
    }
    // Nếu form không hợp lệ, hàm validateForm() sẽ tự động cập nhật state validationErrors
    // và các thông báo lỗi sẽ hiển thị bên cạnh các trường input tương ứng.
  }, [validateForm, onConfirm, shippingInfo]); // Mảng dependency: Hàm phụ thuộc vào hàm 'validateForm' và hàm 'onConfirm' từ props.

  return (
    // --- Overlay cho Modal ---
    // Lớp div này tạo một lớp phủ (overlay) mờ trên toàn màn hình, làm nổi bật modal.
    // Khi click vào lớp phủ này (bên ngoài nội dung modal), sự kiện click sẽ kích hoạt hàm 'onCancel' từ props để đóng modal.
    <div className="modal-overlay" onClick={onCancel}>
      {/* --- Nội dung chính của Modal --- */}
      {/* Đây là container chứa nội dung thực tế của modal. */}
      {/* onClick={(e) => e.stopPropagation()}: Ngăn chặn sự kiện click bên trong modal này
          lan tỏa (propagate) lên lớp 'modal-overlay'. Điều này đảm bảo rằng khi click vào
          bất kỳ đâu bên trong modal, modal sẽ không bị đóng. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2> {/* Tiêu đề của modal */}

        {/* --- Phần tóm tắt thông tin đơn hàng --- */}
        {/* Hiển thị danh sách sản phẩm trong giỏ và tổng tiền trong modal. */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3> {/* Tiêu đề cho phần tóm tắt đơn hàng */}
          {/* Kiểm tra nếu mảng 'cart' có sản phẩm (cart.length > 0) để hiển thị chi tiết đơn hàng */}
          {cart.length > 0 ? (
            <> {/* Sử dụng Fragment để nhóm các phần tử con mà không tạo thêm thẻ HTML cha không cần thiết */}
              {/* Danh sách (unordered list) hiển thị từng sản phẩm trong giỏ hàng */}
              <ul className="cart-items-list">
                {cart.map((item) => ( // Lặp qua từng 'item' trong mảng 'cart'
                  <li key={item.id} className="cart-item"> {/* Mỗi item trong giỏ hàng là một list item */}
                    <span className="item-name">{item.name}</span>{" "} {/* Tên sản phẩm */}
                    <span className="item-quantity">x {item.quantity}</span>{" "} {/* Số lượng sản phẩm */}
                    <span className="item-price">
                      {/* Tính và hiển thị tổng giá của sản phẩm đó (giá * số lượng), định dạng theo tiền tệ Việt Nam */}
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              {/* Hiển thị tổng tiền của toàn bộ đơn hàng */}
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")}{" "} {/* Hiển thị chữ "Tổng tiền" đậm và tổng tiền đã định dạng */}
                VNĐ {/* Đơn vị tiền tệ */}
              </p>
            </>
          ) : (
            // Nếu giỏ hàng rỗng (cart.length === 0), hiển thị thông báo
            <p className="empty-cart-message">{EMPTY_CART_MODAL_MESSAGE}</p> 
          )}
        </div>

        {/* --- Form nhập thông tin giao hàng --- */}
        {/* Thẻ form để người dùng điền thông tin giao hàng. Khi form được submit, hàm handleSubmit sẽ được gọi. */}
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3> {/* Tiêu đề cho phần form thông tin giao hàng */}

          {/* Group input cho Họ và tên */}
          <div className="form-group"> {/* Container cho label và input */}
            <label htmlFor="name">Họ và tên:</label>{" "} {/* Label liên kết với input có id="name" */}
            <input
              type="text" // Kiểu input là text
              id="name" // ID của input (phải khớp với htmlFor của label)
              name="name" // Tên của input, dùng để cập nhật state 'shippingInfo'
              placeholder="Nhập họ và tên người nhận" // Placeholder
              value={shippingInfo.name} // Gán giá trị từ state shippingInfo.name vào input (Controlled Component)
              onChange={handleChange} // Gắn hàm xử lý khi giá trị input thay đổi (đã memoize)
              className={validationErrors.name ? "error" : ""} // Thêm class 'error' nếu có lỗi xác thực cho trường 'name'
              aria-label="Nhập họ và tên người nhận" // Thuộc tính hỗ trợ khả năng tiếp cận cho người dùng sử dụng trình đọc màn hình
              required // Thuộc tính HTML5 yêu cầu trường này không được để trống
            />
            {/* Hiển thị thông báo lỗi nếu có lỗi xác thực cho trường 'name' */}
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span> // Hiển thị nội dung lỗi
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
               required // Thuộc tính HTML5 yêu cầu trường này không được để trống
            />
            {validationErrors.address && (
              <span className="error-message">{validationErrors.address}</span>
            )}
          </div>

          {/* Group input cho Số điện thoại */}
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel" // Loại input 'tel' gợi ý bàn phím số trên thiết bị di động
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại liên hệ"
              value={shippingInfo.phone}
              onChange={handleChange}
              className={validationErrors.phone ? "error" : ""}
              aria-label="Nhập số điện thoại liên hệ"
               required // Thuộc tính HTML5 yêu cầu trường này không được để trống
            />
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>

          {/* --- Nhóm các nút hành động trong modal --- */}
          {/* Container chứa các nút Xác nhận và Hủy */}
          <div className="modal-buttons">
            {/* Nút Xác nhận đặt hàng */}
            <button
              type="submit" // Loại nút là "submit", khi click sẽ kích hoạt sự kiện submit form
              className="confirm-button" // Class CSS để định dạng nút xác nhận
              aria-label="Xác nhận đặt hàng" // Thuộc tính hỗ trợ khả năng tiếp cận
            >
              ✅ Xác nhận đặt hàng {/* Nội dung hiển thị trên nút */}
            </button>
            {/* Nút Hủy bỏ */}
            <button
              type="button" // Quan trọng: Loại nút là "button" để ngăn nút này kích hoạt sự kiện submit form
              className="cancel-button" // Class CSS để định dạng nút hủy
              onClick={onCancel} // Gắn hàm 'onCancel' từ props để đóng modal khi click
              aria-label="Hủy đặt hàng" // Thuộc tính hỗ trợ khả năng tiếp cận
            >
              ❌ Hủy {/* Nội dung hiển thị trên nút */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal; // Export component CheckoutModal để có thể sử dụng ở các file khác (ví dụ: CartPage)