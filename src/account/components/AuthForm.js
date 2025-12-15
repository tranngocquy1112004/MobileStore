import React from "react";

const AuthForm = ({ formData, isRegistering, onChange, onSubmit, onToggle, message }) => (
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
          <button className="account-button register-btn" onClick={onSubmit} aria-label="Đăng ký tài khoản">
            Đăng ký
          </button>
          <button className="link-button" onClick={onToggle} aria-label="Quay lại đăng nhập">
            Quay lại đăng nhập
          </button>
        </>
      ) : (
        <>
          <button className="account-button login-btn" onClick={onSubmit} aria-label="Đăng nhập">
            Đăng nhập
          </button>
          <button className="link-button" onClick={() => onToggle(false, true)} aria-label="Quên mật khẩu">
            Quên mật khẩu?
          </button>
          <button className="link-button" onClick={() => onToggle(true)} aria-label="Chuyển sang đăng ký">
            Chưa có tài khoản? Đăng ký
          </button>
        </>
      )}
    </div>
  </div>
);

export default React.memo(AuthForm);
