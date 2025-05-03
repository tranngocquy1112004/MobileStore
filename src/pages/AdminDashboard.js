// src/pages/AdminDashboard.js

// Import necessary React hooks: useState, useEffect, useCallback, useMemo
import React, { useState, useEffect, useCallback, useMemo } from "react"; // Thêm useMemo
// Import the CSS file for styling this component
import "./AdminDashboard.css";

// Define constant keys to access data in localStorage
const LOCAL_STORAGE_USERS_KEY = "users"; // Key for user data
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Key for order data

// Define the AdminDashboard functional component
const AdminDashboard = () => {
  // --- State Variables ---
  const [users, setUsers] = useState([]); // List of users
  const [orders, setOrders] = useState([]); // List of orders
  const [isLoading, setIsLoading] = useState(true); // Loading status
  const [error, setError] = useState(null); // Error message

  // --- Effect Hook to Load Data from localStorage on Mount ---
  // Effect này chạy một lần duy nhất khi component được mount để tải dữ liệu ban đầu.
  useEffect(() => {
    const loadData = () => {
      try {
        setError(null); // Clear any previous error

        // --- Tải dữ liệu người dùng ---
        const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        let storedUsers = [];
        if (storedUsersData) {
            try {
                // Cố gắng parse dữ liệu JSON
                storedUsers = JSON.parse(storedUsersData);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        // Đảm bảo dữ liệu đã tải là một mảng, nếu không thì sử dụng mảng rỗng
        if (!Array.isArray(storedUsers)) {
            console.warn("User data is not an array, using empty array");
            storedUsers = [];
        }

        // --- Tải dữ liệu đơn hàng ---
        const storedOrdersData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        let storedOrders = [];
        if (storedOrdersData) {
            try {
                // Cố gắng parse dữ liệu JSON
                storedOrders = JSON.parse(storedOrdersData);
            } catch (e) {
                console.error("Error parsing order data:", e);
            }
        }
        // Đảm bảo dữ liệu đã tải là một mảng, nếu không thì sử dụng mảng rỗng
        if (!Array.isArray(storedOrders)) {
            console.warn("Order data is not an array, using empty array");
            storedOrders = [];
        }


        // Cập nhật state với dữ liệu đã tải, sắp xếp đơn hàng theo ngày giảm dần (mới nhất trước)
        setUsers(storedUsers);
        // Tạo bản sao trước khi sắp xếp để tránh thay đổi mảng gốc
        setOrders([...storedOrders].sort((a, b) => new Date(b.date) - new Date(a.date)));

        // console.log("Đã tải dữ liệu admin:", { users: storedUsers, orders: storedOrders }); // Dev log

      } catch (err) {
        // Bắt các lỗi khác có thể xảy ra trong quá trình tải
        console.error("Error loading admin data:", err);
        setError("Failed to load admin data. Please try again later.");
        setUsers([]); // Reset state về rỗng khi có lỗi
        setOrders([]);
      } finally {
        setIsLoading(false); // Quá trình tải hoàn thành
      }
    };

    // Simulate loading delay (optional) - Tạm hoãn việc tải dữ liệu để thấy hiệu ứng loading
    const timer = setTimeout(loadData, 500);

    // Cleanup function: clear timeout nếu component bị unmount trước khi timeout kết thúc
    return () => clearTimeout(timer);

  }, []); // Dependency array rỗng []: effect chỉ chạy một lần duy nhất khi mount

  // --- Callback Hook để xóa người dùng và các đơn hàng của họ ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const handleDeleteUser = useCallback((usernameToDelete) => {
    // Dialog xác nhận từ người dùng
    if (!window.confirm(`Are you sure you want to delete user "${usernameToDelete}" and all their orders?`)) {
      return; // Dừng nếu người dùng hủy bỏ
    }

    // Lọc mảng người dùng: giữ lại những người dùng có username khác với username cần xóa
    const updatedUsers = users.filter(user => user?.username !== usernameToDelete);
    // Lọc mảng đơn hàng: giữ lại những đơn hàng có username khác với username cần xóa
    const updatedOrders = orders.filter(order => order?.username !== usernameToDelete);

    // Cập nhật state với danh sách đã lọc
    setUsers(updatedUsers);
    setOrders(updatedOrders);

    // Lưu danh sách đã cập nhật trở lại localStorage
    try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));
    } catch (e) {
        console.error(`Error saving data after deleting user "${usernameToDelete}":`, e);
        // Thông báo lỗi cho người dùng nếu không lưu được
        alert("Error saving changes. Data may not be fully updated.");
    }


  }, [users, orders]); // Dependencies: phụ thuộc vào state users và orders hiện tại

  // --- Render có điều kiện ---
  // Hiển thị spinner loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Loading admin data...</p>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p>
      </div>
    );
  }

  // --- Render chính của Component ---
  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Admin Dashboard</h1>

      {/* Phần hiển thị danh sách người dùng */}
      <section className="admin-section">
        {/* Hiển thị số lượng người dùng, kiểm tra an toàn users là mảng */}
        <h2 className="section-title">👥 Users ({Array.isArray(users) ? users.length : 0})</h2>

        {/* Render có điều kiện: Nếu không có người dùng nào */}
        {Array.isArray(users) && users.length === 0 ? ( // Kiểm tra an toàn và số lượng
            <p className="empty-state">No users registered yet.</p>
        ) : (
            // Render danh sách người dùng
            <ul className="user-list">
              {/* Đảm bảo users là mảng trước khi map */}
              {Array.isArray(users) && users.map((user) => {
                // Kiểm tra an toàn cho đối tượng người dùng và username
                if (!user || !user.username) {
                    console.warn("Invalid user data:", user);
                    return null; // Bỏ qua render người dùng không hợp lệ
                }
                 // Lọc đơn hàng cho người dùng hiện tại (Có thể ảnh hưởng hiệu suất với tập dữ liệu lớn)
                 // Nếu hiệu suất là vấn đề, cân nhắc tiền xử lý đơn hàng trước khi render.
                 const userOrders = Array.isArray(orders) ? orders.filter(order => order?.username === user.username) : [];


                return (
                  // Sử dụng user.username làm key duy nhất
                  <li key={user.username} className="user-item">
                    <div className="user-header-admin">
                      <h3 className="user-username">👤 {user.username}</h3> {/* Hiển thị username */}
                       {/* Nút xóa người dùng */}
                      <button
                        className="delete-user-button"
                        onClick={() => handleDeleteUser(user.username)}
                        aria-label={`Delete user ${user.username}`}
                      >
                        🗑️ Delete User
                      </button>
                    </div>

                    {/* Phần hiển thị đơn hàng của người dùng này */}
                    <div className="user-orders">
                      <h4>📦 Orders by {user.username} ({userOrders.length}):</h4>

                      {/* Render có điều kiện: Nếu người dùng này chưa có đơn hàng */}
                      {userOrders.length === 0 ? (
                          <p className="empty-state-small">No orders from this user yet.</p>
                      ) : (
                          // Render danh sách đơn hàng của người dùng
                          <ul className="order-list-admin">
                            {/* Đảm bảo userOrders là mảng trước khi map */}
                            {Array.isArray(userOrders) && userOrders.map(order => {
                                 // Kiểm tra an toàn cho đối tượng đơn hàng và ID (dùng làm key)
                                 if (!order || typeof order.id === 'undefined') {
                                     console.warn("Invalid order data:", order);
                                     return null; // Bỏ qua render đơn hàng không hợp lệ
                                 }
                                return (
                                  // Sử dụng order.id làm key duy nhất
                                  <li key={order.id} className="order-item-admin">
                                     {/* Hiển thị chi tiết đơn hàng với kiểm tra an toàn */}
                                    <p><strong>Order ID:</strong> #{order.id}</p>
                                     {/* Định dạng ngày/giờ với kiểm tra an toàn cho order.date */}
                                    <p><strong>Date:</strong> {order.date ? new Date(order.date).toLocaleString('vi-VN') : 'N/A'}</p>
                                     {/* Định dạng tổng tiền với kiểm tra an toàn và giá trị mặc định */}
                                    <p><strong>Total:</strong> {(order?.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</p>
                                     {/* Thông tin giao hàng với optional chaining và giá trị mặc định */}
                                     <p><strong>Recipient:</strong> {order?.shippingInfo?.name || 'N/A'}</p>
                                     <p><strong>Address:</strong> {order?.shippingInfo?.address || 'N/A'}</p>
                                     <p><strong>Phone:</strong> {order?.shippingInfo?.phone || 'N/A'}</p>

                                     {/* Các sản phẩm trong đơn hàng */}
                                    <h5>Order Items:</h5>
                                     {/* Đảm bảo order.items là mảng trước khi map */}
                                     {Array.isArray(order?.items) && order.items.map((item, itemIndex) => {
                                          // Kiểm tra an toàn cho đối tượng item (dùng làm key, fallback về index)
                                          if (!item) {
                                               console.warn("Invalid item data:", item);
                                               return null; // Bỏ qua render item không hợp lệ
                                          }
                                          return (
                                              // Sử dụng item.id làm key, fallback về itemIndex
                                              <li key={item.id || itemIndex}>
                                                  {/* Hiển thị chi tiết item với kiểm tra an toàn */}
                                                  {item?.name || 'Unknown Product'} (x{item?.quantity || 0}) - {((item?.price || 0) * (item?.quantity || 0)).toLocaleString('vi-VN')} VNĐ
                                              </li>
                                          );
                                      })}
                                       {/* Thông báo nếu danh sách item rỗng hoặc không hợp lệ */}
                                       {Array.isArray(order?.items) && order.items.length === 0 && (
                                            <p className="empty-state-small">No items in this order.</p>
                                        )}
                                        {!Array.isArray(order?.items) && (
                                             <p className="empty-state-small">Invalid order items data.</p>
                                         )}
                                  </li>
                                );
                             })}
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

// Export the AdminDashboard component
export default AdminDashboard;
