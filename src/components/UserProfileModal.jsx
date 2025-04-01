// Import các thư viện và thành phần cần thiết
import React, { useState, useContext } from "react"; // React core và các hooks
import { AuthContext } from "../account/AuthContext"; // Context để truy cập thông tin xác thực
import "./UserProfileModal.css"; // File CSS cho component

// Component UserProfileModal nhận prop onClose để đóng modal
const UserProfileModal = ({ onClose }) => {
  // Sử dụng useContext để lấy user và hàm logout từ AuthContext
  const { user, logout } = useContext(AuthContext);
  
  // State quản lý mật khẩu mới
  const [newPassword, setNewPassword] = useState("");
  // State quản lý xác nhận mật khẩu
  const [confirmPassword, setConfirmPassword] = useState("");
  // State quản lý thông báo
  const [message, setMessage] = useState("");

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Kiểm tra độ dài mật khẩu tối thiểu
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    // Lấy danh sách user từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    // Cập nhật mật khẩu mới cho user hiện tại
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username ? { ...storedUser, password: newPassword } : storedUser
    );
    // Lưu lại danh sách user đã cập nhật
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    // Cập nhật mật khẩu cho user hiện tại trong localStorage
    localStorage.setItem("currentUser", JSON.stringify({ ...user, password: newPassword }));

    // Hiển thị thông báo thành công
    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    // Reset các trường mật khẩu
    setNewPassword("");
    setConfirmPassword("");

    // Sau 2 giây thì tự động logout và đóng modal
    setTimeout(() => {
      logout(); // Gọi hàm logout từ AuthContext
      onClose(); // Đóng modal
    }, 2000);
  };

  // Render component
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Tiêu đề modal */}
        <h2>Thông tin người dùng</h2>
        {/* Hiển thị thông tin user */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong> {user?.username || "Không có dữ liệu"}
          </p>
        </div>
        
        {/* Form đổi mật khẩu */}
        <h3>Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          {/* Input mật khẩu mới */}
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {/* Input xác nhận mật khẩu */}
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {/* Hiển thị thông báo lỗi/thành công */}
          {message && (
            <p className={message.includes("thành công") ? "success" : "error"}>{message}</p>
          )}
          
          {/* Các button hành động */}
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

// Export component UserProfileModal làm component mặc định
export default UserProfileModal;