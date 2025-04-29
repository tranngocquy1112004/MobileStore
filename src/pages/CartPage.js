import React, { useContext, useState, useEffect, useCallback } from "react"; // Import necessary React hooks: useContext to access the Context API, useState for managing local state, useEffect for performing side effects, and useCallback for memoizing event handler functions to optimize performance.
import { Link, useNavigate } from "react-router-dom"; // Import components from react-router-dom: Link to create navigation links in an SPA, and useNavigate to perform programmatic page navigation using JavaScript code.
import { CartContext } from "./CartContext"; // Import CartContext from the same directory. This Context contains the cart state and functions to manage the cart (addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart).
import { AuthContext } from "../account/AuthContext"; // Import AuthContext from a relative path. This Context contains the user authentication state (isLoggedIn, user).
import CheckoutModal from "../components/CheckoutModal"; // Import a custom Modal component to display the checkout form and shipping information input.
import "./CartPage.css"; // Import a custom CSS file to style this CartPage component.

// --- Constant Definitions ---

// Object containing message strings to display to the user, helping to easily manage message content.
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.", // Message displayed when the cart has no items (updated for clarity).
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Message displayed when the checkout process is successfully completed.
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Message requiring the user to log in before proceeding to checkout.
};

// Define the key used for localStorage to store the list of placed orders.
// Using a constant helps avoid typos and makes management easier. This key should be consistent with the OrderHistory and AdminDashboard components.
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- Child Component: CartItem (Displays detailed information for a product in the cart) ---
// Uses React.memo() to optimize the rendering performance of this child component.
// The component will only re-render when its props change (item, onIncrease, onDecrease, onRemove).
const CartItem = React.memo(({ item, onIncrease, onDecrease, onRemove }) => {
  // Determine if the decrease quantity button should be disabled.
  // This button will be disabled if the current quantity of the product in the cart is 1.
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      {/* Main container for a single product item in the cart list */}
      {/* Product image */}
      <img
        src={item.image} // Product image path
        alt={item.name} // Alt text for the image, using the product name to aid accessibility for users when the image fails to load or for visually impaired users.
        className="cart-image" // CSS class for styling the image in the cart.
        loading="lazy" // Use the loading="lazy" attribute so the browser only loads the image when it's close to being visible in the viewport, improving initial page load performance.
      />
      {/* Section for product details (name, price, quantity controls) */}
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Display the product name */}
        <p className="cart-price">
          💰 {item.price.toLocaleString("vi-VN")} VNĐ {/* Display the product price, formatted according to Vietnamese currency */}
          {/* The toLocaleString("vi-VN") function helps format the number as a currency string according to Vietnamese conventions */}
        </p>
        {/* Quantity control for increasing/decreasing the product quantity */}
        <div className="quantity-controls">
          {" "}
          {/* Container for quantity control buttons */}
          {/* Decrease quantity button */}
          <button
            onClick={() => onDecrease(item.id)} // Attach click event handler. Call the 'onDecrease' function (passed from the parent component via props) with the ID of the current product.
            disabled={isDecreaseDisabled} // Disable the button if the 'isDecreaseDisabled' variable is true.
            className={isDecreaseDisabled ? "disabled" : ""} // Add the 'disabled' CSS class to the button when it's disabled to change its appearance.
            aria-label={`Giảm số lượng ${item.name}`} // Accessibility attribute for users using screen readers.
          >
            - {/* Content displayed on the decrease button */}
          </button>
          <span>{item.quantity}</span>{" "}
          {/* Display the current quantity of the product in the cart */}
          {/* Increase quantity button */}
          <button
            onClick={() => onIncrease(item.id)} // Attach click event handler. Call the 'onIncrease' function (passed from the parent component via props) with the ID of the current product.
            aria-label={`Tăng số lượng ${item.name}`} // Accessibility attribute
          >
            + {/* Content displayed on the increase button */}
          </button>
        </div>
      </div>
      {/* Button to remove the product from the cart */}
      <button
        className="remove-button" // CSS class for button styling
        onClick={() => onRemove(item.id)} // Attach click event handler. Call the 'onRemove' function (passed from the parent component via props) with the ID of the current product.
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`} // Accessibility attribute
      >
        Xóa {/* Content displayed on the remove button */}
      </button>
    </li>
  );
}); // End of React.memo() for the CartItem component

// --- Child Component: CartSummary (Displays cart summary and checkout button) ---
// Uses React.memo() to optimize rendering performance.
// The component will only re-render when its props change (totalPrice, onCheckout).
const CartSummary = React.memo(({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    {/* Container for the cart summary section */}
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ{" "}
      {/* Display the total price of the cart, formatted according to Vietnamese currency */}
    </h3>
    {/* "Checkout" button to initiate the checkout process */}
    <button className="checkout-button" onClick={onCheckout}>
      {/* Attach the 'onCheckout' function (passed via props) to the button's click event */}
      🛍 Mua hàng {/* Content displayed on the button */}
    </button>
  </div>
)); // End of React.memo() for the CartSummary component

// --- Child Component: EmptyCart (Displays a message when the cart is empty) ---
// Uses React.memo() to optimize rendering performance.
// This component does not receive props that affect its displayed content, so it only re-renders when the parent component re-renders and passes the same (unchanged) props.
const EmptyCart = React.memo(() => (
  <div className="empty-cart-message-container">
    {/* Container for the empty cart message */}
    {/* You can add an icon or illustration for an empty cart here */}
    <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>{" "}
    {/* Display the "Empty cart" message from the MESSAGES constant */}
    {/* Link inviting the user to return to the shopping page (product list) */}
    <Link to="/products" className="shop-now-link">
      {" "}
      {/* 'to="/products"' specifies the route to navigate to */}
      🛒 Tiếp tục mua sắm {/* Content displayed on the link */}
    </Link>
  </div>
)); // End of React.memo() for the EmptyCart component

// --- Main Component: CartPage (Shopping Cart Page) ---
// This is the functional component that renders the entire content of the shopping cart page.
const CartPage = () => {
  const navigate = useNavigate(); // Use the useNavigate hook to perform programmatic page navigation.

  // Use the useContext hook to access CartContext and retrieve the necessary values and functions:
  // - cart: Array containing the list of products in the current cart.
  // - removeFromCart: Function to remove a product from the cart.
  // - increaseQuantity: Function to increase the quantity of a product.
  // - decreaseQuantity: Function to decrease the quantity of a product.
  // - clearCart: Function to clear the entire cart.
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);

  // Use the useContext hook to access AuthContext and retrieve the 'isLoggedIn' status and 'user' information.
  // Provide a default value `{ isLoggedIn: false, user: null }` to ensure the application doesn't crash if AuthContext is not fully provided.
  const { isLoggedIn, user } = useContext(AuthContext) || { isLoggedIn: false, user: null };

  // --- State management for CartPage Component rendering status ---
  // 'showModal' state: Boolean controlling whether the checkout Modal is currently displayed. Initially false (hidden).
  const [showModal, setShowModal] = useState(false);
  // 'isLoading' state: Boolean managing the loading status. Used here to simulate the initial page loading time for the cart page. Initially true.
  const [isLoading, setIsLoading] = useState(true);

  // --- Effect hook to simulate data loading time when the component mounts ---
  // This effect will run only ONCE after the component's first render (similar to componentDidMount).
  useEffect(() => {
    // Create a timeout (setTimeout) so that after 1000ms (1 second), the callback function inside will be executed.
    // This callback function simply updates the 'isLoading' state to false.
    // In a real application, this effect would be where you fetch cart data from an API if that data is not managed by Context or needs to be reloaded upon entering the page.
    const timer = setTimeout(() => setIsLoading(false), 1000); // 1000ms = 1 second

    // Cleanup function for this effect. This function will run when the component is unmounted
    // or before the effect re-runs (if dependencies change, but here the deps array is empty, so it only runs on unmount).
    // The cleanup function will clear the created timeout, preventing it from running and updating state after the component has unmounted.
    return () => clearTimeout(timer);
  }, []); // Empty dependency array []: ensures the effect runs only once when the component is first mounted.

  // --- Calculate derived values from the 'cart' state ---
  // These values will be recalculated whenever the 'cart' state changes, ensuring the UI always displays the correct total price and item count.

  // Calculate the total value of all products in the cart.
  // Use the .reduce() method to iterate over the 'cart' array, accumulating (sum) the value of each item (item.price * item.quantity).
  // The initial starting value for 'sum' is 0.
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, // Callback function to calculate the sum for each item
    0 // Initial starting value for 'sum'
  );
  // Calculate the total quantity of all products in the cart.
  // Use the .reduce() method to iterate over the 'cart' array, accumulating (sum) the quantity of each item (item.quantity).
  // The initial starting value for 'sum' is 0.
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity, // Callback function
    0 // Initial starting value
  );

  // --- Function to handle the "Checkout" button click ---
  // Uses useCallback to memoize this function. The function is only re-created when its dependencies change.
  // Dependencies here are 'isLoggedIn', 'navigate', and 'cart.length'.
  const handleCheckout = useCallback(() => {
    // 1. Check user login status.
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // If not logged in, display an alert box requesting login.
      navigate("/"); // Navigate the user to the root page (usually login/register or home page). You can change this route if needed.
      return; // Stop the function, do not proceed with checkout if not logged in.
    }
    // 2. Check if the cart is empty before opening the modal.
    if (cart.length === 0) {
      alert(MESSAGES.EMPTY_CART); // Alert for empty cart.
      return; // Stop the function if the cart is empty.
    }
    // 3. If the user is logged in and the cart is not empty, display the checkout modal.
    setShowModal(true); // Update the 'showModal' state to true to display the CheckoutModal component.
  }, [isLoggedIn, navigate, cart.length]); // **Added cart.length to dependencies**

  // --- Function to handle user confirming checkout in the modal ---
  // This function receives the 'shippingInfo' object (shipping details entered by the user in the modal) as a parameter.
  // Uses useCallback to memoize this function. The function will be re-created when its dependencies change.
  // Dependencies include: 'cart', 'totalPrice', 'clearCart', 'navigate', and 'user'.
  const handleConfirmCheckout = useCallback((shippingInfo) => {
    // 1. Create an object representing the new order.
    const order = {
      id: Date.now(), // Create a simple ID for the order using the current timestamp (milliseconds from Epoch). This is a simple approach for a demo.
      // Add user information to the order.
      // Use optional chaining user?.username for safety if user is null.
      username: user?.username || 'Guest', // Save the username of the person placing the order, default to 'Guest' if no user.
      items: cart, // Save the list of products currently in the cart into the 'items' property of the order.
      totalPrice, // Save the total value of the cart into the 'totalPrice' property.
      shippingInfo, // Save the shipping information received from the modal into the 'shippingInfo' property.
      date: new Date().toISOString(), // Save the timestamp of the order in ISO 8601 format string, making it easy to sort and parse later.
    };

    // 2. Save the new order to localStorage. (This is a simple demo method, NOT secure and NOT persistent for real applications requiring long-term storage or security).
    // Retrieve the previously saved list of orders from localStorage. Use the defined key.
    // If no data exists (localStorage.getItem returns null), default to an empty array [].
    // Use try-catch to handle JSON parsing errors if the data in localStorage is corrupted or invalid JSON.
    let existingOrders = [];
    try {
      const storedOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (storedOrders) {
        existingOrders = JSON.parse(storedOrders);
        // Ensure existingOrders is always an array after parsing
        if (!Array.isArray(existingOrders)) {
            console.warn("Order data in localStorage is not an array, resetting.");
            existingOrders = [];
        }
      }
    } catch (error) {
      console.error("Error reading/parsing order list from localStorage:", error);
      // If there's an error reading/parsing, you might want to remove the corrupted old data and start with a new empty array.
      localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY);
      existingOrders = [];
    }

    // Create a new array by spreading the existing orders (...existingOrders) and adding the new order at the end.
    const updatedOrders = [...existingOrders, order];
    // Save the updated orders array back to localStorage (convert to a JSON string before saving).
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

    // 3. Update UI and navigate after successful checkout.
    alert(MESSAGES.CHECKOUT_SUCCESS); // Display a success alert box.
    clearCart(); // Call the 'clearCart' function from CartContext to remove all products from the cart after placing the order.
    setShowModal(false); // Hide the checkout Modal by setting the 'showModal' state to false.
    navigate("/orders"); // Navigate the user to the order history page so they can view the order they just placed.
  }, [cart, totalPrice, clearCart, navigate, user]); // **Added user to dependencies**

  // --- Function to handle user cancelling the checkout modal ---
  // Uses useCallback to memoize this function. The dependency array is empty because the function only changes the local 'showModal' state based on a fixed value.
  const handleCancelCheckout = useCallback(() => {
    setShowModal(false); // Set the 'showModal' state to false to hide the checkout Modal.
  }, []); // Empty dependency array []: The function does not depend on any outer scope variables that need to be tracked.

  // --- Function to handle user clicking the "Clear All" button in the cart ---
  // Uses useCallback to memoize this function. The function is only re-created when the 'clearCart' function from Context changes.
  const handleClearCart = useCallback(() => {
    // Display a browser confirmation dialog before proceeding with clearing the entire cart.
    // window.confirm() returns true if the user clicks 'OK', false if they click 'Cancel'.
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      return; // If the user selects 'Cancel' (result is false), stop the function here and do nothing.
    }
    clearCart(); // If the user selects 'OK', call the 'clearCart' function from CartContext to remove all products from the cart.
  }, [clearCart]); // Dependency array: the function depends on the 'clearCart' function from CartContext.

  // --- Render UI based on the initial loading state ---

  // If the 'isLoading' state is true (during the initial simulated page loading phase), display the loading UI.
  if (isLoading) {
    return (
      <div className="loading-container">
        {/* Container wrapping the spinner and loading text */}
        <div className="loading-spinner"></div> {/* Spinning spinner icon */}
        <p className="loading-text">Đang tải...</p> {/* Display "Loading..." message */}
      </div>
    );
  }

  // --- Render the main UI of the Cart Page when not loading ---
  return (
    <div className="cart-container">
      {/* Main container wrapping the entire content of the Cart Page */}
      {/* Page title displaying the current number of items in the cart */}
      <h2>
        🛍 Giỏ Hàng ({totalItems} sản phẩm)
      </h2> {/* Display the total number of items in the cart (totalItems) */}

      {/* --- Display content based on the cart status (empty or not) --- */}
      {cart.length === 0 ? ( // Conditional Rendering: Check if the 'cart' array is empty (no products)
        <EmptyCart /> // If empty, display the child EmptyCart component.
      ) : (
        // If the cart HAS products (cart.length > 0)
        <>
          {/* Use a Fragment to group multiple elements (product list, clear all button, cart summary) without adding extra DOM nodes to the tree. */}
          {/* Unordered list displaying each product in the cart */}
          <ul className="cart-list">
            {cart.map((item) => (
              // Map over the 'cart' array to create a CartItem component for each product.
              <CartItem
                key={item.id} // Unique key for each item in the list, helps React identify changes efficiently. Use product ID as the key.
                item={item} // Pass the current product object ('item') as a prop to CartItem.
                onIncrease={increaseQuantity} // Pass the 'increaseQuantity' function (from CartContext) as the 'onIncrease' prop to CartItem.
                onDecrease={decreaseQuantity} // Pass the 'decreaseQuantity' function (from CartContext) as the 'onDecrease' prop to CartItem.
                onRemove={removeFromCart} // Pass the 'removeFromCart' function (from CartContext) as the 'onRemove' prop to CartItem.
              />
            ))}
          </ul>
          {/* Button to clear the entire cart */}
          <button
            className="clear-cart-button" // CSS class for button styling
            onClick={handleClearCart} // Attach the memoized click event handler function
            aria-label="Xóa toàn bộ giỏ hàng" // Accessibility attribute
          >
            Xóa tất cả {/* Button text */}
          </button>
          {/* Display the cart summary component (total price and checkout button) */}
          <CartSummary
            totalPrice={totalPrice} // Pass the calculated 'totalPrice' variable as the 'totalPrice' prop to CartSummary.
            onCheckout={handleCheckout} // Pass the memoized "Checkout" button click handler function ('handleCheckout') as the 'onCheckout' prop to CartSummary.
          />
        </>
      )}

      {/* --- Display Checkout Modal (if needed) --- */}
      {/* Conditional rendering: If the 'showModal' state is true, render the CheckoutModal component. */}
      {showModal && (
        <CheckoutModal
          cart={cart} // Pass the current cart data into the modal. The modal might need to display the list of items again or recalculate the total.
          totalPrice={totalPrice} // Pass the total price into the modal.
          onConfirm={handleConfirmCheckout} // Pass the memoized handler function for when the user confirms checkout in the modal.
          onCancel={handleCancelCheckout} // Pass the memoized handler function for when the user cancels the modal.
        />
      )}

      {/* --- Other navigation links --- */}
      <div className="cart-links">
        {/* Container for navigation links */}
        {/* Link to the order history page */}
        <Link to="/orders" className="order-history-link">
          {/* 'to="/orders"' is the route to the order history page */}
          📜 Xem lịch sử đơn hàng {/* Link text */}
        </Link>
        {/* Link back to the homepage or products page */}
        <Link to="/" className="back-button">
          {" "}
          {/* Corrected link to the homepage "/" */}
          {/* 'to="/"' is the route to the homepage */}
          ⬅ Quay lại cửa hàng {/* Link text */}
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Export the CartPage component as the default export so it can be used in other files (usually in routing configuration)