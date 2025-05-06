import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// --- HẰNG SỐ ---
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- HÀM TIỆN ÍCH ---
/**
 * Lấy danh sách đơn hàng từ localStorage
 * @returns {Array} Danh sách đơn hàng
 */
const getOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (err) {
    console.error("Lỗi phân tích dữ liệu đơn hàng:", err);
    return [];
  }
};

/**
 * Lọc đơn hàng theo tên người dùng
 * @param {Array} orders - Danh sách đơn hàng
 * @param {string} username - Tên người dùng
 * @returns {Array} Danh sách đơn hàng đã lọc
 */
const filterOrdersByUsername = (orders, username) =>
  Array.isArray(orders) ? orders.filter((order) => order.username === username) : [];

/**
 * Sắp xếp đơn hàng theo ngày (mới nhất trước)
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Array} Danh sách đơn hàng đã sắp xếp
 */
const sortOrdersByDate = (orders) =>
  Array.isArray(orders) ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

// --- HOOK TÙY CHỈNH ---
/**
 * Hook để lấy và quản lý đơn hàng của người dùng
 * @returns {Object} Đơn hàng, trạng thái tải, và lỗi
 */
const useUserOrders = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      setIsLoading(false);
      setUserOrders([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const allOrders = getOrdersFromStorage();
      const filteredOrders = filterOrdersByUsername(allOrders, user.username);
      const sortedOrders = sortOrdersByDate(filteredOrders);
      setUserOrders(sortedOrders);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại.");
      setUserOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoggedIn]);

  return { userOrders, isLoading, error };
};

// --- THÀNH PHẦN CON ---
/**
 * Hiển thị một đơn hàng
 * @param {Object} props - Props chứa thông tin đơn hàng
 */
const OrderItem = React.memo(({ order }) => (
  <li className="order-item" aria-label={`Đơn hàng #${order.id}`}>
    <p>
      <strong>ID Đơn hàng:</strong> #{order.id}
    </p>
    <p>
      <strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString("vi-VN")}
    </p>
    <p>
      <strong>Tổng tiền:</strong> {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
    </p>
    <p>
      <strong>Người nhận:</strong> {order.shippingInfo?.name || "N/A"}
    </p>
    <p>
      <strong>Địa chỉ:</strong> {order.shippingInfo?.address || "N/A"}
    </p>
    <p>
      <strong>Điện thoại:</strong> {order.shippingInfo?.phone || "N/A"}
    </p>
    <div className="order-items-detail">
      <h5>Chi tiết sản phẩm:</h5>
      <ul>{renderOrderItems(order.items)}</ul>
    </div>
  </li>
));

/**
 * Hiển thị danh sách sản phẩm trong đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 * @returns {JSX.Element} JSX hiển thị danh sách sản phẩm
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

// --- THÀNH PHẦN CHÍNH ---
/**
 * Thành phần hiển thị lịch sử đơn hàng
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
        <button onClick={() => window.location.reload()} aria-label="Thử lại tải trang">
          Thử lại
        </button>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return <div className="order-history-status">Bạn chưa có đơn hàng nào</div>;
  }

  return (
    <div className="order-history-container">
      <ul className="order-list" role="list">
        {userOrders.map((order) => (
          <OrderItem key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;