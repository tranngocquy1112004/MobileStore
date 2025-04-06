import React, { useState, useEffect } from "react"; // Import các hook cần thiết từ React
import { Link } from "react-router-dom"; // Import Link để điều hướng
import "./OrderHistory.css"; // Import file CSS cho styling

// Constants
const ORDERS_PER_PAGE = 5; // Số đơn hàng hiển thị trên mỗi trang

// Component OrderItem - Hiển thị thông tin một đơn hàng
const OrderItem = ({ order, onDelete }) => { // Nhận thêm prop onDelete để xóa đơn hàng
  // Định dạng ngày giờ theo kiểu Việt Nam
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit", // Ngày 2 chữ số
    month: "2-digit", // Tháng 2 chữ số
    year: "numeric", // Năm đầy đủ
    hour: "2-digit", // Giờ 2 chữ số
    minute: "2-digit", // Phút 2 chữ số
  });

  return (
    <div className="order-card"> {/* Container cho card đơn hàng */}
      <div className="order-header"> {/* Phần tiêu đề đơn hàng */}
        <h3 className="order-id">Đơn hàng #{order.id}</h3> {/* ID đơn hàng */}
        <span className="order-date">📅 {orderDate}</span> {/* Ngày đặt hàng */}
      </div>

      <div className="shipping-info"> {/* Phần thông tin giao hàng */}
        <h4 className="section-title">🚚 Thông tin giao hàng</h4> {/* Tiêu đề phần */}
        <div className="info-grid"> {/* Grid hiển thị thông tin */}
          <span className="info-label">👤 Tên:</span> {/* Nhãn tên */}
          <span className="info-value">{order.shippingInfo.name}</span> {/* Giá trị tên */}
          <span className="info-label">🏠 Địa chỉ:</span> {/* Nhãn địa chỉ */}
          <span className="info-value">{order.shippingInfo.address}</span> {/* Giá trị địa chỉ */}
          <span className="info-label">📞 Điện thoại:</span> {/* Nhãn số điện thoại */}
          <span className="info-value">{order.shippingInfo.phone}</span> {/* Giá trị số điện thoại */}
        </div>
      </div>

      <div className="order-details"> {/* Phần chi tiết đơn hàng */}
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4> {/* Tiêu đề phần */}
        <ul className="item-list"> {/* Danh sách sản phẩm */}
          {order.items.map((item) => ( // Duyệt qua từng sản phẩm trong đơn hàng
            <li key={item.id} className="item-row"> {/* Hàng sản phẩm */}
              <span className="item-name">{item.name}</span> {/* Tên sản phẩm */}
              <span className="item-quantity">x {item.quantity}</span> {/* Số lượng */}
              <span className="item-price"> {/* Giá tổng của sản phẩm */}
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-footer"> {/* Phần chân đơn hàng */}
        <p className="total-price"> {/* Tổng tiền đơn hàng */}
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ
        </p>
        <button
          className="delete-button" // Nút xóa đơn hàng
          onClick={() => onDelete(order.id)} // Gọi hàm xóa với ID đơn hàng
          aria-label={`Xóa đơn hàng #${order.id}`} // Accessibility
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

// Component Pagination - Điều khiển phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => { // Nhận các prop cần thiết
  return (
    <div className="pagination"> {/* Container cho phân trang */}
      <button
        className="pagination-button" // Nút "Trang trước"
        onClick={() => onPageChange(currentPage - 1)} // Giảm trang hiện tại
        disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang 1
      >
        Trang trước
      </button>
      <span className="pagination-current">Trang {currentPage} / {totalPages}</span> {/* Hiển thị trang hiện tại và tổng */}
      <button
        className="pagination-button" // Nút "Trang sau"
        onClick={() => onPageChange(currentPage + 1)} // Tăng trang hiện tại
        disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối
      >
        Trang sau
      </button>
    </div>
  );
};

// Component OrderHistory - Trang lịch sử đơn hàng
const OrderHistory = () => {
  // State quản lý dữ liệu và trạng thái
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại

  // useEffect để tải dữ liệu đơn hàng từ localStorage
  useEffect(() => {
    const loadOrders = () => { // Hàm tải đơn hàng
      try {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || []; // Lấy dữ liệu từ localStorage
        const sortedOrders = storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo ngày giảm dần
        setOrders(sortedOrders); // Cập nhật danh sách đơn hàng
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu đơn hàng:", error); // Log lỗi nếu có
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải
      }
    };

    const timer = setTimeout(loadOrders, 500); // Delay 500ms để giả lập tải dữ liệu
    return () => clearTimeout(timer); // Cleanup: xóa timer khi unmount
  }, []); // Dependency rỗng: chỉ chạy khi mount

  // Hàm xóa đơn hàng
  const handleDeleteOrder = (orderId) => { // Nhận ID đơn hàng cần xóa
    const updatedOrders = orders.filter((order) => order.id !== orderId); // Lọc bỏ đơn hàng có ID tương ứng
    setOrders(updatedOrders); // Cập nhật state
    localStorage.setItem("orders", JSON.stringify(updatedOrders)); // Cập nhật localStorage
    if (updatedOrders.length <= (currentPage - 1) * ORDERS_PER_PAGE && currentPage > 1) {
      setCurrentPage(currentPage - 1); // Giảm trang nếu trang hiện tại trống
    }
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE); // Tổng số trang
  const currentOrders = orders.slice( // Lấy đơn hàng cho trang hiện tại
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Hàm thay đổi trang
  const handlePageChange = (page) => { // Nhận số trang mới
    setCurrentPage(Math.max(1, Math.min(page, totalPages))); // Đảm bảo trang trong khoảng hợp lệ
  };

  // Render trạng thái đang tải
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container cho trạng thái tải */}
        <div className="loading-spinner"></div> {/* Spinner animation */}
        <p>Đang tải lịch sử đơn hàng...</p> {/* Thông báo đang tải */}
      </div>
    );
  }

  // Render giao diện chính
  return (
    <main className="order-history-container"> {/* Container chính của trang */}
      <header className="page-header"> {/* Phần tiêu đề trang */}
        <h1>📜 Lịch sử đơn hàng</h1> {/* Tiêu đề */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p> {/* Số lượng đơn hàng */}
      </header>

      <section className="order-list"> {/* Phần danh sách đơn hàng */}
        {orders.length === 0 ? ( // Kiểm tra có đơn hàng nào không
          <div className="empty-state"> {/* Trường hợp không có đơn hàng */}
            <img
              src="/empty-order.png" // Hình ảnh minh họa
              alt="Không có đơn hàng" // Alt text cho accessibility
              className="empty-image" // Class cho styling
            />
            <p className="empty-message">Chưa có đơn hàng nào</p> {/* Thông báo */}
            <Link to="/products" className="shop-now-button"> {/* Nút điều hướng */}
              🛒 Mua sắm ngay
            </Link>
          </div>
        ) : (
          currentOrders.map((order) => ( // Duyệt qua đơn hàng hiện tại
            <OrderItem
              key={order.id} // Key duy nhất
              order={order} // Dữ liệu đơn hàng
              onDelete={handleDeleteOrder} // Truyền hàm xóa
            />
          ))
        )}
      </section>

      {totalPages > 1 && ( // Hiển thị phân trang nếu có hơn 1 trang
        <Pagination
          currentPage={currentPage} // Trang hiện tại
          totalPages={totalPages} // Tổng số trang
          onPageChange={handlePageChange} // Hàm thay đổi trang
        />
      )}

      <footer className="page-footer"> {/* Phần chân trang */}
        <Link to="/home" className="back-button"> {/* Nút quay lại */}
          ← Quay lại cửa hàng
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory; // Xuất component để sử dụng