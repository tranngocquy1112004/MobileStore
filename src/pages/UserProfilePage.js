import React, { useReducer, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import OrderHistory from "./OrderHistory";
import "./UserProfilePage.css";

// --- Hằng số ---
const CONSTANTS = {
  LOCAL_STORAGE_USERS_KEY: "users",
  MIN_PASSWORD_LENGTH: 6,
  MESSAGES: {
    PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
    PASSWORD_CHANGE_FAILED: "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.",
    PASSWORDS_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
    EMPTY_PASSWORD_FIELDS: "Vui lòng điền đầy đủ các trường mật khẩu.",
    PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ!",
    PASSWORD_TOO_SHORT: `Mật khẩu mới phải có ít nhất 6 ký tự!`,
    PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
    PROFILE_UPDATE_FAILED: "Cập nhật thông tin thất bại. Vui lòng thử lại.",
    ADDRESS_SAVE_SUCCESS: "Lưu địa chỉ thành công!",
    ADDRESS_SAVE_FAILED: "Lưu địa chỉ thất bại. Vui lòng thử lại.",
    ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
    ADDRESS_EMPTY_FIELDS: "Vui lòng điền đủ thông tin địa chỉ, tên và số điện thoại.",
    SYSTEM_ERROR: "Lỗi hệ thống. Vui lòng thử lại sau.",
    USER_NOT_FOUND: "Không tìm thấy thông tin người dùng.",
    LOGIN_REQUIRED: "Vui lòng đăng nhập để xem trang hồ sơ.",
  },
};

// --- Tiện ích ---

// Đọc dữ liệu người dùng từ localStorage
const readUsers = () => {
  try {
    const data = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Lỗi đọc localStorage:", error);
    return null;
  }
};

// Lưu dữ liệu người dùng vào localStorage
const saveUsers = (users) => {
  try {
    localStorage.setItem(CONSTANTS.LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Lỗi lưu localStorage:", error);
    return false;
  }
};

// Cập nhật thông tin người dùng trong localStorage
const updateUserData = (username, updatedData, login) => {
  const users = readUsers();
  if (!users) return { success: false, message: CONSTANTS.MESSAGES.SYSTEM_ERROR };

  const userIndex = users.findIndex((u) => u.username === username);
  if (userIndex === -1) return { success: false, message: CONSTANTS.MESSAGES.USER_NOT_FOUND };

  users[userIndex] = { ...users[userIndex], ...updatedData };
  const success = saveUsers(users);
  if (success) login({ ...users[userIndex] });
  return { success, message: success ? "" : CONSTANTS.MESSAGES.SYSTEM_ERROR };
};

// Kiểm tra thông tin mật khẩu
const validatePassword = ({ oldPassword, newPassword, confirmNewPassword }, currentPassword) => {
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return CONSTANTS.MESSAGES.EMPTY_PASSWORD_FIELDS;
  }
  if (newPassword !== confirmNewPassword) {
    return CONSTANTS.MESSAGES.PASSWORDS_NOT_MATCH;
  }
  if (newPassword.length < CONSTANTS.MIN_PASSWORD_LENGTH) {
    return CONSTANTS.MESSAGES.PASSWORD_TOO_SHORT;
  }
  if (newPassword === oldPassword) {
    return CONSTANTS.MESSAGES.PASSWORD_SAME_AS_OLD;
  }
  if (currentPassword !== oldPassword) {
    return CONSTANTS.MESSAGES.PASSWORD_CHANGE_FAILED;
  }
  return null;
};

// Kiểm tra thông tin địa chỉ
const validateAddress = ({ address, name, phone }) => {
  if (!address?.trim() || !name?.trim() || !phone?.trim()) {
    return CONSTANTS.MESSAGES.ADDRESS_EMPTY_FIELDS;
  }
  return null;
};

// --- Quản lý state ---

const initialState = {
  activeSection: "profile",
  profile: { username: "", email: "", phone: "", message: "" },
  password: { oldPassword: "", newPassword: "", confirmNewPassword: "", message: "" },
  address: { addresses: [], newAddress: { address: "", name: "", phone: "" }, message: "" },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SECTION":
      return { ...state, activeSection: action.payload };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "UPDATE_PASSWORD":
      return { ...state, password: { ...state.password, ...action.payload } };
    case "UPDATE_ADDRESS":
      return { ...state, address: { ...state.address, ...action.payload } };
    case "RESET_ADDRESS":
      return { ...state, address: { ...state.address, newAddress: { address: "", name: "", phone: "" }, message: action.payload } };
    default:
      return state;
  }
};

// --- Component con ---

const ProfileForm = ({ formData, onChange, onSubmit, message }) => {
  return (
    <section className="profile-section">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={onSubmit} className="form">
        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            className="form-input"
            disabled
            readOnly
            aria-label="Tên đăng nhập (không thể chỉnh sửa)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="form-input"
            aria-label="Nhập email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="form-input"
            aria-label="Nhập số điện thoại"
          />
        </div>
        <button type="submit" className="form-button" aria-label="Cập nhật thông tin cá nhân">
          Cập nhật
        </button>
      </form>
      {message && (
        <p className={`form-message ${message.includes("thành công") ? "success" : "error"}`} role="alert">
          {message}
        </p>
      )}
    </section>
  );
};

const PasswordForm = ({ formData, onChange, onSubmit, message }) => {
  return (
    <section className="password-section">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={onSubmit} className="form">
        <div className="form-group">
          <label htmlFor="oldPassword">Mật khẩu cũ:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={onChange}
            className="form-input"
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
            className="form-input"
            required
            autoComplete="new-password"
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
            className="form-input"
            required
            autoComplete="new-password"
            aria-label="Xác nhận mật khẩu mới"
          />
        </div>
        <button type="submit" className="form-button" aria-label="Đổi mật khẩu">
          Đổi mật khẩu
        </button>
      </form>
      {message && (
        <p className={`form-message ${message.includes("thành công") ? "success" : "error"}`} role="alert">
          {message}
        </p>
      )}
    </section>
  );
};

const AddressForm = ({ addresses, newAddress, onChange, onAdd, onDelete, message }) => {
  return (
    <section className="address-section">
      <h2>Địa chỉ giao hàng</h2>
      <h3>Thêm địa chỉ mới</h3>
      <form onSubmit={onAdd} className="form">
        <div className="form-group">
          <label htmlFor="address">Địa chỉ:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={newAddress.address}
            onChange={onChange}
            className="form-input"
            required
            aria-label="Nhập địa chỉ giao hàng"
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Người nhận:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newAddress.name}
            onChange={onChange}
            className="form-input"
            required
            aria-label="Nhập tên người nhận"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={newAddress.phone}
            onChange={onChange}
            className="form-input"
            required
            aria-label="Nhập số điện thoại liên hệ"
          />
        </div>
        <button type="submit" className="form-button" aria-label="Lưu địa chỉ mới">
          Lưu địa chỉ
        </button>
      </form>
      {message && (
        <p className={`form-message ${message.includes("thành công") ? "success" : "error"}`} role="alert">
          {message}
        </p>
      )}
      <h3>Danh sách địa chỉ ({addresses.length})</h3>
      {addresses.length === 0 ? (
        <p className="empty-state">Chưa có địa chỉ nào.</p>
      ) : (
        <ul className="address-list" role="list">
          {addresses.map((addr) => (
            <li key={addr.id} className="address-item">
              <p>
                <strong>Địa chỉ:</strong> {addr.address}
              </p>
              <p>
                <strong>Người nhận:</strong> {addr.name}
              </p>
              <p>
                <strong>Điện thoại:</strong> {addr.phone}
              </p>
              <button
                className="form-button delete"
                onClick={() => onDelete(addr.id)}
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

// --- Component chính ---

const UserProfilePage = () => {
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Kiểm tra đăng nhập và dữ liệu người dùng
  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      alert(CONSTANTS.MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    dispatch({
      type: "UPDATE_PROFILE",
      payload: { username: user.username, email: user.email || "", phone: user.phone || "" },
    });
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: { addresses: Array.isArray(user.addresses) ? user.addresses : [] },
    });
  }, [isLoggedIn, user, navigate]);

  // Xử lý thay đổi input
  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    const payload =
      section === "address"
        ? { newAddress: { ...state.address.newAddress, [name]: value }, message: "" }
        : { [name]: value, message: "" };
    dispatch({ type: `UPDATE_${section.toUpperCase()}`, payload });
  };

  // Xử lý cập nhật thông tin cá nhân
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const updatedData = { email: state.profile.email.trim(), phone: state.profile.phone.trim() };
    const { success, message } = updateUserData(user.username, updatedData, login);
    dispatch({
      type: "UPDATE_PROFILE",
      payload: { message: success ? CONSTANTS.MESSAGES.PROFILE_UPDATE_SUCCESS : message || CONSTANTS.MESSAGES.PROFILE_UPDATE_FAILED },
    });
  };

  // Xử lý đổi mật khẩu
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const users = readUsers();
    if (!users) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: CONSTANTS.MESSAGES.SYSTEM_ERROR } });
      return;
    }

    const currentUser = users.find((u) => u.username === user.username);
    if (!currentUser) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: CONSTANTS.MESSAGES.USER_NOT_FOUND } });
      return;
    }

    const error = validatePassword(state.password, currentUser.password);
    if (error) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: error } });
      return;
    }

    const { success, message } = updateUserData(user.username, { password: state.password.newPassword }, login);
    if (success) {
      dispatch({
        type: "UPDATE_PASSWORD",
        payload: {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          message: CONSTANTS.MESSAGES.PASSWORD_CHANGE_SUCCESS,
        },
      });
      alert(CONSTANTS.MESSAGES.PASSWORD_CHANGE_SUCCESS);
      logout();
    } else {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: message || CONSTANTS.MESSAGES.SYSTEM_ERROR } });
    }
  };

  // Xử lý thêm địa chỉ
  const handleAddAddress = (e) => {
    e.preventDefault();
    const error = validateAddress(state.address.newAddress);
    if (error) {
      dispatch({ type: "UPDATE_ADDRESS", payload: { message: error } });
      return;
    }

    const newAddress = {
      id: Date.now(),
      ...state.address.newAddress,
    };
    const updatedAddresses = [...state.address.addresses, newAddress];
    const { success, message } = updateUserData(user.username, { addresses: updatedAddresses }, login);
    dispatch({
      type: success ? "RESET_ADDRESS" : "UPDATE_ADDRESS",
      payload: success
        ? CONSTANTS.MESSAGES.ADDRESS_SAVE_SUCCESS
        : { addresses: state.address.addresses, message: message || CONSTANTS.MESSAGES.ADDRESS_SAVE_FAILED },
    });
  };

  // Xử lý xóa địa chỉ
  const handleDeleteAddress = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== id);
    const { success, message } = updateUserData(user.username, { addresses: updatedAddresses }, login);
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: {
        addresses: success ? updatedAddresses : state.address.addresses,
        message: success ? CONSTANTS.MESSAGES.ADDRESS_DELETE_SUCCESS : message || CONSTANTS.MESSAGES.SYSTEM_ERROR,
      },
    });
  };

  if (!isLoggedIn || !user?.username) return null;

  const sections = [
    { id: "profile", label: "Thông tin cá nhân" },
    { id: "password", label: "Đổi mật khẩu" },
    { id: "address", label: "Địa chỉ giao hàng" },
    { id: "orders", label: "Lịch sử đơn hàng" },
  ];

  return (
    <div className="profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin cá nhân và đơn hàng.</p>
      <nav className="profile-nav" role="navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            className={state.activeSection === section.id ? "active" : ""}
            onClick={() => dispatch({ type: "SET_SECTION", payload: section.id })}
            aria-label={`Chuyển đến ${section.label}`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {state.activeSection === "profile" && (
        <ProfileForm
          formData={state.profile}
          onChange={(e) => handleInputChange(e, "profile")}
          onSubmit={handleProfileSubmit}
          message={state.profile.message}
        />
      )}
      {state.activeSection === "password" && (
        <PasswordForm
          formData={state.password}
          onChange={(e) => handleInputChange(e, "password")}
          onSubmit={handlePasswordSubmit}
          message={state.password.message}
        />
      )}
      {state.activeSection === "address" && (
        <AddressForm
          addresses={state.address.addresses}
          newAddress={state.address.newAddress}
          onChange={(e) => handleInputChange(e, "address")}
          onAdd={handleAddAddress}
          onDelete={handleDeleteAddress}
          message={state.address.message}
        />
      )}
      {state.activeSection === "orders" && (
        <section className="orders-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory />
        </section>
      )}
      <div className="back-link">
        <Link to="/home" aria-label="Quay lại cửa hàng">
          ← Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
};

export default UserProfilePage;