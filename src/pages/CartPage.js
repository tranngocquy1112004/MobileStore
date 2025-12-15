import React, { useContext, useMemo, useState } from "react"; // Import các React Hook cần thiết: useContext, useMemo, useState
import { Link, useNavigate } from "react-router-dom"; // Import các component và hook hỗ trợ định tuyến: Link để liên kết, useNavigate để điều hướng
import { CartContext } from "./CartContext"; // Import context giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Import context xác thực người dùng
import { formatCurrency } from "../utils/formatters";
import "./CartPage.css"; // Import file CSS của trang giỏ hàng

// --- CÁC HẺ SỐ THÔNG BÁO (MESSAGES) ---
// Định nghĩa các thông báo sẽ hiển thị cho người dùng trong các trường hợp khác nhau
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng của bạn đang trống.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
  CONTEXT_ERROR: "Không thể truy cập giỏ hàng. Vui lòng thử lại.",
  BACK_TO_SHOP: "Quay lại cửa hàng",
  PROCEED_TO_CHECKOUT: "Tiến hành thanh toán",
  TOTAL_LABEL: "Tổng cộng:",
};

// --- HÀM HỖ TRỢ ---
// Hàm tính tổng tiền của các sản phẩm trong giỏ bằng cách cộng dồn giá * số lượng của từng sản phẩm
const calculateCartTotal = (cart) =>
  cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);

// --- CUSTOM HOOK: useCart ---
// Hook này lấy thông tin giỏ hàng và trạng thái đăng nhập từ context, xử lý logic tính toán tổng tiền và chuyển hướng thanh toán
const useCart = () => {
  const cartContext = useContext(CartContext); // Lấy thông tin từ CartContext
  const authContext = useContext(AuthContext); // Lấy thông tin từ AuthContext
  const navigate = useNavigate(); // Hook điều hướng trang
  const [error, setError] = useState(null); // State lưu trữ thông báo lỗi
  const [guardMessage, setGuardMessage] = useState(null);

  // Nếu không lấy được thông tin từ context, cập nhật error và trả về
  if (!cartContext || !authContext) {
    setError(MESSAGES.CONTEXT_ERROR);
    return { error };
  }

  // Lấy danh sách sản phẩm trong giỏ, hàm remove và update số lượng từ CartContext
  const { cart = [], removeFromCart, updateQuantity } = cartContext;
  // Lấy trạng thái đăng nhập từ AuthContext, mặc định là false nếu không có
  const { isLoggedIn = false } = authContext;

  // Tính toán tổng tiền giỏ hàng, sử dụng useMemo để tối ưu hiệu suất khi cart không thay đổi
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  // Hàm xử lý khi người dùng nhấn "Tiến hành Thanh toán"
  const handleProceedToCheckout = () => {
    if (!cart.length) {
      setGuardMessage(MESSAGES.EMPTY_CART);
      return;
    }
    if (!isLoggedIn) {
      setGuardMessage(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    setGuardMessage(null);
    navigate("/checkout");
  };
  return {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart: removeFromCart || (() => console.warn("removeFromCart not implemented")),
    updateQuantity: updateQuantity || (() => console.warn("updateQuantity not implemented")),
    handleProceedToCheckout,
    guardMessage,
    error,
  };
};

// --- COMPONENT CON: CartItem ---
// Sử dụng React.memo giúp tránh render lại không cần thiết khi props không thay đổi
const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  // Kiểm tra dữ liệu sản phẩm hợp lệ, nếu không hợp lệ thì log lỗi và không render
  if (!item?.id || !item.name || !item.image || typeof item.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", item);
    return null;
  }

  // Hàm giảm số lượng sản phẩm
  const handleDecrease = () => onUpdateQuantity(item.id, item.quantity - 1);
  // Hàm tăng số lượng sản phẩm
  const handleIncrease = () => onUpdateQuantity(item.id, item.quantity + 1);
  // Hàm xóa sản phẩm khỏi giỏ hàng
  const handleRemove = () => onRemove(item.id);

  return (
    <li className="cart-item" aria-label={`Sản phẩm ${item.name} trong giỏ hàng`}>
      {/* Hiển thị hình ảnh sản phẩm */}
      <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
      {/* Hiển thị thông tin chi tiết sản phẩm */}
      <div className="item-details">
        <span className="item-name">{item.name}</span>
        {/* Hiển thị giá sản phẩm được định dạng theo chuẩn tiền Việt */}
        {/* Điều chỉnh số lượng sản phẩm */}
        <div className="quantity-control">
          <button onClick={handleDecrease} disabled={item.quantity <= 1} aria-label="Giảm số lượng">
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={handleIncrease} aria-label="Tăng số lượng">
            +
          </button>
        </div>
        {/* Hiển thị tổng tiền cho sản phẩm: giá x số lượng */}
        <span className="item-subtotal">
          Tổng: {formatCurrency((item.price || 0) * (item.quantity || 0))}
        </span>
      </div>
      {/* Nút xóa sản phẩm khỏi giỏ */}
      <button onClick={handleRemove} className="remove-item-button" aria-label="Xóa sản phẩm">
        Xóa
      </button>
    </li>
  );
});

// --- COMPONENT CON: CartSummary ---
// Hiển thị phần tổng tiền và nút chuyển đến thanh toán
const CartSummary = React.memo(({ cartTotal, isLoggedIn, onProceedToCheckout }) => (
  <div className="cart-summary">
    <p className="total-price">
      <strong>{MESSAGES.TOTAL_LABEL}</strong> {formatCurrency(cartTotal)}
    </p>
    <button
      className="proceed-to-checkout-button"
      onClick={onProceedToCheckout}
      disabled={!isLoggedIn} // Vô hiệu hóa nút nếu chưa đăng nhập
      aria-label="Tiến hành thanh toán"
    >
      {MESSAGES.PROCEED_TO_CHECKOUT}
    </button>
    {/* Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập */}
    {!isLoggedIn && (
      <p className="login-required-message">{MESSAGES.LOGIN_REQUIRED}</p>
    )}
  </div>
));

// --- COMPONENT CON: EmptyCartMessage ---
// Hiển thị thông báo nếu giỏ hàng rỗng, kèm theo liên kết quay lại cửa hàng
const EmptyCartMessage = () => (
  <div className="empty-cart-message">
    <p>{MESSAGES.EMPTY_CART}</p>
    <Link to="/home" className="back-to-home" aria-label="Quay lại cửa hàng">
      {MESSAGES.BACK_TO_SHOP}
    </Link>
  </div>
);

// --- COMPONENT CHÍNH: CartPage ---
// Đây là component trang Giỏ hàng sử dụng hook custom useCart để lấy thông tin giỏ và trạng thái đăng nhập
const CartPage = () => {
  const {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart,
    updateQuantity,
    handleProceedToCheckout,
    guardMessage,
    error,
  } = useCart(); // L?y c?c gi? tr? c?n thi?t t? hook useCart

  // Nếu có lỗi từ custom hook, hiển thị thông báo lỗi
  if (error) return <div className="cart-error-message">{error}</div>;
  if (!isLoggedIn) {
    return (
      <div className="cart-container">
        <div className="cart-error-message">{MESSAGES.LOGIN_REQUIRED}</div>
        <Link to="/" className="back-to-home">{MESSAGES.BACK_TO_SHOP}</Link>
      </div>
    );
  }


  // Kiểm tra giỏ hàng có chứa sản phẩm nào hay không
  const hasItems = cart.length > 0;

  return (
    <div className="cart-container">
      <h1 className="page-title">Giỏ hàng của bạn</h1>
      {guardMessage && (
        <div className="cart-error-message">{guardMessage}</div>
      )}
      {hasItems ? (
        <>
          {/* Danh sách các sản phẩm trong giỏ */}
          <ul className="cart-items-list" role="list">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </ul>
          {/* Hiển thị phần tóm tắt giỏ hàng với tổng tiền và nút thanh toán */}
          <CartSummary
            cartTotal={cartTotal}
            isLoggedIn={isLoggedIn}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </>
      ) : (
        // Nếu giỏ hàng trống, hiển thị thông báo trống
        <EmptyCartMessage />
      )}
    </div>
  );
};

export default CartPage; // Xuất component CartPage để sử dụng ở các phần khác của ứng dụng
