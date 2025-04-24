import React, { useState, useEffect, useContext, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useState để quản lý trạng thái cục bộ (như dữ liệu form, trạng thái hiển thị form đăng ký/đăng nhập, thông báo), useEffect để thực hiện các tác vụ phụ (side effects) như tự động điều hướng sau khi đăng nhập, useContext để truy cập vào Context API (AuthContext) nhằm lấy trạng thái xác thực và các hàm login/logout, và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện (như xử lý nhập liệu, đăng ký, đăng nhập, đăng xuất), giúp tối ưu hiệu suất bằng cách ngăn các hàm này được tạo lại không cần thiết qua mỗi lần render.
import { useNavigate } from "react-router-dom"; // Import hook useNavigate từ react-router-dom để thực hiện điều hướng trang theo chương trình (bằng code JavaScript) sau khi người dùng thực hiện các hành động như đăng nhập thành công hoặc đăng xuất.
import { AuthContext } from "../account/AuthContext"; // Import AuthContext từ đường dẫn tương đối. Context này chứa thông tin về trạng thái đăng nhập của người dùng (đã đăng nhập hay chưa - isLoggedIn) và các hàm để thay đổi trạng thái đó (login để đăng nhập, logout để đăng xuất). Component Account sẽ sử dụng Context này để cập nhật trạng thái xác thực toàn ứng dụng.
import "./Account.css"; // Import file CSS để định dạng giao diện cho component Account này (ví dụ: kiểu dáng form, nút, thông báo).

// --- Định nghĩa các hằng số ---

// Object chứa các khóa (keys) được sử dụng để lưu trữ và truy xuất dữ liệu từ localStorage của trình duyệt.
// Việc sử dụng hằng số giúp tránh gõ sai key ở các nơi khác nhau trong ứng dụng và dễ dàng quản lý/thay đổi key nếu cần.
const LOCAL_STORAGE_KEYS = {
  USERS: "users", // Khóa dùng để lưu trữ danh sách tất cả người dùng đã đăng ký (lưu tạm trên trình duyệt cho mục đích demo).
  CURRENT_USER: "currentUser", // Khóa này thường được AuthContext sử dụng để lưu thông tin người dùng đang đăng nhập.
};

// Object chứa các chuỗi thông báo sẽ hiển thị cho người dùng trên giao diện, giúp dễ dàng quản lý và thay đổi nội dung thông báo.
const MESSAGES = {
  EMPTY_FIELDS: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", // Thông báo hiển thị khi người dùng để trống một hoặc cả hai trường nhập liệu khi đăng nhập/đăng ký.
  USER_EXISTS: "Tên đăng nhập đã tồn tại!", // Thông báo hiển thị khi người dùng cố gắng đăng ký một tên đăng nhập mà người khác đã sử dụng.
  REGISTER_SUCCESS: "Đăng ký thành công! Hãy đăng nhập.", // Thông báo khi quá trình đăng ký tài khoản mới thành công.
  LOGIN_SUCCESS: "Đăng nhập thành công!", // Thông báo khi người dùng đăng nhập vào hệ thống thành công.
  LOGIN_FAILED: "Sai thông tin đăng nhập!", // Thông báo khi người dùng nhập sai tên đăng nhập hoặc mật khẩu khi đăng nhập.
  LOGOUT_SUCCESS: "Đăng xuất thành công!", // Thông báo khi người dùng đăng xuất khỏi hệ thống thành công.
};

// --- Component chính Account: Xử lý logic và giao diện cho các chức năng đăng nhập, đăng ký, và đăng xuất ---
// Component này hiển thị form đăng nhập hoặc đăng ký, xử lý logic xác thực (tạm thời với localStorage),
// và tương tác với AuthContext để cập nhật trạng thái đăng nhập toàn ứng dụng.
const Account = () => {
  const navigate = useNavigate(); // Gán hook useNavigate vào biến navigate để sử dụng cho việc điều hướng trang.

  // Sử dụng hook useContext để truy cập vào AuthContext và lấy ra các giá trị được cung cấp bởi AuthProvider:
  // - isLoggedIn: Trạng thái boolean cho biết người dùng đã đăng nhập hay chưa.
  // - login: Hàm để thực hiện đăng nhập (được cung cấp bởi AuthProvider).
  // - logout: Hàm để thực hiện đăng xuất (được cung cấp bởi AuthProvider).
  // Cung cấp giá trị mặc định `{ isLoggedIn: false, login: () => {}, logout: () => {} }`
  // để đảm bảo ứng dụng không gặp lỗi nếu AuthContext chưa được cung cấp đầy đủ (ví dụ: quên bọc ứng dụng bằng AuthProvider)
  // hoặc component được render ngoài cây Provider.
  const { isLoggedIn, login, logout } = useContext(AuthContext) || {
    isLoggedIn: false, // Giá trị mặc định cho trạng thái đăng nhập
    login: () => {}, // Hàm rỗng mặc định cho login
    logout: () => {}, // Hàm rỗng mặc định cho logout
  };

  // --- State quản lý trạng thái của Component Account ---
  // State boolean 'isRegistering': Kiểm soát việc hiển thị form Đăng ký (true) hay form Đăng nhập (false). Ban đầu là false (hiển thị form Đăng nhập).
  const [isRegistering, setIsRegistering] = useState(false);
  // State object 'formData': Lưu trữ dữ liệu từ các trường nhập liệu của form (tên đăng nhập và mật khẩu). Ban đầu là object rỗng với username và password là chuỗi rỗng.
  const [formData, setFormData] = useState({ username: "", password: "" });
  // State string 'message': Lưu trữ nội dung thông báo hiển thị cho người dùng (ví dụ: thông báo lỗi, thông báo thành công). Ban đầu là chuỗi rỗng.
  const [message, setMessage] = useState("");

  // --- Effect hook để điều hướng người dùng đến trang chủ nếu họ đã đăng nhập ---
  // Effect này sẽ chạy sau mỗi lần render component HOẶC khi giá trị của các biến trong mảng dependencies ([isLoggedIn, navigate]) thay đổi.
  // Mục đích là tự động chuyển hướng người dùng đã đăng nhập khỏi trang Account (thường là trang đăng nhập/đăng ký) sang trang khác (ví dụ: trang chủ).
  useEffect(() => {
    // Kiểm tra nếu trạng thái đăng nhập là true
    if (isLoggedIn) {
      navigate("/home"); // Thực hiện điều hướng đến route "/home" (được giả định là trang chủ của ứng dụng).
    }
    // Lưu ý: Nếu bạn muốn trang Account có thể hiển thị thông tin người dùng khi đã đăng nhập thay vì tự động chuyển hướng,
    // bạn có thể xóa hoặc sửa đổi logic điều hướng này.
  }, [isLoggedIn, navigate]); // Mảng dependencies: effect phụ thuộc vào isLoggedIn (để biết khi nào trạng thái đăng nhập thay đổi) và navigate (hook navigate được đảm bảo stable bởi React, nhưng vẫn nên đưa vào dependency array để tuân thủ rule của React hook và tránh cảnh báo lint).

  // --- Hàm xử lý sự kiện khi giá trị của các trường nhập liệu trong form thay đổi ---
  // Hàm này được gắn vào sự kiện 'onChange' của cả input username và password.
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại nếu các biến trong dependency array thay đổi.
  // Các setter function từ useState (setFormData, setMessage) được đảm bảo stable bởi React, nên không cần đưa vào dependencies.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target; // Lấy thuộc tính 'name' (tên của input: "username" hoặc "password") và 'value' (giá trị hiện tại của input) từ phần tử input đã kích hoạt sự kiện.
    // Cập nhật state 'formData' bằng cách sử dụng functional update (prev => ...).
    // Sao chép tất cả các giá trị hiện tại của 'formData' (...prev) và ghi đè lên thuộc tính có tên [name] với giá trị mới 'value'.
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(""); // Xóa thông báo hiện tại ngay khi người dùng bắt đầu nhập liệu mới vào bất kỳ trường nào để làm sạch UI.
  }, []); // Mảng dependency rỗng []: Hàm không sử dụng bất kỳ biến hoặc state nào từ scope ngoài cần theo dõi sự thay đổi để hàm hoạt động đúng.

  // --- Hàm xử lý logic khi người dùng nhấn nút Đăng ký ---
  // Hàm này được gọi khi người dùng nhấn nút "Đăng ký" (khi đang ở chế độ đăng ký).
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi state 'formData' thay đổi
  // vì logic kiểm tra và xử lý dựa trên dữ liệu trong 'formData'.
  const handleRegister = useCallback(() => {
    const { username, password } = formData; // Lấy giá trị 'username' và 'password' từ state 'formData' để xử lý.

    // 1. Kiểm tra các trường nhập liệu có bị rỗng sau khi loại bỏ khoảng trắng ở đầu/cuối hay không.
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi nếu thiếu thông tin.
      return; // Dừng hàm, không xử lý tiếp nếu dữ liệu không hợp lệ.
    }

    // 2. Lấy danh sách người dùng đã lưu từ localStorage.
    // Sử dụng khối try-catch để bắt lỗi trong trường hợp dữ liệu trong localStorage không phải là JSON hợp lệ hoặc bị hỏng.
    let storedUsers = [];
    try {
      storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || []; // Lấy dữ liệu từ localStorage bằng key đã định nghĩa, parse thành object/array. Nếu không có dữ liệu (null), mặc định là mảng rỗng [].
    } catch (error) {
      console.error("Lỗi khi đọc danh sách người dùng từ localStorage:", error); // Ghi log lỗi ra console để debug.
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS); // Xóa dữ liệu bị lỗi khỏi localStorage để tránh lỗi lặp lại.
      storedUsers = []; // Đặt lại danh sách người dùng là rỗng để tránh sử dụng dữ liệu hỏng.
    }

    // 3. Kiểm tra xem tên đăng nhập đã tồn tại trong danh sách 'storedUsers' hay chưa.
    // Sử dụng phương thức .some() để kiểm tra xem có bất kỳ đối tượng user nào (u) trong mảng 'storedUsers'
    // mà thuộc tính 'username' của nó trùng khớp với 'username' người dùng vừa nhập hay không.
    const userExists = storedUsers.some((u) => u.username === username);
    if (userExists) {
      setMessage(MESSAGES.USER_EXISTS); // Hiển thị thông báo lỗi nếu tên đăng nhập đã tồn tại.
      return; // Dừng hàm.
    }

    // 4. Nếu tên đăng nhập chưa tồn tại, tạo một đối tượng người dùng mới và thêm vào danh sách.
    const newUser = { username, password }; // Tạo object cho người dùng mới với username và password đã nhập.
    const updatedUsers = [...storedUsers, newUser]; // Tạo mảng mới bằng cách sao chép mảng cũ (...storedUsers) và thêm đối tượng người dùng mới vào cuối.
    // Lưu mảng người dùng đã cập nhật trở lại vào localStorage (chuyển thành chuỗi JSON trước khi lưu).
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // 5. Cập nhật UI: Thông báo thành công và chuyển về form đăng nhập.
    setMessage(MESSAGES.REGISTER_SUCCESS); // Hiển thị thông báo đăng ký thành công.
    setFormData({ username: "", password: "" }); // Đặt lại state 'formData' về rỗng để làm sạch form sau khi đăng ký.
    // Sử dụng setTimeout để chờ một chút (1 giây) trước khi tự động chuyển đổi chế độ hiển thị sang form Đăng nhập.
    // Điều này giúp người dùng có thời gian đọc thông báo thành công trước khi form thay đổi.
    setTimeout(() => setIsRegistering(false), 1000);
  }, [formData]); // Mảng dependency: hàm phụ thuộc vào state 'formData' (để lấy username/password). MESSAGES và LOCAL_STORAGE_KEYS là hằng số nên không cần đưa vào.

  // --- Hàm xử lý logic khi người dùng nhấn nút Đăng nhập ---
  // Hàm này được gọi khi người dùng nhấn nút "Đăng nhập" (khi đang ở chế độ đăng nhập).
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi state 'formData' hoặc hàm 'login' từ Context thay đổi.
  const handleLogin = useCallback(() => {
    const { username, password } = formData; // Lấy giá trị 'username' và 'password' từ state 'formData' để xử lý.

    // 1. Kiểm tra các trường nhập liệu có bị rỗng hay không.
    if (!username.trim() || !password.trim()) {
      setMessage(MESSAGES.EMPTY_FIELDS); // Hiển thị thông báo lỗi nếu thiếu thông tin.
      return; // Dừng hàm.
    }

    // 2. Lấy danh sách người dùng đã lưu từ localStorage (có xử lý lỗi parse).
    let storedUsers = [];
    try {
      storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    } catch (error) {
      console.error("Lỗi khi đọc danh sách người dùng từ localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
      storedUsers = [];
    }

    // 3. Tìm người dùng trong danh sách 'storedUsers' có 'username' và 'password' khớp với dữ liệu nhập.
    // Sử dụng phương thức .find() để tìm đối tượng user đầu tiên trong mảng 'storedUsers'
    // mà thuộc tính 'username' và 'password' của nó trùng khớp với dữ liệu nhập.
    const foundUser = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    // 4. Xử lý kết quả tìm kiếm người dùng.
    if (foundUser) {
      login(foundUser); // Nếu tìm thấy người dùng (đăng nhập thành công), gọi hàm 'login' từ AuthContext. Hàm này sẽ cập nhật trạng thái isLoggedIn thành true và lưu thông tin foundUser vào state user trong Context, đồng thời lưu vào localStorage (như đã định nghĩa trong AuthProvider).
      setMessage(MESSAGES.LOGIN_SUCCESS); // Hiển thị thông báo đăng nhập thành công trên UI của component Account.
      // Effect hook 'useEffect' ở trên sẽ tự động điều hướng đến trang "/home" sau khi state 'isLoggedIn' trong AuthContext thay đổi thành true.
    } else {
      setMessage(MESSAGES.LOGIN_FAILED); // Nếu không tìm thấy người dùng (sai tên đăng nhập hoặc mật khẩu), hiển thị thông báo lỗi đăng nhập thất bại.
    }
  }, [formData, login]); // Mảng dependency: hàm phụ thuộc vào state 'formData' (để lấy dữ liệu nhập) và hàm 'login' từ AuthContext (để gọi khi đăng nhập thành công). MESSAGES và LOCAL_STORAGE_KEYS là hằng số.

  // --- Hàm xử lý logic khi người dùng nhấn nút Đăng xuất ---
  // Hàm này được gọi khi người dùng nhấn nút "Đăng xuất" (chỉ hiển thị khi đã đăng nhập).
  // Sử dụng useCallback để ghi nhớ hàm. Hàm này sẽ được tạo lại khi hàm 'logout' từ Context hoặc hàm 'navigate' thay đổi.
  const handleLogout = useCallback(() => {
    logout(); // Gọi hàm 'logout' từ AuthContext. Hàm này sẽ xóa thông tin người dùng khỏi localStorage và cập nhật trạng thái isLoggedIn/user trong Context về false/null.
    setMessage(MESSAGES.LOGOUT_SUCCESS); // Hiển thị thông báo đăng xuất thành công trên UI của component Account.

    // Đặt lại state 'formData' về rỗng sau khi đăng xuất để làm sạch form cho lần đăng nhập/đăng ký tiếp theo nếu người dùng ở lại trang này.
    setFormData({ username: "", password: "" });

    // Sử dụng setTimeout để chờ một chút (1 giây) trước khi điều hướng người dùng về trang gốc ("/")
    // Điều này giúp người dùng có thời gian nhìn thấy thông báo đăng xuất thành công trước khi chuyển trang.
    setTimeout(() => navigate("/"), 1000);
  }, [logout, navigate]); // Mảng dependency: hàm phụ thuộc vào hàm 'logout' từ AuthContext và hàm 'navigate' (để điều hướng). MESSAGES là hằng số.

  // --- Render giao diện người dùng ---
  return (
    // Container chính bao bọc toàn bộ nội dung của component Account.
    <div className="account-container">
      {/* Box chứa form đăng nhập/đăng ký hoặc thông báo khi đã đăng nhập */}
      <div className="account-box">
        {/* Tiêu đề chính của box, nội dung thay đổi tùy thuộc vào trạng thái đăng nhập và chế độ (đăng ký/đăng nhập) */}
        <h1>
          {isLoggedIn // Conditional Rendering: Nếu người dùng đã đăng nhập (isLoggedIn là true)
            ? `Xin chào, ${user?.username || "Người dùng"}!` // Hiển thị lời chào kèm tên người dùng (lấy từ state user trong Context, sử dụng optional chaining an toàn)
            : isRegistering // Ngược lại, nếu đang ở chế độ đăng ký (isRegistering là true)
            ? "Đăng ký tài khoản" // Hiển thị tiêu đề "Đăng ký tài khoản"
            : "Đăng nhập" // Ngược lại (chưa đăng nhập và không ở chế độ đăng ký, tức là đang ở chế độ đăng nhập)
          }
        </h1>

        {/* --- Conditional Rendering: Hiển thị phần giao diện khi người dùng ĐÃ đăng nhập --- */}
        {isLoggedIn ? ( // Kiểm tra nếu đã đăng nhập
          <div className="logged-in-section">
            <p>Bạn đã đăng nhập thành công!</p>{" "}
            {/* Dòng thông báo đơn giản xác nhận đã đăng nhập */}
            {/* Nút Đăng xuất */}
            <button
              className="account-button logout-btn" // Class CSS để định dạng nút đăng xuất
              onClick={handleLogout} // Gắn hàm xử lý sự kiện click nút (đã memoize bằng useCallback)
              aria-label="Đăng xuất" // Thuộc tính hỗ trợ khả năng tiếp cận cho người dùng sử dụng trình đọc màn hình
            >
              Đăng xuất{" "}
              {/* Nội dung hiển thị trên nút */}
            </button>
            {/* Hiển thị thông báo (ví dụ: "Đăng xuất thành công!") nếu state 'message' có giá trị */}
            {message && ( // Conditional Rendering: Chỉ hiển thị thẻ <p> nếu state 'message' không rỗng
              <p
                className={`message ${
                  // Áp dụng class CSS 'success' hoặc 'error' để đổi màu thông báo dựa trên nội dung
                  // Kiểm tra đơn giản xem chuỗi thông báo có chứa "thành công" không để phân loại
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message}{" "}
                {/* Hiển thị nội dung thông báo từ state 'message' */}
              </p>
            )}
          </div>
        ) : (
          // --- Conditional Rendering: Hiển thị phần giao diện khi người dùng CHƯA đăng nhập ---
          // Phần này chứa form đăng nhập hoặc đăng ký (tùy thuộc vào state isRegistering)
          <div className="auth-form">
            {/* Trường nhập liệu cho tên đăng nhập */}
            <input
              type="text" // Kiểu input là text
              name="username" // Tên của input, dùng để cập nhật state formData
              placeholder="Tên đăng nhập" // Placeholder hiển thị khi input trống
              className="account-input" // Class CSS để định dạng input
              value={formData.username} // Gán giá trị hiện tại của state formData.username vào input (Controlled Component)
              onChange={handleChange} // Gắn hàm xử lý sự kiện khi giá trị input thay đổi (đã memoize bằng useCallback)
              aria-label="Nhập tên đăng nhập" // Thuộc tính hỗ trợ khả năng tiếp cận
              autoComplete={isRegistering ? "new-username" : "username"} // Gợi ý trình duyệt cho tính năng tự động điền form (giúp người dùng nhập nhanh hơn)
            />
            {/* Trường nhập liệu cho mật khẩu */}
            <input
              type="password" // Kiểu input là password (ẩn ký tự khi gõ)
              name="password" // Tên của input, dùng để cập nhật state formData
              placeholder="Mật khẩu" // Placeholder
              className="account-input" // Class CSS
              value={formData.password} // Gán giá trị hiện tại của state formData.password vào input
              onChange={handleChange} // Gắn hàm xử lý sự kiện khi giá trị input thay đổi (đã memoize)
              aria-label="Nhập mật khẩu" // Thuộc tính hỗ trợ khả năng tiếp cận
              autoComplete={isRegistering ? "new-password" : "current-password"} // Gợi ý trình duyệt cho tính năng tự động điền form
            />
            {/* Hiển thị thông báo (lỗi hoặc thành công) nếu state 'message' có giá trị */}
            {message && ( // Conditional Rendering: Chỉ hiển thị thẻ <p> nếu state 'message' không rỗng
              <p
                className={`message ${
                  // Áp dụng class 'success' hoặc 'error' tùy thuộc nội dung thông báo
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message}{" "}
                {/* Hiển thị nội dung thông báo từ state 'message' */}
              </p>
            )}
            {/* Nhóm các nút hành động: Đăng nhập/Đăng ký và nút chuyển đổi giữa hai chế độ */}
            <div className="account-buttons">
              {/* --- Conditional Rendering: Hiển thị các nút khi đang ở chế độ Đăng ký --- */}
              {isRegistering ? ( // Kiểm tra nếu đang ở chế độ đăng ký
                <>
                  {" "}
                  {/* Sử dụng Fragment để nhóm các phần tử mà không thêm extra DOM node */}
                  {/* Nút "Đăng ký" */}
                  <button
                    className="account-button register-btn" // Class CSS để định dạng nút đăng ký
                    onClick={handleRegister} // Gắn hàm xử lý sự kiện click nút (đã memoize bằng useCallback)
                    aria-label="Đăng ký tài khoản" // Thuộc tính hỗ trợ khả năng tiếp cận
                  >
                    Đăng ký{" "}
                    {/* Nội dung nút */}
                  </button>
                  {/* Nút "Quay lại đăng nhập" - chuyển về chế độ đăng nhập */}
                  <button
                    className="link-button" // Class CSS chung cho các nút hoạt động như link (có thể đổi tên class này cho rõ nghĩa hơn)
                    onClick={() => setIsRegistering(false)} // Gắn hàm mũi tên để chuyển state isRegistering thành false khi click
                    aria-label="Quay lại đăng nhập" // Thuộc tính hỗ trợ khả năng tiếp cận
                  >
                    Quay lại đăng nhập{" "}
                    {/* Nội dung nút */}
                  </button>
                </>
              ) : (
                // --- Conditional Rendering: Hiển thị các nút khi đang ở chế độ Đăng nhập ---
                <>
                  {" "}
                  {/* Sử dụng Fragment */}
                  {/* Nút "Đăng nhập" */}
                  <button
                    className="account-button login-btn" // Class CSS để định dạng nút đăng nhập
                    onClick={handleLogin} // Gắn hàm xử lý sự kiện click nút (đã memoize bằng useCallback)
                    aria-label="Đăng nhập" // Thuộc tính hỗ trợ khả năng tiếp cận
                  >
                    Đăng nhập{" "}
                    {/* Nội dung nút */}
                  </button>
                  {/* Nút "Chưa có tài khoản? Đăng ký" - chuyển sang chế độ đăng ký */}
                  <button
                    className="link-button" // Class CSS chung cho các nút hoạt động như link
                    onClick={() => setIsRegistering(true)} // Gắn hàm mũi tên để chuyển state isRegistering thành true khi click
                    aria-label="Chuyển sang đăng ký" // Thuộc tính hỗ trợ khả năng tiếp cận
                  >
                    Chưa có tài khoản? Đăng ký{" "}
                    {/* Nội dung nút */}
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

export default Account; // Export component Account làm default export để có thể sử dụng ở các file khác, thường là trong cấu hình định tuyến (routing) của ứng dụng (ví dụ: gắn component này vào route "/" hoặc "/account").
