import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { AuthContext } from "../account/AuthContext";
import { CartContext } from "../pages/CartContext";
import "./CheckoutPage.css";

// --- HẰNG SỐ ---
// Định nghĩa các khóa và thông báo cố định
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Khóa dùng để lưu đơn hàng trong localStorage
const MESSAGES = {
  SUCCESS: "Chúng tôi đã gửi Email xác nhận đơn hàng của bạn, vui lòng kiểm tra Email.",
  EMPTY_CART: "Giỏ hàng của bạn đang trống.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để thanh toán.",
  INVALID_SHIPPING: "Vui lòng nhập đầy đủ thông tin giao hàng.",
  SAVE_ERROR: "Lỗi hệ thống khi lưu dữ liệu đơn hàng.",
  READ_ERROR: "Lỗi hệ thống khi đọc dữ liệu đơn hàng.",
};

// --- HÀM TIỆN ÍCH ---

/**
 * Tính tổng tiền giỏ hàng
 * @param {Array} cart - Danh sách sản phẩm trong giỏ hàng
 * @returns {number} Tổng tiền của giỏ hàng
 */
const calculateCartTotal = (cart) => {
  if (!Array.isArray(cart)) return 0; // Trả về 0 nếu giỏ hàng không hợp lệ
  return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0); // Tính tổng tiền
};

/**
 * Đọc danh sách đơn hàng từ localStorage
 * @returns {Array} Danh sách đơn hàng hoặc mảng rỗng nếu lỗi
 */
const readOrdersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY); // Lấy dữ liệu từ localStorage
    return storedData ? JSON.parse(storedData) : []; // Parse dữ liệu hoặc trả về mảng rỗng
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu đơn hàng:", error); // Ghi log lỗi
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

/**
 * Lưu danh sách đơn hàng vào localStorage
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {boolean} True nếu lưu thành công, false nếu thất bại
 */
const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders)); // Lưu dữ liệu vào localStorage
    return true; // Trả về true nếu thành công
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu đơn hàng:", error); // Ghi log lỗi
    return false; // Trả về false nếu thất bại
  }
};

/**
 * Khởi tạo EmailJS với Public Key
 */
const initializeEmailJS = () => {
  try {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY); // Khởi tạo EmailJS
    console.log("EmailJS khởi tạo với Public Key:", process.env.REACT_APP_EMAILJS_PUBLIC_KEY); // Ghi log khởi tạo
  } catch (error) {
    console.error("Lỗi khởi tạo EmailJS:", error); // Ghi log lỗi
  }
};

/**
 * Gửi email xác nhận đơn hàng qua EmailJS
 * @param {Object} order - Thông tin đơn hàng
 * @param {Object} user - Thông tin người dùng
 * @param {Function} setMessage - Hàm cập nhật thông báo
 */
const sendEmailConfirmation = (order, user, setMessage) => {
  const templateParams = {
    order_id: order.id, // Mã đơn hàng
    user_name: order.shippingInfo.name, // Tên người nhận
    user_email: user.email, // Email người dùng
    email: user.email, // Email nhận xác nhận
    order_total: order.totalPrice.toLocaleString("vi-VN"), // Tổng tiền
    order_date: new Date(order.date).toLocaleString("vi-VN"), // Ngày đặt hàng
    items: order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "), // Danh sách sản phẩm
  };
  console.log("Gửi email xác nhận với thông số:", templateParams); // Ghi log thông số email

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      () => {
        console.log("Email xác nhận gửi thành công."); // Ghi log thành công
      },
      (error) => {
        console.error("Lỗi gửi email:", error); // Ghi log lỗi
        setMessage("Đặt hàng thành công nhưng không gửi được email xác nhận."); // Cập nhật thông báo lỗi
      }
    );
};

// --- THÀNH PHẦN CON ---

/**
 * Hiển thị tóm tắt đơn hàng
 * @param {Object} props - Props chứa giỏ hàng và tổng tiền
 * @returns {JSX.Element} JSX hiển thị tóm tắt đơn hàng
 */
const OrderSummary = React.memo(({ cart, cartTotal }) => (
  <div className="order-summary-section">
    <h2>📋 Thông tin đơn hàng</h2> {/* Tiêu đề phần tóm tắt đơn hàng */}
    {cart?.length > 0 ? (
      <>
        <ul className="checkout-cart-items-list">
          {cart.map((item, index) => (
            <li key={item.id || index} className="checkout-cart-item">
              <span className="item-name">{item.name || "Sản phẩm không rõ"}</span> {/* Tên sản phẩm */}
              <span className="item-quantity">x{item.quantity || 0}</span> {/* Số lượng sản phẩm */}
              <span className="item-price">
                {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ {/* Tổng giá sản phẩm */}
              </span>
            </li>
          ))}
        </ul>
        <p className="checkout-total-price">
          <strong>Tổng tiền:</strong> {cartTotal.toLocaleString("vi-VN")} VNĐ {/* Tổng tiền giỏ hàng */}
        </p>
      </>
    ) : (
      <div className="empty-cart-message">
        <h2>Giỏ hàng của bạn</h2> {/* Tiêu đề giỏ hàng trống */}
        <p>Giỏ hàng của bạn đang trống.</p> {/* Thông báo giỏ hàng trống */}
        <button
          className="back-to-shopping-button"
          onClick={() => navigate("/cart")}
          aria-label="Quay lại giỏ hàng"
        >
          Quay lại giỏ hàng {/* Nút quay lại giỏ hàng */}
        </button>
      </div>
    )}
  </div>
));

/**
 * Hiển thị danh sách địa chỉ đã lưu
 * @param {Object} props - Props chứa danh sách địa chỉ, ID địa chỉ đã chọn, và các hàm xử lý
 * @returns {JSX.Element} JSX hiển thị bộ chọn địa chỉ
 */
const SavedAddressSelector = React.memo(({ addresses, selectedAddressId, onSelect, onToggleForm }) => (
  <div className="saved-addresses-selection">
    <h3>Chọn địa chỉ đã lưu:</h3> {/* Tiêu đề bộ chọn địa chỉ */}
    <ul className="address-options-list" role="listbox">
      {addresses.map((addr) => (
        <li key={addr.id} role="option" aria-selected={selectedAddressId === addr.id}>
          <input
            type="radio"
            id={`saved-address-${addr.id}`}
            name="shippingAddressOption"
            checked={selectedAddressId === addr.id}
            onChange={() => onSelect(addr.id)} // Xử lý chọn địa chỉ
            aria-label={`Chọn địa chỉ: ${addr.name}, ${addr.phone}, ${addr.address}`} // Hỗ trợ trợ năng
          />
          <label htmlFor={`saved-address-${addr.id}`} className="address-option-label">
            <strong>{addr.name}</strong> - {addr.phone} - {addr.address} {/* Thông tin địa chỉ */}
          </label>
        </li>
      ))}
    </ul>
    <button
      className="toggle-address-form-button"
      onClick={() => onToggleForm(true)}
      aria-label="Nhập địa chỉ giao hàng mới"
    >
      Nhập địa chỉ mới {/* Nút chuyển sang form nhập địa chỉ mới */}
    </button>
    <hr /> {/* Đường phân cách */}
  </div>
));

/**
 * Form nhập địa chỉ giao hàng thủ công
 * @param {Object} props - Props chứa thông tin giao hàng, các hàm xử lý, và trạng thái địa chỉ đã lưu
 * @returns {JSX.Element} JSX hiển thị form nhập địa chỉ
 */
const ManualAddressForm = React.memo(
  ({ shippingInfo, onChange, onSubmit, onToggleForm, hasSavedAddresses }) => (
    <form className="manual-address-entry" onSubmit={onSubmit}>
      <h3>Nhập địa chỉ mới:</h3> {/* Tiêu đề form nhập địa chỉ */}
      {hasSavedAddresses && (
        <button
          type="button"
          className="toggle-address-form-button"
          onClick={() => onToggleForm(false)}
          aria-label="Quay lại chọn địa chỉ đã lưu"
        >
          ← Quay lại chọn địa chỉ đã lưu {/* Nút quay lại danh sách địa chỉ đã lưu */}
        </button>
      )}
      <div className="form-group">
        <label htmlFor="manual-address-input">Địa chỉ:</label> {/* Nhãn trường địa chỉ */}
        <input
          type="text"
          id="manual-address-input"
          name="address"
          placeholder="Nhập địa chỉ chi tiết"
          value={shippingInfo.address}
          onChange={onChange} // Xử lý thay đổi giá trị
          required // Trường bắt buộc
          aria-label="Nhập địa chỉ giao hàng"
        />
      </div>
      <div className="form-group">
        <label htmlFor="manual-name-input">Người nhận:</label> {/* Nhãn trường tên người nhận */}
        <input
          type="text"
          id="manual-name-input"
          name="name"
          placeholder="Tên người nhận"
          value={shippingInfo.name}
          onChange={onChange} // Xử lý thay đổi giá trị
          required // Trường bắt buộc
          aria-label="Nhập tên người nhận"
        />
      </div>
      <div className="form-group">
        <label htmlFor="manual-phone-input">Điện thoại:</label> {/* Nhãn trường số điện thoại */}
        <input
          type="tel"
          id="manual-phone-input"
          name="phone"
          placeholder="Số điện thoại liên hệ"
          value={shippingInfo.phone}
          onChange={onChange} // Xử lý thay đổi giá trị
          required // Trường bắt buộc
          aria-label="Nhập số điện thoại liên hệ"
        />
      </div>
      <button
        type="submit"
        className="place-order-button"
        disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone}
        aria-label="Xác nhận đặt hàng"
      >
        ✅ Đặt hàng {/* Nút xác nhận đặt hàng */}
      </button>
    </form>
  )
);

// --- THÀNH PHẦN CHÍNH ---

/**
 * Trang thanh toán
 * @returns {JSX.Element} JSX hiển thị trang thanh toán
 */
const CheckoutPage = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
  }; // Lấy thông tin người dùng từ AuthContext
  const { cart, clearCart } = useContext(CartContext) || {
    cart: [],
    clearCart: () => {},
  }; // Lấy giỏ hàng và hàm xóa giỏ hàng từ CartContext
  const navigate = useNavigate(); // Hook để điều hướng trang

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    name: "",
    phone: "",
  }); // Lưu thông tin giao hàng
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null); // ID địa chỉ đã lưu được chọn
  const [showManualAddressForm, setShowManualAddressForm] = useState(false); // Trạng thái hiển thị form nhập địa chỉ
  const [message, setMessage] = useState(null); // Thông báo trạng thái

  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]); // Tính tổng tiền giỏ hàng (memoized)

  // Khởi tạo EmailJS khi component mount
  useEffect(() => {
    initializeEmailJS(); // Khởi tạo EmailJS
    console.log("Biến môi trường:", {
      serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
    }); // Ghi log biến môi trường
  }, []);

  // Khởi tạo trạng thái ban đầu
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setMessage(MESSAGES.LOGIN_REQUIRED); // Thông báo yêu cầu đăng nhập
      navigate("/"); // Điều hướng về trang chủ
      return;
    }
    if (!cart?.length) {
      setMessage(MESSAGES.EMPTY_CART); // Thông báo giỏ hàng rỗng
      navigate("/cart"); // Điều hướng về trang giỏ hàng
      return;
    }
    if (user.addresses?.length) {
      const firstAddress = user.addresses[0]; // Lấy địa chỉ đầu tiên
      setShippingInfo(firstAddress); // Cập nhật thông tin giao hàng
      setSelectedSavedAddressId(firstAddress.id); // Chọn địa chỉ đầu tiên
      setShowManualAddressForm(false); // Ẩn form nhập địa chỉ
    } else {
      setShowManualAddressForm(true); // Hiển thị form nhập địa chỉ nếu không có địa chỉ đã lưu
    }
  }, [user, isLoggedIn, cart, navigate]);

  // Xử lý chọn địa chỉ đã lưu
  const handleSelectSavedAddress = (addressId) => {
    const selectedAddr = user?.addresses?.find((addr) => addr.id === addressId); // Tìm địa chỉ theo ID
    if (selectedAddr) {
      setShippingInfo(selectedAddr); // Cập nhật thông tin giao hàng
      setSelectedSavedAddressId(addressId); // Cập nhật ID địa chỉ đã chọn
      setShowManualAddressForm(false); // Ẩn form nhập địa chỉ
      setMessage(null); // Xóa thông báo
    }
  };

  // Xử lý thay đổi giá trị trong form nhập địa chỉ
  const handleManualAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value })); // Cập nhật thông tin giao hàng
    setSelectedSavedAddressId(null); // Bỏ chọn địa chỉ đã lưu
    setMessage(null); // Xóa thông báo
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault(); // Ngăn hành vi mặc định của form

    // Kiểm tra thông tin giao hàng
    if (!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone) {
      setMessage(MESSAGES.INVALID_SHIPPING); // Thông báo lỗi
      return;
    }

    // Kiểm tra email người dùng
    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      setMessage("Email người dùng không hợp lệ. Vui lòng cập nhật email trong hồ sơ."); // Thông báo lỗi email
      return;
    }

    // Tạo đơn hàng mới
    const newOrder = {
      id: Date.now(), // Tạo ID duy nhất dựa trên thời gian
      username: user.username, // Tên người dùng
      date: new Date().toISOString(), // Ngày đặt hàng
      items: cart.map((item) => ({
        id: item.id,
        name: item.name || "Sản phẩm không rõ",
        price: item.price || 0,
        quantity: item.quantity || 0,
      })), // Danh sách sản phẩm
      totalPrice: cartTotal, // Tổng tiền
      shippingInfo: { ...shippingInfo }, // Thông tin giao hàng
      status: "Đang xử lý", // Trạng thái đơn hàng
    };

    const allOrders = readOrdersFromStorage(); // Đọc danh sách đơn hàng hiện tại
    if (allOrders === null) {
      setMessage(MESSAGES.READ_ERROR); // Thông báo lỗi đọc dữ liệu
      return;
    }

    if (!saveOrdersToStorage([...allOrders, newOrder])) {
      setMessage(MESSAGES.SAVE_ERROR); // Thông báo lỗi lưu dữ liệu
      return;
    }

    // Gửi email xác nhận
    sendEmailConfirmation(newOrder, user, setMessage);

    // Hiển thị thông báo thành công trong 3 giây trước khi clear giỏ hàng và điều hướng
    setMessage(MESSAGES.SUCCESS);
    setTimeout(() => {
      clearCart(); // Xóa giỏ hàng sau 3 giây
      navigate("/orders"); // Điều hướng đến trang đơn hàng
    }, 3000);
  };

  // Chuyển đổi giữa form nhập địa chỉ và danh sách địa chỉ đã lưu
  const toggleAddressForm = (showForm) => {
    setShowManualAddressForm(showForm); // Cập nhật trạng thái hiển thị form
    if (showForm) {
      setSelectedSavedAddressId(null); // Bỏ chọn địa chỉ đã lưu
      setShippingInfo({ address: "", name: "", phone: "" }); // Xóa thông tin giao hàng
    } else if (user?.addresses?.length) {
      const firstAddress = user.addresses[0]; // Lấy địa chỉ đầu tiên
      setShippingInfo(firstAddress); // Cập nhật thông tin giao hàng
      setSelectedSavedAddressId(firstAddress.id); // Chọn địa chỉ đầu tiên
    }
    setMessage(null); // Xóa thông báo
  };

  return (
    <div className="checkout-container">
      <h1 className="page-title">Thanh toán</h1> {/* Tiêu đề trang */}
      {message && (
        <div
          className={`message ${message.includes("thành công") ? "success" : "error"}`}
        >
          {message} {/* Hiển thị thông báo trạng thái */}
        </div>
      )}
      <OrderSummary cart={cart} cartTotal={cartTotal} /> {/* Hiển thị tóm tắt đơn hàng */}
      <div className="shipping-info-section">
        <h2>🚚 Thông tin giao hàng</h2> {/* Tiêu đề phần thông tin giao hàng */}
        {isLoggedIn && user?.addresses?.length > 0 && (
          <SavedAddressSelector
            addresses={user.addresses}
            selectedAddressId={selectedSavedAddressId}
            onSelect={handleSelectSavedAddress}
            onToggleForm={toggleAddressForm}
          /> // Hiển thị bộ chọn địa chỉ đã lưu
        )}
        {(showManualAddressForm || !user?.addresses?.length) && (
          <ManualAddressForm
            shippingInfo={shippingInfo}
            onChange={handleManualAddressChange}
            onSubmit={handlePlaceOrder}
            onToggleForm={toggleAddressForm}
            hasSavedAddresses={user?.addresses?.length > 0}
          /> // Hiển thị form nhập địa chỉ
        )}
        {!showManualAddressForm && user?.addresses?.length > 0 && (
          <button
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone}
            aria-label="Xác nhận đặt hàng"
          >
            ✅ Đặt hàng {/* Nút đặt hàng khi chọn địa chỉ đã lưu */}
          </button>
        )}
        <div className="final-shipping-preview">
          <h3>Địa chỉ sẽ dùng để giao hàng:</h3> {/* Tiêu đề xem trước địa chỉ */}
          {shippingInfo.address && shippingInfo.name && shippingInfo.phone ? (
            <p className="shipping-details">
              <strong>{shippingInfo.name}</strong> - {shippingInfo.phone}
              <br />
              {shippingInfo.address} {/* Hiển thị thông tin địa chỉ */}
            </p>
          ) : (
            <p className="shipping-placeholder">
              Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên. {/* Thông báo khi chưa có địa chỉ */}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; // Xuất thành phần chính