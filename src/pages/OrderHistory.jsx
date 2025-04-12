import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

const ORDERS_PER_PAGE = 5; // Số lượng đơn hàng hiển thị mỗi trang

// Component hiển thị thông tin 1 đơn hàng
const OrderItem = ({ order, onDelete }) => {
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }); // Định dạng ngày đặt hàng theo chuẩn Việt Nam

  return (
    <div className="order-card">
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3>
        <span className="order-date">📅 {orderDate}</span>
      </div>

      <div className="shipping-info">
        <h4 className="section-title">🚚 Thông tin giao hàng</h4>
        <div className="info-grid">
          <span className="info-label">👤 Tên:</span>
          <span className="info-value">{order.shippingInfo.name}</span>
          <span className="info-label">🏠 Địa chỉ:</span>
          <span className="info-value">{order.shippingInfo.address}</span>
          <span className="info-label">📞 Điện thoại:</span>
          <span className="info-value">{order.shippingInfo.phone}</span>
        </div>
      </div>

      <div className="order-details">
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4>
        <ul className="item-list">
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x {item.quantity}</span>
              <span className="item-price">
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-footer">
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ
        </p>
        <button
          className="delete-button"
          onClick={() => onDelete(order.id)}
          aria-label={`Xóa đơn hàng #${order.id}`}
        >
          🗑️ Xóa
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
      disabled={currentPage === 1}
    >
      Trang trước
    </button>
    <span className="pagination-current">
      Trang {currentPage} / {totalPages}
    </span>
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Trang sau
    </button>
  </div>
);

// Component chính: hiển thị lịch sử đơn hàng
const OrderHistory = () => {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filterDate, setFilterDate] = useState(""); // Bộ lọc ngày

  // Tải đơn hàng từ localStorage khi component được mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ); // Sắp xếp đơn hàng mới nhất lên đầu
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Lỗi khi đọc đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadOrders, 500); // Giả lập delay 500ms
    return () => clearTimeout(timer);
  }, []);

  // Hàm xóa đơn hàng
  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      if (updatedOrders.length <= (currentPage - 1) * ORDERS_PER_PAGE && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Lọc đơn hàng theo ngày
  const filteredOrders = filterDate
    ? orders.filter(
        (order) => new Date(order.date).toLocaleDateString("vi-VN") === filterDate
      )
    : orders;

  // Phân trang
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Nếu đang tải thì hiển thị spinner
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
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1>
        <p className="order-count">Bạn có {orders.length} đơn hàng</p>
      </header>

      <div className="filter-section">
        <input
          type="date"
          value={
            filterDate ? new Date(filterDate).toISOString().split("T")[0] : ""
          }
          onChange={(e) =>
            setFilterDate(
              e.target.value
                ? new Date(e.target.value).toLocaleDateString("vi-VN")
                : ""
            )
          }
          className="date-filter"
        />
      </div>

      <section className="order-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <img
              src="/empty-order.png"
              alt="Không có đơn hàng"
              className="empty-image"
            />
            <p className="empty-message">Chưa có đơn hàng nào</p>
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay
            </Link>
          </div>
        ) : (
          currentOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onDelete={handleDeleteOrder}
            />
          ))
        )}
      </section>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <footer className="page-footer">
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory; // Xuất component để sử dụng