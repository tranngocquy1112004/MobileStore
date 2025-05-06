// src/pages/UserProfilePage.js

import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import "./UserProfilePage.css";
import OrderHistory from "./OrderHistory";
import PropTypes from "prop-types";

// Constants
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
};

// Utility Functions
const readUsersFromStorage = () => {
  try {
    const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
    return Array.isArray(storedUsers) ? storedUsers : [];
  } catch (error) {
    console.error("Lỗi khi đọc người dùng từ localStorage:", error);
    return null;
  }
};

const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu người dùng vào localStorage:", error);
    return false;
  }
};

// Form Components
const ProfileForm = ({ formData, onChange, onSubmit, message }) => (
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
        />
      </div>
      <button type="submit" className="profile-update-button">
        Cập nhật thông tin
      </button>
    </form>
    {message && (
      <p
        className={`message ${
          message.includes("thành công") ? "success" : "error"
        }`}
      >
        {message}
      </p>
    )}
  </section>
);

const PasswordForm = ({ formData, onChange, onSubmit, message }) => (
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
        />
      </div>
      <button type="submit" className="change-password-button">
        Đổi mật khẩu
      </button>
    </form>
    {message && (
      <p
        className={`message ${
          message.includes("thành công") ? "success" : "error"
        }`}
      >
        {message}
      </p>
    )}
  </section>
);

const AddressForm = ({
  addresses,
  newAddressFormData,
  onChange,
  onAddAddress,
  onDeleteAddress,
  message,
}) => (
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
        />
      </div>
      <button type="submit">Lưu địa chỉ mới</button>
    </form>
    {message && (
      <p
        className={`message ${
          message.includes("thành công") ? "success" : "error"
        }`}
      >
        {message}
      </p>
    )}
    <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3>
    {addresses.length === 0 ? (
      <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
    ) : (
      <ul className="address-list">
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
              aria-label={`Xóa địa chỉ ${addr.address || ""}`}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
);

// Main Component
const UserProfilePage = () => {
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };
  const navigate = useNavigate();

  // State
  const [activeSection, setActiveSection] = useState("profile");
  const [profileFormData, setProfileFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddressFormData, setNewAddressFormData] = useState({
    address: "",
    name: "",
    phone: "",
  });
  const [addressMessage, setAddressMessage] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
    } else {
      setProfileFormData({
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
      setAddresses(user?.addresses || []);
    }
  }, [isLoggedIn, navigate, user]);

  // Handlers
  const handleInputChange = (e, setFormData, setMessage) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const updateUserInStorage = (updatedUserData) => {
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) return false;
    if (!user?.username) return false;

    const userIndex = storedUsers.findIndex((u) => u?.username === user.username);
    if (userIndex === -1) return false;

    storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedUserData };
    if (!saveUsersToStorage(storedUsers)) return false;

    login({ ...user, ...updatedUserData });
    return true;
  };

  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault();
    const updatedData = {
      email: profileFormData.email.trim(),
      phone: profileFormData.phone.trim(),
    };
    const success = updateUserInStorage(updatedData);
    setProfileMessage(
      success ? MESSAGES.PROFILE_UPDATE_SUCCESS : MESSAGES.PROFILE_UPDATE_FAILED
    );
  };

  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmNewPassword } = passwordFormData;

    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordMessage(MESSAGES.EMPTY_PASSWORD_FIELDS);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage(MESSAGES.PASSWORDS_NOT_MATCH);
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordMessage(MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordMessage(MESSAGES.PASSWORD_SAME_AS_OLD);
      return;
    }

    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) {
      setPasswordMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
      return;
    }
    const userIndex = storedUsers.findIndex((u) => u?.username === user.username);
    if (
      userIndex === -1 ||
      storedUsers[userIndex].password !== oldPassword
    ) {
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_FAILED);
      return;
    }

    const success = updateUserInStorage({ password: newPassword });
    if (success) {
      setPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_SUCCESS);
      setTimeout(logout, 2000);
    } else {
      setPasswordMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const { address, name, phone } = newAddressFormData;

    if (!address.trim() || !name.trim() || !phone.trim()) {
      setAddressMessage(MESSAGES.ADDRESS_EMPTY_FIELDS);
      return;
    }

    const newAddress = {
      id: Date.now(),
      address: address.trim(),
      name: name.trim(),
      phone: phone.trim(),
    };
    const updatedAddresses = [...addresses, newAddress];

    const success = updateUserInStorage({ addresses: updatedAddresses });
    if (success) {
      setAddresses(updatedAddresses);
      setNewAddressFormData({ address: "", name: "", phone: "" });
      setAddressMessage(MESSAGES.ADDRESS_SAVE_SUCCESS);
    } else {
      setAddressMessage(MESSAGES.ADDRESS_SAVE_FAILED);
    }
  };

  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    const updatedAddresses = addresses.filter((addr) => addr?.id !== addressId);
    const success = updateUserInStorage({ addresses: updatedAddresses });
    if (success) {
      setAddresses(updatedAddresses);
      setAddressMessage(MESSAGES.ADDRESS_DELETE_SUCCESS);
    } else {
      setAddressMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
    }
  };

  if (!isLoggedIn || !user) return null;

  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username || "Người dùng"}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

      <div className="profile-sections-menu">
        {[
          { id: "profile", label: "Thông tin cá nhân" },
          { id: "password", label: "Đổi mật khẩu" },
          { id: "addresses", label: "Địa chỉ giao hàng" },
          { id: "orders", label: "Lịch sử đơn hàng" },
        ].map((section) => (
          <button
            key={section.id}
            className={activeSection === section.id ? "active" : ""}
            onClick={() => setActiveSection(section.id)}
            aria-label={`Xem ${section.label.toLowerCase()}`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === "profile" && (
        <ProfileForm
          formData={profileFormData}
          onChange={(e) =>
            handleInputChange(e, setProfileFormData, setProfileMessage)
          }
          onSubmit={handleSubmitProfileUpdate}
          message={profileMessage}
        />
      )}

      {activeSection === "password" && (
        <PasswordForm
          formData={passwordFormData}
          onChange={(e) =>
            handleInputChange(e, setPasswordFormData, setPasswordMessage)
          }
          onSubmit={handleSubmitPasswordChange}
          message={passwordMessage}
        />
      )}

      {activeSection === "addresses" && (
        <AddressForm
          addresses={addresses}
          newAddressFormData={newAddressFormData}
          onChange={(e) =>
            handleInputChange(e, setNewAddressFormData, setAddressMessage)
          }
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          message={addressMessage}
        />
      )}

      {activeSection === "orders" && (
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

UserProfilePage.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    addresses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        address: PropTypes.string,
        name: PropTypes.string,
        phone: PropTypes.string,
      })
    ),
  }),
  isLoggedIn: PropTypes.bool,
  login: PropTypes.func,
  logout: PropTypes.func,
};

export default UserProfilePage;