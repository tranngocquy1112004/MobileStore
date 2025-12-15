import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { AuthContext } from "./AuthContext";

const LOCAL_STORAGE_CART_PREFIX = "cart_";

const DEFAULT_CART_CONTEXT = {
  cart: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

export const CartContext = createContext(DEFAULT_CART_CONTEXT);

const getUserCartKey = (username) => `${LOCAL_STORAGE_CART_PREFIX}${username}`;

const saveCartToStorage = (user, cart) => {
  if (!user?.username || !Array.isArray(cart)) return false;
  try {
    const key = getUserCartKey(user.username);
    localStorage.setItem(key, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu giỏ hàng cho ${user.username}:`, error);
    return false;
  }
};

const loadCartFromStorage = (user) => {
  if (!user?.username) return [];
  try {
    const key = getUserCartKey(user.username);
    const saved = localStorage.getItem(key);
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id) : [];
  } catch (error) {
    console.error(`Lỗi khi tải giỏ hàng của ${user.username}:`, error);
    return [];
  }
};

const calculateTotalPrice = (cart) =>
  cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

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
        !user?.username
          ? "Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập"
          : "Không thể thêm vào giỏ hàng: Dữ liệu sản phẩm không hợp lệ"
      );
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = (updated[existingIndex].quantity || 0) + 1;
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    if (!user?.username || !productId) {
      console.warn(
        !user?.username
          ? "Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập"
          : "Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ"
      );
      return;
    }
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (!user?.username || !productId) {
      console.warn(
        !user?.username
          ? "Không thể cập nhật số lượng: Người dùng chưa đăng nhập"
          : "Không thể cập nhật số lượng: ID sản phẩm không hợp lệ"
      );
      return;
    }
    const newQty = Math.max(0, parseInt(quantity, 10) || 0);
    if (newQty === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
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

  const cartContextValue = useMemo(
    () => ({
      cart,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cart, totalPrice]
  );

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>;
};

export default CartProvider;
