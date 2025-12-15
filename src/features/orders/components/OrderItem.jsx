import React from "react";
import OrderItemsList from "./OrderItemsList";
import { formatCurrency } from "../../../utils/formatters";

const OrderItem = React.memo(({ order }) => {
  if (!order?.id) return null;

  return (
    <li className="order-item" aria-label={`Đơn hàng #${order.id}`}>
      <p>
        <strong>ID Đơn hàng:</strong> #{order.id}
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

OrderItem.displayName = "OrderItem";

export default OrderItem;
