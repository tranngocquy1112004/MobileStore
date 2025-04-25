import React, { useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useState để quản lý trạng thái cục bộ (danh sách người dùng, danh sách đơn hàng), useEffect để thực hiện các tác vụ phụ (side effects) như đọc dữ liệu từ localStorage khi component được mount, và useCallback để ghi nhớ các hàm xử lý sự kiện (như xóa người dùng).
import "./AdminDashboard.css"; // Import file CSS để định dạng giao diện cho component Admin Dashboard này.

// --- Định nghĩa các hằng số ---

// Khóa sử dụng để lưu trữ danh sách tất cả người dùng đã đăng ký trong localStorage.
// Phải khớp với key được sử dụng trong component Account.
const LOCAL_STORAGE_USERS_KEY = "users";
// Khóa sử dụng để lưu trữ danh sách tất cả các đơn hàng đã đặt trong localStorage.
// Phải khớp với key được sử dụng trong component OrderHistory và CartPage.
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- Component AdminDashboard ---
// Component này hiển thị giao diện quản trị đơn giản, cho phép xem danh sách người dùng
// và các đơn hàng mà họ đã đặt (dựa trên dữ liệu lưu trong localStorage).
const AdminDashboard = () => {
  // --- State quản lý dữ liệu ---
  // State 'users': Lưu trữ danh sách tất cả người dùng đã đăng ký. Ban đầu là mảng rỗng.
  const [users, setUsers] = useState([]);
  // State 'orders': Lưu trữ danh sách tất cả các đơn hàng đã đặt. Ban đầu là mảng rỗng.
  const [orders, setOrders] = useState([]);
  // State 'isLoading': Boolean theo dõi trạng thái đang tải dữ liệu. Ban đầu là true.
  const [isLoading, setIsLoading] = useState(true);
  // State 'error': Lưu trữ thông báo lỗi nếu có vấn đề khi tải dữ liệu. Ban đầu là null.
  const [error, setError] = useState(null);

  // --- Effect hook để tải dữ liệu từ localStorage khi component mount ---
  // Effect này chạy một lần duy nhất sau lần render đầu tiên của component.
  useEffect(() => {
    const loadData = () => {
      try {
        // Đặt lại trạng thái lỗi
        setError(null);

        // 1. Tải danh sách người dùng từ localStorage
        const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
        setUsers(storedUsers); // Cập nhật state users

        // 2. Tải danh sách đơn hàng từ localStorage
        const storedOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
        // Sắp xếp đơn hàng theo ngày giảm dần (đơn mới nhất trước)
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedOrders); // Cập nhật state orders

        console.log("Đã tải dữ liệu admin:", { users: storedUsers, orders: sortedOrders });

      } catch (err) {
        // Bắt lỗi nếu có vấn đề khi đọc hoặc parse dữ liệu từ localStorage
        console.error("Lỗi khi tải dữ liệu admin từ localStorage:", err);
        setError("Không thể tải dữ liệu quản trị."); // Đặt thông báo lỗi
        setUsers([]); // Đảm bảo state là mảng rỗng khi có lỗi
        setOrders([]);
      } finally {
        // Kết thúc quá trình tải
        setIsLoading(false);
      }
    };

    // Giả lập thời gian tải nhỏ để thấy trạng thái loading (không cần trong thực tế với localStorage)
    const timer = setTimeout(loadData, 500);

    // Cleanup function: Xóa timer nếu component unmount trước khi tải xong
    return () => clearTimeout(timer);

  }, []); // Dependency array rỗng []: Effect chỉ chạy một lần khi component mount.

  // --- Hàm xử lý xóa người dùng ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi state 'users' hoặc 'orders' thay đổi.
  const handleDeleteUser = useCallback((usernameToDelete) => {
      // Hiển thị hộp thoại xác nhận
      if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ không?`)) {
          return; // Nếu người dùng hủy, dừng lại
      }

      // 1. Xóa người dùng khỏi danh sách users
      const updatedUsers = users.filter(user => user.username !== usernameToDelete);
      setUsers(updatedUsers);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

      // 2. Xóa tất cả đơn hàng của người dùng đó
      const updatedOrders = orders.filter(order => order.username !== usernameToDelete);
      setOrders(updatedOrders);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

      console.log(`Đã xóa người dùng "${usernameToDelete}" và các đơn hàng liên quan.`);

  }, [users, orders]); // Dependencies: cần truy cập users và orders để lọc

  // --- Render giao diện dựa trên trạng thái loading và lỗi ---

  // Nếu đang tải, hiển thị thông báo loading
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p>
        {/* Có thể thêm nút thử lại hoặc quay về trang chủ */}
      </div>
    );
  }

  // --- Render giao diện chính khi dữ liệu đã tải xong ---
  return (
    <div className="admin-container">
      <h1 className="admin-title">📊 Bảng điều khiển Admin</h1>

      {/* Phần hiển thị danh sách người dùng */}
      <section className="admin-section">
        <h2 className="section-title">👥 Danh sách người dùng ({users.length})</h2>
        {users.length === 0 ? (
          <p className="empty-state">Chưa có người dùng nào đăng ký.</p>
        ) : (
          <ul className="user-list">
            {users.map((user, index) => {
                // Lọc ra các đơn hàng thuộc về người dùng hiện tại dựa trên username
                const userOrders = orders.filter(order => order.username === user.username);

                return (
                  <li key={index} className="user-item">
                    <div className="user-header-admin">
                        <h3 className="user-username">👤 {user.username}</h3>
                        {/* Nút xóa người dùng */}
                        <button
                            className="delete-user-button"
                            onClick={() => handleDeleteUser(user.username)}
                            aria-label={`Xóa người dùng ${user.username}`}
                        >
                            🗑️ Xóa người dùng
                        </button>
                    </div>


                    {/* Hiển thị các đơn hàng của người dùng này */}
                    <div className="user-orders">
                      <h4>📦 Đơn hàng của {user.username} ({userOrders.length}):</h4>
                      {userOrders.length === 0 ? (
                          <p className="empty-state-small">Chưa có đơn hàng nào từ người dùng này.</p>
                      ) : (
                          <ul className="order-list-admin">
                              {userOrders.map(order => (
                                  <li key={order.id} className="order-item-admin">
                                      <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
                                      <p><strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString('vi-VN')}</p>
                                      <p><strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                                      <p><strong>Người nhận:</strong> {order.shippingInfo.name}</p>
                                      <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                                      <p><strong>Điện thoại:</strong> {order.shippingInfo.phone}</p>
                                      <h5>Chi tiết sản phẩm:</h5>
                                      <ul className="order-items-detail">
                                          {order.items.map(item => (
                                              <li key={item.id}>
                                                  {item.name} (x{item.quantity}) - {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                                              </li>
                                          ))}
                                      </ul>
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

       {/* Phần hiển thị danh sách tất cả đơn hàng (Tùy chọn, có thể bỏ nếu đã hiển thị theo user) */}
       {/* Nếu bạn đã hiển thị đơn hàng trong phần user, có thể bỏ phần này */}
       {/* <section className="admin-section">
           <h2 className="section-title">📦 Tất cả đơn hàng ({orders.length})</h2>
           {orders.length === 0 ? (
               <p className="empty-state">Chưa có đơn hàng nào được đặt.</p>
           ) : (
               <ul className="order-list-admin">
                   {orders.map(order => (
                       <li key={order.id} className="order-item-admin">
                           <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
                           <p><strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString('vi-VN')}</p>
                           <p><strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                           <p><strong>Người nhận:</strong> {order.shippingInfo.name}</p>
                           <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                           <p><strong>Điện thoại:</strong> {order.shippingInfo.phone}</p>
                           <h5>Chi tiết sản phẩm:</h5>
                           <ul className="order-items-detail">
                               {order.items.map(item => (
                                   <li key={item.id}>
                                       {item.name} (x{item.quantity}) - {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                                   </li>
                               ))}
                           </ul>
                       </li>
                   ))}
               </ul>
           )}
       </section> */}

    </div>
  );
};

export default AdminDashboard; // Export component AdminDashboard để sử dụng trong cấu hình định tuyến.
