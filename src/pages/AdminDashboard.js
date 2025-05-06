import React, { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";

// --- HẰNG SỐ ---
const LOCAL_STORAGE_USERS_KEY = "users";
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- HÀM TIỆN ÍCH ---
/**
 * Tải dữ liệu từ localStorage
 * @param {string} key - Khóa localStorage
 * @returns {Array} Dữ liệu đã phân tích hoặc mảng rỗng
 */
const loadDataFromStorage = (key) => {
  try {
    const storedData = localStorage.getItem(key);
    const parsedData = storedData ? JSON.parse(storedData) : [];
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error(`Lỗi khi tải dữ liệu từ localStorage cho khóa "${key}":`, error);
    return [];
  }
};

/**
 * Lưu dữ liệu vào localStorage
 * @param {string} key - Khóa localStorage
 * @param {Array} data - Dữ liệu cần lưu
 * @returns {boolean} Thành công hay thất bại
 */
const saveDataToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu dữ liệu vào localStorage cho khóa "${key}":`, error);
    return false;
  }
};

// --- THÀNH PHẦN CON ---
/**
 * Hiển thị thông tin đơn hàng
 * @param {Object} props - Props chứa thông tin đơn hàng
 */
const OrderItem = React.memo(({ order }) => {
  if (!order?.id) return null;
  return (
    <li className="order-item-admin" aria-label={`Đơn hàng #${order.id}`}>
      <p>
        <strong>ID Đơn hàng:</strong> #{order.id}
      </p>
      <p>
        <strong>Ngày:</strong>{" "}
        {order.date ? new Date(order.date).toLocaleString("vi-VN") : "N/A"}
      </p>
      <p>
        <strong>Tổng cộng:</strong> {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
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
              {((item?.price || 0) * (item?.quantity || 0)).toLocaleString("vi-VN")} VNĐ
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state-small">Không có sản phẩm trong đơn hàng này.</p>
      )}
    </li>
  );
});

/**
 * Hiển thị thông tin người dùng và đơn hàng của họ
 * @param {Object} props - Props chứa thông tin người dùng, đơn hàng, và hàm xóa
 */
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
        <h4>
          📦 Đơn hàng của {user.username} ({userOrders.length}):
        </h4>
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

// --- THÀNH PHẦN CHÍNH ---
/**
 * Trang quản trị admin
 */
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tải dữ liệu từ localStorage khi component mount
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

  // Xử lý xóa người dùng và đơn hàng của họ
  const handleDeleteUser = (usernameToDelete) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ?`)) {
      return;
    }

    const updatedUsers = users.filter((user) => user?.username !== usernameToDelete);
    const updatedOrders = orders.filter((order) => order?.username !== usernameToDelete);

    if (
      !saveDataToStorage(LOCAL_STORAGE_USERS_KEY, updatedUsers) ||
      !saveDataToStorage(LOCAL_STORAGE_ORDERS_KEY, updatedOrders)
    ) {
      setError("Lỗi khi lưu thay đổi. Dữ liệu có thể chưa được cập nhật đầy đủ.");
      return;
    }

    setUsers(updatedUsers);
    setOrders(updatedOrders);
  };

  // Tính toán đơn hàng theo người dùng
  const userOrdersMap = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      if (order?.username) {
        map[order.username] = map[order.username] || [];
        map[order.username].push(order);
      }
    });
    return map;
  }, [orders]);

  // Trạng thái đang tải
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  // Trạng thái lỗi
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p>
      </div>
    );
  }

  // Hiển thị chính
  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Trang Quản Trị</h1>
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
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;