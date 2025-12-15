import React from "react";
import OrderItem from "./OrderItem";
import "../../../styles/AdminDashboard.css";

const UserItem = ({ user, userOrders, onDeleteUser, formatPrice }) => {
  if (!user?.username) return null;

  return (
    <li className="user-item" aria-label={`Người dùng ${user.username}`}>
      <div className="user-header-admin">
        <h3 className="user-username">👤 {user.username}</h3>
        <button
          className="delete-user-button"
          onClick={() => onDeleteUser(user.username)}
          aria-label={`Xóa người dùng ${user.username}`}
        >
          🗑️ Xóa Người Dùng
        </button>
      </div>
      <div className="user-orders">
        <h4>🧾 Đơn hàng của {user.username} ({userOrders.length}):</h4>
        {userOrders.length === 0 ? (
          <p className="empty-state-small">Người dùng này chưa có đơn hàng.</p>
        ) : (
          <ul className="order-list-admin" role="list">
            {userOrders.map((order) => (
              <OrderItem key={order.id} order={order} formatPrice={formatPrice} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};

export default React.memo(UserItem);
