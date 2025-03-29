// components/CheckoutModal.jsx
import React, { useState } from "react";
import "./CheckoutModal.css"; // File CSS để định dạng modal

// Component CheckoutModal - Hiển thị modal xác nhận thanh toán
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // State lưu thông tin giao hàng
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý khi người dùng xác nhận
  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra nếu các trường bắt buộc được điền
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    onConfirm(shippingInfo); // Gọi hàm xác nhận và truyền thông tin giao hàng
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Xác nhận thanh toán</h2>
        <div className="order-summary">
          <h3>Thông tin đơn hàng</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity} -{" "}
                {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
              </li>
            ))}
          </ul>
          <p className="total-price">
            Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <h3>Thông tin giao hàng</h3>
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={shippingInfo.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ giao hàng"
            value={shippingInfo.address}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại"
            value={shippingInfo.phone}
            onChange={handleChange}
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              Xác nhận
            </button>
            <button type="button" className="cancel-button" onClick={onCancel}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;