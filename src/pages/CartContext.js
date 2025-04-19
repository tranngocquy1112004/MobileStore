import React, { createContext, useState, useCallback, useEffect } from "react"; // Import các hook cần thiết từ React: createContext để tạo Context, useState để quản lý state, useCallback để memoize hàm, useEffect để thực hiện side effect

// --- Định nghĩa hằng số ---

// Định nghĩa key dùng cho localStorage để lưu trữ giỏ hàng
const LOCAL_STORAGE_CART_KEY = "cart";

// --- Tạo CartContext ---
// Tạo một Context mới cho giỏ hàng. Undefined là giá trị mặc định ban đầu.
// Context này sẽ được sử dụng bởi các component con để truy cập trạng thái giỏ hàng và các hàm quản lý nó.
export const CartContext = createContext(undefined);

// --- Component CartProvider ---
// Đây là một component cung cấp (provider) Context.
// Nó bọc các component con và cung cấp giá trị của CartContext xuống cây component bên dưới.
// Prop 'children' đại diện cho các component con được bọc bởi CartProvider.
export const CartProvider = ({ children }) => {
  // --- State quản lý danh sách sản phẩm trong giỏ hàng ---
  // State 'cart': Là một mảng các đối tượng sản phẩm, mỗi đối tượng bao gồm thông tin sản phẩm
  // và số lượng (quantity) trong giỏ hàng.
  // Giá trị khởi tạo state được lấy từ localStorage.
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY); // Thử lấy dữ liệu giỏ hàng từ localStorage dựa trên key đã định nghĩa
    // Nếu có dữ liệu được lưu (savedCart khác null/undefined), thì parse chuỗi JSON và trả về làm giá trị khởi tạo.
    // Nếu không có dữ liệu lưu, trả về một mảng rỗng [] làm giỏ hàng ban đầu.
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Lỗi khi parse dữ liệu giỏ hàng từ localStorage:", error);
      return []; // Trả về mảng rỗng nếu dữ liệu trong localStorage bị lỗi
    }
  });

  // --- Effect hook để đồng bộ state 'cart' với localStorage ---
  // Effect này chạy mỗi khi state 'cart' thay đổi.
  useEffect(() => {
    // Lưu state 'cart' vào localStorage.
    // Sử dụng JSON.stringify để chuyển đổi mảng 'cart' thành chuỗi JSON trước khi lưu.
    localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
  }, [cart]); // Dependency array: effect này sẽ chạy lại mỗi khi biến 'cart' thay đổi.

  // --- Hàm tìm kiếm sản phẩm trong giỏ hàng theo ID ---
  // Sử dụng useCallback để memoize hàm. Hàm này chỉ được tạo lại khi 'cart' thay đổi.
  // Điều này giúp các component con sử dụng hàm này không bị re-render không cần thiết.
  const findItem = useCallback(
    (id) => cart.find((item) => item.id === id), // Tìm phần tử đầu tiên trong mảng 'cart' có item.id trùng với id được truyền vào.
    [cart] // Dependency array: hàm này phụ thuộc vào state 'cart'.
  );

  // --- Hàm thêm sản phẩm mới vào giỏ hàng hoặc tăng số lượng nếu sản phẩm đã tồn tại ---
  // Sử dụng useCallback để memoize hàm.
  const addToCart = useCallback(
    (product) => {
      // Sử dụng functional update cho setCart để đảm bảo cập nhật state dựa trên giá trị state trước đó ('prev').
      setCart((prev) => {
        const existingItem = findItem(product.id); // Kiểm tra xem sản phẩm đã có trong giỏ chưa bằng hàm findItem.
        if (existingItem) {
          // Nếu sản phẩm đã tồn tại (existingItem khác undefined):
          // Map qua mảng 'prev', tìm sản phẩm có ID trùng.
          // Với sản phẩm trùng, tạo một object mới sao chép thuộc tính cũ và tăng quantity lên 1.
          // Với các sản phẩm khác, giữ nguyên item đó.
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // Nếu sản phẩm chưa có trong giỏ (existingItem là undefined):
          // Tạo một mảng mới bằng cách sao chép tất cả các phần tử từ mảng 'prev'.
          // Thêm sản phẩm mới vào cuối mảng với quantity ban đầu là 1.
          return [...prev, { ...product, quantity: 1 }];
        }
      });
    },
    [findItem] // Dependency array: hàm này phụ thuộc vào hàm findItem.
  );

  // --- Hàm chung để cập nhật số lượng sản phẩm trong giỏ hàng (tăng hoặc giảm) ---
  // Sử dụng useCallback để memoize hàm.
  const updateQuantity = useCallback(
    (id, delta) => {
      // delta là giá trị thay đổi số lượng (ví dụ: +1 để tăng, -1 để giảm).
      setCart((prev) =>
        prev
          .map((item) =>
            // Map qua mảng 'prev'. Tìm sản phẩm có ID trùng.
            item.id === id
              ? { ...item, quantity: item.quantity + delta } // Nếu tìm thấy, tạo object mới với quantity đã cập nhật.
              : item // Nếu không trùng ID, giữ nguyên item đó.
          )
          // Sau khi cập nhật số lượng, lọc bỏ những sản phẩm có quantity nhỏ hơn hoặc bằng 0.
          .filter((item) => item.quantity > 0)
      );
    },
    [] // Dependency array rỗng []: Hàm này không phụ thuộc vào bất kỳ biến nào từ scope bên ngoài cần theo dõi.
  );

  // --- Hàm xóa một sản phẩm cụ thể khỏi giỏ hàng ---
  // Sử dụng useCallback để memoize hàm.
  const removeFromCart = useCallback(
    (id) => {
      // Sử dụng functional update cho setCart.
      // Lọc ra một mảng mới chỉ bao gồm các sản phẩm có ID KHÁC với id được truyền vào.
      setCart((prev) => prev.filter((item) => item.id !== id));
    },
    [] // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.
  );

  // --- Hàm xóa toàn bộ giỏ hàng ---
  // Sử dụng useCallback để memoize hàm.
  const clearCart = useCallback(() => {
    setCart([]); // Đặt state 'cart' về mảng rỗng.
  }, []); // Dependency array rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.

  // --- Đối tượng giá trị Context ---
  // Tạo một object chứa tất cả các state và hàm mà chúng ta muốn cung cấp thông qua Context.
  const cartContextValue = {
    cart, // Cung cấp state giỏ hàng hiện tại
    addToCart, // Cung cấp hàm thêm sản phẩm
    // Tạo các hàm tiện ích increaseQuantity và decreaseQuantity gọi hàm updateQuantity chung với delta tương ứng.
    increaseQuantity: (id) => updateQuantity(id, 1),
    decreaseQuantity: (id) => updateQuantity(id, -1),
    removeFromCart, // Cung cấp hàm xóa sản phẩm
    clearCart, // Cung cấp hàm xóa toàn bộ giỏ hàng
  };

  return (
    // --- Cung cấp Context ---
    // Sử dụng CartContext.Provider. Thuộc tính 'value' nhận đối tượng chứa các giá trị
    // mà các component con sử dụng useContext(CartContext) có thể truy cập.
    <CartContext.Provider value={cartContextValue}>
      {children}{" "}
      {/* children đại diện cho các component được bọc bên trong CartProvider và có thể sử dụng Context. */}
    </CartContext.Provider>
  );
};

export default CartProvider; // Export CartProvider làm default export để sử dụng trong file App.js (hoặc tương tự) để bọc ứng dụng.