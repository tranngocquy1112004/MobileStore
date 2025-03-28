import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import "./Account.css";

const LOCAL_STORAGE_KEYS = {
  USERS: "users",
  CURRENT_USER: "currentUser",
};

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
  const authContext = useContext(AuthContext);
  const { isLoggedIn, login, logout } = authContext || { isLoggedIn: false, login: () => {}, logout: () => {} };

  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState({ username: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => navigate("/home"), 1000);
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
    setLoginMessage("");
  };

  const handleRegister = () => {
    const { username, password } = user;

    if (!username.trim() || !password.trim()) {
      setLoginMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    if (storedUsers.some((u) => u.username === username)) {
      setLoginMessage(MESSAGES.USER_EXISTS);
      return;
    }

    const updatedUsers = [...storedUsers, { username, password }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    setLoginMessage(MESSAGES.REGISTER_SUCCESS);
    setUser({ username: "", password: "" });
    setTimeout(() => setIsRegistering(false), 1000);
  };

  const handleLogin = () => {
    const { username, password } = user;

    if (!username.trim() || !password.trim()) {
      setLoginMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      login(foundUser);
      setLoginMessage(MESSAGES.LOGIN_SUCCESS);
    } else {
      setLoginMessage(MESSAGES.LOGIN_FAILED);
    }
  };

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
    setLoginMessage(MESSAGES.LOGOUT_SUCCESS);
    setUser({ username: "", password: "" }); // Reset form
    setTimeout(() => navigate("/"), 1000); // Điều hướng về trang đăng nhập
  };

  return (
    <div className="account-container">
      <div className="account-box">
        <h1>{isLoggedIn ? `Xin chào, ${user?.username || "Người dùng"}!` : "Đăng nhập / Đăng ký"}</h1>

        {isLoggedIn ? (
          <div>
            <p>Bạn đã đăng nhập thành công!</p>
            <button className="account-button logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
            {loginMessage && (
              <p className={`login-message ${loginMessage.includes("thành công") ? "success" : ""}`}>
                {loginMessage}
              </p>
            )}
          </div>
        ) : (
          <div>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={user.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={user.password}
              onChange={handleChange}
            />
            {loginMessage && (
              <p
                className={`login-message ${
                  loginMessage.includes("thành công") ? "success" : ""
                }`}
              >
                {loginMessage}
              </p>
            )}
            <div className="account-buttons">
              {isRegistering ? (
                <>
                  <button className="account-button register-btn" onClick={handleRegister}>
                    Đăng ký
                  </button>
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(false)}
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <button className="account-button login-btn" onClick={handleLogin}>
                    Đăng nhập
                  </button>
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(true)}
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