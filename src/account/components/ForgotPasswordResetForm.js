import React from "react";

const ForgotPasswordResetForm = ({
  email,
  verificationCode,
  newPassword,
  confirmPassword,
  onCodeChange,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
  onCancel,
  message,
}) => (
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
      <button className="account-button verify-btn" onClick={onSubmit} aria-label="Xác nhận và đổi mật khẩu">
        Xác nhận
      </button>
      <button className="link-button" onClick={onCancel} aria-label="Hủy quên mật khẩu">
        Hủy
      </button>
    </div>
  </div>
);

export default React.memo(ForgotPasswordResetForm);
