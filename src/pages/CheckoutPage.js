import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { AuthContext } from "../account/AuthContext";
import { CartContext } from "../pages/CartContext";
import { formatCurrency } from "../utils/formatters";
import "./CheckoutPage.css";

// --- Các hằng số ---
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Key lưu trữ đơn hàng trong localStorage
const MESSAGES = {
  SUCCESS: "Chúng tôi đã gửi Email xác nhận đơn hàng của bạn, vui lòng kiểm tra Email.",
  EMPTY_CART: "Giỏ hàng của bạn đang trống.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để thanh toán.",
  INVALID_SHIPPING: "Vui lòng nhập đầy đủ thông tin giao hàng.",
  SAVE_ERROR: "Lỗi hệ thống khi lưu dữ liệu đơn hàng.",
  READ_ERROR: "Lỗi hệ thống khi đọc dữ liệu đơn hàng.",
  INVALID_EMAIL: "Email người dùng không hợp lệ. Vui lòng cập nhật email trong hồ sơ.",
};

// --- Các hàm tiện ích ---

// Tính tổng giá trị giỏ hàng
const calculateCartTotal = (cart) =>
  Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) : 0;

// Đọc danh sách đơn hàng từ localStorage
const readOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu đơn hàng:", error);
    return [];
  }
};

// Lưu danh sách đơn hàng vào localStorage
const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu đơn hàng:", error);
    return false;
  }
};

// Khởi tạo EmailJS để gửi email
const initializeEmailJS = () => {
  try {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error("Lỗi khởi tạo EmailJS:", error);
  }
};

// Gửi email xác nhận đơn hàng
const sendEmailConfirmation = (order, user, setMessage) => {
  const templateParams = {
    order_id: order.id,
    user_name: order.shippingInfo.name,
    user_email: user.email,
    email: user.email,
    order_total: formatCurrency(order.totalPrice),
    order_date: new Date(order.date).toLocaleString("vi-VN"),
    items: order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
  };

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      () => {},
      (error) => {
        console.error("Lỗi gửi email:", error);
        setMessage("Đặt hàng thành công nhưng không gửi được email xác nhận.");
      }
    );
};

// --- Các component con ---

// Component hiển thị tổng quan đơn hàng
const OrderSummary = React.memo(({ cart, cartTotal, navigate }) => (
  <div className="order-summary-section">
    <h2>📋 Thông tin đơn hàng</h2>
    {cart?.length > 0 ? (
      <>
        <ul className="checkout-cart-items-list">
          {cart.map((item, index) => (
            <li key={item.id || index} className="checkout-cart-item">
              <span className="item-name">{item.name || "Sản phẩm không rõ"}</span>
              <span className="item-quantity">x{item.quantity || 0}</span>
              <span className="item-price">
                {formatCurrency((item.price || 0) * (item.quantity || 0))}
              </span>
            </li>
          ))}
        </ul>
        <p className="checkout-total-price">
          <strong>Tổng tiền:</strong> {formatCurrency(cartTotal)}
        </p>
      </>
    ) : (
      <div className="empty-cart-message">
        <h2>Giỏ hàng của bạn</h2>
        <p>Giỏ hàng của bạn đang trống.</p>
        <button
          className="back-to-shopping-button"
          onClick={() => navigate("/cart")}
          aria-label="Quay lại giỏ hàng"
        >
          Quay lại giỏ hàng
        </button>
      </div>
    )}
  </div>
));

// Component chọn địa chỉ đã lưu
const SavedAddressSelector = React.memo(({ addresses, selectedAddressId, onSelect, onToggleForm }) => (
  <div className="saved-addresses-selection">
    <h3>Chọn địa chỉ đã lưu:</h3>
    <ul className="address-options-list" role="listbox">
      {addresses.map((addr) => (
        <li key={addr.id} role="option" aria-selected={selectedAddressId === addr.id}>
          <input
            type="radio"
            id={`saved-address-${addr.id}`}
            name="shippingAddressOption"
            checked={selectedAddressId === addr.id}
            onChange={() => onSelect(addr.id)}
            aria-label={`Chọn địa chỉ: ${addr.name}, ${addr.phone}, ${addr.address}`}
          />
          <label htmlFor={`saved-address-${addr.id}`} className="address-option-label">
            <strong>{addr.name}</strong> - {addr.phone} - {addr.address}
          </label>
        </li>
      ))}
    </ul>
    <button
      className="toggle-address-form-button"
      onClick={() => onToggleForm(true)}
      aria-label="Nhập địa chỉ giao hàng mới"
    >
      Nhập địa chỉ mới
    </button>
    <hr />
  </div>
));

// Component form nhập địa chỉ mới
const ManualAddressForm = React.memo(
  ({ shippingInfo, onChange, onSubmit, onToggleForm, hasSavedAddresses }) => (
    <form className="manual-address-entry" onSubmit={onSubmit}>
      <h3>Nhập địa chỉ mới:</h3>
      {hasSavedAddresses && (
        <button
          type="button"
          className="toggle-address-form-button"
          onClick={() => onToggleForm(false)}
          aria-label="Quay lại chọn địa chỉ đã lưu"
        >
          ← Quay lại chọn địa chỉ đã lưu
        </button>
      )}
      <div className="form-group">
        <label htmlFor="manual-address-input">Địa chỉ:</label>
        <input
          type="text"
          id="manual-address-input"
          name="address"
          placeholder="Nhập địa chỉ chi tiết"
          value={shippingInfo.address}
          onChange={onChange}
          required
          aria-label="Nhập địa chỉ giao hàng"
        />
      </div>
      <div className="form-group">
        <label htmlFor="manual-name-input">Người nhận:</label>
        <input
          type="text"
          id="manual-name-input"
          name="name"
          placeholder="Tên người nhận"
          value={shippingInfo.name}
          onChange={onChange}
          required
          aria-label="Nhập tên người nhận"
        />
      </div>
      <div className="form-group">
        <label htmlFor="manual-phone-input">Điện thoại:</label>
        <input
          type="tel"
          id="manual-phone-input"
          name="phone"
          placeholder="Số điện thoại liên hệ"
          value={shippingInfo.phone}
          onChange={onChange}
          required
          aria-label="Nhập số điện thoại liên hệ"
        />
      </div>
      <button
        type="submit"
        className="place-order-button"
        disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone}
        aria-label="Xác nhận đặt hàng"
      >
        ✅ Đặt hàng
      </button>
    </form>
  )
);

// --- Component chính ---
const CheckoutPage = () => {
  // Lấy thông tin người dùng và giỏ hàng từ context
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const { cart, clearCart } = useContext(CartContext) || { cart: [], clearCart: () => {} };
  const navigate = useNavigate();

  // State quản lý thông tin giao hàng và trạng thái form
  const [state, setState] = useState({
    shippingInfo: { address: "", name: "", phone: "" },
    selectedSavedAddressId: null,
    showManualAddressForm: false,
    message: null,
  });

  const { shippingInfo, selectedSavedAddressId, showManualAddressForm, message } = state;
  
  // Tính toán tổng giá trị giỏ hàng
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);
  
  // Kiểm tra thông tin giao hàng hợp lệ
  const hasValidShippingInfo = shippingInfo.address && shippingInfo.name && shippingInfo.phone;

  // Khởi tạo EmailJS khi component mount
  useEffect(() => {
    initializeEmailJS();
  }, []);

  // Kiểm tra điều kiện và khởi tạo dữ liệu ban đầu
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setState((prev) => ({ ...prev, message: MESSAGES.LOGIN_REQUIRED }));
      return;
    }
    if (!cart?.length) {
      setState((prev) => ({ ...prev, message: MESSAGES.EMPTY_CART }));
      return;
    }
    if (user.addresses?.length) {
      const firstAddress = user.addresses[0];
      setState((prev) => ({
        ...prev,
        shippingInfo: firstAddress,
        selectedSavedAddressId: firstAddress.id,
        showManualAddressForm: false,
      }));
    } else {
      setState((prev) => ({ ...prev, showManualAddressForm: true }));
    }
  }, [user, isLoggedIn, cart]);


  // Xử lý khi chọn địa chỉ đã lưu
  const handleSelectSavedAddress = (addressId) => {
    const selectedAddr = user?.addresses?.find((addr) => addr.id === addressId);
    if (selectedAddr) {
      setState((prev) => ({
        ...prev,
        shippingInfo: selectedAddr,
        selectedSavedAddressId: addressId,
        showManualAddressForm: false,
        message: null,
      }));
    }
  };

  // Xử lý khi thay đổi thông tin địa chỉ mới
  const handleManualAddressChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, [name]: value },
      selectedSavedAddressId: null,
      message: null,
    }));
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault();

    // Kiểm tra thông tin giao hàng
    if (!hasValidShippingInfo) {
      setState((prev) => ({ ...prev, message: MESSAGES.INVALID_SHIPPING }));
      return;
    }

    // Kiểm tra email hợp lệ
    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      setState((prev) => ({ ...prev, message: MESSAGES.INVALID_EMAIL }));
      return;
    }

    // Tạo đơn hàng mới
    const newOrder = {
      id: Date.now(),
      username: user.username,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name || "Sản phẩm không rõ",
        price: item.price || 0,
        quantity: item.quantity || 0,
      })),
      totalPrice: cartTotal,
      shippingInfo: { ...shippingInfo },
      status: "Đang xử lý",
    };

    // Lưu đơn hàng vào localStorage
    const allOrders = readOrdersFromStorage();
    if (allOrders === null) {
      setState((prev) => ({ ...prev, message: MESSAGES.READ_ERROR }));
      return;
    }

    if (!saveOrdersToStorage([...allOrders, newOrder])) {
      setState((prev) => ({ ...prev, message: MESSAGES.SAVE_ERROR }));
      return;
    }

    // Gửi email xác nhận
    sendEmailConfirmation(newOrder, user, (msg) =>
      setState((prev) => ({ ...prev, message: msg }))
    );

    // Hiển thị thông báo thành công và chuyển hướng
    setState((prev) => ({ ...prev, message: MESSAGES.SUCCESS }));
    setTimeout(() => {
      clearCart();
      navigate("/orders");
    }, 3000);
  };

  // Chuyển đổi giữa form nhập địa chỉ mới và chọn địa chỉ đã lưu
  const toggleAddressForm = (showForm) => {
    setState((prev) => {
      const newState = { ...prev, showManualAddressForm: showForm, message: null };
      if (showForm) {
        newState.selectedSavedAddressId = null;
        newState.shippingInfo = { address: "", name: "", phone: "" };
      } else if (user?.addresses?.length) {
        const firstAddress = user.addresses[0];
        newState.shippingInfo = firstAddress;
        newState.selectedSavedAddressId = firstAddress.id;
      }
      return newState;
    });
  };

  // Render component
  if (!isLoggedIn || !user) {
    return (
      <div className="checkout-container">
        <h1 className="page-title">Thanh to?n</h1>
        <div className="message error">{MESSAGES.LOGIN_REQUIRED}</div>
        <Link to="/" className="back-to-home">??ng nh?p</Link>
      </div>
    );
  }

  if (!cart?.length) {
    return (
      <div className="checkout-container">
        <h1 className="page-title">Thanh to?n</h1>
        <div className="message error">{MESSAGES.EMPTY_CART}</div>
        <Link to="/cart" className="back-to-home">Quay l?i gi? h?ng</Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="page-title">Thanh toán</h1>
      {message && (
        <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </div>
      )}
      <OrderSummary cart={cart} cartTotal={cartTotal} navigate={navigate} />
      <div className="shipping-info-section">
        <h2>🚚 Thông tin giao hàng</h2>
        {isLoggedIn && user?.addresses?.length > 0 && (
          <SavedAddressSelector
            addresses={user.addresses}
            selectedAddressId={selectedSavedAddressId}
            onSelect={handleSelectSavedAddress}
            onToggleForm={toggleAddressForm}
          />
        )}
        {(showManualAddressForm || !user?.addresses?.length) && (
          <ManualAddressForm
            shippingInfo={shippingInfo}
            onChange={handleManualAddressChange}
            onSubmit={handlePlaceOrder}
            onToggleForm={toggleAddressForm}
            hasSavedAddresses={user?.addresses?.length > 0}
          />
        )}
        {!showManualAddressForm && user?.addresses?.length > 0 && (
          <button
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={!hasValidShippingInfo}
            aria-label="Xác nhận đặt hàng"
          >
            ✅ Đặt hàng
          </button>
        )}
        <div className="final-shipping-preview">
          <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
          {hasValidShippingInfo ? (
            <p className="shipping-details">
              <strong>{shippingInfo.name}</strong> - {shippingInfo.phone}
              <br />
              {shippingInfo.address}
            </p>
          ) : (
            <p className="shipping-placeholder">
              Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
