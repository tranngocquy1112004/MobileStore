import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  if (!item?.id || !item.name || !item.image || typeof item.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", item);
    return null;
  }

  const handleDecrease = () => onUpdateQuantity(item.id, item.quantity - 1);
  const handleIncrease = () => onUpdateQuantity(item.id, item.quantity + 1);
  const handleRemove = () => onRemove(item.id);

  return (
    <li className="cart-item" aria-label={`Sản phẩm ${item.name} trong giỏ hàng`}>
      <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
      <div className="item-details">
        <span className="item-name">{item.name}</span>
        <div className="quantity-control">
          <button onClick={handleDecrease} disabled={item.quantity <= 1} aria-label="Giảm số lượng">
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={handleIncrease} aria-label="Tăng số lượng">
            +
          </button>
        </div>
        <span className="item-subtotal">Tổng: {formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
      </div>
      <button onClick={handleRemove} className="remove-item-button" aria-label="Xóa sản phẩm">
        Xóa
      </button>
    </li>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
