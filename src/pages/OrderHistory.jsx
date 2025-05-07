import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// --- HẰNG SỐ ---
// Định nghĩa các khóa cố định
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Khóa dùng để lưu đơn hàng trong localStorage

// --- HÀM TIỆN ÍCH ---

/**
 * Lấy danh sách đơn hàng từ localStorage
 * @returns {Array} Danh sách đơn hàng hoặc mảng rỗng nếu lỗi
 */
const getOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY); // Lấy dữ liệu từ localStorage
    return storedData ? JSON.parse(storedData) : []; // Parse dữ liệu hoặc trả về mảng rỗng
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu đơn hàng:", error); // Ghi log lỗi
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

/**
 * Lọc đơn hàng theo tên người dùng
 * @param {Array} orders - Danh sách đơn hàng
 * @param {string} username - Tên người dùng
 * @returns {Array} Danh sách đơn hàng đã lọc
 */
const filterOrdersByUsername = (orders, username) => {
  if (!Array.isArray(orders) || !username) return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
  return orders.filter((order) => order.username === username); // Lọc đơn hàng theo tên người dùng
};

/**
 * Sắp xếp đơn hàng theo ngày (mới nhất trước)
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Array} Danh sách đơn hàng đã sắp xếp
 */
const sortOrdersByDate = (orders) => {
  if (!Array.isArray(orders)) return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
  return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo ngày giảm dần
};

// --- HOOK TÙY CHỈNH ---

/**
 * Hook để lấy và quản lý đơn hàng của người dùng
 * @returns {Object} Đối tượng chứa đơn hàng, trạng thái tải, và lỗi
 */
const useUserOrders = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
  }; // Lấy thông tin người dùng từ AuthContext
  const [userOrders, setUserOrders] = useState([]); // Lưu danh sách đơn hàng của người dùng
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Lưu thông báo lỗi

  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      setUserOrders([]); // Xóa danh sách đơn hàng nếu chưa đăng nhập
      setIsLoading(false); // Kết thúc trạng thái tải
      return;
    }

    try {
      setIsLoading(true); // Bắt đầu trạng thái tải
      setError(null); // Xóa lỗi trước đó
      const allOrders = getOrdersFromStorage(); // Lấy tất cả đơn hàng
      const filteredOrders = filterOrdersByUsername(allOrders, user.username); // Lọc theo người dùng
      const sortedOrders = sortOrdersByDate(filteredOrders); // Sắp xếp theo ngày
      setUserOrders(sortedOrders); // Cập nhật danh sách đơn hàng
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error); // Ghi log lỗi
      setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại."); // Lưu thông báo lỗi
      setUserOrders([]); // Xóa danh sách đơn hàng
    } finally {
      setIsLoading(false); // Kết thúc trạng thái tải
    }
  }, [user, isLoggedIn]); // Chạy lại khi user hoặc isLoggedIn thay đổi

  return { userOrders, isLoading, error }; // Trả về trạng thái và dữ liệu
};

// --- THÀNH PHẦN CON ---

/**
 * Hiển thị một đơn hàng
 * @param {Object} props - Props chứa thông tin đơn hàng
 * @returns {JSX.Element} JSX hiển thị đơn hàng
 */
const OrderItem = React.memo(({ order }) => {
  if (!order?.id) return null; // Không hiển thị nếu đơn hàng không hợp lệ
  return (
    <li className="order-item" aria-label={`Đơn hàng #${order.id}`}>
      <p>
        <strong>ID Đơn hàng:</strong> #{order.id} {/* Hiển thị ID đơn hàng */}
      </p>
      <p>
        <strong>Ngày đặt:</strong>{" "}
        {new Date(order.date).toLocaleString("vi-VN")} {/* Hiển thị ngày đặt hàng */}
      </p>
      <p>
        <strong>Tổng tiền:</strong>{" "}
        {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ {/* Hiển thị tổng tiền */}
      </p>
      <p>
        <strong>Người nhận:</strong> {order.shippingInfo?.name || "N/A"} {/* Hiển thị tên người nhận */}
      </p>
      <p>
        <strong>Địa chỉ:</strong> {order.shippingInfo?.address || "N/A"} {/* Hiển thị địa chỉ */}
      </p>
      <p>
        <strong>Điện thoại:</strong> {order.shippingInfo?.phone || "N/A"} {/* Hiển thị số điện thoại */}
      </p>
      <div className="order-items-detail">
        <h5>Chi tiết sản phẩm:</h5> {/* Tiêu đề danh sách sản phẩm */}
        <ul>{renderOrderItems(order.items)}</ul> {/* Hiển thị danh sách sản phẩm */}
      </div>
    </li>
  );
});

/**
 * Hiển thị danh sách sản phẩm trong đơn hàng
 * @param {Array} items - Danh sách sản phẩm
 * @returns {JSX.Element} JSX hiển thị danh sách sản phẩm
 */
const renderOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <li>Không có sản phẩm nào</li>; // Thông báo nếu không có sản phẩm
  }

  return items.map((item, index) => (
    <li key={item.id || index}>
      {item.name || "Sản phẩm không rõ"} (x{item.quantity || 0}) -{" "}
      {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
      {/* Hiển thị tên, số lượng, và tổng giá sản phẩm */}
    </li>
  ));
};

// --- THÀNH PHẦN CHÍNH ---

/**
 * Thành phần hiển thị lịch sử đơn hàng
 * @returns {JSX.Element} JSX hiển thị lịch sử đơn hàng
 */
const OrderHistory = () => {
  const { userOrders, isLoading, error } = useUserOrders(); // Lấy dữ liệu từ hook tùy chỉnh

  if (isLoading) {
    return (
      <div className="order-history-status">
        Đang tải lịch sử đơn hàng... {/* Hiển thị trạng thái tải */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-status error">
        <p>❌ {error}</p> {/* Hiển thị thông báo lỗi */}
        <button
          onClick={() => window.location.reload()}
          aria-label="Thử lại tải trang"
        >
          Thử lại {/* Nút thử lại */}
        </button>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="order-history-status">
        Bạn chưa có đơn hàng nào {/* Thông báo không có đơn hàng */}
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <ul className="order-list" role="list">
        {userOrders.map((order) => (
          <OrderItem key={order.id} order={order} /> // Hiển thị từng đơn hàng
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory; // Xuất thành phần chính