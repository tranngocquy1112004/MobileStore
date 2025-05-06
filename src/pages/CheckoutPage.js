import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import { CartContext } from "../pages/CartContext";
import "./CheckoutPage.css";

// --- CONSTANTS ---
const LOCAL_STORAGE_ORDERS_KEY = "orders";

// --- UTILITY FUNCTIONS ---
/**
 * Tính tổng tiền giỏ hàng
 * @param {Array} cart - Danh sách sản phẩm trong giỏ hàng
 * @returns {number} Tổng tiền
 */
const calculateCartTotal = (cart) =>
  Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) : 0;

/**
 * Đọc đơn hàng từ localStorage
 * @returns {Array} Danh sách đơn hàng
 */
const readOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Lỗi khi phân tích dữ liệu đơn hàng:", error);
    return [];
  }
};

/**
 * Lưu đơn hàng vào localStorage
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {boolean} Thành công hay thất bại
 */
const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu đơn hàng:", error);
    return false;
  }
};

// --- CHILD COMPONENTS ---
/**
 * Hiển thị tóm tắt đơn hàng
 * @param {Object} props - Props chứa cart và cartTotal
 */
const OrderSummary = React.memo(({ cart, cartTotal }) => (
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
                {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
              </span>
            </li>
          ))}
        </ul>
        <p className="checkout-total-price">
          <strong>Tổng tiền:</strong> {cartTotal.toLocaleString("vi-VN")} VNĐ
        </p>
      </>
    ) : (
      <p>Giỏ hàng trống.</p>
    )}
  </div>
));

/**
 * Hiển thị danh sách địa chỉ đã lưu
 * @param {Object} props - Props chứa addresses, selectedAddressId, onSelect, onToggleForm
 */
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
    <button className="toggle-address-form-button" onClick={() => onToggleForm(true)}>
      Nhập địa chỉ mới
    </button>
    <hr />
  </div>
));

/**
 * Form nhập địa chỉ thủ công
 * @param {Object} props - Props chứa shippingInfo, onChange, onSubmit, onToggleForm, hasSavedAddresses
 */
const ManualAddressForm = React.memo(({ shippingInfo, onChange, onSubmit, onToggleForm, hasSavedAddresses }) => (
  <form className="manual-address-entry" onSubmit={onSubmit}>
    <h3>Nhập địa chỉ mới:</h3>
    {hasSavedAddresses && (
      <button type="button" className="toggle-address-form-button" onClick={() => onToggleForm(false)}>
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
      />
    </div>
    <button
      type="submit"
      className="place-order-button"
      disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone}
    >
      ✅ Đặt hàng
    </button>
  </form>
));

// --- MAIN COMPONENT ---
/**
 * Trang thanh toán
 */
const CheckoutPage = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const { cart, clearCart } = useContext(CartContext) || { cart: [], clearCart: () => {} };
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({ address: "", name: "", phone: "" });
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
  const [showManualAddressForm, setShowManualAddressForm] = useState(false);
  const [message, setMessage] = useState(null);

  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  // Khởi tạo trang thanh toán
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setMessage("Vui lòng đăng nhập để thanh toán.");
      navigate("/");
      return;
    }
    if (!cart?.length) {
      setMessage("Giỏ hàng của bạn trống.");
      navigate("/cart");
      return;
    }
    if (user.addresses?.length) {
      const firstAddress = user.addresses[0];
      setShippingInfo(firstAddress);
      setSelectedSavedAddressId(firstAddress.id);
      setShowManualAddressForm(false);
    } else {
      setShowManualAddressForm(true);
    }
  }, [user, isLoggedIn, cart, navigate]);

  // Xử lý lựa chọn địa chỉ đã lưu
  const handleSelectSavedAddress = (addressId) => {
    const selectedAddr = user?.addresses?.find((addr) => addr.id === addressId);
    if (selectedAddr) {
      setShippingInfo(selectedAddr);
      setSelectedSavedAddressId(addressId);
      setShowManualAddressForm(false);
      setMessage(null);
    }
  };

  // Xử lý thay đổi form địa chỉ thủ công
  const handleManualAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    setSelectedSavedAddressId(null);
    setMessage(null);
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault();

    if (!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone) {
      setMessage("Vui lòng nhập đầy đủ thông tin giao hàng.");
      return;
    }

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

    const allOrders = readOrdersFromStorage();
    if (allOrders === null) {
      setMessage("Lỗi hệ thống khi đọc dữ liệu đơn hàng.");
      return;
    }

    if (!saveOrdersToStorage([...allOrders, newOrder])) {
      setMessage("Lỗi hệ thống khi lưu dữ liệu đơn hàng.");
      return;
    }

    clearCart();
    setMessage("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
    setTimeout(() => navigate("/orders"), 1500);
  };

  // Chuyển đổi giữa địa chỉ đã lưu và nhập thủ công
  const toggleAddressForm = (showForm) => {
    setShowManualAddressForm(showForm);
    if (showForm) {
      setSelectedSavedAddressId(null);
      setShippingInfo({ address: "", name: "", phone: "" });
    } else if (user?.addresses?.length) {
      const firstAddress = user.addresses[0];
      setShippingInfo(firstAddress);
      setSelectedSavedAddressId(firstAddress.id);
    }
    setMessage(null);
  };

  return (
    <div className="checkout-container">
      <h1 className="page-title">Thanh toán</h1>
      {message && (
        <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</div>
      )}
      <OrderSummary cart={cart} cartTotal={cartTotal} />
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
            disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone}
          >
            ✅ Đặt hàng
          </button>
        )}
        <div className="final-shipping-preview">
          <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
          {shippingInfo.address && shippingInfo.name && shippingInfo.phone ? (
            <p className="shipping-details">
              <strong>{shippingInfo.name}</strong> - {shippingInfo.phone}
              <br />
              {shippingInfo.address}
            </p>
          ) : (
            <p className="shipping-placeholder">Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;