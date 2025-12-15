import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
import { AuthContext } from "../context/AuthContext";
import { useUserOrders } from "../hooks/useUserOrders";
import "../styles/OrderHistory.css";

const ERROR_MESSAGES = {
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem đơn hàng.",
  NO_ORDERS: "Bạn chưa có đơn hàng nào",
  LOADING: "Đang tải lịch sử đơn hàng...",
};

const OrderItemsList = React.memo(({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <li>Không có sản phẩm nào</li>;
  }

  return items.map((item, index) => (
    <li key={item.id || index}>
      {item.name || "Sản phẩm không rõ"} (x{item.quantity || 0}) -{" "}
      {formatCurrency((item.price || 0) * (item.quantity || 0))}
    </li>
  ));
});

const OrderItem = React.memo(({ order }) => {
  if (!order?.id) return null;

  return (
    <li className="order-item" aria-label={`Đơn hàng #${order.id}`}>
      <p>
        <strong>ID đơn hàng:</strong> #{order.id}
      </p>
      <p>
        <strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString("vi-VN")}
      </p>
      <p>
        <strong>Tổng tiền:</strong> {formatCurrency(order.totalPrice || 0)}
      </p>
      <p>
        <strong>Địa chỉ:</strong> {order.shippingInfo?.address || "N/A"}
      </p>
      <p>
        <strong>Điện thoại:</strong> {order.shippingInfo?.phone || "N/A"}
      </p>
      <div className="order-items-detail">
        <h5>Chi tiết sản phẩm:</h5>
        <ul>
          <OrderItemsList items={order.items} />
        </ul>
      </div>
    </li>
  );
});

const OrderStatus = ({ isLoading, error, hasOrders }) => {
  if (isLoading) {
    return <div className="order-history-status">{ERROR_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return (
      <div className="order-history-status error">
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()} aria-label="Thử tải lại">
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

const OrderHistory = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const { userOrders, isLoading, error } = useUserOrders();

  if (!isLoggedIn || !user?.username) {
    return (
      <div className="order-history-container">
        <div className="order-history-status">{ERROR_MESSAGES.LOGIN_REQUIRED}</div>
        <Link to="/" className="order-history-back">
          Đăng nhập
        </Link>
      </div>
    );
  }

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
