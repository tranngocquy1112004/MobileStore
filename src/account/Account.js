import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Hook để điều hướng trang
import { AuthContext } from "../account/AuthContext"; // Context quản lý trạng thái đăng nhập
import "./Account.css"; // File style cho giao diện

// Định nghĩa các key dùng cho localStorage
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Key lưu danh sách người dùng
  CURRENT_USER: "currentUser", // Key lưu thông tin người dùng hiện tại
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
  const navigate = useNavigate(); // Hook để điều hướng trang
  const { isLoggedIn, login, logout } = useContext(AuthContext) || {
    isLoggedIn: false, // Trạng thái đăng nhập, mặc định false nếu không có context
    login: () => {}, // Hàm đăng nhập mặc định rỗng
    logout: () => {}, // Hàm đăng xuất mặc định rỗng
  };

  const [isRegistering, setIsRegistering] = useState(false); // State chuyển đổi giữa đăng nhập/đăng ký
  const [formData, setFormData] = useState({ username: "", password: "" }); // State lưu dữ liệu form
  const [message, setMessage] = useState(""); // State lưu thông báo cho người dùng

  // Điều hướng ngay lập tức đến /home nếu đã đăng nhập khi trang được tải
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home"); // Chuyển hướng ngay lập tức đến trang chủ nếu đã đăng nhập
    }
  }, [isLoggedIn, navigate]); // Dependency: chạy lại khi isLoggedIn hoặc navigate thay đổi

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy tên và giá trị từ input
    setFormData((prev) => ({ ...prev, [name]: value })); // Cập nhật dữ liệu form
    setMessage(""); // Xóa thông báo cũ khi người dùng nhập
  };

  // Xử lý đăng ký tài khoản
  const handleRegister = () => {
    const { username, password } = formData;
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Báo lỗi nếu thiếu thông tin
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy danh sách người dùng từ localStorage
    if (storedUsers.some((u) => u.username === username)) {
      setMessage(MESSAGES.USER_EXISTS); // Báo lỗi nếu tên đăng nhập đã tồn tại
      return;
    }

    const updatedUsers = [...storedUsers, { username, password }]; // Thêm người dùng mới
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)); // Lưu lại danh sách
    setMessage(MESSAGES.REGISTER_SUCCESS); // Thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form
    setTimeout(() => setIsRegistering(false), 1000); // Chuyển về chế độ đăng nhập sau 1 giây
  };

  // Xử lý đăng nhập
  const handleLogin = () => {
    const { username, password } = formData;
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Báo lỗi nếu thiếu thông tin
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy danh sách người dùng
    const foundUser = storedUsers.find((u) => u.username === username && u.password === password); // Tìm user khớp

    if (foundUser) {
      login(foundUser); // Gọi hàm login từ context
      setMessage(MESSAGES.LOGIN_SUCCESS); // Thông báo thành công
    } else {
      setMessage(MESSAGES.LOGIN_FAILED); // Thông báo thất bại
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context
    setMessage(MESSAGES.LOGOUT_SUCCESS); // Thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form
    setTimeout(() => navigate("/"), 1000); // Chuyển hướng về trang đăng nhập sau 1 giây
  };

  // Giao diện chính
  return (
    <div className="account-container">
      <div className="account-box">
        <h1>
          {isLoggedIn ? `Xin chào, ${formData.username || "Người dùng"}!` : "Đăng nhập / Đăng ký"} {/* Tiêu đề thay đổi theo trạng thái */}
        </h1>

        {isLoggedIn ? (
          <div>
            <p>Bạn đã đăng nhập thành công!</p> {/* Thông báo khi đã đăng nhập */}
            <button className="account-button logout-btn" onClick={handleLogout}>
              Đăng xuất {/* Nút đăng xuất */}
            </button>
            {message && (
              <p className={`login-message ${message.includes("thành công") ? "success" : ""}`}>
                {message} {/* Hiển thị thông báo */}
              </p>
            )}
          </div>
        ) : (
          <div>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={formData.username}
              onChange={handleChange} // Cập nhật khi nhập tên đăng nhập
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={formData.password}
              onChange={handleChange} // Cập nhật khi nhập mật khẩu
            />
            {message && (
              <p className={`login-message ${message.includes("thành công") ? "success" : ""}`}>
                {message} {/* Hiển thị thông báo */}
              </p>
            )}
            <div className="account-buttons">
              {isRegistering ? (
                <>
                  <button className="account-button register-btn" onClick={handleRegister}>
                    Đăng ký {/* Nút đăng ký */}
                  </button>
                  <button className="link-to-home" onClick={() => setIsRegistering(false)}>
                    Quay lại đăng nhập {/* Nút quay lại chế độ đăng nhập */}
                  </button>
                </>
              ) : (
                <>
                  <button className="account-button login-btn" onClick={handleLogin}>
                    Đăng nhập {/* Nút đăng nhập */}
                  </button>
                  <button className="link-to-home" onClick={() => setIsRegistering(true)}>
                    Chưa có tài khoản? Đăng ký {/* Nút chuyển sang đăng ký */}
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