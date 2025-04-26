// Import thư viện React và các hook cần thiết: useState, useEffect, useCallback
import React, { useState, useEffect, useCallback } from "react";
// Import tệp CSS để định kiểu cho component này
import "./AdminDashboard.css";

// Định nghĩa các key hằng số để truy cập dữ liệu trong localStorage
const LOCAL_STORAGE_USERS_KEY = "users"; // Key cho dữ liệu người dùng
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Key cho dữ liệu đơn hàng

// Định nghĩa component hàm AdminDashboard
const AdminDashboard = () => {
  // --- State Variables (Các biến trạng thái) ---
  // State để lưu danh sách người dùng, khởi tạo là mảng rỗng
  const [users, setUsers] = useState([]);
  // State để lưu danh sách đơn hàng, khởi tạo là mảng rỗng
  const [orders, setOrders] = useState([]);
  // State để theo dõi trạng thái tải dữ liệu, khởi tạo là true (đang tải)
  const [isLoading, setIsLoading] = useState(true);
  // State để lưu thông báo lỗi nếu có, khởi tạo là null (không có lỗi)
  const [error, setError] = useState(null);

  // --- Effect Hook (Hook Hiệu ứng) để Tải Dữ liệu ---
  // Effect này chạy một lần duy nhất khi component được mount (gắn vào DOM)
  // do mảng dependency [] là rỗng.
  useEffect(() => {
    // Hàm bất đồng bộ để tải dữ liệu từ localStorage
    const loadData = async () => { // Sử dụng async để có thể mở rộng sau này (ví dụ gọi API)
      try {
        // Đặt lại thông báo lỗi trước đó (nếu có)
        setError(null);

        // Lấy dữ liệu người dùng từ localStorage
        // JSON.parse để chuyển chuỗi JSON thành đối tượng JavaScript
        // || [] để mặc định là mảng rỗng nếu không tìm thấy dữ liệu trong localStorage
        const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
        // Lấy dữ liệu đơn hàng từ localStorage tương tự
        const storedOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];

        // Cập nhật state 'users' với dữ liệu đã tải
        setUsers(storedUsers);
        // Cập nhật state 'orders' với dữ liệu đã tải,
        // đồng thời sắp xếp các đơn hàng theo ngày giảm dần (mới nhất lên trước)
        setOrders(storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));

        // Ghi log dữ liệu đã tải ra console để kiểm tra
        console.log("Đã tải dữ liệu admin:", { users: storedUsers, orders: storedOrders });

      } catch (err) {
        // Xử lý nếu có lỗi xảy ra trong quá trình tải (ví dụ: dữ liệu localStorage bị hỏng)
        console.error("Lỗi khi tải dữ liệu admin:", err); // Ghi log lỗi chi tiết
        setError("Không thể tải dữ liệu quản trị. Vui lòng thử lại sau."); // Đặt thông báo lỗi cho người dùng
        setUsers([]); // Đặt lại state users thành mảng rỗng
        setOrders([]); // Đặt lại state orders thành mảng rỗng
      } finally {
        // Khối này luôn chạy sau khi try hoặc catch hoàn thành
        // Đặt state loading thành false, cho biết quá trình tải đã kết thúc (dù thành công hay thất bại)
        setIsLoading(false);
      }
    };

    // Đặt hẹn giờ để gọi hàm loadData sau 500ms
    // Điều này có thể dùng để mô phỏng độ trễ mạng hoặc cho phép component khác kịp render
    const timer = setTimeout(loadData, 500);

    // Hàm cleanup (dọn dẹp): Chạy khi component unmount hoặc trước khi effect chạy lại
    // Clear hẹn giờ để tránh loadData chạy nếu component đã bị gỡ bỏ trước 500ms
    return () => clearTimeout(timer);

  }, []); // Mảng dependency rỗng: effect chỉ chạy một lần khi mount

  // --- Callback Hook (Hook Callback) để Xóa Người dùng ---
  // Sử dụng useCallback để memoize (ghi nhớ) hàm handleDeleteUser.
  // Hàm này chỉ được tạo lại khi state 'users' hoặc 'orders' thay đổi.
  const handleDeleteUser = useCallback((usernameToDelete) => {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ không?`)) {
      return; // Dừng hàm nếu người dùng hủy bỏ
    }

    // Tạo mảng người dùng mới bằng cách lọc bỏ người dùng cần xóa
    const updatedUsers = users.filter(user => user.username !== usernameToDelete);
    // Tạo mảng đơn hàng mới bằng cách lọc bỏ tất cả đơn hàng của người dùng đó
    const updatedOrders = orders.filter(order => order.username !== usernameToDelete);

    // Cập nhật state 'users' với danh sách đã lọc
    setUsers(updatedUsers);
    // Cập nhật state 'orders' với danh sách đã lọc
    setOrders(updatedOrders);

    // Lưu danh sách người dùng đã cập nhật vào localStorage (sau khi chuyển thành chuỗi JSON)
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    // Lưu danh sách đơn hàng đã cập nhật vào localStorage (sau khi chuyển thành chuỗi JSON)
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

    // Ghi log thông báo xóa thành công ra console
    console.log(`Đã xóa người dùng "${usernameToDelete}" và các đơn hàng liên quan.`);

  }, [users, orders]); // Dependencies: hàm này phụ thuộc vào 'users' và 'orders'

  // --- Conditional Rendering (Render có điều kiện): Trạng thái Đang tải ---
  // Nếu dữ liệu vẫn đang tải, hiển thị thông báo đang tải
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div> {/* Element spinner đơn giản */}
        <p>Đang tải dữ liệu quản trị...</p> {/* Thông báo đang tải */}
      </div>
    );
  }

  // --- Conditional Rendering: Trạng thái Lỗi ---
  // Nếu có lỗi xảy ra trong quá trình tải, hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p> {/* Hiển thị thông báo lỗi kèm icon */}
        {/* Có thể thêm nút "Thử lại" ở đây nếu cần */}
      </div>
    );
  }

  // --- Main Component Render (Render chính của component) ---
  // Nếu tải xong và không có lỗi, hiển thị nội dung bảng điều khiển chính
  return (
    <div className="admin-container"> {/* Container chính cho bảng điều khiển */}
      <h1 className="admin-title">📊 Bảng điều khiển Admin</h1> {/* Tiêu đề bảng điều khiển */}

      {/* Phần hiển thị danh sách người dùng */}
      <section className="admin-section">
        {/* Tiêu đề phần hiển thị số lượng người dùng */}
        <h2 className="section-title">👥 Danh sách người dùng ({users.length})</h2>

        {/* Render có điều kiện dựa trên số lượng người dùng */}
        {users.length === 0 ? (
          // Nếu không có người dùng, hiển thị thông báo trạng thái rỗng
          <p className="empty-state">Chưa có người dùng nào đăng ký.</p>
        ) : (
          // Nếu có người dùng, render danh sách người dùng (ul)
          <ul className="user-list">
            {/* Duyệt qua mảng 'users' để render từng người dùng */}
            {/* Sử dụng user.username làm key (đảm bảo duy nhất) */}
            {users.map((user) => {
              // Lọc danh sách đơn hàng chính để tìm các đơn hàng của người dùng hiện tại
              const userOrders = orders.filter(order => order.username === user.username);

              // Trả về một mục danh sách (li) cho mỗi người dùng
              return (
                <li key={user.username} className="user-item"> {/* Mục danh sách cho một người dùng */}
                  {/* Phần tiêu đề của người dùng, chứa username và nút xóa */}
                  <div className="user-header-admin">
                    <h3 className="user-username">👤 {user.username}</h3> {/* Hiển thị username */}
                    {/* Nút để xóa người dùng */}
                    <button
                      className="delete-user-button"
                      // Gọi hàm handleDeleteUser khi nút được click, truyền username của người dùng hiện tại
                      onClick={() => handleDeleteUser(user.username)}
                      // Thêm label cho trợ năng (accessibility)
                      aria-label={`Xóa người dùng ${user.username}`}
                    >
                      🗑️ Xóa người dùng {/* Text và icon của nút */}
                    </button>
                  </div>

                  {/* Phần hiển thị các đơn hàng liên quan đến người dùng này */}
                  <div className="user-orders">
                    {/* Tiêu đề phụ hiển thị username và số lượng đơn hàng của họ */}
                    <h4>📦 Đơn hàng của {user.username} ({userOrders.length}):</h4>

                    {/* Render có điều kiện dựa trên số lượng đơn hàng của người dùng này */}
                    {userOrders.length === 0 ? (
                      // Nếu người dùng này không có đơn hàng nào, hiển thị thông báo rỗng nhỏ
                      <p className="empty-state-small">Chưa có đơn hàng nào từ người dùng này.</p>
                    ) : (
                      // Nếu người dùng có đơn hàng, render danh sách đơn hàng của họ (ul)
                      <ul className="order-list-admin">
                        {/* Duyệt qua mảng 'userOrders' để render từng đơn hàng */}
                        {userOrders.map(order => (
                          // Mục danh sách cho một đơn hàng, sử dụng order.id làm key
                          <li key={order.id} className="order-item-admin">
                            {/* Hiển thị các chi tiết khác nhau của đơn hàng */}
                            <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
                            {/* Định dạng ngày/giờ sử dụng locale Tiếng Việt */}
                            <p><strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString('vi-VN')}</p>
                            {/* Định dạng tổng tiền sử dụng locale Tiếng Việt và thêm đơn vị tiền tệ */}
                            <p><strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                            <p><strong>Người nhận:</strong> {order.shippingInfo.name}</p>
                            <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                            <p><strong>Điện thoại:</strong> {order.shippingInfo.phone}</p>
                            {/* Tiêu đề phụ cho danh sách sản phẩm trong đơn hàng */}
                            <h5>Chi tiết sản phẩm:</h5>
                            {/* Danh sách (ul) để hiển thị các sản phẩm trong đơn hàng */}
                            <ul className="order-items-detail">
                              {/* Duyệt qua mảng 'items' của đơn hàng */}
                              {order.items.map(item => (
                                // Mục danh sách cho từng sản phẩm, sử dụng item.id làm key
                                <li key={item.id}>
                                  {/* Hiển thị tên sản phẩm, số lượng và tổng tiền của sản phẩm đó */}
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
    </div>
  );
};

// Export component AdminDashboard để có thể sử dụng ở nơi khác
export default AdminDashboard;