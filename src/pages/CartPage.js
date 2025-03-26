import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import "./CartPage.css";

// Constants
// - MESSAGES: Các thông báo cố định để dễ quản lý và bảo trì
const MESSAGES = {
  EMPTY_CART: "Giỏ hàng trống",
  CHECKOUT_SUCCESS: "Đặt hàng thành công!",
};

// Component: CartItem
// - Hiển thị thông tin của một sản phẩm trong giỏ hàng
// - Nhận props: item (sản phẩm), onIncrease, onDecrease, onRemove (các hàm xử lý)
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  // Kiểm tra xem nút giảm số lượng có bị vô hiệu hóa không
  // - Nếu quantity = 1, nút giảm sẽ bị vô hiệu hóa (vì giảm nữa sẽ xóa sản phẩm)
  const isDecreaseDisabled = item.quantity === 1;

  return (
    <li className="cart-item">
      {/* Hình ảnh sản phẩm */}
      <img src={item.image} alt={item.name} className="cart-image" />
      {/* Tên sản phẩm */}
      <p className="cart-name">{item.name}</p>
      {/* Giá sản phẩm */}
      <p className="cart-price">💰 {item.price.toLocaleString("vi-VN")} VNĐ</p>

      {/* Điều khiển số lượng */}
      <div className="quantity-controls">
        {/* Nút giảm số lượng */}
        <button
          onClick={() => onDecrease(item.id)}
          disabled={isDecreaseDisabled}
          className={isDecreaseDisabled ? "disabled" : ""}
        >
          -
        </button>
        {/* Hiển thị số lượng */}
        <span>{item.quantity}</span>
        {/* Nút tăng số lượng */}
        <button onClick={() => onIncrease(item.id)}>+</button>
      </div>

      {/* Nút xóa sản phẩm khỏi giỏ */}
      <button className="remove-button" onClick={() => onRemove(item.id)}>
        Xóa
      </button>
    </li>
  );
};

// Component chính: CartPage
// - Hiển thị danh sách sản phẩm trong giỏ hàng và tổng tiền
const CartPage = () => {
  // Lấy các giá trị và hàm từ CartContext
  // - cart: Mảng chứa các sản phẩm trong giỏ
  // - removeFromCart, increaseQuantity, decreaseQuantity, clearCart: Các hàm xử lý giỏ hàng
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
    useContext(CartContext);

  // Hook để điều hướng người dùng (ví dụ: quay lại trang chủ sau khi đặt hàng)
  const navigate = useNavigate();

  // Tính tổng tiền của giỏ hàng
  // - reduce: Duyệt qua mảng cart, tính tổng = giá * số lượng của từng sản phẩm
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Hàm xử lý đặt hàng
  // - Hiển thị thông báo thành công, xóa giỏ hàng, và điều hướng về trang chủ
  const handleCheckout = () => {
    alert(MESSAGES.CHECKOUT_SUCCESS);
    clearCart();
    navigate("/home");
  };

  return (
    <div className="cart-container">
      {/* Tiêu đề trang giỏ hàng */}
      <h2>🛍 Giỏ Hàng</h2>

      {/* Kiểm tra nếu giỏ hàng trống */}
      {cart.length === 0 ? (
        <p className="empty-cart-message">{MESSAGES.EMPTY_CART}</p>
      ) : (
        <>
          {/* Danh sách sản phẩm trong giỏ */}
          <ul className="cart-list">
            {cart.map((item) => (
              <CartItem
                key={item.id} // Key để React nhận diện từng item trong danh sách
                item={item} // Sản phẩm hiện tại
                onIncrease={increaseQuantity} // Hàm tăng số lượng
                onDecrease={decreaseQuantity} // Hàm giảm số lượng
                onRemove={removeFromCart} // Hàm xóa sản phẩm
              />
            ))}
          </ul>

          {/* Hiển thị tổng tiền */}
          <h3 className="total-price">
            Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
          </h3>

          {/* Nút đặt hàng */}
          <button className="checkout-button" onClick={handleCheckout}>
            🛍 Mua hàng
          </button>
        </>
      )}

      {/* Nút quay lại trang chủ */}
      <div className="back-button-container">
        <Link to="/home" className="back-button">
          ⬅ Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage;