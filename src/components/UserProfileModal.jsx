// src/components/UserProfileModal.js

// Import necessary React hooks: useState, useContext, useCallback
import React, { useState, useContext, useCallback } from "react";
// Import AuthContext for user data and logout function
import { AuthContext } from "../account/AuthContext"; // Giả định đường dẫn AuthContext là đúng
// Import CSS for styling
import "./UserProfileModal.css";

// --- Hằng số cục bộ ---

// Key để lưu trữ tất cả người dùng đã đăng ký trong localStorage
const LOCAL_STORAGE_USERS_KEY = "users";
// Key để lưu trữ người dùng hiện đang đăng nhập trong localStorage (giả định AuthContext sử dụng key này)
const LOCAL_STORAGE_CURRENT_USER_KEY = "currentUser"; // Định nghĩa hằng số cho tính nhất quán
// Yêu cầu độ dài tối thiểu cho mật khẩu mới
const MIN_PASSWORD_LENGTH = 6;

// --- Component UserProfileModal ---
// Hiển thị thông tin cơ bản của người dùng và form đổi mật khẩu.
// Nhận prop onClose: Hàm được gọi khi modal cần đóng.
const UserProfileModal = ({ onClose }) => {
  // Truy cập dữ liệu người dùng và hàm logout từ AuthContext
  // Sử dụng optional chaining và giá trị mặc định để an toàn nếu Context chưa sẵn sàng
  const { user, logout } = useContext(AuthContext) || { user: null, logout: () => {} };

  // --- State cho các input form và thông báo phản hồi ---
  const [oldPassword, setOldPassword] = useState(""); // State cho input mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // State cho input mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // State cho input xác nhận mật khẩu
  const [message, setMessage] = useState(""); // State cho thông báo thành công/lỗi

  // --- Handler cho việc submit form đổi mật khẩu ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const handleChangePassword = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn hành vi submit form mặc định

    setMessage(""); // Xóa thông báo trước đó

    // --- Kiểm tra dữ liệu (Validation Checks) ---
    // Kiểm tra mật khẩu cũ có khớp với mật khẩu của người dùng hiện tại không
    // Sử dụng optional chaining để truy cập user?.password an toàn
    if (oldPassword !== user?.password) {
      setMessage("Mật khẩu cũ không đúng!");
      return; // Dừng nếu mật khẩu cũ không khớp
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp nhau không
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return; // Dừng nếu mật khẩu xác nhận không khớp
    }

    // Kiểm tra độ dài tối thiểu của mật khẩu mới
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setMessage(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`);
      return; // Dừng nếu mật khẩu quá ngắn
    }

    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    if (newPassword === oldPassword) {
        setMessage("Mật khẩu mới không được trùng với mật khẩu cũ!");
        return; // Dừng nếu mật khẩu mới trùng với mật khẩu cũ
    }


    // --- Cập nhật mật khẩu trong localStorage (Chỉ dành cho Demo Frontend - KHÔNG AN TOÀN) ---
    // CẢNH BÁO: Lưu trữ mật khẩu dạng văn bản thuần trong localStorage là cực kỳ không an toàn.
    // Trong ứng dụng thực tế, hãy xử lý việc đổi mật khẩu thông qua một API backend an toàn.

    // Tải tất cả người dùng từ localStorage
    let storedUsers = [];
    const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (storedUsersData) {
        try {
             // Cố gắng parse dữ liệu JSON
            storedUsers = JSON.parse(storedUsersData);
            // Đảm bảo kết quả parse là một mảng
            if (!Array.isArray(storedUsers)) {
                 console.warn("Dữ liệu người dùng trong localStorage không phải là mảng sau parse.");
                 storedUsers = []; // Sử dụng mảng rỗng nếu không phải mảng
            }
        } catch (error) {
             console.error("Lỗi khi đọc danh sách người dùng từ localStorage:", error);
             // Nếu parse thất bại, tiếp tục với mảng rỗng
             storedUsers = [];
             // Tùy chọn: xóa dữ liệu bị lỗi nếu parse thất bại
             // localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
        }
    }


    // Tìm và cập nhật mật khẩu của người dùng hiện tại trong danh sách người dùng
    const updatedUsers = storedUsers.map((storedUser) =>
      // So sánh username một cách an toàn
      (storedUser && storedUser.username === user?.username)
        ? { ...storedUser, password: newPassword } // Cập nhật mật khẩu
        : storedUser // Giữ nguyên các người dùng khác
    ).filter(Boolean); // Lọc bỏ các giá trị null/undefined có thể xuất hiện nếu dữ liệu ban đầu bị lỗi


    // Lưu danh sách người dùng đã cập nhật trở lại localStorage
    try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
        console.error("Lỗi khi lưu danh sách người dùng cập nhật vào localStorage:", error);
        setMessage("Lỗi hệ thống khi lưu mật khẩu mới."); // Hiển thị thông báo lỗi
        return; // Dừng nếu việc lưu thất bại
    }


    // Cập nhật thông tin người dùng đã đăng nhập trong localStorage (giả định AuthContext đọc key này)
    // Đảm bảo đối tượng user tồn tại trước khi lưu
    if (user) {
        try {
             localStorage.setItem(
                LOCAL_STORAGE_CURRENT_USER_KEY, // Sử dụng hằng số key
                JSON.stringify({ ...user, password: newPassword }) // Cập nhật mật khẩu trong đối tượng người dùng hiện tại
             );
        } catch (error) {
             console.error("Lỗi khi lưu thông tin người dùng hiện tại cập nhật vào localStorage:", error);
             // Tiếp tục ngay cả khi việc lưu này thất bại, danh sách người dùng chính đã được cập nhật
        }
    }


    // --- Xử lý khi đổi mật khẩu thành công ---
    setMessage(`Đổi mật khẩu thành công! Vui lòng đăng nhập lại.`); // Thông báo thành công
    // Xóa nội dung các input form
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Đăng xuất và đóng modal sau một khoảng trễ (buộc người dùng đăng nhập lại với mật khẩu mới)
    setTimeout(() => {
      logout(); // Gọi hàm logout
      onClose(); // Gọi prop onClose để đóng modal
    }, 2000); // Trễ 2 giây
  }, [user, oldPassword, newPassword, confirmPassword, logout, onClose]); // Dependencies: user, các state input, logout, onClose

  // --- Render UI Modal ---
  return (
    // Lớp phủ modal cho nền mờ
    // Thêm onClick={onClose} ở đây nếu muốn click bên ngoài modal sẽ đóng nó
    <div className="modal-overlay">
      {/* Container nội dung modal */}
      {/* Ngăn chặn sự kiện click lan truyền để tránh click bên trong đóng modal nếu overlay có onClick */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Thông tin người dùng</h2> {/* Tiêu đề modal */}

        {/* --- Phần thông tin cơ bản của người dùng --- */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {/* Hiển thị username một cách an toàn */}
            {user?.username || "Không có dữ liệu"}
          </p>
          {/* Thêm các thông tin người dùng khác ở đây nếu có trong đối tượng 'user' */}
        </div>

        <h3>Đổi mật khẩu</h3> {/* Tiêu đề phần đổi mật khẩu */}

        {/* --- Form đổi mật khẩu --- */}
        {/* Gắn handler onSubmit vào form */}
        <form onSubmit={handleChangePassword}>
          {/* Input mật khẩu cũ */}
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu cũ"
            autoComplete="current-password" // Gợi ý mật khẩu hiện tại cho trình duyệt
          />
          {/* Input mật khẩu mới */}
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu mới"
            autoComplete="new-password" // Gợi ý mật khẩu mới cho trình duyệt
            minLength={MIN_PASSWORD_LENGTH} // Sử dụng hằng số cho độ dài tối thiểu
          />
          {/* Input xác nhận mật khẩu mới */}
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label="Xác nhận mật khẩu mới"
            autoComplete="new-password" // Gợi ý mật khẩu mới cho trình duyệt
            minLength={MIN_PASSWORD_LENGTH} // Sử dụng hằng số cho độ dài tối thiểu
          />

          {/* --- Hiển thị thông báo --- */}
          {/* Chỉ hiển thị thông báo nếu state message không rỗng */}
          {message && (
            // Áp dụng class success/error dựa trên nội dung thông báo
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message}
            </p>
          )}

          {/* --- Các nút hành động của Modal --- */}
          <div className="modal-buttons">
            {/* Nút submit cho form */}
            <button type="submit" className="confirm-button">
              Đổi mật khẩu
            </button>
            {/* Nút đóng modal */}
            <button
              type="button" // Đặt type="button" để ngăn nút này submit form
              className="cancel-button"
              onClick={onClose} // Gọi prop onClose
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

export default UserProfileModal; // Export component UserProfileModal
