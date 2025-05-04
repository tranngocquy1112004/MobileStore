import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// Hằng số cho key lưu đơn hàng trong localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders";

/**
 * Custom hook để lấy và quản lý đơn hàng của người dùng
 * @returns {Object} Trả về đơn hàng, trạng thái tải và lỗi
 */
const useUserOrders = () => {
  const { user, isLoggedIn } = useContext(AuthContext);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = () => {
      setIsLoading(true);
      setError(null);
      setUserOrders([]);

      if (!isLoggedIn || !user || !user.username) {
        setIsLoading(false);
        return;
      }

      try {
        const allOrders = getOrdersFromStorage();
        const filteredOrders = filterOrdersByUsername(allOrders, user.username);
        const sortedOrders = sortOrdersByDate(filteredOrders);
        setUserOrders(sortedOrders);
        console.log(`Đã tải ${sortedOrders.length} đơn hàng cho ${user.username}`);
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user, isLoggedIn]);

  return { userOrders, isLoading, error };
};

// Hàm lấy dữ liệu từ localStorage
const getOrdersFromStorage = () => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (!storedData) return [];

  try {
    const orders = JSON.parse(storedData);
    return Array.isArray(orders) ? orders : [];
  } catch (err) {
    console.error("Lỗi phân tích dữ liệu đơn hàng:", err);
    return [];
  }
};

// Hàm lọc đơn hàng theo tên người dùng
const filterOrdersByUsername = (orders, username) => {
  return orders.filter(order => order.username === username);
};

// Hàm sắp xếp đơn hàng theo ngày (mới nhất trước)
const sortOrdersByDate = (orders) => {
  return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Component hiển thị lịch sử đơn hàng
 */
const OrderHistory = () => {
  const { userOrders, isLoading, error } = useUserOrders();

  if (isLoading) {
    return <div className="order-history-status">Đang tải lịch sử đơn hàng...</div>;
  }

  if (error) {
    return (
      <div className="order-history-status error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return <div className="order-history-status">Bạn chưa có đơn hàng nào</div>;
  }

  return (
    <div className="order-history-container">
      <ul className="order-list">
        {userOrders.map((order) => (
          <li key={order.id} className="order-item">
            <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString("vi-VN")}</p>
            <p><strong>Tổng tiền:</strong> {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ</p>
            <p><strong>Người nhận:</strong> {order.shippingInfo?.name || "N/A"}</p>
            <p><strong>Địa chỉ:</strong> {order.shippingInfo?.address || "N/A"}</p>
            <p><strong>Điện thoại:</strong> {order.shippingInfo?.phone || "N/A"}</p>
            <div className="order-items-detail">
              <h5>Chi tiết sản phẩm:</h5>
              <ul>{renderOrderItems(order.items)}</ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Hàm hiển thị danh sách sản phẩm trong đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 * @returns {JSX.Element} - JSX hiển thị danh sách sản phẩm
 */
const renderOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <li>Không có thông tin sản phẩm</li>;
  }

  return items.map((item, index) => (
    <li key={item.id || index}>
      {item.name || "Sản phẩm không rõ"} (x{item.quantity || 0}) -{" "}
      {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
    </li>
  ));
};

export default OrderHistory;