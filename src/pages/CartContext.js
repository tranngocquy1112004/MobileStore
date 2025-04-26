// Import thư viện React và các hook cần thiết: createContext, useState, useEffect, useCallback
import React, { createContext, useState, useEffect, useCallback } from "react";

// --- Constants (Các hằng số) ---
// Định nghĩa một key hằng số để truy cập dữ liệu giỏ hàng trong localStorage của trình duyệt
const LOCAL_STORAGE_CART_KEY = "cart";

// --- Default Value for Context (Giá trị mặc định cho Context) ---
// Định nghĩa cấu trúc và giá trị mặc định cho CartContext.
// Điều này cung cấp một giá trị dự phòng và giúp hỗ trợ tự động hoàn thành/kiểm tra kiểu
// trong các component sử dụng Context này.
const defaultCartContext = {
  cart: [], // Giỏ hàng mặc định là một mảng rỗng
  // Các hàm mặc định (không làm gì cả), chỉ để định hình cấu trúc
  addToCart: () => {},
  removeFromCart: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {},
  clearCart: () => {},
};

// --- Create CartContext (Tạo CartContext) ---
// Tạo đối tượng Context thực tế sử dụng createContext và giá trị mặc định đã định nghĩa.
// Context này sẽ được sử dụng bởi Provider (cung cấp giá trị) và Consumers (sử dụng giá trị).
export const CartContext = createContext(defaultCartContext);

// --- CartProvider Component (Component Cung cấp Giỏ hàng) ---
// Component này sẽ bao bọc các phần của ứng dụng cần truy cập vào trạng thái và các hàm của giỏ hàng.
// Nó quản lý trạng thái giỏ hàng và cung cấp trạng thái đó thông qua CartContext.Provider.
export const CartProvider = ({ children }) => {
  // Biến trạng thái để lưu trữ mảng các sản phẩm hiện có trong giỏ hàng
  const [cart, setCart] = useState([]); // Khởi tạo là một mảng rỗng

  // --- Effect Hook: Load Cart from localStorage on Mount (Tải giỏ hàng từ localStorage khi component mount) ---
  // useEffect này chỉ chạy một lần duy nhất khi component CartProvider được render lần đầu tiên,
  // vì mảng dependency [] của nó là rỗng.
  useEffect(() => {
    // Cố gắng lấy dữ liệu giỏ hàng đã lưu từ localStorage sử dụng key đã định nghĩa
    const savedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);

    // Kiểm tra xem có dữ liệu nào được lấy về hay không
    if (savedCart) {
      try {
        // Cố gắng phân tích chuỗi dữ liệu đã lấy về thành đối tượng/mảng JavaScript
        const parsedCart = JSON.parse(savedCart);

        // Xác thực xem dữ liệu đã phân tích có phải là một mảng hay không
        // (định dạng mong đợi cho giỏ hàng)
        if (Array.isArray(parsedCart)) {
          // Nếu hợp lệ, cập nhật trạng thái (state) của component với dữ liệu giỏ hàng đã tải
          setCart(parsedCart);
        } else {
          // Nếu dữ liệu tồn tại nhưng không phải là mảng, đó là dữ liệu không hợp lệ. Xóa nó đi.
          localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
          console.warn("Dữ liệu giỏ hàng không hợp lệ trong localStorage, đã xóa."); // Ghi log cảnh báo
        }
      } catch (error) {
        // Nếu JSON.parse thất bại (ví dụ: chuỗi lưu trữ không phải là JSON hợp lệ)
        console.error("Lỗi parse dữ liệu giỏ hàng từ localStorage:", error); // Ghi log lỗi chi tiết
        // Xóa dữ liệu bị lỗi khỏi localStorage
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      }
    }
    // Nếu `savedCart` ban đầu là null, effect này đơn giản là không làm gì cả,
    // giữ nguyên trạng thái giỏ hàng là []
  }, []); // Mảng dependency rỗng: chỉ chạy khi mount

  // --- Effect Hook: Save Cart to localStorage on Change (Lưu giỏ hàng vào localStorage khi có thay đổi) ---
  // useEffect này chạy bất cứ khi nào biến trạng thái `cart` thay đổi.
  useEffect(() => {
    // Kiểm tra cơ bản để đảm bảo cart là một mảng trước khi lưu (nó luôn phải là mảng)
    if (Array.isArray(cart)) {
      // Chuyển đổi trạng thái giỏ hàng hiện tại (mảng JavaScript) thành một chuỗi JSON
      // và lưu nó vào localStorage dưới key đã định nghĩa.
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    }
  }, [cart]); // Mảng dependency [cart] có nghĩa là chạy bất cứ khi nào trạng thái `cart` thay đổi

  // --- Cart Manipulation Functions (Các hàm thao tác với giỏ hàng, được ghi nhớ với useCallback) ---
  // useCallback ghi nhớ các hàm này để chúng không bị tạo lại trên mỗi lần render
  // trừ khi các dependency của chúng thay đổi (trong trường hợp này là không có,
  // vì chúng sử dụng dạng cập nhật hàm của setCart).

  // Hàm thêm một sản phẩm vào giỏ hàng hoặc tăng số lượng nếu đã có
  const addToCart = useCallback((product) => {
    // Sử dụng dạng cập nhật hàm của setCart để đảm bảo chúng ta làm việc với trạng thái mới nhất
    setCart((prevCart) => {
      // Tìm chỉ mục (index) của sản phẩm trong giỏ hàng, nếu nó tồn tại
      const index = prevCart.findIndex((item) => item.id === product.id);
      if (index > -1) {
        // Nếu sản phẩm đã tồn tại (tìm thấy index):
        // 1. Tạo một bản sao nông (shallow copy) của mảng giỏ hàng trước đó (đảm bảo tính bất biến)
        const updatedCart = [...prevCart];
        // 2. Tạo một bản sao nông của sản phẩm cần cập nhật và tăng số lượng của nó lên 1
        updatedCart[index] = { ...updatedCart[index], quantity: updatedCart[index].quantity + 1 };
        // 3. Trả về mảng giỏ hàng đã cập nhật
        return updatedCart;
      } else {
        // Nếu sản phẩm chưa tồn tại:
        // 1. Tạo một mảng mới chứa tất cả các sản phẩm trước đó cộng với sản phẩm mới với số lượng là 1 (đảm bảo tính bất biến)
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []); // Mảng dependency rỗng cho useCallback

  // Hàm xóa hoàn toàn một sản phẩm khỏi giỏ hàng dựa trên ID của nó
  const removeFromCart = useCallback((productId) => {
    // Sử dụng dạng cập nhật hàm và filter để tạo một mảng mới
    // loại bỏ sản phẩm có ID trùng khớp
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []); // Mảng dependency rỗng cho useCallback

  // Hàm tăng số lượng của một sản phẩm cụ thể trong giỏ hàng
  const increaseQuantity = useCallback((productId) => {
    // Sử dụng dạng cập nhật hàm và map để tạo một mảng mới
    setCart((prevCart) =>
      prevCart.map((item) =>
        // Nếu ID của sản phẩm trùng khớp với productId mục tiêu:
        item.id === productId
          // Trả về một đối tượng sản phẩm *mới* với số lượng được tăng lên 1 (đảm bảo tính bất biến)
          ? { ...item, quantity: item.quantity + 1 }
          // Ngược lại, trả về sản phẩm không thay đổi
          : item
      )
    );
  }, []); // Mảng dependency rỗng cho useCallback

  // Hàm giảm số lượng của một sản phẩm cụ thể, số lượng tối thiểu là 1
  const decreaseQuantity = useCallback((productId) => {
    // Sử dụng dạng cập nhật hàm và map
    setCart((prevCart) =>
      prevCart.map((item) =>
        // Nếu ID của sản phẩm trùng khớp:
        item.id === productId
          // Trả về một đối tượng sản phẩm *mới* với số lượng giảm đi 1,
          // nhưng không nhỏ hơn 1 (sử dụng Math.max)
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          // Ngược lại, trả về sản phẩm không thay đổi
          : item
      )
    );
  }, []); // Mảng dependency rỗng cho useCallback

  // Hàm xóa tất cả sản phẩm khỏi giỏ hàng
  const clearCart = useCallback(() => {
    // Đặt trạng thái giỏ hàng thành một mảng rỗng
    setCart([]);
  }, []); // Mảng dependency rỗng cho useCallback

  // --- Context Value (Giá trị Context) ---
  // Tạo đối tượng sẽ được truyền làm prop `value` cho Provider.
  // Đối tượng này chứa trạng thái giỏ hàng hiện tại và tất cả các hàm thao tác.
  const cartContextValue = {
    cart, // Mảng trạng thái giỏ hàng hiện tại
    addToCart, // Hàm thêm sản phẩm (đã được ghi nhớ)
    removeFromCart, // Hàm xóa sản phẩm (đã được ghi nhớ)
    increaseQuantity, // Hàm tăng số lượng (đã được ghi nhớ)
     decreaseQuantity, // Hàm giảm số lượng (đã được ghi nhớ)
    clearCart, // Hàm xóa giỏ hàng (đã được ghi nhớ)
  };

  // --- Render Provider (Render Component Provider) ---
  // Render component CartContext.Provider.
  // Nó truyền đối tượng `cartContextValue` xuống cho bất kỳ component con nào
  // sử dụng (consume) Context này.
  // Prop `{children}` cho phép bọc các component khác bên trong provider này.
  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Export component CartProvider làm export mặc định của module này
export default CartProvider;
