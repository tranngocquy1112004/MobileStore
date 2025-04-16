import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext"; // Context để quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Context để quản lý trạng thái đăng nhập
import CheckoutModal from "../components/CheckoutModal"; // Modal để nhập thông tin thanh toán
import "./CartPage.css";

// Định nghĩa các thông báo cố định
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống", // Thông báo khi giỏ hàng rỗng
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Thông báo khi đặt hàng thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi cần đăng nhập
};

// Component CartItem hiển thị thông tin một sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isDecreaseDisabled = item.quantity === 1; // Kiểm tra nếu số lượng là 1 để vô hiệu hóa nút giảm

  return (
    <li className="cart-item">
      <img
        src={item.image}
        alt={item.name}
        className="cart-image"
        loading="lazy" // Tải ảnh theo chế độ lazy để tối ưu hiệu suất
      />
      <div className="cart-item-details">
        <p className="cart-name">{item.name}</p> {/* Tên sản phẩm */}
        <p className="cart-price">
          💰 {item.price.toLocaleString("vi-VN")} VNĐ {/* Giá sản phẩm định dạng VNĐ */}
        </p>
        <div className="quantity-controls">
          <button
            onClick={() => onDecrease(item.id)} // Giảm số lượng sản phẩm
            disabled={isDecreaseDisabled} // Vô hiệu hóa nếu số lượng là 1
            className={isDecreaseDisabled ? "disabled" : ""}
            aria-label={`Giảm số lượng ${item.name}`}
          >
            -
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng hiện tại */}
          <button
            onClick={() => onIncrease(item.id)} // Tăng số lượng sản phẩm
            aria-label={`Tăng số lượng ${item.name}`}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="remove-button"
        onClick={() => onRemove(item.id)} // Xóa sản phẩm khỏi giỏ hàng
        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
      >
        Xóa
      </button>
    </li>
  );
};

// Component CartSummary hiển thị tóm tắt giỏ hàng
const CartSummary = ({ totalPrice, onCheckout }) => (
  <div className="cart-summary">
    <h3 className="total-price">
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ {/* Tổng tiền giỏ hàng */}
    </h3>
    <button className="checkout-button" onClick={onCheckout}>
      🛍 Mua hàng {/* Nút tiến hành thanh toán */}
    </button>
  </div>
);

// Component EmptyCart hiển thị khi giỏ hàng rỗng
const EmptyCart = () => (
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p> // Thông báo giỏ hàng rỗng
);

// Component chính CartPage
const CartPage = () => {
  const navigate = useNavigate(); // Hook để điều hướng trang
  // Lấy các hàm và dữ liệu từ CartContext
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);
  // Lấy trạng thái đăng nhập từ AuthContext, mặc định là false nếu không có
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false };
  const [showModal, setShowModal] = useState(false); // State để hiển thị modal thanh toán
  const [isLoading, setIsLoading] = useState(true); // State để quản lý trạng thái tải

  // Giả lập thời gian tải dữ liệu khi component mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // Tắt trạng thái tải sau 1 giây
    return () => clearTimeout(timer); // Hủy timeout khi component unmount
  }, []);

  // Tính tổng giá và tổng số sản phẩm trong giỏ hàng
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // Tổng tiền
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Tổng số sản phẩm

  // Xử lý khi nhấn nút thanh toán
  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // Thông báo nếu chưa đăng nhập
      navigate("/"); // Chuyển hướng về trang đăng nhập
      return;
    }
    setShowModal(true); // Hiển thị modal thanh toán
  };

  // Xử lý khi xác nhận thanh toán
  const handleConfirmCheckout = (shippingInfo) => {
    // Tạo đối tượng đơn hàng mới
    const order = {
      id: Date.now(), // ID dựa trên timestamp
      items: cart, // Danh sách sản phẩm trong giỏ
      totalPrice, // Tổng tiền
      shippingInfo, // Thông tin giao hàng
      date: new Date().toISOString(), // Thời gian đặt hàng
    };

    // Lấy danh sách đơn hàng hiện có từ localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    // Lưu đơn hàng mới vào localStorage
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));

    alert(MESSAGES.CHECKOUT_SUCCESS); // Thông báo đặt hàng thành công
    clearCart(); // Xóa giỏ hàng
    setShowModal(false); // Ẩn modal
    navigate("/home"); // Chuyển hướng về trang chủ
  };

  // Xử lý khi hủy thanh toán
  const handleCancelCheckout = () => {
    setShowModal(false); // Ẩn modal thanh toán
  };

  // Xử lý xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return; // Xác nhận trước khi xóa
    clearCart(); // Xóa giỏ hàng
  };

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="cart-container">
      <h2>🛍 Giỏ Hàng ({totalItems} sản phẩm)</h2> {/* Tiêu đề và số lượng sản phẩm */}
      {cart.length === 0 ? (
        <EmptyCart /> // Hiển thị thông báo nếu giỏ hàng rỗng
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={increaseQuantity} // Hàm tăng số lượng
                onDecrease={decreaseQuantity} // Hàm giảm số lượng
                onRemove={removeFromCart} // Hàm xóa sản phẩm
              />
            ))}
          </ul>
          <button
            className="clear-cart-button"
            onClick={handleClearCart}
            aria-label="Xóa toàn bộ giỏ hàng"
          >
            Xóa tất cả {/* Nút xóa toàn bộ giỏ hàng */}
          </button>
          <CartSummary
            totalPrice={totalPrice}
            onCheckout={handleCheckout} // Hàm xử lý thanh toán
          />
        </>
      )}
      {/* Hiển thị modal thanh toán nếu showModal là true */}
      {showModal && (
        <CheckoutModal
          cart={cart}
          totalPrice={totalPrice}
          onConfirm={handleConfirmCheckout} // Hàm xác nhận thanh toán
          onCancel={handleCancelCheckout} // Hàm hủy thanh toán
        />
      )}
      {/* Các liên kết điều hướng */}
      <div className="cart-links">
        <Link to="/orders" className="order-history-link">
          📜 Xem lịch sử đơn hàng {/* Liên kết đến trang lịch sử đơn hàng */}
        </Link>
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng {/* Liên kết quay lại trang chủ */}
        </Link>
      </div>
    </div>
  );
};

export default CartPage;