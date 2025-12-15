import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../../styles/OrderHistory.css";
import { AuthContext } from "../../context/AuthContext";
import { useUserOrders } from "./services/useUserOrders";
import OrderStatus from "./components/OrderStatus";
import OrderItem from "./components/OrderItem";
import { ERROR_MESSAGES } from "./models/constants";

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
