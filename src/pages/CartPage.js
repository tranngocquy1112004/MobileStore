import React, { useContext, useState, useEffect, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useContext để truy cập Context API, useState để quản lý trạng thái cục bộ, useEffect để thực hiện các tác vụ phụ (side effects), và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện nhằm tối ưu hiệu suất
import { Link, useNavigate } from "react-router-dom"; // Import các thành phần từ react-router-dom: Link để tạo các liên kết điều hướng SPA, và useNavigate để thực hiện điều hướng trang bằng code JavaScript
import { CartContext } from "./CartContext"; // Import CartContext từ cùng thư mục. Context này chứa trạng thái giỏ hàng (cart) và các hàm để quản lý giỏ hàng (addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart)
import { AuthContext } from "../account/AuthContext"; // Import AuthContext từ đường dẫn tương đối. Context này chứa trạng thái xác thực của người dùng (isLoggedIn)
import CheckoutModal from "../components/CheckoutModal"; // Import component Modal tùy chỉnh để hiển thị form thanh toán và nhập thông tin giao hàng
import "./CartPage.css"; // Import file CSS tùy chỉnh để định dạng giao diện cho component CartPage này

// --- Định nghĩa hằng số ---

// Object chứa các chuỗi thông báo sẽ hiển thị cho người dùng, giúp dễ dàng quản lý nội dung thông báo
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống", // Thông báo hiển thị khi giỏ hàng không có sản phẩm nào
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Thông báo hiển thị khi quá trình đặt hàng hoàn tất thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo yêu cầu người dùng phải đăng nhập trước khi thực hiện thanh toán
};

// Định nghĩa key dùng cho localStorage để lưu trữ danh sách các đơn hàng đã đặt.
// Việc sử dụng hằng số giúp tránh gõ sai key và dễ dàng quản lý. Key này nên nhất quán với OrderHistory.
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- Component con: CartItem (Hiển thị thông tin chi tiết một sản phẩm trong giỏ hàng) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering của component con này.
// Component chỉ render lại khi props của nó thay đổi (item, onIncrease, onDecrease, onRemove).
const CartItem = React.memo(({ item, onIncrease, onDecrease, onRemove }) => {
  // Xác định xem nút giảm số lượng có nên bị vô hiệu hóa hay không.
  // Nút này sẽ bị vô hiệu hóa nếu số lượng sản phẩm hiện tại trong giỏ là 1.
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item"> {/* Container chính cho một sản phẩm riêng lẻ trong danh sách giỏ hàng */}
      {/* Hình ảnh sản phẩm */}
      <img
        src={item.image} // Đường dẫn ảnh sản phẩm
        alt={item.name} // Alt text cho ảnh, sử dụng tên sản phẩm để hỗ trợ khả năng tiếp cận
        className="cart-image" // Class CSS để định dạng ảnh trong giỏ hàng
        loading="lazy" // Sử dụng thuộc tính loading="lazy" để trình duyệt chỉ tải ảnh khi nó gần hiển thị trên viewport, cải thiện hiệu suất tải trang ban đầu
      />
      {/* Phần chi tiết thông tin sản phẩm (tên, giá, điều khiển số lượng) */}
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Hiển thị tên sản phẩm */}
        <p className="cart-price">
          💰 {item.price.toLocaleString("vi-VN")} VNĐ{" "} {/* Hiển thị giá sản phẩm, định dạng theo tiền tệ Việt Nam */}
        </p>
        {/* Điều khiển tăng/giảm số lượng sản phẩm */}
        <div className="quantity-controls"> {/* Container cho các nút điều khiển số lượng */}
          {/* Nút giảm số lượng */}
          <button
            onClick={() => onDecrease(item.id)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onDecrease' (được truyền từ component cha thông qua props) với ID của sản phẩm hiện tại.
            disabled={isDecreaseDisabled} // Vô hiệu hóa nút nếu biến 'isDecreaseDisabled' là true.
            className={isDecreaseDisabled ? "disabled" : ""} // Thêm class CSS 'disabled' vào nút khi nó bị vô hiệu hóa để thay đổi giao diện.
            aria-label={`Giảm số lượng ${item.name}`} // Thuộc tính hỗ trợ khả năng tiếp cận cho người dùng sử dụng trình đọc màn hình.
          >
            - {/* Nội dung hiển thị trên nút giảm */}
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng hiện tại của sản phẩm trong giỏ */}
          {/* Nút tăng số lượng */}
          <button
            onClick={() => onIncrease(item.id)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onIncrease' (được truyền từ component cha thông qua props) với ID của sản phẩm hiện tại.
            aria-label={`Tăng số lượng ${item.name}`} // Thuộc tính hỗ trợ khả năng tiếp cận
          >
            + {/* Nội dung hiển thị trên nút tăng */}
          </button>
        </div>
      </div>
      {/* Nút xóa sản phẩm khỏi giỏ hàng */}
      <button
        className="remove-button" // Class CSS để định dạng nút xóa
        onClick={() => onRemove(item.id)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onRemove' (được truyền từ component cha thông qua props) với ID của sản phẩm hiện tại.
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`} // Thuộc tính hỗ trợ khả năng tiếp cận
      >
        Xóa {/* Nội dung hiển thị trên nút xóa */}
      </button>
    </li>
  );
}); // Kết thúc React.memo() cho component CartItem

// --- Component con: CartSummary (Hiển thị tóm tắt giỏ hàng và nút thanh toán) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering.
// Component chỉ render lại khi props của nó thay đổi (totalPrice, onCheckout).
const CartSummary = React.memo(({ totalPrice, onCheckout }) => (
  <div className="cart-summary"> {/* Container cho phần tóm tắt giỏ hàng */}
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ{" "} {/* Hiển thị tổng tiền của giỏ hàng, định dạng tiền tệ Việt Nam */}
      {/* Hàm toLocaleString("vi-VN") giúp định dạng số thành chuỗi tiền tệ theo quy ước của Việt Nam */}
    </h3>
    {/* Nút "Mua hàng" để bắt đầu quá trình thanh toán */}
    <button className="checkout-button" onClick={onCheckout}> {/* Gắn hàm 'onCheckout' (truyền qua props) vào sự kiện click nút */}
      🛍 Mua hàng {/* Nội dung hiển thị trên nút */}
    </button>
  </div>
)); // Kết thúc React.memo() cho component CartSummary

// --- Component con: EmptyCart (Hiển thị thông báo khi giỏ hàng rỗng) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering.
// Component này không nhận props, nên nó chỉ render lại khi component cha render và gửi cùng props (không thay đổi).
const EmptyCart = React.memo(() => (
  <div className="empty-cart-message-container"> {/* Container cho thông báo giỏ hàng trống */}
    {/* Có thể thêm icon hoặc hình ảnh minh họa giỏ hàng trống tại đây */}
    <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>{" "} {/* Hiển thị thông báo "Giỏ hàng trống" từ hằng số MESSAGES */}
    {/* Liên kết (Link) mời người dùng quay lại trang mua sắm (danh sách sản phẩm) */}
    <Link to="/products" className="shop-now-link"> {/* 'to="/products"' chỉ định route cần điều hướng đến */}
      🛒 Tiếp tục mua sắm {/* Nội dung hiển thị trên liên kết */}
    </Link>
  </div>
)); // Kết thúc React.memo() cho component EmptyCart


// --- Component chính: CartPage (Trang hiển thị giỏ hàng) ---
// Đây là functional component hiển thị toàn bộ nội dung của trang giỏ hàng.
const CartPage = () => {
  const navigate = useNavigate(); // Sử dụng hook useNavigate để thực hiện điều hướng trang bằng code.

  // Sử dụng hook useContext để truy cập vào CartContext và lấy ra các giá trị và hàm cần thiết:
  // - cart: Mảng chứa danh sách các sản phẩm trong giỏ hàng hiện tại.
  // - removeFromCart: Hàm xóa một sản phẩm khỏi giỏ.
  // - increaseQuantity: Hàm tăng số lượng sản phẩm.
  // - decreaseQuantity: Hàm giảm số lượng sản phẩm.
  // - clearCart: Hàm xóa toàn bộ giỏ hàng.
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);

  // Sử dụng hook useContext để truy cập vào AuthContext và lấy ra trạng thái 'isLoggedIn'.
  // Cung cấp giá trị mặc định `{ isLoggedIn: false }` để đảm bảo ứng dụng không gặp lỗi nếu AuthContext chưa được cung cấp đầy đủ hoặc thuộc tính isLoggedIn không tồn tại.
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };

  // --- State quản lý trạng thái hiển thị của Component CartPage ---
  // State 'showModal': Boolean kiểm soát việc Modal thanh toán có đang hiển thị hay không. Ban đầu là false (ẩn).
  const [showModal, setShowModal] = useState(false);
  // State 'isLoading': Boolean quản lý trạng thái loading. Được sử dụng ở đây để giả lập thời gian tải trang giỏ hàng ban đầu. Ban đầu là true.
  const [isLoading, setIsLoading] = useState(true);

  // --- Effect hook để giả lập thời gian tải dữ liệu khi component mount ---
  // Effect này sẽ chạy MỘT LẦN duy nhất sau lần render đầu tiên của component (tương tự componentDidMount).
  useEffect(() => {
    // Tạo một hẹn giờ (setTimeout) để sau 1000ms (1 giây), hàm callback bên trong sẽ được thực thi.
    // Hàm callback này chỉ đơn giản là cập nhật state 'isLoading' thành false.
    // Trong một ứng dụng thực tế, effect này sẽ là nơi bạn fetch dữ liệu giỏ hàng từ một API nếu dữ liệu đó không được quản lý bởi Context hoặc cần được tải lại khi vào trang.
    const timer = setTimeout(() => setIsLoading(false), 1000); // 1000ms = 1 giây

    // Hàm cleanup cho effect này. Hàm này sẽ chạy khi component bị hủy bỏ (unmount)
    // hoặc khi effect chuẩn bị chạy lại (trong trường hợp dependencies thay đổi, nhưng ở đây dependency array là rỗng).
    // Cleanup function sẽ xóa bỏ hẹn giờ đã tạo, ngăn nó chạy và cập nhật state sau khi component đã unmount.
    return () => clearTimeout(timer);
  }, []); // Mảng dependencies rỗng []: đảm bảo effect chỉ chạy một lần duy nhất khi component được mount lần đầu.

  // --- Tính toán các giá trị dẫn xuất từ state 'cart' ---
  // Sử dụng phương thức .reduce() để tính tổng giá trị của tất cả sản phẩm trong giỏ hàng.
  // Lặp qua mảng 'cart', cộng dồn (sum) giá trị của mỗi item (item.price * item.quantity).
  // Giá trị khởi tạo ban đầu cho 'sum' là 0.
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, // Hàm callback thực hiện tính tổng
    0 // Giá trị khởi tạo ban đầu
  );
  // Sử dụng phương thức .reduce() để tính tổng số lượng của tất cả sản phẩm trong giỏ hàng.
  // Lặp qua mảng 'cart', cộng dồn (sum) số lượng của mỗi item (item.quantity).
  // Giá trị khởi tạo ban đầu cho 'sum' là 0.
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity, // Hàm callback
    0 // Giá trị khởi tạo ban đầu
  );

  // --- Hàm xử lý khi người dùng nhấn nút "Mua hàng" ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm chỉ được tạo lại khi các dependencies thay đổi.
  // Dependencies ở đây là 'isLoggedIn' (từ AuthContext) và 'navigate' (từ hook useNavigate).
  const handleCheckout = useCallback(() => {
    // 1. Kiểm tra trạng thái đăng nhập của người dùng.
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // Nếu chưa đăng nhập, hiển thị một hộp thoại thông báo yêu cầu đăng nhập.
      navigate("/"); // Điều hướng người dùng đến trang gốc (thường là trang đăng nhập/đăng ký hoặc trang chủ). Bạn có thể thay đổi route này nếu cần.
      return; // Dừng hàm, không tiếp tục xử lý thanh toán nếu chưa đăng nhập.
    }
    // 2. Nếu người dùng đã đăng nhập, hiển thị modal thanh toán.
    setShowModal(true); // Cập nhật state 'showModal' thành true để hiển thị component CheckoutModal.
  }, [isLoggedIn, navigate]); // Mảng dependencies: hàm phụ thuộc vào trạng thái đăng nhập và hàm điều hướng.

  // --- Hàm xử lý khi người dùng xác nhận thanh toán trong modal ---
  // Hàm này nhận đối tượng 'shippingInfo' (thông tin giao hàng người dùng đã nhập trong modal) làm tham số.
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm sẽ được tạo lại khi các dependencies thay đổi.
  // Dependencies bao gồm: 'cart', 'totalPrice' (để tạo đối tượng đơn hàng), 'clearCart' (để xóa giỏ sau khi đặt), và 'navigate' (để chuyển hướng).
  const handleConfirmCheckout = useCallback((shippingInfo) => {
    // 1. Tạo một đối tượng biểu diễn đơn hàng mới.
    const order = {
      id: Date.now(), // Tạo một ID duy nhất cho đơn hàng bằng cách sử dụng timestamp hiện tại (milliseconds từ Epoch). Đây là một cách đơn giản cho demo.
      items: cart, // Lưu danh sách các sản phẩm hiện có trong giỏ hàng vào thuộc tính 'items' của đơn hàng.
      totalPrice, // Lưu tổng giá trị của giỏ hàng vào thuộc tính 'totalPrice'.
      shippingInfo, // Lưu thông tin giao hàng nhận được từ modal vào thuộc tính 'shippingInfo'.
      date: new Date().toISOString(), // Lưu lại thời điểm đặt hàng dưới dạng chuỗi định dạng ISO 8601.
    };

    // 2. Lưu đơn hàng mới vào localStorage. (Đây là phương pháp demo đơn giản, không an toàn và không bền vững cho ứng dụng thực tế).
    // Lấy danh sách các đơn hàng đã lưu trước đó từ localStorage. Sử dụng key đã định nghĩa.
    // Nếu chưa có dữ liệu (localStorage.getItem trả về null), mặc định là mảng rỗng [].
    // Sử dụng try-catch để xử lý lỗi parse JSON nếu dữ liệu trong localStorage bị hỏng.
     let existingOrders = [];
     try {
        existingOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || [];
     } catch (error) {
        console.error("Lỗi khi đọc danh sách đơn hàng từ localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY); // Xóa dữ liệu lỗi
        existingOrders = []; // Đặt lại danh sách đơn hàng là rỗng
     }


    // Tạo một mảng mới bằng cách sao chép các đơn hàng hiện có (...existingOrders) và thêm đơn hàng mới vào cuối.
    const updatedOrders = [...existingOrders, order];
    // Lưu mảng đơn hàng đã cập nhật trở lại vào localStorage (chuyển thành chuỗi JSON trước khi lưu).
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

    // 3. Cập nhật UI và điều hướng sau khi đặt hàng thành công.
    alert(MESSAGES.CHECKOUT_SUCCESS); // Hiển thị một hộp thoại thông báo thành công.
    clearCart(); // Gọi hàm 'clearCart' từ CartContext để xóa toàn bộ sản phẩm khỏi giỏ hàng sau khi đã đặt.
    setShowModal(false); // Ẩn Modal thanh toán bằng cách đặt state 'showModal' về false.
    navigate("/orders"); // Điều hướng người dùng đến trang lịch sử đơn hàng để họ xem đơn hàng vừa đặt.
  }, [cart, totalPrice, clearCart, navigate]); // Mảng dependencies: hàm phụ thuộc vào 'cart' và 'totalPrice' (để tạo đơn hàng), hàm 'clearCart' (để xóa giỏ), và hàm 'navigate' (để điều hướng).

  // --- Hàm xử lý khi người dùng hủy bỏ modal thanh toán ---
  // Sử dụng useCallback để ghi nhớ hàm này. Dependency array rỗng vì hàm chỉ thay đổi state cục bộ 'showModal' dựa trên giá trị cố định.
  const handleCancelCheckout = useCallback(() => {
    setShowModal(false); // Đặt state 'showModal' về false để ẩn Modal thanh toán.
  }, []); // Mảng dependency rỗng []: Hàm không phụ thuộc vào bất kỳ biến nào từ scope ngoài cần theo dõi.

  // --- Hàm xử lý khi người dùng nhấn nút "Xóa tất cả" trong giỏ hàng ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm chỉ được tạo lại khi hàm 'clearCart' từ Context thay đổi.
  const handleClearCart = useCallback(() => {
    // Hiển thị một hộp thoại xác nhận của trình duyệt trước khi thực hiện xóa toàn bộ giỏ hàng.
    // window.confirm() trả về true nếu người dùng nhấn 'OK', false nếu nhấn 'Cancel'.
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      return; // Nếu người dùng chọn 'Cancel' (kết quả là false), dừng hàm tại đây và không làm gì cả.
    }
    clearCart(); // Nếu người dùng chọn 'OK', gọi hàm 'clearCart' từ CartContext để xóa hết sản phẩm trong giỏ.
  }, [clearCart]); // Mảng dependency: hàm phụ thuộc vào hàm 'clearCart' từ CartContext.

  // --- Render giao diện dựa trên trạng thái loading ban đầu ---

  // Nếu state 'isLoading' là true (đang trong giai đoạn giả lập tải trang ban đầu), hiển thị giao diện loading.
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container bao quanh spinner và text loading */}
        <div className="loading-spinner"></div> {/* Biểu tượng spinner quay */}
        <p className="loading-text">Đang tải...</p> {/* Hiển thị thông báo "Đang tải..." */}
      </div>
    );
  }

  // --- Render giao diện chính của trang Giỏ hàng khi không còn loading ---
  return (
    <div className="cart-container"> {/* Container chính bao bọc toàn bộ nội dung của trang Giỏ hàng */}
      {/* Tiêu đề trang hiển thị số lượng sản phẩm trong giỏ hàng hiện tại */}
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2> {/* Hiển thị tổng số lượng item trong giỏ (totalItems) */}

      {/* --- Hiển thị nội dung dựa trên trạng thái giỏ hàng (có rỗng hay không) --- */}
      {cart.length === 0 ? ( // Kiểm tra nếu mảng 'cart' rỗng (không có sản phẩm nào)
        <EmptyCart /> // Nếu rỗng, hiển thị component con EmptyCart.
      ) : (
        // Nếu giỏ hàng CÓ sản phẩm (cart.length > 0)
        <> {/* Sử dụng Fragment để nhóm nhiều phần tử (danh sách sản phẩm, nút xóa tất cả, tóm tắt giỏ hàng) mà không thêm DOM node dư thừa vào cây. */}
          {/* Danh sách (unordered list) hiển thị từng sản phẩm trong giỏ hàng */}
          <ul className="cart-list">
            {cart.map((item) => ( // Lặp (map) qua mảng 'cart' để tạo một component CartItem cho mỗi sản phẩm.
              <CartItem
                key={item.id} // Key duy nhất cho mỗi item trong danh sách, giúp React nhận diện hiệu quả khi có thay đổi. Sử dụng ID sản phẩm làm key.
                item={item} // Truyền đối tượng sản phẩm hiện tại ('item') làm prop cho CartItem.
                onIncrease={increaseQuantity} // Truyền hàm 'increaseQuantity' (từ CartContext) làm prop 'onIncrease' cho CartItem.
                onDecrease={decreaseQuantity} // Truyền hàm 'decreaseQuantity' (từ CartContext) làm prop 'onDecrease' cho CartItem.
                onRemove={removeFromCart} // Truyền hàm 'removeFromCart' (từ CartContext) làm prop 'onRemove' cho CartItem.
              />
            ))}
          </ul>
          {/* Nút xóa toàn bộ giỏ hàng */}
          <button
            className="clear-cart-button" // Class CSS để định dạng nút
            onClick={handleClearCart} // Gắn hàm xử lý sự kiện click (đã memoize)
            aria-label="Xóa toàn bộ giỏ hàng" // Thuộc tính hỗ trợ khả năng tiếp cận
          >
            Xóa tất cả {/* Nội dung nút */}
          </button>
          {/* Hiển thị component tóm tắt giỏ hàng (tổng tiền và nút mua hàng) */}
          <CartSummary
            totalPrice={totalPrice} // Truyền biến 'totalPrice' đã tính toán làm prop 'totalPrice' cho CartSummary.
            onCheckout={handleCheckout} // Truyền hàm xử lý sự kiện click nút "Mua hàng" ('handleCheckout', đã memoize) làm prop 'onCheckout' cho CartSummary.
          />
        </>
      )}

      {/* --- Hiển thị Modal thanh toán (nếu cần) --- */}
      {/* Conditional rendering: Nếu state 'showModal' là true, render component CheckoutModal. */}
      {showModal && (
        <CheckoutModal
          cart={cart} // Truyền dữ liệu giỏ hàng hiện tại vào modal. Có thể modal cần hiển thị lại danh sách sản phẩm.
          totalPrice={totalPrice} // Truyền tổng tiền vào modal.
          onConfirm={handleConfirmCheckout} // Truyền hàm xử lý sự kiện khi người dùng xác nhận thanh toán trong modal (đã memoize).
          onCancel={handleCancelCheckout} // Truyền hàm xử lý sự kiện khi người dùng hủy bỏ modal (đã memoize).
        />
      )}

      {/* --- Các liên kết điều hướng khác --- */}
      <div className="cart-links"> {/* Container cho các liên kết điều hướng */}
        {/* Liên kết đến trang lịch sử đơn hàng */}
        <Link to="/orders" className="order-history-link"> {/* 'to="/orders"' là route đến trang lịch sử đơn hàng */}
          📜 Xem lịch sử đơn hàng {/* Nội dung liên kết */}
        </Link>
        {/* Liên kết quay lại trang chủ hoặc trang danh sách sản phẩm */}
        <Link to="/home" className="back-button"> {/* 'to="/home"' là route đến trang chủ hoặc trang danh sách sản phẩm */}
          ⬅ Quay lại cửa hàng {/* Nội dung liên kết */}
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Export component CartPage làm default export để có thể sử dụng ở các file khác (thường là trong cấu hình định tuyến)