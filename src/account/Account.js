import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext"; // Context để quản lý trạng thái đăng nhập
import "./Account.css"; // File CSS để định dạng giao diện

// Định nghĩa các key dùng cho localStorage
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Key lưu danh sách người dùng
  CURRENT_USER: "currentUser", // Key lưu thông tin người dùng hiện tại
};

// Định nghĩa các thông báo cố định
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", // Thông báo khi thiếu thông tin
  USER_EXISTS: "Tên đăng nhập đã tồn tại!", // Thông báo khi tên đăng nhập đã được sử dụng
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.", // Thông báo đăng ký thành công
  LOGIN_SUCCESS: "Đăng nhập thành công!", // Thông báo đăng nhập thành công
  LOGIN_FAILED: "Sai thông tin đăng nhập!", // Thông báo đăng nhập thất bại
  LOGOUT_SUCCESS: "Đăng xuất thành công!", // Thông báo đăng xuất thành công
};

// Component chính để xử lý đăng nhập, đăng ký và đăng xuất
const Account = () => {
  const navigate = useNavigate(); // Hook để điều hướng người dùng
  // Lấy trạng thái và hàm từ AuthContext, mặc định nếu không có
  const { isLoggedIn, login, logout } = useContext(AuthContext) || {
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };

  // State để quản lý trạng thái form và thông báo
  const [isRegistering, setIsRegistering] = useState(false); // Chế độ đăng ký hoặc đăng nhập
  const [formData, setFormData] = useState({ username: "", password: "" }); // Dữ liệu form
  const [message, setMessage] = useState(""); // Thông báo lỗi hoặc thành công

  // Điều hướng đến trang chủ nếu đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home"); // Chuyển hướng đến trang chủ
    }
  }, [isLoggedIn, navigate]); // Phụ thuộc vào isLoggedIn và navigate

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Cập nhật dữ liệu form
    setMessage(""); // Xóa thông báo khi người dùng nhập
  };

  // Xử lý đăng ký tài khoản
  const handleRegister = () => {
    const { username, password } = formData;

    // Kiểm tra các trường bắt buộc
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    // Kiểm tra tên đăng nhập đã tồn tại
    if (storedUsers.some((u) => u.username === username)) {
      setMessage(MESSAGES.USER_EXISTS);
      return;
    }

    // Thêm người dùng mới vào danh sách
    const updatedUsers = [...storedUsers, { username, password }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)); // Lưu vào localStorage
    setMessage(MESSAGES.REGISTER_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form
    setTimeout(() => setIsRegistering(false), 1000); // Chuyển về chế độ đăng nhập sau 1 giây
  };

  // Xử lý đăng nhập
  const handleLogin = () => {
    const { username, password } = formData;

    // Kiểm tra các trường bắt buộc
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    // Tìm người dùng khớp với thông tin đăng nhập
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      login(foundUser); // Gọi hàm login từ AuthContext
      setMessage(MESSAGES.LOGIN_SUCCESS); // Hiển thị thông báo thành công
    } else {
      setMessage(MESSAGES.LOGIN_FAILED); // Hiển thị thông báo thất bại
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
    setMessage(MESSAGES.LOGOUT_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form
    setTimeout(() => navigate("/"), 1000); // Chuyển hướng về trang đăng nhập sau 1 giây
  };

  return (
    <div className="account-container">
      <div className="account-box">
        {/* Tiêu đề thay đổi tùy trạng thái */}
        <h1>
          {isLoggedIn
            ? `Xin chào, ${formData.username || "Người dùng"}!`
            : isRegistering
            ? "Đăng ký tài khoản"
            : "Đăng nhập"}
        </h1>

        {isLoggedIn ? (
          <div className="logged-in-section">
            <p>Bạn đã đăng nhập thành công!</p>
            <button
              className="account-button logout-btn"
              onClick={handleLogout}
              aria-label="Đăng xuất"
            >
              Đăng xuất
            </button>
            {message && (
              <p
                className={`message ${
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        ) : (
          <div className="auth-form">
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={formData.username}
              onChange={handleChange}
              aria-label="Nhập tên đăng nhập"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={formData.password}
              onChange={handleChange}
              aria-label="Nhập mật khẩu"
            />
            {message && (
              <p
                className={`message ${
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message}
              </p>
            )}
            <div className="account-buttons">
              {isRegistering ? (
                <>
                  <button
                    className="account-button register-btn"
                    onClick={handleRegister}
                    aria-label="Đăng ký tài khoản"
                  >
                    Đăng ký
                  </button>
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(false)}
                    aria-label="Quay lại đăng nhập"
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="account-button login-btn"
                    onClick={handleLogin}
                    aria-label="Đăng nhập"
                  >
                    Đăng nhập
                  </button>
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(true)}
                    aria-label="Chuyển sang đăng ký"
                  >
                    Chưa có tài khoản? Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;