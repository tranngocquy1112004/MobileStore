import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { AuthContext } from "../account/AuthContext";

// --- Constants ---
const LOCAL_STORAGE_CART_PREFIX = "cart_";
const DEFAULT_CART_CONTEXT = {
  cart: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

// --- Context ---
export const CartContext = createContext(DEFAULT_CART_CONTEXT);

// --- Utilities ---
const saveCartToStorage = (user, cart) => {
  if (!user?.username || !Array.isArray(cart)) return false;
  const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
  try {
    localStorage.setItem(userCartKey, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu giỏ hàng cho người dùng ${user.username}:`, error);
    return false;
  }
};

const loadCartFromStorage = (user) => {
  if (!user?.username) return [];
  const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
  try {
    const savedCart = localStorage.getItem(userCartKey);
    return savedCart ? JSON.parse(savedCart).filter((item) => item?.id) || [] : [];
  } catch (error) {
    console.error(`Lỗi khi phân tích giỏ hàng cho người dùng ${user.username}:`, error);
    return [];
  }
};

const calculateTotalPrice = (cart) =>
  Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0) : 0;

// --- Provider Component ---
export const CartProvider = ({ children }) => {
  const { user = null } = useContext(AuthContext) || {};
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(user?.username ? loadCartFromStorage(user) : []);
  }, [user]);

  useEffect(() => {
    if (user?.username) saveCartToStorage(user, cart);
  }, [cart, user]);

  const addToCart = (product) => {
    if (!user?.username || !product?.id) {
      console.warn(
        !user?.username ? "Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập" :
        "Không thể thêm vào giỏ hàng: Dữ liệu sản phẩm không hợp lệ"
      );
      return;
    }
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: (newCart[existingItemIndex].quantity || 0) + 1,
        };
        return newCart;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    if (!user?.username || !productId) {
      console.warn(
        !user?.username ? "Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập" :
        "Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ"
      );
      return;
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (!user?.username || !productId) {
      console.warn(
        !user?.username ? "Không thể cập nhật số lượng: Người dùng chưa đăng nhập" :
        "Không thể cập nhật số lượng: ID sản phẩm không hợp lệ"
      );
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
  };

  const clearCart = () => {
    if (!user?.username) {
      console.warn("Không thể xóa giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    setCart([]);
  };

  const totalPrice = useMemo(() => calculateTotalPrice(cart), [cart]);

  const cartContextValue = useMemo(() => ({
    cart,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }), [cart, totalPrice]);

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>;
};

export default CartProvider;