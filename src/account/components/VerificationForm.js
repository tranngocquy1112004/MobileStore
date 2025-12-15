import React from "react";

const VerificationForm = ({ email, verificationCode, onCodeChange, onVerify, onCancel, message }) => (
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
      <button className="account-button verify-btn" onClick={onVerify} aria-label="Xác nhận mã">
        Xác nhận
      </button>
      <button className="link-button" onClick={onCancel} aria-label="Hủy xác nhận">
        Hủy
      </button>
    </div>
  </div>
);

export default React.memo(VerificationForm);
