import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Component OrderItem
const OrderItem = ({ order }) => {
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
          <br />
          <span className="info-label">🏠 Địa chỉ:</span>
          <span className="info-value">{order.shippingInfo.address}</span>
          <br />
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
      </div>
    </div>
  );
};

// Component OrderHistory
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const sortedOrders = storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadOrders, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  return (
    <main className="order-history-container">
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1>
        <p className="order-count">Bạn có {orders.length} đơn hàng</p>
      </header>

      <section className="order-list">
        {orders.length === 0 ? (
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
          orders.map((order) => <OrderItem key={order.id} order={order} />)
        )}
      </section>

      <footer className="page-footer">
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory;