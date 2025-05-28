// --- Import các module cần thiết ---
// React và các hook cơ bản: useReducer, useContext, useEffect, useCallback
import React, { useReducer, useContext, useEffect, useCallback } from "react";
// Hook từ react-router-dom để điều hướng và tạo link
import { useNavigate, Link } from "react-router-dom";
// Context để quản lý trạng thái xác thực người dùng
import { AuthContext } from "../account/AuthContext"; // Giả định đường dẫn này là chính xác
// Component hiển thị lịch sử đơn hàng
import OrderHistory from "./OrderHistory"; // Giả định đường dẫn này là chính xác
// Thư viện để kiểm tra kiểu dữ liệu của props
import PropTypes from 'prop-types';
// Import file CSS cho UserProfilePage
import "./UserProfilePage.css"; // Giả định đường dẫn này là chính xác

// --- Định nghĩa các hằng số ---
// Khóa sử dụng cho việc lưu trữ danh sách người dùng trong localStorage
const LOCAL_STORAGE_USERS_KEY = "users";
// Độ dài tối thiểu cho mật khẩu mới
const MIN_PASSWORD_LENGTH = 6;

// Đối tượng chứa các thông báo sẽ hiển thị cho người dùng
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
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem trang hồ sơ.",
  INVALID_PROPS: "Dữ liệu đầu vào không hợp lệ.",
  INVALID_OLD_PASSWORD: "Mật khẩu cũ không chính xác.", // Thêm thông báo này
  PASSWORD_MISMATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.", // Thêm thông báo này
  ADDRESS_REQUIRED: "Vui lòng nhập địa chỉ.", // Thêm thông báo này
  NAME_REQUIRED: "Vui lòng nhập tên người nhận.", // Thêm thông báo này
  INVALID_PHONE: "Số điện thoại không hợp lệ. Phải có 10-11 chữ số.", // Thêm thông báo này
};

// Các loại form khác nhau trong trang hồ sơ
const FORM_TYPES = {
  PROFILE: "profile",     // Form thông tin cá nhân
  PASSWORD: "password",   // Form đổi mật khẩu
  ADDRESS: "address",     // Form quản lý địa chỉ
};

// Các loại hành động (action) sử dụng trong reducer
const ACTION_TYPES = {
  SET_ACTIVE_SECTION: "SET_ACTIVE_SECTION", // Đặt mục đang hoạt động (profile, password, ...)
  UPDATE_FORM_STATE: "UPDATE_FORM_STATE",   // Cập nhật trạng thái của một form cụ thể
  SET_MESSAGE: "SET_MESSAGE",               // Đặt thông báo cho một form cụ thể
  RESET_FORM: "RESET_FORM",                 // Reset trạng thái của một form về giá trị mặc định
};

// Danh sách các mục (section) trong trang hồ sơ người dùng
const SECTIONS = [
  { id: FORM_TYPES.PROFILE, label: "Thông tin cá nhân" },
  { id: FORM_TYPES.PASSWORD, label: "Đổi mật khẩu" },
  { id: "addresses", label: "Địa chỉ giao hàng" }, // Sử dụng FORM_TYPES.ADDRESS sẽ tốt hơn
  { id: "orders", label: "Lịch sử đơn hàng" },
];

// Thời gian chờ (miligiây) trước khi tự động đăng xuất sau khi đổi mật khẩu thành công
const LOGOUT_DELAY = 2000;

// --- Trạng thái khởi tạo cho reducer ---
// Định nghĩa cấu trúc trạng thái ban đầu cho toàn bộ trang hồ sơ
const initialState = {
  activeSection: FORM_TYPES.PROFILE, // Mục đang được hiển thị mặc định là "Thông tin cá nhân"
  profile: { username: "", email: "", phone: "", message: "" }, // Trạng thái cho form thông tin cá nhân
  password: { oldPassword: "", newPassword: "", confirmNewPassword: "", message: "" }, // Trạng thái cho form đổi mật khẩu
  address: { addresses: [], newAddress: { address: "", name: "", phone: "" }, message: "" }, // Trạng thái cho form địa chỉ
};

// --- Reducer function để quản lý trạng thái ---
// Hàm reducer nhận vào trạng thái hiện tại và một hành động, trả về trạng thái mới
const profileReducer = (state, action) => {
  switch (action.type) {
    // Trường hợp đặt mục đang hoạt động
    case ACTION_TYPES.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload }; // Cập nhật activeSection với giá trị từ payload

    // Trường hợp cập nhật trạng thái của một form
    case ACTION_TYPES.UPDATE_FORM_STATE: {
      const { formType, data } = action.payload; // Lấy loại form và dữ liệu mới từ payload
      return {
        ...state, // Giữ nguyên các phần khác của state
        [formType]: { ...state[formType], ...data, message: "" }, // Cập nhật form cụ thể, xóa thông báo cũ
      };
    }
    // Trường hợp đặt thông báo cho một form
    case ACTION_TYPES.SET_MESSAGE: {
      const { formType, message } = action.payload; // Lấy loại form và thông báo từ payload
      return {
        ...state, // Giữ nguyên các phần khác của state
        [formType]: { ...state[formType], message }, // Cập nhật thông báo cho form cụ thể
      };
    }
    // Trường hợp reset một form
    case ACTION_TYPES.RESET_FORM: {
      const { formType, defaultData, message } = action.payload; // Lấy loại form, dữ liệu mặc định và thông báo
      return {
        ...state, // Giữ nguyên các phần khác của state
        [formType]: { ...defaultData, message }, // Reset form về dữ liệu mặc định và đặt thông báo mới
      };
    }
    // Trường hợp mặc định nếu không có action nào khớp
    default:
      return state; // Trả về trạng thái hiện tại
  }
};

// --- Các hàm tiện ích ---

/**
 * Đọc danh sách người dùng từ localStorage.
 * @returns {Array|null} Mảng các đối tượng người dùng, hoặc null nếu có lỗi.
 */
const readUsersFromStorage = () => {
  try {
    // Lấy dữ liệu từ localStorage với khóa LOCAL_STORAGE_USERS_KEY
    const usersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    // Parse chuỗi JSON thành mảng, nếu không có dữ liệu thì trả về mảng rỗng
    return JSON.parse(usersData || "[]");
  } catch (error) {
    // Ghi lỗi ra console nếu có vấn đề khi parse JSON
    console.error(MESSAGES.SYSTEM_ERROR_READING_USERS, error);
    return null; // Trả về null nếu có lỗi
  }
};

/**
 * Lưu danh sách người dùng vào localStorage.
 * @param {Array} users Mảng các đối tượng người dùng cần lưu.
 * @returns {boolean} True nếu lưu thành công, false nếu có lỗi.
 */
const saveUsersToStorage = (users) => {
  try {
    // Chuyển đổi mảng người dùng thành chuỗi JSON và lưu vào localStorage
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true; // Trả về true nếu lưu thành công
  } catch (error) {
    // Ghi lỗi ra console nếu có vấn đề khi lưu
    console.error(MESSAGES.SYSTEM_ERROR_UPDATING_USERS, error);
    return false; // Trả về false nếu có lỗi
  }
};

/**
 * Kiểm tra tính hợp lệ của thông tin đổi mật khẩu.
 * @param {object} passwords Đối tượng chứa oldPassword, newPassword, confirmNewPassword.
 * @param {string} currentPassword Mật khẩu hiện tại của người dùng.
 * @returns {string|null} Thông báo lỗi nếu không hợp lệ, null nếu hợp lệ.
 */
const validatePasswordChange = ({ oldPassword, newPassword, confirmNewPassword }, currentPassword) => {
  // Kiểm tra mật khẩu cũ có khớp không
  if (oldPassword !== currentPassword) return MESSAGES.INVALID_OLD_PASSWORD;
  // Kiểm tra độ dài mật khẩu mới
  if (newPassword.length < MIN_PASSWORD_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
  if (newPassword !== confirmNewPassword) return MESSAGES.PASSWORDS_NOT_MATCH;
  // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
  if (newPassword === oldPassword) return MESSAGES.PASSWORD_SAME_AS_OLD;
  // Nếu tất cả đều hợp lệ
  return null;
};

/**
 * Kiểm tra tính hợp lệ của thông tin địa chỉ.
 * @param {object} addressData Đối tượng chứa address, name, phone.
 * @returns {string|null} Thông báo lỗi nếu không hợp lệ, null nếu hợp lệ.
 */
const validateAddress = ({ address, name, phone }) => {
  // Kiểm tra địa chỉ có được nhập không (sau khi đã loại bỏ khoảng trắng thừa)
  if (!address.trim()) return MESSAGES.ADDRESS_REQUIRED;
  // Kiểm tra tên người nhận có được nhập không
  if (!name.trim()) return MESSAGES.NAME_REQUIRED;
  // Kiểm tra số điện thoại có được nhập không và có đúng định dạng (10-11 chữ số)
  if (!phone.trim() || !/^\d{10,11}$/.test(phone.trim())) return MESSAGES.INVALID_PHONE;
  // Nếu tất cả đều hợp lệ
  return null;
};

// --- Component: ProfileForm (Form thông tin cá nhân) ---
// Sử dụng React.memo để tối ưu hóa, chỉ render lại khi props thay đổi
const ProfileForm = React.memo(({ formData, onChange, onSubmit, message }) => (
  <section className="profile-info-section"> {/* Phần tử bao bọc cho mục thông tin cá nhân */}
    <h2>Thông tin cá nhân</h2> {/* Tiêu đề của mục */}
    <form onSubmit={onSubmit} className="profile-form"> {/* Form xử lý việc cập nhật thông tin */}
      {/* Nhóm trường Tên đăng nhập */}
      <div className="form-group">
        <label htmlFor="profile-username">Tên đăng nhập:</label> {/* Nhãn cho input tên đăng nhập */}
        <input
          type="text" // Kiểu input là text
          id="profile-username" // ID cho input, dùng cho label
          name="username" // Tên của input, dùng để xác định trường dữ liệu
          value={formData.username} // Giá trị của input, lấy từ state
          className="profile-input" // Class CSS cho input
          disabled // Không cho phép chỉnh sửa tên đăng nhập
          readOnly // Chỉ đọc
        />
      </div>
      {/* Nhóm trường Email */}
      <div className="form-group">
        <label htmlFor="profile-email">Email:</label> {/* Nhãn cho input email */}
        <input
          type="email" // Kiểu input là email
          id="profile-email" // ID cho input
          name="email" // Tên của input
          value={formData.email} // Giá trị của input
          onChange={onChange} // Hàm xử lý khi giá trị thay đổi
          className="profile-input" // Class CSS
        />
      </div>
      {/* Nhóm trường Số điện thoại */}
      <div className="form-group">
        <label htmlFor="profile-phone">Số điện thoại:</label> {/* Nhãn cho input số điện thoại */}
        <input
          type="tel" // Kiểu input là số điện thoại
          id="profile-phone" // ID cho input
          name="phone" // Tên của input
          value={formData.phone} // Giá trị của input
          onChange={onChange} // Hàm xử lý khi giá trị thay đổi
          className="profile-input" // Class CSS
        />
      </div>
      {/* Nút cập nhật thông tin */}
      <button type="submit" className="profile-update-button">
        Cập nhật thông tin
      </button>
    </form>
    {/* Hiển thị thông báo (nếu có) */}
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message} {/* Nội dung thông báo */}
      </p>
    )}
  </section>
));

// Định nghĩa kiểu dữ liệu cho props của ProfileForm
ProfileForm.propTypes = {
  formData: PropTypes.shape({ // formData phải là một object
    username: PropTypes.string.isRequired, // username là string và bắt buộc
    email: PropTypes.string.isRequired,    // email là string và bắt buộc
    phone: PropTypes.string.isRequired,    // phone là string và bắt buộc
  }).isRequired, // formData là bắt buộc
  onChange: PropTypes.func.isRequired, // onChange là function và bắt buộc
  onSubmit: PropTypes.func.isRequired, // onSubmit là function và bắt buộc
  message: PropTypes.string,          // message là string (không bắt buộc)
};
// Đặt tên hiển thị cho component, hữu ích khi debug
ProfileForm.displayName = 'ProfileForm';


// --- Component: PasswordForm (Form đổi mật khẩu) ---
const PasswordForm = React.memo(({ formData, onChange, onSubmit, message }) => (
  <section className="change-password-section"> {/* Phần tử bao bọc cho mục đổi mật khẩu */}
    <h2>Đổi mật khẩu</h2> {/* Tiêu đề của mục */}
    <form onSubmit={onSubmit} className="password-form"> {/* Form xử lý việc đổi mật khẩu */}
      {/* Nhóm trường Mật khẩu cũ */}
      <div className="form-group">
        <label htmlFor="oldPassword">Mật khẩu cũ:</label> {/* Nhãn cho input mật khẩu cũ */}
        <input
          type="password" // Kiểu input là password
          id="oldPassword" // ID cho input
          name="oldPassword" // Tên của input
          value={formData.oldPassword} // Giá trị của input
          onChange={onChange} // Hàm xử lý khi giá trị thay đổi
          className="password-input" // Class CSS
          required // Bắt buộc nhập
          autoComplete="current-password" // Gợi ý tự động điền mật khẩu hiện tại
        />
      </div>
      {/* Nhóm trường Mật khẩu mới */}
      <div className="form-group">
        <label htmlFor="newPassword">Mật khẩu mới:</label> {/* Nhãn cho input mật khẩu mới */}
        <input
          type="password" // Kiểu input là password
          id="newPassword" // ID cho input
          name="newPassword" // Tên của input
          value={formData.newPassword} // Giá trị của input
          onChange={onChange} // Hàm xử lý khi giá trị thay đổi
          className="password-input" // Class CSS
          required // Bắt buộc nhập
          autoComplete="new-password" // Gợi ý tự động điền mật khẩu mới
          minLength={MIN_PASSWORD_LENGTH} // Độ dài tối thiểu
        />
      </div>
      {/* Nhóm trường Xác nhận mật khẩu mới */}
      <div className="form-group">
        <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label> {/* Nhãn */}
        <input
          type="password" // Kiểu input là password
          id="confirmNewPassword" // ID cho input
          name="confirmNewPassword" // Tên của input
          value={formData.confirmNewPassword} // Giá trị của input
          onChange={onChange} // Hàm xử lý khi giá trị thay đổi
          className="password-input" // Class CSS
          required // Bắt buộc nhập
          autoComplete="new-password" // Gợi ý tự động điền mật khẩu mới
          minLength={MIN_PASSWORD_LENGTH} // Độ dài tối thiểu
        />
      </div>
      {/* Nút đổi mật khẩu */}
      <button type="submit" className="change-password-button">
        Đổi mật khẩu
      </button>
    </form>
    {/* Hiển thị thông báo (nếu có) */}
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message} {/* Nội dung thông báo */}
      </p>
    )}
  </section>
));

// Định nghĩa kiểu dữ liệu cho props của PasswordForm
PasswordForm.propTypes = {
  formData: PropTypes.shape({ // formData phải là một object
    oldPassword: PropTypes.string.isRequired,        // oldPassword là string và bắt buộc
    newPassword: PropTypes.string.isRequired,        // newPassword là string và bắt buộc
    confirmNewPassword: PropTypes.string.isRequired, // confirmNewPassword là string và bắt buộc
  }).isRequired, // formData là bắt buộc
  onChange: PropTypes.func.isRequired, // onChange là function và bắt buộc
  onSubmit: PropTypes.func.isRequired, // onSubmit là function và bắt buộc
  message: PropTypes.string,          // message là string (không bắt buộc)
};
// Đặt tên hiển thị cho component
PasswordForm.displayName = 'PasswordForm';


// --- Component: AddressForm (Form quản lý địa chỉ) ---
const AddressForm = React.memo(({
  addresses,             // Danh sách các địa chỉ đã lưu
  newAddressFormData,    // Dữ liệu cho form thêm địa chỉ mới
  onChange,              // Hàm xử lý thay đổi input của form thêm mới
  onAddAddress,          // Hàm xử lý khi submit form thêm địa chỉ mới
  onDeleteAddress,       // Hàm xử lý khi xóa một địa chỉ
  message                // Thông báo cho mục địa chỉ
}) => (
  <section className="addresses-section"> {/* Phần tử bao bọc cho mục địa chỉ */}
    <h2>Địa chỉ giao hàng</h2> {/* Tiêu đề của mục */}
    <h3>Thêm địa chỉ mới</h3> {/* Tiêu đề phụ cho form thêm địa chỉ */}
    <form onSubmit={onAddAddress} className="address-form"> {/* Form thêm địa chỉ mới */}
      {/* Nhóm trường Địa chỉ */}
      <div className="form-group">
        <label htmlFor="new-address-address">Địa chỉ:</label> {/* Nhãn */}
        <input
          type="text" // Kiểu input
          id="new-address-address" // ID
          name="address" // Tên trường dữ liệu (trong newAddressFormData)
          value={newAddressFormData.address} // Giá trị
          onChange={onChange} // Hàm xử lý thay đổi
          required // Bắt buộc nhập
        />
      </div>
      {/* Nhóm trường Người nhận */}
      <div className="form-group">
        <label htmlFor="new-address-name">Người nhận:</label> {/* Nhãn */}
        <input
          type="text" // Kiểu input
          id="new-address-name" // ID
          name="name" // Tên trường dữ liệu
          value={newAddressFormData.name} // Giá trị
          onChange={onChange} // Hàm xử lý thay đổi
          required // Bắt buộc nhập
        />
      </div>
      {/* Nhóm trường Điện thoại */}
      <div className="form-group">
        <label htmlFor="new-address-phone">Điện thoại:</label> {/* Nhãn */}
        <input
          type="tel" // Kiểu input số điện thoại
          id="new-address-phone" // ID
          name="phone" // Tên trường dữ liệu
          value={newAddressFormData.phone} // Giá trị
          onChange={onChange} // Hàm xử lý thay đổi
          required // Bắt buộc nhập
        />
      </div>
      {/* Nút lưu địa chỉ mới */}
      <button type="submit">Lưu địa chỉ mới</button>
    </form>
    {/* Hiển thị thông báo (nếu có) */}
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message} {/* Nội dung thông báo */}
      </p>
    )}

    {/* Phần hiển thị danh sách địa chỉ đã lưu */}
    <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3> {/* Tiêu đề và số lượng địa chỉ */}
    {addresses.length === 0 ? ( // Kiểm tra nếu không có địa chỉ nào
      <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p> // Thông báo trạng thái rỗng
    ) : (
      <ul className="address-list"> {/* Danh sách các địa chỉ */}
        {addresses.map((addr) => ( // Lặp qua mảng địa chỉ để hiển thị từng địa chỉ
          <li key={addr.id} className="address-item"> {/* Mỗi địa chỉ là một list item, key là id */}
            <p><strong>Địa chỉ:</strong> {addr.address}</p> {/* Hiển thị thông tin địa chỉ */}
            <p><strong>Người nhận:</strong> {addr.name}</p> {/* Hiển thị tên người nhận */}
            <p><strong>Điện thoại:</strong> {addr.phone}</p> {/* Hiển thị số điện thoại */}
            <button
              className="delete-address-button" // Class CSS cho nút xóa
              onClick={() => onDeleteAddress(addr.id)} // Gọi hàm xóa địa chỉ với id tương ứng
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
));

// Định nghĩa kiểu dữ liệu cho props của AddressForm
AddressForm.propTypes = {
  addresses: PropTypes.arrayOf( // addresses phải là một mảng các object
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // id là string hoặc number, bắt buộc
      address: PropTypes.string.isRequired, // address là string, bắt buộc
      name: PropTypes.string.isRequired,    // name là string, bắt buộc
      phone: PropTypes.string.isRequired,   // phone là string, bắt buộc
    })
  ).isRequired, // addresses là bắt buộc
  newAddressFormData: PropTypes.shape({ // newAddressFormData phải là một object
    address: PropTypes.string.isRequired, // address là string, bắt buộc
    name: PropTypes.string.isRequired,    // name là string, bắt buộc
    phone: PropTypes.string.isRequired,   // phone là string, bắt buộc
  }).isRequired, // newAddressFormData là bắt buộc
  onChange: PropTypes.func.isRequired,      // onChange là function, bắt buộc
  onAddAddress: PropTypes.func.isRequired,  // onAddAddress là function, bắt buộc
  onDeleteAddress: PropTypes.func.isRequired, // onDeleteAddress là function, bắt buộc
  message: PropTypes.string,                // message là string (không bắt buộc)
};
// Đặt tên hiển thị cho component
AddressForm.displayName = 'AddressForm';


// --- Component chính: UserProfilePage ---
const UserProfilePage = () => {
  // Lấy thông tin xác thực từ AuthContext
  const authContext = useContext(AuthContext);

  // Kiểm tra nếu AuthContext không được cung cấp (ví dụ: UserProfilePage không nằm trong AuthProvider)
  if (!authContext) {
    // Ghi lỗi ra console. Trong ứng dụng thực tế, nên có ErrorBoundary hoặc xử lý tốt hơn.
    console.error("AuthContext must be provided. Ensure UserProfilePage is wrapped in AuthProvider.");
    // Có thể hiển thị một thông báo lỗi cho người dùng hoặc trả về null để không render gì cả.
    return <p>Lỗi: AuthContext không khả dụng. Vui lòng liên hệ quản trị viên.</p>;
  }
  // Lấy các giá trị user, isLoggedIn, login, logout từ context
  const { user, isLoggedIn, login, logout } = authContext;

  // Hook để điều hướng giữa các trang
  const navigate = useNavigate();
  // Sử dụng useReducer để quản lý trạng thái của trang hồ sơ, với profileReducer và initialState đã định nghĩa
  const [state, dispatch] = useReducer(profileReducer, initialState);

  /**
   * Hàm memoized để cập nhật dữ liệu người dùng trong localStorage và AuthContext.
   * @param {object} updatedUserData Dữ liệu người dùng cần cập nhật.
   * @returns {object} Đối tượng chứa { success: boolean, message: string }.
   */
  const updateUserAndContext = useCallback(
    (updatedUserData) => {
      // Đọc danh sách người dùng hiện tại từ localStorage
      const storedUsers = readUsersFromStorage();
      // Nếu không đọc được hoặc có lỗi
      if (!storedUsers) {
        return { success: false, message: MESSAGES.SYSTEM_ERROR_READING_USERS };
      }
      // Nếu không có thông tin người dùng hiện tại trong context (chưa đăng nhập hoặc lỗi)
      if (!user?.username) {
        return { success: false, message: MESSAGES.USER_NOT_FOUND };
      }

      // Tìm vị trí (index) của người dùng hiện tại trong danh sách đã đọc từ localStorage
      const userIndex = storedUsers.findIndex((u) => u.username === user.username);
      // Nếu không tìm thấy người dùng trong localStorage
      if (userIndex === -1) {
        return { success: false, message: MESSAGES.USER_NOT_FOUND };
      }

      // Tạo đối tượng người dùng mới bằng cách kết hợp dữ liệu cũ và dữ liệu cập nhật
      const updatedUser = { ...storedUsers[userIndex], ...updatedUserData };
      // Cập nhật thông tin người dùng tại vị trí đã tìm thấy trong mảng
      storedUsers[userIndex] = updatedUser;

      // Lưu lại toàn bộ danh sách người dùng đã cập nhật vào localStorage
      const saveSuccess = saveUsersToStorage(storedUsers);
      // Nếu lưu thành công
      if (saveSuccess) {
        // Cập nhật thông tin người dùng trong AuthContext (để các component khác cũng có dữ liệu mới)
        login(updatedUser); // Hàm login từ AuthContext có thể được dùng để cập nhật user
        return { success: true, message: "" }; // Trả về thành công
      }
      // Nếu lưu thất bại
      return { success: false, message: MESSAGES.SYSTEM_ERROR_UPDATING_USERS };
    },
    [user, login] // Dependencies: hàm sẽ được tạo lại nếu user hoặc login thay đổi
  );

  // useEffect để khởi tạo dữ liệu người dùng khi component được mount hoặc khi user thay đổi
  useEffect(() => {
    // Nếu người dùng chưa đăng nhập hoặc không có thông tin user.username
    if (!isLoggedIn || !user?.username) {
      // Hiển thị thông báo yêu cầu đăng nhập.
      // Lưu ý: alert() có thể bị chặn trong một số môi trường (ví dụ: iframe) và không phải là cách tốt nhất để hiển thị thông báo.
      // Cân nhắc sử dụng một modal hoặc component thông báo tùy chỉnh.
      alert(MESSAGES.LOGIN_REQUIRED);
      // Điều hướng người dùng về trang chủ (hoặc trang đăng nhập)
      navigate("/"); // Điều hướng về trang chủ
      return; // Kết thúc sớm để không chạy code phía dưới
    }

    // Nếu đã đăng nhập, dispatch action để cập nhật form thông tin cá nhân với dữ liệu từ user context
    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.PROFILE,
        data: {
          username: user.username,
          email: user.email || "", // Sử dụng "" nếu email là null/undefined
          phone: user.phone || "", // Sử dụng "" nếu phone là null/undefined
        },
      },
    });

    // Dispatch action để cập nhật form địa chỉ với danh sách địa chỉ từ user context
    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.ADDRESS,
        data: { addresses: user.addresses || [] }, // Sử dụng mảng rỗng nếu addresses là null/undefined
      },
    });
  }, [isLoggedIn, navigate, user]); // Dependencies: effect chạy lại khi isLoggedIn, navigate, hoặc user thay đổi

  /**
   * Hàm memoized xử lý thay đổi giá trị trong các input của form.
   * @param {Event} e Sự kiện thay đổi input.
   ** @param {string} formType Loại form (profile, password, address).
   */
  const handleInputChange = useCallback(
    (e, formType) => {
      const { name, value } = e.target; // Lấy tên và giá trị của input đang thay đổi
      let data; // Biến để chứa dữ liệu cập nhật cho state

      // Nếu là form địa chỉ, cấu trúc dữ liệu cập nhật sẽ khác
      if (formType === FORM_TYPES.ADDRESS) {
        data = {
          newAddress: { ...state.address.newAddress, [name]: value }, // Cập nhật trường trong newAddress
        };
      } else {
        // Đối với các form khác (profile, password)
        data = { [name]: value }; // Cập nhật trực tiếp trường dữ liệu
      }

      // Dispatch action để cập nhật state của form tương ứng
      dispatch({
        type: ACTION_TYPES.UPDATE_FORM_STATE,
        payload: { formType, data },
      });
    },
    [state.address.newAddress] // Dependency: state.address.newAddress để đảm bảo newAddress luôn mới nhất
  );

  /**
   * Xử lý việc submit form cập nhật thông tin cá nhân.
   * @param {Event} e Sự kiện submit form.
   */
  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)

    // Chuẩn bị dữ liệu cập nhật, loại bỏ khoảng trắng thừa ở email và phone
    const updatedData = {
      email: state.profile.email.trim(),
      phone: state.profile.phone.trim(),
    };

    // Gọi hàm cập nhật người dùng và context
    const { success, message: updateMessage } = updateUserAndContext(updatedData);

    // Dispatch action để đặt thông báo kết quả
    dispatch({
      type: ACTION_TYPES.SET_MESSAGE,
      payload: {
        formType: FORM_TYPES.PROFILE,
        message: success ? MESSAGES.PROFILE_UPDATE_SUCCESS : (updateMessage || MESSAGES.PROFILE_UPDATE_FAILED),
      },
    });
  };

  /**
   * Xử lý việc submit form đổi mật khẩu.
   * @param {Event} e Sự kiện submit form.
   */
  const handleSubmitPasswordChange = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định

    // Đọc danh sách người dùng từ localStorage
    const storedUsers = readUsersFromStorage();
    // Nếu không đọc được hoặc không có thông tin user hiện tại
    if (!storedUsers || !user?.username) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: MESSAGES.SYSTEM_ERROR_READING_USERS },
      });
      return; // Kết thúc sớm
    }

    // Tìm người dùng hiện tại trong danh sách đã đọc
    const currentUser = storedUsers.find((u) => u.username === user.username);
    // Nếu không tìm thấy
    if (!currentUser) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: MESSAGES.USER_NOT_FOUND },
      });
      return; // Kết thúc sớm
    }

    // Kiểm tra tính hợp lệ của các trường mật khẩu
    const validationError = validatePasswordChange(state.password, currentUser.password);
    // Nếu có lỗi validation
    if (validationError) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: validationError },
      });
      return; // Kết thúc sớm
    }

    // Nếu không có lỗi, tiến hành cập nhật mật khẩu
    const { success, message: updateMessage } = updateUserAndContext({ password: state.password.newPassword });
    // Nếu cập nhật thành công
    if (success) {
      // Dispatch action để reset form mật khẩu và hiển thị thông báo thành công
      dispatch({
        type: ACTION_TYPES.RESET_FORM,
        payload: {
          formType: FORM_TYPES.PASSWORD,
          defaultData: { oldPassword: "", newPassword: "", confirmNewPassword: "" }, // Dữ liệu mặc định sau khi reset
          message: MESSAGES.PASSWORD_CHANGE_SUCCESS,
        },
      });
      // Đăng xuất người dùng sau một khoảng thời gian ngắn
      setTimeout(logout, LOGOUT_DELAY);
    } else {
      // Nếu cập nhật thất bại, hiển thị thông báo lỗi
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: updateMessage || MESSAGES.PASSWORD_CHANGE_FAILED },
      });
    }
  };

  /**
   * Xử lý việc thêm một địa chỉ mới.
   * @param {Event} e Sự kiện submit form.
   */
  const handleAddAddress = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định

    // Kiểm tra tính hợp lệ của dữ liệu địa chỉ mới
    const validationError = validateAddress(state.address.newAddress);
    // Nếu có lỗi validation
    if (validationError) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.ADDRESS, message: validationError },
      });
      return; // Kết thúc sớm
    }

    // Tạo đối tượng địa chỉ mới với ID duy nhất (sử dụng Date.now() là cách đơn giản)
    // và loại bỏ khoảng trắng thừa
    const newAddressEntry = {
      id: Date.now(), // Tạo ID đơn giản, trong ứng dụng thực tế có thể cần UUID
      ...state.address.newAddress,
      address: state.address.newAddress.address.trim(),
      name: state.address.newAddress.name.trim(),
      phone: state.address.newAddress.phone.trim(),
    };

    // Tạo mảng địa chỉ mới bằng cách thêm địa chỉ vừa tạo vào danh sách hiện tại
    const updatedAddresses = [...state.address.addresses, newAddressEntry];
    // Cập nhật danh sách địa chỉ trong localStorage và context
    const { success, message: updateMessage } = updateUserAndContext({ addresses: updatedAddresses });

    // Nếu cập nhật thành công
    if (success) {
      // Dispatch action để reset form thêm địa chỉ và hiển thị thông báo thành công
      dispatch({
        type: ACTION_TYPES.RESET_FORM,
        payload: {
          formType: FORM_TYPES.ADDRESS,
          defaultData: {
            addresses: updatedAddresses, // Cập nhật danh sách địa chỉ trong state
            newAddress: { address: "", name: "", phone: "" }, // Reset form thêm mới
          },
          message: MESSAGES.ADDRESS_SAVE_SUCCESS,
        },
      });
    } else {
      // Nếu cập nhật thất bại, hiển thị thông báo lỗi
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.ADDRESS, message: updateMessage || MESSAGES.ADDRESS_SAVE_FAILED },
      });
    }
  };

  /**
   * Xử lý việc xóa một địa chỉ.
   * @param {number|string} addressId ID của địa chỉ cần xóa.
   */
  const handleDeleteAddress = (addressId) => {
    // Yêu cầu xác nhận từ người dùng trước khi xóa.
    // Lưu ý: window.confirm() cũng có thể bị chặn hoặc không phù hợp trong mọi ngữ cảnh.
    // Cân nhắc sử dụng modal xác nhận tùy chỉnh.
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return; // Nếu người dùng không đồng ý, không làm gì cả
    }

    // Tạo mảng địa chỉ mới bằng cách lọc bỏ địa chỉ có ID trùng khớp
    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== addressId);
    // Cập nhật danh sách địa chỉ trong localStorage và context
    const { success, message: updateMessage } = updateUserAndContext({ addresses: updatedAddresses });

    // Dispatch action để cập nhật state của form địa chỉ và hiển thị thông báo
    // Ngay cả khi thất bại, message sẽ được hiển thị, nhưng addresses sẽ không thay đổi nếu success là false.
    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE, // Hoặc SET_MESSAGE nếu chỉ muốn set message và addresses riêng
      payload: {
        formType: FORM_TYPES.ADDRESS,
        data: {
          // Chỉ cập nhật addresses trong state nếu lưu vào localStorage thành công
          addresses: success ? updatedAddresses : state.address.addresses,
          // Đặt message tương ứng
          message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : (updateMessage || MESSAGES.ADDRESS_SAVE_FAILED), // Giả sử lỗi lưu là chung
        },
      },
    });
  };


  // --- Phần render của component ---

  // Nếu người dùng chưa đăng nhập hoặc không có thông tin user, không render gì cả (đã được xử lý ở useEffect)
  // Tuy nhiên, thêm một kiểm tra ở đây để đảm bảo an toàn.
  if (!isLoggedIn || !user?.username) {
    // useEffect đã xử lý điều hướng, nhưng trả về null ở đây để tránh lỗi render.
    return null;
  }

  // Trả về JSX để render giao diện người dùng
  return (
    <div className="user-profile-container"> {/* Container chính của trang hồ sơ */}
      <h1>Xin chào, {user.username}!</h1> {/* Lời chào với tên người dùng */}
      <p>Quản lý thông tin và đơn hàng của bạn.</p> {/* Mô tả ngắn */}

      {/* Menu điều hướng giữa các mục của trang hồ sơ */}
      <nav className="profile-sections-menu">
        {SECTIONS.map((section) => ( // Lặp qua mảng SECTIONS để tạo các nút
          <button
            key={section.id} // Key cho mỗi nút
            className={state.activeSection === section.id ? "active" : ""} // Class "active" nếu mục đang được chọn
            onClick={() => dispatch({ type: ACTION_TYPES.SET_ACTIVE_SECTION, payload: section.id })} // Dispatch action khi click
          >
            {section.label} {/* Nhãn của nút */}
          </button>
        ))}
      </nav>

      {/* Hiển thị form tương ứng với mục đang được chọn (activeSection) */}
      {/* Mục Thông tin cá nhân */}
      {state.activeSection === FORM_TYPES.PROFILE && (
        <ProfileForm
          formData={state.profile} // Dữ liệu cho form
          onChange={(e) => handleInputChange(e, FORM_TYPES.PROFILE)} // Hàm xử lý thay đổi input
          onSubmit={handleSubmitProfileUpdate} // Hàm xử lý submit form
          message={state.profile.message} // Thông báo của form
        />
      )}

      {/* Mục Đổi mật khẩu */}
      {state.activeSection === FORM_TYPES.PASSWORD && (
        <PasswordForm
          formData={state.password} // Dữ liệu cho form
          onChange={(e) => handleInputChange(e, FORM_TYPES.PASSWORD)} // Hàm xử lý thay đổi input
          onSubmit={handleSubmitPasswordChange} // Hàm xử lý submit form
          message={state.password.message} // Thông báo của form
        />
      )}

      {/* Mục Địa chỉ giao hàng - Lưu ý: section.id trong SECTIONS là "addresses" */}
      {state.activeSection === "addresses" && ( // So sánh với 'addresses' như trong SECTIONS
        <AddressForm
          addresses={state.address.addresses} // Danh sách địa chỉ
          newAddressFormData={state.address.newAddress} // Dữ liệu form thêm địa chỉ mới
          onChange={(e) => handleInputChange(e, FORM_TYPES.ADDRESS)} // Hàm xử lý thay đổi input
          onAddAddress={handleAddAddress} // Hàm xử lý thêm địa chỉ
          onDeleteAddress={handleDeleteAddress} // Hàm xử lý xóa địa chỉ
          message={state.address.message} // Thông báo của form
        />
      )}

      {/* Mục Lịch sử đơn hàng - Lưu ý: section.id trong SECTIONS là "orders" */}
      {state.activeSection === "orders" && ( // So sánh với 'orders' như trong SECTIONS
        <section className="order-history-section"> {/* Container cho lịch sử đơn hàng */}
          <h2>Lịch sử đơn hàng</h2> {/* Tiêu đề */}
          <OrderHistory /> {/* Component hiển thị lịch sử đơn hàng */}
        </section>
      )}

      {/* Link để quay lại cửa hàng */}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link> {/* Sử dụng Link của react-router-dom */}
      </div>
    </div>
  );
};

// Xuất component UserProfilePage làm default export
export default UserProfilePage;

