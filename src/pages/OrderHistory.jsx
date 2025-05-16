import React, { useEffect, useReducer, useMemo, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// --- Hằng số ---
const LOCAL_STORAGE_ORDERS_KEY = "orders";
const ERROR_MESSAGES = {
  STORAGE_ERROR: "Không thể lấy dữ liệu đơn hàng từ bộ nhớ. Vui lòng thử lại.",
  LOAD_ERROR: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.",
  NO_ORDERS: "Bạn chưa có đơn hàng nào",
  LOADING: "Đang tải lịch sử đơn hàng...",
};

// --- Reducer và trạng thái ban đầu ---
const initialState = {
  userOrders: [],
  isLoading: true,
  error: null,
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, userOrders: action.payload, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, userOrders: [], isLoading: false, error: action.payload };
    default:
      return state;
  }
};

// --- Hàm tiện ích ---
const getOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
  }
};

const filterOrdersByUsername = (orders, username) =>
  Array.isArray(orders) && username ? orders.filter((order) => order.username === username) : [];

const sortOrdersByDate = (orders) =>
  Array.isArray(orders) ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

// --- Custom Hook ---
const useUserOrders = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      dispatch({ type: "FETCH_SUCCESS", payload: [] });
      return;
    }

    dispatch({ type: "FETCH_START" });
    try {
      const allOrders = getOrdersFromStorage();
      const filteredOrders = filterOrdersByUsername(allOrders, user.username);
      const sortedOrders = sortOrdersByDate(filteredOrders);
      dispatch({ type: "FETCH_SUCCESS", payload: sortedOrders });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message || ERROR_MESSAGES.LOAD_ERROR });
    }
  }, [user, isLoggedIn]);

  return state;
};

// --- Thành phần con ---
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
        <ul>
          <OrderItemsList items={order.items} />
        </ul>
      </div>
    </li>
  );
});

const OrderItemsList = React.memo(({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <li>Không có sản phẩm nào</li>;
  }

  return items.map((item, index) => (
    <li key={item.id || index}>
      {item.name || "Sản phẩm không rõ"} (x{item.quantity || 0}) -{" "}
      {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
    </li>
  ));
});

const OrderStatus = ({ isLoading, error, hasOrders }) => {
  if (isLoading) {
    return <div className="order-history-status">{ERROR_MESSAGES.LOADING}</div>;
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

  if (!hasOrders) {
    return <div className="order-history-status">{ERROR_MESSAGES.NO_ORDERS}</div>;
  }

  return null;
};

// --- Thành phần chính ---
const OrderHistory = () => {
  const { userOrders, isLoading, error } = useUserOrders();

  const hasOrders = userOrders.length > 0;

  return (
    <div className="order-history-container">
      <OrderStatus isLoading={isLoading} error={error} hasOrders={hasOrders} />
      {hasOrders && (
        <ul className="order-list" role="list">
          {userOrders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;