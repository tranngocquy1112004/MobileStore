import React from "react";
import { formatCurrency } from "../../../utils/formatters";

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

OrderItemsList.displayName = "OrderItemsList";

export default OrderItemsList;
