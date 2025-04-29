// Import necessary React hooks: useEffect for performing side effects, useState for managing local state, useContext for accessing the Context API, and useCallback for memoizing event handler functions, helping to optimize performance.
import React, { useEffect, useState, useContext, useCallback } from "react";
// Import components from react-router-dom: Link to create SPA (Single Page Application) navigation links, useParams to extract parameters from dynamic URLs (e.g., product ID from '/products/:id'), and useNavigate to perform programmatic page navigation using code.
import { Link, useParams, useNavigate } from "react-router-dom";
// Import CartContext from a relative path. This Context contains the cart state and functions to manage the cart (e.g., addToCart).
import { CartContext } from "../pages/CartContext";
// Import AuthContext from a relative path. This Context contains the user authentication state (whether logged in or not).
import { AuthContext } from "../account/AuthContext";
// Import the CSS file for styling this product detail component.
import "./ProductDetail.css";

// --- Define Constants ---

// URL or path to the product data source. Using process.env.PUBLIC_URL ensures the correct path in development and production environments.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Object containing various message strings to display to the user on the interface, helping to easily manage message content.
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Message displayed when data is being loaded
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!", // Error message when fetching data from API/file fails
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Message displayed when no product with the corresponding ID is found in the data
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Message when the user successfully adds a product to the cart
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Message requiring the user to log in before performing an action (e.g., adding to cart)
};
// Key used to store the list of products in localStorage to speed up subsequent page loads (caching).
const LOCAL_STORAGE_PRODUCTS_KEY = "products";


// --- Main Component: ProductDetail (Displays details of a specific product) ---
// This is the functional component that displays the detailed information of a product based on the ID in the URL.
const ProductDetail = () => {
  // Get the value of the 'id' parameter from the current URL (e.g., if the URL is '/products/5', id will be the string "5").
  const { id } = useParams();
  // Use the useNavigate hook to be able to navigate the user to other pages in the application programmatically using JavaScript code.
  const navigate = useNavigate();
  // Use the useContext hook to access the CartContext and get the 'addToCart' function to add the product to the cart.
  const { addToCart } = useContext(CartContext);
  // Use the useContext hook to access the AuthContext and get the 'isLoggedIn' state to check if the user is logged in.
  // Provide a default value `{}` for useContext and a default value `false` for `isLoggedIn`
  // to prevent errors if AuthContext is not provided or the isLoggedIn property doesn't exist (ensures the application doesn't crash).
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  // --- State managing component data and status ---
  // 'product' state: Stores the detailed information of the found product as an object. Initially null.
  const [product, setProduct] = useState(null);
  // 'isLoading' state: A boolean tracking whether the product data is currently being loaded. Initially true (loading).
  const [isLoading, setIsLoading] = useState(true);
  // 'error' state: Stores the error message as a string if there is an error during loading or finding the product. Initially null.
  const [error, setError] = useState(null);
  // 'successMessage' state: Stores the success message (e.g., "Added to cart successfully!") or other messages (e.g., login required). Initially an empty string.
  const [successMessage, setSuccessMessage] = useState("");

  // --- Effect hook to fetch product data when the component mounts or the id in the URL changes ---
  // This effect is where fetching product data from the source (localStorage or API) occurs.
  useEffect(() => {
    // Create an instance of AbortController. This object allows us to cancel a Fetch API request.
    const controller = new AbortController();
    const signal = controller.signal; // Get the signal from the controller to pass into the fetch() options.

    // Define an asynchronous function to perform fetching and processing of product data.
    const fetchProduct = async () => {
      try {
        // Reset state related to status before starting to load new data.
        setIsLoading(true); // Start the loading process, update the 'isLoading' state to true.
        setError(null); // Clear any error message that might remain from the previous run.
        setProduct(null); // Reset product to null to ensure the UI displays loading or error instead of old data.
        setSuccessMessage(""); // Clear any success/login required message that might remain.


        let productList; // Declare a variable to store the list of all products.

        // --- Performance Improvement: Check data in localStorage before sending Fetch API request ---
        // Attempt to retrieve the JSON string containing the list of all products from localStorage using the defined key.
        const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);

        // Check if product data is saved in localStorage
        if (cachedProducts) {
          // If data is found in localStorage
          try {
             // Attempt to parse the JSON string into a JavaScript array/object.
             productList = JSON.parse(cachedProducts);
             console.log("Sử dụng dữ liệu sản phẩm từ localStorage"); // Log to console to track the data source being used.
          } catch (parseError) {
             // If JSON parsing fails (data in localStorage is corrupted/invalid)
             console.error("Lỗi khi parse dữ liệu sản phẩm từ localStorage:", parseError); // Log parse error
             localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY); // Remove the corrupted data from localStorage
             productList = []; // Set productList to an empty array to force fetching from the original source.
             console.log("Xóa dữ liệu lỗi trong localStorage, sẽ fetch lại."); // Indicate fetching again
          }
        }

        // If productList is empty (due to empty cache, error and removal) OR is not an array, then perform the fetch from the API.
        // This ensures data is always fetched again if cache is unavailable or invalid.
        if (!Array.isArray(productList) || productList.length === 0) {
            console.log("Fetch dữ liệu sản phẩm từ API (cache trống hoặc lỗi)"); // Log to track
            // Send the Fetch API request to API_URL. Pass the signal to be able to cancel the request if needed.
            const response = await fetch(API_URL, { signal });

            // Check the 'ok' property of the response to see if the request was successful (status 200-299).
            if (!response.ok) {
              // If the response is not OK, throw an Error with the error message taken from the MESSAGES constant.
              throw new Error(MESSAGES.ERROR_FETCH);
            }

            const data = await response.json(); // Convert the response body to a JavaScript object/array from JSON.
            // Get the list of products from the received data. Check if data is a direct array or within a 'products' property.
            productList = Array.isArray(data) ? data : data.products || [];
            // Save the product list just fetched into localStorage for use on subsequent page loads.
            // Only save if productList is not empty to avoid storing an empty array if fetching fails or there are no products.
            if (productList.length > 0) {
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
            }
        }


        // --- Find the specific product in the list by ID ---
        // The ID obtained from useParams is a string. The ID in the product JSON data is a number.
        // Use Number(id) to convert the string ID from the URL to a number type for exact comparison using the strict equality operator (===).
        const foundProduct = productList.find((p) => p.id === Number(id));
        console.log(`Tìm sản phẩm với ID: ${id}`, foundProduct); // Log the search result

        // Check if any product matching the ID was found.
        if (!foundProduct) {
          // If no product is found (foundProduct is undefined or null), set the error message "Product does not exist!".
          setError(MESSAGES.ERROR_NOT_FOUND);
          setProduct(null); // Ensure the 'product' state is set to null.
          return; // Stop the fetchProduct function from proceeding further.
        }

        // If the product is found, update the 'product' state with the details of that product.
        setProduct(foundProduct);
        // No need to clear successMessage here, as it relates to the add-to-cart action, not data loading.
      } catch (err) {
        // Catch errors that might occur in the try block (e.g., network error during fetch, JSON parsing error, manually thrown error).
        // Check if the error is NOT an AbortError. AbortError happens when the fetch request is cancelled by AbortController, which is the desired behavior when the component unmounts or dependencies change quickly.
        if (err.name !== "AbortError") {
          console.error("Error in fetchProduct:", err); // Log the real error to the console.
          setError(err.message || MESSAGES.ERROR_FETCH); // Update the 'error' state with the error message from the error object, or the default fetch error message if err.message is empty.
          setProduct(null); // Ensure the 'product' state is null when there is an error.
        }
        // If it's an AbortError, ignore it as it's handled by cleanup.
      } finally {
        // The finally block always runs after try/catch, regardless of whether an error occurred.
        setIsLoading(false); // End the loading process, set isLoading state back to false.
      }
    };

    fetchProduct(); // Call the fetchProduct function to start the data fetching process when the effect runs.

    // Cleanup function for this effect. This function runs when the component is unmounted
    // or when the effect's dependencies ([id]) change and the effect is about to re-run.
    return () => controller.abort(); // Cancel any pending Fetch API request if it hasn't completed yet.
  }, [id]); // Dependency array: This effect will re-run whenever the value of the 'id' variable (obtained from the URL) changes. This ensures that when the user views a different product, the new data will be loaded.

  // --- Function to handle the "Add to Cart" button click ---
  // Uses useCallback to memoize this function. This function is only re-created when variables in the dependency array change.
  const handleAddToCart = useCallback((event) => { // Added event parameter
    // 1. Check user login status
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // If not logged in, display a message requiring login.
      // Use setTimeout to wait a bit (1 second) before navigating,
      // allowing the user time to read the message.
      const timer = setTimeout(() => {
        setSuccessMessage(""); // Clear the message before redirecting.
        navigate("/login"); // Redirect the user to the login page.
      }, 1000); // Wait time is 1000ms (1 second).
      // Cleanup function for setTimeout to prevent memory leak if the component unmounts before the timer finishes.
      return () => clearTimeout(timer);
      // Stop the function, do not proceed with the next steps if not logged in.
    }

    // 2. Check if product data has been loaded and found successfully
    if (!product) {
      console.warn("Không có dữ liệu sản phẩm để thêm vào giỏ."); // Log a warning to the console if there is no product data (might be loading or an error occurred)
      return; // Stop the function if there is no valid product data to add to the cart.
    }

    // 3. If logged in and product data is available, call the 'addToCart' function from CartContext
    addToCart(product); // Pass the current 'product' object to the addToCart function to add it to the cart.

    // 4. Update UI: Display success message "Added to cart successfully!" AND trigger animation
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Set the success message to "Added to cart successfully!".

    // --- Trigger "Fly to Cart" Animation ---
    const productImage = event.target.closest('.product-detail').querySelector('.product-image'); // Get the product image element
    const cartButton = document.querySelector('.header .cart-button'); // Get the cart button element in the header (need to ensure this selector is correct)

    if (productImage && cartButton) {
        const productImageRect = productImage.getBoundingClientRect(); // Get the position and size of the product image
        const cartButtonRect = cartButton.getBoundingClientRect(); // Get the position and size of the cart button

        // Create a clone of the product image
        const flyingImg = productImage.cloneNode();
        flyingImg.classList.add('flying-to-cart'); // Add a class to apply CSS animation
        flyingImg.style.position = 'fixed'; // Set fixed position so it doesn't affect the layout
        flyingImg.style.top = `${productImageRect.top}px`; // Set initial top position based on the original image
        flyingImg.style.left = `${productImageRect.left}px`; // Set initial left position based on the original image
        flyingImg.style.width = `${productImageRect.width}px`; // Set initial width based on the original image
        flyingImg.style.height = `${productImageRect.height}px`; // Set initial height based on the original image
        flyingImg.style.zIndex = 1000; // Ensure the flying image is above other elements
        flyingImg.style.transition = 'top 1s ease-in-out, left 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, opacity 0.8s ease-in'; // Define the transition for the animation

        document.body.appendChild(flyingImg); // Append the temporary image to the body of the page

        // Use requestAnimationFrame to ensure initial position styles are applied before starting the transition
        requestAnimationFrame(() => {
             // Set the target position and size for the flying image
             flyingImg.style.top = `${cartButtonRect.top + cartButtonRect.height / 2 - flyingImg.height / 2}px`; // Center Y position of the cart icon
             flyingImg.style.left = `${cartButtonRect.left + cartButtonRect.width / 2 - flyingImg.width / 2}px`; // Center X position of the cart icon
             flyingImg.style.width = '30px'; // Smaller size when flying to cart
             flyingImg.style.height = '30px';
             flyingImg.style.opacity = '0.5'; // Fade out while flying
        });


        // Remove the temporary image after the animation ends
        flyingImg.addEventListener('transitionend', () => {
             flyingImg.remove();
             // Optional: Navigate to the cart page after the animation finishes
              const navigateTimer = setTimeout(() => {
                  setSuccessMessage(""); // Clear message after timeout.
                  navigate("/cart"); // Navigate the user to the "/cart" route (cart page).
              }, 200); // Wait for an additional 200ms after animation

              // Cleanup function for setTimeout
              return () => clearTimeout(navigateTimer);

        });

    } else {
        // If the cart icon is not found, just display the message and navigate
         const navigateTimer = setTimeout(() => {
             setSuccessMessage(""); // Clear message after timeout.
             navigate("/cart"); // Navigate the user to the "/cart" route (cart page).
         }, 1000); // Wait time is 1000ms (1 second).

         // Cleanup function for setTimeout
         return () => clearTimeout(navigateTimer);
    }

  }, [product, addToCart, isLoggedIn, navigate]); // Dependency array: This function depends on the 'product' state, the 'addToCart' function (from Context), the 'isLoggedIn' state (from Context), and the 'navigate' function (from useNavigate hook).

  // --- Render UI based on component status (loading, error, detail display) ---

  // Conditional Rendering: If the 'isLoading' state is true, display the loading spinner UI.
  if (isLoading) {
    return (
      <div className="loading-container">
        {" "}
        {/* Container wrapping spinner and loading text */}
        <div className="loading-spinner"></div>{" "}
        {/* Spinning spinner icon */}
        <p className="loading-text">{MESSAGES.LOADING}</p>{" "}
        {/* Display "Loading..." message from constant */}
      </div>
    );
  }

  // Conditional Rendering: If the 'error' state has a value (not null or empty string), display the error message.
  if (error) {
    return (
      <div className="product-detail error-state">
        {" "}
        {/* Container displaying error status */}
        <p className="error-message">❌ {error}</p>{" "}
        {/* Display the content of the error message */}
        {/* Group of action buttons in error state */}
        <div className="button-group">
          {/* "Back to Home" button using Link component for SPA navigation */}
          <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
            ⬅ Quay lại{" "}
            {/* Button text */}
          </Link>
        </div>
      </div>
    );
  }

  // Final check: If not loading, no error, but 'product' state is still null.
  // This situation is rare if the error handling and product finding logic above are correct,
  // but this check is still safe to prevent rendering errors when product is null.
  // If product is null at this point, it means the product was not found
  // and the "Product not found!" error message has been set and displayed in the if (error) block above.
  if (!product) {
       return null; // Render nothing further if there is no valid product data to display details for.
  }


  // --- Render product detail UI when data is loaded and product is found ---
  // If the component is not in loading state, has no errors, and has valid product data, display product details.
  return (
    <div className="product-detail">
      {" "}
      {/* Main container wrapping all content of the product detail page */}
      {/* Main content section of the product: image, name, price, description, specifications */}
      <section className="product-content">
        <h2>{product.name}</h2>{" "}
        {/* Display product name (from 'product' state) */}
        {/* Product image */}
        <img
          src={product.image} // Product image path
          alt={product.name} // Alt text for the image, using the product name (important for SEO and accessibility)
          className="product-image" // CSS class for styling the image
          loading="lazy" // Attribute allowing the browser to load the image only when it's visible on screen, improving initial page load performance
        />
        {/* Section displaying product price */}
        <div className="price-section">
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ{" "}
            {/* Display product price, formatted according to Vietnamese currency */}
          </p>
        </div>
        <p className="description">{product.description}</p>{" "}
        {/* Display product description */}
        {/* Section displaying technical specifications */}
        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3>{" "}
          {/* Title for the specifications section */}
          <ul>
            {" "}
            {/* Unordered list to display specifications */}
            {/* Display each technical specification. Use the OR operator (||) to provide a default string
                ("Không có thông tin") if the corresponding property in the 'product' object doesn't exist, is null, undefined, or empty. */}
            <li>📱 Màn hình: {product.screen || "Không có thông tin"}</li>
            <li>⚡ Chip: {product.chip || "Không có thông tin"}</li>
            <li>💾 RAM: {product.ram || "Không có thông tin"}</li>
            <li>💽 Bộ nhớ: {product.storage || "Không có thông tin"}</li>
            <li>📷 Camera: {product.camera || "Không có thông tin"}</li>
            <li>🔋 Pin: {product.battery || "Không có thông tin"}</li>
          </ul>
        </div>
        {/* Display success message (e.g., "Added to cart successfully!") or
            login required message if 'successMessage' state has a value */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>
      {/* --- Action Buttons Group --- */}
      {/* Container holding "Add to Cart" and "Back" buttons */}
      <div className="button-group">
        {/* "Add to Cart" button */}
        <button
          className="add-to-cart" // CSS class for button styling
          onClick={handleAddToCart} // Attach the button click event handler function (memoized using useCallback)
          disabled={!product} // Disable the button if the 'product' state is null (e.g., loading or error)
          aria-label={`Thêm ${product?.name || 'sản phẩm này'} vào giỏ hàng`} // Accessibility attribute. Use optional chaining (?.) to avoid errors if product is null.
        >
          🛒 Thêm vào giỏ{" "}
          {/* Button text */}
        </button>
        {/* "Back" button to navigate the user back to the homepage or product list page */}
        <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
          ⬅ Quay lại{" "}
          {/* Button/link text */}
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Export the ProductDetail component as the default export so it can be used in other files (usually in React Router configuration)