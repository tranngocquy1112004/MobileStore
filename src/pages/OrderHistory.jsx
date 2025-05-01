// OrderHistory.js
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./OrderHistory.css";

// Constant key for orders in localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders";

const OrderHistory = () => {
  // Get current user info from AuthContext
  const { user, isLoggedIn } = useContext(AuthContext);

  // State to store the current user's orders
  const [userOrders, setUserOrders] = useState([]);
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load and filter orders when component mounts or user changes
  useEffect(() => {
    const loadOrders = () => {
      setIsLoading(true);
      setError(null);
      setUserOrders([]); // Clear previous orders

      // Only load orders if a user is logged in
      if (!isLoggedIn || !user || !user.username) {
        console.log("Không có người dùng đăng nhập để tải lịch sử đơn hàng.");
        setIsLoading(false); // Stop loading state
        return;
      }

      try {
        // Get all orders from localStorage
        const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        let allOrders = [];

        if (storedData) {
            try {
                allOrders = JSON.parse(storedData);
            } catch (parseError) {
                console.error("Lỗi khi phân tích dữ liệu đơn hàng từ localStorage:", parseError);
                // Optionally clear corrupted data, but let's just log and proceed with empty array
                // localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY);
            }
        }

        // Ensure data is an array, otherwise use an empty array
        if (!Array.isArray(allOrders)) {
           console.warn("Dữ liệu đơn hàng trong localStorage không phải là mảng, sử dụng mảng rỗng.");
           allOrders = [];
        }

        // Filter orders for the current user
        const filteredOrders = allOrders.filter(
          (order) => order.username === user.username
        );

        // Sort orders by date descending (newest first)
        const sortedOrders = filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUserOrders(sortedOrders); // Update state with filtered and sorted list
        console.log(`Đã tải và lọc ${sortedOrders.length} đơn hàng cho người dùng ${user.username}.`);

      } catch (err) {
        console.error("Lỗi khi tải hoặc lọc đơn hàng từ localStorage:", err);
        setError("Không thể tải lịch sử đơn hàng.");
        setUserOrders([]); // Reset orders list on error
      } finally {
        setIsLoading(false); // End loading process
      }
    };

    loadOrders(); // Call the function to load orders when the effect runs

    // Cleanup function is not strictly needed for localStorage reads

  }, [user, isLoggedIn]); // Effect runs again if user or isLoggedIn changes

  // Render UI based on state (loading, error, display list)

  if (isLoading) {
    return <div className="order-history-status">Đang tải lịch sử đơn hàng...</div>;
  }

  if (error) {
    return <div className="order-history-status error">❌ {error}</div>;
  }

  // If no orders found after loading/filtering
  if (userOrders.length === 0) {
    return <div className="order-history-status">Bạn chưa có đơn hàng nào.</div>;
  }

  // Display the list of orders
  return (
    <div className="order-history-container">
      {/* Title is handled by the parent UserProfilePage */}
      <ul className="order-list">
        {userOrders.map((order) => (
          <li key={order.id} className="order-item">
            <p>
              <strong>ID Đơn hàng:</strong> #{order.id}
            </p>
            {/* Format date and time */}
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(order.date).toLocaleString("vi-VN")}
            </p>
            {/* Format total price */}
            <p>
              <strong>Tổng tiền:</strong>{" "}
              {order.totalPrice?.toLocaleString("vi-VN") || '0' } VNĐ {/* Added optional chaining for safety */}
            </p>
            {/* Receiver info (from shippingInfo), using optional chaining */}
            <p><strong>Người nhận:</strong> {order.shippingInfo?.name || 'N/A'}</p> {/* Added default 'N/A' */}
            <p><strong>Địa chỉ:</strong> {order.shippingInfo?.address || 'N/A'}</p> {/* Added default 'N/A' */}
            <p><strong>Điện thoại:</strong> {order.shippingInfo?.phone || 'N/A'}</p> {/* Added default 'N/A' */}


            {/* Details of products in the order */}
            <div className="order-items-detail">
              <h5>Chi tiết sản phẩm:</h5>
              <ul>
                {/* Ensure order.items is an array before mapping */}
                {Array.isArray(order.items) && order.items.map((item, index) => (
                  // Using item.id as key, fallback to index if id is missing (less ideal)
                  <li key={item.id || index}>
                    {item.name || 'Sản phẩm không rõ'} (x{item.quantity || 0}) -{" "} {/* Added default values */}
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;