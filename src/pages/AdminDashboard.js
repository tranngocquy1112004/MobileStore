import React, { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";
import { formatCurrency } from "../utils/formatters";

// --- Constants ---
const LOCAL_STORAGE_USERS_KEY = "users";
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- Utilities ---
const loadDataFromStorage = (key) => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) || [] : [];
  } catch (error) {
    console.error(`Lỗi khi tải dữ liệu từ localStorage cho khóa "${key}":`, error);
    return [];
  }
};

const saveDataToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu dữ liệu vào localStorage cho khóa "${key}":`, error);
    return false;
  }
};

// --- Child Components ---
const OrderItem = React.memo(({ order }) => {
  if (!order?.id) return null;

  return (
    <li className="order-item-admin" aria-label={`??n h?ng #${order.id}`}>
      <p><strong>ID đơn hàng:</strong> #{order.id}</p>
      <p><strong>Ngày:</strong> {order.date ? new Date(order.date).toLocaleString("vi-VN") : "N/A"}</p>
      <p><strong>Tổng cộng:</strong> {formatCurrency(order.totalPrice || 0)}</p>
      <p><strong>Người nhận:</strong> {order.shippingInfo?.name || "N/A"}</p>
      <p><strong>Địa chỉ:</strong> {order.shippingInfo?.address || "N/A"}</p>
      <p><strong>Điện thoại:</strong> {order.shippingInfo?.phone || "N/A"}</p>
      <h5>Sản phẩm:</h5>
      {Array.isArray(order.items) && order.items.length > 0 ? (
        <ul role="list">
          {order.items.map((item, index) => (
            <li key={item?.id || index}>
              {item?.name || "S?n ph?m kh?ng r?"} (x{item?.quantity || 0}) -{" "}
              {formatCurrency((item?.price || 0) * (item?.quantity || 0))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state-small">Không có sản phẩm nào trong đơn hàng.</p>
      )}
    </li>
  );
});

const UserItem = React.memo(({ user, userOrders, onDeleteUser }) => {
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
        <h4>📦 Đơn hàng của {user.username} ({userOrders.length}):</h4>
        {userOrders.length === 0 ? (
          <p className="empty-state-small">Người dùng này chưa có đơn hàng.</p>
        ) : (
          <ul className="order-list-admin" role="list">
            {userOrders.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
});

// --- Main Component ---
const AdminDashboard = () => {
  const [state, setState] = useState({ users: [], orders: [], isLoading: true, error: null });

  useEffect(() => {
    const loadData = () => {
      const storedUsers = loadDataFromStorage(LOCAL_STORAGE_USERS_KEY);
      const storedOrders = loadDataFromStorage(LOCAL_STORAGE_ORDERS_KEY).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setState({ users: storedUsers, orders: storedOrders, isLoading: false, error: null });
    };

    const timer = setTimeout(loadData, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteUser = (usernameToDelete) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ?`)) {
      return;
    }

    const updatedUsers = state.users.filter((user) => user?.username !== usernameToDelete);
    const updatedOrders = state.orders.filter((order) => order?.username !== usernameToDelete);

    if (
      !saveDataToStorage(LOCAL_STORAGE_USERS_KEY, updatedUsers) ||
      !saveDataToStorage(LOCAL_STORAGE_ORDERS_KEY, updatedOrders)
    ) {
      setState((prev) => ({ ...prev, error: "Lỗi khi lưu thay đổi. Dữ liệu có thể chưa được cập nhật đầy đủ." }));
      return;
    }

    setState((prev) => ({ ...prev, users: updatedUsers, orders: updatedOrders }));
  };

  const userOrdersMap = useMemo(() => {
    const map = {};
    state.orders.forEach((order) => {
      if (order?.username) {
        map[order.username] = map[order.username] || [];
        map[order.username].push(order);
      }
    });
    return map;
  }, [state.orders]);

  if (state.isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {state.error}</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Trang Quản Trị</h1>
      <section className="admin-section">
        <h2 className="section-title">👥 Người Dùng ({state.users.length})</h2>
        {state.users.length === 0 ? (
          <p className="empty-state">Chưa có người dùng nào đăng ký.</p>
        ) : (
          <ul className="user-list" role="list">
            {state.users.map((user) => (
              <UserItem
                key={user.username}
                user={user}
                userOrders={userOrdersMap[user.username] || []}
                onDeleteUser={handleDeleteUser}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
