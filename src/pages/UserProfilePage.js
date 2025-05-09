import React, { useReducer, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import OrderHistory from "./OrderHistory";
import "./UserProfilePage.css";

// --- Constants ---
const LOCAL_STORAGE_USERS_KEY = "users";
const MIN_PASSWORD_LENGTH = 6;

const MESSAGES = {
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
  PASSWORD_CHANGE_FAILED: "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.",
  PASSWORDS_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
  EMPTY_PASSWORD_FIELDS: "Vui lòng điền đầy đủ các trường mật khẩu.",
  PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ!",
  PASSWORD_TOO_SHORT: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`,
  PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
  PROFILE_UPDATE_FAILED: "Cập nhật thông tin thất bại. Vui lòng thử lại.",
  ADDRESS_SAVE_SUCCESS: "Lưu địa chỉ thành công!",
  ADDRESS_SAVE_FAILED: "Lưu địa chỉ thất bại. Vui lòng thử lại.",
  ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
  ADDRESS_EMPTY_FIELDS: "Vui lòng điền đủ thông tin địa chỉ, tên và số điện thoại.",
  SYSTEM_ERROR_READING_USERS: "Lỗi hệ thống, không thể đọc dữ liệu người dùng.",
  SYSTEM_ERROR_UPDATING_USERS: "Lỗi hệ thống, không thể lưu dữ liệu người dùng.",
  USER_NOT_FOUND: "Không tìm thấy thông tin người dùng hiện tại.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem trang hồ sơ.",
  INVALID_PROPS: "Dữ liệu đầu vào không hợp lệ.",
};

// --- Utilities ---

const readUsersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
    return null;
  }
};

const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
    return false;
  }
};

const validatePasswordChange = ({ oldPassword, newPassword, confirmNewPassword }, userPassword) => {
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return MESSAGES.EMPTY_PASSWORD_FIELDS;
  }
  if (newPassword !== confirmNewPassword) {
    return MESSAGES.PASSWORDS_NOT_MATCH;
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return MESSAGES.PASSWORD_TOO_SHORT;
  }
  if (newPassword === oldPassword) {
    return MESSAGES.PASSWORD_SAME_AS_OLD;
  }
  if (userPassword !== oldPassword) {
    return MESSAGES.PASSWORD_CHANGE_FAILED;
  }
  return null;
};

const validateAddress = ({ address, name, phone }) => {
  if (!address?.trim() || !name?.trim() || !phone?.trim()) {
    return MESSAGES.ADDRESS_EMPTY_FIELDS;
  }
  return null;
};

// --- State Management ---

const initialState = {
  activeSection: "profile",
  profile: { username: "", email: "", phone: "", message: "" },
  password: { oldPassword: "", newPassword: "", confirmNewPassword: "", message: "" },
  address: { addresses: [], newAddress: { address: "", name: "", phone: "" }, message: "" },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "UPDATE_PASSWORD":
      return { ...state, password: { ...state.password, ...action.payload } };
    case "UPDATE_ADDRESS":
      return { ...state, address: { ...state.address, ...action.payload } };
    case "RESET_ADDRESS_FORM":
      return {
        ...state,
        address: { ...state.address, newAddress: { address: "", name: "", phone: "" }, message: action.payload.message },
      };
    default:
      return state;
  }
};

// --- Child Components ---

const ProfileForm = ({ formData, onChange, onSubmit, message }) => {
  if (!formData || !onChange || !onSubmit) {
    console.error("Invalid props in ProfileForm");
    return <p>{MESSAGES.INVALID_PROPS}</p>;
  }

  return (
    <section className="profile-info-section">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={onSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="profile-username">Tên đăng nhập:</label>
          <input
            type="text"
            id="profile-username"
            name="username"
            value={formData.username}
            className="profile-input"
            disabled
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Email:</label>
          <input
            type="email"
            id="profile-email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="profile-input"
            aria-label="Nhập email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-phone">Số điện thoại:</label>
          <input
            type="tel"
            id="profile-phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="profile-input"
            aria-label="Nhập số điện thoại"
          />
        </div>
        <button type="submit" className="profile-update-button">
          Cập nhật thông tin
        </button>
      </form>
      {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</p>}
    </section>
  );
};

const PasswordForm = ({ formData, onChange, onSubmit, message }) => {
  if (!formData || !onChange || !onSubmit) {
    console.error("Invalid props in PasswordForm");
    return <p>{MESSAGES.INVALID_PROPS}</p>;
  }

  return (
    <section className="change-password-section">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={onSubmit} className="password-form">
        <div className="form-group">
          <label htmlFor="oldPassword">Mật khẩu cũ:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={onChange}
            className="password-input"
            required
            autoComplete="current-password"
            aria-label="Nhập mật khẩu cũ"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={onChange}
            className="password-input"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            aria-label="Nhập mật khẩu mới"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={onChange}
            className="password-input"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            aria-label="Xác nhận mật khẩu mới"
          />
        </div>
        <button type="submit" className="change-password-button">
          Đổi mật khẩu
        </button>
      </form>
      {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</p>}
    </section>
  );
};

const AddressForm = ({ addresses, newAddressFormData, onChange, onAddAddress, onDeleteAddress, message }) => {
  if (!Array.isArray(addresses) || !newAddressFormData || !onChange || !onAddAddress || !onDeleteAddress) {
    console.error("Invalid props in AddressForm");
    return <p>{MESSAGES.INVALID_PROPS}</p>;
  }

  return (
    <section className="addresses-section">
      <h2>Địa chỉ giao hàng</h2>
      <h3>Thêm địa chỉ mới</h3>
      <form onSubmit={onAddAddress} className="address-form">
        <div className="form-group">
          <label htmlFor="new-address-address">Địa chỉ:</label>
          <input
            type="text"
            id="new-address-address"
            name="address"
            placeholder="Nhập địa chỉ chi tiết"
            value={newAddressFormData.address}
            onChange={onChange}
            required
            aria-label="Nhập địa chỉ giao hàng"
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-address-name">Người nhận:</label>
          <input
            type="text"
            id="new-address-name"
            name="name"
            placeholder="Tên người nhận"
            value={newAddressFormData.name}
            onChange={onChange}
            required
            aria-label="Nhập tên người nhận"
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-address-phone">Điện thoại:</label>
          <input
            type="tel"
            id="new-address-phone"
            name="phone"
            placeholder="Số điện thoại liên hệ"
            value={newAddressFormData.phone}
            onChange={onChange}
            required
            aria-label="Nhập số điện thoại liên hệ"
          />
        </div>
        <button type="submit">Lưu địa chỉ mới</button>
      </form>
      {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</p>}
      <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3>
      {addresses.length === 0 ? (
        <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
      ) : (
        <ul className="address-list" role="list">
          {addresses.map((addr) => (
            <li key={addr.id} className="address-item">
              <p>
                <strong>Địa chỉ:</strong> {addr.address || "N/A"}
              </p>
              <p>
                <strong>Người nhận:</strong> {addr.name || "N/A"}
              </p>
              <p>
                <strong>Điện thoại:</strong> {addr.phone || "N/A"}
              </p>
              <button
                className="delete-address-button"
                onClick={() => onDeleteAddress(addr.id)}
                aria-label={`Xóa địa chỉ ${addr.address}`}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

// --- Main Component ---

const UserProfilePage = () => {
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Validate user
  const isValidUser = user?.username && (Array.isArray(user.addresses) || user.addresses === undefined);

  // Initialize user data
  useEffect(() => {
    if (!isLoggedIn || !isValidUser) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    dispatch({
      type: "UPDATE_PROFILE",
      payload: { username: user.username, email: user.email || "", phone: user.phone || "" },
    });
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: { addresses: user.addresses || [] },
    });
  }, [isLoggedIn, navigate, user]);

  // Handle input changes
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    dispatch({
      type: formType === "profile" ? "UPDATE_PROFILE" : formType === "password" ? "UPDATE_PASSWORD" : "UPDATE_ADDRESS",
      payload:
        formType === "address"
          ? { newAddress: { ...state.address.newAddress, [name]: value }, message: "" }
          : { [name]: value, message: "" },
    });
  };

  // Update user in storage
  const updateUserInStorage = (updatedUserData) => {
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null || !user?.username) {
      return { success: false, message: storedUsers === null ? MESSAGES.SYSTEM_ERROR_READING_USERS : MESSAGES.USER_NOT_FOUND };
    }

    const userIndex = storedUsers.findIndex((u) => u.username === user.username);
    if (userIndex === -1) {
      return { success: false, message: MESSAGES.USER_NOT_FOUND };
    }

    storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedUserData };
    const success = saveUsersToStorage(storedUsers);
    if (success) {
      login({ ...user, ...updatedUserData });
    }
    return { success, message: success ? "" : MESSAGES.SYSTEM_ERROR_UPDATING_USERS };
  };

  // Handle profile update
  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault();
    const updatedData = { email: state.profile.email.trim(), phone: state.profile.phone.trim() };
    const { success, message } = updateUserInStorage(updatedData);
    dispatch({
      type: "UPDATE_PROFILE",
      payload: { message: success ? MESSAGES.PROFILE_UPDATE_SUCCESS : message || MESSAGES.PROFILE_UPDATE_FAILED },
    });
  };

  // Handle password change
  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: MESSAGES.SYSTEM_ERROR_READING_USERS } });
      return;
    }

    const userIndex = storedUsers.findIndex((u) => u.username === user.username);
    if (userIndex === -1) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: MESSAGES.USER_NOT_FOUND } });
      return;
    }

    const error = validatePasswordChange(state.password, storedUsers[userIndex].password);
    if (error) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: error } });
      return;
    }

    const { success, message } = updateUserInStorage({ password: state.password.newPassword });
    if (success) {
      dispatch({
        type: "UPDATE_PASSWORD",
        payload: {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          message: MESSAGES.PASSWORD_CHANGE_SUCCESS,
        },
      });
      setTimeout(logout, 2000);
    } else {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: message || MESSAGES.SYSTEM_ERROR_UPDATING_USERS } });
    }
  };

  // Handle add address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const error = validateAddress(state.address.newAddress);
    if (error) {
      dispatch({ type: "UPDATE_ADDRESS", payload: { message: error } });
      return;
    }

    const newAddress = {
      id: Date.now(),
      address: state.address.newAddress.address.trim(),
      name: state.address.newAddress.name.trim(),
      phone: state.address.newAddress.phone.trim(),
    };
    const updatedAddresses = [...state.address.addresses, newAddress];
    const { success, message } = updateUserInStorage({ addresses: updatedAddresses });
    dispatch({
      type: success ? "RESET_ADDRESS_FORM" : "UPDATE_ADDRESS",
      payload: {
        addresses: success ? updatedAddresses : state.address.addresses,
        message: success ? MESSAGES.ADDRESS_SAVE_SUCCESS : message || MESSAGES.ADDRESS_SAVE_FAILED,
      },
    });
  };

  // Handle delete address
  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== addressId);
    const { success, message } = updateUserInStorage({ addresses: updatedAddresses });
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: {
        addresses: success ? updatedAddresses : state.address.addresses,
        message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : message || MESSAGES.SYSTEM_ERROR_UPDATING_USERS,
      },
    });
  };

  if (!isLoggedIn || !isValidUser) return null;

  const sections = [
    { id: "profile", label: "Thông tin cá nhân" },
    { id: "password", label: "Đổi mật khẩu" },
    { id: "addresses", label: "Địa chỉ giao hàng" },
    { id: "orders", label: "Lịch sử đơn hàng" },
  ];

  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>
      <nav className="profile-sections-menu">
        {sections.map((section) => (
          <button
            key={section.id}
            className={state.activeSection === section.id ? "active" : ""}
            onClick={() => dispatch({ type: "SET_ACTIVE_SECTION", payload: section.id })}
            aria-label={`Xem ${section.label.toLowerCase()}`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {state.activeSection === "profile" && (
        <ProfileForm
          formData={state.profile}
          onChange={(e) => handleInputChange(e, "profile")}
          onSubmit={handleSubmitProfileUpdate}
          message={state.profile.message}
        />
      )}
      {state.activeSection === "password" && (
        <PasswordForm
          formData={state.password}
          onChange={(e) => handleInputChange(e, "password")}
          onSubmit={handleSubmitPasswordChange}
          message={state.password.message}
        />
      )}
      {state.activeSection === "addresses" && (
        <AddressForm
          addresses={state.address.addresses}
          newAddressFormData={state.address.newAddress}
          onChange={(e) => handleInputChange(e, "address")}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          message={state.address.message}
        />
      )}
      {state.activeSection === "orders" && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory />
        </section>
      )}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

export default UserProfilePage;