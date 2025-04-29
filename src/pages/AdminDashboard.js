// Import necessary React library and hooks: useState, useEffect, useCallback
import React, { useState, useEffect, useCallback } from "react";
// Import the CSS file for styling this component
import "./AdminDashboard.css";

// Define constant keys to access data in localStorage
const LOCAL_STORAGE_USERS_KEY = "users"; // Key for user data
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Key for order data

// Define the AdminDashboard functional component
const AdminDashboard = () => {
  // --- State Variables ---
  // State to store the list of users, initialized as an empty array
  const [users, setUsers] = useState([]);
  // State to store the list of orders, initialized as an empty array
  const [orders, setOrders] = useState([]);
  // State to track the loading status, initialized as true (loading)
  const [isLoading, setIsLoading] = useState(true);
  // State to store an error message if any, initialized as null (no error)
  const [error, setError] = useState(null);

  // --- Effect Hook to Load Data ---
  // This effect runs only once when the component is mounted (attached to the DOM)
  // because the dependency array [] is empty.
  useEffect(() => {
    // Asynchronous function to load data from localStorage
    const loadData = async () => { // Using async allows for potential future expansion (e.g., fetching from an API)
      try {
        // Reset any previous error message (if any)
        setError(null);

        // Retrieve user data from localStorage
        // JSON.parse to convert the JSON string into a JavaScript object
        // || [] to default to an empty array if no data is found in localStorage
        const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
        // Retrieve order data from localStorage similarly
        const storedOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];

        // Update the 'users' state with the loaded data
        setUsers(storedUsers);
        // Update the 'orders' state with the loaded data,
        // also sort the orders by date in descending order (newest first)
        setOrders(storedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));

        // Log the loaded data to the console for inspection
        console.log("Đã tải dữ liệu admin:", { users: storedUsers, orders: storedOrders });

      } catch (err) {
        // Handle any errors that occur during loading (e.g., corrupted localStorage data)
        console.error("Lỗi khi tải dữ liệu admin:", err); // Log the detailed error
        setError("Không thể tải dữ liệu quản trị. Vui lòng thử lại sau."); // Set the error message for the user
        setUsers([]); // Reset users state to an empty array
        setOrders([]); // Reset orders state to an empty array
      } finally {
        // This block always runs after try or catch completes
        // Set the loading state to false, indicating that the loading process has finished (whether successful or failed)
        setIsLoading(false);
      }
    };

    // Set a timeout to call the loadData function after 500ms
    // This can be used to simulate network delay or allow other components to render first
    const timer = setTimeout(loadData, 500);

    // Cleanup function: Runs when the component unmounts or before the effect re-runs
    // Clear the timeout to prevent loadData from running if the component is unmounted before 500ms
    return () => clearTimeout(timer);

  }, []); // Empty dependency array: effect runs only once on mount

  // --- Callback Hook to Delete a User ---
  // Use useCallback to memoize the handleDeleteUser function.
  // This function is only re-created when the 'users' or 'orders' state changes.
  const handleDeleteUser = useCallback((usernameToDelete) => {
    // Display a confirmation dialog before deleting
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ không?`)) {
      return; // Stop the function if the user cancels
    }

    // Create a new users array by filtering out the user to be deleted
    const updatedUsers = users.filter(user => user.username !== usernameToDelete);
    // Create a new orders array by filtering out all orders belonging to that user
    const updatedOrders = orders.filter(order => order.username !== usernameToDelete);

    // Update the 'users' state with the filtered list
    setUsers(updatedUsers);
    // Update the 'orders' state with the filtered list
    setOrders(updatedOrders);

    // Save the updated users list to localStorage (after converting to JSON string)
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    // Save the updated orders list to localStorage (after converting to JSON string)
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

    // Log a success message to the console
    console.log(`Đã xóa người dùng "${usernameToDelete}" và các đơn hàng liên quan.`);

  }, [users, orders]); // Dependencies: this function depends on 'users' and 'orders'

  // --- Conditional Rendering: Loading State ---
  // If data is still loading, display a loading message
  if (isLoading) {
    return (
      <div className="admin-container loading-state">
        <div className="loading-spinner"></div> {/* Simple spinner element */}
        <p>Đang tải dữ liệu quản trị...</p> {/* Loading message */}
      </div>
    );
  }

  // --- Conditional Rendering: Error State ---
  // If an error occurred during loading, display the error message
  if (error) {
    return (
      <div className="admin-container error-state">
        <p className="error-message">❌ {error}</p> {/* Display the error message with an icon */}
        {/* A "Retry" button could be added here if needed */}
      </div>
    );
  }

  // --- Main Component Render ---
  // If loading is complete and there are no errors, display the main dashboard content
  return (
    <div className="admin-container"> {/* Main container for the dashboard */}
      <h1 className="admin-title">📊 Bảng điều khiển Admin</h1> {/* Dashboard title */}

      {/* Section displaying the list of users */}
      <section className="admin-section">
        {/* Title for the user list section, displaying the user count */}
        <h2 className="section-title">👥 Danh sách người dùng ({users.length})</h2>

        {/* Conditional rendering based on the number of users */}
        {users.length === 0 ? (
          // If there are no users, display an empty state message
          <p className="empty-state">Chưa có người dùng nào đăng ký.</p>
        ) : (
          // If there are users, render the user list (ul)
          <ul className="user-list">
            {/* Iterate over the 'users' array to render each user */}
            {/* Use user.username as the key (assuming it's unique) */}
            {users.map((user) => {
              // Filter the main orders list to find orders belonging to the current user
              const userOrders = orders.filter(order => order.username === user.username);

              // Return a list item (li) for each user
              return (
                <li key={user.username} className="user-item"> {/* List item for a user */}
                  {/* Header section for the user, contains username and delete button */}
                  <div className="user-header-admin">
                    <h3 className="user-username">👤 {user.username}</h3> {/* Display the username */}
                    {/* Button to delete the user */}
                    <button
                      className="delete-user-button"
                      // Call handleDeleteUser function when the button is clicked, passing the current user's username
                      onClick={() => handleDeleteUser(user.username)}
                      // Add an accessibility label
                      aria-label={`Xóa người dùng ${user.username}`}
                    >
                      🗑️ Xóa người dùng {/* Button text and icon */}
                    </button>
                  </div>

                  {/* Section displaying orders related to this user */}
                  <div className="user-orders">
                    {/* Sub-title displaying the username and their order count */}
                    <h4>📦 Đơn hàng của {user.username} ({userOrders.length}):</h4>

                    {/* Conditional rendering based on the number of orders for this specific user */}
                    {userOrders.length === 0 ? (
                      // If this user has no orders, display a small empty state message
                      <p className="empty-state-small">Chưa có đơn hàng nào từ người dùng này.</p>
                    ) : (
                      // If the user has orders, render their order list (ul)
                      <ul className="order-list-admin">
                        {/* Iterate over the 'userOrders' array to render each order */}
                        {userOrders.map(order => (
                          // List item for an order, using order.id as the key
                          <li key={order.id} className="order-item-admin">
                            {/* Display various details of the order */}
                            <p><strong>ID Đơn hàng:</strong> #{order.id}</p>
                            {/* Format date/time using Vietnamese locale */}
                            <p><strong>Ngày đặt:</strong> {new Date(order.date).toLocaleString('vi-VN')}</p>
                            {/* Format total price using Vietnamese locale and add currency unit */}
                            <p><strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                            <p><strong>Người nhận:</strong> {order.shippingInfo.name}</p>
                            <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                            <p><strong>Điện thoại:</strong> {order.shippingInfo.phone}</p>
                            {/* Sub-title for the list of items within the order */}
                            <h5>Chi tiết sản phẩm:</h5>
                            {/* List (ul) to display items within the order */}
                            <ul className="order-items-detail">
                              {/* Iterate over the 'items' array of the order */}
                              {order.items.map(item => (
                                // List item for each product item, using item.id as the key
                                <li key={item.id}>
                                  {/* Display product name, quantity, and total price for that item */}
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

// Export the AdminDashboard component so it can be used elsewhere
export default AdminDashboard;