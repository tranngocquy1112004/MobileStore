import React, { useState, useContext, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useState để quản lý trạng thái cục bộ, useContext để truy cập Context API, và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện nhằm tối ưu hiệu suất
import { AuthContext } from "../account/AuthContext"; // Import AuthContext từ đường dẫn tương đối. Context này chứa thông tin về người dùng đang đăng nhập (user) và hàm logout để đăng xuất.
import "./UserProfileModal.css"; // Import file CSS để định dạng giao diện cho component modal thông tin người dùng này

// --- Định nghĩa các hằng số cục bộ ---

// Khóa sử dụng để lưu trữ danh sách tất cả người dùng đã đăng ký trong localStorage
// Việc sử dụng hằng số giúp tránh gõ sai key và dễ dàng quản lý.
const LOCAL_STORAGE_USERS_KEY = "users";
// Độ dài tối thiểu (số ký tự) cho mật khẩu mới
const MIN_PASSWORD_LENGTH = 6;
// Khóa mặc định cho người dùng hiện tại trong localStorage (nếu AuthContext lưu trữ như vậy).
// Tên key này nên được đồng bộ với AuthContext. Đặt nó dưới dạng hằng số giúp dễ quản lý.
const LOCAL_STORAGE_CURRENT_USER_KEY = "currentUser";


// --- Component UserProfileModal ---
// Component này hiển thị một hộp thoại (modal) chứa thông tin cơ bản của người dùng đang đăng nhập
// và một form để họ có thể đổi mật khẩu.
// Nhận một prop duy nhất:
// - onClose: Hàm sẽ được gọi từ component cha khi người dùng muốn đóng modal (ví dụ: nhấn nút "Đóng").
const UserProfileModal = ({ onClose }) => {
  // Sử dụng hook useContext để truy cập vào AuthContext.
  // Lấy state 'user' (đối tượng người dùng đang đăng nhập) và hàm 'logout' từ Context.
  // AuthContext được giả định cung cấp các giá trị này.
  const { user, logout } = useContext(AuthContext);

  // --- State quản lý các trường nhập liệu và thông báo trong modal ---
  // State 'oldPassword': Lưu trữ giá trị người dùng nhập vào trường "Mật khẩu cũ". Ban đầu là chuỗi rỗng.
  const [oldPassword, setOldPassword] = useState("");
  // State 'newPassword': Lưu trữ giá trị người dùng nhập vào trường "Mật khẩu mới". Ban đầu là chuỗi rỗng.
  const [newPassword, setNewPassword] = useState("");
  // State 'confirmPassword': Lưu trữ giá trị người dùng nhập vào trường "Xác nhận mật khẩu". Ban đầu là chuỗi rỗng.
  const [confirmPassword, setConfirmPassword] = useState("");
  // State 'message': Lưu trữ thông báo (lỗi hoặc thành công) hiển thị cho người dùng bên dưới form. Ban đầu là chuỗi rỗng.
  const [message, setMessage] = useState("");

  // --- Hàm xử lý logic khi form đổi mật khẩu được submit ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này sẽ được tạo lại khi các biến trong dependency array thay đổi.
  // Điều này giúp ngăn component hoặc các component con (nếu hàm này được truyền xuống)
  // re-render không cần thiết nếu chỉ có các state khác thay đổi nhưng dependencies của hàm này không đổi.
  const handleChangePassword = useCallback(
    (e) => {
      e.preventDefault(); // Ngăn chặn hành vi submit form mặc định của trình duyệt (trang không bị tải lại khi submit).

      // Đặt lại thông báo trước khi thực hiện validation và xử lý
      setMessage("");

      // --- Kiểm tra validation các trường mật khẩu ---

      // 1. Kiểm tra xem mật khẩu cũ người dùng nhập vào có khớp với mật khẩu hiện tại của người dùng đang đăng nhập không.
      // Cần đảm bảo 'user' và 'user.password' tồn tại trước khi so sánh. Optional chaining (`user?.password`) giúp tránh lỗi nếu user là null hoặc password không tồn tại.
      if (oldPassword !== user?.password) {
        setMessage("Mật khẩu cũ không đúng!"); // Đặt thông báo lỗi nếu mật khẩu cũ không khớp.
        return; // Dừng hàm, không xử lý tiếp nếu mật khẩu cũ sai.
      }

      // 2. Kiểm tra xem mật khẩu mới và mật khẩu xác nhận có giống hệt nhau không.
      if (newPassword !== confirmPassword) {
        setMessage("Mật khẩu xác nhận không khớp!"); // Đặt thông báo lỗi nếu hai mật khẩu không khớp.
        return; // Dừng hàm.
      }

      // 3. Kiểm tra độ dài của mật khẩu mới có đủ tối thiểu hay không.
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        setMessage(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`); // Đặt thông báo lỗi nếu mật khẩu quá ngắn.
        return; // Dừng hàm.
      }

      // 4. Kiểm tra mật khẩu mới có khác mật khẩu cũ không
      if (newPassword === oldPassword) {
        setMessage("Mật khẩu mới không được trùng với mật khẩu cũ!");
        return;
      }

      // --- Xử lý cập nhật mật khẩu trong localStorage ---
      // LƯU Ý QUAN TRỌNG: Lưu mật khẩu dưới dạng plain text trong localStorage là CỰC KỲ KHÔNG AN TOÀN.
      // Bất kỳ ai có quyền truy cập vào trình duyệt của người dùng đều có thể đọc được mật khẩu.
      // Phương pháp này CHỈ được sử dụng cho mục đích demo frontend đơn giản.
      // Trong ứng dụng thực tế, mật khẩu cần được mã hóa (hashed) trước khi lưu trữ
      // và việc đổi mật khẩu cần được xử lý an toàn ở backend.

      // Lấy danh sách tất cả người dùng đã lưu trong localStorage.
      // Sử dụng try-catch để xử lý lỗi nếu dữ liệu trong localStorage không hợp lệ (không phải JSON, bị hỏng, v.v.).
      let storedUsers = [];
      try {
        storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || []; // Lấy dữ liệu, parse JSON, nếu không có thì mặc định là mảng rỗng.
      } catch (error) {
        console.error("Lỗi khi đọc danh sách người dùng từ localStorage để đổi mật khẩu:", error);
        // Nếu có lỗi khi đọc/parse, có thể xóa dữ liệu cũ bị hỏng và bắt đầu với mảng rỗng mới để tránh crash.
        localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
        storedUsers = [];
      }

      // Tạo một mảng người dùng mới bằng cách lặp (map) qua danh sách 'storedUsers'.
      // Tìm người dùng trong danh sách có 'username' trùng khớp với 'username' của người dùng hiện tại ('user.username').
      // So sánh username (sử dụng optional chaining `user?.username`) để đảm bảo an toàn ngay cả khi `user` là null hoặc undefined.
      // Nếu tìm thấy người dùng cần cập nhật, tạo một đối tượng người dùng mới với tất cả thông tin cũ (...storedUser)
      // nhưng ghi đè (cập nhật) thuộc tính 'password' thành 'newPassword'.
      // Nếu không trùng khớp (không phải người dùng cần cập nhật), giữ nguyên đối tượng người dùng đó (storedUser).
      const updatedUsers = storedUsers.map((storedUser) =>
        storedUser.username === user?.username // So sánh username
          ? { ...storedUser, password: newPassword } // Cập nhật mật khẩu cho người dùng hiện tại
          : storedUser // Giữ nguyên thông tin người dùng khác
      );

      // Lưu mảng người dùng đã cập nhật trở lại vào localStorage (sau khi chuyển thành chuỗi JSON).
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

      // Cập nhật thông tin người dùng hiện tại trong localStorage.
      // Điều này đảm bảo thông tin 'currentUser' trong localStorage cũng chứa mật khẩu mới,
      // giúp AuthContext (nếu nó đọc lại từ localStorage để duy trì trạng thái đăng nhập) đồng bộ với mật khẩu đã đổi.
      // Kiểm tra xem 'user' có tồn tại trước khi cố gắng sao chép và cập nhật.
      if (user) {
           localStorage.setItem(
                LOCAL_STORAGE_CURRENT_USER_KEY, // Khóa này nên là hằng số LOCAL_STORAGE_KEY từ AuthContext nếu có thể import được
                JSON.stringify({ ...user, password: newPassword }) // Tạo bản sao của user hiện tại và cập nhật mật khẩu
            );
      }


      // --- Xử lý sau khi đổi mật khẩu thành công ---

      setMessage(`Đổi mật khẩu thành công! Vui lòng đăng nhập lại.`); // Đặt thông báo thành công cho người dùng.
      // Xóa nội dung đã nhập trong các trường input mật khẩu bằng cách đặt state về rỗng.
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Sử dụng setTimeout để tự động thực hiện đăng xuất và đóng modal sau một khoảng thời gian (ví dụ: 2 giây).
      // Việc bắt người dùng đăng nhập lại với mật khẩu mới là một biện pháp bảo mật tốt sau khi đổi mật khẩu.
      const timer = setTimeout(() => {
        logout(); // Gọi hàm 'logout' từ AuthContext để đăng xuất người dùng hiện tại.
        onClose(); // Gọi hàm 'onClose' từ props để đóng hộp thoại modal.
      }, 2000); // Thời gian chờ là 2000ms (2 giây).

      // Cleanup function cho setTimeout để tránh memory leak nếu component unmount trước khi timer kết thúc.
      return () => clearTimeout(timer);

    },
    // Mảng dependencies cho useCallback:
    // Hàm này phụ thuộc vào state 'user' (để lấy username và password cũ), 'oldPassword', 'newPassword', 'confirmPassword' (giá trị nhập liệu form),
    // hàm 'logout' từ Context, hàm 'onClose' từ props, và hằng số MIN_PASSWORD_LENGTH (để kiểm tra validation).
    // Khi bất kỳ dependency nào trong mảng này thay đổi, hàm handleChangePassword sẽ được tạo lại.
    [user, oldPassword, newPassword, confirmPassword, logout, onClose, MIN_PASSWORD_LENGTH]
  );

  // Nếu 'user' không tồn tại (nghĩa là người dùng chưa đăng nhập), không hiển thị modal.
  // Mặc dù logic kiểm tra đăng nhập cũng có thể xử lý trước khi hiển thị modal này,
  // việc kiểm tra lại ở đây giúp an toàn hơn.
  if (!user) {
      return null;
  }


  // --- Render giao diện của modal ---
  return (
    // --- Lớp phủ (Overlay) cho Modal ---
    // Lớp div này tạo một lớp phủ mờ trên toàn màn hình, làm nổi bật modal chính và ngăn tương tác với nội dung bên dưới.
    // Không có sự kiện onClick ở đây để overlay không tự đóng modal khi click ra ngoài. Bạn có thể thêm onClick={onClose} nếu muốn click ra ngoài để đóng modal.
    <div className="modal-overlay">
      {/* --- Nội dung chính của Modal --- */}
      {/* Container chứa nội dung bên trong modal. */}
      {/* Sự kiện onClick={(e) => e.stopPropagation()} ngăn chặn sự kiện click bên trong modal này lan tỏa lên lớp overlay,
          để nếu overlay có sự kiện đóng modal khi click ra ngoài, click bên trong modal sẽ không gây đóng. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Thông tin người dùng</h2> {/* Tiêu đề của modal */}
        {/* Phần hiển thị thông tin cơ bản của người dùng */}
        <div className="user-info">
          {" "}
          {/* Container cho thông tin người dùng */}
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {/* Hiển thị chữ "Tên đăng nhập:" đậm */}
            {/* Hiển thị 'username' của người dùng đang đăng nhập. Sử dụng optional chaining (user?.username)
                để an toàn nếu 'user' là null hoặc undefined, và cung cấp giá trị mặc định "Không có dữ liệu" nếu username không tồn tại. */}
            {user?.username || "Không có dữ liệu"}
          </p>
          {/* Có thể thêm các thông tin khác của người dùng tại đây nếu đối tượng 'user' chứa thêm dữ liệu. */}
        </div>
        <h3>Đổi mật khẩu</h3>{" "}
        {/* Tiêu đề cho phần đổi mật khẩu */}
        {/* --- Form đổi mật khẩu --- */}
        {/* Thẻ form. Khi form được submit (ví dụ: nhấn nút type="submit"), hàm handleChangePassword (đã memoize) sẽ được gọi. */}
        <form onSubmit={handleChangePassword}>
          {/* Trường nhập liệu cho mật khẩu cũ */}
          <input
            type="password" // Loại input là 'password' để ẩn ký tự khi gõ
            placeholder="Mật khẩu cũ" // Placeholder hiển thị hướng dẫn nhập liệu
            value={oldPassword} // Gán giá trị hiện tại của state 'oldPassword' vào input (Controlled Component)
            onChange={(e) => setOldPassword(e.target.value)} // Gắn hàm xử lý sự kiện 'onChange' để cập nhật state 'oldPassword' khi giá trị input thay đổi
            required // Thuộc tính HTML5 yêu cầu trường này không được để trống khi submit form
            aria-label="Nhập mật khẩu cũ" // Thuộc tính hỗ trợ khả năng tiếp cận cho người dùng sử dụng trình đọc màn hình
          />
          {/* Trường nhập liệu cho mật khẩu mới */}
          <input
            type="password" // Loại input là 'password'
            placeholder="Mật khẩu mới" // Placeholder
            value={newPassword} // Gán giá trị hiện tại của state 'newPassword' vào input
            onChange={(e) => setNewPassword(e.target.value)} // Cập nhật state 'newPassword' khi input thay đổi
            required // Bắt buộc nhập
            aria-label="Nhập mật khẩu mới" // Thuộc tính hỗ trợ khả năng tiếp cận
            minLength={MIN_PASSWORD_LENGTH} // Thêm thuộc tính HTML5 kiểm tra độ dài tối thiểu trước khi submit
          />
          {/* Trường nhập liệu để xác nhận mật khẩu mới */}
          <input
            type="password" // Loại input là 'password'
            placeholder="Xác nhận mật khẩu" // Placeholder
            value={confirmPassword} // Gán giá trị hiện tại của state 'confirmPassword' vào input
            onChange={(e) => setConfirmPassword(e.target.value)} // Cập nhật state 'confirmPassword' khi input thay đổi
            required // Bắt buộc nhập
            aria-label="Xác nhận mật khẩu mới" // Thuộc tính hỗ trợ khả năng tiếp cận
            minLength={MIN_PASSWORD_LENGTH} // Thêm thuộc tính HTML5 kiểm tra độ dài tối thiểu
          />
          {/* --- Hiển thị thông báo (lỗi hoặc thành công) --- */}
          {/* Conditional Rendering: Nếu state 'message' có giá trị (khác chuỗi rỗng), hiển thị một thẻ paragraph */}
          {message && (
            // Áp dụng class CSS 'success' hoặc 'error' dựa trên nội dung của thông báo
            // (kiểm tra đơn giản xem chuỗi thông báo có chứa "thành công" không để phân loại)
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message}{" "}
              {/* Hiển thị nội dung thông báo */}
            </p>
          )}
          {/* --- Nhóm các nút hành động trong modal --- */}
          <div className="modal-buttons">
            {" "}
            {/* Container cho các nút */}
            {/* Nút "Đổi mật khẩu" - nút submit form */}
            <button type="submit" className="confirm-button">
              Đổi mật khẩu{" "}
              {/* Nội dung nút */}
            </button>
            {/* Nút "Đóng" modal */}
            <button
              type="button" // Quan trọng: Loại nút là "button" để ngăn nó submit form
              className="cancel-button" // Class CSS để định dạng nút hủy
              onClick={onClose} // Gắn hàm 'onClose' từ props để đóng modal khi click
              aria-label="Đóng modal" // Thuộc tính hỗ trợ khả năng tiếp cận
            >
              Đóng{" "}
              {/* Nội dung nút */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal; // Export component UserProfileModal làm default export để có thể sử dụng ở các file khác (ví dụ: trong Header hoặc component Account khi người dùng đã đăng nhập)