// Import các thư viện và hook cần thiết từ React
import React, { useContext, useState } from "react";
// Import các component từ react-router-dom để điều hướng
import { Link, useNavigate } from "react-router-dom";
// Import context để truy cập dữ liệu giỏ hàng và xác thực
import { CartContext } from "./CartContext"; // Context quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Context quản lý xác thực
// Import component modal thanh toán
import CheckoutModal from "../components/CheckoutModal"; // Modal để nhập thông tin thanh toán
// Import file CSS cho trang giỏ hàng
import "./CartPage.css"; // File style cho giao diện

// Định nghĩa các thông báo cố định
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống", // Thông báo khi giỏ hàng rỗng
  CHECKOUT_SUCCESS: "Đặt hàng thành công!", // Thông báo khi đặt hàng thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi chưa đăng nhập
};

// Component CartItem - Hiển thị thông tin một sản phẩm trong giỏ hàng
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => { // Nhận props: sản phẩm và các hàm xử lý
  const isDecreaseDisabled = item.quantity === 1; // Kiểm tra nếu số lượng = 1 thì vô hiệu hóa nút giảm

  return (
    <li className="cart-item"> {/* Một mục trong danh sách giỏ hàng */}
      <img src={item.image} alt={item.name} className="cart-image" /> {/* Hình ảnh sản phẩm */}
      <div className="cart-item-details"> {/* Container cho chi tiết sản phẩm */}
        <p className="cart-name">{item.name}</p> {/* Tên sản phẩm */}
        <p className="cart-price">💰 {item.price.toLocaleString("vi-VN")} VNĐ</p> {/* Giá sản phẩm định dạng VN */}
        <div className="quantity-controls"> {/* Điều khiển số lượng */}
          <button
            onClick={() => onDecrease(item.id)} // Giảm số lượng khi nhấn
            disabled={isDecreaseDisabled} // Vô hiệu hóa nếu số lượng = 1
            className={isDecreaseDisabled ? "disabled" : ""} // Thêm class nếu bị vô hiệu hóa
          >
            -
          </button>
          <span>{item.quantity}</span> {/* Hiển thị số lượng hiện tại */}
          <button onClick={() => onIncrease(item.id)}>+</button> {/* Tăng số lượng khi nhấn */}
        </div>
      </div>
      <button className="remove-button" onClick={() => onRemove(item.id)}> {/* Nút xóa sản phẩm */}
        Xóa
      </button>
    </li>
  );
};

// Component CartSummary - Hiển thị tổng tiền và nút thanh toán
const CartSummary = ({ totalPrice, onCheckout }) => ( // Nhận props: tổng tiền và hàm thanh toán
  <div className="cart-summary"> {/* Container cho phần tóm tắt */}
    <h3 className="total-price"> {/* Tổng tiền */}
      Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
    </h3>
    <button className="checkout-button" onClick={onCheckout}> {/* Nút thanh toán */}
      🛍 Mua hàng
    </button>
  </div>
);

// Component EmptyCart - Hiển thị khi giỏ hàng trống
const EmptyCart = () => ( // Không nhận props
  <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p> // Thông báo giỏ hàng trống
);

// Component chính CartPage - Trang giỏ hàng
const CartPage = () => {
  const navigate = useNavigate(); // Hook để điều hướng trang
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useContext(CartContext); // Lấy dữ liệu và hàm từ CartContext
  const { isLoggedIn } = useContext(AuthContext) || { isLoggedIn: false }; // Lấy trạng thái đăng nhập, mặc định là false nếu không có context
  const [showModal, setShowModal] = useState(false); // State để hiển thị/ẩn modal thanh toán

  // Tính tổng tiền từ giỏ hàng
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // Tổng = giá * số lượng của từng sản phẩm

  // Xử lý sự kiện nhấn nút thanh toán
  const handleCheckout = () => {
    if (!isLoggedIn) { // Nếu chưa đăng nhập
      alert(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập
      navigate("/"); // Chuyển hướng về trang đăng nhập
      return;
    }
    setShowModal(true); // Hiển thị modal thanh toán nếu đã đăng nhập
  };

  // Xử lý khi xác nhận thanh toán từ modal
  const handleConfirmCheckout = (shippingInfo) => { // Nhận thông tin giao hàng từ modal
    const order = { // Tạo đối tượng đơn hàng mới
      id: Date.now(), // ID đơn hàng dựa trên timestamp
      items: cart, // Danh sách sản phẩm trong giỏ hàng
      totalPrice, // Tổng tiền
      shippingInfo, // Thông tin giao hàng
      date: new Date().toISOString(), // Thời gian đặt hàng
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || []; // Lấy danh sách đơn hàng cũ từ localStorage
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order])); // Lưu đơn hàng mới vào localStorage

    alert(MESSAGES.CHECKOUT_SUCCESS); // Thông báo đặt hàng thành công
    clearCart(); // Xóa toàn bộ giỏ hàng
    setShowModal(false); // Ẩn modal
    navigate("/home"); // Chuyển hướng về trang chủ
  };

  // Xử lý khi hủy thanh toán từ modal
  const handleCancelCheckout = () => setShowModal(false); // Ẩn modal khi hủy

  return (
    <div className="cart-container"> {/* Container chính của trang giỏ hàng */}
      <h2>🛍 Giỏ Hàng</h2> {/* Tiêu đề trang */}
      {cart.length === 0 ? ( // Kiểm tra giỏ hàng có rỗng không
        <EmptyCart /> // Hiển thị thông báo nếu rỗng
      ) : (
        <> {/* Fragment để nhóm các phần tử */}
          <ul className="cart-list"> {/* Danh sách sản phẩm trong giỏ hàng */}
            {cart.map((item) => ( // Duyệt qua từng sản phẩm
              <CartItem
                key={item.id} // Key duy nhất cho mỗi sản phẩm
                item={item} // Dữ liệu sản phẩm
                onIncrease={increaseQuantity} // Hàm tăng số lượng
                onDecrease={decreaseQuantity} // Hàm giảm số lượng
                onRemove={removeFromCart} // Hàm xóa sản phẩm
              />
            ))}
          </ul>
          <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} /> {/* Hiển thị tổng tiền và nút thanh toán */}
        </>
      )}
      {showModal && ( // Hiển thị modal nếu showModal = true
        <CheckoutModal
          cart={cart} // Truyền danh sách sản phẩm vào modal
          totalPrice={totalPrice} // Truyền tổng tiền vào modal
          onConfirm={handleConfirmCheckout} // Hàm xử lý xác nhận
          onCancel={handleCancelCheckout} // Hàm xử lý hủy
        />
      )}
      <div className="cart-links"> {/* Container cho các liên kết điều hướng */}
        <Link to="/orders" className="order-history-link"> {/* Liên kết đến lịch sử đơn hàng */}
          📜 Xem lịch sử đơn hàng
        </Link>
        <Link to="/home" className="back-button"> {/* Liên kết quay lại cửa hàng */}
          ⬅ Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage; // Xuất component để sử dụng