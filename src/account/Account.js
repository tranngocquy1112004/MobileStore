import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";

// Constants cho các key của localStorage
// - Tách các key thành hằng số để tránh lỗi typo và dễ bảo trì
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Key lưu danh sách người dùng
  CURRENT_USER: "currentUser", // Key lưu thông tin người dùng hiện tại
};

// Constants cho các thông báo
// - Tách các message thành hằng số để dễ đọc và dễ thay đổi sau này
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!",
  USER_EXISTS: "Tên đăng nhập đã tồn tại!",
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.",
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGIN_FAILED: "Sai thông tin đăng nhập",
};

const Account = () => {
  // Hook để điều hướng người dùng (ví dụ: từ trang đăng nhập về /home)
  const navigate = useNavigate();

  // State để quản lý trạng thái đăng nhập
  // - isLoggedIn: Kiểm tra người dùng đã đăng nhập hay chưa
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State để xác định chế độ (đăng nhập hay đăng ký)
  // - isRegistering: true nếu đang ở chế độ đăng ký, false nếu đang ở chế độ đăng nhập
  const [isRegistering, setIsRegistering] = useState(false);

  // State để lưu thông tin nhập vào form
  // - user: Lưu username và password từ input
  const [user, setUser] = useState({ username: "", password: "" });

  // State để lưu thông tin người dùng hiện tại
  // - currentUser: Lấy từ localStorage, chứa thông tin người dùng đã đăng nhập
  const [currentUser, setCurrentUser] = useState(null);

  // State để hiển thị thông báo cho người dùng
  // - loginMessage: Hiển thị thông báo thành công hoặc lỗi
  const [loginMessage, setLoginMessage] = useState("");

  // Effect để kiểm tra trạng thái đăng nhập khi component mount
  // - Chạy một lần duy nhất khi component được render lần đầu (do dependency array rỗng [])
  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const savedUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER));
    // Nếu có người dùng đã đăng nhập, cập nhật state
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
    }
  }, []); // Dependency array rỗng để chỉ chạy một lần

  // Effect để điều hướng về /home khi đăng nhập thành công
  // - Chạy mỗi khi isLoggedIn hoặc currentUser thay đổi
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      // Chờ 1 giây để hiển thị thông báo trước khi điều hướng
      setTimeout(() => navigate("/home"), 1000);
    }
  }, [isLoggedIn, currentUser, navigate]); // Dependencies: isLoggedIn, currentUser, navigate

  // Hàm xử lý thay đổi input
  // - Cập nhật state user khi người dùng nhập username hoặc password
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy name và value từ input
    // Cập nhật state user, giữ nguyên các field khác
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    setLoginMessage("");
  };

  // Hàm xử lý đăng ký
  // - Thêm người dùng mới vào localStorage nếu hợp lệ
  const handleRegister = () => {
    const { username, password } = user; // Destructure username và password từ state

    // Kiểm tra xem người dùng đã nhập đủ thông tin chưa
    if (!username.trim() || !password.trim()) {
      setLoginMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    // Kiểm tra xem username đã tồn tại chưa
    if (storedUsers.some((u) => u.username === username)) {
      setLoginMessage(MESSAGES.USER_EXISTS);
      return;
    }

    // Thêm người dùng mới vào danh sách
    const updatedUsers = [...storedUsers, { username, password }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Hiển thị thông báo thành công và reset form
    setLoginMessage(MESSAGES.REGISTER_SUCCESS);
    setUser({ username: "", password: "" });
    // Chuyển về chế độ đăng nhập sau 1 giây
    setTimeout(() => setIsRegistering(false), 1000);
  };

  // Hàm xử lý đăng nhập
  // - Kiểm tra thông tin đăng nhập và lưu người dùng vào localStorage nếu hợp lệ
  const handleLogin = () => {
    const { username, password } = user; // Destructure username và password từ state

    // Kiểm tra xem người dùng đã nhập đủ thông tin chưa
    if (!username.trim() || !password.trim()) {
      setLoginMessage(MESSAGES.EMPTY_FIELDS);
      return;
    }

    // Lấy danh sách người dùng từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    // Tìm người dùng khớp với username và password
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    // Nếu tìm thấy người dùng
    if (foundUser) {
      // Lưu người dùng vào localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
      // Cập nhật state để hiển thị thông báo và điều hướng
      setIsLoggedIn(true);
      setCurrentUser(foundUser);
      setLoginMessage(MESSAGES.LOGIN_SUCCESS);
    } else {
      // Hiển thị thông báo lỗi nếu không tìm thấy
      setLoginMessage(MESSAGES.LOGIN_FAILED);
    }
  };

  // JSX để render giao diện
  return (
    <div className="account-container">
      <div className="account-box">
        {/* Hiển thị tiêu đề: Nếu đã đăng nhập thì chào người dùng, nếu không thì hiển thị "Đăng nhập / Đăng ký" */}
        <h1>{isLoggedIn ? `Xin chào, ${currentUser?.username}!` : "Đăng nhập / Đăng ký"}</h1>

        {/* Hiển thị form nếu chưa đăng nhập */}
        {!isLoggedIn && (
          <div>
            {/* Input cho username */}
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={user.username}
              onChange={handleChange}
            />
            {/* Input cho password */}
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={user.password}
              onChange={handleChange}
            />
            {/* Hiển thị thông báo (nếu có) */}
            {loginMessage && (
              <p
                className={`login-message ${
                  loginMessage.includes("thành công") ? "success" : ""
                }`}
              >
                {loginMessage}
              </p>
            )}
            {/* Các nút điều khiển */}
            <div className="account-buttons">
              {isRegistering ? (
                <>
                  {/* Nút đăng ký */}
                  <button className="account-button register-btn" onClick={handleRegister}>
                    Đăng ký
                  </button>
                  {/* Nút quay lại chế độ đăng nhập */}
                  <button
                    className="link-to-home"
                    onClick={() => setIsRegistering(false)}
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              ) : (
                <>
                  {/* Nút đăng nhập */}
                  <button className="account-button login-btn" onClick={handleLogin}>
                    Đăng nhập
                  </button>
                  {/* Nút chuyển sang chế độ đăng ký */}
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

export default Account;