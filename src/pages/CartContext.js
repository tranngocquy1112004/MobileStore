// src/context/CartContext.js (Đổi tên file để phản ánh đây là Context)

// Import necessary React hooks:
import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from "react"; // Thêm useMemo
// Import AuthContext to get the logged-in user information.
import { AuthContext } from "../account/AuthContext"; // Giả định AuthContext nằm trong thư mục 'account'

// --- Định nghĩa Hằng số ---
// Tiền tố cho key lưu giỏ hàng trong localStorage (ví dụ: "cart_[username]").
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// --- Định nghĩa Giá trị Context Mặc định ---
// Giá trị này được sử dụng nếu useContext(CartContext) được gọi bên ngoài CartProvider.
const defaultCartContext = {
  cart: [], // Mảng rỗng cho giỏ hàng mặc định
  totalPrice: 0, // Tổng tiền mặc định là 0
  addToCart: () => {}, // Hàm rỗng mặc định
  removeFromCart: () => {}, // Hàm rỗng mặc định
  updateQuantity: () => {}, // Hàm rỗng mặc định
  clearCart: () => {}, // Hàm rỗng mặc định
};

// --- Tạo CartContext ---
// Export context để các component khác có thể sử dụng useContext(CartContext)
export const CartContext = createContext(defaultCartContext);

// --- Component CartProvider ---
// Component này quản lý state và logic của giỏ hàng và cung cấp nó thông qua Context.
export const CartProvider = ({ children }) => {
  // Truy cập AuthContext để lấy thông tin người dùng hiện tại cho giỏ hàng theo người dùng.
  // Sử dụng optional chaining và giá trị mặc định để tránh lỗi nếu AuthContext chưa sẵn sàng
  const { user } = useContext(AuthContext) || { user: null };

  // 'cart' state: Lưu trữ danh sách các sản phẩm trong giỏ hàng. Khởi tạo là mảng rỗng.
  const [cart, setCart] = useState([]);

  // --- Hook Effect để tải giỏ hàng từ localStorage khi component mount hoặc người dùng thay đổi ---
  useEffect(() => {
    if (user && user.username) {
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      const savedCart = localStorage.getItem(userCartKey);

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            const validCart = parsedCart.filter(item => item && typeof item.id !== 'undefined');
            setCart(validCart);
          } else {
            setCart([]);
          }
        } catch (error) {
          console.error(`Error parsing cart for user ${user.username}:`, error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user]);

  // --- Hook Effect để lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi ---
  useEffect(() => {
    if (user && user.username && Array.isArray(cart)) {
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      try {
        localStorage.setItem(userCartKey, JSON.stringify(cart));
      } catch (error) {
        console.error(`Error saving cart for user ${user.username}:`, error);
      }
    }
  }, [cart, user]);

  // --- Hàm thêm sản phẩm vào giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const addToCart = useCallback((product) => {
    if (!user || !user.username) {
      console.warn("Cannot add to cart: User not logged in");
      return;
    }

    if (!product || typeof product.id === 'undefined') {
      console.warn("Cannot add to cart: Invalid product data");
      return;
    }

    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity = (newCart[existingItemIndex].quantity || 0) + 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }, [cart, user]);

  // --- Hàm xóa sản phẩm khỏi giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const removeFromCart = useCallback((productId) => {
    if (!user || !user.username) {
      console.warn("Cannot remove from cart: User not logged in");
      return;
    }

    if (typeof productId === 'undefined' || productId === null) {
      console.warn("Cannot remove from cart: Invalid product ID");
      return;
    }

    setCart(cart.filter((item) => item.id !== productId));
  }, [cart, user]);

  // --- Hàm cập nhật số lượng của một sản phẩm trong giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const updateQuantity = useCallback((productId, quantity) => {
    if (!user || !user.username) {
      console.warn("Cannot update quantity: User not logged in");
      return;
    }

    if (typeof productId === 'undefined' || productId === null) {
      console.warn("Cannot update quantity: Invalid product ID");
      return;
    }

    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);

    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map((item) =>
      (item && typeof item.id !== 'undefined' && item.id === productId) 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    setCart(newCart);
  }, [cart, removeFromCart, user]);

  // --- Hàm xóa toàn bộ giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const clearCart = useCallback(() => {
    if (!user || !user.username) {
      console.warn("Cannot clear cart: User not logged in");
      return;
    }
    setCart([]);
  }, [user]);

  // --- Tính toán tổng tiền của giỏ hàng sử dụng useMemo ---
  // useMemo giúp tính toán lại totalPrice chỉ khi cart thay đổi, tối ưu hiệu suất.
  const totalPrice = useMemo(() => {
    return Array.isArray(cart)
      ? cart.reduce(
          (accumulator, item) => accumulator + (item?.price || 0) * (item?.quantity || 0),
          0
        )
      : 0;
  }, [cart]);

  // --- Đối tượng Giá trị Context ---
  // Gói state và các hàm để chia sẻ thông qua Context.
  const cartContextValue = {
    cart, // Cung cấp state giỏ hàng
    totalPrice, // Cung cấp tổng tiền đã tính
    addToCart, // Cung cấp hàm thêm
    removeFromCart, // Cung cấp hàm xóa
    updateQuantity, // Cung cấp hàm cập nhật số lượng
    clearCart, // Cung cấp hàm xóa toàn bộ giỏ hàng
  };

  return (
    // --- Cung cấp Context ---
    // Bọc các children bằng Provider và truyền giá trị context.
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Export component CartProvider.
export default CartProvider;
