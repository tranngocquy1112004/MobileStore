import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import "./Account.css";

// Định nghĩa các key dùng cho localStorage
const LOCAL_STORAGE_KEYS = {
  USERS: "users",
  CURRENT_USER: "currentUser",
};

// Định nghĩa các thông báo cố định
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!",
  USER_EXISTS: "Tên đăng nhập đã tồn tại!",
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.",
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGIN_FAILED: "Sai thông tin đăng nhập",
  LOGOUT_SUCCESS: "Đăng xuất thành công!",
};

const Account = () => {
  const navigate = useNavigate();
  // Lấy trạng thái đăng nhập và các hàm từ AuthContext, mặc định nếu không có context
  const { isLoggedIn, login, logout } = useContext(AuthContext) || {
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  // Điều hướng đến trang chủ nếu đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  // Xử lý thay đổi giá trị input trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  // Xử lý đăng ký tài khoản mới
  const handleRegister = () => {
    const { username, password } = formData;
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    if (storedUsers.some((u) => u.username === username)) {
      setMessage(MESSAGES.USER_EXISTS);
      return;
    }

    const updatedUsers = [...storedUsers, { username, password }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    setMessage(MESSAGES.REGISTER_SUCCESS);
    setFormData({ username: "", password: "" });
    setTimeout(() => setIsRegistering(false), 1000);
  };

  // Xử lý đăng nhập
  const handleLogin = () => {
    const { username, password } = formData;
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      login(foundUser);
      setMessage(MESSAGES.LOGIN_SUCCESS);
    } else {
      setMessage(MESSAGES.LOGIN_FAILED);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    setMessage(MESSAGES.LOGOUT_SUCCESS);
    setFormData({ username: "", password: "" });
    setTimeout(() => navigate("/"), 1000);
  };

  return (
    <div className="account-container">
      <div className="account-box">
        {/* Tiêu đề thay đổi tùy trạng thái đăng nhập */}
        <h1>
          {isLoggedIn
            ? `Xin chào, ${formData.username || "Người dùng"}!`
            : "Đăng nhập / Đăng ký"}
        </h1>

        {isLoggedIn ? (
          <div>
            <p>Bạn đã đăng nhập thành công!</p>
            <button
              className="account-button logout-btn"
              onClick={handleLogout}
              aria-label="Đăng xuất"
            >
              Đăng xuất
            </button>
            {/* Hiển thị thông báo nếu có */}
            {message && (
              <p
                className={`login-message ${
                  message.includes("thành công") ? "success" : ""
                }`}
              >
                {message}
              </p>
            )}
          </div>
        ) : (
          <div>
            {/* Input cho tên đăng nhập */}
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={formData.username}
              onChange={handleChange}
              aria-label="Nhập tên đăng nhập"
            />
            {/* Input cho mật khẩu */}
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={formData.password}
              onChange={handleChange}
              aria-label="Nhập mật khẩu"
            />
            {/* Hiển thị thông báo nếu có */}
            {message && (
              <p
                className={`login-message ${
                  message.includes("thành công") ? "success" : ""
                }`}
              >
                {message}
              </p>
            )}
            {/* Nút điều khiển tùy chế độ đăng nhập/đăng ký */}
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