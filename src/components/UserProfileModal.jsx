import React, { useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext"; // Context để quản lý thông tin người dùng
import "./UserProfileModal.css";

// Component UserProfileModal để hiển thị thông tin người dùng và đổi mật khẩu
const UserProfileModal = ({ onClose }) => {
  // Lấy thông tin người dùng và hàm logout từ AuthContext
  const { user, logout } = useContext(AuthContext);

  // State để quản lý các trường nhập liệu và thông báo
  const [oldPassword, setOldPassword] = useState(""); // Mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // Mật khẩu xác nhận
  const [message, setMessage] = useState(""); // Thông báo lỗi hoặc thành công

  // Hàm xử lý khi submit form đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của form

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

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    // Cập nhật mật khẩu cho người dùng hiện tại
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username
        ? { ...storedUser, password: newPassword }
        : storedUser
    );

    // Lưu danh sách người dùng đã cập nhật vào localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    // Cập nhật thông tin người dùng hiện tại trong localStorage
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
      logout(); // Gọi hàm đăng xuất từ AuthContext
      onClose(); // Đóng modal
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2>
        {/* Hiển thị thông tin người dùng */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {user?.username || "Không có dữ liệu"} {/* Hiển thị tên đăng nhập hoặc thông báo mặc định */}
          </p>
        </div>

        <h3>Đổi mật khẩu</h3>
        {/* Form để đổi mật khẩu */}
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)} // Cập nhật state mật khẩu cũ
            required // Bắt buộc nhập
            aria-label="Nhập mật khẩu cũ"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} // Cập nhật state mật khẩu mới
            required // Bắt buộc nhập
            aria-label="Nhập mật khẩu mới"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Cập nhật state mật khẩu xác nhận
            required // Bắt buộc nhập
            aria-label="Xác nhận mật khẩu mới"
          />

          {/* Hiển thị thông báo lỗi hoặc thành công */}
          {message && (
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message}
            </p>
          )}

          {/* Các nút điều khiển */}
          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              Đổi mật khẩu {/* Nút xác nhận đổi mật khẩu */}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose} // Gọi hàm đóng modal
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