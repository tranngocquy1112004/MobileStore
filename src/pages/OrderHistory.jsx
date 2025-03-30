import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Component OrderItem - Hiển thị thông tin chi tiết của một đơn hàng
const OrderItem = ({ order }) => (
  <li className="order-item">
    <h3>Đơn hàng #{order.id}</h3> 
    <p>Ngày đặt: {new Date(order.date).toLocaleString("vi-VN")}</p>
    
    <h4>Thông tin giao hàng</h4>
    <p>Tên: {order.shippingInfo.name}</p>
    <p>Địa chỉ: {order.shippingInfo.address}</p> 
    <p>Số điện thoại: {order.shippingInfo.phone}</p> 

    <h4>Chi tiết đơn hàng</h4> 
    <ul> 
      {order.items.map((item) => (
        <li key={item.id}> 
          {item.name} x {item.quantity} -{" "}
          {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ 
        </li>
      ))}
    </ul>

    <p className="total-price">
      Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ 
    </p>
  </li>
);

// Main Component - OrderHistory
const OrderHistory = () => {
  const [orders, setOrders] = useState([]); // State lưu danh sách đơn hàng từ localStorage

  // useEffect - Lấy dữ liệu đơn hàng từ localStorage khi component mount
  useEffect(() => {
    const loadOrders = () => {
      const storedOrders = JSON.parse(localStorage.getItem("orders")) || []; // Lấy dữ liệu từ localStorage, mặc định là mảng rỗng nếu không có
      setOrders(storedOrders); // Cập nhật state với danh sách đơn hàng
    };
    loadOrders(); // Thực thi hàm tải dữ liệu
  }, []); // Dependency rỗng: chỉ chạy một lần khi component mount

  // Render giao diện chính
  return (
    <div className="order-history-container">
      <h2>📜 Lịch sử đơn hàng</h2> 
      {orders.length === 0 ? ( // Kiểm tra nếu không có đơn hàng
        <p>Chưa có đơn hàng nào.</p> // Thông báo khi danh sách rỗng
      ) : (
        <ul className="order-list"> 
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} /> // Hiển thị từng đơn hàng bằng component OrderItem
          ))}
        </ul>
      )}
      <Link to="/home" className="back-button"> 
        ⬅ Quay lại cửa hàng 
      </Link>
    </div>
  );
};

export default OrderHistory; // Xuất component để sử dụng ở nơi khác