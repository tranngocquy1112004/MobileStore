import React, { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../account/AuthContext"; // Adjust path if necessary
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import "./UserProfilePage.css"; // Ensure this CSS file exists

// Import OrderHistory component (path đã sửa)
import OrderHistory from "./OrderHistory"; // Điều chỉnh lại path nếu cần thiết

// --- Định nghĩa hằng số ---
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
};


const UserProfilePage = () => {
  const { user, isLoggedIn, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  // Initialize profile form data from user context or empty strings
  const [profileFormData, setProfileFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileMessage, setProfileMessage] = useState("");

  // Initialize addresses from user context or empty array
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddressFormData, setNewAddressFormData] = useState({ address: '', name: '', phone: '' });
  const [addressMessage, setAddressMessage] = useState('');

  // State to manage active section (profile, password, addresses, orders)
  const [activeSection, setActiveSection] = useState('profile');

  // Effect to check login status and redirect if not logged in
  useEffect(() => {
    // Also update profile state if user changes after initial render (less common scenario)
    if (isLoggedIn && user) {
      setProfileFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAddresses(user.addresses || []);
    } else if (!isLoggedIn) {
      console.log("Người dùng chưa đăng nhập, chuyển hướng về trang chủ.");
      navigate("/");
    }
  }, [isLoggedIn, navigate, user]); // Depend on isLoggedIn, navigate, and user

  // Unified input change handler
  const handleInputChange = useCallback((e, formType) => {
    const { name, value } = e.target;
    if (formType === 'password') {
      setPasswordFormData(prev => ({ ...prev, [name]: value }));
      setPasswordMessage(""); // Clear message on input change
    } else if (formType === 'profile') {
      setProfileFormData(prev => ({ ...prev, [name]: value }));
      setProfileMessage(""); // Clear message on input change
    } else if (formType === 'newAddress') {
      setNewAddressFormData(prev => ({ ...prev, [name]: value }));
      setAddressMessage(""); // Clear message on input change
    }
  }, [setPasswordFormData, setPasswordMessage, setProfileFormData, setProfileMessage, setNewAddressFormData, setAddressMessage]); // Dependencies include state setters

  // Helper function to read users from localStorage with error handling
  const readUsersFromStorage = useCallback(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
      if (!Array.isArray(storedUsers)) {
        console.error("Dữ liệu người dùng trong localStorage không phải là mảng.");
        return []; // Return empty array if data is invalid
      }
      return storedUsers;
    } catch (error) {
      console.error("Lỗi khi đọc danh sách người dùng từ localStorage:", error);
      return null; // Indicate error
    }
  }, []);

  // Helper function to save users to localStorage with error handling
  const saveUsersToStorage = useCallback((usersToSave) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(usersToSave));
      return true; // Indicate success
    } catch (error) {
      console.error("Lỗi khi lưu danh sách người dùng vào localStorage:", error);
      return false; // Indicate failure
    }
  }, []);


  // Helper function to update the user's addresses in localStorage and AuthContext
  // Moved this function declaration BEFORE the handlers that call it
  const updateUserAddressesInStorage = useCallback((updatedAddressesList) => {
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) { // Handle read error from helper
      setAddressMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
      return;
    }

    // Ensure user is available before proceeding
    if (!user || !user.username) {
        console.warn("Không có thông tin người dùng hiện tại để cập nhật địa chỉ.");
        setAddressMessage(MESSAGES.USER_NOT_FOUND);
        return;
    }

    const userIndex = storedUsers.findIndex(u => u.username === user.username);

    if (userIndex > -1) {
      // Update addresses in stored data
      storedUsers[userIndex] = { ...storedUsers[userIndex], addresses: updatedAddressesList };

      // Save updated data to localStorage
      if (!saveUsersToStorage(storedUsers)) { // Handle save error from helper
         setAddressMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
         return;
      }

      // Update user in context
      const updatedUserForContext = { ...user, addresses: updatedAddressesList };
      login(updatedUserForContext);

      console.log(`Đã cập nhật địa chỉ cho người dùng ${user.username} trong localStorage và context.`);

    } else {
      setAddressMessage(MESSAGES.USER_NOT_FOUND); // More specific message
      console.warn(`Không tìm thấy người dùng hiện tại ${user?.username} để cập nhật địa chỉ.`);
    }
  }, [user, login, readUsersFromStorage, saveUsersToStorage, setAddressMessage]); // Depend on user, login, and helper functions


  // Handles password change submission
  const handleSubmitPasswordChange = useCallback((e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmNewPassword } = passwordFormData;

    // Validation checks
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordMessage(MESSAGES.EMPTY_PASSWORD_FIELDS);
      return;
    }
    // --- BUG FIX: Corrected comparison ---
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
    if (storedUsers === null) { // Handle read error from helper
       setPasswordMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
       return;
    }

    const userIndex = storedUsers.findIndex(u => u.username === user.username);

    // Check if user exists and old password is correct
    if (userIndex === -1 || storedUsers[userIndex].password !== oldPassword) {
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_FAILED);
      console.warn(`Đổi mật khẩu thất bại cho người dùng ${user?.username || 'không xác định'}. Mật khẩu cũ không khớp.`);
      return;
    }

    // Update password in stored data
    storedUsers[userIndex].password = newPassword;

    // Save updated data to localStorage
    if (!saveUsersToStorage(storedUsers)) { // Handle save error from helper
       setPasswordMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
       return;
    }

    // Update user in context
    const updatedUserForContext = {
      ...user,
      password: newPassword, // Update password in the context user object
    };
    login(updatedUserForContext);

    // Reset form and show success message
    setPasswordFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    setPasswordMessage(MESSAGES.PASSWORD_CHANGE_SUCCESS);
    console.log(`Người dùng ${user.username} đã đổi mật khẩu thành công.`);

    // Logout after a short delay to force re-login with new password
    setTimeout(() => {
      logout();
    }, 2000);

  }, [passwordFormData, user, login, logout, readUsersFromStorage, saveUsersToStorage]); // Added helper functions to dependencies


  // Handles profile information update submission
  const handleSubmitProfileUpdate = useCallback((e) => {
    e.preventDefault();
    console.log("Đang xử lý cập nhật thông tin cá nhân:", profileFormData);

    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) { // Handle read error from helper
       setProfileMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
       return;
    }

    // Ensure user is available before proceeding
     if (!user || !user.username) {
         console.warn("Không có thông tin người dùng hiện tại để cập nhật profile.");
         setProfileMessage(MESSAGES.USER_NOT_FOUND);
         return;
     }

    const userIndex = storedUsers.findIndex(u => u.username === user.username);

    if (userIndex > -1) {
      // Update profile data in stored data
      storedUsers[userIndex] = {
        ...storedUsers[userIndex],
        // username: profileFormData.username, // Username typically not changed here
        email: profileFormData.email,
        phone: profileFormData.phone,
      };

      // Save updated data to localStorage
      if (!saveUsersToStorage(storedUsers)) { // Handle save error from helper
         setProfileMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
         return;
      }

      // Update user in context
      const updatedUserForContext = {
        ...user,
        // username: profileFormData.username, // Keep context username as is if not changing
        email: profileFormData.email,
        phone: profileFormData.phone,
      };
      login(updatedUserForContext);

      setProfileMessage(MESSAGES.PROFILE_UPDATE_SUCCESS);
      console.log(`Cập nhật thông tin người dùng ${user.username} thành công.`); // Use user.username for consistency

    } else {
      setProfileMessage(MESSAGES.USER_NOT_FOUND); // More specific message
      console.warn(`Không tìm thấy người dùng hiện tại ${user?.username} để cập nhật profile.`);
    }

  }, [profileFormData, user, login, readUsersFromStorage, saveUsersToStorage]); // Added helper functions to dependencies


  // Handles adding a new address
  const handleAddAddress = useCallback((e) => {
    e.preventDefault();
    const { address, name, phone } = newAddressFormData;

    // Validation check
    if (!address.trim() || !name.trim() || !phone.trim()) {
      setAddressMessage(MESSAGES.ADDRESS_EMPTY_FIELDS);
      return;
    }

    // Create new address object with a simple unique ID
    const newAddress = {
      id: Date.now(), // Simple ID generation (consider uuid for more robust apps)
      address: address.trim(),
      name: name.trim(),
      phone: phone.trim(),
    };

    const updatedAddresses = [...addresses, newAddress];

    // Update state immediately for responsiveness
    setAddresses(updatedAddresses);
    setNewAddressFormData({ address: '', name: '', phone: '' }); // Reset form
    setAddressMessage(MESSAGES.ADDRESS_SAVE_SUCCESS);

    // Persist updated addresses to localStorage and context
    updateUserAddressesInStorage(updatedAddresses);
    console.log("Đã thêm địa chỉ mới:", newAddress);

  }, [newAddressFormData, addresses, updateUserAddressesInStorage]); // Depend on newAddressFormData, addresses, and the update helper


  // Handles deleting an address
  const handleDeleteAddress = useCallback((addressIdToDelete) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    const updatedAddresses = addresses.filter(addr => addr.id !== addressIdToDelete);

    // Update state immediately for responsiveness
    setAddresses(updatedAddresses);
    setAddressMessage(MESSAGES.ADDRESS_DELETE_SUCCESS);

    // Persist updated addresses to localStorage and context
    updateUserAddressesInStorage(updatedAddresses);
    console.log(`Đã xóa địa chỉ có ID: ${addressIdToDelete}.`);

  }, [addresses, updateUserAddressesInStorage]); // Depend on addresses and the update helper


  // Render nothing if user is not logged in (redirection is handled by useEffect)
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

      {/* Navigation Menu */}
      <div className="profile-sections-menu">
        <button
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => setActiveSection('profile')}
          aria-label="Xem và chỉnh sửa thông tin cá nhân"
        >
          Thông tin cá nhân
        </button>
        <button
          className={activeSection === 'password' ? 'active' : ''}
          onClick={() => setActiveSection('password')}
          aria-label="Thay đổi mật khẩu"
        >
          Đổi mật khẩu
        </button>
        <button
          className={activeSection === 'addresses' ? 'active' : ''}
          onClick={() => setActiveSection('addresses')}
          aria-label="Quản lý địa chỉ giao hàng"
        >
          Địa chỉ giao hàng
        </button>
        <button
          className={activeSection === 'orders' ? 'active' : ''}
          onClick={() => setActiveSection('orders')}
          aria-label="Xem lịch sử đơn hàng"
        >
          Lịch sử đơn hàng
        </button>
      </div>

      {/* Profile Info Section */}
      {activeSection === 'profile' && (
        <section className="profile-info-section">
          <h2>Thông tin cá nhân</h2>
          <form onSubmit={handleSubmitProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="profile-username">Tên đăng nhập:</label>
              <input
                type="text"
                id="profile-username"
                name="username"
                value={profileFormData.username}
                className="profile-input"
                disabled // Username is typically not editable here
                readOnly // Added readOnly for disabled inputs
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email:</label>
              <input
                type="email"
                id="profile-email"
                name="email"
                value={profileFormData.email}
                onChange={(e) => handleInputChange(e, 'profile')}
                className="profile-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-phone">Số điện thoại:</label>
              <input
                type="tel"
                id="profile-phone"
                name="phone"
                value={profileFormData.phone}
                onChange={(e) => handleInputChange(e, 'profile')}
                className="profile-input"
              />
            </div>

            <button type="submit" className="profile-update-button">
              Cập nhật thông tin
            </button>
          </form>
          {profileMessage && (
            <p className={`message ${profileMessage.includes('thành công') ? 'success' : profileMessage.includes('thất bại') || profileMessage.includes('Lỗi') || profileMessage.includes('Không tìm thấy') ? 'error' : ''}`}>
              {profileMessage}
            </p>
          )}
        </section>
      )}

      {/* Change Password Section */}
      {activeSection === 'password' && (
        <section className="change-password-section">
          <h2>Đổi mật khẩu</h2>
          <form onSubmit={handleSubmitPasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="oldPassword">Mật khẩu cũ:</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordFormData.oldPassword}
                onChange={(e) => handleInputChange(e, 'password')}
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
                value={passwordFormData.newPassword}
                onChange={(e) => handleInputChange(e, 'password')}
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
                // Correct state property: confirmNewPassword
                value={passwordFormData.confirmNewPassword}
                onChange={(e) => handleInputChange(e, 'password')}
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
          {passwordMessage && (
             <p className={`message ${passwordMessage.includes('thành công') ? 'success' : (passwordMessage.includes('thất bại') || passwordMessage.includes('không khớp') || passwordMessage.includes('không đúng') || passwordMessage.includes('ít nhất') || passwordMessage.includes('trùng') || passwordMessage.includes('Lỗi')) ? 'error' : ''}`}>
               {passwordMessage}
             </p>
           )}
        </section>
      )}

      {/* Addresses Section */}
      {activeSection === 'addresses' && (
        <section className="addresses-section">
          <h2>Địa chỉ giao hàng</h2>

          <h3>Thêm địa chỉ mới</h3>
          <form onSubmit={handleAddAddress} className="address-form">
            <div className="form-group">
              <label htmlFor="new-address-address">Địa chỉ:</label>
              <input
                type="text"
                id="new-address-address"
                name="address"
                placeholder="Nhập địa chỉ chi tiết"
                value={newAddressFormData.address}
                onChange={(e) => handleInputChange(e, 'newAddress')}
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
                onChange={(e) => handleInputChange(e, 'newAddress')}
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
                onChange={(e) => handleInputChange(e, 'newAddress')}
                required
              />
            </div>
            <button type="submit">Lưu địa chỉ mới</button>
          </form>

          {addressMessage && (
            <p className={`message ${addressMessage.includes('thành công') ? 'success' : addressMessage.includes('thất bại') || addressMessage.includes('Lỗi') || addressMessage.includes('Vui lòng điền') || addressMessage.includes('Không tìm thấy') ? 'error' : ''}`}>
              {addressMessage}
            </p>
          )}


          <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3>
          {addresses.length === 0 ? (
            <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
          ) : (
            <ul className="address-list">
              {addresses.map(addr => (
                // Sử dụng id duy nhất làm key
                <li key={addr.id} className="address-item">
                  <p><strong>Địa chỉ:</strong> {addr.address}</p>
                  <p><strong>Người nhận:</strong> {addr.name}</p>
                  <p><strong>Điện thoại:</strong> {addr.phone}</p>
                  <button
                    className="delete-address-button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    aria-label={`Xóa địa chỉ ${addr.address}`}
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Order History Section */}
      {activeSection === 'orders' && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory /> {/* Make sure OrderHistory component handles user context */}
        </section>
      )}


      {/* Back Link */}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

export default UserProfilePage;