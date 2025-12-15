import React from "react";

const ForgotPasswordUsernameForm = ({ username, onChange, onSubmit, onCancel, message }) => (
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
      <button className="account-button verify-btn" onClick={onSubmit} aria-label="Gửi mã xác nhận">
        Gửi mã xác nhận
      </button>
      <button className="link-button" onClick={onCancel} aria-label="Hủy quên mật khẩu">
        Hủy
      </button>
    </div>
  </div>
);

export default React.memo(ForgotPasswordUsernameForm);
