import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext"; // Import AuthContext từ file khác
import "./Account.css"; // Import file CSS để định dạng giao diện

// Constants - Các hằng số cố định để dễ quản lý và tái sử dụng
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Key lưu danh sách người dùng trong localStorage
  CURRENT_USER: "currentUser", // Key lưu thông tin người dùng hiện tại
};

const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", // Thông báo khi để trống
  USER_EXISTS: "Tên đăng nhập đã tồn tại!", // Thông báo khi tên đăng nhập đã được dùng
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.", // Thông báo đăng ký thành công
  LOGIN_SUCCESS: "Đăng nhập thành công!", // Thông báo đăng nhập thành công
  LOGIN_FAILED: "Sai thông tin đăng nhập", // Thông báo đăng nhập thất bại
  LOGOUT_SUCCESS: "Đăng xuất thành công!", // Thông báo đăng xuất thành công
};

// Component Account - Quản lý giao diện đăng nhập/đăng ký/đăng xuất
const Account = () => {
  const navigate = useNavigate(); // Hook để điều hướng giữa các trang
  const authContext = useContext(AuthContext); // Lấy giá trị từ AuthContext
  // Giải cấu trúc authContext, cung cấp giá trị mặc định nếu context không tồn tại
  const { isLoggedIn, login, logout } = authContext || {
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
  };

  // State quản lý trạng thái đăng ký (true: đang đăng ký, false: đang đăng nhập)
  const [isRegistering, setIsRegistering] = useState(false);
  // State quản lý thông tin form (username và password)
  const [user, setUser] = useState({ username: "", password: "" });
  // State quản lý thông báo hiển thị cho người dùng
  const [loginMessage, setLoginMessage] = useState("");

  // Hook useEffect để điều hướng sau khi đăng nhập thành công
  useEffect(() => {
    if (isLoggedIn) {
      // Nếu đã đăng nhập, chờ 1 giây rồi chuyển hướng về trang "/home"
      setTimeout(() => navigate("/home"), 1000);
    }
  }, [isLoggedIn, navigate]); // Chạy lại khi isLoggedIn hoặc navigate thay đổi

  // Xử lý thay đổi giá trị trong input
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy name và value từ input
    // Cập nhật state user bằng cách giữ lại các giá trị cũ và thay đổi giá trị mới
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
    setLoginMessage(""); // Xóa thông báo khi người dùng bắt đầu nhập lại
  };

  // Xử lý đăng ký tài khoản mới
  const handleRegister = () => {
    const { username, password } = user; // Giải cấu trúc thông tin từ state user

    // Kiểm tra nếu username hoặc password để trống
    if (!username.trim() || !password.trim()) {
      setLoginMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi
      return;
    }

    // Lấy danh sách người dùng từ localStorage, mặc định là mảng rỗng nếu không có
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    // Kiểm tra xem username đã tồn tại chưa
    if (storedUsers.some((u) => u.username === username)) {
      setLoginMessage(MESSAGES.USER_EXISTS); // Hiển thị thông báo lỗi
      return;
    }

    // Thêm người dùng mới vào danh sách
    const updatedUsers = [...storedUsers, { username, password }];
    // Lưu danh sách người dùng mới vào localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    setLoginMessage(MESSAGES.REGISTER_SUCCESS); // Hiển thị thông báo thành công
    setUser({ username: "", password: "" }); // Reset form
    // Chuyển về chế độ đăng nhập sau 1 giây
    setTimeout(() => setIsRegistering(false), 1000);
  };

  // Xử lý đăng nhập
  const handleLogin = () => {
    const { username, password } = user; // Giải cấu trúc thông tin từ state user

    // Kiểm tra nếu username hoặc password để trống
    if (!username.trim() || !password.trim()) {
      setLoginMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi
      return;
    }

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    // Tìm người dùng khớp với username và password
    const foundUser = storedUsers.find((u) => u.username === username && u.password === password);

    if (foundUser) {
      login(foundUser); // Gọi hàm login từ AuthContext để cập nhật trạng thái
      setLoginMessage(MESSAGES.LOGIN_SUCCESS); // Hiển thị thông báo thành công
    } else {
      setLoginMessage(MESSAGES.LOGIN_FAILED); // Hiển thị thông báo thất bại
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext để reset trạng thái
    setLoginMessage(MESSAGES.LOGOUT_SUCCESS); // Hiển thị thông báo thành công
    setUser({ username: "", password: "" }); // Reset form
    // Chuyển hướng về trang đăng nhập sau 1 giây
    setTimeout(() => navigate("/"), 1000);
  };

  // Render giao diện
  return (
    <div className="account-container">
      <div className="account-box">
        {/* Tiêu đề thay đổi tùy theo trạng thái đăng nhập */}
        <h1>
          {isLoggedIn
            ? `Xin chào, ${user?.username || "Người dùng"}!`
            : "Đăng nhập / Đăng ký"}
        </h1>

        {isLoggedIn ? (
          // Giao diện khi đã đăng nhập
          <div>
            <p>Bạn đã đăng nhập thành công!</p>
            <button className="account-button logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
            {/* Hiển thị thông báo nếu có */}
            {loginMessage && (
              <p
                className={`login-message ${
                  loginMessage.includes("thành công") ? "success" : ""
                }`}
              >
                {loginMessage}
              </p>
            )}
          </div>
        ) : (
          // Giao diện khi chưa đăng nhập
          <div>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={user.username} // Giá trị từ state
              onChange={handleChange} // Gọi hàm xử lý khi thay đổi
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={user.password} // Giá trị từ state
              onChange={handleChange} // Gọi hàm xử lý khi thay đổi
            />
            {/* Hiển thị thông báo nếu có */}
            {loginMessage && (
              <p
                className={`login-message ${
                  loginMessage.includes("thành công") ? "success" : ""
                }`}
              >
                {loginMessage}
              </p>
            )}
            <div className="account-buttons">
              {isRegistering ? (
                // Nút khi đang ở chế độ đăng ký
                <>
                  <button className="account-button register-btn" onClick={handleRegister}>
                    Đăng ký
                  </button>
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(false)}
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              ) : (
                // Nút khi đang ở chế độ đăng nhập
                <>
                  <button className="account-button login-btn" onClick={handleLogin}>
                    Đăng nhập
                  </button>
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(true)}
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