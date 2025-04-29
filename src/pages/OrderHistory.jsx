// OrderHistory.js
import React, { useEffect, useState, useContext } from "react"; // Import các hook cần thiết
import { AuthContext } from "../account/AuthContext"; // Import AuthContext
import "./OrderHistory.css"; // Import CSS cho lịch sử đơn hàng

// Định nghĩa key hằng số cho đơn hàng trong localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Đảm bảo key này khớp với nơi bạn lưu đơn hàng

const OrderHistory = () => {
  // Lấy thông tin người dùng hiện tại từ AuthContext
  const { user, isLoggedIn } = useContext(AuthContext);

  // State để lưu danh sách đơn hàng của người dùng hiện tại
  const [userOrders, setUserOrders] = useState([]);
  // State loading và error (tương tự như các component fetch data khác)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect để tải và lọc đơn hàng khi component mount hoặc user thay đổi
  useEffect(() => {
    const loadOrders = () => {
      setIsLoading(true);
      setError(null);
      setUserOrders([]); // Clear previous orders

      // Chỉ tải đơn hàng nếu người dùng đã đăng nhập
      if (!isLoggedIn || !user || !user.username) {
        setIsLoading(false);
        // Nếu không đăng nhập, có thể đặt thông báo hoặc chỉ hiển thị rỗng
         console.log("Không có người dùng đăng nhập để tải lịch sử đơn hàng.");
        return;
      }

      try {
        // Lấy tất cả đơn hàng từ localStorage
        const allOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
         // Đảm bảo dữ liệu đọc được là mảng
         if (!Array.isArray(allOrders)) {
             console.warn("Dữ liệu đơn hàng trong localStorage không phải là mảng, đặt lại.");
             localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY);
             allOrders = [];
         }


        // Lọc đơn hàng chỉ của người dùng hiện tại
        // So sánh thuộc tính 'username' của mỗi đơn hàng với 'username' của người dùng đang đăng nhập
        const filteredOrders = allOrders.filter(
          (order) => order.username === user.username
        );

         // Sắp xếp đơn hàng theo ngày giảm dần (mới nhất lên trước)
        const sortedOrders = filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));


        setUserOrders(sortedOrders); // Cập nhật state với danh sách đơn hàng đã lọc và sắp xếp
        console.log(`Đã tải và lọc ${sortedOrders.length} đơn hàng cho người dùng ${user.username}.`);

      } catch (err) {
        console.error("Lỗi khi tải hoặc lọc đơn hàng từ localStorage:", err);
        setError("Không thể tải lịch sử đơn hàng.");
        setUserOrders([]); // Đặt lại danh sách đơn hàng khi có lỗi
        // Có thể xóa dữ liệu lỗi nếu muốn: localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY);
      } finally {
        setIsLoading(false); // Kết thúc quá trình tải
      }
    };

    loadOrders(); // Gọi hàm tải đơn hàng khi effect chạy

     // Cleanup function (không cần thiết cho localStorage trong trường hợp này)
    // return () => { /* cleanup if needed */ };

  }, [user, isLoggedIn]); // Dependency array: effect chạy lại khi user hoặc isLoggedIn thay đổi

  // Render giao diện dựa trên trạng thái (loading, error, hiển thị danh sách)

  if (isLoading) {
    return <div className="order-history-status">Đang tải lịch sử đơn hàng...</div>;
  }

  if (error) {
    return <div className="order-history-status error">❌ {error}</div>;
  }

  // Nếu không có đơn hàng sau khi tải/lọc
  if (userOrders.length === 0) {
    return <div className="order-history-status">Bạn chưa có đơn hàng nào.</div>;
  }

  // Hiển thị danh sách đơn hàng
  return (
    <div className="order-history-container">
      {/* Title sẽ được hiển thị trong UserProfilePage, ở đây chỉ cần danh sách */}
      {/* <h2>Lịch sử đơn hàng của bạn</h2> */}
      <ul className="order-list">
        {userOrders.map((order) => (
          // Mỗi item trong danh sách đơn hàng
          <li key={order.id} className="order-item">
            <p>
              <strong>ID Đơn hàng:</strong> #{order.id}
            </p>
            {/* Định dạng ngày/giờ */}
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(order.date).toLocaleString("vi-VN")}
            </p>
            {/* Định dạng tổng tiền */}
            <p>
              <strong>Tổng tiền:</strong>{" "}
              {order.totalPrice.toLocaleString("vi-VN")} VNĐ
            </p>
            {/* Thông tin người nhận (từ shippingInfo) */}
            <p><strong>Người nhận:</strong> {order.shippingInfo?.name}</p>
            <p><strong>Địa chỉ:</strong> {order.shippingInfo?.address}</p>
            <p><strong>Điện thoại:</strong> {order.shippingInfo?.phone}</p>


            {/* Chi tiết các sản phẩm trong đơn hàng */}
            <div className="order-items-detail">
              <h5>Chi tiết sản phẩm:</h5>
              <ul>
                {order.items.map((item) => (
                  // Mỗi sản phẩm trong đơn hàng
                  <li key={item.id}>
                    {item.name} (x{item.quantity}) -{" "}
                    {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
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

export default OrderHistory; // Export component