import React, { useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useState để quản lý trạng thái cục bộ, useEffect để thực hiện các tác vụ phụ (side effects), và useCallback để ghi nhớ (memoize) các hàm nhằm tối ưu hiệu suất
import { Link } from "react-router-dom"; // Import component Link từ react-router-dom để tạo các liên kết điều hướng trong ứng dụng SPA
import "./OrderHistory.css"; // Import file CSS tùy chỉnh để định dạng giao diện cho component OrderHistory này

// --- Định nghĩa hằng số ---

// Khóa sử dụng để lưu trữ danh sách các đơn hàng trong localStorage của trình duyệt.
// Việc sử dụng hằng số giúp tránh gõ sai key và dễ dàng quản lý. Key này nên nhất quán với component xử lý đặt hàng (ví dụ: CartPage).
const LOCAL_STORAGE_ORDERS_KEY = "orders";
// Số lượng đơn hàng tối đa sẽ hiển thị trên mỗi trang khi thực hiện phân trang.
const ORDERS_PER_PAGE = 5;

// --- Component con: OrderItem (Hiển thị thông tin chi tiết một đơn hàng) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering của component con này.
// Component chỉ render lại khi props của nó thay đổi (order, onDelete).
const OrderItem = React.memo(({ order, onDelete }) => {
  // Định dạng thuộc tính 'date' của đơn hàng (là một chuỗi ISO) thành chuỗi ngày giờ dễ đọc theo định dạng tiếng Việt.
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit", // Ngày hiển thị luôn 2 chữ số (ví dụ: 01, 15)
    month: "2-digit", // Tháng hiển thị luôn 2 chữ số (ví dụ: 01, 12)
    year: "numeric", // Năm hiển thị đầy đủ 4 chữ số (ví dụ: 2023)
    hour: "2-digit", // Giờ hiển thị luôn 2 chữ số (ví dụ: 09, 21)
    minute: "2-digit", // Phút hiển thị luôn 2 chữ số (ví dụ: 05, 55)
  });

  return (
    <div className="order-card">
      {" "}
      {/* Container chính cho một đơn hàng riêng lẻ trong danh sách lịch sử */}
      {/* Header của card đơn hàng, chứa ID đơn hàng và ngày đặt hàng */}
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3>{" "}
        {/* Hiển thị mã đơn hàng (ID) */}
        <span className="order-date">📅 {orderDate}</span>{" "}
        {/* Hiển thị ngày và giờ đặt hàng đã được định dạng */}
      </div>
      {/* Phần thông tin giao hàng của đơn hàng */}
      <div className="shipping-info">
        {" "}
        {/* Container cho thông tin giao hàng */}
        <h4 className="section-title">🚚 Thông tin giao hàng</h4>{" "}
        {/* Tiêu đề cho phần thông tin giao hàng */}
        <div className="info-grid">
          {" "}
          {/* Sử dụng CSS Grid để căn chỉnh các label và value của thông tin */}
          <span className="info-label">👤 Tên:</span>{" "}
          {/* Label cho tên người nhận */}
          <span className="info-value">{order.shippingInfo.name}</span>{" "}
          {/* Hiển thị tên người nhận từ dữ liệu đơn hàng */}
          <span className="info-label">🏠 Địa chỉ:</span>{" "}
          {/* Label cho địa chỉ */}
          <span className="info-value">{order.shippingInfo.address}</span>{" "}
          {/* Hiển thị địa chỉ người nhận */}
          <span className="info-label">📞 Điện thoại:</span>{" "}
          {/* Label cho số điện thoại */}
          <span className="info-value">{order.shippingInfo.phone}</span>{" "}
          {/* Hiển thị số điện thoại người nhận */}
        </div>
      </div>
      {/* Phần chi tiết các mặt hàng có trong đơn hàng */}
      <div className="order-details">
        {" "}
        {/* Container cho danh sách các mặt hàng */}
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4>{" "}
        {/* Tiêu đề cho phần chi tiết đơn hàng */}
        <ul className="item-list">
          {" "}
          {/* Danh sách (unordered list) hiển thị các mặt hàng */}
          {/* Lặp (map) qua mảng các mặt hàng (order.items) trong đơn hàng hiện tại */}
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              {" "}
              {/* Mỗi mặt hàng là một list item */}
              <span className="item-name">{item.name}</span>{" "}
              {/* Hiển thị tên mặt hàng */}
              <span className="item-quantity">x{item.quantity}</span>{" "}
              {/* Hiển thị số lượng của mặt hàng */}
              <span className="item-price">
                {/* Tính tổng giá của mặt hàng đó (giá * số lượng) và định dạng theo tiền tệ Việt Nam */}
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Phần chân của card đơn hàng, hiển thị tổng tiền và nút xóa */}
      <div className="order-footer">
        {" "}
        {/* Container cho phần chân */}
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ{" "}
          {/* Hiển thị tổng tiền của toàn bộ đơn hàng, định dạng tiền tệ */}
        </p>
        {/* Nút xóa đơn hàng */}
        <button
          className="delete-button" // Class CSS để định dạng nút xóa
          onClick={() => onDelete(order.id)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onDelete' (được truyền từ component cha qua props) với ID của đơn hàng hiện tại.
          aria-label={`Xóa đơn hàng #${order.id}`} // Thuộc tính hỗ trợ khả năng tiếp cận cho người dùng trình đọc màn hình
        >
          🗑️ Xóa{" "}
          {/* Nội dung hiển thị trên nút xóa */}
        </button>
      </div>
    </div>
  );
}); // Kết thúc React.memo() cho component OrderItem

// --- Component con: Pagination (Hiển thị các nút điều hướng phân trang) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering.
// Component chỉ render lại khi props của nó thay đổi (currentPage, totalPages, onPageChange).
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Không hiển thị bộ phân trang nếu tổng số trang nhỏ hơn hoặc bằng 1 (chỉ có một trang duy nhất).
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {" "}
      {/* Container cho bộ phận phân trang */}
      {/* Nút "Trang trước" */}
      <button
        className="pagination-button" // Class CSS để định dạng nút phân trang
        onClick={() => onPageChange(currentPage - 1)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onPageChange' (truyền qua props) với số trang mới là trang hiện tại trừ đi 1.
        disabled={currentPage === 1} // Vô hiệu hóa nút nếu trang hiện tại đang là trang đầu tiên (1).
      >
        Trang trước{" "}
        {/* Nội dung nút */}
      </button>
      {/* Hiển thị thông tin trang hiện tại và tổng số trang */}
      <span className="pagination-current">
        Trang {currentPage} / {totalPages}{" "}
        {/* Hiển thị định dạng "Trang X / Tổng Y" */}
      </span>
      {/* Nút "Trang sau" */}
      <button
        className="pagination-button" // Class CSS để định dạng nút phân trang
        onClick={() => onPageChange(currentPage + 1)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onPageChange' với số trang mới là trang hiện tại cộng thêm 1.
        disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu trang hiện tại đang là trang cuối cùng (bằng totalPages).
      >
        Trang sau{" "}
        {/* Nội dung nút */}
      </button>
    </div>
  );
}); // Kết thúc React.memo() cho component Pagination

// --- Component chính của trang Lịch sử đơn hàng ---
// Đây là functional component hiển thị toàn bộ nội dung của trang Lịch sử đơn hàng.
const OrderHistory = () => {
  // --- State quản lý dữ liệu và trạng thái của component ---
  // State 'orders': Lưu trữ danh sách tất cả các đơn hàng đã được tải từ localStorage. Ban đầu là mảng rỗng [].
  const [orders, setOrders] = useState([]);
  // State 'isLoading': Boolean theo dõi trạng thái đang tải dữ liệu đơn hàng. Ban đầu là true.
  const [isLoading, setIsLoading] = useState(true);
  // State 'currentPage': Lưu trữ số trang hiện tại mà người dùng đang xem trong bộ phân trang. Ban đầu là 1.
  const [currentPage, setCurrentPage] = useState(1);

  // --- Effect hook để tải dữ liệu đơn hàng từ localStorage khi component mount ---
  // Effect này chạy MỘT LẦN duy nhất sau lần render đầu tiên (tương tự componentDidMount).
  useEffect(() => {
    // Định nghĩa hàm 'loadOrders' để thực hiện việc đọc dữ liệu từ localStorage.
    const loadOrders = () => {
      try {
        // Lấy chuỗi JSON chứa đơn hàng từ localStorage bằng key đã định nghĩa.
        // Nếu không tìm thấy dữ liệu (localStorage.getItem trả về null), mặc định là mảng rỗng [].
        // Sử dụng try-catch để xử lý lỗi nếu dữ liệu trong localStorage bị hỏng hoặc không phải JSON hợp lệ.
        const storedOrders =
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
        // Sắp xếp mảng đơn hàng theo ngày đặt hàng giảm dần (đơn mới nhất sẽ hiển thị trước).
        // Phương thức .sort() sắp xếp tại chỗ. Hàm so sánh (a, b) -> new Date(b.date) - new Date(a.date)
        // trả về số dương nếu ngày của b lớn hơn ngày của a, đẩy b lên trước a.
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedOrders); // Cập nhật state 'orders' với danh sách đơn hàng đã sắp xếp.
      } catch (error) {
        console.error("Lỗi khi đọc đơn hàng từ localStorage:", error); // Ghi log lỗi ra console nếu có vấn đề khi đọc hoặc parse localStorage.
        // Nếu có lỗi, có thể setOrders([]) để hiển thị trạng thái rỗng hoặc một thông báo lỗi riêng biệt.
        // Trong trường hợp này, chỉ ghi log và để orders là mảng rỗng mặc định nếu parse thất bại.
      } finally {
        // Khối finally luôn chạy, đảm bảo 'isLoading' được đặt thành false sau khi quá trình tải (dù thành công hay lỗi) kết thúc.
        setIsLoading(false);
      }
    };

    // Sử dụng setTimeout để giả lập một độ trễ nhỏ (ví dụ: 500ms) khi tải dữ liệu.
    // Điều này giúp người dùng thấy rõ trạng thái loading spinner trên giao diện.
    // Trong ứng dụng thực tế fetch từ API thật, bạn sẽ không cần setTimeout này,
    // việc setIsLoading(false) sẽ được gọi sau khi fetch hoàn thành.
    const timer = setTimeout(loadOrders, 500); // Chờ 500ms trước khi gọi hàm loadOrders.

    // Hàm cleanup cho effect này: Chạy khi component bị hủy bỏ (unmount)
    // hoặc trước khi effect chạy lại (nếu dependencies thay đổi, nhưng ở đây deps là mảng rỗng nên chỉ chạy khi unmount).
    // Xóa bỏ hẹn giờ đã tạo để ngăn hàm loadOrders chạy và cập nhật state sau khi component đã unmount.
    return () => clearTimeout(timer);
  }, []); // Mảng dependencies rỗng []: đảm bảo effect chỉ chạy MỘT LẦN duy nhất khi component được mount lần đầu.

  // --- Hàm xử lý logic xóa một đơn hàng ---
  // Nhận ID của đơn hàng cần xóa (orderId).
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm sẽ được tạo lại khi state 'orders' hoặc 'currentPage' thay đổi.
  // Điều này giúp ngăn việc tạo lại hàm không cần thiết qua mỗi lần render nếu 'orders' và 'currentPage' không đổi,
  // đặc biệt hữu ích khi truyền hàm này xuống component con (OrderItem) có sử dụng React.memo().
  const handleDeleteOrder = useCallback(
    (orderId) => {
      // Hiển thị một hộp thoại xác nhận của trình duyệt trước khi thực hiện xóa.
      // window.confirm() trả về true nếu người dùng nhấn 'OK', false nếu nhấn 'Cancel'.
      if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
        return; // Nếu người dùng chọn 'Cancel' (kết quả là false), dừng hàm tại đây và không làm gì cả.
      }

      // Tạo một mảng đơn hàng mới bằng cách sử dụng phương thức .filter() trên mảng 'orders'.
      // Lọc ra chỉ những đơn hàng có ID KHÁC với 'orderId' được truyền vào. Điều này loại bỏ đơn hàng cần xóa.
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders); // Cập nhật state 'orders' với danh sách đơn hàng mới sau khi xóa.

      // Lưu danh sách đơn hàng đã cập nhật trở lại vào localStorage (chuyển thành chuỗi JSON trước khi lưu).
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

      // --- Logic điều chỉnh số trang hiện tại sau khi xóa một đơn hàng ---
      // Tính toán tổng số trang cần thiết dựa trên danh sách đơn hàng mới sau khi xóa.
      const totalPagesAfterDelete = Math.ceil(
        updatedOrders.length / ORDERS_PER_PAGE
      );
      // Nếu trang hiện tại ('currentPage') lớn hơn tổng số trang mới sau khi xóa (totalPagesAfterDelete)
      // VÀ tổng số trang mới vẫn lớn hơn 0 (đảm bảo không phải trường hợp xóa hết sạch đơn hàng):
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete); // Cập nhật 'currentPage' về số trang cuối cùng mới.
      } else if (updatedOrders.length === 0) {
        // Nếu sau khi xóa mà danh sách đơn hàng trở thành trống rỗng:
        setCurrentPage(1); // Đảm bảo state 'currentPage' được đặt lại về 1.
      }
      // Nếu các điều kiện trên không đúng, có nghĩa là trang hiện tại vẫn hợp lệ với tổng số trang mới, nên không cần thay đổi currentPage.
    },
    [orders, currentPage] // Mảng dependencies: Hàm này cần truy cập giá trị hiện tại của state 'orders' (để filter) và state 'currentPage' (để điều chỉnh sau khi xóa).
  );

  // --- Tính toán các giá trị dẫn xuất từ state (để hiển thị và phân trang) ---
  // Các giá trị này sẽ được tính toán lại mỗi khi state 'orders' hoặc 'currentPage' thay đổi,
  // đảm bảo dữ liệu hiển thị và logic phân trang luôn chính xác.

  // Tính tổng số trang cần thiết dựa trên tổng số lượng đơn hàng và số đơn hàng trên mỗi trang.
  // Sử dụng Math.ceil() để làm tròn lên, đảm bảo có đủ trang cho cả những đơn hàng lẻ.
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  // Tính chỉ số bắt đầu của đơn hàng trên trang hiện tại trong mảng 'orders'.
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  // Tính chỉ số kết thúc (không bao gồm) của đơn hàng trên trang hiện tại.
  // Sử dụng Math.min để đảm bảo endIndex không vượt quá độ dài mảng orders khi ở trang cuối cùng.
  const endIndex = Math.min(startIndex + ORDERS_PER_PAGE, orders.length);
  // Sử dụng phương thức .slice() trên mảng 'orders' để lấy ra danh sách các đơn hàng chỉ hiển thị trên trang hiện tại.
  const currentOrders = orders.slice(startIndex, endIndex);

  // --- Hàm xử lý khi người dùng click các nút phân trang (Trang trước/sau) ---
  // Nhận số trang mới ('page') làm tham số.
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm sẽ được tạo lại khi 'totalPages' thay đổi.
  // Điều này giúp tránh việc tạo lại hàm không cần thiết và có thể hữu ích khi truyền xuống component con (Pagination) nếu nó được memoize.
  const handlePageChange = useCallback(
    (page) => {
      // Tính toán số trang mới, đảm bảo nó nằm trong khoảng hợp lệ từ 1 đến totalPages.
      // Math.max(1, ...) đảm bảo số trang không nhỏ hơn 1.
      // Math.min(page, totalPages) đảm bảo số trang không lớn hơn tổng số trang.
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage); // Cập nhật state 'currentPage' với số trang mới đã được giới hạn hợp lệ.
    },
    [totalPages] // Mảng dependencies: Hàm này cần truy cập giá trị hiện tại của biến 'totalPages' để giới hạn số trang hợp lệ.
  );

  // --- Render giao diện dựa trên trạng thái loading ban đầu ---

  // Nếu state 'isLoading' là true, hiển thị giao diện loading spinner.
  if (isLoading) {
    return (
      <div className="loading-container">
        {" "}
        {/* Container bao quanh spinner và text loading */}
        <div className="loading-spinner"></div>{" "}
        {/* Biểu tượng spinner quay */}
        <p>Đang tải...</p> {/* Hiển thị thông báo "Đang tải..." */}
      </div>
    );
  }

  // --- Render giao diện chính của trang Lịch sử đơn hàng khi không còn loading ---
  // Đây là phần giao diện hiển thị sau khi dữ liệu đã tải xong.
  return (
    <main className="order-history-container">
      {" "}
      {/* Thẻ <main> bao bọc nội dung chính của trang */}
      {/* Header của trang Lịch sử đơn hàng */}
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1> {/* Tiêu đề chính của trang */}
        {/* Hiển thị tổng số lượng đơn hàng đã tải */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p>{" "}
      </header>
      {/* Phần hiển thị danh sách đơn hàng hoặc thông báo khi danh sách rỗng */}
      <section className="order-list">
        {" "}
        {/* Container cho danh sách các đơn hàng */}
        {orders.length === 0 ? ( // Conditional Rendering: Kiểm tra nếu mảng 'orders' rỗng (không có đơn hàng nào)
          // --- Hiển thị giao diện khi không có đơn hàng ---
          <div className="empty-state">
            {" "}
            {/* Container cho trạng thái rỗng */}
            <img
              src="/empty-order.png" // Đường dẫn đến ảnh minh họa giỏ hàng trống (hoặc trạng thái rỗng đơn hàng). Đảm bảo file ảnh này tồn tại trong thư mục 'public'.
              alt="Không có đơn hàng" // Alt text cho ảnh, quan trọng cho SEO và khả năng tiếp cận
              className="empty-image" // Class CSS để định dạng ảnh
              loading="lazy" // Tải ảnh theo chế độ lazy loading, cải thiện hiệu suất
            />
            <p className="empty-message">Chưa có đơn hàng nào</p>{" "}
            {/* Thông báo "Chưa có đơn hàng nào" */}
            {/* Nút "Mua sắm ngay" - một liên kết dẫn người dùng đến trang sản phẩm để bắt đầu mua sắm */}
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay{" "}
              {/* Nội dung nút/liên kết */}
            </Link>
          </div>
        ) : (
          // --- Hiển thị danh sách đơn hàng khi có đơn hàng ---
          // Lặp (map) qua mảng 'currentOrders' (các đơn hàng của trang hiện tại)
          // để render một component OrderItem cho mỗi đơn hàng.
          currentOrders.map((order) => (
            <OrderItem
              key={order.id} // Key duy nhất cho mỗi OrderItem trong danh sách, sử dụng ID đơn hàng (quan trọng cho hiệu suất React)
              order={order} // Truyền đối tượng đơn hàng hiện tại ('order') làm prop cho OrderItem.
              onDelete={handleDeleteOrder} // Truyền hàm xử lý xóa đơn hàng ('handleDeleteOrder', đã memoize) làm prop 'onDelete' cho OrderItem.
            />
          ))
        )}
      </section>
      {/* Hiển thị component Phân trang chỉ khi tổng số trang lớn hơn 1 */}
      {totalPages > 1 && ( // Conditional Rendering: Chỉ hiển thị bộ phân trang nếu có nhiều hơn 1 trang
        <Pagination
          currentPage={currentPage} // Truyền số trang hiện tại làm prop
          totalPages={totalPages} // Truyền tổng số trang làm prop
          onPageChange={handlePageChange} // Truyền hàm xử lý chuyển trang (đã memoize) làm prop
        />
      )}
      {/* Footer của trang Lịch sử đơn hàng */}
      <footer className="page-footer">
        {" "}
        {/* Container cho phần chân trang */}
        {/* Nút "Quay lại cửa hàng" - một liên kết dẫn về trang chủ hoặc trang sản phẩm */}
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng{" "}
          {/* Nội dung nút/liên kết */}
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory; // Export component OrderHistory làm default export để có thể sử dụng ở các file khác (thường là trong cấu hình định tuyến)