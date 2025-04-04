import React, { useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./UserProfileModal.css";

// Component UserProfileModal
const UserProfileModal = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Xử lý đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username
        ? { ...storedUser, password: newPassword }
        : storedUser
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify({ ...user, password: newPassword }));

    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      logout();
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2>
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong> {user?.username || "Không có dữ liệu"}
          </p>
        </div>

        <h3>Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {message && (
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message}
            </p>
          )}

          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              Đổi mật khẩu
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;