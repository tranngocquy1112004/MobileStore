import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Hằng số cố định
const ORDERS_PER_PAGE = 5; // Số đơn hàng hiển thị trên mỗi trang

// Component hiển thị từng đơn hàng
const OrderItem = ({ order, onDelete }) => {
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }); // Định dạng ngày giờ theo kiểu Việt Nam

  return (
    <div className="order-card">
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3> {/* Mã đơn hàng */}
        <span className="order-date">📅 {orderDate}</span> {/* Ngày đặt hàng */}
      </div>
      <div className="shipping-info">
        <h4 className="section-title">🚚 Thông tin giao hàng</h4>
        <div className="info-grid">
          <span className="info-label">👤 Tên:</span>
          <span className="info-value">{order.shippingInfo.name}</span> {/* Tên người nhận */}
          <span className="info-label">🏠 Địa chỉ:</span>
          <span className="info-value">{order.shippingInfo.address}</span> {/* Địa chỉ giao hàng */}
          <span className="info-label">📞 Điện thoại:</span>
          <span className="info-value">{order.shippingInfo.phone}</span> {/* Số điện thoại */}
        </div>
      </div>
      <div className="order-details">
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4>
        <ul className="item-list">
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              <span className="item-name">{item.name}</span> {/* Tên sản phẩm */}
              <span className="item-quantity">x {item.quantity}</span> {/* Số lượng */}
              <span className="item-price">{(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ</span> {/* Tổng giá */}
            </li>
          ))}
        </ul>
      </div>
      <div className="order-footer">
        <p className="total-price">💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ</p> {/* Tổng tiền đơn hàng */}
        <button
          className="delete-button"
          onClick={() => onDelete(order.id)}
          aria-label={`Xóa đơn hàng #${order.id}`}
        >
          🗑️ Xóa {/* Nút xóa đơn hàng */}
        </button>
      </div>
    </div>
  );
};

// Component phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang đầu
    >
      Trang trước
    </button>
    <span className="pagination-current">Trang {currentPage} / {totalPages}</span> {/* Hiển thị trang hiện tại và tổng số trang */}
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối
    >
      Trang sau
    </button>
  </div>
);

// Component chính: Lịch sử đơn hàng
const OrderHistory = () => {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filterDate, setFilterDate] = useState(""); // Bộ lọc theo ngày

  // Tải dữ liệu đơn hàng từ localStorage khi component mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || []; // Lấy dữ liệu từ localStorage
        const sortedOrders = storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo ngày giảm dần
        setOrders(sortedOrders); // Cập nhật danh sách đơn hàng
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu đơn hàng:", error); // Ghi log nếu có lỗi
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải
      }
    };
    const timer = setTimeout(loadOrders, 500); // Delay 500ms để giả lập tải dữ liệu
    return () => clearTimeout(timer); // Hủy timer khi component unmount
  }, []);

  // Xử lý xóa đơn hàng
  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) { // Xác nhận trước khi xóa
      const updatedOrders = orders.filter((order) => order.id !== orderId); // Lọc bỏ đơn hàng đã xóa
      setOrders(updatedOrders); // Cập nhật danh sách đơn hàng
      localStorage.setItem("orders", JSON.stringify(updatedOrders)); // Lưu lại vào localStorage
      if (updatedOrders.length <= (currentPage - 1) * ORDERS_PER_PAGE && currentPage > 1) {
        setCurrentPage(currentPage - 1); // Giảm số trang nếu cần
      }
    }
  };

  // Lọc đơn hàng theo ngày
  const filteredOrders = filterDate
    ? orders.filter((order) => new Date(order.date).toLocaleDateString("vi-VN") === filterDate)
    : orders; // Nếu có bộ lọc ngày thì lọc, không thì giữ nguyên

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE); // Tổng số trang
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  ); // Lấy đơn hàng cho trang hiện tại

  // Xử lý thay đổi trang
  const handlePageChange = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))); // Giới hạn trang trong khoảng hợp lệ

  // Hiển thị khi đang tải
  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Đang tải...</p>
    </div>
  );

  // Giao diện chính
  return (
    <main className="order-history-container">
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1> {/* Tiêu đề trang */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p> {/* Số lượng đơn hàng */}
      </header>
      <div className="filter-section">
        <input
          type="date"
          value={filterDate ? new Date(filterDate).toISOString().split("T")[0] : ""} // Chuyển đổi định dạng ngày cho input
          onChange={(e) => setFilterDate(e.target.value ? new Date(e.target.value).toLocaleDateString("vi-VN") : "")}
          className="date-filter"
        /> {/* Bộ lọc theo ngày */}
      </div>
      <section className="order-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <img src="/empty-order.png" alt="Không có đơn hàng" className="empty-image" /> {/* Hình ảnh khi không có đơn hàng */}
            <p className="empty-message">Chưa có đơn hàng nào</p>
            <Link to="/products" className="shop-now-button">🛒 Mua sắm ngay</Link> {/* Nút chuyển hướng đến trang sản phẩm */}
          </div>
        ) : (
          currentOrders.map((order) => (
            <OrderItem key={order.id} order={order} onDelete={handleDeleteOrder} /> // Hiển thị danh sách đơn hàng
          ))
        )}
      </section>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        /> // Hiển thị phân trang nếu có hơn 1 trang
      )}
      <footer className="page-footer">
        <Link to="/home" className="back-button">← Quay lại cửa hàng</Link> {/* Nút quay lại */}
      </footer>
    </main>
  );
};

export default OrderHistory; // Xuất component để sử dụng ở nơi khác