import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Định nghĩa hằng số số đơn hàng trên mỗi trang
const ORDERS_PER_PAGE = 5;

// Component OrderItem hiển thị thông tin một đơn hàng
const OrderItem = ({ order, onDelete }) => {
  // Định dạng ngày đặt hàng theo định dạng Việt Nam
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="order-card">
      {/* Phần tiêu đề đơn hàng */}
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3> {/* Mã đơn hàng */}
        <span className="order-date">📅 {orderDate}</span> {/* Ngày đặt hàng */}
      </div>
      {/* Thông tin giao hàng */}
      <div className="shipping-info">
        <h4 className="section-title">🚚 Thông tin giao hàng</h4>
        <div className="info-grid">
          <span className="info-label">👤 Tên:</span>
          <span className="info-value">{order.shippingInfo.name}</span> {/* Tên khách hàng */}
          <span className="info-label">🏠 Địa chỉ:</span>
          <span className="info-value">{order.shippingInfo.address}</span> {/* Địa chỉ giao hàng */}
          <span className="info-label">📞 Điện thoại:</span>
          <span className="info-valuewise">{order.shippingInfo.phone}</span> {/* Số điện thoại */}
        </div>
      </div>
      {/* Chi tiết đơn hàng */}
      <div className="order-details">
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4>
        <ul className="item-list">
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              <span className="item-name">{item.name}</span> {/* Tên sản phẩm */}
              <span className="item-quantity">x{item.quantity}</span> {/* Số lượng */}
              <span className="item-price">
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ {/* Tổng giá sản phẩm */}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Phần chân đơn hàng */}
      <div className="order-footer">
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ {/* Tổng tiền đơn hàng */}
        </p>
        <button
          className="delete-button"
          onClick={() => onDelete(order.id)} // Gọi hàm xóa đơn hàng
          aria-label={`Xóa đơn hàng #${order.id}`}
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

// Component Pagination để điều hướng trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage - 1)} // Chuyển đến trang trước
      disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang đầu
    >
      Trang trước
    </button>
    <span className="pagination-current">
      Trang {currentPage} / {totalPages} {/* Hiển thị trang hiện tại và tổng số trang */}
    </span>
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)} // Chuyển đến trang sau
      disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối
    >
      Trang sau
    </button>
  </div>
);

// Component chính OrderHistory
const OrderHistory = () => {
  // State để quản lý danh sách đơn hàng, trạng thái tải và trang hiện tại
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại

  // Load đơn hàng từ localStorage khi component mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        // Lấy dữ liệu đơn hàng từ localStorage, mặc định là mảng rỗng nếu không có
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        // Sắp xếp đơn hàng theo ngày giảm dần (mới nhất trước)
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedOrders); // Cập nhật state đơn hàng
      } catch (error) {
        console.error("Lỗi khi đọc đơn hàng:", error); // Log lỗi nếu có
      } finally {
        setIsLoading(false); // Tắt trạng thái tải
      }
    };

    // Tạo timeout để giả lập tải dữ liệu
    const timer = setTimeout(loadOrders, 500);
    return () => clearTimeout(timer); // Hủy timeout khi component unmount
  }, []);

  // Hàm xóa đơn hàng
  const handleDeleteOrder = (orderId) => {
    // Xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    // Lọc bỏ đơn hàng có id trùng
    const updatedOrders = orders.filter((order) => order.id !== orderId);
    setOrders(updatedOrders); // Cập nhật state đơn hàng
    // Lưu danh sách đơn hàng mới vào localStorage
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Nếu trang hiện tại không còn đơn hàng, chuyển về trang trước
    if (updatedOrders.length <= (currentPage - 1) * ORDERS_PER_PAGE && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Tính tổng số trang và danh sách đơn hàng hiện tại
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE); // Tổng số trang
  const currentOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  ); // Danh sách đơn hàng trên trang hiện tại

  // Hàm thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages))); // Đảm bảo trang nằm trong khoảng hợp lệ
  };

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Giao diện chính
  return (
    <main className="order-history-container">
      {/* Tiêu đề trang */}
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1>
        <p className="order-count">Bạn có {orders.length} đơn hàng</p> {/* Số lượng đơn hàng */}
      </header>
      {/* Danh sách đơn hàng */}
      <section className="order-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <img
              src="/empty-order.png"
              alt="Không có đơn hàng"
              className="empty-image"
              loading="lazy" // Tải ảnh theo chế độ lazy
            />
            <p className="empty-message">Chưa có đơn hàng nào</p>
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay {/* Nút chuyển hướng đến trang sản phẩm */}
            </Link>
          </div>
        ) : (
          currentOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onDelete={handleDeleteOrder} // Truyền hàm xóa đơn hàng
            />
          ))
        )}
      </section>
      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      {/* Chân trang */}
      <footer className="page-footer">
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng {/* Nút quay lại trang chủ */}
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory;