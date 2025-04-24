import React, { createContext, useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: createContext để tạo Context, useState để quản lý trạng thái giỏ hàng, useEffect để thực hiện các tác vụ phụ như đọc giỏ hàng từ localStorage khi component mount, và useCallback để ghi nhớ các hàm xử lý giỏ hàng nhằm tối ưu hiệu suất

// --- Định nghĩa hằng số ---

// Key sử dụng để lưu trữ dữ liệu giỏ hàng trong localStorage
const LOCAL_STORAGE_CART_KEY = "cart";

// --- Định nghĩa giá trị mặc định cho Context ---
// Giá trị này được sử dụng khi một component sử dụng Context
// mà không có Provider tương ứng ở cây component phía trên.
const defaultCartContext = {
  cart: [], // Giỏ hàng mặc định ban đầu là mảng rỗng
  addToCart: () => {}, // Hàm thêm vào giỏ hàng mặc định là hàm rỗng
  removeFromCart: () => {}, // Hàm xóa khỏi giỏ hàng mặc định là hàm rỗng
  increaseQuantity: () => {}, // Hàm tăng số lượng mặc định là hàm rỗng
  decreaseQuantity: () => {}, // Hàm giảm số lượng mặc định là hàm rỗng
  clearCart: () => {}, // Hàm xóa toàn bộ giỏ hàng mặc định là hàm rỗng
};

// --- Tạo CartContext ---
// Sử dụng hàm createContext() của React để tạo một Context mới cho giỏ hàng.
export const CartContext = createContext(defaultCartContext);

// --- Component CartProvider ---
// Đây là component Provider cho CartContext. Nó quản lý state giỏ hàng thực tế
// và cung cấp state cùng các hàm xử lý giỏ hàng cho các component con.
export const CartProvider = ({ children }) => {
  // --- State quản lý giỏ hàng ---
  // State 'cart': Mảng chứa các đối tượng sản phẩm trong giỏ hàng. Ban đầu là mảng rỗng.
  const [cart, setCart] = useState([]);

  // --- Effect hook để tải dữ liệu giỏ hàng từ localStorage khi component mount ---
  // Effect này chạy một lần duy nhất sau lần render đầu tiên.
  useEffect(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY); // Cố gắng lấy chuỗi JSON giỏ hàng từ localStorage
    // Kiểm tra xem có dữ liệu được lưu trong localStorage hay không
    if (savedCart) {
      try {
        // Nếu có, thử parse chuỗi JSON thành mảng. Nếu parse thành công và kết quả là mảng, cập nhật state cart.
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
          console.log("Đã khôi phục giỏ hàng từ localStorage."); // Ghi log để theo dõi
        } else {
          // Nếu dữ liệu trong localStorage không phải là mảng sau khi parse
          localStorage.removeItem(LOCAL_STORAGE_CART_KEY); // Xóa dữ liệu lỗi
          console.warn("Dữ liệu giỏ hàng trong localStorage không hợp lệ, đã xóa.");
        }
      } catch (error) {
        // Nếu quá trình parse JSON thất bại (dữ liệu bị hỏng)
        console.error("Lỗi khi parse dữ liệu giỏ hàng từ localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY); // Xóa dữ liệu lỗi
      }
    }
  }, []); // Dependency array rỗng []: Chỉ chạy một lần khi component mount.

  // --- Effect hook để lưu dữ liệu giỏ hàng vào localStorage mỗi khi state 'cart' thay đổi ---
  // Effect này chạy mỗi khi state 'cart' thay đổi.
  useEffect(() => {
    // Kiểm tra để đảm bảo 'cart' là mảng trước khi lưu.
    if (Array.isArray(cart)) {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart)); // Lưu state 'cart' hiện tại vào localStorage sau khi chuyển thành chuỗi JSON
      console.log("Đã lưu giỏ hàng vào localStorage."); // Ghi log để theo dõi
    }
  }, [cart]); // Dependency array: effect chạy lại mỗi khi state 'cart' thay đổi.

  // --- Hàm xử lý thêm sản phẩm vào giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm chỉ được tạo lại khi state 'cart' thay đổi.
  const addToCart = useCallback((product) => {
    // Tìm xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // Nếu sản phẩm đã tồn tại, tạo mảng mới và tăng số lượng của sản phẩm đó
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart); // Cập nhật state cart
    } else {
      // Nếu sản phẩm chưa tồn tại, tạo mảng mới và thêm sản phẩm với số lượng là 1
      setCart([...cart, { ...product, quantity: 1 }]); // Thêm sản phẩm mới vào giỏ với quantity = 1
    }
  }, [cart]); // Dependency: hàm phụ thuộc vào state 'cart'.

  // --- Hàm xử lý xóa sản phẩm khỏi giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm chỉ được tạo lại khi state 'cart' thay đổi.
  const removeFromCart = useCallback((productId) => {
    // Tạo mảng mới bằng cách lọc ra các sản phẩm có ID khác với productId cần xóa
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart); // Cập nhật state cart
  }, [cart]); // Dependency: hàm phụ thuộc vào state 'cart'.

  // --- Hàm xử lý tăng số lượng sản phẩm trong giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm chỉ được tạo lại khi state 'cart' thay đổi.
  const increaseQuantity = useCallback((productId) => {
    // Tìm sản phẩm cần tăng số lượng
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item // Nếu ID khớp, tạo bản sao và tăng quantity lên 1
    );
    setCart(updatedCart); // Cập nhật state cart
  }, [cart]); // Dependency: hàm phụ thuộc vào state 'cart'.

  // --- Hàm xử lý giảm số lượng sản phẩm trong giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm chỉ được tạo lại khi state 'cart' thay đổi.
  const decreaseQuantity = useCallback((productId) => {
    // Tìm sản phẩm cần giảm số lượng
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item // Nếu ID khớp, tạo bản sao và giảm quantity xuống 1, đảm bảo quantity không nhỏ hơn 1
    );
    setCart(updatedCart); // Cập nhật state cart
  }, [cart]); // Dependency: hàm phụ thuộc vào state 'cart'.

  // --- Hàm xử lý xóa toàn bộ giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm. Hàm không phụ thuộc vào state 'cart' hay biến nào khác.
  const clearCart = useCallback(() => {
    setCart([]); // Đặt state cart về mảng rỗng
  }, []); // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.


  // --- Đối tượng giá trị Context ---
  // Tạo một đối tượng chứa tất cả các state và hàm mà chúng ta muốn chia sẻ qua Context.
  const cartContextValue = {
    cart, // Cung cấp state giỏ hàng hiện tại
    addToCart, // Cung cấp hàm thêm vào giỏ hàng
    removeFromCart, // Cung cấp hàm xóa khỏi giỏ hàng
    increaseQuantity, // Cung cấp hàm tăng số lượng
    decreaseQuantity, // Cung cấp hàm giảm số lượng
    clearCart, // Cung cấp hàm xóa toàn bộ giỏ hàng
  };

  return (
    // --- Cung cấp Context ---
    // Sử dụng component Provider của CartContext để bọc các component con.
    // Tất cả component nằm trong Provider này có thể truy cập cartContextValue.
    <CartContext.Provider value={cartContextValue}>
      {children}{" "}
      {/* children đại diện cho các component React khác được đặt giữa thẻ mở và thẻ đóng của CartProvider */}
    </CartContext.Provider>
  );
};

// Export CartContext và CartProvider
export default CartProvider; // Export CartProvider làm default export
