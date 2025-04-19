import React, { useState, useEffect, useContext } from "react"; // Import các hook cần thiết từ React: useState để quản lý state, useEffect để thực hiện side effect, useContext để truy cập Context
import { useNavigate } from "react-router-dom"; // Import useNavigate để điều hướng người dùng bằng code
import { AuthContext } from "../account/AuthContext"; // Import AuthContext để truy cập trạng thái đăng nhập và các hàm login/logout
import "./Account.css"; // Import file CSS để định dạng giao diện trang Account

// --- Định nghĩa các hằng số ---

// Object chứa các key sử dụng để lưu trữ dữ liệu trong localStorage
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Key cho danh sách tất cả người dùng đã đăng ký
  CURRENT_USER: "currentUser", // Key cho thông tin người dùng hiện tại đang đăng nhập
};

// Object chứa các thông báo khác nhau hiển thị cho người dùng
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", // Thông báo khi một hoặc cả hai trường input bị bỏ trống
  USER_EXISTS: "Tên đăng nhập đã tồn tại!", // Thông báo khi người dùng cố gắng đăng ký một username đã có
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.", // Thông báo khi đăng ký tài khoản mới thành công
  LOGIN_SUCCESS: "Đăng nhập thành công!", // Thông báo khi đăng nhập thành công
  LOGIN_FAILED: "Sai thông tin đăng nhập!", // Thông báo khi đăng nhập thất bại (sai username hoặc password)
  LOGOUT_SUCCESS: "Đăng xuất thành công!", // Thông báo khi đăng xuất thành công
};

// --- Component chính Account: Xử lý logic và giao diện cho đăng nhập, đăng ký, đăng xuất ---
const Account = () => {
  const navigate = useNavigate(); // Sử dụng hook useNavigate để điều hướng người dùng
  // Sử dụng useContext để truy cập AuthContext.
  // Lấy trạng thái isLoggedIn và các hàm login, logout từ Context.
  // Cung cấp giá trị mặc định { isLoggedIn: false, login: () => {}, logout: () => {} }
  // để tránh lỗi nếu Context chưa được cung cấp hoặc các thuộc tính không tồn tại.
  const { isLoggedIn, login, logout } = useContext(AuthContext) || {
    isLoggedIn: false, // Mặc định chưa đăng nhập
    login: () => {}, // Mặc định hàm login rỗng
    logout: () => {}, // Mặc định hàm logout rỗng
  };

  // --- State quản lý trạng thái của Component Account ---
  // State boolean để xác định đang ở chế độ Đăng ký (true) hay Đăng nhập (false)
  const [isRegistering, setIsRegistering] = useState(false);
  // State object lưu dữ liệu từ các input form (username và password)
  const [formData, setFormData] = useState({ username: "", password: "" });
  // State lưu thông báo hiển thị cho người dùng (lỗi hoặc thành công)
  const [message, setMessage] = useState("");

  // --- Effect hook để điều hướng người dùng nếu đã đăng nhập ---
  // Effect này chạy mỗi khi state 'isLoggedIn' hoặc hàm 'navigate' thay đổi.
  useEffect(() => {
    // Nếu người dùng đã đăng nhập (isLoggedIn là true)
    if (isLoggedIn) {
      navigate("/home"); // Điều hướng họ đến trang "/home" (trang chủ)
    }
  }, [isLoggedIn, navigate]); // Dependency array: effect chạy lại khi isLoggedIn hoặc navigate thay đổi

  // --- Hàm xử lý sự kiện khi giá trị của các input form thay đổi ---
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy tên (name) và giá trị (value) của input đang thay đổi
    // Cập nhật state formData: giữ lại các giá trị cũ (...prev), chỉ cập nhật giá trị
    // của trường có tên (name) tương ứng với giá trị mới (value).
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(""); // Xóa bất kỳ thông báo nào đang hiển thị ngay khi người dùng bắt đầu gõ vào input
  };

  // --- Hàm xử lý logic khi người dùng nhấn nút Đăng ký ---
  const handleRegister = () => {
    const { username, password } = formData; // Lấy username và password từ state formData

    // 1. Kiểm tra xem các trường input có rỗng không
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi thiếu thông tin
      return; // Dừng hàm không xử lý tiếp
    }

    // 2. Lấy danh sách người dùng đã lưu từ localStorage
    // Nếu chưa có key 'users', mặc định là mảng rỗng [].
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];

    // 3. Kiểm tra xem tên đăng nhập đã tồn tại trong danh sách chưa
    const userExists = storedUsers.some((u) => u.username === username);
    if (userExists) {
      setMessage(MESSAGES.USER_EXISTS); // Hiển thị thông báo lỗi tên đăng nhập đã tồn tại
      return; // Dừng hàm
    }

    // 4. Nếu tên đăng nhập chưa tồn tại, thêm người dùng mới vào danh sách
    const updatedUsers = [...storedUsers, { username, password }]; // Tạo mảng mới bao gồm người dùng cũ và người dùng mới
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers)); // Lưu mảng người dùng đã cập nhật vào localStorage

    // 5. Thông báo đăng ký thành công và reset form
    setMessage(MESSAGES.REGISTER_SUCCESS); // Hiển thị thông báo thành công
    setFormData({ username: "", password: "" }); // Xóa dữ liệu đã nhập trong form
    // Sau một khoảng thời gian ngắn (1 giây), tự động chuyển về chế độ đăng nhập
    setTimeout(() => setIsRegistering(false), 1000);
  };

  // --- Hàm xử lý logic khi người dùng nhấn nút Đăng nhập ---
  const handleLogin = () => {
    const { username, password } = formData; // Lấy username và password từ state formData

    // 1. Kiểm tra xem các trường input có rỗng không
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi thiếu thông tin
      return; // Dừng hàm
    }

    // 2. Lấy danh sách người dùng đã lưu từ localStorage
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];

    // 3. Tìm người dùng trong danh sách có username và password khớp với dữ liệu nhập
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    // 4. Xử lý kết quả tìm kiếm
    if (foundUser) {
      login(foundUser); // Nếu tìm thấy người dùng, gọi hàm login từ AuthContext để cập nhật trạng thái đăng nhập
      setMessage(MESSAGES.LOGIN_SUCCESS); // Hiển thị thông báo đăng nhập thành công
      // Effect hook useEffect ở trên sẽ tự động điều hướng đến trang chủ sau khi isLoggedIn thay đổi thành true
    } else {
      setMessage(MESSAGES.LOGIN_FAILED); // Nếu không tìm thấy người dùng hoặc sai mật khẩu, hiển thị thông báo lỗi
    }
  };

  // --- Hàm xử lý logic khi người dùng nhấn nút Đăng xuất ---
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext để xóa thông tin người dùng hiện tại và cập nhật isLoggedIn
    setMessage(MESSAGES.LOGOUT_SUCCESS); // Hiển thị thông báo đăng xuất thành công
    // Không reset formData ở đây ngay lập tức để giữ lại username hiển thị trong tiêu đề trước khi điều hướng
    // setFormData({ username: "", password: "" }); // Có thể reset form ngay nếu muốn

    // Sau một khoảng thời gian ngắn (1 giây), điều hướng người dùng về trang gốc (trang đăng nhập/đăng ký ban đầu)
    setTimeout(() => navigate("/"), 1000);
  };

  // --- Render giao diện ---
  return (
    // Container chính bao quanh toàn bộ giao diện Account
    <div className="account-container">
      {/* Box chứa form hoặc thông báo */}
      <div className="account-box">
        {/* Tiêu đề của box, thay đổi dựa trên trạng thái đăng nhập và chế độ (đăng ký/đăng nhập) */}
        <h1>
          {isLoggedIn // Nếu đã đăng nhập
            ? `Xin chào, ${formData.username || "Người dùng"}!` // Hiển thị lời chào (sử dụng formData.username hoặc mặc định)
            : isRegistering // Nếu đang ở chế độ đăng ký
            ? "Đăng ký tài khoản" // Hiển thị tiêu đề Đăng ký
            : "Đăng nhập" // Nếu đang ở chế độ đăng nhập
          }
        </h1>

        {/* --- Phần giao diện hiển thị khi người dùng ĐÃ đăng nhập --- */}
        {isLoggedIn ? (
          <div className="logged-in-section">
            <p>Bạn đã đăng nhập thành công!</p> {/* Thông báo */}
            {/* Nút Đăng xuất */}
            <button
              className="account-button logout-btn"
              onClick={handleLogout} // Gắn hàm xử lý đăng xuất
              aria-label="Đăng xuất" // Aria label cho khả năng tiếp cận
            >
              Đăng xuất
            </button>
            {/* Hiển thị thông báo (ví dụ: Đăng xuất thành công) nếu có */}
            {message && (
              <p
                className={`message ${
                  // Áp dụng class 'success' hoặc 'error' tùy thuộc nội dung thông báo
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message} {/* Nội dung thông báo */}
              </p>
            )}
          </div>
        ) : (
          // --- Phần giao diện hiển thị khi người dùng CHƯA đăng nhập ---
          <div className="auth-form">
            {/* Input cho tên đăng nhập */}
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="account-input"
              value={formData.username} // Gán giá trị từ state
              onChange={handleChange} // Gắn hàm xử lý thay đổi input
              aria-label="Nhập tên đăng nhập"
            />
            {/* Input cho mật khẩu */}
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="account-input"
              value={formData.password} // Gán giá trị từ state
              onChange={handleChange} // Gắn hàm xử lý thay đổi input
              aria-label="Nhập mật khẩu"
            />
            {/* Hiển thị thông báo (lỗi hoặc thành công) nếu có */}
            {message && (
              <p
                className={`message ${
                  // Áp dụng class 'success' hoặc 'error' tùy thuộc nội dung thông báo
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message} {/* Nội dung thông báo */}
              </p>
            )}
            {/* Nhóm các nút hành động (Đăng nhập/Đăng ký và chuyển đổi chế độ) */}
            <div className="account-buttons">
              {/* --- Hiển thị các nút khi ở chế độ Đăng ký (isRegistering là true) --- */}
              {isRegistering ? (
                <>
                  {/* Nút Đăng ký */}
                  <button
                    className="account-button register-btn"
                    onClick={handleRegister} // Gắn hàm xử lý đăng ký
                    aria-label="Đăng ký tài khoản"
                  >
                    Đăng ký
                  </button>
                  {/* Nút chuyển về chế độ Đăng nhập */}
                  <button
                    className="link-to-home" // Có thể đổi tên class cho phù hợp hơn, ví dụ: toggle-mode-button
                    onClick={() => setIsRegistering(false)} // Click để chuyển isRegistering về false
                    aria-label="Quay lại đăng nhập"
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              ) : (
                // --- Hiển thị các nút khi ở chế độ Đăng nhập (isRegistering là false) ---
                <>
                  {/* Nút Đăng nhập */}
                  <button
                    className="account-button login-btn"
                    onClick={handleLogin} // Gắn hàm xử lý đăng nhập
                    aria-label="Đăng nhập"
                  >
                    Đăng nhập
                  </button>
                  {/* Nút chuyển sang chế độ Đăng ký */}
                  <button
                    className="link-to-home" // Có thể đổi tên class, ví dụ: toggle-mode-button
                    onClick={() => setIsRegistering(true)} // Click để chuyển isRegistering về true
                    aria-label="Chuyển sang đăng ký"
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

export default Account; // Export component Account để sử dụng ở nơi khác