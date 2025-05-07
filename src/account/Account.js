import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { AuthContext } from "../account/AuthContext";
import "./Account.css";

// --- HẰNG SỐ ---

// Khóa lưu trữ trong localStorage
const LOCAL_STORAGE_KEYS = {
  USERS: "users",
  CURRENT_USER: "currentUser",
};

// Thông báo trạng thái
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ thông tin!",
  USER_EXISTS: "Tên đăng nhập đã tồn tại!",
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.",
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGIN_FAILED: "Sai thông tin đăng nhập!",
  LOGOUT_SUCCESS: "Đăng xuất thành công!",
  CODE_SENT: "Đã gửi mã xác nhận về email của bạn, vui lòng kiểm tra email.",
  INVALID_CODE: "Mã xác nhận không đúng!",
  EMPTY_CODE: "Vui lòng nhập mã xác nhận!",
  MISSING_TEMPLATE_ID: "Lỗi cấu hình: Thiếu Template ID cho email xác nhận! Vui lòng kiểm tra file .env.",
  EMPTY_EMAIL: "Vui lòng nhập địa chỉ email hợp lệ!",
  PASSWORD_MISMATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
  RESET_SUCCESS: "Mật khẩu đã được đổi thành công! Hãy đăng nhập lại.",
  USER_NOT_FOUND: "Không tìm thấy người dùng với tên tài khoản này hoặc email chưa được đăng ký!",
  INVALID_USERNAME: "Tên tài khoản không hợp lệ!",
};

// Thông tin tài khoản admin
const ADMIN_CREDENTIALS = {
  USERNAME: "admin",
  PASSWORD: "123",
};

// --- HÀM TIỆN ÍCH ---

/**
 * Lấy danh sách người dùng từ localStorage
 * @returns {Array} Danh sách người dùng hoặc mảng rỗng nếu lỗi
 */
const getStoredUsers = () => {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    return Array.isArray(storedUsers) ? storedUsers : [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
    return [];
  }
};

/**
 * Lưu danh sách người dùng vào localStorage
 * @param {Array} users - Danh sách người dùng
 */
const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu người dùng vào localStorage:", error);
  }
};

/**
 * Tạo mã xác nhận ngẫu nhiên 6 chữ số
 * @returns {string} Mã xác nhận
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Gửi email chứa mã xác nhận qua EmailJS
 * @param {Object} userData - Thông tin người dùng (username, email)
 * @param {string} code - Mã xác nhận
 * @param {Function} setMessage - Hàm cập nhật thông báo
 */
const sendVerificationEmail = (userData, code, setMessage) => {
  const templateParams = {
    user_name: userData.username || "Người dùng",
    to_email: userData.email,
    verification_code: code,
  };

  console.log("EmailJS Config:", {
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
    templateId: process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID,
    publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
  });
  console.log("Template Params:", templateParams);

  if (!templateParams.to_email || !templateParams.to_email.trim()) {
    setMessage(MESSAGES.EMPTY_EMAIL);
    return;
  }

  if (!process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID) {
    setMessage(MESSAGES.MISSING_TEMPLATE_ID);
    return;
  }

  emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      (response) => {
        console.log("Email xác nhận gửi thành công:", response.status, response.text);
        setMessage(MESSAGES.CODE_SENT);
      },
      (error) => {
        console.error("Lỗi gửi email xác nhận:", error);
        setMessage(`Gửi mã xác nhận thất bại: ${error.message || "Lỗi không xác định"}`);
      }
    );
};

// --- THÀNH PHẦN CON ---

/**
 * Form đăng nhập hoặc đăng ký
 * @param {Object} props - Props chứa thông tin form và các hàm xử lý
 * @returns {JSX.Element} JSX hiển thị form
 */
const AuthForm = React.memo(
  ({ formData, isRegistering, onChange, onSubmit, onToggle, message }) => (
    <div className="auth-form">
      <input
        type="text"
        name="username"
        placeholder="Tên đăng nhập"
        className="account-input"
        value={formData.username}
        onChange={onChange}
        aria-label="Nhập tên đăng nhập"
        autoComplete={isRegistering ? "new-username" : "username"}
      />
      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        className="account-input"
        value={formData.password}
        onChange={onChange}
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
          onChange={onChange}
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
              onClick={onSubmit}
              aria-label="Đăng ký tài khoản"
            >
              Đăng ký
            </button>
            <button
              className="link-button"
              onClick={onToggle}
              aria-label="Quay lại đăng nhập"
            >
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <>
            <button
              className="account-button login-btn"
              onClick={onSubmit}
              aria-label="Đăng nhập"
            >
              Đăng nhập
            </button>
            <button
              className="link-button"
              onClick={() => onToggle(false, true)}
              aria-label="Quên mật khẩu"
            >
              Quên mật khẩu?
            </button>
            <button
              className="link-button"
              onClick={() => onToggle(true)}
              aria-label="Chuyển sang đăng ký"
            >
              Chưa có tài khoản? Đăng ký
            </button>
          </>
        )}
      </div>
    </div>
  )
);

/**
 * Form nhập username để quên mật khẩu
 * @param {Object} props - Props chứa thông tin form và các hàm xử lý
 * @returns {JSX.Element} JSX hiển thị form nhập username
 */
const ForgotPasswordUsernameForm = React.memo(
  ({ username, onChange, onSubmit, onCancel, message }) => (
    <div className="auth-form">
      <h2>Quên mật khẩu</h2>
      <p>Vui lòng nhập tên tài khoản của bạn</p>
      <input
        type="text"
        name="username"
        placeholder="Tên tài khoản"
        className="account-input"
        value={username}
        onChange={onChange}
        aria-label="Nhập tên tài khoản"
      />
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}
      <div className="account-buttons">
        <button
          className="account-button verify-btn"
          onClick={onSubmit}
          aria-label="Gửi mã xác nhận"
        >
          Gửi mã xác nhận
        </button>
        <button
          className="link-button"
          onClick={onCancel}
          aria-label="Hủy quên mật khẩu"
        >
          Hủy
        </button>
      </div>
    </div>
  )
);

/**
 * Form nhập mã xác nhận và đổi mật khẩu
 * @param {Object} props - Props chứa thông tin mã, mật khẩu và các hàm xử lý
 * @returns {JSX.Element} JSX hiển thị form quên mật khẩu
 */
const ForgotPasswordResetForm = React.memo(
  ({ email, verificationCode, newPassword, confirmPassword, onCodeChange, onPasswordChange, onConfirmChange, onSubmit, onCancel, message }) => (
    <div className="auth-form">
      <h2>Quên mật khẩu</h2>
      <p>Mã xác nhận đã được gửi đến {email}</p>
      <input
        type="text"
        placeholder="Nhập mã xác nhận"
        className="account-input"
        value={verificationCode}
        onChange={onCodeChange}
        aria-label="Nhập mã xác nhận"
      />
      <input
        type="password"
        placeholder="Mật khẩu mới"
        className="account-input"
        value={newPassword}
        onChange={onPasswordChange}
        aria-label="Nhập mật khẩu mới"
      />
      <input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        className="account-input"
        value={confirmPassword}
        onChange={onConfirmChange}
        aria-label="Xác nhận mật khẩu mới"
      />
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}
      <div className="account-buttons">
        <button
          className="account-button verify-btn"
          onClick={onSubmit}
          aria-label="Xác nhận và đổi mật khẩu"
        >
          Xác nhận
        </button>
        <button
          className="link-button"
          onClick={onCancel}
          aria-label="Hủy quên mật khẩu"
        >
          Hủy
        </button>
      </div>
    </div>
  )
);

/**
 * Form nhập mã xác nhận (đăng ký)
 * @param {Object} props - Props chứa thông tin mã và các hàm xử lý
 * @returns {JSX.Element} JSX hiển thị form xác nhận
 */
const VerificationForm = React.memo(
  ({ email, verificationCode, onCodeChange, onVerify, onCancel, message }) => (
    <div className="auth-form">
      <h2>Xác nhận mã</h2>
      <p>Vui lòng nhập mã xác nhận đã được gửi đến {email}</p>
      <input
        type="text"
        placeholder="Nhập mã xác nhận"
        className="account-input"
        value={verificationCode}
        onChange={onCodeChange}
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
          onClick={onVerify}
          aria-label="Xác nhận mã"
        >
          Xác nhận
        </button>
        <button
          className="link-button"
          onClick={onCancel}
          aria-label="Hủy xác nhận"
        >
          Hủy
        </button>
      </div>
    </div>
  )
);

/**
 * Giao diện khi đã đăng nhập
 * @param {Object} props - Props chứa hàm đăng xuất và thông báo
 * @returns {JSX.Element} JSX hiển thị section đã đăng nhập
 */
const LoggedInSection = React.memo(({ onLogout, message }) => (
  <div className="logged-in-section">
    <p>Bạn đã đăng nhập thành công!</p>
    <button
      className="account-button logout-btn"
      onClick={onLogout}
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
));

// --- THÀNH PHẦN CHÍNH ---

/**
 * Trang quản lý tài khoản (đăng nhập, đăng ký, quên mật khẩu)
 * @returns {JSX.Element} JSX hiển thị trang tài khoản
 */
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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotUsernameStep, setIsForgotUsernameStep] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });
  const [forgotUsername, setForgotUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Điều hướng về trang chủ nếu đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  // Khởi tạo EmailJS
  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    console.log("EmailJS khởi tạo trong Account.js");
  }, []);

  // Xử lý thay đổi giá trị trong form đăng nhập/đăng ký
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  }, []);

  // Xử lý thay đổi username khi quên mật khẩu
  const handleForgotUsernameChange = useCallback((e) => {
    setForgotUsername(e.target.value);
    setMessage("");
  }, []);

  // Xử lý thay đổi mã xác nhận
  const handleCodeChange = useCallback((e) => {
    setVerificationCode(e.target.value);
    setMessage("");
  }, []);

  // Xử lý thay đổi mật khẩu mới
  const handlePasswordChange = useCallback((e) => {
    setNewPassword(e.target.value);
    setMessage("");
  }, []);

  // Xử lý thay đổi xác nhận mật khẩu
  const handleConfirmChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
    setMessage("");
  }, []);

  // Xử lý đăng ký (gửi mã xác nhận)
  const handleRegister = useCallback(() => {
    const { username, password, email } = formData;

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

  // Xử lý xác nhận mã (đăng ký)
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

  // Xử lý nhập username và gửi mã xác nhận khi quên mật khẩu
  const handleForgotPasswordUsername = useCallback(() => {
    if (!forgotUsername.trim()) {
      setMessage(MESSAGES.INVALID_USERNAME);
      return;
    }

    const storedUsers = getStoredUsers();
    const foundUser = storedUsers.find((u) => u.username === forgotUsername && u.email);
    if (!foundUser || !foundUser.email) {
      setMessage(MESSAGES.USER_NOT_FOUND);
      return;
    }

    const code = generateVerificationCode();
    setGeneratedCode(code);
    setPendingUser(foundUser);
    sendVerificationEmail({ username: foundUser.username, email: foundUser.email }, code, setMessage);
    setIsForgotUsernameStep(false);
  }, [forgotUsername]);

  // Xử lý xác nhận mã và đổi mật khẩu
  const handleResetPassword = useCallback(() => {
    if (!verificationCode.trim()) {
      setMessage(MESSAGES.EMPTY_CODE);
      return;
    }

    if (verificationCode !== generatedCode) {
      setMessage(MESSAGES.INVALID_CODE);
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    // Cập nhật mật khẩu trong danh sách người dùng
    const storedUsers = getStoredUsers();
    const userIndex = storedUsers.findIndex((u) => u.username === pendingUser.username && u.email === pendingUser.email);
    if (userIndex === -1) {
      setMessage("Lỗi: Không tìm thấy người dùng để cập nhật mật khẩu.");
      return;
    }

    // Cập nhật mật khẩu mới
    storedUsers[userIndex].password = newPassword;
    saveUsersToStorage(storedUsers);

    // Reset trạng thái sau khi đổi mật khẩu thành công
    setMessage(MESSAGES.RESET_SUCCESS);
    setForgotUsername("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setGeneratedCode("");
    setPendingUser(null);
    setIsForgotPassword(false);
    setIsForgotUsernameStep(true);
    setTimeout(() => navigate("/"), 1000);
  }, [verificationCode, generatedCode, newPassword, confirmPassword, pendingUser, navigate]);

  // Xử lý đăng nhập
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

  // Xử lý đăng xuất
  const handleLogout = useCallback(() => {
    logout();
    setMessage(MESSAGES.LOGOUT_SUCCESS);
    setFormData({ username: "", password: "", email: "" });
    setTimeout(() => navigate("/"), 1000);
  }, [logout, navigate]);

  // Xử lý chuyển đổi giữa các chế độ
  const handleToggle = useCallback((register = false, forgot = false) => {
    setIsRegistering(register);
    setIsForgotPassword(forgot);
    setIsForgotUsernameStep(true);
    setMessage("");
    setFormData({ username: "", password: "", email: "" });
    setForgotUsername("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
  }, []);

  // Hủy xác nhận mã hoặc quên mật khẩu
  const handleCancel = useCallback(() => {
    setIsVerifying(false);
    setIsForgotPassword(false);
    setIsForgotUsernameStep(true);
    setMessage("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotUsername("");
  }, []);

  // Tiêu đề trang
  const pageTitle = isLoggedIn
    ? `Xin chào, ${user?.username || "Người dùng"}!`
    : isRegistering
    ? isVerifying
      ? "Xác nhận mã"
      : "Đăng ký tài khoản"
    : isForgotPassword
    ? isForgotUsernameStep
      ? "Quên mật khẩu"
      : "Đổi mật khẩu"
    : "Đăng nhập";

  return (
    <div className="account-container">
      <div className="account-box">
        <h1>{pageTitle}</h1>
        {isLoggedIn ? (
          <LoggedInSection onLogout={handleLogout} message={message} />
        ) : isVerifying ? (
          <VerificationForm
            email={formData.email}
            verificationCode={verificationCode}
            onCodeChange={handleCodeChange}
            onVerify={handleVerifyCode}
            onCancel={handleCancel}
            message={message}
          />
        ) : isForgotPassword ? (
          isForgotUsernameStep ? (
            <ForgotPasswordUsernameForm
              username={forgotUsername}
              onChange={handleForgotUsernameChange}
              onSubmit={handleForgotPasswordUsername}
              onCancel={handleCancel}
              message={message}
            />
          ) : (
            <ForgotPasswordResetForm
              email={pendingUser?.email}
              verificationCode={verificationCode}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onCodeChange={handleCodeChange}
              onPasswordChange={handlePasswordChange}
              onConfirmChange={handleConfirmChange}
              onSubmit={handleResetPassword}
              onCancel={handleCancel}
              message={message}
            />
          )
        ) : (
          <AuthForm
            formData={formData}
            isRegistering={isRegistering}
            onChange={handleChange}
            onSubmit={isRegistering ? handleRegister : handleLogin}
            onToggle={handleToggle}
            message={message}
          />
        )}
      </div>
    </div>
  );
};

export default Account;