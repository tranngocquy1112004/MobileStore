import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { AuthContext } from "../account/AuthContext";

// --- HẰNG SỐ ---
const LOCAL_STORAGE_CART_PREFIX = "cart_";
const DEFAULT_CART_CONTEXT = {
  cart: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

// --- TẠO CONTEXT ---
export const CartContext = createContext(DEFAULT_CART_CONTEXT);

// --- HÀM TIỆN ÍCH ---
/**
 * Lưu giỏ hàng vào localStorage
 * @param {Object} user - Thông tin người dùng
 * @param {Array} cart - Danh sách sản phẩm trong giỏ hàng
 * @returns {boolean} Thành công hay thất bại
 */
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

/**
 * Tải giỏ hàng từ localStorage
 * @param {Object} user - Thông tin người dùng
 * @returns {Array} Danh sách sản phẩm trong giỏ hàng
 */
const loadCartFromStorage = (user) => {
  if (!user?.username) return [];
  const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
  try {
    const savedCart = localStorage.getItem(userCartKey);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return Array.isArray(parsedCart) ? parsedCart.filter((item) => item?.id) : [];
    }
  } catch (error) {
    console.error(`Lỗi khi phân tích giỏ hàng cho người dùng ${user.username}:`, error);
  }
  return [];
};

// --- NHÀ CUNG CẤP CONTEXT ---
/**
 * Nhà cung cấp context giỏ hàng
 * @param {Object} props - Props chứa children
 */
export const CartProvider = ({ children }) => {
  const { user = null } = useContext(AuthContext) || {};
  const [cart, setCart] = useState([]);

  // Tải giỏ hàng khi người dùng thay đổi
  useEffect(() => {
    if (!user?.username) {
      setCart([]);
      return;
    }
    setCart(loadCartFromStorage(user));
  }, [user]);

  // Lưu giỏ hàng khi cart thay đổi
  useEffect(() => {
    if (user?.username) {
      saveCartToStorage(user, cart);
    }
  }, [cart, user]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    if (!user?.username) {
      console.warn("Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    if (!product?.id) {
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
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    if (!user?.username) {
      console.warn("Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    if (!productId) {
      console.warn("Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ");
      return;
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (productId, quantity) => {
    if (!user?.username) {
      console.warn("Không thể cập nhật số lượng: Người dùng chưa đăng nhập");
      return;
    }
    if (!productId) {
      console.warn("Không thể cập nhật số lượng: ID sản phẩm không hợp lệ");
      return;
    }
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    if (!user?.username) {
      console.warn("Không thể xóa giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    setCart([]);
  };

  // Tính tổng tiền giỏ hàng
  const totalPrice = useMemo(() => {
    return Array.isArray(cart)
      ? cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0)
      : 0;
  }, [cart]);

  // Giá trị context
  const cartContextValue = {
    cart,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>;
};

export default CartProvider;