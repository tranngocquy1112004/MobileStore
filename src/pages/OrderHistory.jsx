// OrderHistory.js
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// Hằng số cho key lưu đơn hàng trong localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders";

/**
 * Component hiển thị lịch sử đơn hàng của người dùng
 * Lấy dữ liệu từ localStorage và lọc theo người dùng hiện tại
 */
const OrderHistory = () => {
  // Lấy thông tin người dùng từ AuthContext
  const { user, isLoggedIn } = useContext(AuthContext);

  // State lưu trữ đơn hàng của người dùng hiện tại
  const [userOrders, setUserOrders] = useState([]);
  // State cho trạng thái đang tải và lỗi
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect để tải và lọc đơn hàng khi component được mount hoặc khi user thay đổi
  useEffect(() => {
    const loadOrders = () => {
      // Thiết lập trạng thái ban đầu
      setIsLoading(true);
      setError(null);
      setUserOrders([]);

      // Kiểm tra người dùng đã đăng nhập chưa
      if (!isUserLoggedIn()) {
        setIsLoading(false);
        return;
      }

      try {
        // Lấy và xử lý dữ liệu đơn hàng
        const allOrders = getOrdersFromStorage();
        
        // Lọc đơn hàng của người dùng hiện tại
        const filteredOrders = filterOrdersByUsername(allOrders, user.username);
        
        // Sắp xếp đơn hàng theo ngày mới nhất
        const sortedOrders = sortOrdersByDate(filteredOrders);

        // Cập nhật state với danh sách đã lọc và sắp xếp
        setUserOrders(sortedOrders);
        console.log(`Đã tải ${sortedOrders.length} đơn hàng cho người dùng ${user.username}`);
      } catch (err) {
        console.error("Lỗi khi tải hoặc lọc đơn hàng:", err);
        setError("Không thể tải lịch sử đơn hàng");
        setUserOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
    // Effect chạy lại khi user hoặc trạng thái đăng nhập thay đổi
  }, [user, isLoggedIn]);

  // Hàm kiểm tra người dùng đã đăng nhập chưa
  const isUserLoggedIn = () => {
    if (!isLoggedIn || !user || !user.username) {
      console.log("Không có người dùng đăng nhập để tải lịch sử đơn hàng");
      return false;
    }
    return true;
  };

  // Hàm lấy dữ liệu đơn hàng từ localStorage
  const getOrdersFromStorage = () => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    let orders = [];

    if (storedData) {
      try {
        orders = JSON.parse(storedData);
      } catch (parseError) {
        console.error("Lỗi khi phân tích dữ liệu đơn hàng:", parseError);
      }
    }

    // Đảm bảo dữ liệu là một mảng
    if (!Array.isArray(orders)) {
      console.warn("Dữ liệu đơn hàng không phải là mảng, sử dụng mảng rỗng");
      return [];
    }

    return orders;
  };

  // Hàm lọc đơn hàng theo tên người dùng
  const filterOrdersByUsername = (orders, username) => {
    return orders.filter(order => order.username === username);
  };

  // Hàm sắp xếp đơn hàng theo ngày (mới nhất trước)
  const sortOrdersByDate = (orders) => {
    return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return <div className="order-history-status">Đang tải lịch sử đơn hàng...</div>;
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return <div className="order-history-status error">❌ {error}</div>;
  }

  // Hiển thị khi không tìm thấy đơn hàng
  if (userOrders.length === 0) {
    return <div className="order-history-status">Bạn chưa có đơn hàng nào</div>;
  }

  // Hiển thị danh sách đơn hàng
  return (
    <div className="order-history-container">
      <ul className="order-list">
        {userOrders.map((order) => (
          <li key={order.id} className="order-item">
            <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(order.date).toLocaleString("vi-VN")}
            </p>
            <p>
              <strong>Tổng tiền:</strong>{" "}
              {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
            </p>
            
            {/* Thông tin người nhận */}
            <p><strong>Người nhận:</strong> {order.shippingInfo?.name || 'N/A'}</p>
            <p><strong>Địa chỉ:</strong> {order.shippingInfo?.address || 'N/A'}</p>
            <p><strong>Điện thoại:</strong> {order.shippingInfo?.phone || 'N/A'}</p>

            {/* Chi tiết sản phẩm trong đơn hàng */}
            <div className="order-items-detail">
              <h5>Chi tiết sản phẩm:</h5>
              <ul>
                {renderOrderItems(order.items)}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Hàm hiển thị danh sách sản phẩm trong đơn hàng
 * @param {Array} items - Mảng các sản phẩm trong đơn hàng
 * @returns {Array} Các phần tử JSX hiển thị thông tin sản phẩm
 */
const renderOrderItems = (items) => {
  // Kiểm tra items có phải là mảng không
  if (!Array.isArray(items)) {
    return <li>Không có thông tin sản phẩm</li>;
  }

  return items.map((item, index) => (
    <li key={item.id || index}>
      {item.name || 'Sản phẩm không rõ'} (x{item.quantity || 0}) -{" "}
      {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
    </li>
  ));
};

export default OrderHistory;