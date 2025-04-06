// Import các thư viện và hook cần thiết từ React
import React, { useState, useEffect, useContext } from "react";
// Import hook điều hướng từ react-router-dom
import { useNavigate } from "react-router-dom";
// Import context xác thực
import { AuthContext } from "../account/AuthContext"; // Context quản lý trạng thái đăng nhập
// Import file CSS cho trang tài khoản
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
  const { isLoggedIn, login, logout } = useContext(AuthContext) || { // Lấy dữ liệu từ AuthContext, mặc định nếu không có
    isLoggedIn: false, // Trạng thái đăng nhập
    login: () => {}, // Hàm đăng nhập
    logout: () => {}, // Hàm đăng xuất
  };

  // State quản lý giao diện và dữ liệu
  const [isRegistering, setIsRegistering] = useState(false); // Chuyển đổi giữa đăng nhập/đăng ký
  const [formData, setFormData] = useState({ username: "", password: "" }); // Dữ liệu form (tên đăng nhập, mật khẩu)
  const [message, setMessage] = useState(""); // Thông báo hiển thị cho người dùng

  // useEffect để điều hướng khi đăng nhập thành công
  useEffect(() => {
    if (isLoggedIn) { // Nếu đã đăng nhập
      setTimeout(() => navigate("/home"), 1000); // Chuyển hướng về trang chủ sau 1 giây
    }
  }, [isLoggedIn, navigate]); // Dependency: isLoggedIn và navigate

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => { // Nhận sự kiện từ input
    const { name, value } = e.target; // Lấy tên và giá trị từ input
    setFormData((prev) => ({ ...prev, [name]: value })); // Cập nhật formData
    setMessage(""); // Xóa thông báo cũ khi người dùng nhập
  };

  // Xử lý đăng ký tài khoản
  const handleRegister = () => {
    const { username, password } = formData; // Lấy dữ liệu từ form
    if (!username.trim() || !password.trim()) { // Kiểm tra nếu thiếu thông tin
      setMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy danh sách người dùng từ localStorage
    if (storedUsers.some((u) => u.username === username)) { // Kiểm tra tên đăng nhập đã tồn tại chưa
      setMessage(MESSAGES.USER_EXISTS); // Hiển thị thông báo lỗi
      return;
    }

    const updatedUsers = [...storedUsers, { username, password }]; // Thêm người dùng mới vào danh sách
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)); // Lưu danh sách mới vào localStorage
    setMessage(MESSAGES.REGISTER_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form
    setTimeout(() => setIsRegistering(false), 1000); // Chuyển về chế độ đăng nhập sau 1 giây
  };

  // Xử lý đăng nhập
  const handleLogin = () => {
    const { username, password } = formData; // Lấy dữ liệu từ form
    if (!username.trim() || !password.trim()) { // Kiểm tra nếu thiếu thông tin
      setMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy danh sách người dùng từ localStorage
    const foundUser = storedUsers.find((u) => u.username === username && u.password === password); // Tìm người dùng khớp

    if (foundUser) { // Nếu tìm thấy người dùng
      login(foundUser); // Gọi hàm login từ context
      setMessage(MESSAGES.LOGIN_SUCCESS); // Hiển thị thông báo thành công
    } else { // Nếu không tìm thấy
      setMessage(MESSAGES.LOGIN_FAILED); // Hiển thị thông báo thất bại
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context
    setMessage(MESSAGES.LOGOUT_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Reset form
    setTimeout(() => navigate("/"), 1000); // Chuyển hướng về trang đăng nhập sau 1 giây
  };

  return (
    <div className="account-container"> {/* Container chính của trang */}
      <div className="account-box"> {/* Hộp chứa form */}
        <h1> {/* Tiêu đề thay đổi theo trạng thái đăng nhập */}
          {isLoggedIn ? `Xin chào, ${formData.username || "Người dùng"}!` : "Đăng nhập / Đăng ký"}
        </h1>

        {isLoggedIn ? ( // Nếu đã đăng nhập
          <div> {/* Container cho nội dung khi đã đăng nhập */}
            <p>Bạn đã đăng nhập thành công!</p> {/* Thông báo trạng thái */}
            <button className="account-button logout-btn" onClick={handleLogout}> {/* Nút đăng xuất */}
              Đăng xuất
            </button>
            {message && ( // Hiển thị thông báo nếu có
              <p className={`login-message ${message.includes("thành công") ? "success" : ""}`}>
                {message}
              </p>
            )}
          </div>
        ) : ( // Nếu chưa đăng nhập
          <div> {/* Container cho form đăng nhập/đăng ký */}
            <input
              type="text" // Input tên đăng nhập
              name="username" // Tên field
              placeholder="Tên đăng nhập" // Gợi ý nhập
              className="account-input" // Class cho style
              value={formData.username} // Giá trị từ state
              onChange={handleChange} // Xử lý thay đổi
            />
            <input
              type="password" // Input mật khẩu
              name="password" // Tên field
              placeholder="Mật khẩu" // Gợi ý nhập
              className="account-input" // Class cho style
              value={formData.password} // Giá trị từ state
              onChange={handleChange} // Xử lý thay đổi
            />
            {message && ( // Hiển thị thông báo nếu có
              <p className={`login-message ${message.includes("thành công") ? "success" : ""}`}>
                {message}
              </p>
            )}
            <div className="account-buttons"> {/* Container cho các nút */}
              {isRegistering ? ( // Nếu đang ở chế độ đăng ký
                <>
                  <button className="account-button register-btn" onClick={handleRegister}> {/* Nút đăng ký */}
                    Đăng ký
                  </button>
                  <button className="link-to-home" onClick={() => setIsRegistering(false)}> {/* Nút quay lại đăng nhập */}
                    Quay lại đăng nhập
                  </button>
                </>
              ) : ( // Nếu đang ở chế độ đăng nhập
                <>
                  <button className="account-button login-btn" onClick={handleLogin}> {/* Nút đăng nhập */}
                    Đăng nhập
                  </button>
                  <button className="link-to-home" onClick={() => setIsRegistering(true)}> {/* Nút chuyển sang đăng ký */}
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

export default Account; // Xuất component để sử dụng