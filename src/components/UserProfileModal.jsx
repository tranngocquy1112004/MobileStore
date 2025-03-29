// components/UserProfileModal.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./UserProfileModal.css";

// Component UserProfileModal - Hiển thị thông tin người dùng và form đổi mật khẩu
const UserProfileModal = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext); // Lấy thông tin user từ AuthContext
  const [newPassword, setNewPassword] = useState(""); // State lưu mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // State lưu mật khẩu xác nhận
  const [message, setMessage] = useState(""); // State lưu thông báo

  // Xử lý thay đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới và xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    // Cập nhật mật khẩu trong localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = storedUsers.map((u) =>
      u.username === user.username ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Cập nhật currentUser trong localStorage
    localStorage.setItem("currentUser", JSON.stringify({ ...user, password: newPassword }));

    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    setNewPassword("");
    setConfirmPassword("");

    // Đăng xuất sau 2 giây
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
          <p><strong>Tên đăng nhập:</strong> {user?.username || "Không có dữ liệu"}</p>
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
          {message && <p className={message.includes("thành công") ? "success" : "error"}>{message}</p>}
          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              Đổi mật khẩu
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;