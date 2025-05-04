import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./AdminDashboard.css";

// Constants for localStorage keys
const LOCAL_STORAGE_USERS_KEY = "users";
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// Utility function to load data from localStorage
const loadDataFromStorage = (key) => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return [];
    const parsedData = JSON.parse(storedData);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error(`Error loading data from localStorage for key "${key}":`, error);
    return [];
  }
};

// Utility function to save data to localStorage
const saveDataToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to localStorage for key "${key}":`, error);
    return false;
  }
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setError(null);

      const storedUsers = loadDataFromStorage(LOCAL_STORAGE_USERS_KEY);
      const storedOrders = loadDataFromStorage(LOCAL_STORAGE_ORDERS_KEY).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setUsers(storedUsers);
      setOrders(storedOrders);
      setIsLoading(false);
    };

    const timer = setTimeout(loadData, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle user deletion and their orders
  const handleDeleteUser = useCallback(
    (usernameToDelete) => {
      if (!window.confirm(`Are you sure you want to delete user "${usernameToDelete}" and all their orders?`)) {
        return;
      }

      const updatedUsers = users.filter((user) => user?.username !== usernameToDelete);
      const updatedOrders = orders.filter((order) => order?.username !== usernameToDelete);

      setUsers(updatedUsers);
      setOrders(updatedOrders);

      if (
        !saveDataToStorage(LOCAL_STORAGE_USERS_KEY, updatedUsers) ||
        !saveDataToStorage(LOCAL_STORAGE_ORDERS_KEY, updatedOrders)
      ) {
        alert("Error saving changes. Data may not be fully updated.");
      }
    },
    [users, orders]
  );

  // Memoize orders by user for performance optimization
  const userOrdersMap = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      if (order?.username) {
        if (!map[order.username]) map[order.username] = [];
        map[order.username].push(order);
      }
    });
    return map;
  }, [orders]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Loading admin data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Admin Dashboard</h1>

      <section className="admin-section">
        <h2 className="section-title">👥 Users ({users.length})</h2>

        {users.length === 0 ? (
          <p className="empty-state">No users registered yet.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => {
              if (!user || !user.username) return null;
              const userOrders = userOrdersMap[user.username] || [];

              return (
                <li key={user.username} className="user-item">
                  <div className="user-header-admin">
                    <h3 className="user-username">👤 {user.username}</h3>
                    <button
                      className="delete-user-button"
                      onClick={() => handleDeleteUser(user.username)}
                      aria-label={`Delete user ${user.username}`}
                    >
                      🗑️ Delete User
                    </button>
                  </div>

                  <div className="user-orders">
                    <h4>📦 Orders by {user.username} ({userOrders.length}):</h4>

                    {userOrders.length === 0 ? (
                      <p className="empty-state-small">No orders from this user yet.</p>
                    ) : (
                      <ul className="order-list-admin">
                        {userOrders.map((order) => (
                          <li key={order.id} className="order-item-admin">
                            <p><strong>Order ID:</strong> #{order.id}</p>
                            <p><strong>Date:</strong> {order.date ? new Date(order.date).toLocaleString('vi-VN') : 'N/A'}</p>
                            <p><strong>Total:</strong> {(order?.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</p>
                            <p><strong>Recipient:</strong> {order?.shippingInfo?.name || 'N/A'}</p>
                            <p><strong>Address:</strong> {order?.shippingInfo?.address || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order?.shippingInfo?.phone || 'N/A'}</p>

                            <h5>Order Items:</h5>
                            {Array.isArray(order?.items) && order.items.length > 0 ? (
                              order.items.map((item, itemIndex) => (
                                <li key={item.id || itemIndex}>
                                  {item?.name || 'Unknown Product'} (x{item?.quantity || 0}) -{' '}
                                  {((item?.price || 0) * (item?.quantity || 0)).toLocaleString('vi-VN')} VNĐ
                                </li>
                              ))
                            ) : (
                              <p className="empty-state-small">No items in this order.</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;