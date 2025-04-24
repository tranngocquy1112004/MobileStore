import React, { useState, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useState để quản lý trạng thái cục bộ của form (thông tin giao hàng, lỗi xác thực), và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện (handleChange, validateForm, handleSubmit), giúp tối ưu hiệu suất và tránh re-render không cần thiết của component con (nếu có) hoặc chính modal
import "./CheckoutModal.css"; // Import file CSS để định dạng giao diện cho component modal thanh toán này

// --- Component CheckoutModal ---
// Component này hiển thị một hộp thoại (modal) cho phép người dùng xem lại các mặt hàng trong giỏ hàng
// và nhập thông tin giao hàng (tên, địa chỉ, số điện thoại) trước khi xác nhận đặt hàng cuối cùng.
// Nhận các props từ component cha (thường là CartPage):
// - cart: Mảng chứa danh sách các sản phẩm hiện có trong giỏ hàng của người dùng.
// - totalPrice: Tổng giá trị tiền của tất cả sản phẩm trong giỏ hàng.
// - onConfirm: Hàm callback sẽ được gọi từ component cha khi người dùng nhấn nút "Xác nhận đặt hàng" và form hợp lệ. Hàm này thường nhận đối tượng thông tin giao hàng đã nhập làm tham số.
// - onCancel: Hàm callback sẽ được gọi từ component cha khi người dùng nhấn nút "Hủy" hoặc click ra ngoài modal để đóng nó.
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // --- Hằng số cục bộ ---
  // Chuỗi thông báo hiển thị bên trong modal nếu danh sách sản phẩm trong giỏ hàng trống.
  // Tình huống này hiếm gặp nếu nút "Mua hàng" trên trang giỏ hàng bị disabled đúng khi giỏ trống,
  // nhưng vẫn cần xử lý để đảm bảo giao diện nhất quán.
  const EMPTY_CART_MODAL_MESSAGE = "Không có sản phẩm trong giỏ hàng để thanh toán."; // Làm rõ hơn thông báo

  // --- State quản lý thông tin giao hàng người dùng nhập vào form ---
  // State 'shippingInfo' là một đối tượng lưu trữ dữ liệu từ các trường nhập liệu trong form thông tin giao hàng.
  // Giá trị khởi tạo là một object với các thuộc tính 'name', 'address', 'phone' đều là chuỗi rỗng, phản ánh trạng thái ban đầu của form.
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // Lưu trữ Họ và tên người nhận
    address: "", // Lưu trữ Địa chỉ giao hàng chi tiết
    phone: "", // Lưu trữ Số điện thoại liên hệ
  });

  // --- State quản lý các thông báo lỗi xác thực cho từng trường của form ---
  // State 'validationErrors' là một đối tượng, nơi các khóa là tên của các trường form ('name', 'address', 'phone')
  // và giá trị là chuỗi thông báo lỗi tương ứng nếu có lỗi cho trường đó. Nếu không có lỗi cho một trường, giá trị là chuỗi rỗng hoặc thuộc tính đó không tồn tại trong object.
  // State này giúp kiểm soát việc hiển thị thông báo lỗi xác thực bên cạnh các trường input.
  const [validationErrors, setValidationErrors] = useState({});

  // --- Hàm xử lý sự kiện khi giá trị của các trường nhập liệu trong form thay đổi ---
  // Hàm này được gắn vào sự kiện 'onChange' của mỗi input trong form.
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại một lần
  // vì không phụ thuộc vào bất kỳ biến hoặc state nào từ scope ngoài cần theo dõi sự thay đổi để hàm hoạt động đúng.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target; // Lấy thuộc tính 'name' (tên của input: "name", "address", "phone") và 'value' (giá trị hiện tại của input) từ phần tử input đã kích hoạt sự kiện change
    // Cập nhật state 'shippingInfo'. Sử dụng functional update (prev => ...) để đảm bảo state được cập nhật dựa trên giá trị state trước đó.
    // Tạo một bản sao của đối tượng 'shippingInfo' hiện tại (...prev) và cập nhật giá trị cho thuộc tính có tên [name] thành 'value' mới nhập.
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    // Xóa thông báo lỗi cho trường input hiện tại ngay khi người dùng bắt đầu gõ vào (giá trị của trường đó thay đổi), để thông báo lỗi biến mất ngay lập tức và không gây khó chịu.
    setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Đặt thông báo lỗi của trường [name] về chuỗi rỗng.
  }, []); // Mảng dependency rỗng []: Hàm này không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi sự thay đổi để hàm hoạt động.

  // --- Hàm kiểm tra tính hợp lệ của toàn bộ form trước khi submit ---
  // Hàm này thực hiện validation dữ liệu người dùng đã nhập vào form.
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi state 'shippingInfo' thay đổi
  // vì logic kiểm tra dựa trên dữ liệu hiện tại trong 'shippingInfo'.
  const validateForm = useCallback(() => {
    const errors = {}; // Tạo một đối tượng rỗng để thu thập tất cả các lỗi xác thực tìm thấy. Khóa sẽ là tên trường, giá trị là thông báo lỗi.
    const { name, address, phone } = shippingInfo; // Lấy các giá trị hiện tại của các trường từ state 'shippingInfo' để kiểm tra.

    // --- Kiểm tra các trường bắt buộc không được để trống (sau khi loại bỏ khoảng trắng ở đầu/cuối) ---
    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên"; // Thêm thông báo lỗi vào object 'errors' nếu trường 'name' trống sau khi trim().
    }
    if (!address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng"; // Thêm thông báo lỗi nếu trường 'address' trống sau khi trim().
    }
    // Kiểm tra trường số điện thoại:
    // 1. Kiểm tra xem có trống không
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại"; // Thêm thông báo lỗi nếu trường 'phone' trống sau khi trim().
    } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      // 2. Nếu không trống, kiểm tra định dạng số điện thoại.
      // Sử dụng Regular Expression (Regex) để kiểm tra định dạng số điện thoại di động Việt Nam.
      // Regex này chấp nhận số bắt đầu bằng '0' hoặc '+84' (có thể có hoặc không), theo sau là một chữ số từ 3, 5, 7, 8, 9, và kết thúc bằng 8 chữ số bất kỳ.
      // .test(phone) sẽ trả về true nếu chuỗi 'phone' khớp với regex, ngược lại là false.
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx"; // Thêm thông báo lỗi và gợi ý định dạng nếu không khớp regex.
    }

    // Cập nhật state 'validationErrors' với đối tượng 'errors' vừa tạo (chứa tất cả lỗi tìm thấy).
    // Việc cập nhật state này sẽ khiến component re-render và hiển thị các thông báo lỗi tương ứng trên UI.
    setValidationErrors(errors);
    // Trả về true nếu đối tượng 'errors' không có thuộc tính nào (nghĩa là không có lỗi), ngược lại trả về false.
    // Sử dụng Object.keys(errors).length để kiểm tra số lượng thuộc tính trong object errors.
    return Object.keys(errors).length === 0;
  }, [shippingInfo]); // Mảng dependency: Hàm phụ thuộc vào state 'shippingInfo'. Khi shippingInfo thay đổi, hàm validateForm sẽ được tạo lại để sử dụng giá trị mới nhất.

  // --- Hàm xử lý sự kiện khi form được submit ---
  // Hàm này được gắn vào sự kiện 'onSubmit' của thẻ <form>.
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi hàm 'validateForm'
  // hoặc hàm 'onConfirm' (được truyền từ props) thay đổi.
  const handleSubmit = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit mặc định của trình duyệt (ngăn trang bị tải lại).
    // Gọi hàm 'validateForm' để kiểm tra tính hợp lệ của dữ liệu trong form trước khi xử lý.
    if (validateForm()) {
      // Nếu hàm 'validateForm' trả về true (nghĩa là toàn bộ form hợp lệ):
      // Gọi hàm 'onConfirm' được truyền từ component cha, truyền kèm đối tượng 'shippingInfo'
      // (chứa dữ liệu người dùng đã nhập và đã được xác thực hợp lệ).
      // shippingInfo được truy cập thông qua closure từ scope của component CheckoutModal.
      onConfirm(shippingInfo);
    }
    // Nếu form không hợp lệ (validateForm() trả về false), hàm validateForm() đã tự động cập nhật state validationErrors
    // và các thông báo lỗi sẽ hiển thị bên cạnh các trường input tương ứng trên UI. Hàm handleSubmit sẽ dừng tại đây.
  }, [validateForm, onConfirm, shippingInfo]); // Mảng dependency: Hàm phụ thuộc vào hàm 'validateForm' (để gọi validation), hàm 'onConfirm' (để gọi callback khi thành công), và state 'shippingInfo' (để truyền dữ liệu form đi).

  return (
    // --- Overlay cho Modal ---
    // Lớp div này tạo một lớp phủ (overlay) mờ trên toàn màn hình, làm nổi bật modal và ngăn tương tác với nội dung bên dưới.
    // Khi click vào lớp phủ này (bên ngoài nội dung modal), sự kiện click sẽ kích hoạt hàm 'onCancel' từ props để đóng modal.
    <div className="modal-overlay" onClick={onCancel}>
      {/* --- Nội dung chính của Modal --- */}
      {/* Đây là container chứa nội dung thực tế của modal (tóm tắt đơn hàng, form, nút). */}
      {/* onClick={(e) => e.stopPropagation()}: Gắn sự kiện này vào nội dung modal.
          Phương thức stopPropagation() trên đối tượng sự kiện (e) ngăn chặn sự kiện click bên trong modal này
          lan tỏa (propagate) lên các phần tử cha, đặc biệt là lớp 'modal-overlay'.
          Điều này đảm bảo rằng khi click vào bất kỳ đâu bên trong modal, sự kiện click sẽ không
          đến được lớp overlay và kích hoạt hàm onCancel để đóng modal. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2>{" "}
        {/* Tiêu đề của modal */}
        {/* --- Phần tóm tắt thông tin đơn hàng --- */}
        {/* Container hiển thị danh sách sản phẩm trong giỏ và tổng tiền trong modal. */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3>{" "}
          {/* Tiêu đề cho phần tóm tắt đơn hàng */}
          {/* Conditional Rendering: Kiểm tra nếu mảng 'cart' có sản phẩm (cart.length > 0) để hiển thị chi tiết đơn hàng */}
          {cart && cart.length > 0 ? ( // Kiểm tra cart tồn tại và có phần tử
            <>
              {" "}
              {/* Sử dụng Fragment để nhóm các phần tử con (ul, p) mà không tạo thêm thẻ HTML cha không cần thiết trong DOM */}
              {/* Danh sách (unordered list) hiển thị từng sản phẩm trong giỏ hàng */}
              <ul className="cart-items-list">
                {cart.map((item) => (
                  // Lặp qua từng 'item' trong mảng 'cart' để tạo một list item cho mỗi sản phẩm
                  <li key={item.id} className="cart-item">
                    {" "}
                    {/* Mỗi item trong giỏ hàng là một list item. key={item.id} là quan trọng cho hiệu suất của React khi render danh sách */}
                    <span className="item-name">{item.name}</span>{" "}
                    {/* Tên sản phẩm */}
                    <span className="item-quantity">x {item.quantity}</span>{" "}
                    {/* Số lượng sản phẩm */}
                    <span className="item-price">
                      {/* Tính và hiển thị tổng giá của sản phẩm đó (giá * số lượng), định dạng theo tiền tệ Việt Nam */}
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              {/* Hiển thị tổng tiền của toàn bộ đơn hàng */}
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")}{" "}
                {/* Hiển thị chữ "Tổng tiền" đậm và tổng tiền đã định dạng theo tiền tệ Việt Nam */}
                VNĐ{" "}
                {/* Đơn vị tiền tệ */}
              </p>
            </>
          ) : (
            // Conditional Rendering: Nếu giỏ hàng trống (cart.length === 0 hoặc cart là null/undefined), hiển thị thông báo
            <p className="empty-cart-message">{EMPTY_CART_MODAL_MESSAGE}</p>
          )}
        </div>
        {/* --- Form nhập thông tin giao hàng --- */}
        {/* Thẻ form để người dùng điền thông tin giao hàng. Khi form được submit (ví dụ: nhấn nút type="submit"), hàm handleSubmit (đã memoize) sẽ được gọi. */}
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3>{" "}
          {/* Tiêu đề cho phần form thông tin giao hàng */}
          {/* Group input cho Họ và tên */}
          <div className="form-group">
            {" "}
            {/* Container cho label, input và thông báo lỗi */}
            <label htmlFor="name">Họ và tên:</label>{" "}
            {/* Thẻ label liên kết với input có id="name". htmlFor="name" giúp cải thiện khả năng tiếp cận (khi click label, input tương ứng sẽ focus) */}
            <input
              type="text" // Kiểu input là text cho tên
              id="name" // ID của input (phải khớp với htmlFor của label)
              name="name" // Tên của input, được sử dụng trong hàm handleChange để xác định trường nào đang thay đổi và cập nhật state 'shippingInfo'
              placeholder="Nhập họ và tên người nhận" // Placeholder hiển thị hướng dẫn nhập liệu khi input trống
              value={shippingInfo.name} // Gán giá trị hiện tại từ state shippingInfo.name vào input (Đây là Controlled Component trong React)
              onChange={handleChange} // Gắn hàm xử lý khi giá trị input thay đổi (đã memoize)
              className={validationErrors.name ? "error" : ""} // Thêm class 'error' vào input nếu có thông báo lỗi xác thực cho trường 'name' trong state validationErrors.name
              aria-label="Nhập họ và tên người nhận" // Thuộc tính hỗ trợ khả năng tiếp cận cho người dùng sử dụng trình đọc màn hình
              required // Thuộc tính HTML5 yêu cầu trường này không được để trống khi submit form. Browser cũng có thể hiển thị validation message mặc định.
            />
            {/* Conditional Rendering: Hiển thị thông báo lỗi nếu có lỗi xác thực cho trường 'name' (validationErrors.name có giá trị) */}
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span> // Hiển thị nội dung lỗi từ state validationErrors.name
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
              required
            />
            {validationErrors.address && (
              <span className="error-message">{validationErrors.address}</span>
            )}
          </div>
          {/* Group input cho Số điện thoại */}
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel" // Loại input 'tel' gợi ý bàn phím số trên thiết bị di động và có thể có validation tích hợp của browser (tuy nhiên, validation bằng Regex chi tiết hơn)
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
          {/* --- Nhóm các nút hành động trong modal --- */}
          {/* Container chứa các nút Xác nhận và Hủy */}
          <div className="modal-buttons">
            {/* Nút Xác nhận đặt hàng */}
            <button
              type="submit" // Loại nút là "submit", khi click sẽ kích hoạt sự kiện submit form (và gọi hàm handleSubmit đã gắn vào form)
              className="confirm-button" // Class CSS để định dạng nút xác nhận
              // disabled={cart.length === 0} // Có thể thêm disabled nếu giỏ hàng trống, mặc dù logic trên CartPage đã disable nút mở modal
              aria-label="Xác nhận đặt hàng" // Thuộc tính hỗ trợ khả năng tiếp cận
            >
              ✅ Xác nhận đặt hàng{" "}
              {/* Nội dung hiển thị trên nút */}
            </button>
            {/* Nút Hủy bỏ */}
            <button
              type="button" // Quan trọng: Loại nút là "button" để ngăn nút này tự kích hoạt sự kiện submit form khi click. Nếu không có type="button", browser sẽ coi nó là submit button mặc định.
              className="cancel-button" // Class CSS để định dạng nút hủy
              onClick={onCancel} // Gắn hàm 'onCancel' từ props để đóng modal khi click.
              aria-label="Hủy đặt hàng" // Thuộc tính hỗ trợ khả năng tiếp cận
            >
              ❌ Hủy{" "}
              {/* Nội dung hiển thị trên nút */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal; // Export component CheckoutModal làm default export để có thể sử dụng ở các file khác (ví dụ: CartPage cần hiển thị modal này khi người dùng thanh toán)