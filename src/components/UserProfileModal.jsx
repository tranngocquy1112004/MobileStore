import React, { useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext";
import "./UserProfileModal.css";

const UserProfileModal = ({ onClose }) => {
  // Lấy thông tin người dùng và hàm logout từ AuthContext
  const { user, logout } = useContext(AuthContext);

  // State để quản lý mật khẩu cũ, mật khẩu mới, mật khẩu xác nhận và thông báo
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Hàm xử lý khi người dùng submit form đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu cũ có khớp với mật khẩu hiện tại không
    if (oldPassword !== user.password) {
      setMessage("Mật khẩu cũ không đúng!");
      return;
    }

    // Kiểm tra mật khẩu xác nhận có khớp với mật khẩu mới không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Kiểm tra độ dài tối thiểu của mật khẩu mới
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    // Cập nhật mật khẩu trong localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username
        ? { ...storedUser, password: newPassword }
        : storedUser
    );

    // Lưu danh sách người dùng đã cập nhật và thông tin người dùng hiện tại vào localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...user, password: newPassword })
    );

    // Hiển thị thông báo thành công và reset form
    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Tự động đăng xuất và đóng modal sau 2 giây
    setTimeout(() => {
      logout();
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2>
        {/* Hiển thị thông tin người dùng, mặc định nếu không có dữ liệu */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {user?.username || "Không có dữ liệu"}
          </p>
        </div>

        <h3>Đổi mật khẩu</h3>
        {/* Form để nhập mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu */}
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu cũ"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu mới"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label="Xác nhận mật khẩu mới"
          />

          {/* Hiển thị thông báo lỗi hoặc thành công */}
          {message && (
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message}
            </p>
          )}

          {/* Các nút điều khiển trong modal */}
          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              Đổi mật khẩu
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              aria-label="Đóng modal"
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