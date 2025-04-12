import React, { createContext, useState, useCallback } from "react";

// Tạo CartContext để chia sẻ dữ liệu giỏ hàng giữa các component
export const CartContext = createContext(undefined);

// Provider chính để quản lý trạng thái giỏ hàng
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // Danh sách sản phẩm trong giỏ

  // Tìm sản phẩm theo id trong giỏ hàng
  const findItem = useCallback(
    (id) => cart.find((item) => item.id === id),
    [cart]
  );

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(
    (product) => {
      setCart((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          // Nếu đã tồn tại, tăng số lượng
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        // Nếu chưa có, thêm mới
        return [...prev, { ...product, quantity: 1 }];
      });
    },
    [] // Không cần phụ thuộc vì chỉ dùng giá trị mới nhất từ setCart
  );

  // Cập nhật số lượng sản phẩm (có thể tăng hoặc giảm)
  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0); // Tự động loại bỏ sản phẩm có số lượng <= 0
    });
  }, []);

  // Xóa một sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Dữ liệu được chia sẻ qua context
  const cartContextValue = {
    cart,
    addToCart,
    increaseQuantity: (id) => updateQuantity(id, 1),
    decreaseQuantity: (id) => updateQuantity(id, -1),
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
