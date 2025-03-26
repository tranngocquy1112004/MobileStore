import React, { createContext, useState, useCallback } from "react";

// Tạo CartContext để chia sẻ trạng thái giỏ hàng giữa các component
// - CartContext sẽ được sử dụng bởi các component con thông qua useContext
export const CartContext = createContext();

// CartProvider component để cung cấp context cho các component con
// - Nhận prop children để render các component con bên trong
export const CartProvider = ({ children }) => {
  // State để quản lý giỏ hàng
  // - cart: Mảng chứa các sản phẩm trong giỏ, mỗi sản phẩm có thuộc tính quantity
  const [cart, setCart] = useState([]);

  // Hàm thêm sản phẩm vào giỏ hàng
  // - Sử dụng useCallback để tránh tạo lại hàm không cần thiết khi component re-render
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Nếu đã có, tăng quantity lên 1
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Nếu chưa có, thêm sản phẩm mới với quantity là 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []); // Dependency array rỗng vì không phụ thuộc vào state hay prop nào

  // Hàm tăng số lượng của một sản phẩm trong giỏ
  // - Sử dụng useCallback để tối ưu hiệu suất
  const increaseQuantity = useCallback((id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []); // Dependency array rỗng vì không phụ thuộc vào state hay prop nào

  // Hàm giảm số lượng của một sản phẩm trong giỏ
  // - Nếu quantity giảm về 0, xóa sản phẩm khỏi giỏ
  // - Sử dụng useCallback để tối ưu hiệu suất
  const decreaseQuantity = useCallback((id) => {
    setCart((prevCart) => {
      // Tìm sản phẩm trong giỏ
      const item = prevCart.find((item) => item.id === id);
      // Nếu quantity là 1, xóa sản phẩm khỏi giỏ
      if (item.quantity === 1) {
        return prevCart.filter((item) => item.id !== id);
      }
      // Nếu quantity > 1, giảm quantity đi 1
      return prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  }, []); // Dependency array rỗng vì không phụ thuộc vào state hay prop nào

  // Hàm xóa một sản phẩm khỏi giỏ
  // - Sử dụng useCallback để tối ưu hiệu suất
  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []); // Dependency array rỗng vì không phụ thuộc vào state hay prop nào

  // Hàm xóa toàn bộ giỏ hàng
  // - Sử dụng useCallback để tối ưu hiệu suất
  const clearCart = useCallback(() => {
    setCart([]);
  }, []); // Dependency array rỗng vì không phụ thuộc vào state hay prop nào

  // Giá trị context để chia sẻ với các component con
  // - Bao gồm state cart và các hàm để thao tác với giỏ hàng
  const contextValue = {
    cart, // Mảng giỏ hàng
    addToCart, // Hàm thêm sản phẩm vào giỏ
    increaseQuantity, // Hàm tăng số lượng
    decreaseQuantity, // Hàm giảm số lượng
    removeFromCart, // Hàm xóa sản phẩm
    clearCart, // Hàm xóa toàn bộ giỏ
  };

  // Render CartContext.Provider để cung cấp contextValue cho các component con
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};