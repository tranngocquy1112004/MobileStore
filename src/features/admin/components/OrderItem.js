import React from "react";
import "../../../styles/AdminDashboard.css";

const OrderItem = ({ order, formatPrice }) => {
  if (!order?.id) return null;

  return (
    <li className="order-item-admin" aria-label={`Đơn hàng #${order.id}`}>
      <p>
        <strong>ID đơn hàng:</strong> #{order.id}
      </p>
      <p>
        <strong>Ngày:</strong> {order.date ? new Date(order.date).toLocaleString("vi-VN") : "N/A"}
      </p>
      <p>
        <strong>Tổng cộng:</strong> {formatPrice(order.totalPrice)}
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
      <h5>Sản phẩm:</h5>
      {Array.isArray(order.items) && order.items.length > 0 ? (
        <ul role="list">
          {order.items.map((item, index) => (
            <li key={item?.id || index}>
              {item?.name || "Sản phẩm không rõ"} (x{item?.quantity || 0}) -{" "}
              {formatPrice((item?.price || 0) * (item?.quantity || 0))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state-small">Không có sản phẩm nào trong đơn hàng.</p>
      )}
    </li>
  );
};

export default React.memo(OrderItem);
