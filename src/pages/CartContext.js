import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from "react";
import { AuthContext } from "../account/AuthContext";

// Hằng số
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// Giá trị mặc định cho context
const defaultCartContext = {
  cart: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

// Tạo context
export const CartContext = createContext(defaultCartContext);

// Hàm tiện ích để lưu giỏ hàng vào localStorage
const saveCartToStorage = (user, cart) => {
  if (user && user.username && Array.isArray(cart)) {
    const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
    try {
      localStorage.setItem(userCartKey, JSON.stringify(cart));
    } catch (error) {
      console.error(`Lỗi khi lưu giỏ hàng cho người dùng ${user.username}:`, error);
    }
  }
};

// Hàm tiện ích để tải giỏ hàng từ localStorage
const loadCartFromStorage = (user) => {
  if (user && user.username) {
    const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
    const savedCart = localStorage.getItem(userCartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          return parsedCart.filter(item => item && typeof item.id !== 'undefined');
        }
      } catch (error) {
        console.error(`Lỗi khi phân tích giỏ hàng cho người dùng ${user.username}:`, error);
      }
    }
  }
  return [];
};

// Component CartProvider
export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext) || { user: null };
  const [cart, setCart] = useState([]);

  // Tải giỏ hàng khi người dùng thay đổi
  useEffect(() => {
    if (user) {
      const loadedCart = loadCartFromStorage(user);
      setCart(loadedCart);
    } else {
      setCart([]);
    }
  }, [user]);

  // Lưu giỏ hàng khi cart thay đổi
  useEffect(() => {
    if (user) {
      saveCartToStorage(user, cart);
    }
  }, [cart, user]);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback((product) => {
    if (!user || !user.username) {
      console.warn("Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    if (!product || typeof product.id === 'undefined') {
      console.warn("Không thể thêm vào giỏ hàng: Dữ liệu sản phẩm không hợp lệ");
      return;
    }
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity = (newCart[existingItemIndex].quantity || 0) + 1;
        return newCart;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, [user]);

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback((productId) => {
    if (!user || !user.username) {
      console.warn("Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    if (typeof productId === 'undefined' || productId === null) {
      console.warn("Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ");
      return;
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, [user]);

  // Hàm cập nhật số lượng sản phẩm
  const updateQuantity = useCallback((productId, quantity) => {
    if (!user || !user.username) {
      console.warn("Không thể cập nhật số lượng: Người dùng chưa đăng nhập");
      return;
    }
    if (typeof productId === 'undefined' || productId === null) {
      console.warn("Không thể cập nhật số lượng: ID sản phẩm không hợp lệ");
      return;
    }
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [user, removeFromCart]);

  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = useCallback(() => {
    if (!user || !user.username) {
      console.warn("Không thể xóa giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    setCart([]);
  }, [user]);

  // Tính tổng tiền giỏ hàng với useMemo
  const totalPrice = useMemo(() => {
    return Array.isArray(cart)
      ? cart.reduce(
          (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
          0
        )
      : 0;
  }, [cart]);

  // Đối tượng giá trị context
  const cartContextValue = {
    cart,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;