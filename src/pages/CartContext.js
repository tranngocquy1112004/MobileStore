// src/context/CartContext.js (Đổi tên file để phản ánh đây là Context)

// Import necessary React hooks:
import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from "react"; // Thêm useMemo
// Import AuthContext to get the logged-in user information.
import { AuthContext } from "../account/AuthContext"; // Giả định AuthContext nằm trong thư mục 'account'

// --- Định nghĩa Hằng số ---
// Tiền tố cho key lưu giỏ hàng trong localStorage (ví dụ: "cart_[username]").
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// --- Định nghĩa Giá trị Context Mặc định ---
// Giá trị này được sử dụng nếu useContext(CartContext) được gọi bên ngoài CartProvider.
const defaultCartContext = {
  cart: [], // Mảng rỗng cho giỏ hàng mặc định
  totalPrice: 0, // Tổng tiền mặc định là 0
  addToCart: () => {}, // Hàm rỗng mặc định
  removeFromCart: () => {}, // Hàm rỗng mặc định
  updateQuantity: () => {}, // Hàm rỗng mặc định
  clearCart: () => {}, // Hàm rỗng mặc định
};

// --- Tạo CartContext ---
// Export context để các component khác có thể sử dụng useContext(CartContext)
export const CartContext = createContext(defaultCartContext);

// --- Component CartProvider ---
// Component này quản lý state và logic của giỏ hàng và cung cấp nó thông qua Context.
export const CartProvider = ({ children }) => {
  // Truy cập AuthContext để lấy thông tin người dùng hiện tại cho giỏ hàng theo người dùng.
  // Sử dụng optional chaining và giá trị mặc định để tránh lỗi nếu AuthContext chưa sẵn sàng
  const { user } = useContext(AuthContext) || { user: null };

  // 'cart' state: Lưu trữ danh sách các sản phẩm trong giỏ hàng. Khởi tạo là mảng rỗng.
  const [cart, setCart] = useState([]);

  // --- Hook Effect để tải giỏ hàng từ localStorage khi component mount hoặc người dùng thay đổi ---
  useEffect(() => {
    // console.log("🛒 CartContext useEffect [user] triggered. Current user:", user ? user.username : "null"); // Dev log

    // Chỉ cố gắng tải giỏ hàng nếu có người dùng đã đăng nhập và có tên đăng nhập.
    if (user && user.username) {
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      // console.log("🛒 Attempting to load cart from key:", userCartKey); // Dev log
      const savedCart = localStorage.getItem(userCartKey);

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Kiểm tra nếu kết quả parse là một mảng hợp lệ
          if (Array.isArray(parsedCart)) {
            // Kiểm tra thêm để đảm bảo các item trong giỏ hàng có cấu trúc cơ bản mong đợi (ví dụ: có id)
            const validCart = parsedCart.filter(item => item && typeof item.id !== 'undefined');
            setCart(validCart);
            console.log(`🛒 Đã tải giỏ hàng (${validCart.length} items) cho người dùng ${user.username} từ localStorage.`);
          } else {
            // Nếu dữ liệu không hợp lệ (JSON hợp lệ nhưng không phải mảng)
            console.warn(`🛒 Dữ liệu giỏ hàng cho người dùng ${user.username} trong localStorage không hợp lệ (không phải mảng), bắt đầu với giỏ hàng rỗng.`);
            setCart([]);
             // Tùy chọn: xóa dữ liệu bị lỗi nếu parse thành công nhưng không phải mảng
             // localStorage.removeItem(userCartKey);
          }
        } catch (error) {
          // Bắt lỗi khi parse JSON (dữ liệu không phải JSON hợp lệ)
          console.error(`🛒 Lỗi khi parse giỏ hàng cho người dùng ${user.username} từ localStorage:`, error);
          setCart([]); // Bắt đầu với giỏ hàng rỗng khi có lỗi
           // Tùy chọn: xóa dữ liệu bị lỗi nếu parse thất bại
           // localStorage.removeItem(userCartKey);
        }
      } else {
        // Nếu không tìm thấy dữ liệu giỏ hàng cho người dùng này
        setCart([]);
        // console.log(`🛒 Không tìm thấy giỏ hàng đã lưu cho người dùng ${user.username}, bắt đầu với giỏ hàng rỗng.`); // Dev log
      }
    } else {
      // Nếu không có người dùng đăng nhập, đặt giỏ hàng về rỗng.
      setCart([]);
      // console.log("🛒 Không có người dùng đăng nhập, đặt giỏ hàng về rỗng."); // Dev log
    }
  }, [user]); // Effect chạy lại khi đối tượng 'user' thay đổi.

  // --- Hook Effect để lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi ---
  useEffect(() => {
    // console.log("🛒 CartContext useEffect [cart, user] triggered. Current cart:", cart, "Current user:", user ? user.username : "null"); // Dev log
    // Chỉ lưu giỏ hàng nếu có người dùng đã đăng nhập và giỏ hàng là một mảng.
    if (user && user.username && Array.isArray(cart)) {
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      // console.log("🛒 Saving cart to key:", userCartKey, "Cart data:", cart); // Dev log
      try {
        localStorage.setItem(userCartKey, JSON.stringify(cart)); // Lưu state 'cart' hiện tại
        // console.log(`🛒 Đã lưu giỏ hàng (${cart.length} items) cho người dùng ${user.username} vào localStorage.`); // Dev log
      } catch (error) {
        console.error(`🛒 Lỗi khi lưu giỏ hàng cho người dùng ${user.username} vào localStorage:`, error);
        // Có thể thêm logic thông báo lỗi cho người dùng ở đây
      }
    }
    // Không cần cleanup function cho việc lưu localStorage
  }, [cart, user]); // Effect chạy lại khi 'cart' hoặc 'user' thay đổi.

  // --- Hàm thêm sản phẩm vào giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const addToCart = useCallback((product) => {
    // console.log("🛒 addToCart called for product:", product); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể thêm vào giỏ hàng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        // Tùy chọn hiển thị thông báo cho người dùng yêu cầu đăng nhập
        return;
    }
     // Kiểm tra cơ bản cho đối tượng sản phẩm hợp lệ (có ít nhất thuộc tính id)
     if (!product || typeof product.id === 'undefined') {
         console.warn("🛒 Không thể thêm vào giỏ hàng: Dữ liệu sản phẩm không hợp lệ.");
         return;
     }

    // Tìm kiếm sản phẩm đã tồn tại trong giỏ hàng
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // Nếu sản phẩm đã tồn tại, tạo mảng mới và tăng số lượng
      const newCart = [...cart];
      // Đảm bảo số lượng là một số trước khi tăng
      newCart[existingItemIndex].quantity = (newCart[existingItemIndex].quantity || 0) + 1;
      setCart(newCart);
    } else {
      // Nếu sản phẩm là mới, thêm nó vào giỏ hàng với số lượng 1
      // Tạo bản sao của product để tránh thay đổi đối tượng gốc
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // console.log("🛒 Đã thêm sản phẩm vào giỏ hàng."); // Dev log
  }, [cart, user]); // Phụ thuộc vào cart và user

  // --- Hàm xóa sản phẩm khỏi giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const removeFromCart = useCallback((productId) => {
    // console.log("🛒 removeFromCart called for product ID:", productId); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể xóa khỏi giỏ hàng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        return;
    }
     // Kiểm tra cơ bản cho ID sản phẩm hợp lệ
     if (typeof productId === 'undefined' || productId === null) {
         console.warn("🛒 Không thể xóa khỏi giỏ hàng: ID sản phẩm không hợp lệ.");
         return;
     }

    // Lọc ra sản phẩm có ID trùng khớp
    setCart(cart.filter((item) => item.id !== productId));
    // console.log(`🛒 Đã xóa sản phẩm có ID ${productId} khỏi giỏ hàng.`); // Dev log
  }, [cart, user]); // Phụ thuộc vào cart và user

  // --- Hàm cập nhật số lượng của một sản phẩm trong giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const updateQuantity = useCallback((productId, quantity) => {
    // console.log(`🛒 updateQuantity called for product ID: ${productId}, quantity: ${quantity}`); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể cập nhật số lượng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        return;
    }
     // Kiểm tra cơ bản cho ID sản phẩm hợp lệ
     if (typeof productId === 'undefined' || productId === null) {
         console.warn("🛒 Không thể cập nhật số lượng: ID sản phẩm không hợp lệ.");
         return;
     }

    // Đảm bảo số lượng mới là một số nguyên không âm
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);

    // Nếu số lượng mới là 0, xóa sản phẩm
    if (newQuantity === 0) {
      removeFromCart(productId); // Sử dụng callback removeFromCart
      return;
    }

    // Map qua giỏ hàng để tìm và cập nhật số lượng
    const newCart = cart.map((item) =>
        // Đảm bảo item và item.id tồn tại trước khi so sánh, và cập nhật số lượng một cách an toàn
      (item && typeof item.id !== 'undefined' && item.id === productId) ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);
    // console.log(`🛒 Đã cập nhật số lượng sản phẩm ID ${productId} thành ${newQuantity}.`); // Dev log
  }, [cart, removeFromCart, user]); // Phụ thuộc vào cart, removeFromCart, và user

  // --- Hàm xóa toàn bộ giỏ hàng ---
  // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
  const clearCart = useCallback(() => {
    // console.log("🛒 clearCart called."); // Dev log
    if (!user || !user.username) {
        console.warn("🛒 Không thể xóa toàn bộ giỏ hàng: Người dùng chưa đăng nhập hoặc không có tên đăng nhập.");
        return;
    }
    setCart([]); // Đặt state giỏ hàng về mảng rỗng
    console.log("🛒 Đã xóa toàn bộ giỏ hàng."); // Giữ lại log quan trọng
    // Effect lưu sẽ tự động lưu giỏ hàng rỗng này cho người dùng
  }, [user]); // Phụ thuộc vào user

  // --- Tính toán tổng tiền của giỏ hàng sử dụng useMemo ---
  // useMemo giúp tính toán lại totalPrice chỉ khi cart thay đổi, tối ưu hiệu suất.
  const totalPrice = useMemo(() => {
      // Đảm bảo cart là mảng trước khi reduce
      return Array.isArray(cart)
        ? cart.reduce(
            // Tính tổng một cách an toàn, xử lý các trường hợp thiếu price/quantity
            (accumulator, item) => accumulator + (item?.price || 0) * (item?.quantity || 0),
            0 // Giá trị khởi tạo
          )
        : 0; // Trả về 0 nếu cart không phải là mảng
  }, [cart]); // Phụ thuộc vào cart

  // --- Đối tượng Giá trị Context ---
  // Gói state và các hàm để chia sẻ thông qua Context.
  const cartContextValue = {
    cart, // Cung cấp state giỏ hàng
    totalPrice, // Cung cấp tổng tiền đã tính
    addToCart, // Cung cấp hàm thêm
    removeFromCart, // Cung cấp hàm xóa
    updateQuantity, // Cung cấp hàm cập nhật số lượng
    clearCart, // Cung cấp hàm xóa toàn bộ giỏ hàng
  };

  return (
    // --- Cung cấp Context ---
    // Bọc các children bằng Provider và truyền giá trị context.
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Export component CartProvider.
export default CartProvider;
