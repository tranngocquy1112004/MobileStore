import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// --- Constants ---
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- Utilities ---
const getOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
    return [];
  }
};

const filterOrdersByUsername = (orders, username) =>
  Array.isArray(orders) && username ? orders.filter((order) => order.username === username) : [];

const sortOrdersByDate = (orders) =>
  Array.isArray(orders) ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

// --- Custom Hook ---
const useUserOrders = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const [state, setState] = useState({ userOrders: [], isLoading: true, error: null });

  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      setState({ userOrders: [], isLoading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const allOrders = getOrdersFromStorage();
      const filteredOrders = filterOrdersByUsername(allOrders, user.username);
      const sortedOrders = sortOrdersByDate(filteredOrders);
      setState((prev) => ({ ...prev, userOrders: sortedOrders, isLoading: false }));
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      setState((prev) => ({ ...prev, error: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.", isLoading: false }));
    }
  }, [user, isLoggedIn]);

  return state;
};

// --- Child Components ---
const OrderItem = React.memo(({ order }) => {
  if (!order?.id) return null;

  return (
    <li className="order-item" aria-label={`Đơn hàng #${order.id}`}>
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
  );
});

const renderOrderItems = (items) =>
  !Array.isArray(items) || items.length === 0 ? (
    <li>Không có sản phẩm nào</li>
  ) : (
    items.map((item, index) => (
      <li key={item.id || index}>
        {item.name || "Sản phẩm không rõ"} (x{item.quantity || 0}) -{" "}
        {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
      </li>
    ))
  );

// --- Main Component ---
const OrderHistory = () => {
  const { userOrders, isLoading, error } = useUserOrders();

  if (isLoading) return <div className="order-history-status">Đang tải lịch sử đơn hàng...</div>;
  if (error) return (
    <div className="order-history-status error">
      <p>❌ {error}</p>
      <button onClick={() => window.location.reload()} aria-label="Thử lại tải trang">Thử lại</button>
    </div>
  );
  if (userOrders.length === 0) return <div className="order-history-status">Bạn chưa có đơn hàng nào</div>;

  return (
    <div className="order-history-container">
      <ul className="order-list" role="list">
        {userOrders.map((order) => <OrderItem key={order.id} order={order} />)}
      </ul>
    </div>
  );
};

export default OrderHistory;