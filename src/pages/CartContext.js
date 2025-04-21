import React, { createContext, useState, useCallback, useEffect } from "react"; // Import các hook cần thiết từ thư viện React: createContext để tạo Context, useState để quản lý trạng thái cục bộ, useCallback để ghi nhớ (memoize) các hàm, và useEffect để thực hiện các tác vụ phụ (side effects)

// --- Định nghĩa hằng số ---

// Khóa sử dụng để lưu trữ dữ liệu giỏ hàng trong localStorage của trình duyệt.
// Việc sử dụng hằng số giúp tránh gõ sai key và dễ dàng quản lý.
const LOCAL_STORAGE_CART_KEY = "cart";

// --- Tạo CartContext ---
// Tạo một Context mới cho giỏ hàng.
// Context này sẽ được sử dụng bởi các component con cần truy cập hoặc thay đổi trạng thái giỏ hàng.
// 'undefined' là giá trị mặc định ban đầu của Context trước khi Provider được render.
export const CartContext = createContext(undefined);

// --- Component CartProvider ---
// Đây là một Component cung cấp (provider) cho CartContext.
// Nó sẽ bao bọc các component con cần truy cập dữ liệu giỏ hàng và các hàm quản lý giỏ hàng,
// đồng thời quản lý state giỏ hàng thực tế và đồng bộ nó với localStorage.
// Prop 'children' đại diện cho các component React khác được đặt bên trong CartProvider khi sử dụng.
export const CartProvider = ({ children }) => {
  // --- State quản lý danh sách sản phẩm trong giỏ hàng ---
  // State 'cart': Là một mảng các đối tượng sản phẩm, mỗi đối tượng bao gồm thông tin sản phẩm
  // và số lượng (quantity) của sản phẩm đó trong giỏ hàng.
  // Giá trị khởi tạo của state được lấy từ localStorage.
  const [cart, setCart] = useState(() => {
    // Sử dụng một hàm (initializer function) cho useState để chỉ đọc từ localStorage một lần
    // khi component được render lần đầu tiên.
    const savedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY); // Cố gắng lấy chuỗi JSON chứa dữ liệu giỏ hàng từ localStorage bằng khóa đã định nghĩa.
    // Kiểm tra xem có dữ liệu được lưu trong localStorage hay không.
    if (savedCart) {
      try {
        // Nếu có dữ liệu, thử phân tích cú pháp chuỗi JSON thành một mảng/đối tượng JavaScript.
        // Trả về kết quả parse làm giá trị khởi tạo cho state 'cart'.
        return JSON.parse(savedCart);
      } catch (error) {
        // Nếu quá trình parse JSON thất bại (ví dụ: dữ liệu trong localStorage bị hỏng)
        console.error("Lỗi khi parse dữ liệu giỏ hàng từ localStorage:", error); // Ghi log lỗi ra console
        // Trả về một mảng rỗng [] làm giá trị khởi tạo state, để ứng dụng không bị lỗi do dữ liệu hỏng.
        // Có thể thêm localStorage.removeItem(LOCAL_STORAGE_CART_KEY); ở đây nếu muốn xóa dữ liệu hỏng.
        return [];
      }
    }
    // Nếu không có dữ liệu lưu trong localStorage (savedCart là null hoặc undefined),
    // trả về một mảng rỗng [] làm giá trị khởi tạo cho state 'cart'.
    return [];
  });

  // --- Effect hook để đồng bộ state 'cart' với localStorage ---
  // Effect này sẽ chạy sau mỗi lần render component HOẶC khi giá trị của các biến trong mảng dependencies ([cart]) thay đổi.
  useEffect(() => {
    // Mỗi khi state 'cart' thay đổi, lưu trạng thái giỏ hàng hiện tại vào localStorage.
    // Sử dụng JSON.stringify để chuyển đổi mảng 'cart' thành chuỗi JSON trước khi lưu vào localStorage.
    localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    // console.log("Giỏ hàng đã được lưu vào localStorage:", cart); // Có thể thêm log để theo dõi
  }, [cart]); // Mảng dependencies: effect này chỉ chạy lại mỗi khi state 'cart' thay đổi.

  // --- Hàm tìm kiếm sản phẩm trong giỏ hàng theo ID ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại khi biến trong dependency array ([cart]) thay đổi.
  // Điều này giúp ngăn các component con sử dụng hàm 'findItem' (nếu có) bị re-render không cần thiết
  // nếu chỉ có component cha CartProvider re-render vì lý do khác.
  const findItem = useCallback(
    (id) => cart.find((item) => item.id === id), // Sử dụng phương thức .find() trên mảng 'cart' để tìm phần tử đầu tiên có item.id trùng khớp với 'id' được truyền vào. Trả về đối tượng item hoặc undefined.
    [cart] // Mảng dependencies: hàm phụ thuộc vào state 'cart'. Khi 'cart' thay đổi, hàm findItem cần được tạo lại để tham chiếu đến mảng 'cart' mới nhất.
  );

  // --- Hàm thêm sản phẩm mới vào giỏ hàng hoặc tăng số lượng nếu sản phẩm đã tồn tại ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này sẽ được tạo lại khi các biến trong dependency array ([findItem]) thay đổi.
  const addToCart = useCallback(
    (product) => {
      // Sử dụng functional update cho hàm setCart (setCart(prev => ...)).
      // Đây là cách an toàn để cập nhật state khi state mới phụ thuộc vào state trước đó ('prev').
      setCart((prev) => {
        const existingItem = findItem(product.id); // Kiểm tra xem sản phẩm với ID của 'product' đã có trong giỏ hàng hiện tại ('prev') hay chưa bằng cách gọi hàm 'findItem'.
        if (existingItem) {
          // Nếu sản phẩm đã tồn tại (existingItem khác undefined):
          // Tạo một mảng mới dựa trên mảng 'prev'. Sử dụng .map() để lặp qua từng item.
          // Nếu item hiện tại có ID trùng khớp với ID của 'product', tạo một đối tượng mới bằng cách sao chép item đó (...item) và TĂNG thuộc tính 'quantity' lên 1.
          // Nếu ID không trùng khớp, giữ nguyên item đó.
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // Nếu sản phẩm chưa có trong giỏ hàng (existingItem là undefined):
          // Tạo một mảng mới bằng cách sao chép tất cả các phần tử từ mảng 'prev' (...prev).
          // Thêm đối tượng 'product' mới vào cuối mảng với thuộc tính 'quantity' khởi tạo là 1.
          return [...prev, { ...product, quantity: 1 }];
        }
      });
    },
    [findItem] // Mảng dependencies: hàm phụ thuộc vào hàm 'findItem'. Vì 'findItem' phụ thuộc vào 'cart', nên indirect dependency ở đây là 'cart'.
  );

  // --- Hàm chung để cập nhật số lượng sản phẩm trong giỏ hàng (tăng hoặc giảm) ---
  // Hàm này nhận vào ID sản phẩm và 'delta' (giá trị thay đổi số lượng, ví dụ: +1 để tăng, -1 để giảm).
  // Sử dụng useCallback để ghi nhớ hàm này. Vì nó không phụ thuộc vào bất kỳ state hay prop nào từ scope ngoài cần theo dõi sự thay đổi, dependency array là rỗng.
  const updateQuantity = useCallback(
    (id, delta) => {
      // Sử dụng functional update cho setCart.
      setCart((prev) =>
        prev
          .map((item) =>
            // Lặp qua mảng 'prev'. Nếu item hiện tại có ID trùng với 'id' được truyền vào:
            item.id === id
              ? { ...item, quantity: item.quantity + delta } // Tạo đối tượng mới với số lượng cập nhật (quantity + delta).
              : item // Nếu không trùng ID, giữ nguyên item đó.
          )
          // Sau khi cập nhật số lượng cho tất cả các item có ID trùng, sử dụng .filter() để tạo mảng mới.
          // Lọc bỏ những item có số lượng (quantity) nhỏ hơn hoặc bằng 0. Điều này giúp xóa sản phẩm khỏi giỏ nếu số lượng giảm xuống 0.
          .filter((item) => item.quantity > 0)
      );
    },
    [] // Mảng dependency rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi.
  );

  // --- Hàm xóa một sản phẩm cụ thể khỏi giỏ hàng dựa trên ID ---
  // Sử dụng useCallback để ghi nhớ hàm này. Dependency array rỗng vì hàm không phụ thuộc vào biến nào từ scope ngoài cần theo dõi.
  const removeFromCart = useCallback(
    (id) => {
      // Sử dụng functional update cho setCart.
      // Sử dụng phương thức .filter() trên mảng 'prev' để tạo một mảng mới chỉ bao gồm các item có ID KHÁC với 'id' được truyền vào.
      // Điều này loại bỏ item có ID trùng khỏi giỏ hàng.
      setCart((prev) => prev.filter((item) => item.id !== id));
    },
    [] // Mảng dependency rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.
  );

  // --- Hàm xóa toàn bộ giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Dependency array rỗng vì hàm chỉ đơn giản là đặt state về mảng rỗng.
  const clearCart = useCallback(() => {
    setCart([]); // Đặt state 'cart' về một mảng rỗng [], xóa hết sản phẩm.
  }, []); // Mảng dependency rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào.

  // --- Đối tượng giá trị Context ---
  // Tạo một đối tượng JavaScript chứa tất cả các state và hàm mà chúng ta muốn cung cấp
  // cho các component con thông qua CartContext.
  // Đối tượng này sẽ là 'value' của component Provider.
  const cartContextValue = {
    cart, // Cung cấp state 'cart' hiện tại
    addToCart, // Cung cấp hàm 'addToCart' (đã memoize)
    // Tạo các hàm tiện ích 'increaseQuantity' và 'decreaseQuantity'.
    // Các hàm này gọi hàm chung 'updateQuantity' với delta tương ứng (+1 hoặc -1).
    increaseQuantity: (id) => updateQuantity(id, 1), // Khi gọi increaseQuantity(id), thực chất là gọi updateQuantity(id, 1)
    decreaseQuantity: (id) => updateQuantity(id, -1), // Khi gọi decreaseQuantity(id), thực chất là gọi updateQuantity(id, -1)
    removeFromCart, // Cung cấp hàm 'removeFromCart' (đã memoize)
    clearCart, // Cung cấp hàm 'clearCart' (đã memoize)
  };

  return (
    // --- Cung cấp Context ---
    // Sử dụng component CartContext.Provider.
    // Tất cả các component con được đặt giữa thẻ mở và thẻ đóng của Provider này
    // sẽ có thể truy cập giá trị được truyền vào thuộc tính 'value' bằng cách sử dụng useContext(CartContext).
    <CartContext.Provider value={cartContextValue}>
      {children}{" "}
      {/* children đại diện cho các component con được render bên trong Provider */}
    </CartContext.Provider>
  );
};

export default CartProvider; // Export component CartProvider làm default export để có thể sử dụng ở các file khác (ví dụ: trong file App.js) để bọc toàn bộ ứng dụng hoặc một phần của ứng dụng cần truy cập giỏ hàng.