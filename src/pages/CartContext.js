import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { AuthContext } from "../account/AuthContext"; // Import AuthContext để lấy thông tin người dùng

// --- Constants ---
// Tiền tố được sử dụng để lưu trữ giỏ hàng vào localStorage theo người dùng
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// Giá trị mặc định của CartContext, giúp tránh lỗi khi không có provider
const DEFAULT_CART_CONTEXT = {
  cart: [],
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

// --- Context ---
// Tạo CartContext với giá trị mặc định đã định nghĩa ở trên
export const CartContext = createContext(DEFAULT_CART_CONTEXT);

// --- Helpers ---
// Hàm lấy key lưu giỏ hàng của từng người dùng dựa trên username
const getUserCartKey = (username) => `${LOCAL_STORAGE_CART_PREFIX}${username}`;

// Hàm lưu giỏ hàng vào localStorage cho người dùng cụ thể
const saveCartToStorage = (user, cart) => {
  // Kiểm tra xem user và cart hợp lệ hay không
  if (!user?.username || !Array.isArray(cart)) return false;
  try {
    const key = getUserCartKey(user.username); // Tạo key theo username
    localStorage.setItem(key, JSON.stringify(cart)); // Lưu giỏ hàng dưới dạng chuỗi JSON
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu giỏ hàng cho ${user.username}:`, error);
    return false;
  }
};

// Hàm tải giỏ hàng từ localStorage cho người dùng cụ thể
const loadCartFromStorage = (user) => {
  if (!user?.username) return [];
  try {
    const key = getUserCartKey(user.username); // Tạo key dựa trên username
    const saved = localStorage.getItem(key); // Lấy dữ liệu đã lưu
    const parsed = JSON.parse(saved); // Chuyển chuỗi JSON về đối tượng JavaScript
    // Trả về mảng sản phẩm với điều kiện mỗi item có property id hợp lệ
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id) : [];
  } catch (error) {
    console.error(`Lỗi khi tải giỏ hàng của ${user.username}:`, error);
    return [];
  }
};

// Hàm tính tổng tiền của giỏ hàng
const calculateTotalPrice = (cart) =>
  cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

// --- Provider ---
// CartProvider sẽ bọc quanh ứng dụng hoặc các phần cần sử dụng giỏ hàng, cung cấp dữ liệu và các hàm xử lý
export const CartProvider = ({ children }) => {
  // Lấy thông tin người dùng từ AuthContext
  const { user = null } = useContext(AuthContext) || {};
  // State lưu trữ giỏ hàng của người dùng
  const [cart, setCart] = useState([]);

  // Khi thông tin người dùng thay đổi (đăng nhập/đăng xuất) -> tải giỏ hàng tương ứng
  useEffect(() => {
    setCart(user?.username ? loadCartFromStorage(user) : []);
  }, [user]);

  // Khi giỏ hàng thay đổi hoặc người dùng thay đổi -> lưu giỏ hàng vào localStorage
  useEffect(() => {
    if (user?.username) saveCartToStorage(user, cart);
  }, [cart, user]);

  // Hàm thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    if (!user?.username || !product?.id) {
      console.warn(
        !user?.username
          ? "Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập"
          : "Không thể thêm vào giỏ hàng: Dữ liệu sản phẩm không hợp lệ"
      );
      return;
    }

    // Cập nhật giỏ hàng, nếu sản phẩm đã tồn tại thì tăng số lượng, nếu chưa thì thêm mới
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

  // Hàm xóa sản phẩm khỏi giỏ hàng theo ID
  const removeFromCart = (productId) => {
    if (!user?.username || !productId) {
      console.warn(
        !user?.username
          ? "Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập"
          : "Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ"
      );
      return;
    }

    // Lọc bỏ sản phẩm có id tương ứng
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Hàm cập nhật số lượng sản phẩm trong giỏ
  const updateQuantity = (productId, quantity) => {
    if (!user?.username || !productId) {
      console.warn(
        !user?.username
          ? "Không thể cập nhật số lượng: Người dùng chưa đăng nhập"
          : "Không thể cập nhật số lượng: ID sản phẩm không hợp lệ"
      );
      return;
    }

    // Chuyển đổi số lượng và đảm bảo số lượng không âm
    const newQty = Math.max(0, parseInt(quantity, 10) || 0);
    // Nếu số lượng mới là 0 thì xóa sản phẩm
    if (newQty === 0) {
      removeFromCart(productId);
      return;
    }

    // Cập nhật số lượng cho sản phẩm có id tương ứng
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = () => {
    if (!user?.username) {
      console.warn("Không thể xóa giỏ hàng: Người dùng chưa đăng nhập");
      return;
    }
    setCart([]);
  };

  // Tính toán tổng giá trị giỏ hàng, sử dụng useMemo để chỉ tính lại khi cart thay đổi
  const totalPrice = useMemo(() => calculateTotalPrice(cart), [cart]);

  // Tạo đối tượng giá trị cho CartContext, sử dụng useMemo để tối ưu hiệu suất
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

  // Cung cấp giá trị cartContextValue cho toàn bộ component con của CartProvider
  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;