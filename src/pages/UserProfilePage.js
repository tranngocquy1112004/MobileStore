// src/pages/UserProfilePage.js

// Import các hook cần thiết từ React
import React, { useState, useContext, useEffect, useCallback } from "react";
// Import hook và component từ react-router-dom để điều hướng và liên kết trang
import { useNavigate, Link } from "react-router-dom";
// Import AuthContext để truy cập thông tin người dùng và trạng thái đăng nhập
import { AuthContext } from "../account/AuthContext";
// Import CSS cho component này
import "./UserProfilePage.css";
// Import component hiển thị lịch sử đơn hàng
import OrderHistory from "./OrderHistory";

// Định nghĩa các hằng số sử dụng trong component
const LOCAL_STORAGE_USERS_KEY = "users"; // Key lưu trữ danh sách người dùng trên localStorage
const MIN_PASSWORD_LENGTH = 6; // Độ dài tối thiểu mật khẩu mới

// Đối tượng chứa các thông báo hiển thị cho người dùng
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

// Component UserProfilePage: Quản lý và hiển thị thông tin người dùng
const UserProfilePage = () => {
  // Lấy user, trạng thái đăng nhập và các hàm đăng nhập/đăng xuất từ AuthContext
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };
  const navigate = useNavigate(); // Hook điều hướng trang

  // State quản lý biểu mẫu đổi mật khẩu
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  // State quản lý biểu mẫu cập nhật thông tin cá nhân
  const [profileFormData, setProfileFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profileMessage, setProfileMessage] = useState("");

  // State quản lý danh sách địa chỉ và form thêm địa chỉ mới
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddressFormData, setNewAddressFormData] = useState({ address: "", name: "", phone: "" });
  const [addressMessage, setAddressMessage] = useState("");

  // State quản lý phần hiển thị hiện tại của trang
  const [activeSection, setActiveSection] = useState("profile");

  // Kiểm tra đăng nhập và cập nhật dữ liệu khi người dùng thay đổi
  useEffect(() => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
    } else {
      // Cập nhật lại state từ user khi user thay đổi
      setProfileFormData({
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
      setAddresses(user?.addresses || []);
    }
  }, [isLoggedIn, navigate, user]);

  // Xử lý thay đổi input cho các form
  const handleInputChange = useCallback((e, formType) => {
    const { name, value } = e.target;
    if (formType === "password") {
      setPasswordFormData((prev) => ({ ...prev, [name]: value }));
      setPasswordMessage("");
    } else if (formType === "profile") {
      setProfileFormData((prev) => ({ ...prev, [name]: value }));
      setProfileMessage("");
    } else if (formType === "newAddress") {
      setNewAddressFormData((prev) => ({ ...prev, [name]: value }));
      setAddressMessage("");
    }
  }, []);

  // Đọc danh sách người dùng từ localStorage
  const readUsersFromStorage = useCallback(() => {
    try {
      const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
      if (!Array.isArray(storedUsers)) {
        console.error("Dữ liệu người dùng trong localStorage không phải mảng.");
        return [];
      }
      return storedUsers;
    } catch (error) {
      console.error("Lỗi khi đọc người dùng từ localStorage:", error);
      return null;
    }
  }, []);

  // Lưu danh sách người dùng vào localStorage
  const saveUsersToStorage = useCallback((usersToSave) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(usersToSave));
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu người dùng vào localStorage:", error);
      return false;
    }
  }, []);

  // Cập nhật địa chỉ người dùng trong localStorage và context
  const updateUserAddressesInStorage = useCallback(
    (updatedAddressesList) => {
      const storedUsers = readUsersFromStorage();
      if (storedUsers === null) {
        setAddressMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
        return;
      }
      if (!user?.username) {
        setAddressMessage(MESSAGES.USER_NOT_FOUND);
        return;
      }
      const userIndex = storedUsers.findIndex((u) => u?.username === user.username);
      if (userIndex > -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], addresses: updatedAddressesList };
        if (!saveUsersToStorage(storedUsers)) {
          setAddressMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
          return;
        }
        const updatedUserForContext = { ...user, addresses: updatedAddressesList };
        login(updatedUserForContext);
      } else {
        setAddressMessage(MESSAGES.USER_NOT_FOUND);
      }
    },
    [user, login, readUsersFromStorage, saveUsersToStorage]
  );

  // Xử lý submit đổi mật khẩu
  const handleSubmitPasswordChange = useCallback(
    (e) => {
      e.preventDefault();
      const { oldPassword, newPassword, confirmNewPassword } = passwordFormData;

      // Kiểm tra hợp lệ đầu vào
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

      // Đọc và cập nhật dữ liệu người dùng
      const storedUsers = readUsersFromStorage();
      if (storedUsers === null) {
        setPasswordMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
        return;
      }
      if (!user?.username) {
        setPasswordMessage(MESSAGES.USER_NOT_FOUND);
        return;
      }
      
      // Kiểm tra mật khẩu cũ và cập nhật mật khẩu mới
      const userIndex = storedUsers.findIndex((u) => u?.username === user.username);
      if (userIndex === -1 || storedUsers[userIndex].password !== oldPassword) {
        setPasswordMessage(MESSAGES.PASSWORD_CHANGE_FAILED);
        return;
      }
      storedUsers[userIndex].password = newPassword;
      if (!saveUsersToStorage(storedUsers)) {
        setPasswordMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
        return;
      }
      
      // Cập nhật context và hiển thị thông báo
      const updatedUserForContext = { ...user, password: newPassword };
      login(updatedUserForContext);
      setPasswordFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_SUCCESS);

      // Đăng xuất tự động sau 2 giây để người dùng đăng nhập lại
      setTimeout(() => {
        logout();
      }, 2000);
    },
    [passwordFormData, user, login, logout, readUsersFromStorage, saveUsersToStorage]
  );

  // Xử lý submit cập nhật thông tin cá nhân
  const handleSubmitProfileUpdate = useCallback(
    (e) => {
      e.preventDefault();

      // Đọc và cập nhật dữ liệu người dùng
      const storedUsers = readUsersFromStorage();
      if (storedUsers === null) {
        setProfileMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
        return;
      }
      if (!user?.username) {
        setProfileMessage(MESSAGES.USER_NOT_FOUND);
        return;
      }
      
      // Cập nhật thông tin người dùng
      const userIndex = storedUsers.findIndex((u) => u?.username === user.username);
      if (userIndex > -1) {
        storedUsers[userIndex] = {
          ...storedUsers[userIndex],
          email: profileFormData.email.trim(),
          phone: profileFormData.phone.trim(),
        };
        if (!saveUsersToStorage(storedUsers)) {
          setProfileMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
          return;
        }
        
        // Cập nhật context và hiển thị thông báo
        const updatedUserForContext = {
          ...user,
          email: profileFormData.email.trim(),
          phone: profileFormData.phone.trim(),
        };
        login(updatedUserForContext);
        setProfileMessage(MESSAGES.PROFILE_UPDATE_SUCCESS);
      } else {
        setProfileMessage(MESSAGES.USER_NOT_FOUND);
      }
    },
    [profileFormData, user, login, readUsersFromStorage, saveUsersToStorage]
  );

  // Xử lý thêm địa chỉ mới
  const handleAddAddress = useCallback(
    (e) => {
      e.preventDefault();
      const { address, name, phone } = newAddressFormData;

      // Kiểm tra hợp lệ đầu vào
      if (!address.trim() || !name.trim() || !phone.trim()) {
        setAddressMessage(MESSAGES.ADDRESS_EMPTY_FIELDS);
        return;
      }

      // Tạo đối tượng địa chỉ mới và cập nhật danh sách
      const newAddress = {
        id: Date.now(),
        address: address.trim(),
        name: name.trim(),
        phone: phone.trim(),
      };
      const updatedAddresses = [...addresses, newAddress];
      
      // Cập nhật state và hiển thị thông báo
      setAddresses(updatedAddresses);
      setNewAddressFormData({ address: "", name: "", phone: "" });
      setAddressMessage(MESSAGES.ADDRESS_SAVE_SUCCESS);
      
      // Lưu vào localStorage và cập nhật context
      updateUserAddressesInStorage(updatedAddresses);
    },
    [newAddressFormData, addresses, updateUserAddressesInStorage]
  );

  // Xử lý xóa địa chỉ
  const handleDeleteAddress = useCallback(
    (addressIdToDelete) => {
      // Xác nhận xóa từ người dùng
      if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

      // Cập nhật danh sách địa chỉ
      const updatedAddresses = addresses.filter((addr) => addr?.id !== addressIdToDelete);
      setAddresses(updatedAddresses);
      setAddressMessage(MESSAGES.ADDRESS_DELETE_SUCCESS);
      
      // Lưu vào localStorage và cập nhật context
      updateUserAddressesInStorage(updatedAddresses);
    },
    [addresses, updateUserAddressesInStorage]
  );

  // Nếu chưa đăng nhập hoặc không có user thì không render gì
  if (!isLoggedIn || !user) {
    return null;
  }

  // Render giao diện trang hồ sơ
  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username || "Người dùng"}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

      {/* Menu điều hướng */}
      <div className="profile-sections-menu">
        <button
          className={activeSection === "profile" ? "active" : ""}
          onClick={() => setActiveSection("profile")}
          aria-label="Xem và chỉnh sửa thông tin cá nhân"
        >
          Thông tin cá nhân
        </button>
        <button
          className={activeSection === "password" ? "active" : ""}
          onClick={() => setActiveSection("password")}
          aria-label="Thay đổi mật khẩu"
        >
          Đổi mật khẩu
        </button>
        <button
          className={activeSection === "addresses" ? "active" : ""}
          onClick={() => setActiveSection("addresses")}
          aria-label="Quản lý địa chỉ giao hàng"
        >
          Địa chỉ giao hàng
        </button>
        <button
          className={activeSection === "orders" ? "active" : ""}
          onClick={() => setActiveSection("orders")}
          aria-label="Xem lịch sử đơn hàng"
        >
          Lịch sử đơn hàng
        </button>
      </div>

      {/* Phần thông tin cá nhân */}
      {activeSection === "profile" && (
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
                value={profileFormData.email}
                onChange={(e) => handleInputChange(e, "profile")}
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
                onChange={(e) => handleInputChange(e, "profile")}
                className="profile-input"
              />
            </div>
            <button type="submit" className="profile-update-button">
              Cập nhật thông tin
            </button>
          </form>
          {profileMessage && (
            <p
              className={`message ${
                profileMessage.includes("thành công")
                  ? "success"
                  : profileMessage.includes("thất bại") || profileMessage.includes("Lỗi") || profileMessage.includes("Không tìm thấy")
                  ? "error"
                  : ""
              }`}
            >
              {profileMessage}
            </p>
          )}
        </section>
      )}

      {/* Phần đổi mật khẩu */}
      {activeSection === "password" && (
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
                onChange={(e) => handleInputChange(e, "password")}
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
                onChange={(e) => handleInputChange(e, "password")}
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
                value={passwordFormData.confirmNewPassword}
                onChange={(e) => handleInputChange(e, "password")}
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
            <p
              className={`message ${
                passwordMessage.includes("thành công")
                  ? "success"
                  : passwordMessage.includes("thất bại") ||
                    passwordMessage.includes("không khớp") ||
                    passwordMessage.includes("ít nhất") ||
                    passwordMessage.includes("trùng") ||
                    passwordMessage.includes("Lỗi")
                  ? "error"
                  : ""
              }`}
            >
              {passwordMessage}
            </p>
          )}
        </section>
      )}

      {/* Phần địa chỉ giao hàng */}
      {activeSection === "addresses" && (
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
                onChange={(e) => handleInputChange(e, "newAddress")}
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
                onChange={(e) => handleInputChange(e, "newAddress")}
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
                onChange={(e) => handleInputChange(e, "newAddress")}
                required
              />
            </div>
            <button type="submit">Lưu địa chỉ mới</button>
          </form>
          {addressMessage && (
            <p
              className={`message ${
                addressMessage.includes("thành công")
                  ? "success"
                  : addressMessage.includes("thất bại") ||
                    addressMessage.includes("Lỗi") ||
                    addressMessage.includes("Vui lòng điền") ||
                    addressMessage.includes("Không tìm thấy")
                  ? "error"
                  : ""
              }`}
            >
              {addressMessage}
            </p>
          )}
          <h3>Danh sách địa chỉ của bạn ({Array.isArray(addresses) ? addresses.length : 0})</h3>
          {Array.isArray(addresses) && addresses.length === 0 ? (
            <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
          ) : (
            <ul className="address-list">
              {addresses.map((addr) => (
                <li key={addr?.id || addresses.indexOf(addr)} className="address-item">
                  <p>
                    <strong>Địa chỉ:</strong> {addr?.address || "N/A"}
                  </p>
                  <p>
                    <strong>Người nhận:</strong> {addr?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Điện thoại:</strong> {addr?.phone || "N/A"}
                  </p>
                  <button
                    className="delete-address-button"
                    onClick={() => handleDeleteAddress(addr?.id)}
                    aria-label={`Xóa địa chỉ ${addr?.address || ""}`}
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Phần lịch sử đơn hàng */}
      {activeSection === "orders" && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory />
        </section>
      )}

      {/* Link quay về trang chủ */}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

export default UserProfilePage;