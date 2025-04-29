// Import necessary React hooks:
// createContext: To create Context (a way to share cart data between components).
// useState: To manage the local state of the shopping cart (list of products in the cart).
// useEffect: To perform side effects such as reading/writing cart data to localStorage when the component mounts or when the cart/user state changes.
// useCallback: To memoize cart manipulation functions (addToCart, removeFromCart, updateQuantity, clearCart), helping to optimize performance.
// useContext: To access other Contexts (AuthContext) to get the current user information.
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
// Import AuthContext to get the logged-in user information.
import { AuthContext } from "../account/AuthContext"; // Assuming AuthContext is in the 'account' directory

// --- Constant Definition ---

// Prefix for the cart storage key in localStorage.
// The full key name will be "cart_[username]" to differentiate carts for each user.
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// --- Define Default Context Value ---
// This value is used by child components when they call useContext(CartContext)
// in cases where the corresponding Context Provider (CartProvider) has not been rendered.
const defaultCartContext = {
  cart: [], // Default cart is an empty array
  totalPrice: 0, // Default total price is 0
  addToCart: () => {}, // Default empty function
  removeFromCart: () => {}, // Default empty function
  updateQuantity: () => {}, // Default empty function
  clearCart: () => {}, // Default empty function
};

// --- Create CartContext ---
// Use the createContext() function to create a new Context that holds the cart state and management functions.
export const CartContext = createContext(defaultCartContext);

// --- CartProvider Component ---
// This is the Provider component for CartContext, managing the cart state and load/save/update logic.
export const CartProvider = ({ children }) => {
  // Use useContext to access AuthContext and get user information.
  // We need 'user' to identify whose cart to load/save.
  const { user } = useContext(AuthContext) || { user: null }; // Get user from AuthContext, provide safe default value

  // 'cart' state: Stores the list of products in the current shopping cart.
  // Initially an empty array. Data will be loaded from localStorage in useEffect.
  const [cart, setCart] = useState([]);

  // --- Effect hook to load the cart from localStorage when the component mounts or the user changes ---
  // This effect runs when the component mounts AND whenever the 'user' object changes (user logs in/out).
  useEffect(() => {
    console.log("🛒 CartContext useEffect [user] triggered. Current user:", user ? user.username : "null");
    // Only attempt to load the cart if there IS a logged-in user.
    if (user && user.username) { // Ensure user exists and has a username
      // Create the specific cart storage key for the current user.
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      console.log("🛒 Attempting to load cart from key:", userCartKey);
      const savedCart = localStorage.getItem(userCartKey); // Retrieve cart data from localStorage using the specific key.

      if (savedCart) {
        try {
          // Parse the JSON string into a product array.
          const parsedCart = JSON.parse(savedCart);
          // Check if the parsed result is a valid array, then update the 'cart' state.
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
            console.log(`🛒 Đã tải giỏ hàng (${parsedCart.length} items) cho người dùng ${user.username} từ localStorage.`);
          } else {
            // If data is invalid, log a warning and start with an empty cart.
            console.warn(`🛒 Dữ liệu giỏ hàng cho người dùng ${user.username} trong localStorage không hợp lệ, bắt đầu với giỏ hàng rỗng.`);
            setCart([]);
            // Optionally remove the corrupted data: localStorage.removeItem(userCartKey);
          }
        } catch (error) {
          // Catch JSON parsing errors.
          console.error(`🛒 Lỗi khi parse giỏ hàng cho người dùng ${user.username} từ localStorage:`, error);
          setCart([]); // Start with an empty cart on error.
          // Optionally remove the corrupted data: localStorage.removeItem(userCartKey);
        }
      } else {
        // If no cart data is found in localStorage for this user, start with an empty cart.
        setCart([]);
        console.log(`🛒 Không tìm thấy giỏ hàng đã lưu cho người dùng ${user.username}, bắt đầu với giỏ hàng rỗng.`);
      }
    } else {
      // If there is NO logged-in user (user is null), set the cart to empty.
      // This ensures the cart is empty when no one is logged in.
      setCart([]);
      console.log("🛒 Không có người dùng đăng nhập, đặt giỏ hàng về rỗng.");
    }
    // No cleanup is needed for localStorage in this case as we want to keep the data.
    // Cleanup will be handled in the cart saving effect.
  }, [user]); // Dependency array: effect re-runs when the 'user' object changes.

  // --- Effect hook to save the cart to localStorage when the cart changes ---
  // This effect runs whenever the 'cart' state changes.
  useEffect(() => {
    console.log("🛒 CartContext useEffect [cart, user] triggered. Current cart:", cart, "Current user:", user ? user.username : "null");
    // Only save the cart if there IS a logged-in user.
    // This prevents saving an empty cart or the previous user's cart after logout.
    if (user && user.username && cart) { // Ensure user exists, has a username and cart is not null/undefined
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`; // Specific storage key for the user
      console.log("🛒 Saving cart to key:", userCartKey, "Cart data:", cart);
      localStorage.setItem(userCartKey, JSON.stringify(cart)); // Save the current 'cart' state to localStorage (convert to JSON).
      console.log(`🛒 Đã lưu giỏ hàng (${cart.length} items) cho người dùng ${user.username} vào localStorage.`);
    } else if (!user && cart && cart.length > 0) {
        // Rare case: If the user logs out but the cart state still contains data.
        // The logout logic in AuthContext should ideally handle setting user to null, which triggers
        // the useEffect [user] to set the cart to empty. However, adding a log here for observation.
        console.warn("🛒 Attempted to save cart when no user is logged in, but cart is not empty. This shouldn't happen if logout clears the cart state correctly.");
    }
    // Cleanup function: When the component unmounts or the effect re-runs, this function executes.
    // In this case, we don't need specific localStorage cleanup in the return function
    // because saving a new state naturally overwrites the old one for the same key.
  }, [cart, user]); // Dependency array: effect re-runs when 'cart' or 'user' changes.

  // --- Function to add a product to the cart ---
  // Uses useCallback to memoize this function. The function is only re-created when the 'cart' state or 'user' changes.
  const addToCart = useCallback((product) => {
    console.log("🛒 addToCart called for product:", product);
    if (!user || !user.username) {
        console.warn("🛒 Cannot add to cart: No user or username is available.");
        // Optionally show a message to the user asking them to log in
        return;
    }
    // Find if the product already exists in the cart.
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // If the product is already in the cart: Create a new array by copying the old cart.
      // Increment the quantity of that product by 1.
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart); // Update the 'cart' state with the new array.
    } else {
      // If the product is not in the cart: Create a new product object with initial quantity 1.
      // Add this new product to the end of the current cart array.
      setCart([...cart, { ...product, quantity: 1 }]); // Update the 'cart' state with the new array.
    }
    console.log("🛒 Đã thêm sản phẩm vào giỏ hàng.");
  }, [cart, user]); // Added user to dependency array as we check for user inside

  // --- Function to remove a product from the cart ---
  // Uses useCallback to memoize this function. The function is only re-created when the 'cart' state or 'user' changes.
  const removeFromCart = useCallback((productId) => {
    console.log("🛒 removeFromCart called for product ID:", productId);
    if (!user || !user.username) {
        console.warn("🛒 Cannot remove from cart: No user or username is available.");
        return;
    }
    // Filter out products whose ID is DIFFERENT from the productId to be removed.
    // The result is a new array that does not contain the product with that ID.
    setCart(cart.filter((item) => item.id !== productId)); // Update the 'cart' state with the filtered array.
    console.log(`🛒 Đã xóa sản phẩm có ID ${productId} khỏi giỏ hàng.`);
  }, [cart, user]); // Added user to dependency array

  // --- Function to update the quantity of a product in the cart ---
  // Uses useCallback to memoize this function. The function is only re-created when the 'cart' state or 'user' changes.
  const updateQuantity = useCallback((productId, quantity) => {
    console.log(`🛒 updateQuantity called for product ID: ${productId}, quantity: ${quantity}`);
    if (!user || !user.username) {
        console.warn("🛒 Cannot update quantity: No user or username is available.");
        return;
    }
    // Ensure the new quantity is a non-negative integer.
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0); // parseInt might return NaN, use || 0 to handle.

    // If the new quantity is 0, call the remove product function.
    if (newQuantity === 0) {
      removeFromCart(productId);
      return; // Stop the function after removing.
    }

    // Create a new array by mapping over the current cart.
    // Find the product with the matching ID, update its quantity.
    // Keep other products unchanged.
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart); // Update the 'cart' state with the new array.
    console.log(`🛒 Đã cập nhật số lượng sản phẩm ID ${productId} thành ${newQuantity}.`);
  }, [cart, removeFromCart, user]); // Added user to dependency array

  // --- Function to clear the entire cart ---
  // Uses useCallback to memoize this function. The function does not depend on the 'cart' state to operate.
  const clearCart = useCallback(() => {
    console.log("🛒 clearCart called.");
    if (!user || !user.username) {
        console.warn("🛒 Cannot clear cart: No user or username is available.");
        return;
    }
    setCart([]); // Set the 'cart' state to an empty array.
    console.log("🛒 Đã xóa toàn bộ giỏ hàng.");
    // Note: The cart saving effect will automatically run after the 'cart' state changes to an empty array,
    // updating localStorage for the current user.
  }, [user]); // Added user to dependency array

  // --- Calculate total price of the cart ---
  // Use the .reduce() method on the 'cart' array to calculate the total price.
  // reduce takes two arguments: a callback function and an initial value (here, 0).
  // The callback function receives the accumulator (the accumulating variable, initially 0) and the current item.
  // It returns the accumulator + item.price * item.quantity.
  const totalPrice = cart.reduce(
    (accumulator, item) => accumulator + item.price * item.quantity,
    0 // Initial value of the accumulator
  );

  // --- Context Value Object ---
  // Create an object containing all the state and functions that we want to share
  // with child components through CartContext.
  const cartContextValue = {
    cart, // Provide the current cart state
    totalPrice, // Provide the calculated total price
    addToCart, // Provide the add product function (memoized)
    removeFromCart, // Provide the remove product function (memoized)
    updateQuantity, // Provide the update quantity function (memoized)
    clearCart, // Provide the clear cart function (memoized)
  };

  return (
    // --- Provide Context ---
    // Use the CartContext.Provider component to "wrap" the child components.
    // The 'value' attribute of the Provider receives the 'cartContextValue' object.
    // Any component nested within this Provider and using the useContext(CartContext) hook
    // can access the values and functions defined in 'cartContextValue'.
    <CartContext.Provider value={cartContextValue}>
      {children}{" "}
      {/* children represents other React components placed between the opening and closing tags of CartProvider. The Provider will provide Context to this entire child tree. */}
    </CartContext.Provider>
  );
};

// Export the CartProvider component as the default export.
// This allows this component to be easily imported and used in other files
// (e.g., in App.js) to wrap the entire application or a part of the application that needs to access the cart.
export default CartProvider;