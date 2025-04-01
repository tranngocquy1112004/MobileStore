import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Component OrderItem hiển thị chi tiết một đơn hàng
const OrderItem = ({ order }) => {
  // Format ngày đặt hàng theo chuẩn Việt Nam (ngày/tháng/năm giờ:phút)
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: '2-digit',    // Hiển thị 2 chữ số cho ngày (vd: 05)
    month: '2-digit',  // Hiển thị 2 chữ số cho tháng (vd: 08)
    year: 'numeric',   // Hiển thị đầy đủ năm (vd: 2023)
    hour: '2-digit',   // Hiển thị 2 chữ số cho giờ (vd: 09)
    minute: '2-digit'  // Hiển thị 2 chữ số cho phút (vd: 30)
  });

  return (
    <div className="order-card">
      {/* Phần header hiển thị ID đơn hàng và ngày đặt */}
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3>
        <span className="order-date">📅 {orderDate}</span> {/* Icon lịch kèm ngày */}
      </div>
      
      {/* Phần thông tin giao hàng */}
      <div className="shipping-info">
        <h4 className="section-title">🚚 Thông tin giao hàng</h4> {/* Icon xe tải */}
        <div className="info-grid"> {/* Sử dụng grid layout để căn chỉnh */}
          <span className="info-label">👤 Tên:</span> {/* Icon người */}
          <span className="info-value">{order.shippingInfo.name}</span>
          <br/>
          <span className="info-label">🏠 Địa chỉ:</span> {/* Icon nhà */}
          <span className="info-value">{order.shippingInfo.address}</span>
          <br/>
          <span className="info-label">📞 Điện thoại:</span> {/* Icon điện thoại */}
          <span className="info-value">{order.shippingInfo.phone}</span>
        </div>
      </div>

      {/* Phần chi tiết đơn hàng */}
      <div className="order-details">
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4> {/* Icon túi mua sắm */}
        <ul className="item-list">
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              <span className="item-name">{item.name}</span> {/* Tên sản phẩm */}
              <span className="item-quantity">x {item.quantity}</span> {/* Số lượng */}
              <span className="item-price">
                {/* Giá tiền định dạng VNĐ */}
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phần footer hiển thị tổng tiền */}
      <div className="order-footer">
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ {/* Icon tiền */}
        </p>
      </div>
    </div>
  );
};

// Component chính OrderHistory
const OrderHistory = () => {
  // State lưu danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  // State quản lý trạng thái loading
  const [isLoading, setIsLoading] = useState(true);

  // Hook useEffect chạy khi component mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        // Lấy dữ liệu từ localStorage, mặc định là mảng rỗng nếu không có
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        
        // Sắp xếp đơn hàng theo ngày mới nhất lên đầu
        const sortedOrders = storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Lỗi khi đọc dữ liệu đơn hàng:", error);
      } finally {
        // Dừng loading dù có lỗi hay không
        setIsLoading(false);
      }
    };

    // Giả lập thời gian loading 500ms để UX mượt mà hơn
    const timer = setTimeout(loadOrders, 500);
    
    // Cleanup function: hủy timeout nếu component unmount trước khi hoàn thành
    return () => clearTimeout(timer);
  }, []); // Dependency rỗng: chỉ chạy một lần khi component mount

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div> {/* Animation loading */}
        <p>Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  // Render giao diện chính
  return (
    <main className="order-history-container">
      {/* Header trang */}
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1> {/* Icon cuộn giấy */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p> {/* Đếm số đơn */}
      </header>

      {/* Phần danh sách đơn hàng */}
      <section className="order-list">
        {orders.length === 0 ? ( // Kiểm tra nếu không có đơn hàng
          <div className="empty-state">
            <img 
              src="/empty-order.png" 
              alt="Không có đơn hàng" 
              className="empty-image" 
            />
            <p className="empty-message">Chưa có đơn hàng nào</p>
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay {/* Icon giỏ hàng */}
            </Link>
          </div>
        ) : (
          // Hiển thị danh sách đơn hàng nếu có
          orders.map((order) => <OrderItem key={order.id} order={order} />)
        )}
      </section>

      {/* Footer trang */}
      <footer className="page-footer">
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory;