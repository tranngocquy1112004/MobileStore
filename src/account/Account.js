import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import emailjs from "@emailjs/browser";
import "./Account.css";

// Constants
const LOCAL_STORAGE_KEYS = {
  USERS: "users",
  CURRENT_USER: "currentUser",
};

const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ thông tin!",
  USER_EXISTS: "Tên đăng nhập đã tồn tại!",
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.",
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGIN_FAILED: "Sai thông tin đăng nhập!",
  LOGOUT_SUCCESS: "Đăng xuất thành công!",
  CODE_SENT: "Mã xác nhận đã được gửi đến email của bạn!",
  INVALID_CODE: "Mã xác nhận không đúng!",
  EMPTY_CODE: "Vui lòng nhập mã xác nhận!",
  MISSING_TEMPLATE_ID: "Lỗi cấu hình: Thiếu Template ID cho email xác nhận! Vui lòng kiểm tra file .env.",
  EMPTY_EMAIL: "Vui lòng nhập địa chỉ email hợp lệ!",
};

// Admin Credentials
const ADMIN_CREDENTIALS = {
  USERNAME: "admin",
  PASSWORD: "123",
};

// Utility function to get users from localStorage
const getStoredUsers = () => {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    return Array.isArray(storedUsers) ? storedUsers : [];
  } catch (error) {
    console.error("Error reading users from localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
    return [];
  }
};

// Utility function to save users to localStorage
const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

// Utility function to generate a random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility function to send verification code via EmailJS
const sendVerificationEmail = (userData, code, setMessage) => {
  const templateParams = {
    user_name: userData.username,
    to_email: userData.email, // Thay user_email thành to_email
    verification_code: code,
  };

  console.log("EmailJS Config:", {
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
    templateId: process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID,
    publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
  });
  console.log("Template Params:", templateParams);

  // Kiểm tra nếu email rỗng
  if (!templateParams.to_email || !templateParams.to_email.trim()) {
    setMessage(MESSAGES.EMPTY_EMAIL);
    return;
  }

  // Kiểm tra nếu templateId không được định nghĩa
  if (!process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID) {
    setMessage(MESSAGES.MISSING_TEMPLATE_ID);
    return;
  }

  console.log("Email gửi xác nhận:", templateParams.to_email);

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      (response) => {
        console.log("Verification email sent:", response.status, response.text);
        setMessage(MESSAGES.CODE_SENT);
      },
      (error) => {
        console.error("Failed to send verification email:", error);
        setMessage(`Gửi mã xác nhận thất bại: ${error.message || "Lỗi không xác định"}`);
      }
    );
};

const Account = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [message, setMessage] = useState("");

  // Redirect to home if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    console.log("EmailJS initialized in Account.js");
  }, []);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  }, []);

  // Handle verification code input
  const handleCodeChange = useCallback((e) => {
    setVerificationCode(e.target.value);
    setMessage("");
  }, []);

  // Handle registration (send verification code)
  const handleRegister = useCallback(() => {
    const { username, password, email } = formData;

    console.log("Form Data before register:", { username, password, email });

    if (!username.trim() || !password.trim() || !email.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    const storedUsers = getStoredUsers();
    if (storedUsers.some((u) => u.username === username)) {
      setMessage(MESSAGES.USER_EXISTS);
      return;
    }

    const code = generateVerificationCode();
    setGeneratedCode(code);
    setPendingUser({ username, password, email });
    sendVerificationEmail({ username, email }, code, setMessage);
    setIsVerifying(true);
  }, [formData]);

  // Handle code verification
  const handleVerifyCode = useCallback(() => {
    if (!verificationCode.trim()) {
      setMessage(MESSAGES.EMPTY_CODE);
      return;
    }

    if (verificationCode === generatedCode) {
      const newUser = { ...pendingUser, email: pendingUser.email || "" };
      const storedUsers = getStoredUsers();
      saveUsersToStorage([...storedUsers, newUser]);
      setMessage(MESSAGES.REGISTER_SUCCESS);
      setFormData({ username: "", password: "", email: "" });
      setVerificationCode("");
      setGeneratedCode("");
      setPendingUser(null);
      setIsVerifying(false);
      setTimeout(() => setIsRegistering(false), 1000);
    } else {
      setMessage(MESSAGES.INVALID_CODE);
    }
  }, [verificationCode, generatedCode, pendingUser]);

  // Handle login
  const handleLogin = useCallback(() => {
    const { username, password } = formData;

    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    if (username === ADMIN_CREDENTIALS.USERNAME && password === ADMIN_CREDENTIALS.PASSWORD) {
      login({ username: ADMIN_CREDENTIALS.USERNAME, email: "", role: "admin" });
      setMessage(MESSAGES.LOGIN_SUCCESS);
      navigate("/admin");
      return;
    }

    const storedUsers = getStoredUsers();
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      login(foundUser);
      setMessage(MESSAGES.LOGIN_SUCCESS);
    } else {
      setMessage(MESSAGES.LOGIN_FAILED);
    }
  }, [formData, login, navigate]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    setMessage(MESSAGES.LOGOUT_SUCCESS);
    setFormData({ username: "", password: "", email: "" });
    setTimeout(() => navigate("/"), 1000);
  }, [logout, navigate]);

  // Render form
  const renderForm = () => (
    <div className="auth-form">
      <input
        type="text"
        name="username"
        placeholder="Tên đăng nhập"
        className="account-input"
        value={formData.username}
        onChange={handleChange}
        aria-label="Nhập tên đăng nhập"
        autoComplete={isRegistering ? "new-username" : "username"}
      />
      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        className="account-input"
        value={formData.password}
        onChange={handleChange}
        aria-label="Nhập mật khẩu"
        autoComplete={isRegistering ? "new-password" : "current-password"}
      />
      {isRegistering && (
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="account-input"
          value={formData.email}
          onChange={handleChange}
          aria-label="Nhập email"
          required
        />
      )}
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
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
              className="link-button"
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
              className="link-button"
              onClick={() => setIsRegistering(true)}
              aria-label="Chuyển sang đăng ký"
            >
              Chưa có tài khoản? Đăng ký
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Render verification form
  const renderVerificationForm = () => (
    <div className="auth-form">
      <h2>Xác nhận mã</h2>
      <p>Vui lòng nhập mã xác nhận đã được gửi đến {formData.email}</p>
      <input
        type="text"
        placeholder="Nhập mã xác nhận"
        className="account-input"
        value={verificationCode}
        onChange={handleCodeChange}
        aria-label="Nhập mã xác nhận"
      />
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}
      <div className="account-buttons">
        <button
          className="account-button verify-btn"
          onClick={handleVerifyCode}
          aria-label="Xác nhận mã"
        >
          Xác nhận
        </button>
        <button
          className="link-button"
          onClick={() => {
            setIsVerifying(false);
            setMessage("");
            setVerificationCode("");
          }}
          aria-label="Hủy xác nhận"
        >
          Hủy
        </button>
      </div>
    </div>
  );

  // Render logged-in section
  const renderLoggedInSection = () => (
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
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );

  return (
    <div className="account-container">
      <div className="account-box">
        <h1>
          {isLoggedIn
            ? `Xin chào, ${user?.username || "Người dùng"}!`
            : isRegistering
            ? isVerifying
              ? "Xác nhận mã"
              : "Đăng ký tài khoản"
            : "Đăng nhập"}
        </h1>
        {isLoggedIn
          ? renderLoggedInSection()
          : isVerifying
          ? renderVerificationForm()
          : renderForm()}
      </div>
    </div>
  );
};

export default Account;