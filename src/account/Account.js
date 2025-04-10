import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Hook để điều hướng trang
import { AuthContext } from "../account/AuthContext"; // Context quản lý trạng thái đăng nhập
import "./Account.css"; // File CSS để định dạng giao diện

// Định nghĩa các key dùng cho localStorage
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Key để lưu danh sách người dùng trong localStorage
  CURRENT_USER: "currentUser", // Key để lưu thông tin người dùng hiện tại
};

// Định nghĩa các thông báo cố định
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", // Thông báo khi thiếu thông tin
  USER_EXISTS: "Tên đăng nhập đã tồn tại!", // Thông báo khi tên đăng nhập bị trùng
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.", // Thông báo khi đăng ký thành công
  LOGIN_SUCCESS: "Đăng nhập thành công!", // Thông báo khi đăng nhập thành công
  LOGIN_FAILED: "Sai thông tin đăng nhập", // Thông báo khi đăng nhập thất bại
  LOGOUT_SUCCESS: "Đăng xuất thành công!", // Thông báo khi đăng xuất thành công
};

// Component chính Account - Trang quản lý tài khoản
const Account = () => {
  const navigate = useNavigate(); // Hook để điều hướng người dùng đến các trang khác
  const { isLoggedIn, login, logout } = useContext(AuthContext) || {
    isLoggedIn: false, // Trạng thái đăng nhập, mặc định là false nếu không có context
    login: () => {}, // Hàm đăng nhập mặc định rỗng nếu không có context
    logout: () => {}, // Hàm đăng xuất mặc định rỗng nếu không có context
  };

  const [isRegistering, setIsRegistering] = useState(false); // State kiểm soát chế độ (đăng nhập hay đăng ký)
  const [formData, setFormData] = useState({ username: "", password: "" }); // State lưu dữ liệu form (tên đăng nhập và mật khẩu)
  const [message, setMessage] = useState(""); // State lưu thông báo hiển thị cho người dùng

  // Điều hướng đến trang chủ nếu đã đăng nhập khi component mount
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home"); // Chuyển hướng ngay lập tức đến trang chủ nếu đã đăng nhập
    }
  }, [isLoggedIn, navigate]); // Dependency: chạy lại khi isLoggedIn hoặc navigate thay đổi

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy name và value từ input
    setFormData((prev) => ({ ...prev, [name]: value })); // Cập nhật dữ liệu form tương ứng
    setMessage(""); // Xóa thông báo cũ khi người dùng bắt đầu nhập
  };

  // Xử lý đăng ký tài khoản
  const handleRegister = () => {
    const { username, password } = formData;
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Thông báo lỗi nếu thiếu thông tin
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy danh sách người dùng từ localStorage
    if (storedUsers.some((u) => u.username === username)) {
      setMessage(MESSAGES.USER_EXISTS); // Thông báo lỗi nếu tên đăng nhập đã tồn tại
      return;
    }

    const updatedUsers = [...storedUsers, { username, password }]; // Thêm người dùng mới vào danh sách
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)); // Lưu danh sách mới vào localStorage
    setMessage(MESSAGES.REGISTER_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form về rỗng
    setTimeout(() => setIsRegistering(false), 1000); // Chuyển về chế độ đăng nhập sau 1 giây
  };

  // Xử lý đăng nhập
  const handleLogin = () => {
    const { username, password } = formData;
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Thông báo lỗi nếu thiếu thông tin
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy danh sách người dùng từ localStorage
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    ); // Tìm người dùng khớp với thông tin nhập

    if (foundUser) {
      login(foundUser); // Gọi hàm login từ AuthContext với thông tin người dùng
      setMessage(MESSAGES.LOGIN_SUCCESS); // Hiển thị thông báo thành công
    } else {
      setMessage(MESSAGES.LOGIN_FAILED); // Hiển thị thông báo thất bại nếu không tìm thấy
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
    setMessage(MESSAGES.LOGOUT_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form về rỗng
    setTimeout(() => navigate("/"), 1000); // Chuyển hướng về trang đăng nhập sau 1 giây
  };

  // Giao diện chính của trang
  return (
    <div className="account-container">
      <div className="account-box">
        <h1>
          {isLoggedIn
            ? `Xin chào, ${formData.username || "Người dùng"}!`
            : "Đăng nhập / Đăng ký"}
        </h1> {/* Tiêu đề thay đổi tùy trạng thái đăng nhập */}

        {isLoggedIn ? (
          <div>
            <p>Bạn đã đăng nhập thành công!</p> {/* Thông báo khi đã đăng nhập */}
            <button
              className="account-button logout-btn" // Class CSS cho nút đăng xuất
              onClick={handleLogout} // Gọi hàm đăng xuất khi nhấn
            >
              Đăng xuất
            </button>
            {message && (
              <p
                className={`login-message ${
                  message.includes("thành công") ? "success" : ""
                }`}
              >
                {message}
              </p> // Hiển thị thông báo với class thay đổi tùy nội dung
            )}
          </div>
        ) : (
          <div>
            <input
              type="text" // Input kiểu văn bản
              name="username" // Tên trường để xử lý trong handleChange
              placeholder="Tên đăng nhập" // Văn bản gợi ý
              className="account-input" // Class CSS để định dạng
              value={formData.username} // Giá trị hiện tại của ô nhập
              onChange={handleChange} // Xử lý khi người dùng nhập
            />
            <input
              type="password" // Input kiểu mật khẩu
              name="password" // Tên trường để xử lý trong handleChange
              placeholder="Mật khẩu" // Văn bản gợi ý
              className="account-input" // Class CSS để định dạng
              value={formData.password} // Giá trị hiện tại của ô nhập
              onChange={handleChange} // Xử lý khi người dùng nhập
            />
            {message && (
              <p
                className={`login-message ${
                  message.includes("thành công") ? "success" : ""
                }`}
              >
                {message}
              </p> // Hiển thị thông báo với class thay đổi tùy nội dung
            )}
            <div className="account-buttons">
              {isRegistering ? (
                <>
                  <button
                    className="account-button register-btn" // Class CSS cho nút đăng ký
                    onClick={handleRegister} // Gọi hàm đăng ký khi nhấn
                  >
                    Đăng ký
                  </button>
                  <button
                    className="link-to-home" // Class CSS cho nút chuyển chế độ
                    onClick={() => setIsRegistering(false)} // Chuyển về chế độ đăng nhập
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="account-button login-btn" // Class CSS cho nút đăng nhập
                    onClick={handleLogin} // Gọi hàm đăng nhập khi nhấn
                  >
                    Đăng nhập
                  </button>
                  <button
                    className="link-to-home" // Class CSS cho nút chuyển chế độ
                    onClick={() => setIsRegistering(true)} // Chuyển sang chế độ đăng ký
                  >
                    Chưa có tài khoản? Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account; // Xuất component để sử dụng ở nơi khác