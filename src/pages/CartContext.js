// Import các hook cần thiết từ thư viện React:
// createContext: Để tạo Context (một cách để chia sẻ dữ liệu giỏ hàng giữa các component).
// useState: Để quản lý trạng thái cục bộ của giỏ hàng (danh sách sản phẩm trong giỏ).
// useEffect: Để thực hiện các tác vụ phụ (side effects) như đọc/ghi dữ liệu giỏ hàng vào localStorage khi component mount hoặc khi trạng thái giỏ hàng/người dùng thay đổi.
// useCallback: Để ghi nhớ (memoize) các hàm xử lý giỏ hàng (addToCart, removeFromCart, updateQuantity, clearCart), giúp tối ưu hiệu suất.
// useContext: Để truy cập vào các Context khác (AuthContext) nhằm lấy thông tin người dùng hiện tại.
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
// Import AuthContext để lấy thông tin người dùng đang đăng nhập.
import { AuthContext } from "../account/AuthContext"; // Giả định AuthContext nằm trong thư mục 'account'

// --- Định nghĩa hằng số ---

// Tiền tố cho khóa lưu trữ giỏ hàng trong localStorage.
// Tên đầy đủ sẽ là "cart_[username]" để phân biệt giỏ hàng của từng người dùng.
const LOCAL_STORAGE_CART_PREFIX = "cart_";

// --- Định nghĩa giá trị mặc định cho Context ---
// Giá trị này được sử dụng bởi các component con khi chúng gọi useContext(CartContext)
// trong trường hợp Context Provider tương ứng (CartProvider) chưa được render.
const defaultCartContext = {
  cart: [], // Giỏ hàng mặc định là mảng rỗng
  totalPrice: 0, // Tổng tiền mặc định là 0
  addToCart: () => {}, // Hàm rỗng mặc định
  removeFromCart: () => {}, // Hàm rỗng mặc định
  updateQuantity: () => {}, // Hàm rỗng mặc định
  clearCart: () => {}, // Hàm rỗng mặc định
};

// --- Tạo CartContext ---
// Sử dụng hàm createContext() để tạo một Context mới chứa trạng thái giỏ hàng và các hàm quản lý.
export const CartContext = createContext(defaultCartContext);

// --- Component CartProvider ---
// Đây là component Provider cho CartContext, quản lý state giỏ hàng và logic lưu/tải/cập nhật.
export const CartProvider = ({ children }) => {
  // Sử dụng useContext để truy cập AuthContext và lấy thông tin người dùng.
  // Chúng ta cần 'user' để xác định giỏ hàng của ai cần tải/lưu.
  const { user } = useContext(AuthContext) || { user: null }; // Lấy user từ AuthContext, cung cấp giá trị mặc định an toàn

  // State 'cart': Lưu trữ danh sách các sản phẩm trong giỏ hàng hiện tại.
  // Ban đầu là mảng rỗng. Dữ liệu sẽ được tải từ localStorage trong useEffect.
  const [cart, setCart] = useState([]);

  // --- Effect hook để tải giỏ hàng từ localStorage khi component mount hoặc người dùng thay đổi ---
  // Effect này chạy khi component mount VÀ mỗi khi đối tượng 'user' thay đổi (người dùng đăng nhập/đăng xuất).
  useEffect(() => {
    console.log("🛒 CartContext useEffect [user] triggered. Current user:", user ? user.username : "null");
    // Chỉ cố gắng tải giỏ hàng nếu CÓ người dùng đăng nhập.
    if (user && user.username) { // Đảm bảo user tồn tại và có username
      // Tạo khóa lưu trữ giỏ hàng riêng cho người dùng hiện tại.
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`;
      console.log("🛒 Attempting to load cart from key:", userCartKey);
      const savedCart = localStorage.getItem(userCartKey); // Lấy dữ liệu giỏ hàng từ localStorage bằng khóa riêng.

      if (savedCart) {
        try {
          // Parse chuỗi JSON thành mảng sản phẩm.
          const parsedCart = JSON.parse(savedCart);
          // Kiểm tra nếu kết quả parse là một mảng hợp lệ, thì cập nhật state 'cart'.
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
            console.log(`🛒 Đã tải giỏ hàng (${parsedCart.length} items) cho người dùng ${user.username} từ localStorage.`);
          } else {
            // Nếu dữ liệu không hợp lệ, ghi log và bắt đầu với giỏ hàng rỗng.
            console.warn(`🛒 Dữ liệu giỏ hàng cho người dùng ${user.username} trong localStorage không hợp lệ, bắt đầu với giỏ hàng rỗng.`);
            setCart([]);
            // Có thể xóa dữ liệu lỗi nếu muốn: localStorage.removeItem(userCartKey);
        }
        } catch (error) {
          // Bắt lỗi parse JSON.
          console.error(`🛒 Lỗi khi parse giỏ hàng cho người dùng ${user.username} từ localStorage:`, error);
          setCart([]); // Bắt đầu với giỏ hàng rỗng khi có lỗi.
          // Có thể xóa dữ liệu lỗi nếu muốn: localStorage.removeItem(userCartKey);
        }
      } else {
        // Nếu không có dữ liệu giỏ hàng trong localStorage cho người dùng này, bắt đầu với giỏ hàng rỗng.
        setCart([]);
        console.log(`🛒 Không tìm thấy giỏ hàng đã lưu cho người dùng ${user.username}, bắt đầu với giỏ hàng rỗng.`);
      }
    } else {
      // Nếu KHÔNG có người dùng đăng nhập (user là null), đặt giỏ hàng về rỗng.
      // Điều này đảm bảo giỏ hàng trống khi không có ai đăng nhập.
      setCart([]);
      console.log("🛒 Không có người dùng đăng nhập, đặt giỏ hàng về rỗng.");
    }
    // Không cần cleanup cho localStorage trong trường hợp này vì chúng ta muốn giữ dữ liệu.
    // Cleanup sẽ được xử lý trong effect lưu giỏ hàng.
  }, [user]); // Dependency array: effect chạy lại khi đối tượng 'user' thay đổi.

  // --- Effect hook để lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi ---
  // Effect này chạy mỗi khi state 'cart' thay đổi.
  useEffect(() => {
    console.log("🛒 CartContext useEffect [cart, user] triggered. Current cart:", cart, "Current user:", user ? user.username : "null");
    // Chỉ lưu giỏ hàng nếu CÓ người dùng đăng nhập.
    // Điều này ngăn việc lưu giỏ hàng trống hoặc giỏ hàng của người dùng trước đó sau khi đăng xuất.
    if (user && user.username && cart) { // Đảm bảo user tồn tại, có username và cart không null/undefined
      const userCartKey = `${LOCAL_STORAGE_CART_PREFIX}${user.username}`; // Khóa lưu trữ riêng cho người dùng
      console.log("🛒 Saving cart to key:", userCartKey, "Cart data:", cart);
      localStorage.setItem(userCartKey, JSON.stringify(cart)); // Lưu state 'cart' hiện tại vào localStorage (chuyển thành JSON).
      console.log(`🛒 Đã lưu giỏ hàng (${cart.length} items) cho người dùng ${user.username} vào localStorage.`);
    } else if (!user && cart.length > 0) {
        // Trường hợp hiếm gặp: Nếu người dùng đăng xuất nhưng state giỏ hàng vẫn còn dữ liệu.
        // Logic logout trong AuthContext nên xử lý việc đặt user về null, điều này sẽ kích hoạt
        // useEffect [user] để đặt giỏ hàng về rỗng. Tuy nhiên, thêm log ở đây để theo dõi.
        console.warn("🛒 Attempted to save cart when no user is logged in, but cart is not empty. This shouldn't happen if logout clears the cart state correctly.");
    }
    // Cleanup function: Khi component unmount hoặc effect chạy lại, hàm này chạy.
    // In this case, we don't need specific localStorage cleanup in the return function
    // because saving a new state naturally overwrites the old one for the same key.
  }, [cart, user]); // Dependency array: effect chạy lại khi 'cart' hoặc 'user' thay đổi.

  // --- Hàm thêm sản phẩm vào giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm chỉ được tạo lại khi state 'cart' hoặc 'user' thay đổi.
  const addToCart = useCallback((product) => {
    console.log("🛒 addToCart called for product:", product);
    if (!user || !user.username) {
        console.warn("🛒 Cannot add to cart: No user or username is available.");
        // Có thể hiển thị thông báo cho người dùng yêu cầu đăng nhập
        return;
    }
    // Tìm xem sản phẩm đã tồn tại trong giỏ hàng chưa.
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // Nếu sản phẩm đã có trong giỏ: Tạo mảng mới bằng cách sao chép giỏ hàng cũ.
      // Cập nhật số lượng của sản phẩm đó lên 1 đơn vị.
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart); // Cập nhật state 'cart' với mảng mới.
    } else {
      // Nếu sản phẩm chưa có trong giỏ: Tạo một đối tượng sản phẩm mới với số lượng ban đầu là 1.
      // Thêm sản phẩm mới này vào cuối mảng giỏ hàng hiện tại.
      setCart([...cart, { ...product, quantity: 1 }]); // Cập nhật state 'cart' với mảng mới.
    }
    console.log("🛒 Đã thêm sản phẩm vào giỏ hàng.");
  }, [cart, user]); // Added user to dependency array as we check for user inside

  // --- Hàm xóa sản phẩm khỏi giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm chỉ được tạo lại khi state 'cart' hoặc 'user' thay đổi.
  const removeFromCart = useCallback((productId) => {
    console.log("🛒 removeFromCart called for product ID:", productId);
    if (!user || !user.username) {
        console.warn("🛒 Cannot remove from cart: No user or username is available.");
        return;
    }
    // Lọc ra các sản phẩm có ID KHÁC với productId cần xóa.
    // Kết quả là một mảng mới không chứa sản phẩm có ID đó.
    setCart(cart.filter((item) => item.id !== productId)); // Cập nhật state 'cart' với mảng đã lọc.
    console.log(`🛒 Đã xóa sản phẩm có ID ${productId} khỏi giỏ hàng.`);
  }, [cart, user]); // Added user to dependency array

  // --- Hàm cập nhật số lượng sản phẩm trong giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm chỉ được tạo lại khi state 'cart' hoặc 'user' thay đổi.
  const updateQuantity = useCallback((productId, quantity) => {
    console.log(`🛒 updateQuantity called for product ID: ${productId}, quantity: ${quantity}`);
    if (!user || !user.username) {
        console.warn("🛒 Cannot update quantity: No user or username is available.");
        return;
    }
    // Đảm bảo số lượng mới là một số nguyên không âm.
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0); // parseInt có thể trả về NaN, sử dụng || 0 để xử lý.

    // Nếu số lượng mới là 0, gọi hàm xóa sản phẩm.
    if (newQuantity === 0) {
      removeFromCart(productId);
      return; // Dừng hàm sau khi xóa.
    }

    // Tạo mảng mới bằng cách lặp (map) qua giỏ hàng hiện tại.
    // Tìm sản phẩm có ID trùng khớp, cập nhật số lượng của nó.
    // Giữ nguyên các sản phẩm khác.
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart); // Cập nhật state 'cart' với mảng mới.
    console.log(`🛒 Đã cập nhật số lượng sản phẩm ID ${productId} thành ${newQuantity}.`);
  }, [cart, removeFromCart, user]); // Added user to dependency array

  // --- Hàm xóa toàn bộ giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm không phụ thuộc vào state 'cart' để hoạt động.
  const clearCart = useCallback(() => {
    console.log("🛒 clearCart called.");
    if (!user || !user.username) {
        console.warn("🛒 Cannot clear cart: No user or username is available.");
        return;
    }
    setCart([]); // Đặt state 'cart' về mảng rỗng.
    console.log("🛒 Đã xóa toàn bộ giỏ hàng.");
    // Lưu ý: Effect lưu giỏ hàng sẽ tự động chạy sau khi state 'cart' thay đổi thành mảng rỗng,
    // cập nhật localStorage cho người dùng hiện tại.
  }, [user]); // Added user to dependency array

  // --- Tính toán tổng tiền của giỏ hàng ---
  // Sử dụng phương thức .reduce() trên mảng 'cart' để tính tổng tiền.
  // reduce nhận hai tham số: hàm callback và giá trị khởi tạo (ở đây là 0).
  // Hàm callback nhận accumulator (biến tích lũy, ban đầu là 0) và item hiện tại.
  // Nó trả về accumulator + item.price * item.quantity.
  const totalPrice = cart.reduce(
    (accumulator, item) => accumulator + item.price * item.quantity,
    0 // Giá trị khởi tạo của accumulator
  );

  // --- Đối tượng giá trị Context ---
  // Tạo một đối tượng chứa tất cả các state và hàm mà chúng ta muốn chia sẻ
  // với các component con thông qua CartContext.
  const cartContextValue = {
    cart, // Cung cấp state giỏ hàng hiện tại
    totalPrice, // Cung cấp tổng tiền đã tính toán
    addToCart, // Cung cấp hàm thêm sản phẩm (đã memoize)
    removeFromCart, // Cung cấp hàm xóa sản phẩm (đã memoize)
    updateQuantity, // Cung cấp hàm cập nhật số lượng (đã memoize)
    clearCart, // Cung cấp hàm xóa toàn bộ giỏ hàng (đã memoize)
  };

  return (
    // --- Cung cấp Context ---
    // Sử dụng component Provider của CartContext để "bao bọc" các component con.
    // Thuộc tính 'value' của Provider nhận đối tượng 'cartContextValue'.
    // Bất kỳ component nào nằm trong Provider này và sử dụng hook useContext(CartContext)
    // đều có thể truy cập các giá trị và hàm được định nghĩa trong 'cartContextValue'.
    <CartContext.Provider value={cartContextValue}>
      {children}{" "}
      {/* children đại diện cho các component React khác được đặt giữa thẻ mở và thẻ đóng của CartProvider. Provider sẽ cung cấp Context cho toàn bộ cây con này. */}
    </CartContext.Provider>
  );
};

// Export component CartProvider làm default export.
// Điều này cho phép component này có thể được import và sử dụng dễ dàng ở các file khác
// (ví dụ: trong file App.js) để bọc toàn bộ ứng dụng hoặc một phần của ứng dụng cần truy cập giỏ hàng.
export default CartProvider;
