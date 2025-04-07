import React, { useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext"; // Context quản lý trạng thái đăng nhập
import "./UserProfileModal.css";

// Component UserProfileModal - Hiển thị modal thông tin người dùng và đổi mật khẩu
const UserProfileModal = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext); // Lấy thông tin user và hàm logout từ AuthContext
  const [newPassword, setNewPassword] = useState(""); // State lưu mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // State lưu mật khẩu xác nhận
  const [message, setMessage] = useState(""); // State lưu thông báo kết quả

  // Xử lý đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault(); // Ngăn chặn form submit mặc định

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    // Lấy danh sách users từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    // Cập nhật mật khẩu cho user hiện tại
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username
        ? { ...storedUser, password: newPassword } // Cập nhật mật khẩu mới
        : storedUser // Giữ nguyên các user khác
    );

    // Lưu lại danh sách users và thông tin user hiện tại vào localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify({ ...user, password: newPassword }));

    // Hiển thị thông báo thành công
    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    setNewPassword(""); // Xóa input mật khẩu mới
    setConfirmPassword(""); // Xóa input xác nhận mật khẩu

    // Đăng xuất và đóng modal sau 2 giây
    setTimeout(() => {
      logout(); // Gọi hàm logout từ AuthContext
      onClose(); // Đóng modal
    }, 2000);
  };

  // Giao diện modal
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2>
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong> {user?.username || "Không có dữ liệu"} {/* Hiển thị username hoặc thông báo nếu không có */}
          </p>
        </div>

        <h3>Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} // Cập nhật state khi nhập mật khẩu mới
            required // Bắt buộc nhập
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Cập nhật state khi nhập xác nhận mật khẩu
            required // Bắt buộc nhập
          />
          {message && (
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message} {/* Hiển thị thông báo, class thay đổi tùy theo nội dung */}
            </p>
          )}

          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              Đổi mật khẩu {/* Nút gửi form để đổi mật khẩu */}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose} // Đóng modal khi nhấn
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal; // Xuất component để sử dụng ở nơi khác