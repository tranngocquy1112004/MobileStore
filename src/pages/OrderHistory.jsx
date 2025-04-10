import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

// Hằng số cố định
const ORDERS_PER_PAGE = 5; // Số lượng đơn hàng hiển thị trên mỗi trang

// Component hiển thị thông tin của từng đơn hàng
const OrderItem = ({ order, onDelete }) => {
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }); // Định dạng ngày giờ của đơn hàng theo kiểu Việt Nam (VD: 10/04/2025, 14:30)

  return (
    <div className="order-card">
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3> {/* Hiển thị mã số đơn hàng */}
        <span className="order-date">📅 {orderDate}</span> {/* Hiển thị ngày đặt hàng */}
      </div>
      <div className="shipping-info">
        <h4 className="section-title">🚚 Thông tin giao hàng</h4> {/* Tiêu đề phần thông tin giao hàng */}
        <div className="info-grid">
          <span className="info-label">👤 Tên:</span>
          <span className="info-value">{order.shippingInfo.name}</span> {/* Tên người nhận hàng */}
          <span className="info-label">🏠 Địa chỉ:</span>
          <span className="info-value">{order.shippingInfo.address}</span> {/* Địa chỉ giao hàng */}
          <span className="info-label">📞 Điện thoại:</span>
          <span className="info-value">{order.shippingInfo.phone}</span> {/* Số điện thoại liên hệ */}
        </div>
      </div>
      <div className="order-details">
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4> {/* Tiêu đề phần chi tiết đơn hàng */}
        <ul className="item-list">
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              <span className="item-name">{item.name}</span> {/* Tên sản phẩm trong đơn hàng */}
              <span className="item-quantity">x {item.quantity}</span> {/* Số lượng sản phẩm */}
              <span className="item-price">
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span> {/* Tổng giá của sản phẩm (giá x số lượng), định dạng tiền Việt Nam */}
            </li>
          ))}
        </ul>
      </div>
      <div className="order-footer">
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ
        </p> {/* Hiển thị tổng tiền của đơn hàng */}
        <button
          className="delete-button" // Class CSS cho nút xóa
          onClick={() => onDelete(order.id)} // Gọi hàm xóa khi nhấp vào nút
          aria-label={`Xóa đơn hàng #${order.id}`} // Văn bản mô tả cho accessibility
        >
          🗑️ Xóa {/* Nút để xóa đơn hàng */}
        </button>
      </div>
    </div>
  );
};

// Component phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button" // Class CSS cho nút "Trang trước"
      onClick={() => onPageChange(currentPage - 1)} // Chuyển sang trang trước khi nhấp
      disabled={currentPage === 1} // Vô hiệu hóa nút nếu đang ở trang đầu tiên
    >
      Trang trước
    </button>
    <span className="pagination-current">
      Trang {currentPage} / {totalPages}
    </span> {/* Hiển thị số trang hiện tại và tổng số trang */}
    <button
      className="pagination-button" // Class CSS cho nút "Trang sau"
      onClick={() => onPageChange(currentPage + 1)} // Chuyển sang trang sau khi nhấp
      disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu đang ở trang cuối
    >
      Trang sau
    </button>
  </div>
);

// Component chính: Trang lịch sử đơn hàng
const OrderHistory = () => {
  const [orders, setOrders] = useState([]); // State lưu danh sách đơn hàng
  const [isLoading, setIsLoading] = useState(true); // State kiểm soát trạng thái đang tải
  const [currentPage, setCurrentPage] = useState(1); // State lưu số trang hiện tại
  const [filterDate, setFilterDate] = useState(""); // State lưu giá trị bộ lọc theo ngày

  // Tải dữ liệu đơn hàng từ localStorage khi component được mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || []; // Lấy dữ liệu từ localStorage, nếu không có thì trả mảng rỗng
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ); // Sắp xếp đơn hàng theo ngày giảm dần (mới nhất lên đầu)
        setOrders(sortedOrders); // Cập nhật danh sách đơn hàng
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu đơn hàng:", error); // Ghi log nếu có lỗi khi xử lý dữ liệu
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải dù thành công hay thất bại
      }
    };
    const timer = setTimeout(loadOrders, 500); // Delay 500ms để giả lập quá trình tải dữ liệu
    return () => clearTimeout(timer); // Cleanup: Hủy timer khi component unmount
  }, []); // Dependency rỗng: chỉ chạy một lần khi mount

  // Hàm xử lý xóa đơn hàng
  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) { // Hiển thị hộp thoại xác nhận trước khi xóa
      const updatedOrders = orders.filter((order) => order.id !== orderId); // Lọc bỏ đơn hàng có id tương ứng
      setOrders(updatedOrders); // Cập nhật danh sách đơn hàng mới
      localStorage.setItem("orders", JSON.stringify(updatedOrders)); // Lưu danh sách mới vào localStorage
      if (updatedOrders.length <= (currentPage - 1) * ORDERS_PER_PAGE && currentPage > 1) {
        setCurrentPage(currentPage - 1); // Giảm số trang nếu trang hiện tại không còn đơn hàng
      }
    }
  };

  // Lọc đơn hàng theo ngày
  const filteredOrders = filterDate
    ? orders.filter(
        (order) => new Date(order.date).toLocaleDateString("vi-VN") === filterDate
      ) // Nếu có bộ lọc ngày, chỉ giữ lại đơn hàng khớp ngày
    : orders; // Nếu không có bộ lọc, giữ nguyên danh sách

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE); // Tính tổng số trang
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  ); // Lấy danh sách đơn hàng cho trang hiện tại

  // Hàm xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages))); // Giới hạn số trang trong khoảng từ 1 đến tổng số trang
  };

  // Hiển thị giao diện khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div> {/* Hiệu ứng spinner khi tải */}
        <p>Đang tải...</p> {/* Thông báo đang tải */}
      </div>
    );
  }

  // Giao diện chính của trang lịch sử đơn hàng
  return (
    <main className="order-history-container">
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1> {/* Tiêu đề trang */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p> {/* Hiển thị tổng số đơn hàng */}
      </header>
      <div className="filter-section">
        <input
          type="date" // Input kiểu ngày tháng
          value={
            filterDate ? new Date(filterDate).toISOString().split("T")[0] : ""
          } // Chuyển đổi định dạng ngày để hiển thị trong input
          onChange={(e) =>
            setFilterDate(
              e.target.value
                ? new Date(e.target.value).toLocaleDateString("vi-VN")
                : ""
            )
          } // Cập nhật bộ lọc ngày khi người dùng chọn ngày
          className="date-filter" // Class CSS cho ô lọc ngày
        />
      </div>
      <section className="order-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <img
              src="/empty-order.png" // Hình ảnh khi không có đơn hàng
              alt="Không có đơn hàng" // Văn bản thay thế cho hình ảnh
              className="empty-image" // Class CSS cho hình ảnh
            />
            <p className="empty-message">Chưa có đơn hàng nào</p> {/* Thông báo khi danh sách trống */}
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay {/* Nút chuyển hướng đến trang sản phẩm */}
            </Link>
          </div>
        ) : (
          currentOrders.map((order) => (
            <OrderItem
              key={order.id} // Key duy nhất cho mỗi đơn hàng
              order={order} // Truyền dữ liệu đơn hàng vào component
              onDelete={handleDeleteOrder} // Truyền hàm xóa đơn hàng
            />
          ))
        )}
      </section>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage} // Trang hiện tại
          totalPages={totalPages} // Tổng số trang
          onPageChange={handlePageChange} // Hàm xử lý khi chuyển trang
        />
        // Hiển thị phân trang nếu có hơn 1 trang
      )}
      <footer className="page-footer">
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng {/* Nút quay lại trang chủ */}
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory; // Xuất component để sử dụng ở nơi khác