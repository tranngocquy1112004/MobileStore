// pages/OrderHistory.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Component OrderHistory - Hiển thị lịch sử đơn hàng
const OrderHistory = () => {
  const [orders, setOrders] = useState([]); // State lưu danh sách đơn hàng

  // Lấy danh sách đơn hàng từ localStorage khi component mount
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);

  return (
    <div className="order-history-container">
      <h2>📜 Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
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
          ))}
        </ul>
      )}
      <Link to="/home" className="back-button">
        ⬅ Quay lại cửa hàng
      </Link>
    </div>
  );
};

export default OrderHistory;