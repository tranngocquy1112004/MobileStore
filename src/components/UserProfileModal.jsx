import React, { useState, useContext } from "react"; // Import các hook cần thiết từ React: useState để quản lý state, useContext để truy cập Context
import { AuthContext } from "../account/AuthContext"; // Import AuthContext để lấy thông tin người dùng và hàm logout
import "./UserProfileModal.css"; // Import file CSS cho component UserProfileModal

// Component UserProfileModal: Hiển thị modal chứa thông tin người dùng và form đổi mật khẩu
// Nhận prop 'onClose' là hàm để đóng modal từ component cha
const UserProfileModal = ({ onClose }) => {
  // Sử dụng useContext để truy cập Context AuthContext
  // Lấy state 'user' (thông tin người dùng đang đăng nhập) và hàm 'logout' từ Context
  const { user, logout } = useContext(AuthContext);

  // --- State quản lý các trường nhập liệu và thông báo ---
  const [oldPassword, setOldPassword] = useState(""); // State lưu giá trị input mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // State lưu giá trị input mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // State lưu giá trị input xác nhận mật khẩu
  const [message, setMessage] = useState(""); // State lưu thông báo (lỗi hoặc thành công) hiển thị cho người dùng

  // --- Hàm xử lý khi form đổi mật khẩu được submit ---
  const handleChangePassword = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit mặc định của form (trang không bị reload)

    // --- Kiểm tra validation ---

    // 1. Kiểm tra mật khẩu cũ nhập vào có khớp với mật khẩu hiện tại của người dùng không
    if (oldPassword !== user.password) {
      setMessage("Mật khẩu cũ không đúng!"); // Đặt thông báo lỗi
      return; // Dừng hàm không xử lý tiếp
    }

    // 2. Kiểm tra mật khẩu mới và mật khẩu xác nhận có khớp nhau không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!"); // Đặt thông báo lỗi
      return; // Dừng hàm
    }

    // 3. Kiểm tra độ dài tối thiểu của mật khẩu mới (ví dụ: ít nhất 6 ký tự)
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!"); // Đặt thông báo lỗi
      return; // Dừng hàm
    }

    // --- Xử lý cập nhật mật khẩu ---

    // Lấy danh sách tất cả người dùng đã lưu trong localStorage.
    // Nếu chưa có key 'users', mặc định là mảng rỗng.
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    // Tạo một mảng người dùng mới bằng cách map qua danh sách cũ
    // Tìm người dùng có username trùng với người dùng hiện tại và cập nhật mật khẩu mới cho họ.
    // Giữ nguyên thông tin các người dùng khác.
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user.username
        ? { ...storedUser, password: newPassword } // Cập nhật mật khẩu
        : storedUser // Giữ nguyên người dùng khác
    );

    // Lưu danh sách người dùng đã cập nhật trở lại vào localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    // Cập nhật thông tin người dùng hiện tại trong localStorage (bao gồm mật khẩu mới)
    // Điều này giúp giữ cho AuthContext đồng bộ nếu AuthContext đọc từ localStorage
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...user, password: newPassword })
    );

    // --- Xử lý sau khi đổi mật khẩu thành công ---

    setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại."); // Đặt thông báo thành công
    // Reset các trường input mật khẩu về rỗng
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Tự động đăng xuất người dùng và đóng modal sau một khoảng thời gian (ví dụ: 2 giây)
    // Điều này buộc người dùng đăng nhập lại với mật khẩu mới
    setTimeout(() => {
      logout(); // Gọi hàm logout từ AuthContext
      onClose(); // Gọi hàm onClose để đóng modal
    }, 2000); // Chờ 2000ms (2 giây)
  };

  return (
    // Lớp overlay để tạo hiệu ứng nền mờ bên dưới modal
    <div className="modal-overlay">
      {/* Nội dung chính của modal */}
      <div className="modal-content">
        <h2>Thông tin người dùng</h2> {/* Tiêu đề modal */}

        {/* Phần hiển thị thông tin cơ bản của người dùng */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {/* Hiển thị username của người dùng. Sử dụng optional chaining (user?) để tránh lỗi
                nếu user là null/undefined, và cung cấp giá trị mặc định */}
            {user?.username || "Không có dữ liệu"}
          </p>
          {/* Có thể thêm các thông tin khác của người dùng tại đây nếu có */}
        </div>

        <h3>Đổi mật khẩu</h3> {/* Tiêu đề phần đổi mật khẩu */}

        {/* Form đổi mật khẩu */}
        <form onSubmit={handleChangePassword}>
          {/* Input cho mật khẩu cũ */}
          <input
            type="password" // Loại input là password để ẩn ký tự
            placeholder="Mật khẩu cũ"
            value={oldPassword} // Gán giá trị từ state
            onChange={(e) => setOldPassword(e.target.value)} // Cập nhật state khi input thay đổi
            required // Trường bắt buộc phải nhập
            aria-label="Nhập mật khẩu cũ" // Aria label cho khả năng tiếp cận
          />
          {/* Input cho mật khẩu mới */}
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu mới"
          />
          {/* Input để xác nhận mật khẩu mới */}
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label="Xác nhận mật khẩu mới"
          />

          {/* Hiển thị thông báo (lỗi hoặc thành công) nếu state 'message' có giá trị */}
          {message && (
            // Áp dụng class 'success' hoặc 'error' tùy thuộc vào nội dung thông báo
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message} {/* Nội dung thông báo */}
            </p>
          )}

          {/* Các nút trong modal */}
          <div className="modal-buttons">
            {/* Nút submit form đổi mật khẩu */}
            <button type="submit" className="confirm-button">
              Đổi mật khẩu
            </button>
            {/* Nút đóng modal */}
            <button
              type="button" // Quan trọng: đặt type="button" để tránh submit form
              className="cancel-button"
              onClick={onClose} // Gọi hàm onClose khi click
              aria-label="Đóng modal" // Aria label
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal; // Export component để có thể sử dụng ở nơi khác