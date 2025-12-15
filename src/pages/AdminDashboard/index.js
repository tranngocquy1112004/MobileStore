import React from "react";
import { useAdminData } from "./useAdminData";
import UserItem from "./components/UserItem";
import { MESSAGES } from "./constants";
import "../../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { users, orders, isLoading, error, handleDeleteUser, userOrdersMap, formatOrderTotal } =
    useAdminData();

  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">⚠️ {error || MESSAGES.LOAD_ERROR}</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">🛠️ Trang Quản Trị</h1>
      <section className="admin-section">
        <h2 className="section-title">👥 Người Dùng ({users.length})</h2>
        {users.length === 0 ? (
          <p className="empty-state">Chưa có người dùng nào đăng ký.</p>
        ) : (
          <ul className="user-list" role="list">
            {users.map((user) => (
              <UserItem
                key={user.username}
                user={user}
                userOrders={userOrdersMap[user.username] || []}
                onDeleteUser={handleDeleteUser}
                formatPrice={formatOrderTotal}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
