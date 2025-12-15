import React from "react";

const LoggedInSection = ({ onLogout, message }) => (
  <div className="logged-in-section">
    <p>Bạn đã đăng nhập thành công!</p>
    <button className="account-button logout-btn" onClick={onLogout} aria-label="Đăng xuất">
      Đăng xuất
    </button>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message}
      </p>
    )}
  </div>
);

export default React.memo(LoggedInSection);
