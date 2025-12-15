import React from "react";
import { ERROR_MESSAGES } from "../models/constants";

const OrderStatus = ({ isLoading, error, hasOrders }) => {
  if (isLoading) {
    return <div className="order-history-status">{ERROR_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return (
      <div className="order-history-status error">
        <p>😢 {error}</p>
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

export default OrderStatus;
