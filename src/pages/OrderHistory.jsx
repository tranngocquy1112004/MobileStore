import React, { useState, useEffect, useCallback } from "react"; // Import necessary React hooks: useState for local state management, useEffect for performing side effects, and useCallback for memoizing functions to optimize performance.
import { Link } from "react-router-dom"; // Import the Link component from react-router-dom to create navigation links in a Single Page Application (SPA).
import "./OrderHistory.css"; // Import a custom CSS file to style this OrderHistory component.

// --- Constant Definitions ---

// The key used to store the list of orders in the browser's localStorage.
// Using a constant helps avoid typos and makes it easier to manage. This key should be consistent with the component handling order placement (e.g., CartPage).
const LOCAL_STORAGE_ORDERS_KEY = "orders";
// The maximum number of orders to display per page during pagination.
const ORDERS_PER_PAGE = 5;

// --- Child Component: OrderItem (Displays detailed information for a single order) ---
// Uses React.memo() to optimize the rendering performance of this child component.
// The component will only re-render when its props change (order, onDelete).
const OrderItem = React.memo(({ order, onDelete }) => {
  // Format the 'date' property of the order (which is an ISO string) into a human-readable date and time string according to Vietnamese locale.
  const orderDate = new Date(order.date).toLocaleString("vi-VN", {
    day: "2-digit", // Display day with 2 digits (e.g., 01, 15)
    month: "2-digit", // Display month with 2 digits (e.g., 01, 12)
    year: "numeric", // Display full 4-digit year (e.g., 2023)
    hour: "2-digit", // Display hour with 2 digits (e.g., 09, 21)
    minute: "2-digit", // Display minute with 2 digits (e.g., 05, 55)
  });

  return (
    <div className="order-card">
      {" "}
      {/* Main container for a single order in the history list */}
      {/* Header of the order card, containing the order ID and order date */}
      <div className="order-header">
        <h3 className="order-id">Đơn hàng #{order.id}</h3>{" "}
        {/* Display the order code (ID) */}
        <span className="order-date">📅 {orderDate}</span>{" "}
        {/* Display the formatted order date and time */}
      </div>
      {/* Section for the shipping information of the order */}
      <div className="shipping-info">
        {" "}
        {/* Container for shipping information */}
        <h4 className="section-title">🚚 Thông tin giao hàng</h4>{" "}
        {/* Title for the shipping information section */}
        <div className="info-grid">
          {" "}
          {/* Use CSS Grid to align information labels and values */}
          <span className="info-label">👤 Tên:</span>{" "}
          {/* Label for recipient name */}
          <span className="info-value">{order.shippingInfo.name}</span>{" "}
          {/* Display the recipient name from order data */}
          <span className="info-label">🏠 Địa chỉ:</span>{" "}
          {/* Label for address */}
          <span className="info-value">{order.shippingInfo.address}</span>{" "}
          {/* Display the recipient address */}
          <span className="info-label">📞 Điện thoại:</span>{" "}
          {/* Label for phone number */}
          <span className="info-value">{order.shippingInfo.phone}</span>{" "}
          {/* Display the recipient phone number */}
        </div>
      </div>
      {/* Section detailing the items included in the order */}
      <div className="order-details">
        {" "}
        {/* Container for the list of items */}
        <h4 className="section-title">🛍️ Chi tiết đơn hàng</h4>{" "}
        {/* Title for the order details section */}
        <ul className="item-list">
          {" "}
          {/* Unordered list displaying the items */}
          {/* Map over the array of items (order.items) in the current order */}
          {order.items.map((item) => (
            <li key={item.id} className="item-row">
              {" "}
              {/* Each item is a list item */}
              <span className="item-name">{item.name}</span>{" "}
              {/* Display the item name */}
              <span className="item-quantity">x{item.quantity}</span>{" "}
              {/* Display the quantity of the item */}
              <span className="item-price">
                {/* Calculate the total price of the item (price * quantity) and format it according to Vietnamese currency */}
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Footer of the order card, displaying the total price and delete button */}
      <div className="order-footer">
        {" "}
        {/* Container for the footer section */}
        <p className="total-price">
          💰 Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ{" "}
          {/* Display the total price of the entire order, formatted as currency */}
        </p>
        {/* Delete order button */}
        <button
          className="delete-button" // CSS class for button styling
          onClick={() => onDelete(order.id)} // Attach click event handler. Call the 'onDelete' function (passed from the parent component via props) with the ID of the current order.
          aria-label={`Xóa đơn hàng #${order.id}`} // Accessibility attribute for screen reader users
        >
          🗑️ Xóa{" "}
          {/* Text displayed on the delete button */}
        </button>
      </div>
    </div>
  );
}); // End of React.memo() for the OrderItem component

// --- Child Component: Pagination (Displays pagination navigation buttons) ---
// Uses React.memo() to optimize rendering performance.
// The component will only re-render when its props change (currentPage, totalPages, onPageChange).
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Do not display the pagination component if the total number of pages is less than or equal to 1 (only a single page).
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {" "}
      {/* Container for the pagination component */}
      {/* "Previous Page" button */}
      <button
        className="pagination-button" // CSS class for pagination button styling
        onClick={() => onPageChange(currentPage - 1)} // Attach click event handler. Call the 'onPageChange' function (passed via props) with the new page number (current page minus 1).
        disabled={currentPage === 1} // Disable the button if the current page is the first page (1).
      >
        Trang trước{" "}
        {/* Button text */}
      </button>
      {/* Display current page and total pages information */}
      <span className="pagination-current">
        Trang {currentPage} / {totalPages}{" "}
        {/* Display in the format "Page X / Total Y" */}
      </span>
      {/* "Next Page" button */}
      <button
        className="pagination-button" // CSS class for pagination button styling
        onClick={() => onPageChange(currentPage + 1)} // Attach click event handler. Call the 'onPageChange' function with the new page number (current page plus 1).
        disabled={currentPage === totalPages} // Disable the button if the current page is the last page (equals totalPages).
      >
        Trang sau{" "}
        {/* Button text */}
      </button>
    </div>
  );
}); // End of React.memo() for the Pagination component

// --- Main Component for the Order History page ---
// This is the functional component that renders the entire content of the Order History page.
const OrderHistory = () => {
  // --- State management for component data and status ---
  // 'orders' state: Stores the list of all orders loaded from localStorage. Initially an empty array [].
  const [orders, setOrders] = useState([]);
  // 'isLoading' state: Boolean tracking the order data loading status. Initially true.
  const [isLoading, setIsLoading] = useState(true);
  // 'currentPage' state: Stores the current page number the user is viewing in pagination. Initially 1.
  const [currentPage, setCurrentPage] = useState(1);

  // --- Effect hook to load order data from localStorage when the component mounts ---
  // This effect runs only ONCE after the initial render (similar to componentDidMount).
  useEffect(() => {
    // Define the 'loadOrders' function to perform the data reading from localStorage.
    const loadOrders = () => {
      try {
        // Retrieve the JSON string containing orders from localStorage using the defined key.
        // If no data is found (localStorage.getItem returns null), default to an empty array [].
        // Use try-catch to handle errors if the data in localStorage is corrupted or not valid JSON.
        const storedOrders =
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
        // Sort the orders array by date in descending order (newest orders displayed first).
        // The .sort() method sorts in place. The comparison function (a, b) -> new Date(b.date) - new Date(a.date)
        // returns a positive number if b's date is greater than a's date, pushing b before a.
        const sortedOrders = storedOrders.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedOrders); // Update the 'orders' state with the sorted list of orders.
      } catch (error) {
        console.error("Error loading orders from localStorage:", error); // Log the error to the console if there's an issue reading or parsing localStorage.
        // If an error occurs, you could potentially setOrders([]) to display an empty state or a separate error message.
        // In this case, we just log and let orders remain the default empty array if parsing fails.
      } finally {
        // The finally block always runs, ensuring 'isLoading' is set to false after the loading process (whether successful or failed) finishes.
        setIsLoading(false);
      }
    };

    // Use setTimeout to simulate a small delay (e.g., 500ms) when loading data.
    // This helps users clearly see the loading spinner state on the interface.
    // In a real application fetching from a real API, you wouldn't need this setTimeout;
    // setIsLoading(false) would be called after the fetch completes.
    const timer = setTimeout(loadOrders, 500); // Wait 500ms before calling the loadOrders function.

    // Cleanup function for this effect: Runs when the component is unmounted
    // or before the effect runs again (if dependencies change, but here the deps array is empty, so it only runs on unmount).
    // Clear the created timeout to prevent the loadOrders function from running and updating state after the component has unmounted.
    return () => clearTimeout(timer);
  }, []); // Empty dependency array []: ensures the effect runs only ONCE when the component is first mounted.

  // --- Function to handle the logic for deleting an order ---
  // Accepts the ID of the order to be deleted (orderId).
  // Uses useCallback to memoize this function. The function will be re-created when the 'orders' state or 'currentPage' state changes.
  // This prevents unnecessary function re-creation on every render if 'orders' and 'currentPage' haven't changed,
  // which is especially useful when passing this function down to a child component (OrderItem) that uses React.memo().
  const handleDeleteOrder = useCallback(
    (orderId) => {
      // Display a browser confirmation dialog before proceeding with deletion.
      // window.confirm() returns true if the user clicks 'OK', false if they click 'Cancel'.
      if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
        return; // If the user selects 'Cancel' (result is false), stop the function here and do nothing.
      }

      // Create a new array of orders by using the .filter() method on the 'orders' array.
      // Filter out only those orders whose ID is DIFFERENT from the passed 'orderId'. This effectively removes the order to be deleted.
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders); // Update the 'orders' state with the new list of orders after deletion.

      // Save the updated list of orders back to localStorage (convert to a JSON string before saving).
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

      // --- Logic to adjust the current page number after deleting an order ---
      // Calculate the total number of pages needed based on the new list of orders after deletion.
      const totalPagesAfterDelete = Math.ceil(
        updatedOrders.length / ORDERS_PER_PAGE
      );
      // If the current page ('currentPage') is greater than the new total number of pages after deletion (totalPagesAfterDelete)
      // AND the new total number of pages is still greater than 0 (ensuring it's not the case where all orders are deleted):
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete); // Update 'currentPage' to the new last page number.
      } else if (updatedOrders.length === 0) {
        // If after deleting, the orders list becomes empty:
        setCurrentPage(1); // Ensure the 'currentPage' state is reset to 1.
      }
      // If the above conditions are not met, it means the current page is still valid with the new total pages, so no need to change currentPage.
    },
    [orders, currentPage] // Dependency array: This function needs access to the current value of the 'orders' state (to filter) and the 'currentPage' state (to adjust after deletion).
  );

  // --- Calculate derived values from state ( for display and pagination) ---
  // These values will be recalculated whenever the 'orders' state or 'currentPage' state changes,
  // ensuring that the displayed data and pagination logic are always accurate.

  // Calculate the total number of pages required based on the total number of orders and products per page.
  // Use Math.ceil() to round up, ensuring enough pages for any remaining orders.
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  // Calculate the starting index of the orders on the current page within the 'orders' array.
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  // Calculate the ending index (exclusive) of the orders on the current page.
  // Use Math.min to ensure endIndex does not exceed the length of the orders array when on the last page.
  const endIndex = Math.min(startIndex + ORDERS_PER_PAGE, orders.length);
  // Use the .slice() method on the 'orders' array to extract the list of orders to be displayed only on the current page.
  const currentOrders = orders.slice(startIndex, endIndex);

  // --- Function to handle user clicking pagination buttons (Previous/Next Page) ---
  // Accepts the new page number ('page') as a parameter.
  // Uses useCallback to memoize this function. The function will be re-created when 'totalPages' changes.
  // This helps prevent unnecessary function re-creation and can be beneficial when passing it down to a child component (Pagination) if it is memoized.
  const handlePageChange = useCallback(
    (page) => {
      // Calculate the new page number, ensuring it stays within the valid range from 1 to totalPages.
      // Math.max(1, ...) ensures the page number is not less than 1.
      // Math.min(page, totalPages) ensures the page number is not greater than the total number of pages.
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage); // Update the 'currentPage' state with the new, valid page number.
    },
    [totalPages] // Dependency array: This function needs access to the current value of the 'totalPages' variable to clamp the valid page number.
  );

  // --- Render UI based on the initial loading state ---

  // If the 'isLoading' state is true, display a loading spinner UI.
  if (isLoading) {
    return (
      <div className="loading-container">
        {" "}
        {/* Container wrapping the spinner and loading text */}
        <div className="loading-spinner"></div>{" "}
        {/* Spinning spinner icon */}
        <p>Đang tải...</p> {/* Display "Loading..." message */}
      </div>
    );
  }

  // --- Render the main UI of the Order History page when not loading ---
  // This is the UI section displayed after the data has finished loading.
  return (
    <main className="order-history-container">
      {" "}
      {/* <main> tag wraps the main content of the page */}
      {/* Header of the Order History page */}
      <header className="page-header">
        <h1>📜 Lịch sử đơn hàng</h1> {/* Main title of the page */}
        {/* Display the total number of loaded orders */}
        <p className="order-count">Bạn có {orders.length} đơn hàng</p>{" "}
      </header>
      {/* Section displaying the list of orders or a message when the list is empty */}
      <section className="order-list">
        {" "}
        {/* Container for the list of orders */}
        {orders.length === 0 ? ( // Conditional Rendering: Check if the 'orders' array is empty (no orders)
          // --- Display UI when there are no orders ---
          <div className="empty-state">
            {" "}
            {/* Container for the empty state */}
            <img
              src="/empty-order.png" // Path to an illustrative image for an empty cart (or empty order state). Ensure this image file exists in the 'public' directory.
              alt="Không có đơn hàng" // Alt text for the image, important for SEO and accessibility
              className="empty-image" // CSS class for image styling
              loading="lazy" // Load image using lazy loading, improving performance
            />
            <p className="empty-message">Chưa có đơn hàng nào</p>{" "}
            {/* "No orders yet" message */}
            {/* "Shop Now" button - a link leading users to the products page to start shopping */}
            <Link to="/products" className="shop-now-button">
              🛒 Mua sắm ngay{" "}
              {/* Button/link text */}
            </Link>
          </div>
        ) : (
          // --- Display the list of orders when there are orders ---
          // Map over the 'currentOrders' array (orders for the current page)
          // to render an OrderItem component for each order.
          currentOrders.map((order) => (
            <OrderItem
              key={order.id} // Unique key for each OrderItem in the list, using the order ID (important for React performance)
              order={order} // Pass the current order object ('order') as a prop to OrderItem.
              onDelete={handleDeleteOrder} // Pass the memoized delete order handler function ('handleDeleteOrder') as the 'onDelete' prop to OrderItem.
            />
          ))
        )}
      </section>
      {/* Display the Pagination component only when the total number of pages is greater than 1 */}
      {totalPages > 1 && ( // Conditional Rendering: Only display the pagination component if there is more than 1 page
        <Pagination
          currentPage={currentPage} // Pass the current page number as a prop
          totalPages={totalPages} // Pass the total number of pages as a prop
          onPageChange={handlePageChange} // Pass the memoized page change handler function as a prop
        />
      )}
      {/* Footer of the Order History page */}
      <footer className="page-footer">
        {" "}
        {/* Container for the footer section */}
        {/* "Back to Store" button - a link leading back to the homepage or products page */}
        <Link to="/home" className="back-button">
          ← Quay lại cửa hàng{" "}
          {/* Button/link text */}
        </Link>
      </footer>
    </main>
  );
};

export default OrderHistory; // Export the OrderHistory component as the default export so it can be used in other files (usually in routing configuration)