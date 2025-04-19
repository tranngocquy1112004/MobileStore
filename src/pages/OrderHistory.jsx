import React, { useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ React: useState để quản lý state, useEffect để thực hiện các side effect, useCallback để memoize hàm
import { Link } from "react-router-dom"; // Import Link từ react-router-dom để tạo liên kết điều hướng
import "./OrderHistory.css"; // Import file CSS cho component OrderHistory

// --- Định nghĩa hằng số ---

// Định nghĩa key dùng cho localStorage để lưu trữ đơn hàng
const LOCAL_STORAGE_ORDERS_KEY = "orders";
// Số lượng đơn hàng hiển thị trên mỗi trang để phân trang
const ORDERS_PER_PAGE = 5;

// --- Component con: OrderItem (Hiển thị thông tin một đơn hàng) ---
// Sử dụng React.memo để tối ưu hóa hiệu suất: component sẽ không re-render nếu props (order, onDelete) không thay đổi.
const OrderItem = React.memo(({ order, onDelete }) => {
  // Định dạng ngày đặt hàng của đơn hàng theo định dạng Việt Nam
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit", // Ngày hiển thị 2 chữ số
    month: "2-digit", // Tháng hiển thị 2 chữ số
    year: "numeric", // Năm hiển thị đầy đủ 4 chữ số
    hour: "2-digit", // Giờ hiển thị 2 chữ số
    minute: "2-digit", // Phút hiển thị 2 chữ số
  });

  return (
    <div className="order-card">
      {/* Header của card đơn hàng */}
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3> {/* Hiển thị mã đơn hàng */}
        <span className="order-date">📅 {orderDate}</span>{" "}
        {/* Hiển thị ngày đặt hàng đã định dạng */}
      </div>

      {/* Phần thông tin giao hàng */}
      <div className="shipping-info">
        <h4 className="section-title">🚚 Thông tin giao hàng</h4>{" "}
        {/* Tiêu đề phần thông tin giao hàng */}
        <div className="info-grid">
          <span className="info-label">👤 Tên:</span>{" "}
          {/* Label cho tên người nhận */}
          <span className="info-value">{order.shippingInfo.name}</span>{" "}
          {/* Hiển thị tên người nhận */}
          <span className="info-label">🏠 Địa chỉ:</span>{" "}
          {/* Label cho địa chỉ */}
          <span className="info-value">{order.shippingInfo.address}</span>{" "}
          {/* Hiển thị địa chỉ */}
          <span className="info-label">📞 Điện thoại:</span>{" "}
          {/* Label cho số điện thoại */}
          <span className="info-value">{order.shippingInfo.phone}</span>{" "}
          {/* Hiển thị số điện thoại */}
        </div>
      </div>

      {/* Phần chi tiết các mặt hàng trong đơn hàng */}
      <div className="order-details">
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4>{" "}
        {/* Tiêu đề phần chi tiết đơn hàng */}
        <ul className="item-list">
          {/* Lặp qua mảng các mặt hàng trong đơn hàng */}
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              <span className="item-name">{item.name}</span>{" "}
              {/* Tên mặt hàng */}
              <span className="item-quantity">x{item.quantity}</span>{" "}
              {/* Số lượng mặt hàng */}
              <span className="item-price">
                {/* Tổng giá của mặt hàng (giá * số lượng), định dạng tiền tệ */}
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phần chân đơn hàng */}
      <div className="order-footer">
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ{" "}
          {/* Hiển thị tổng tiền của cả đơn hàng, định dạng tiền tệ */}
        </p>
        {/* Nút xóa đơn hàng */}
        <button
          className="delete-button"
          onClick={() => onDelete(order.id)} // Gọi hàm onDelete từ props, truyền ID đơn hàng
          aria-label={`Xóa đơn hàng #${order.id}`} // Aria label cho khả năng tiếp cận
        >
          🗑️ Xóa {/* Nội dung nút xóa */}
        </button>
      </div>
    </div>
  );
}); // Kết thúc React.memo

// --- Component con: Pagination (Hiển thị các nút phân trang) ---
// Sử dụng React.memo để tối ưu hóa hiệu suất: component sẽ không re-render nếu props (currentPage, totalPages, onPageChange) không thay đổi.
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Không hiển thị bộ phân trang nếu tổng số trang nhỏ hơn hoặc bằng 1
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {/* Nút "Trang trước" */}
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)} // Giảm số trang hiện tại đi 1
        disabled={currentPage === 1} // Vô hiệu hóa nút nếu đang ở trang đầu tiên
      >
        Trang trước
      </button>
      {/* Hiển thị thông tin trang hiện tại và tổng số trang */}
      <span className="pagination-current">
        Trang {currentPage} / {totalPages}
      </span>
      {/* Nút "Trang sau" */}
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)} // Tăng số trang hiện tại lên 1
        disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu đang ở trang cuối cùng
      >
        Trang sau
      </button>
    </div>
  );
}); // Kết thúc React.memo

// --- Component chính của trang Lịch sử đơn hàng ---
const OrderHistory = () => {
  // --- State quản lý dữ liệu và trạng thái ---
  const [orders, setOrders] = useState([]); // State để lưu danh sách các đơn hàng
  const [isLoading, setIsLoading] = useState(true); // State để theo dõi trạng thái đang tải
  const [currentPage, setCurrentPage] = useState(1); // State để theo dõi trang hiện tại trong phân trang

  // --- Effect hook để tải dữ liệu đơn hàng từ localStorage khi component mount ---
  useEffect(() => {
    const loadOrders = () => {
      try {
        // Lấy dữ liệu từ localStorage với key đã định nghĩa. Nếu không có, mặc định là mảng rỗng.
        const storedOrders =
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
        // Sắp xếp các đơn hàng theo ngày giảm dần (đơn mới nhất trước)
        // new Date(b.date) - new Date(a.date) sẽ trả về số dương nếu b mới hơn a, số âm nếu a mới hơn b.
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedOrders); // Cập nhật state orders với dữ liệu đã sắp xếp
      } catch (error) {
        console.error("Lỗi khi đọc đơn hàng từ localStorage:", error); // Ghi log lỗi nếu có vấn đề khi đọc localStorage
        // Nếu có lỗi, có thể setOrders([]) để hiển thị trạng thái rỗng hoặc thông báo lỗi khác.
      } finally {
        setIsLoading(false); // Dù thành công hay thất bại, kết thúc trạng thái đang tải
      }
    };

    // Sử dụng setTimeout để giả lập một độ trễ khi tải dữ liệu, giúp thấy rõ trạng thái loading spinner.
    // Trong ứng dụng thực tế với API thật, bạn sẽ không cần setTimeout này.
    const timer = setTimeout(loadOrders, 500); // Chờ 500ms trước khi gọi loadOrders

    // Cleanup function: Hàm này chạy khi component unmount. Xóa timeout để tránh gọi loadOrders
    // nếu component bị hủy trước khi timeout kết thúc.
    return () => clearTimeout(timer);
  }, []); // Mảng dependencies rỗng []: effect chỉ chạy MỘT LẦN duy nhất sau render đầu tiên (tương tự componentDidMount).

  // --- Hàm xử lý logic xóa một đơn hàng ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi 'orders' hoặc 'currentPage' thay đổi.
  const handleDeleteOrder = useCallback(
    (orderId) => {
      // Hiển thị hộp thoại xác nhận trước khi thực hiện xóa
      if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
        return; // Nếu người dùng chọn 'Cancel', dừng hàm tại đây.
      }

      // Lọc ra các đơn hàng còn lại, bỏ đi đơn hàng có ID trùng với orderId
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders); // Cập nhật state orders với danh sách mới

      // Lưu danh sách đơn hàng đã cập nhật trở lại vào localStorage
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

      // --- Logic điều chỉnh số trang hiện tại sau khi xóa ---
      // Tính toán tổng số trang mới sau khi xóa
      const totalPagesAfterDelete = Math.ceil(
        updatedOrders.length / ORDERS_PER_PAGE
      );
      // Nếu trang hiện tại lớn hơn tổng số trang mới VÀ tổng số trang mới > 0
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete); // Chuyển currentPage về trang cuối cùng mới
      } else if (updatedOrders.length === 0) {
        // Nếu không còn đơn hàng nào sau khi xóa
        setCurrentPage(1); // Đảm bảo currentPage được reset về 1
      }
      // Nếu currentPage vẫn hợp lệ với totalPagesAfterDelete, giữ nguyên currentPage.
    },
    [orders, currentPage] // Dependency array: hàm này cần truy cập giá trị hiện tại của 'orders' và 'currentPage'.
  );

  // --- Tính toán các giá trị dẫn xuất từ state (để hiển thị) ---

  // Tính tổng số trang cần thiết cho phân trang
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  // Lấy ra danh sách các đơn hàng sẽ hiển thị trên trang hiện tại dựa trên currentPage và ORDERS_PER_PAGE
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, endIndex);

  // --- Hàm xử lý khi người dùng click các nút phân trang ---
  // Sử dụng useCallback để hàm chỉ được tạo lại khi 'totalPages' thay đổi.
  const handlePageChange = useCallback(
    (page) => {
      // Tính toán số trang mới, đảm bảo nó nằm trong khoảng hợp lệ (từ 1 đến totalPages)
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage); // Cập nhật state số trang hiện tại
    },
    [totalPages] // Dependency array: hàm này cần truy cập giá trị hiện tại của 'totalPages'.
  );

  // --- Render giao diện dựa trên trạng thái loading ---

  // Nếu đang trong trạng thái tải dữ liệu (isLoading là true)
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container cho loading */}
        <div className="loading-spinner"></div> {/* Biểu tượng spinner quay */}
        <p>Đang tải...</p> {/* Thông báo "Đang tải..." */}
      </div>
    );
  }

  // --- Render giao diện chính của trang Lịch sử đơn hàng ---
  return (
    <main className="order-history-container"> {/* Thẻ main bao bọc nội dung chính của trang */}
      {/* Header của trang Lịch sử đơn hàng */}
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1> {/* Tiêu đề chính */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p>{" "}
        {/* Hiển thị tổng số lượng đơn hàng */}
      </header>

      {/* Phần hiển thị danh sách đơn hàng hoặc thông báo khi rỗng */}
      <section className="order-list"> {/* Container cho danh sách đơn hàng */}
        {orders.length === 0 ? ( // Kiểm tra nếu danh sách đơn hàng rỗng
          // --- Hiển thị trạng thái rỗng khi không có đơn hàng ---
          <div className="empty-state">
            <img
              src="/empty-order.png" // Đường dẫn đến ảnh minh họa giỏ hàng trống
              alt="Không có đơn hàng" // Alt text cho ảnh
              className="empty-image"
              loading="lazy" // Tải ảnh theo chế độ lazy loading
            />
            <p className="empty-message">Chưa có đơn hàng nào</p>{" "}
            {/* Thông báo "Chưa có đơn hàng nào" */}
            {/* Nút "Mua sắm ngay" dẫn đến trang sản phẩm */}
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay
            </Link>
          </div>
        ) : (
          // --- Hiển thị danh sách đơn hàng khi có đơn hàng ---
          // Map qua danh sách đơn hàng của trang hiện tại để render từng OrderItem
          currentOrders.map((order) => (
            <OrderItem
              key={order.id} // Key duy nhất cho mỗi OrderItem, sử dụng ID đơn hàng
              order={order} // Truyền dữ liệu đơn hàng xuống component con
              onDelete={handleDeleteOrder} // Truyền hàm xử lý xóa đơn hàng xuống component con
            />
          ))
        )}
      </section>

      {/* Hiển thị component Phân trang chỉ khi có nhiều hơn 1 trang (totalPages > 1) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage} // Truyền số trang hiện tại
          totalPages={totalPages} // Truyền tổng số trang
          onPageChange={handlePageChange} // Truyền hàm xử lý khi người dùng chuyển trang
        />
      )}

      {/* Footer của trang */}
      <footer className="page-footer">
        {/* Nút "Quay lại cửa hàng" dẫn về trang chủ hoặc trang sản phẩm */}
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory; // Export component OrderHistory để có thể sử dụng ở các file khác (trong phần routing)