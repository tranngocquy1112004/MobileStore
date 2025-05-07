import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import OrderHistory from "./OrderHistory";
import "./UserProfilePage.css";

// --- HẰNG SỐ ---
// Định nghĩa các khóa và thông số cố định
const LOCAL_STORAGE_USERS_KEY = "users"; // Khóa dùng để lưu danh sách người dùng trong localStorage
const MIN_PASSWORD_LENGTH = 6; // Độ dài tối thiểu của mật khẩu

// Định nghĩa các thông báo hiển thị cho người dùng
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

// --- HÀM TIỆN ÍCH ---

/**
 * Đọc danh sách người dùng từ localStorage
 * @returns {Array|null} Danh sách người dùng hoặc null nếu lỗi
 */
const readUsersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY); // Lấy dữ liệu từ localStorage
    return storedData ? JSON.parse(storedData) : []; // Parse dữ liệu hoặc trả về mảng rỗng nếu không có
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu từ localStorage:", error); // Ghi log lỗi
    return null; // Trả về null nếu có lỗi
  }
};

/**
 * Lưu danh sách người dùng vào localStorage
 * @param {Array} users - Danh sách người dùng
 * @returns {boolean} Trả về true nếu lưu thành công, false nếu thất bại
 */
const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users)); // Lưu dữ liệu vào localStorage
    return true; // Trả về true nếu thành công
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error); // Ghi log lỗi
    return false; // Trả về false nếu thất bại
  }
};

// --- THÀNH PHẦN CON ---

/**
 * Form cập nhật thông tin cá nhân
 * @param {Object} props - Props chứa dữ liệu form, hàm xử lý thay đổi và gửi form
 */
const ProfileForm = ({ formData, onChange, onSubmit, message }) => (
  <section className="profile-info-section">
    <h2>Thông tin cá nhân</h2> {/* Tiêu đề của phần thông tin cá nhân */}
    <form onSubmit={onSubmit} className="profile-form"> {/* Form xử lý sự kiện submit */}
      <div className="form-group">
        <label htmlFor="profile-username">Tên đăng nhập:</label> {/* Nhãn cho trường tên đăng nhập */}
        <input
          type="text"
          id="profile-username"
          name="username"
          value={formData.username}
          className="profile-input"
          disabled
          readOnly // Trường tên đăng nhập bị vô hiệu hóa và chỉ đọc
        />
      </div>
      <div className="form-group">
        <label htmlFor="profile-email">Email:</label> {/* Nhãn cho trường email */}
        <input
          type="email"
          id="profile-email"
          name="email"
          value={formData.email}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          className="profile-input"
          aria-label="Nhập email" // Mô tả cho trợ năng
        />
      </div>
      <div className="form-group">
        <label htmlFor="profile-phone">Số điện thoại:</label> {/* Nhãn cho trường số điện thoại */}
        <input
          type="tel"
          id="profile-phone"
          name="phone"
          value={formData.phone}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          className="profile-input"
          aria-label="Nhập số điện thoại" // Mô tả cho trợ năng
        />
      </div>
      <button type="submit" className="profile-update-button">
        Cập nhật thông tin {/* Nút gửi form cập nhật */}
      </button>
    </form>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message} {/* Hiển thị thông báo trạng thái */}
      </p>
    )}
  </section>
);

/**
 * Form đổi mật khẩu
 * @param {Object} props - Props chứa dữ liệu form, hàm xử lý thay đổi và gửi form
 */
const PasswordForm = ({ formData, onChange, onSubmit, message }) => (
  <section className="change-password-section">
    <h2>Đổi mật khẩu</h2> {/* Tiêu đề của phần đổi mật khẩu */}
    <form onSubmit={onSubmit} className="password-form"> {/* Form xử lý sự kiện submit */}
      <div className="form-group">
        <label htmlFor="oldPassword">Mật khẩu cũ:</label> {/* Nhãn cho trường mật khẩu cũ */}
        <input
          type="password"
          id="oldPassword"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          className="password-input"
          required // Trường bắt buộc
          autoComplete="current-password" // Gợi ý tự động điền
          aria-label="Nhập mật khẩu cũ" // Mô tả cho trợ năng
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">Mật khẩu mới:</label> {/* Nhãn cho trường mật khẩu mới */}
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          className="password-input"
          required // Trường bắt buộc
          autoComplete="new-password" // Gợi ý tự động điền
          minLength={MIN_PASSWORD_LENGTH} // Độ dài tối thiểu
          aria-label="Nhập mật khẩu mới" // Mô tả cho trợ năng
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label> {/* Nhãn cho trường xác nhận mật khẩu */}
        <input
          type="password"
          id="confirmNewPassword"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          className="password-input"
          required // Trường bắt buộc
          autoComplete="new-password" // Gợi ý tự động điền
          minLength={MIN_PASSWORD_LENGTH} // Độ dài tối thiểu
          aria-label="Xác nhận mật khẩu mới" // Mô tả cho trợ năng
        />
      </div>
      <button type="submit" className="change-password-button">
        Đổi mật khẩu {/* Nút gửi form đổi mật khẩu */}
      </button>
    </form>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message} {/* Hiển thị thông báo trạng thái */}
      </p>
    )}
  </section>
);

/**
 * Form quản lý địa chỉ giao hàng
 * @param {Object} props - Props chứa danh sách địa chỉ, dữ liệu form mới, và các hàm xử lý
 */
const AddressForm = ({ addresses, newAddressFormData, onChange, onAddAddress, onDeleteAddress, message }) => (
  <section className="addresses-section">
    <h2>Địa chỉ giao hàng</h2> {/* Tiêu đề của phần địa chỉ giao hàng */}
    <h3>Thêm địa chỉ mới</h3> {/* Tiêu đề phụ cho form thêm địa chỉ */}
    <form onSubmit={onAddAddress} className="address-form"> {/* Form xử lý sự kiện submit */}
      <div className="form-group">
        <label htmlFor="new-address-address">Địa chỉ:</label> {/* Nhãn cho trường địa chỉ */}
        <input
          type="text"
          id="new-address-address"
          name="address"
          placeholder="Nhập địa chỉ chi tiết"
          value={newAddressFormData.address}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          required // Trường bắt buộc
          aria-label="Nhập địa chỉ giao hàng" // Mô tả cho trợ năng
        />
      </div>
      <div className="form-group">
        <label htmlFor="new-address-name">Người nhận:</label> {/* Nhãn cho trường tên người nhận */}
        <input
          type="text"
          id="new-address-name"
          name="name"
          placeholder="Tên người nhận"
          value={newAddressFormData.name}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          required // Trường bắt buộc
          aria-label="Nhập tên người nhận" // Mô tả cho trợ năng
        />
      </div>
      <div className="form-group">
        <label htmlFor="new-address-phone">Điện thoại:</label> {/* Nhãn cho trường số điện thoại */}
        <input
          type="tel"
          id="new-address-phone"
          name="phone"
          placeholder="Số điện thoại liên hệ"
          value={newAddressFormData.phone}
          onChange={onChange} // Xử lý sự kiện thay đổi giá trị
          required // Trường bắt buộc
          aria-label="Nhập số điện thoại liên hệ" // Mô tả cho trợ năng
        />
      </div>
      <button type="submit">Lưu địa chỉ mới</button> {/* Nút gửi form thêm địa chỉ */}
    </form>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message} {/* Hiển thị thông báo trạng thái */}
      </p>
    )}
    <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3> {/* Tiêu đề danh sách địa chỉ */}
    {addresses.length === 0 ? (
      <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p> // Hiển thị thông báo khi không có địa chỉ
    ) : (
      <ul className="address-list" role="list">
        {addresses.map((addr) => (
          <li key={addr.id} className="address-item">
            <p>
              <strong>Địa chỉ:</strong> {addr.address || "N/A"} {/* Hiển thị địa chỉ */}
            </p>
            <p>
              <strong>Người nhận:</strong> {addr.name || "N/A"} {/* Hiển thị tên người nhận */}
            </p>
            <p>
              <strong>Điện thoại:</strong> {addr.phone || "N/A"} {/* Hiển thị số điện thoại */}
            </p>
            <button
              className="delete-address-button"
              onClick={() => onDeleteAddress(addr.id)} // Xử lý sự kiện xóa địa chỉ
              aria-label={`Xóa địa chỉ ${addr.address || ""}`} // Mô tả cho trợ năng
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
);

// --- THÀNH PHẦN CHÍNH ---

/**
 * Trang quản lý hồ sơ người dùng
 */
const UserProfilePage = () => {
  // Lấy thông tin người dùng và hàm xử lý từ AuthContext
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };
  const navigate = useNavigate(); // Hook để điều hướng trang

  // Quản lý trạng thái giao diện và dữ liệu
  const [activeSection, setActiveSection] = useState("profile"); // Phần đang hiển thị (mặc định: profile)
  const [profileFormData, setProfileFormData] = useState({
    username: "",
    email: "",
    phone: "",
  }); // Dữ liệu form thông tin cá nhân
  const [profileMessage, setProfileMessage] = useState(""); // Thông báo trạng thái cho form thông tin
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  }); // Dữ liệu form đổi mật khẩu
  const [passwordMessage, setPasswordMessage] = useState(""); // Thông báo trạng thái cho form mật khẩu
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ giao hàng
  const [newAddressFormData, setNewAddressFormData] = useState({
    address: "",
    name: "",
    phone: "",
  }); // Dữ liệu form thêm địa chỉ mới
  const [addressMessage, setAddressMessage] = useState(""); // Thông báo trạng thái cho form địa chỉ

  // Khởi tạo dữ liệu khi người dùng đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      alert(MESSAGES.LOGIN_REQUIRED); // Thông báo yêu cầu đăng nhập
      navigate("/"); // Điều hướng về trang chủ
      return;
    }
    setProfileFormData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }); // Cập nhật dữ liệu form thông tin cá nhân
    setAddresses(user?.addresses || []); // Cập nhật danh sách địa chỉ
  }, [isLoggedIn, navigate, user]);

  // Xử lý thay đổi giá trị input
  const handleInputChange = (e, setFormData, setMessage) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Cập nhật giá trị form
    setMessage(""); // Xóa thông báo trạng thái
  };

  // Cập nhật thông tin người dùng trong localStorage
  const updateUserInStorage = (updatedUserData) => {
    const storedUsers = readUsersFromStorage(); // Đọc danh sách người dùng
    if (storedUsers === null) {
      setProfileMessage(MESSAGES.SYSTEM_ERROR_READING_USERS); // Thông báo lỗi đọc dữ liệu
      return false;
    }
    if (!user?.username) {
      setProfileMessage(MESSAGES.USER_NOT_FOUND); // Thông báo không tìm thấy người dùng
      return false;
    }

    const userIndex = storedUsers.findIndex((u) => u?.username === user.username); // Tìm chỉ số người dùng
    if (userIndex === -1) {
      setProfileMessage(MESSAGES.USER_NOT_FOUND); // Thông báo không tìm thấy người dùng
      return false;
    }

    storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedUserData }; // Cập nhật thông tin người dùng
    if (!saveUsersToStorage(storedUsers)) {
      setProfileMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS); // Thông báo lỗi lưu dữ liệu
      return false;
    }

    login({ ...user, ...updatedUserData }); // Cập nhật trạng thái đăng nhập
    return true;
  };

  // Xử lý cập nhật thông tin cá nhân
  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    const updatedData = {
      email: profileFormData.email.trim(),
      phone: profileFormData.phone.trim(),
    }; // Dữ liệu cập nhật
    const success = updateUserInStorage(updatedData); // Cập nhật dữ liệu vào localStorage
    setProfileMessage(success ? MESSAGES.PROFILE_UPDATE_SUCCESS : MESSAGES.PROFILE_UPDATE_FAILED); // Hiển thị thông báo
  };

  // Xử lý đổi mật khẩu
  const handleSubmitPasswordChange = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    const { oldPassword, newPassword, confirmNewPassword } = passwordFormData;

    // Kiểm tra các trường bắt buộc
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordMessage(MESSAGES.EMPTY_PASSWORD_FIELDS);
      return;
    }
    // Kiểm tra mật khẩu mới và xác nhận có khớp không
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage(MESSAGES.PASSWORDS_NOT_MATCH);
      return;
    }
    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordMessage(MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }
    // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
    if (newPassword === oldPassword) {
      setPasswordMessage(MESSAGES.PASSWORD_SAME_AS_OLD);
      return;
    }

    const storedUsers = readUsersFromStorage(); // Đọc danh sách người dùng
    if (storedUsers === null) {
      setPasswordMessage(MESSAGES.SYSTEM_ERROR_READING_USERS); // Thông báo lỗi đọc dữ liệu
      return;
    }
    const userIndex = storedUsers.findIndex((u) => u?.username === user.username); // Tìm chỉ số người dùng
    if (userIndex === -1 || storedUsers[userIndex].password !== oldPassword) {
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_FAILED); // Thông báo mật khẩu cũ không đúng
      return;
    }

    const success = updateUserInStorage({ password: newPassword }); // Cập nhật mật khẩu mới
    if (success) {
      setPasswordFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" }); // Xóa dữ liệu form
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_SUCCESS); // Thông báo đổi mật khẩu thành công
      setTimeout(logout, 2000); // Đăng xuất sau 2 giây
    } else {
      setPasswordMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS); // Thông báo lỗi lưu dữ liệu
    }
  };

  // Xử lý thêm địa chỉ mới
  const handleAddAddress = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    const { address, name, phone } = newAddressFormData;

    // Kiểm tra các trường bắt buộc
    if (!address.trim() || !name.trim() || !phone.trim()) {
      setAddressMessage(MESSAGES.ADDRESS_EMPTY_FIELDS);
      return;
    }

    const newAddress = {
      id: Date.now(), // Tạo ID duy nhất dựa trên thời gian
      address: address.trim(),
      name: name.trim(),
      phone: phone.trim(),
    }; // Tạo đối tượng địa chỉ mới
    const updatedAddresses = [...addresses, newAddress]; // Thêm địa chỉ vào danh sách

    const success = updateUserInStorage({ addresses: updatedAddresses }); // Cập nhật danh sách địa chỉ
    if (success) {
      setAddresses(updatedAddresses); // Cập nhật state địa chỉ
      setNewAddressFormData({ address: "", name: "", phone: "" }); // Xóa dữ liệu form
      setAddressMessage(MESSAGES.ADDRESS_SAVE_SUCCESS); // Thông báo lưu thành công
    } else {
      setAddressMessage(MESSAGES.ADDRESS_SAVE_FAILED); // Thông báo lưu thất bại
    }
  };

  // Xử lý xóa địa chỉ
  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return; // Xác nhận trước khi xóa

    const updatedAddresses = addresses.filter((addr) => addr?.id !== addressId); // Lọc bỏ địa chỉ bị xóa
    const success = updateUserInStorage({ addresses: updatedAddresses }); // Cập nhật danh sách địa chỉ
    setAddressMessage(success ? MESSAGES.ADDRESS_DELETE_SUCCESS : MESSAGES.SYSTEM_ERROR_UPDATING_USERS); // Hiển thị thông báo
    if (success) setAddresses(updatedAddresses); // Cập nhật state địa chỉ
  };

  // Trạng thái không đăng nhập
  if (!isLoggedIn || !user) return null; // Không hiển thị nếu chưa đăng nhập

  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username || "Người dùng"}!</h1> {/* Chào mừng người dùng */}
      <p>Quản lý thông tin và đơn hàng của bạn.</p> {/* Mô tả ngắn gọn */}
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
            onClick={() => setActiveSection(section.id)} // Chuyển đổi phần hiển thị
            aria-label={`Xem ${section.label.toLowerCase()}`} // Mô tả cho trợ năng
          >
            {section.label}
          </button>
        ))}
      </div>
      {activeSection === "profile" && (
        <ProfileForm
          formData={profileFormData}
          onChange={(e) => handleInputChange(e, setProfileFormData, setProfileMessage)}
          onSubmit={handleSubmitProfileUpdate}
          message={profileMessage}
        />
      )}
      {activeSection === "password" && (
        <PasswordForm
          formData={passwordFormData}
          onChange={(e) => handleInputChange(e, setPasswordFormData, setPasswordMessage)}
          onSubmit={handleSubmitPasswordChange}
          message={passwordMessage}
        />
      )}
      {activeSection === "addresses" && (
        <AddressForm
          addresses={addresses}
          newAddressFormData={newAddressFormData}
          onChange={(e) => handleInputChange(e, setNewAddressFormData, setAddressMessage)}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          message={addressMessage}
        />
      )}
      {activeSection === "orders" && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2> {/* Tiêu đề phần lịch sử đơn hàng */}
          <OrderHistory /> {/* Thành phần hiển thị lịch sử đơn hàng */}
        </section>
      )}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link> {/* Liên kết quay lại trang cửa hàng */}
      </div>
    </div>
  );
};

export default UserProfilePage; // Xuất thành phần chính