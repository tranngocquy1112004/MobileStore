import React, { useState, useContext } from "react";
import { AuthContext } from "../account/AuthContext"; // Context để quản lý trạng thái đăng nhập
import "./UserProfileModal.css";

// Component UserProfileModal - Hiển thị modal thông tin người dùng và đổi mật khẩu
const UserProfileModal = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext); // Lấy thông tin người dùng và hàm logout từ AuthContext
  const [newPassword, setNewPassword] = useState(""); // State lưu giá trị mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // State lưu giá trị mật khẩu xác nhận
  const [message, setMessage] = useState(""); // State lưu thông báo kết quả (thành công hoặc lỗi)

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit mặc định của form

    // Kiểm tra mật khẩu xác nhận có khớp với mật khẩu mới không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!"); // Thông báo lỗi nếu không khớp
      return;
    }

    // Kiểm tra độ dài tối thiểu của mật khẩu mới
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!"); // Thông báo lỗi nếu mật khẩu quá ngắn
      return;
    }

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users")) || []; // Nếu không có dữ liệu thì trả về mảng rỗng
    // Cập nhật mật khẩu cho người dùng hiện tại
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username
        ? { ...storedUser, password: newPassword } // Thay mật khẩu mới cho user hiện tại
        : storedUser // Giữ nguyên thông tin các user khác
    );

    // Lưu danh sách người dùng đã cập nhật vào localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    // Cập nhật thông tin người dùng hiện tại trong localStorage
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...user, password: newPassword })
    );

    // Hiển thị thông báo thành công
    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    setNewPassword(""); // Xóa giá trị trong ô nhập mật khẩu mới
    setConfirmPassword(""); // Xóa giá trị trong ô nhập xác nhận mật khẩu

    // Tự động đăng xuất và đóng modal sau 2 giây
    setTimeout(() => {
      logout(); // Gọi hàm đăng xuất từ AuthContext
      onClose(); // Đóng modal
    }, 2000); // Delay 2000ms (2 giây)
  };

  // Giao diện của modal
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2> {/* Tiêu đề của modal */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {user?.username || "Không có dữ liệu"}
          </p> {/* Hiển thị tên đăng nhập, nếu không có thì thông báo */}
        </div>

        <h3>Đổi mật khẩu</h3> {/* Tiêu đề phần đổi mật khẩu */}
        <form onSubmit={handleChangePassword}>
          <input
            type="password" // Input kiểu mật khẩu (ẩn ký tự)
            placeholder="Mật khẩu mới" // Văn bản gợi ý trong ô nhập
            value={newPassword} // Giá trị hiện tại của ô nhập
            onChange={(e) => setNewPassword(e.target.value)} // Cập nhật state khi người dùng nhập
            required // Bắt buộc phải nhập
          />
          <input
            type="password" // Input kiểu mật khẩu
            placeholder="Xác nhận mật khẩu" // Văn bản gợi ý trong ô nhập
            value={confirmPassword} // Giá trị hiện tại của ô nhập
            onChange={(e) => setConfirmPassword(e.target.value)} // Cập nhật state khi người dùng nhập
            required // Bắt buộc phải nhập
          />
          {message && (
            <p
              className={message.includes("thành công") ? "success" : "error"}
            >
              {message}
            </p>
          ) /* Hiển thị thông báo nếu có, class thay đổi tùy theo nội dung (success hoặc error) */}

          <div className="modal-buttons">
            <button
              type="submit" // Nút gửi form để đổi mật khẩu
              className="confirm-button" // Class CSS cho nút xác nhận
            >
              Đổi mật khẩu
            </button>
            <button
              type="button" // Nút không gửi form, chỉ đóng modal
              className="cancel-button" // Class CSS cho nút hủy
              onClick={onClose} // Gọi hàm đóng modal khi nhấn
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