import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Account.css";

const Account = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState({ username: "", password: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập từ localStorage
    const checkLoggedInUser = () => {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentUser(savedUser);
      }
    };
    checkLoggedInUser();
  }, []);

  // Chuyển hướng khi isLoggedIn thay đổi
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setTimeout(() => {
        navigate("/home");
      }, 1000); // Chờ 1 giây để hiển thị thông báo nếu cần
    }
  }, [isLoggedIn, currentUser, navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setLoginMessage("");
  };

  const handleRegister = () => {
    if (!user.username.trim() || !user.password.trim()) {
      setLoginMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
      return;
    }

    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    if (storedUsers.some((u) => u.username === user.username)) {
      setLoginMessage("Tên đăng nhập đã tồn tại!");
      return;
    }

    storedUsers.push(user);
    localStorage.setItem("users", JSON.stringify(storedUsers));

    setLoginMessage("Đăng ký thành công! Hãy đăng nhập.");
    setUser({ username: "", password: "" });
    setTimeout(() => {
      setIsRegistering(false);
    }, 1000);
  };

  const handleLogin = () => {
    if (!user.username.trim() || !user.password.trim()) {
      setLoginMessage("Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }

    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = storedUsers.find(
      (u) => u.username === user.username && u.password === user.password
    );

    if (foundUser) {
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      setIsLoggedIn(true);
      setCurrentUser(foundUser);
      setLoginMessage("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/home"); // Chuyển hướng ngay về /home
      }, 1000);
    } else {
      setLoginMessage("Sai thông tin đăng nhập");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    // Không cần navigate, để người dùng ở trang Account
  };

  return (
    <div className="account-container">
      <div className="account-box">
        <h1>{isLoggedIn ? `Xin chào, ${currentUser?.username}!` : "Đăng nhập / Đăng ký"}</h1>

        {!isLoggedIn && (
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
              <p className={`login-message ${loginMessage.includes("thành công") ? "success" : ""}`}>
                {loginMessage}
              </p>
            )}
            <div className="account-buttons">
              {isRegistering ? (
                <>
                  <button
                    className="account-button register-btn"
                    onClick={handleRegister}
                  >
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
                  <button
                    className="account-button login-btn"
                    onClick={handleLogin}
                  >
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