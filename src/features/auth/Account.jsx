import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { AuthContext } from "../../context/AuthContext";
import { LOCAL_STORAGE_KEYS, MESSAGES, ADMIN_CREDENTIALS } from "./models/constants";
import { getStoredUsers, saveUsersToStorage } from "./services/userService";
import { generateVerificationCode, sendVerificationEmail } from "./services/verificationService";
import AuthForm from "./components/AuthForm";
import ForgotPasswordUsernameForm from "./components/ForgotPasswordUsernameForm";
import ForgotPasswordResetForm from "./components/ForgotPasswordResetForm";
import VerificationForm from "./components/VerificationForm";
import LoggedInSection from "./components/LoggedInSection";
import "../../styles/Account.css";

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

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    console.log("EmailJS initialized in Account.js");
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  }, []);

  const handleForgotUsernameChange = useCallback((e) => {
    setForgotUsername(e.target.value);
    setMessage("");
  }, []);

  const handleCodeChange = useCallback((e) => {
    setVerificationCode(e.target.value);
    setMessage("");
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setNewPassword(e.target.value);
    setMessage("");
  }, []);

  const handleConfirmChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
    setMessage("");
  }, []);

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

    const storedUsers = getStoredUsers();
    const userIndex = storedUsers.findIndex((u) => u.username === pendingUser.username && u.email === pendingUser.email);
    if (userIndex === -1) {
      setMessage("Lỗi: Không tìm thấy người dùng để cập nhật mật khẩu.");
      return;
    }

    storedUsers[userIndex].password = newPassword;
    saveUsersToStorage(storedUsers);

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
    const foundUser = storedUsers.find((u) => u.username === username && u.password === password);

    if (foundUser) {
      login(foundUser);
      setMessage(MESSAGES.LOGIN_SUCCESS);
    } else {
      setMessage(MESSAGES.LOGIN_FAILED);
    }
  }, [formData, login, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    setMessage(MESSAGES.LOGOUT_SUCCESS);
    setFormData({ username: "", password: "", email: "" });
    setTimeout(() => navigate("/"), 1000);
  }, [logout, navigate]);

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
