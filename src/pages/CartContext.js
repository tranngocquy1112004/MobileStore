import React, { createContext, useState, useCallback } from "react";

// Tạo CartContext với giá trị mặc định là undefined
export const CartContext = createContext(undefined);

// Component CartProvider - Cung cấp trạng thái và hàm quản lý giỏ hàng cho các component con
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // State lưu danh sách sản phẩm trong giỏ hàng, ban đầu là mảng rỗng

  // Hàm tìm sản phẩm trong giỏ hàng theo id
  const findItem = (id) => cart.find((item) => item.id === id);

  // Hàm thêm sản phẩm vào giỏ hàng, dùng useCallback để tối ưu hiệu năng
  const addToCart = useCallback(
    (product) => {
      setCart((prev) => {
        const existingItem = findItem(product.id); // Kiểm tra sản phẩm đã có trong giỏ chưa
        if (existingItem) {
          // Nếu đã có, tăng số lượng lên 1
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 } // Cập nhật quantity
              : item // Giữ nguyên các sản phẩm khác
          );
        }
        // Nếu chưa có, thêm sản phẩm mới với quantity = 1
        return [...prev, { ...product, quantity: 1 }];
      });
    },
    [findItem] // Phụ thuộc vào findItem (dùng cart từ closure)
  );

  // Hàm cập nhật số lượng sản phẩm trong giỏ, dùng useCallback để tối ưu
  const updateQuantity = useCallback(
    (id, change) => {
      setCart((prev) => {
        const item = findItem(id); // Tìm sản phẩm theo id
        if (!item) return prev; // Nếu không tìm thấy, giữ nguyên giỏ hàng

        const newQuantity = item.quantity + change; // Tính số lượng mới

        if (newQuantity <= 0) {
          // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ
          return prev.filter((item) => item.id !== id);
        }

        // Cập nhật số lượng cho sản phẩm tương ứng
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
      });
    },
    [findItem] // Phụ thuộc vào findItem (dùng cart từ closure)
  );

  // Hàm xóa sản phẩm khỏi giỏ hàng, dùng useCallback để tối ưu
  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id)); // Lọc bỏ sản phẩm có id tương ứng
  }, []); // Không phụ thuộc vào biến nào

  // Hàm xóa toàn bộ giỏ hàng, dùng useCallback để tối ưu
  const clearCart = useCallback(() => {
    setCart([]); // Đặt lại giỏ hàng về mảng rỗng
  }, []); // Không phụ thuộc vào biến nào

  // Object chứa các giá trị và hàm cung cấp qua Context
  const cartContextValue = {
    cart, // Danh sách sản phẩm trong giỏ hàng
    addToCart, // Hàm thêm sản phẩm vào giỏ
    increaseQuantity: (id) => updateQuantity(id, 1), // Hàm tăng số lượng sản phẩm
    decreaseQuantity: (id) => updateQuantity(id, -1), // Hàm giảm số lượng sản phẩm
    removeFromCart, // Hàm xóa sản phẩm khỏi giỏ
    clearCart, // Hàm xóa toàn bộ giỏ hàng
  };

  // Render CartContext.Provider để cung cấp giá trị cho các component con
  return (
    <CartContext.Provider value={cartContextValue}>
      {children} {/* Hiển thị các component con được bao bọc */}
    </CartContext.Provider>
  );
};

export default CartProvider; // Xuất CartProvider để sử dụng ở nơi khác (thường trong App)