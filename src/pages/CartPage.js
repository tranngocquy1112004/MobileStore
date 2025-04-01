// Import các thư viện và hook cần thiết từ React
import React, { useContext, useState } from "react";
// Import các component từ react-router-dom để điều hướng
import { Link, useNavigate } from "react-router-dom";
// Import các context để truy cập dữ liệu giỏ hàng và xác thực
import { CartContext } from "./CartContext";
import { AuthContext } from "../account/AuthContext";
// Import component modal thanh toán
import CheckoutModal from "../components/CheckoutModal";
// Import file CSS cho trang giỏ hàng
import "./CartPage.css";

// Định nghĩa các thông báo sử dụng trong ứng dụng
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống",
  CHECKOUT_SUCCESS: "Đặt hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

// Component CartItem hiển thị thông tin một sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  // Kiểm tra nếu số lượng = 1 thì disable nút giảm số lượng
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      {/* Ảnh sản phẩm */}
      <img src={item.image} alt={item.name} className="cart-image" />
      
      {/* Chi tiết sản phẩm */}
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Tên sản phẩm */}
        {/* Giá sản phẩm định dạng VNĐ */}
        <p className="cart-price">💰 {item.price.toLocaleString("vi-VN")} VNĐ</p>
        
        {/* Điều khiển số lượng */}
        <div className="quantity-controls">
          <button
            onClick={() => onDecrease(item.id)} // Xử lý giảm số lượng
            disabled={isDecreaseDisabled} // Disable nếu số lượng = 1
            className={isDecreaseDisabled ? "disabled" : ""} // Thêm class disabled nếu bị disable
          >
            -
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng hiện tại */}
          <button onClick={() => onIncrease(item.id)}>+</button> {/* Xử lý tăng số lượng */}
        </div>
      </div>
      
      {/* Nút xóa sản phẩm khỏi giỏ hàng */}
      <button className="remove-button" onClick={() => onRemove(item.id)}>
        Xóa
      </button>
    </li>
  );
};

// Component CartSummary hiển thị tổng tiền và nút thanh toán
const CartSummary = ({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    {/* Hiển thị tổng tiền định dạng VNĐ */}
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
    </h3>
    {/* Nút thanh toán */}
    <button className="checkout-button" onClick={onCheckout}>
      🛍 Mua hàng
    </button>
  </div>
);

// Component EmptyCart hiển thị khi giỏ hàng trống
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>
);

// Component chính CartPage
const CartPage = () => {
  // Hook useNavigate để điều hướng trang
  const navigate = useNavigate();
  
  // Lấy dữ liệu giỏ hàng và các hàm xử lý từ CartContext
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useContext(CartContext);
  
  // Kiểm tra trạng thái đăng nhập từ AuthContext
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };
  
  // State quản lý hiển thị modal thanh toán
  const [showModal, setShowModal] = useState(false);

  // Tính tổng tiền giỏ hàng
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Xử lý khi nhấn nút thanh toán
  const handleCheckout = () => {
    // Kiểm tra nếu chưa đăng nhập thì thông báo và chuyển hướng
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    // Hiển thị modal thanh toán nếu đã đăng nhập
    setShowModal(true);
  };

  // Xử lý khi xác nhận thanh toán
  const handleConfirmCheckout = (shippingInfo) => {
    // Tạo đối tượng đơn hàng mới
    const order = {
      id: Date.now(), // ID đơn hàng là timestamp hiện tại
      items: cart, // Danh sách sản phẩm
      totalPrice, // Tổng tiền
      shippingInfo, // Thông tin giao hàng từ modal
      date: new Date().toISOString(), // Ngày đặt hàng
    };
    
    // Lấy danh sách đơn hàng cũ từ localStorage hoặc tạo mới nếu chưa có
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Lưu đơn hàng mới vào localStorage
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));
    
    // Thông báo thành công
    alert(MESSAGES.CHECKOUT_SUCCESS);
    
    // Xóa giỏ hàng sau khi đặt hàng thành công
    clearCart();
    
    // Đóng modal
    setShowModal(false);
    
    // Chuyển hướng về trang chủ
    navigate("/home");
  };

  // Xử lý khi hủy thanh toán
  const handleCancelCheckout = () => setShowModal(false);

  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng</h2> {/* Tiêu đề trang */}
      
      {/* Kiểm tra nếu giỏ hàng trống thì hiển thị EmptyCart, ngược lại hiển thị danh sách sản phẩm */}
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <ul className="cart-list">
            {/* Render từng sản phẩm trong giỏ hàng */}
            {cart.map((item) => (
              <CartItem
                key={item.id} // Key duy nhất cho mỗi sản phẩm
                item={item} // Thông tin sản phẩm
                onIncrease={increaseQuantity} // Hàm tăng số lượng
                onDecrease={decreaseQuantity} // Hàm giảm số lượng
                onRemove={removeFromCart} // Hàm xóa sản phẩm
              />
            ))}
          </ul>
          {/* Hiển thị tổng tiền và nút thanh toán */}
          <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} />
        </>
      )}
      
      {/* Hiển thị modal thanh toán khi showModal = true */}
      {showModal && (
        <CheckoutModal
          cart={cart} // Truyền danh sách sản phẩm
          totalPrice={totalPrice} // Truyền tổng tiền
          onConfirm={handleConfirmCheckout} // Hàm xử lý khi xác nhận
          onCancel={handleCancelCheckout} // Hàm xử lý khi hủy
        />
      )}
      
      {/* Các liên kết điều hướng */}
      <div className="cart-links">
        <Link to="/orders" className="order-history-link">
          📜 Xem lịch sử đơn hàng
        </Link>
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Xuất component để sử dụng