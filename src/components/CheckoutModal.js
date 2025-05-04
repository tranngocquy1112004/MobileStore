import React, { useState, useCallback, useContext, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { AuthContext } from "../account/AuthContext";
import "./CheckoutModal.css";

// Constants
const EMPTY_CART_MESSAGE = "Không có sản phẩm trong giỏ hàng để thanh toán.";
const ORDER_CONFIRMATION_MESSAGE = "Đơn hàng của bạn đã được đặt thành công!";
const ORDER_STORAGE_KEY = "orders";

// Initialize EmailJS with Public Key
const initializeEmailJS = () => {
  try {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    console.log("EmailJS initialized with Public Key:", process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error("Failed to initialize EmailJS:", error);
  }
};

// Utility function to validate shipping information
const validateShippingInfo = (shippingInfo) => {
  const errors = {};
  const { name, address, phone, email } = shippingInfo;

  if (!name.trim()) errors.name = "Vui lòng nhập họ và tên.";
  if (!address.trim()) errors.address = "Vui lòng nhập địa chỉ giao hàng.";
  if (!phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.";
  }
  if (!email.trim()) {
    errors.email = "Vui lòng nhập email.";
  } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
    errors.email = "Email không hợp lệ.";
  }

  return errors;
};

// Utility function to generate order ID
const generateOrderId = () => {
  return `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Utility function to save order to localStorage
const saveOrderToStorage = (order) => {
  try {
    const storedOrders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const updatedOrders = [...storedOrders, order];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
  } catch (error) {
    console.error("Error saving order to localStorage:", error);
  }
};

// Utility function to send email confirmation (using EmailJS)
const sendEmailConfirmation = (order, shippingInfo, setEmailError) => {
  const templateParams = {
    order_id: order.id,
    user_name: shippingInfo.name,
    user_email: shippingInfo.email,
    email: shippingInfo.email,
    order_total: order.totalPrice.toLocaleString("vi-VN"),
    order_date: new Date(order.date).toLocaleString("vi-VN"),
    items: order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
  };
  console.log("Sending email with params:", templateParams); // Log params

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      (response) => {
        console.log("Email sent successfully:", response.status, response.text);
      },
      (error) => {
        console.error("Failed to send email:", error);
        setEmailError(`Gửi email thất bại: ${error.message || "Lỗi không xác định"}`);
      }
    );
};

const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  const { user } = useContext(AuthContext) || { user: null };
  console.log("CheckoutModal mounted with cart:", cart, "totalPrice:", totalPrice); // Log khi component mount

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: user?.email || "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [emailError, setEmailError] = useState("");

  // Initialize EmailJS on component mount
  useEffect(() => {
    initializeEmailJS();
    console.log("Environment vars:", {
      serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
    });
  }, []);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    setEmailError("");
    console.log("Input changed:", name, value); // Log khi thay đổi input
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log("Form submitted with shippingInfo:", shippingInfo); // Log khi submit
      const errors = validateShippingInfo(shippingInfo);
      setValidationErrors(errors);
      if (Object.keys(errors).length === 0) {
        const order = {
          id: generateOrderId(),
          username: user?.username || "guest",
          date: new Date().toISOString(),
          totalPrice,
          items: cart,
          shippingInfo,
        };

        saveOrderToStorage(order);
        sendEmailConfirmation(order, shippingInfo, setEmailError);
        setOrderDetails(order);
        setShowConfirmation(true);
        onConfirm(shippingInfo);
      }
    },
    [shippingInfo, cart, totalPrice, onConfirm, user]
  );

  // Handle closing confirmation modal
  const handleCloseConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setShippingInfo({ name: "", address: "", phone: "", email: user?.email || "" });
    setEmailError("");
    onCancel();
    console.log("Confirmation modal closed"); // Log khi đóng modal
  }, [onCancel, user]);

  // Render cart items
  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return <p className="empty-cart-message">{EMPTY_CART_MESSAGE}</p>;
    }

    return (
      <div>
        <ul className="cart-items-list">
          {cart.map((item, index) => (
            <li key={item?.id || index} className="cart-item">
              <span className="item-name">{item?.name || "Sản phẩm không rõ"}</span>
              <span className="item-quantity">x {item?.quantity || 0}</span>
              <span className="item-price">
                {((item?.price || 0) * (item?.quantity || 0)).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
        <p className="total-price">
          <strong>Tổng tiền:</strong> {(totalPrice || 0).toLocaleString("vi-VN")} VNĐ
        </p>
      </div>
    );
  };

  // Render shipping form
  const renderShippingForm = () => (
    <form onSubmit={handleSubmit} className="shipping-form">
      <h3>🚚 Thông tin giao hàng</h3>
      <div className="form-group">
        <label htmlFor="name">Họ và tên:</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Nhập họ và tên người nhận"
          value={shippingInfo.name}
          onChange={handleChange}
          className={validationErrors.name ? "error" : ""}
          aria-label="Nhập họ và tên người nhận"
          required
        />
        {validationErrors.name && (
          <span className="error-message">{validationErrors.name}</span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="address">Địa chỉ:</label>
        <input
          type="text"
          id="address"
          name="address"
          placeholder="Nhập địa chỉ giao hàng chi tiết"
          value={shippingInfo.address}
          onChange={handleChange}
          className={validationErrors.address ? "error" : ""}
          aria-label="Nhập địa chỉ giao hàng"
          required
        />
        {validationErrors.address && (
          <span className="error-message">{validationErrors.address}</span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="phone">Số điện thoại:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Nhập số điện thoại liên hệ"
          value={shippingInfo.phone}
          onChange={handleChange}
          className={validationErrors.phone ? "error" : ""}
          aria-label="Nhập số điện thoại liên hệ"
          required
        />
        {validationErrors.phone && (
          <span className="error-message">{validationErrors.phone}</span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Nhập email để nhận xác nhận"
          value={shippingInfo.email}
          onChange={handleChange}
          className={validationErrors.email ? "error" : ""}
          aria-label="Nhập email"
          required
        />
        {validationErrors.email && (
          <span className="error-message">{validationErrors.email}</span>
        )}
      </div>
      {emailError && <p className="error-message">{emailError}</p>}
      <div className="modal-buttons">
        <button
          type="submit"
          className="confirm-button"
          aria-label="Xác nhận đặt hàng"
        >
          ✅ Xác nhận đặt hàng
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          aria-label="Hủy đặt hàng"
        >
          ❌ Hủy
        </button>
      </div>
    </form>
  );

  // Render confirmation modal
  const renderConfirmationModal = () => (
    <div className="modal-overlay" onClick={handleCloseConfirmation}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">✅ Đặt hàng thành công</h2>
        <p className="confirmation-message">{ORDER_CONFIRMATION_MESSAGE}</p>
        {orderDetails && (
          <div className="order-details">
            <p><strong>Mã đơn hàng:</strong> {orderDetails.id}</p>
            <p><strong>Tổng tiền:</strong> {orderDetails.totalPrice.toLocaleString("vi-VN")} VNĐ</p>
            <p><strong>Ngày đặt:</strong> {new Date(orderDetails.date).toLocaleString("vi-VN")}</p>
            <p><strong>Thông tin giao hàng:</strong></p>
            <ul>
              <li>Tên: {orderDetails.shippingInfo.name}</li>
              <li>Địa chỉ: {orderDetails.shippingInfo.address}</li>
              <li>Số điện thoại: {orderDetails.shippingInfo.phone}</li>
              <li>Email: {orderDetails.shippingInfo.email}</li>
            </ul>
          </div>
        )}
        {emailError && <p className="error-message">{emailError}</p>}
        <div className="modal-buttons">
          <button
            className="confirm-button"
            onClick={handleCloseConfirmation}
            aria-label="Đóng thông báo"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  const isCartEmpty = !Array.isArray(cart) || cart.length === 0;

  return (
    <>
      {showConfirmation ? (
        renderConfirmationModal()
      ) : (
        <div className="modal-overlay" onClick={onCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">🛒 Xác nhận thanh toán</h2>
            <div className="order-summary">
              <h3>📋 Thông tin đơn hàng</h3>
              {renderCartItems()}
            </div>
            {!isCartEmpty && renderShippingForm()}
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutModal;