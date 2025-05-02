// src/pages/UserProfilePage.js

// Import các hook cần thiết từ thư viện React:
// useState: Để quản lý trạng thái cục bộ cho các form và thông báo.
// useContext: Để truy cập Context API (AuthContext).
// useEffect: Để thực hiện các tác vụ phụ như kiểm tra trạng thái đăng nhập và cập nhật state ban đầu.
// useCallback: Để ghi nhớ (memoize) các hàm xử lý sự kiện và helper functions, tối ưu hiệu suất.
import React, { useState, useContext, useEffect, useCallback } from "react";
// Import các hook từ react-router-dom để điều hướng và tạo link.
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// Import AuthContext để truy cập thông tin xác thực.
import { AuthContext } from "../account/AuthContext"; // Đảm bảo đường dẫn này chính xác

// Import CSS cho component này. Đảm bảo file CSS này tồn tại.
import "./UserProfilePage.css";
// SỬA LỖI: Import CSS của Account nếu UserProfilePage cần sử dụng style đó.
// Dựa trên lỗi trước đó, có thể file này đã cố gắng import Account.css.
// Nếu cần style từ Account.css, đường dẫn đúng là:
// import "../account/Account.css"; // Uncomment dòng này nếu bạn thực sự cần style từ Account.css

// Import OrderHistory component. Đảm bảo đường dẫn này chính xác.
import OrderHistory from "./OrderHistory"; // Đảm bảo OrderHistory.js nằm cùng thư mục 'pages'


// --- Định nghĩa hằng số ---
const LOCAL_STORAGE_USERS_KEY = "users"; // Key để lưu trữ danh sách người dùng trong localStorage
const MIN_PASSWORD_LENGTH = 6; // Độ dài tối thiểu cho mật khẩu mới

// Object chứa các chuỗi thông báo hiển thị cho người dùng.
const MESSAGES = {
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
  PASSWORD_CHANGE_FAILED: "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.",
  PASSWORDS_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
  EMPTY_PASSWORD_FIELDS: "Vui lòng điền đầy đủ các trường mật khẩu.",
  PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ!",
  PASSWORD_TOO_SHORT: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`,
  PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
  PROFILE_UPDATE_FAILED: "Cập nhật thông tin thất bại. Vui lòng thử lại.",
  ADDRESS_SAVE_SUCCESS: "Lưu địa chỉ thành công!",
  ADDRESS_SAVE_FAILED: "Lưu địa chỉ thất bại. Vui lòng thử lại.",
  ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
  ADDRESS_EMPTY_FIELDS: "Vui lòng điền đủ thông tin địa chỉ, tên và số điện thoại.",
  SYSTEM_ERROR_READING_USERS: "Lỗi hệ thống, không thể đọc dữ liệu người dùng.",
  SYSTEM_ERROR_UPDATING_USERS: "Lỗi hệ thống, không thể lưu dữ liệu người dùng.",
  USER_NOT_FOUND: "Không tìm thấy thông tin người dùng hiện tại.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem trang hồ sơ.", // Thêm thông báo yêu cầu đăng nhập
};


// --- Component UserProfilePage: Hiển thị và quản lý thông tin hồ sơ người dùng ---
// Component này cho phép người dùng xem/chỉnh sửa thông tin cá nhân, đổi mật khẩu, quản lý địa chỉ và xem lịch sử đơn hàng.
const UserProfilePage = () => {
  // Sử dụng context để lấy thông tin người dùng và trạng thái đăng nhập từ AuthContext
  // Sử dụng optional chaining và giá trị mặc định an toàn
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {
      user: null,
      isLoggedIn: false,
      login: () => {},
      logout: () => {}
  };
  const navigate = useNavigate(); // Hook điều hướng

  // State cho form đổi mật khẩu
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  // State cho thông báo đổi mật khẩu
  const [passwordMessage, setPasswordMessage] = useState("");

  // State cho form cập nhật thông tin cá nhân, khởi tạo từ user context (kiểm tra user an toàn)
  const [profileFormData, setProfileFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  // State cho thông báo cập nhật thông tin cá nhân
  const [profileMessage, setProfileMessage] = useState("");

  // State cho danh sách địa chỉ, khởi tạo từ user context (kiểm tra user an toàn)
  const [addresses, setAddresses] = useState(user?.addresses || []);
  // State cho form thêm địa chỉ mới
  const [newAddressFormData, setNewAddressFormData] = useState({ address: '', name: '', phone: '' });
  // State cho thông báo liên quan đến địa chỉ
  const [addressMessage, setAddressMessage] = useState('');

  // State để quản lý phần hiển thị đang hoạt động (thông tin, mật khẩu, địa chỉ, đơn hàng)
  const [activeSection, setActiveSection] = useState('profile'); // Mặc định hiển thị phần thông tin cá nhân

  // Effect để kiểm tra trạng thái đăng nhập và chuyển hướng nếu chưa đăng nhập
  // Effect này chạy khi isLoggedIn hoặc navigate thay đổi.
  useEffect(() => {
    if (!isLoggedIn) {
      console.log("Người dùng chưa đăng nhập, chuyển hướng về trang chủ.");
      // Hiển thị thông báo yêu cầu đăng nhập trước khi chuyển hướng
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/"); // Điều hướng về trang chủ (hoặc trang đăng nhập)
    } else {
        // Nếu đã đăng nhập, cập nhật state profile và addresses từ user context
        // Điều này đảm bảo dữ liệu hiển thị khớp với user trong context sau khi load hoặc login
        setProfileFormData({
          username: user?.username || '', // Cập nhật an toàn
          email: user?.email || '',
          phone: user?.phone || '',
        });
        setAddresses(user?.addresses || []); // Cập nhật an toàn
    }
  }, [isLoggedIn, navigate, user]); // Dependencies: isLoggedIn, navigate, và user (để cập nhật state khi user thay đổi)

  // Unified input change handler sử dụng useCallback để tránh tạo lại hàm không cần thiết
  // Xử lý thay đổi input cho các form khác nhau dựa vào formType
  const handleInputChange = useCallback((e, formType) => {
    const { name, value } = e.target;
    if (formType === 'password') {
      setPasswordFormData(prev => ({ ...prev, [name]: value }));
      setPasswordMessage(""); // Xóa thông báo khi người dùng nhập liệu
    } else if (formType === 'profile') {
      setProfileFormData(prev => ({ ...prev, [name]: value }));
      setProfileMessage(""); // Xóa thông báo khi người dùng nhập liệu
    } else if (formType === 'newAddress') {
      setNewAddressFormData(prev => ({ ...prev, [name]: value }));
      setAddressMessage(""); // Xóa thông báo khi người dùng nhập liệu
    }
  }, []); // Dependencies trống vì các state setters là stable

  // Helper function để đọc danh sách người dùng từ localStorage với xử lý lỗi
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const readUsersFromStorage = useCallback(() => {
    try {
      const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
      // Đảm bảo dữ liệu sau parse là mảng
      if (!Array.isArray(storedUsers)) {
        console.error("Dữ liệu người dùng trong localStorage không phải là mảng.");
        // Tùy chọn: xóa dữ liệu lỗi nếu parse thành công nhưng không phải mảng
        // localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
        return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
      }
      return storedUsers;
    } catch (error) {
      console.error("Lỗi khi đọc danh sách người dùng từ localStorage:", error);
       // Tùy chọn: xóa dữ liệu lỗi nếu parse thất bại
       // localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
      return null; // Báo hiệu lỗi nghiêm trọng khi đọc
    }
  }, []); // Dependencies trống

  // Helper function để lưu danh sách người dùng vào localStorage với xử lý lỗi
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const saveUsersToStorage = useCallback((usersToSave) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(usersToSave));
      return true; // Báo hiệu thành công
    } catch (error) {
      console.error("Lỗi khi lưu danh sách người dùng vào localStorage:", error);
      // Có thể thêm thông báo lỗi nhỏ cho người dùng ở đây nếu cần
      return false; // Báo hiệu thất bại
    }
  }, []); // Dependencies trống


  // Helper function để cập nhật địa chỉ người dùng trong localStorage và AuthContext
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const updateUserAddressesInStorage = useCallback((updatedAddressesList) => {
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) { // Xử lý lỗi đọc từ helper
      setAddressMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
      return;
    }

    // Đảm bảo user có sẵn và có username trước khi tiếp tục
    if (!user || !user.username) {
        console.warn("Không có thông tin người dùng hiện tại để cập nhật địa chỉ.");
        setAddressMessage(MESSAGES.USER_NOT_FOUND);
        return;
    }

    // Tìm index của người dùng hiện tại trong danh sách đã lưu
    const userIndex = storedUsers.findIndex(u => u && u.username === user.username); // Kiểm tra u an toàn

    if (userIndex > -1) {
      // Cập nhật thuộc tính 'addresses' trong đối tượng người dùng tại index tìm được
      storedUsers[userIndex] = { ...storedUsers[userIndex], addresses: updatedAddressesList };

      // Lưu danh sách người dùng đã cập nhật vào localStorage
      if (!saveUsersToStorage(storedUsers)) { // Xử lý lỗi lưu từ helper
         setAddressMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
         return;
      }

      // Cập nhật user trong context bằng cách gọi hàm login với đối tượng user mới
      const updatedUserForContext = { ...user, addresses: updatedAddressesList };
      login(updatedUserForContext); // Sử dụng hàm login để cập nhật context và localStorage 'currentUser'

      console.log(`Đã cập nhật địa chỉ cho người dùng ${user.username} trong localStorage và context.`);

    } else {
      setAddressMessage(MESSAGES.USER_NOT_FOUND); // Thông báo cụ thể hơn
      console.warn(`Không tìm thấy người dùng hiện tại ${user?.username} để cập nhật địa chỉ.`);
    }
  }, [user, login, readUsersFromStorage, saveUsersToStorage, setAddressMessage]); // Dependencies: user, login, và các helper functions/setters

  // Handles password change submission sử dụng useCallback
  const handleSubmitPasswordChange = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn submit form mặc định
    const { oldPassword, newPassword, confirmNewPassword } = passwordFormData; // Lấy dữ liệu từ state form

    // --- Validation checks ---
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordMessage(MESSAGES.EMPTY_PASSWORD_FIELDS); // Thông báo lỗi nếu thiếu trường
      return;
    }
    // So sánh mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage(MESSAGES.PASSWORDS_NOT_MATCH); // Thông báo lỗi nếu không khớp
      return;
    }
    // Kiểm tra độ dài tối thiểu của mật khẩu mới
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordMessage(MESSAGES.PASSWORD_TOO_SHORT); // Thông báo lỗi nếu quá ngắn
      return;
    }
    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    if (newPassword === oldPassword) {
      setPasswordMessage(MESSAGES.PASSWORD_SAME_AS_OLD); // Thông báo lỗi nếu trùng
      return;
    }

    // Đọc danh sách người dùng từ localStorage
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) { // Xử lý lỗi đọc từ helper
       setPasswordMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
       return;
    }

    // Đảm bảo user có sẵn và có username trước khi tiếp tục
    if (!user || !user.username) {
        console.warn("Không có thông tin người dùng hiện tại để đổi mật khẩu.");
        setPasswordMessage(MESSAGES.USER_NOT_FOUND);
        return;
    }

    // Tìm index của người dùng hiện tại trong danh sách đã lưu
    const userIndex = storedUsers.findIndex(u => u && u.username === user.username); // Kiểm tra u an toàn

    // Kiểm tra nếu người dùng tồn tại trong danh sách và mật khẩu cũ nhập vào khớp với mật khẩu đã lưu
    if (userIndex === -1 || (storedUsers[userIndex] && storedUsers[userIndex].password !== oldPassword)) { // Kiểm tra storedUsers[userIndex] an toàn
      setPasswordMessage(MESSAGES.PASSWORD_CHANGE_FAILED); // Thông báo lỗi nếu không tìm thấy hoặc sai mật khẩu cũ
      console.warn(`Đổi mật khẩu thất bại cho người dùng ${user?.username || 'không xác định'}. Mật khẩu cũ không khớp.`);
      return;
    }

    // --- Cập nhật mật khẩu ---
    // Cập nhật mật khẩu trong đối tượng người dùng tại index tìm được trong danh sách đã lưu
    if (storedUsers[userIndex]) { // Kiểm tra an toàn lần nữa trước khi cập nhật
        storedUsers[userIndex].password = newPassword;
    }


    // Lưu danh sách người dùng đã cập nhật (với mật khẩu mới) vào localStorage
    if (!saveUsersToStorage(storedUsers)) { // Xử lý lỗi lưu từ helper
       setPasswordMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
       return;
    }

    // Cập nhật user trong context và localStorage 'currentUser'
    // Bằng cách gọi hàm login với đối tượng user đã cập nhật mật khẩu
    const updatedUserForContext = { ...user, password: newPassword };
    login(updatedUserForContext);


    // Reset form và hiển thị thông báo thành công
    setPasswordFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    setPasswordMessage(MESSAGES.PASSWORD_CHANGE_SUCCESS);
    console.log(`Người dùng ${user.username} đã đổi mật khẩu thành công.`);

    // Logout sau một khoảng trễ ngắn để buộc đăng nhập lại với mật khẩu mới
    // Sử dụng setTimeout để người dùng có thời gian đọc thông báo thành công
    setTimeout(() => {
      logout(); // Gọi hàm logout từ AuthContext
    }, 2000); // Trễ 2 giây

  }, [passwordFormData, user, login, logout, readUsersFromStorage, saveUsersToStorage, setPasswordMessage]); // Dependencies: state form, user, login, logout, và các helper functions/setters

  // Handles profile information update submission sử dụng useCallback
  const handleSubmitProfileUpdate = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn submit form mặc định
    console.log("Đang xử lý cập nhật thông tin cá nhân:", profileFormData); // Log dữ liệu form

    // Đọc danh sách người dùng từ localStorage
    const storedUsers = readUsersFromStorage();
    if (storedUsers === null) { // Xử lý lỗi đọc từ helper
       setProfileMessage(MESSAGES.SYSTEM_ERROR_READING_USERS);
       return;
    }

    // Đảm bảo user có sẵn và có username trước khi tiếp tục
    if (!user || !user.username) {
        console.warn("Không có thông tin người dùng hiện tại để cập nhật profile.");
        setProfileMessage(MESSAGES.USER_NOT_FOUND);
        return;
    }

    // Tìm index của người dùng hiện tại trong danh sách đã lưu
    const userIndex = storedUsers.findIndex(u => u && u.username === user.username); // Kiểm tra u an toàn

    if (userIndex > -1 && storedUsers[userIndex]) { // Kiểm tra userIndex và đối tượng user an toàn
      // Cập nhật các thuộc tính email và phone trong đối tượng người dùng tại index tìm được
      storedUsers[userIndex] = {
        ...storedUsers[userIndex], // Sao chép các thuộc tính cũ
        // username: profileFormData.username, // Tên đăng nhập thường không thay đổi ở đây
        email: profileFormData.email.trim(), // Lưu email sau khi trim khoảng trắng
        phone: profileFormData.phone.trim(), // Lưu phone sau khi trim khoảng trắng
      };

      // Lưu danh sách người dùng đã cập nhật vào localStorage
      if (!saveUsersToStorage(storedUsers)) { // Xử lý lỗi lưu từ helper
         setProfileMessage(MESSAGES.SYSTEM_ERROR_UPDATING_USERS);
         return;
      }

      // Cập nhật user trong context và localStorage 'currentUser'
      // Bằng cách gọi hàm login với đối tượng user đã cập nhật
      const updatedUserForContext = {
        ...user, // Sao chép các thuộc tính cũ từ user trong context
        // username: profileFormData.username, // Giữ nguyên username trong context nếu không thay đổi
        email: profileFormData.email.trim(),
        phone: profileFormData.phone.trim(),
      };
      login(updatedUserForContext); // Sử dụng hàm login để cập nhật context và localStorage 'currentUser'

      setProfileMessage(MESSAGES.PROFILE_UPDATE_SUCCESS); // Thông báo thành công
      console.log(`Cập nhật thông tin người dùng ${user.username} thành công.`); // Sử dụng user.username nhất quán

    } else {
      setProfileMessage(MESSAGES.USER_NOT_FOUND); // Thông báo cụ thể hơn
      console.warn(`Không tìm thấy người dùng hiện tại ${user?.username} để cập nhật profile.`);
    }

  }, [profileFormData, user, login, readUsersFromStorage, saveUsersToStorage, setProfileMessage]); // Dependencies: state form, user, login, và các helper functions/setters

  // Handles adding a new address sử dụng useCallback
  const handleAddAddress = useCallback((e) => {
    e.preventDefault(); // Ngăn chặn submit form mặc định
    const { address, name, phone } = newAddressFormData; // Lấy dữ liệu từ state form

    // Validation check
    if (!address.trim() || !name.trim() || !phone.trim()) {
      setAddressMessage(MESSAGES.ADDRESS_EMPTY_FIELDS); // Thông báo lỗi nếu thiếu trường
      return;
    }

    // Tạo đối tượng địa chỉ mới với ID đơn giản (sử dụng timestamp)
    // ID này chỉ duy nhất trong một phiên làm việc ngắn, có thể trùng nếu thêm quá nhanh.
    // Xem xét sử dụng thư viện `uuid` để tạo ID thực sự duy nhất trong ứng dụng thực tế.
    const newAddress = {
      id: Date.now(), // ID dựa trên timestamp
      address: address.trim(), // Lưu sau khi trim
      name: name.trim(), // Lưu sau khi trim
      phone: phone.trim(), // Lưu sau khi trim
    };

    // Tạo mảng địa chỉ mới bằng cách thêm địa chỉ mới vào danh sách hiện tại
    const updatedAddresses = [...addresses, newAddress];

    // Cập nhật state addresses ngay lập tức để giao diện phản hồi nhanh
    setAddresses(updatedAddresses);
    setNewAddressFormData({ address: '', name: '', phone: '' }); // Reset form thêm địa chỉ
    setAddressMessage(MESSAGES.ADDRESS_SAVE_SUCCESS); // Thông báo thành công

    // Lưu danh sách địa chỉ đã cập nhật vào localStorage (thông qua helper function) và cập nhật context
    updateUserAddressesInStorage(updatedAddresses);
    console.log("Đã thêm địa chỉ mới:", newAddress); // Log địa chỉ mới

  }, [newAddressFormData, addresses, updateUserAddressesInStorage, setAddresses, setNewAddressFormData, setAddressMessage]); // Dependencies: state form, state addresses, và helper function/setters

  // Handles deleting an address sử dụng useCallback
  const handleDeleteAddress = useCallback((addressIdToDelete) => {
    // Dialog xác nhận từ người dùng
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return; // Dừng nếu người dùng hủy bỏ
    }

    // Lọc danh sách địa chỉ, giữ lại những địa chỉ có ID khác với ID cần xóa
    const updatedAddresses = addresses.filter(addr => addr && addr.id !== addressIdToDelete); // Kiểm tra addr an toàn

    // Cập nhật state addresses ngay lập tức để giao diện phản hồi nhanh
    setAddresses(updatedAddresses);
    setAddressMessage(MESSAGES.ADDRESS_DELETE_SUCCESS); // Thông báo thành công

    // Lưu danh sách địa chỉ đã cập nhật vào localStorage (thông qua helper function) và cập nhật context
    updateUserAddressesInStorage(updatedAddresses);
    console.log(`Đã xóa địa chỉ có ID: ${addressIdToDelete}.`); // Log hành động xóa

  }, [addresses, updateUserAddressesInStorage, setAddresses, setAddressMessage]); // Dependencies: state addresses và helper function/setters


  // --- Render có điều kiện ---
  // Render nothing nếu người dùng chưa đăng nhập hoặc dữ liệu user chưa sẵn sàng (chuyển hướng được xử lý bởi useEffect)
  // Tránh render giao diện khi chưa có dữ liệu user cần thiết
  if (!isLoggedIn || !user) {
    return null;
  }

  // --- Render giao diện chính của trang hồ sơ ---
  return (
    <div className="user-profile-container">
      {/* Tiêu đề trang, hiển thị tên người dùng */}
      <h1>Xin chào, {user.username || 'Người dùng'}!</h1> {/* Hiển thị username an toàn */}
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

      {/* Menu điều hướng giữa các phần của trang hồ sơ */}
      <div className="profile-sections-menu">
        <button
          className={activeSection === 'profile' ? 'active' : ''} // Thêm class 'active' nếu đây là phần đang hiển thị
          onClick={() => setActiveSection('profile')} // Click để chuyển sang phần thông tin cá nhân
          aria-label="Xem và chỉnh sửa thông tin cá nhân" // Hỗ trợ khả năng tiếp cận
        >
          Thông tin cá nhân
        </button>
        <button
          className={activeSection === 'password' ? 'active' : ''} // Thêm class 'active' nếu đây là phần đang hiển thị
          onClick={() => setActiveSection('password')} // Click để chuyển sang phần đổi mật khẩu
          aria-label="Thay đổi mật khẩu" // Hỗ trợ khả năng tiếp cận
        >
          Đổi mật khẩu
        </button>
        <button
          className={activeSection === 'addresses' ? 'active' : ''} // Thêm class 'active' nếu đây là phần đang hiển thị
          onClick={() => setActiveSection('addresses')} // Click để chuyển sang phần địa chỉ giao hàng
          aria-label="Quản lý địa chỉ giao hàng" // Hỗ trợ khả năng tiếp cận
        >
          Địa chỉ giao hàng
        </button>
        <button
          className={activeSection === 'orders' ? 'active' : ''} // Thêm class 'active' nếu đây là phần đang hiển thị
          onClick={() => setActiveSection('orders')} // Click để chuyển sang phần lịch sử đơn hàng
          aria-label="Xem lịch sử đơn hàng" // Hỗ trợ khả năng tiếp cận
        >
          Lịch sử đơn hàng
        </button>
      </div>

      {/* Phần Thông tin cá nhân (Chỉ hiển thị khi activeSection là 'profile') */}
      {activeSection === 'profile' && (
        <section className="profile-info-section">
          <h2>Thông tin cá nhân</h2>
          {/* Form cập nhật thông tin cá nhân */}
          <form onSubmit={handleSubmitProfileUpdate} className="profile-form">
            {/* Input Tên đăng nhập (thường không cho phép chỉnh sửa) */}
            <div className="form-group">
              <label htmlFor="profile-username">Tên đăng nhập:</label>
              <input
                type="text"
                id="profile-username"
                name="username"
                value={profileFormData.username} // Lấy từ state form
                className="profile-input"
                disabled // Vô hiệu hóa input
                readOnly // Đảm bảo không thể nhập liệu
              />
            </div>
            {/* Input Email */}
            <div className="form-group">
              <label htmlFor="profile-email">Email:</label>
              <input
                type="email"
                id="profile-email"
                name="email"
                value={profileFormData.email} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'profile')} // Gắn handler thay đổi
                className="profile-input"
              />
            </div>
            {/* Input Số điện thoại */}
            <div className="form-group">
              <label htmlFor="profile-phone">Số điện thoại:</label>
              <input
                type="tel" // Gợi ý bàn phím số trên mobile
                id="profile-phone"
                name="phone"
                value={profileFormData.phone} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'profile')} // Gắn handler thay đổi
                className="profile-input"
              />
            </div>

            {/* Nút cập nhật thông tin */}
            <button type="submit" className="profile-update-button">
              Cập nhật thông tin
            </button>
          </form>
          {/* Hiển thị thông báo cập nhật profile */}
          {profileMessage && (
            <p className={`message ${profileMessage.includes('thành công') ? 'success' : profileMessage.includes('thất bại') || profileMessage.includes('Lỗi') || profileMessage.includes('Không tìm thấy') ? 'error' : ''}`}>
              {profileMessage}
            </p>
          )}
        </section>
      )}

      {/* Phần Đổi mật khẩu (Chỉ hiển thị khi activeSection là 'password') */}
      {activeSection === 'password' && (
        <section className="change-password-section">
          <h2>Đổi mật khẩu</h2>
          {/* Form đổi mật khẩu */}
          <form onSubmit={handleSubmitPasswordChange} className="password-form">
            {/* Input Mật khẩu cũ */}
            <div className="form-group">
              <label htmlFor="oldPassword">Mật khẩu cũ:</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordFormData.oldPassword} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'password')} // Gắn handler thay đổi
                className="password-input"
                required // Yêu cầu nhập
                autoComplete="current-password" // Gợi ý trình duyệt
              />
            </div>
            {/* Input Mật khẩu mới */}
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordFormData.newPassword} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'password')} // Gắn handler thay đổi
                className="password-input"
                required // Yêu cầu nhập
                autoComplete="new-password" // Gợi ý trình duyệt
                minLength={MIN_PASSWORD_LENGTH} // Yêu cầu độ dài tối thiểu
              />
            </div>
            {/* Input Xác nhận mật khẩu mới */}
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={passwordFormData.confirmNewPassword} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'password')} // Gắn handler thay đổi
                className="password-input"
                required // Yêu cầu nhập
                autoComplete="new-password" // Gợi ý trình duyệt
                minLength={MIN_PASSWORD_LENGTH} // Yêu cầu độ dài tối thiểu
              />
            </div>
            {/* Nút đổi mật khẩu */}
            <button type="submit" className="change-password-button">
              Đổi mật khẩu
            </button>
          </form>
          {/* Hiển thị thông báo đổi mật khẩu */}
          {passwordMessage && (
             <p className={`message ${passwordMessage.includes('thành công') ? 'success' : (passwordMessage.includes('thất bại') || passwordMessage.includes('không khớp') || passwordMessage.includes('không đúng') || passwordMessage.includes('ít nhất') || passwordMessage.includes('trùng') || passwordMessage.includes('Lỗi')) ? 'error' : ''}`}>
               {passwordMessage}
             </p>
           )}
        </section>
      )}

      {/* Phần Địa chỉ giao hàng (Chỉ hiển thị khi activeSection là 'addresses') */}
      {activeSection === 'addresses' && (
        <section className="addresses-section">
          <h2>Địa chỉ giao hàng</h2>

          {/* Form thêm địa chỉ mới */}
          <h3>Thêm địa chỉ mới</h3>
          <form onSubmit={handleAddAddress} className="address-form">
            {/* Input Địa chỉ */}
            <div className="form-group">
              <label htmlFor="new-address-address">Địa chỉ:</label>
              <input
                type="text"
                id="new-address-address"
                name="address"
                placeholder="Nhập địa chỉ chi tiết"
                value={newAddressFormData.address} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'newAddress')} // Gắn handler thay đổi
                required // Yêu cầu nhập
              />
            </div>
            {/* Input Người nhận */}
            <div className="form-group">
              <label htmlFor="new-address-name">Người nhận:</label>
              <input
                type="text"
                id="new-address-name"
                name="name"
                placeholder="Tên người nhận"
                value={newAddressFormData.name} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'newAddress')} // Gắn handler thay đổi
                required // Yêu cầu nhập
              />
            </div>
            {/* Input Số điện thoại */}
            <div className="form-group">
              <label htmlFor="new-address-phone">Điện thoại:</label>
              <input
                type="tel" // Gợi ý bàn phím số trên mobile
                id="new-address-phone"
                name="phone"
                placeholder="Số điện thoại liên hệ"
                value={newAddressFormData.phone} // Lấy từ state form
                onChange={(e) => handleInputChange(e, 'newAddress')} // Gắn handler thay đổi
                required // Yêu cầu nhập
              />
            </div>
            {/* Nút lưu địa chỉ mới */}
            <button type="submit">Lưu địa chỉ mới</button>
          </form>

          {/* Hiển thị thông báo địa chỉ */}
          {addressMessage && (
            <p className={`message ${addressMessage.includes('thành công') ? 'success' : addressMessage.includes('thất bại') || addressMessage.includes('Lỗi') || addressMessage.includes('Vui lòng điền') || addressMessage.includes('Không tìm thấy') ? 'error' : ''}`}>
              {addressMessage}
            </p>
          )}

          {/* Danh sách địa chỉ đã lưu */}
          <h3>Danh sách địa chỉ của bạn ({Array.isArray(addresses) ? addresses.length : 0})</h3> {/* Hiển thị số lượng an toàn */}
          {Array.isArray(addresses) && addresses.length === 0 ? ( // Kiểm tra an toàn và số lượng
            <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
          ) : (
            <ul className="address-list">
              {/* Map qua danh sách địa chỉ (kiểm tra an toàn) */}
              {Array.isArray(addresses) && addresses.map(addr => (
                 // Sử dụng id duy nhất làm key (kiểm tra addr an toàn)
                 // Fallback về index nếu id không tồn tại (ít lý tưởng hơn)
                <li key={addr?.id || addresses.indexOf(addr)} className="address-item">
                   {/* Hiển thị thông tin địa chỉ an toàn */}
                  <p><strong>Địa chỉ:</strong> {addr?.address || 'N/A'}</p>
                  <p><strong>Người nhận:</strong> {addr?.name || 'N/A'}</p>
                  <p><strong>Điện thoại:</strong> {addr?.phone || 'N/A'}</p>
                  {/* Nút xóa địa chỉ */}
                  <button
                    className="delete-address-button"
                    onClick={() => handleDeleteAddress(addr?.id)} // Truyền ID an toàn
                    aria-label={`Xóa địa chỉ ${addr?.address || ''}`} // Label an toàn
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Phần Lịch sử đơn hàng (Chỉ hiển thị khi activeSection là 'orders') */}
      {activeSection === 'orders' && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          {/* Render OrderHistory component. Đảm bảo OrderHistory component tự lấy dữ liệu đơn hàng của user hiện tại (ví dụ: từ AuthContext). */}
          <OrderHistory />
        </section>
      )}


      {/* Link quay lại trang chủ */}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

export default UserProfilePage; // Export component
