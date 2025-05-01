// Import necessary React hooks:
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
// Import AuthContext to get the logged-in user information.
import { AuthContext } from "../account/AuthContext"; // Assuming AuthContext is in the 'account' directory

// --- Constant Definition ---
// Prefix for the cart storage key in localStorage (e.g., "cart_[username]").
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// --- Define Default Context Value ---
// This value is used if useContext(CartContext) is called outside of a CartProvider.
const defaultCartContext = {
  cart: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

// --- Create CartContext ---
export const CartContext = createContext(defaultCartContext);

// --- CartProvider Component ---
// This component manages the cart state and logic and provides it via Context.
export const CartProvider = ({ children }) => {
  // Access AuthContext to get the current user for user-specific carts.
  const { user } = useContext(AuthContext) || { user: null };

  // 'cart' state: Stores the list of products in the shopping cart.
  const [cart, setCart] = useState([]);

  // --- Effect hook to load the cart from localStorage when the component mounts or the user changes ---
  useEffect(() => {
    // console.log("🛒 CartContext useEffect [user] triggered. Current user:", user ? user.username : "null"); // Dev log

    // Only attempt to load the cart if there is a logged-in user.
    if (user && user.username) {
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      // console.log("🛒 Attempting to load cart from key:", userCartKey); // Dev log
      const savedCart = localStorage.getItem(userCartKey);

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Check if the parsed result is a valid array
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
            console.log(`🛒 Đã tải giỏ hàng (${parsedCart.length} items) cho người dùng ${user.username} từ localStorage.`);
          } else {
            // If data is invalid JSON but not an array
            console.warn(`🛒 Dữ liệu giỏ hàng cho người dùng ${user.username} trong localStorage không hợp lệ (không phải mảng), bắt đầu với giỏ hàng rỗng.`);
            setCart([]);
             // Optional: remove corrupted data if parsing succeeds but it's not an array
             // localStorage.removeItem(userCartKey);
          }
        } catch (error) {
          // Catch JSON parsing errors
          console.error(`🛒 Lỗi khi parse giỏ hàng cho người dùng ${user.username} từ localStorage:`, error);
          setCart([]); // Start with an empty cart on error
           // Optional: remove corrupted data if parsing fails
           // localStorage.removeItem(userCartKey);
        }
      } else {
        // If no cart data is found for this user
        setCart([]);
        // console.log(`🛒 Không tìm thấy giỏ hàng đã lưu cho người dùng ${user.username}, bắt đầu với giỏ hàng rỗng.`); // Dev log
      }
    } else {
      // If there is no logged-in user, set the cart to empty.
      setCart([]);
      // console.log("🛒 Không có người dùng đăng nhập, đặt giỏ hàng về rỗng."); // Dev log
    }
  }, [user]); // Effect re-runs when the 'user' object changes.

  // --- Effect hook to save the cart to localStorage when the cart changes ---
  useEffect(() => {
    // console.log("🛒 CartContext useEffect [cart, user] triggered. Current cart:", cart, "Current user:", user ? user.username : "null"); // Dev log
    // Only save the cart if there is a logged-in user.
    if (user && user.username && Array.isArray(cart)) { // Ensure user and cart (as array) exist
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      // console.log("🛒 Saving cart to key:", userCartKey, "Cart data:", cart); // Dev log
      try {
        localStorage.setItem(userCartKey, JSON.stringify(cart)); // Save the current 'cart' state
        // console.log(`🛒 Đã lưu giỏ hàng (${cart.length} items) cho người dùng ${user.username} vào localStorage.`); // Dev log
      } catch (error) {
        console.error(`🛒 Lỗi khi lưu giỏ hàng cho người dùng ${user.username} vào localStorage:`, error);
      }
    }
    // No cleanup function needed for localStorage saves
  }, [cart, user]); // Effect re-runs when 'cart' or 'user' changes.

  // --- Function to add a product to the cart ---
  const addToCart = useCallback((product) => {
    // console.log("🛒 addToCart called for product:", product); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        // Optionally show a user-facing message asking them to log in
        return;
    }
     if (!product || typeof product.id === 'undefined') { // Basic check for valid product object
         console.warn("🛒 Không thể thêm vào giỏ hàng: Dữ liệu sản phẩm không hợp lệ.");
         return;
     }

    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // If product exists, create new array and increment quantity
      const newCart = [...cart];
      // Ensure quantity is a number before incrementing
      newCart[existingItemIndex].quantity = (newCart[existingItemIndex].quantity || 0) + 1;
      setCart(newCart);
    } else {
      // If product is new, add it with quantity 1
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // console.log("🛒 Đã thêm sản phẩm vào giỏ hàng."); // Dev log
  }, [cart, user]); // Depends on cart and user

  // --- Function to remove a product from the cart ---
  const removeFromCart = useCallback((productId) => {
    // console.log("🛒 removeFromCart called for product ID:", productId); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        return;
    }
     if (typeof productId === 'undefined' || productId === null) { // Basic check for valid product ID
         console.warn("🛒 Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ.");
         return;
     }

    // Filter out the product with the matching ID
    setCart(cart.filter((item) => item.id !== productId));
    // console.log(`🛒 Đã xóa sản phẩm có ID ${productId} khỏi giỏ hàng.`); // Dev log
  }, [cart, user]); // Depends on cart and user

  // --- Function to update the quantity of a product in the cart ---
  const updateQuantity = useCallback((productId, quantity) => {
    // console.log(`🛒 updateQuantity called for product ID: ${productId}, quantity: ${quantity}`); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể cập nhật số lượng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        return;
    }
     if (typeof productId === 'undefined' || productId === null) { // Basic check for valid product ID
         console.warn("🛒 Không thể cập nhật số lượng: ID sản phẩm không hợp lệ.");
         return;
     }

    // Ensure the new quantity is a non-negative integer
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);

    // If the new quantity is 0, remove the item
    if (newQuantity === 0) {
      removeFromCart(productId); // Use removeFromCart callback
      return;
    }

    // Map over cart to find and update quantity
    const newCart = cart.map((item) =>
       // Ensure item.id exists before comparison, and update quantity safely
      item?.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);
    // console.log(`🛒 Đã cập nhật số lượng sản phẩm ID ${productId} thành ${newQuantity}.`); // Dev log
  }, [cart, removeFromCart, user]); // Depends on cart, removeFromCart, and user

  // --- Function to clear the entire cart ---
  const clearCart = useCallback(() => {
    // console.log("🛒 clearCart called."); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể xóa toàn bộ giỏ hàng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        return;
    }
    setCart([]); // Set cart state to empty array
    console.log("🛒 Đã xóa toàn bộ giỏ hàng."); // Keep important log
    // The save effect will persist this empty cart for the user
  }, [user]); // Depends on user

  // --- Calculate total price of the cart ---
  // Calculate total price based on current cart state
  const totalPrice = Array.isArray(cart)
    ? cart.reduce(
        // Calculate sum safely, handling potential missing price/quantity
        (accumulator, item) => accumulator + (item?.price || 0) * (item?.quantity || 0),
        0 // Initial value
      )
    : 0; // Return 0 if cart is not an array

  // --- Context Value Object ---
  // Bundle state and functions to be shared via Context.
  const cartContextValue = {
    cart, // Provide cart state
    totalPrice, // Provide calculated total price
    addToCart, // Provide add function
    removeFromCart, // Provide remove function
    updateQuantity, // Provide update quantity function
    clearCart, // Provide clear cart function
  };

  return (
    // --- Provide Context ---
    // Wrap children with the Provider and pass the context value.
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Export the CartProvider component.
export default CartProvider;