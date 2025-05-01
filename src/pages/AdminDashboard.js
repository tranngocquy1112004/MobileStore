// Import necessary React hooks: useState, useEffect, useCallback
import React, { useState, useEffect, useCallback } from "react";
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
  useEffect(() => {
    const loadData = () => {
      try {
        setError(null); // Clear any previous error

        // Retrieve user data from localStorage
        const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        let storedUsers = [];
        if (storedUsersData) {
            try {
                storedUsers = JSON.parse(storedUsersData);
            } catch (e) {
                console.error("Lỗi khi parse dữ liệu người dùng từ localStorage:", e);
            }
        }
        // Ensure loaded data is an array
        if (!Array.isArray(storedUsers)) {
            console.warn("Dữ liệu người dùng trong localStorage không phải là mảng, sử dụng mảng rỗng.");
            storedUsers = [];
        }

        // Retrieve order data from localStorage
        const storedOrdersData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
         let storedOrders = [];
         if (storedOrdersData) {
             try {
                 storedOrders = JSON.parse(storedOrdersData);
             } catch (e) {
                 console.error("Lỗi khi parse dữ liệu đơn hàng từ localStorage:", e);
             }
         }
        // Ensure loaded data is an array
         if (!Array.isArray(storedOrders)) {
             console.warn("Dữ liệu đơn hàng trong localStorage không phải là mảng, sử dụng mảng rỗng.");
             storedOrders = [];
         }


        // Update state with loaded data, sort orders by date descending
        setUsers(storedUsers);
        setOrders(storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));

        // console.log("Đã tải dữ liệu admin:", { users: storedUsers, orders: storedOrders }); // Dev log

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu admin:", err);
        setError("Không thể tải dữ liệu quản trị. Vui lòng thử lại sau.");
        setUsers([]); // Reset state on error
        setOrders([]);
      } finally {
        setIsLoading(false); // Loading finished
      }
    };

    // Simulate loading delay (optional)
    const timer = setTimeout(loadData, 500);

    // Cleanup: clear timeout if component unmounts
    return () => clearTimeout(timer);

  }, []); // Empty dependency array: runs only once on mount

  // --- Callback Hook to Delete a User and their Orders ---
  const handleDeleteUser = useCallback((usernameToDelete) => {
    // Confirmation dialog
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ không?`)) {
      return; // Stop if user cancels
    }

    // Filter users array
    const updatedUsers = users.filter(user => user?.username !== usernameToDelete);
    // Filter orders array
    const updatedOrders = orders.filter(order => order?.username !== usernameToDelete);

    // Update state
    setUsers(updatedUsers);
    setOrders(updatedOrders);

    // Save updated lists back to localStorage
    try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));
         console.log(`Đã xóa người dùng "${usernameToDelete}" và các đơn hàng liên quan.`); // Keep success log
    } catch (e) {
        console.error(`Lỗi khi lưu dữ liệu sau khi xóa người dùng "${usernameToDelete}" vào localStorage:`, e);
        alert("Lỗi khi lưu thay đổi. Dữ liệu có thể không được cập nhật đầy đủ."); // Notify user
    }


  }, [users, orders]); // Dependencies: depends on current users and orders state

  // --- Conditional Rendering ---
  // Show loading spinner
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Bảng điều khiển Admin</h1>

      {/* Section displaying the list of users */}
      <section className="admin-section">
        <h2 className="section-title">👥 Danh sách người dùng ({Array.isArray(users) ? users.length : 0})</h2> {/* Safety check */}

        {/* Conditional rendering: Empty users */}
        {Array.isArray(users) && users.length === 0 ? ( // Safety check
           <p className="empty-state">Chưa có người dùng nào đăng ký.</p>
        ) : (
           // Render user list
           <ul className="user-list">
             {/* Ensure users is array before mapping */}
             {Array.isArray(users) && users.map((user) => {
                // Ensure user object and username exist
                if (!user || !user.username) {
                    console.warn("Dữ liệu người dùng không hợp lệ trong danh sách:", user);
                    return null; // Skip rendering invalid user
                }
                // Filter orders for the current user (Potential performance issue for large datasets)
                 // Consider pre-processing orders if performance becomes a concern.
                const userOrders = Array.isArray(orders) ? orders.filter(order => order?.username === user.username) : [];


                return (
                  // Use user.username as the key
                  <li key={user.username} className="user-item">
                    <div className="user-header-admin">
                      <h3 className="user-username">👤 {user.username}</h3> {/* Display username */}
                      {/* Delete user button */}
                      <button
                        className="delete-user-button"
                        onClick={() => handleDeleteUser(user.username)}
                        aria-label={`Xóa người dùng ${user.username}`}
                      >
                        🗑️ Xóa người dùng
                      </button>
                    </div>

                    {/* Section displaying orders for this user */}
                    <div className="user-orders">
                      <h4>📦 Đơn hàng của {user.username} ({userOrders.length}):</h4>

                      {/* Conditional rendering: Empty orders for this user */}
                      {userOrders.length === 0 ? (
                         <p className="empty-state-small">Chưa có đơn hàng nào từ người dùng này.</p>
                      ) : (
                         // Render user's order list
                         <ul className="order-list-admin">
                           {/* Ensure userOrders is array before mapping */}
                           {Array.isArray(userOrders) && userOrders.map(order => {
                                // Ensure order object and ID exist for key
                                if (!order || typeof order.id === 'undefined') {
                                    console.warn("Dữ liệu đơn hàng không hợp lệ trong danh sách:", order);
                                    return null; // Skip rendering invalid order
                                }
                                return (
                                  // Use order.id as the key
                                  <li key={order.id} className="order-item-admin">
                                    {/* Display order details with safety checks */}
                                    <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
                                    {/* Format date/time */}
                                     {/* Added optional chaining for date */}
                                    <p><strong>Ngày đặt:</strong> {order.date ? new Date(order.date).toLocaleString('vi-VN') : 'N/A'}</p>
                                    {/* Format total price */}
                                     {/* Added optional chaining and default 0 */}
                                    <p><strong>Tổng tiền:</strong> {(order?.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</p>
                                    {/* Shipping info with optional chaining and default values */}
                                     <p><strong>Người nhận:</strong> {order?.shippingInfo?.name || 'N/A'}</p>
                                     <p><strong>Địa chỉ:</strong> {order?.shippingInfo?.address || 'N/A'}</p>
                                     <p><strong>Điện thoại:</strong> {order?.shippingInfo?.phone || 'N/A'}</p>

                                    {/* Product items within the order */}
                                    <h5>Chi tiết sản phẩm:</h5>
                                    {/* Ensure order.items is an array before mapping */}
                                    {Array.isArray(order?.items) && order.items.map((item, itemIndex) => {
                                        // Ensure item object and ID exist for key (fallback to index)
                                        if (!item) {
                                             console.warn("Dữ liệu sản phẩm không hợp lệ trong đơn hàng:", item);
                                             return null; // Skip rendering invalid item
                                        }
                                        return (
                                           // Use item.id as key, fallback to index
                                           <li key={item.id || itemIndex}>
                                              {/* Display item details with safety checks */}
                                              {item?.name || 'Sản phẩm không rõ'} (x{item?.quantity || 0}) - {((item?.price || 0) * (item?.quantity || 0)).toLocaleString('vi-VN')} VNĐ
                                           </li>
                                        );
                                    })}
                                     {Array.isArray(order?.items) && order.items.length === 0 && (
                                         <p className="empty-state-small">Không có sản phẩm trong đơn hàng này.</p>
                                     )}
                                     {!Array.isArray(order?.items) && (
                                          <p className="empty-state-small">Dữ liệu sản phẩm đơn hàng không hợp lệ.</p>
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