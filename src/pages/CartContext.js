import React, { createContext, useState, useCallback } from "react";

// Tạo CartContext để chia sẻ trạng thái giỏ hàng
export const CartContext = createContext(undefined);

// Component CartProvider cung cấp context cho các component con
export const CartProvider = ({ children }) => {
  // State để quản lý danh sách sản phẩm trong giỏ hàng
  const [cart, setCart] = useState([]); // Mảng giỏ hàng ban đầu rỗng

  // Hàm tìm kiếm sản phẩm trong giỏ hàng theo ID, sử dụng useCallback để tối ưu hiệu suất
  const findItem = useCallback(
    (id) => cart.find((item) => item.id === id), // Tìm sản phẩm có ID tương ứng
    [cart] // Phụ thuộc vào cart
  );

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(
    (product) => {
      setCart((prev) => {
        const existingItem = findItem(product.id); // Kiểm tra sản phẩm đã có trong giỏ chưa
        if (existingItem) {
          // Nếu sản phẩm đã tồn tại, tăng số lượng lên 1
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        // Nếu sản phẩm chưa có, thêm mới với số lượng 1
        return [...prev, { ...product, quantity: 1 }];
      });
    },
    [findItem] // Phụ thuộc vào findItem
  );

  // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = useCallback(
    (id, delta) => {
      setCart((prev) =>
        prev
          .map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + delta } // Cập nhật số lượng
              : item
          )
          .filter((item) => item.quantity > 0) // Loại bỏ sản phẩm nếu số lượng <= 0
      );
    },
    [] // Không phụ thuộc vào biến nào
  );

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback(
    (id) => {
      setCart((prev) => prev.filter((item) => item.id !== id)); // Lọc bỏ sản phẩm có ID tương ứng
    },
    [] // Không phụ thuộc vào biến nào
  );

  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = useCallback(() => {
    setCart([]); // Đặt giỏ hàng về mảng rỗng
  }, []) // Không phụ thuộc vào biến nào);

  // Đối tượng giá trị context để cung cấp cho các component con
  const cartContextValue = {
    cart, // Danh sách sản phẩm trong giỏ hàng
    addToCart, // Hàm thêm sản phẩm
    increaseQuantity: (id) => updateQuantity(id, 1), // Hàm tăng số lượng
    decreaseQuantity: (id) => updateQuantity(id, -1), // Hàm giảm số lượng
    removeFromCart, // Hàm xóa sản phẩm
    clearCart, // Hàm xóa toàn bộ giỏ hàng
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children} {/* Render các component con */}
    </CartContext.Provider>
  );
};

export default CartProvider;