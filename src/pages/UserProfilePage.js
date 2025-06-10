// ===== IMPORTS =====
// React core và hooks
import React, { useReducer, useContext, useEffect, useCallback } from "react";
// React Router hooks và components
import { useNavigate, Link } from "react-router-dom";
// Context xác thực người dùng
import { AuthContext } from "../account/AuthContext";
// Components
import OrderHistory from "./OrderHistory";
// Styles
import "./UserProfilePage.css";

// ===== CONSTANTS =====
// Cấu hình localStorage
const LOCAL_STORAGE_USERS_KEY = "users";

// Cấu hình mật khẩu
const MIN_PASSWORD_LENGTH = 6;
const LOGOUT_DELAY = 2000; // Thời gian chờ trước khi đăng xuất (ms)

// Các loại form trong trang
const FORM_TYPES = {
  PROFILE: "profile",     // Form thông tin cá nhân
  PASSWORD: "password",   // Form đổi mật khẩu
  ADDRESS: "address",     // Form quản lý địa chỉ
};

// Các loại action trong reducer
const ACTION_TYPES = {
  SET_ACTIVE_SECTION: "SET_ACTIVE_SECTION", // Chuyển đổi section
  UPDATE_FORM_STATE: "UPDATE_FORM_STATE",   // Cập nhật state của form
  SET_MESSAGE: "SET_MESSAGE",               // Cập nhật thông báo
  RESET_FORM: "RESET_FORM",                 // Reset form về trạng thái ban đầu
};

// Danh sách các section trong trang
const SECTIONS = [
  { id: FORM_TYPES.PROFILE, label: "Thông tin cá nhân" },
  { id: FORM_TYPES.PASSWORD, label: "Đổi mật khẩu" },
  { id: "addresses", label: "Địa chỉ giao hàng" },
  { id: "orders", label: "Lịch sử đơn hàng" },
];

// Các thông báo hệ thống
const MESSAGES = {
  // Thông báo liên quan đến mật khẩu
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
  PASSWORD_CHANGE_FAILED: "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.",
  PASSWORDS_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
  EMPTY_PASSWORD_FIELDS: "Vui lòng điền đầy đủ các trường mật khẩu.",
  PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ!",
  PASSWORD_TOO_SHORT: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`,
  INVALID_OLD_PASSWORD: "Mật khẩu cũ không chính xác.",

  // Thông báo liên quan đến thông tin cá nhân
  PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
  PROFILE_UPDATE_FAILED: "Cập nhật thông tin thất bại. Vui lòng thử lại.",

  // Thông báo liên quan đến địa chỉ
  ADDRESS_SAVE_SUCCESS: "Lưu địa chỉ thành công!",
  ADDRESS_SAVE_FAILED: "Lưu địa chỉ thất bại. Vui lòng thử lại.",
  ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
  ADDRESS_EMPTY_FIELDS: "Vui lòng điền đủ thông tin địa chỉ, tên và số điện thoại.",
  ADDRESS_REQUIRED: "Vui lòng nhập địa chỉ.",
  NAME_REQUIRED: "Vui lòng nhập tên người nhận.",
  INVALID_PHONE: "Số điện thoại không hợp lệ. Phải có 10-11 chữ số.",

  // Thông báo lỗi hệ thống
  SYSTEM_ERROR_READING_USERS: "Lỗi hệ thống, không thể đọc dữ liệu người dùng.",
  SYSTEM_ERROR_UPDATING_USERS: "Lỗi hệ thống, không thể lưu dữ liệu người dùng.",
  USER_NOT_FOUND: "Không tìm thấy thông tin người dùng hiện tại.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem trang hồ sơ.",
  INVALID_PROPS: "Dữ liệu đầu vào không hợp lệ.",
};

// ===== INITIAL STATE =====
// Trạng thái ban đầu của ứng dụng
const initialState = {
  activeSection: FORM_TYPES.PROFILE, // Section mặc định khi vào trang
  profile: { 
    username: "", 
    email: "", 
    phone: "", 
    message: "" 
  },
  password: { 
    oldPassword: "", 
    newPassword: "", 
    confirmNewPassword: "", 
    message: "" 
  },
  address: { 
    addresses: [], 
    newAddress: { 
      address: "", 
      name: "", 
      phone: "" 
    }, 
    message: "" 
  },
};

// ===== REDUCER =====
/**
 * Reducer quản lý state của trang profile
 * @param {Object} state - State hiện tại
 * @param {Object} action - Action được dispatch
 * @returns {Object} State mới
 */
const profileReducer = (state, action) => {
  switch (action.type) {
    // Chuyển đổi section đang active
    case ACTION_TYPES.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };

    // Cập nhật state của một form cụ thể
    case ACTION_TYPES.UPDATE_FORM_STATE: {
      const { formType, data } = action.payload;
      return {
        ...state,
        [formType]: { ...state[formType], ...data, message: "" },
      };
    }

    // Cập nhật thông báo cho một form
    case ACTION_TYPES.SET_MESSAGE: {
      const { formType, message } = action.payload;
      return {
        ...state,
        [formType]: { ...state[formType], message },
      };
    }

    // Reset form về trạng thái ban đầu
    case ACTION_TYPES.RESET_FORM: {
      const { formType, defaultData, message } = action.payload;
      return {
        ...state,
        [formType]: { ...defaultData, message },
      };
    }

    default:
      return state;
  }
};

// ===== UTILITY FUNCTIONS =====
/**
 * Đọc danh sách người dùng từ localStorage
 * @returns {Array|null} Danh sách người dùng hoặc null nếu có lỗi
 */
const readUsersFromStorage = () => {
  try {
    const usersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return JSON.parse(usersData || "[]");
  } catch (error) {
    console.error(MESSAGES.SYSTEM_ERROR_READING_USERS, error);
    return null;
  }
};

/**
 * Lưu danh sách người dùng vào localStorage
 * @param {Array} users - Danh sách người dùng cần lưu
 * @returns {boolean} True nếu lưu thành công, false nếu thất bại
 */
const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error(MESSAGES.SYSTEM_ERROR_UPDATING_USERS, error);
    return false;
  }
};

/**
 * Kiểm tra tính hợp lệ của thông tin đổi mật khẩu
 * @param {Object} passwords - Thông tin mật khẩu cần kiểm tra
 * @param {string} passwords.oldPassword - Mật khẩu cũ
 * @param {string} passwords.newPassword - Mật khẩu mới
 * @param {string} passwords.confirmNewPassword - Xác nhận mật khẩu mới
 * @param {string} currentPassword - Mật khẩu hiện tại của người dùng
 * @returns {string|null} Thông báo lỗi hoặc null nếu hợp lệ
 */
const validatePasswordChange = ({ oldPassword, newPassword, confirmNewPassword }, currentPassword) => {
  if (oldPassword !== currentPassword) return MESSAGES.INVALID_OLD_PASSWORD;
  if (newPassword.length < MIN_PASSWORD_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (newPassword !== confirmNewPassword) return MESSAGES.PASSWORDS_NOT_MATCH;
  if (newPassword === oldPassword) return MESSAGES.PASSWORD_SAME_AS_OLD;
  return null;
};

/**
 * Kiểm tra tính hợp lệ của thông tin địa chỉ
 * @param {Object} addressData - Thông tin địa chỉ cần kiểm tra
 * @param {string} addressData.address - Địa chỉ
 * @param {string} addressData.name - Tên người nhận
 * @param {string} addressData.phone - Số điện thoại
 * @returns {string|null} Thông báo lỗi hoặc null nếu hợp lệ
 */
const validateAddress = ({ address, name, phone }) => {
  if (!address.trim()) return MESSAGES.ADDRESS_REQUIRED;
  if (!name.trim()) return MESSAGES.NAME_REQUIRED;
  if (!phone.trim() || !/^\d{10,11}$/.test(phone.trim())) return MESSAGES.INVALID_PHONE;
  return null;
};

// ===== VALIDATION FUNCTIONS =====
/**
 * Kiểm tra kiểu dữ liệu của props cho ProfileForm
 * @param {Object} props - Props cần kiểm tra
 * @returns {boolean} True nếu props hợp lệ
 */
const validateProfileFormProps = (props) => {
  const { formData, onChange, onSubmit, message } = props;
  
  // Kiểm tra formData
  if (!formData || typeof formData !== 'object') return false;
  if (typeof formData.username !== 'string') return false;
  if (typeof formData.email !== 'string') return false;
  if (typeof formData.phone !== 'string') return false;

  // Kiểm tra các hàm callback
  if (typeof onChange !== 'function') return false;
  if (typeof onSubmit !== 'function') return false;

  // Kiểm tra message (có thể là undefined)
  if (message !== undefined && typeof message !== 'string') return false;

  return true;
};

/**
 * Kiểm tra kiểu dữ liệu của props cho PasswordForm
 * @param {Object} props - Props cần kiểm tra
 * @returns {boolean} True nếu props hợp lệ
 */
const validatePasswordFormProps = (props) => {
  const { formData, onChange, onSubmit, message } = props;

  // Kiểm tra formData
  if (!formData || typeof formData !== 'object') return false;
  if (typeof formData.oldPassword !== 'string') return false;
  if (typeof formData.newPassword !== 'string') return false;
  if (typeof formData.confirmNewPassword !== 'string') return false;

  // Kiểm tra các hàm callback
  if (typeof onChange !== 'function') return false;
  if (typeof onSubmit !== 'function') return false;

  // Kiểm tra message (có thể là undefined)
  if (message !== undefined && typeof message !== 'string') return false;

  return true;
};

/**
 * Kiểm tra kiểu dữ liệu của props cho AddressForm
 * @param {Object} props - Props cần kiểm tra
 * @returns {boolean} True nếu props hợp lệ
 */
const validateAddressFormProps = (props) => {
  const { addresses, newAddressFormData, onChange, onAddAddress, onDeleteAddress, message } = props;

  // Kiểm tra addresses
  if (!Array.isArray(addresses)) return false;
  for (const addr of addresses) {
    if (!addr || typeof addr !== 'object') return false;
    if (typeof addr.id !== 'string' && typeof addr.id !== 'number') return false;
    if (typeof addr.address !== 'string') return false;
    if (typeof addr.name !== 'string') return false;
    if (typeof addr.phone !== 'string') return false;
  }

  // Kiểm tra newAddressFormData
  if (!newAddressFormData || typeof newAddressFormData !== 'object') return false;
  if (typeof newAddressFormData.address !== 'string') return false;
  if (typeof newAddressFormData.name !== 'string') return false;
  if (typeof newAddressFormData.phone !== 'string') return false;

  // Kiểm tra các hàm callback
  if (typeof onChange !== 'function') return false;
  if (typeof onAddAddress !== 'function') return false;
  if (typeof onDeleteAddress !== 'function') return false;

  // Kiểm tra message (có thể là undefined)
  if (message !== undefined && typeof message !== 'string') return false;

  return true;
};

// ===== COMPONENTS =====
/**
 * Component hiển thị form thông tin cá nhân
 * Sử dụng React.memo để tối ưu performance, chỉ render lại khi props thay đổi
 */
const ProfileForm = React.memo((props) => {
  // Kiểm tra props trước khi render
  if (!validateProfileFormProps(props)) {
    console.error('ProfileForm: Props không hợp lệ');
    return null;
  }

  const { formData, onChange, onSubmit, message } = props;

  return (
    <section className="profile-info-section">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={onSubmit} className="profile-form">
        {/* Trường tên đăng nhập (readonly) */}
        <div className="form-group">
          <label htmlFor="profile-username">Tên đăng nhập:</label>
          <input
            type="text"
            id="profile-username"
            name="username"
            value={formData.username}
            className="profile-input"
            disabled
            readOnly
          />
        </div>

        {/* Trường email */}
        <div className="form-group">
          <label htmlFor="profile-email">Email:</label>
          <input
            type="email"
            id="profile-email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="profile-input"
          />
        </div>

        {/* Trường số điện thoại */}
        <div className="form-group">
          <label htmlFor="profile-phone">Số điện thoại:</label>
          <input
            type="tel"
            id="profile-phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="profile-input"
          />
        </div>

        {/* Nút cập nhật */}
        <button type="submit" className="profile-update-button">
          Cập nhật thông tin
        </button>
      </form>

      {/* Hiển thị thông báo */}
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </section>
  );
});

// Đặt tên hiển thị cho component (hữu ích khi debug)
ProfileForm.displayName = 'ProfileForm';

/**
 * Component hiển thị form đổi mật khẩu
 * Sử dụng React.memo để tối ưu performance
 */
const PasswordForm = React.memo((props) => {
  // Kiểm tra props trước khi render
  if (!validatePasswordFormProps(props)) {
    console.error('PasswordForm: Props không hợp lệ');
    return null;
  }

  const { formData, onChange, onSubmit, message } = props;

  return (
    <section className="change-password-section">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={onSubmit} className="password-form">
        {/* Trường mật khẩu cũ */}
        <div className="form-group">
          <label htmlFor="oldPassword">Mật khẩu cũ:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={onChange}
            className="password-input"
            required
            autoComplete="current-password"
          />
        </div>

        {/* Trường mật khẩu mới */}
        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={onChange}
            className="password-input"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />
        </div>

        {/* Trường xác nhận mật khẩu mới */}
        <div className="form-group">
          <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={onChange}
            className="password-input"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />
        </div>

        {/* Nút đổi mật khẩu */}
        <button type="submit" className="change-password-button">
          Đổi mật khẩu
        </button>
      </form>

      {/* Hiển thị thông báo */}
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </section>
  );
});

PasswordForm.displayName = 'PasswordForm';

/**
 * Component hiển thị form quản lý địa chỉ
 * Sử dụng React.memo để tối ưu performance
 */
const AddressForm = React.memo((props) => {
  // Kiểm tra props trước khi render
  if (!validateAddressFormProps(props)) {
    console.error('AddressForm: Props không hợp lệ');
    return null;
  }

  const { addresses, newAddressFormData, onChange, onAddAddress, onDeleteAddress, message } = props;

  return (
    <section className="addresses-section">
      <h2>Địa chỉ giao hàng</h2>

      {/* Form thêm địa chỉ mới */}
      <h3>Thêm địa chỉ mới</h3>
      <form onSubmit={onAddAddress} className="address-form">
        {/* Trường địa chỉ */}
        <div className="form-group">
          <label htmlFor="new-address-address">Địa chỉ:</label>
          <input
            type="text"
            id="new-address-address"
            name="address"
            value={newAddressFormData.address}
            onChange={onChange}
            required
          />
        </div>

        {/* Trường tên người nhận */}
        <div className="form-group">
          <label htmlFor="new-address-name">Người nhận:</label>
          <input
            type="text"
            id="new-address-name"
            name="name"
            value={newAddressFormData.name}
            onChange={onChange}
            required
          />
        </div>

        {/* Trường số điện thoại */}
        <div className="form-group">
          <label htmlFor="new-address-phone">Điện thoại:</label>
          <input
            type="tel"
            id="new-address-phone"
            name="phone"
            value={newAddressFormData.phone}
            onChange={onChange}
            required
          />
        </div>

        {/* Nút lưu địa chỉ */}
        <button type="submit">Lưu địa chỉ mới</button>
      </form>

      {/* Hiển thị thông báo */}
      {message && (
        <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>
      )}

      {/* Danh sách địa chỉ đã lưu */}
      <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3>
      {addresses.length === 0 ? (
        <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
      ) : (
        <ul className="address-list">
          {addresses.map((addr) => (
            <li key={addr.id} className="address-item">
              <p><strong>Địa chỉ:</strong> {addr.address}</p>
              <p><strong>Người nhận:</strong> {addr.name}</p>
              <p><strong>Điện thoại:</strong> {addr.phone}</p>
              <button
                className="delete-address-button"
                onClick={() => onDeleteAddress(addr.id)}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});

AddressForm.displayName = 'AddressForm';

/**
 * Component chính của trang hồ sơ người dùng
 * Quản lý thông tin cá nhân, đổi mật khẩu, địa chỉ giao hàng và lịch sử đơn hàng
 */
const UserProfilePage = () => {
  // Lấy context xác thực
  const authContext = useContext(AuthContext);

  // Kiểm tra context có tồn tại không
  if (!authContext) {
    console.error("AuthContext phải được cung cấp. Đảm bảo UserProfilePage được bọc trong AuthProvider.");
    return <p>Lỗi: AuthContext không khả dụng. Vui lòng liên hệ quản trị viên.</p>;
  }

  // Lấy các giá trị từ context
  const { user, isLoggedIn, login, logout } = authContext;

  // Hook điều hướng
  const navigate = useNavigate();

  // Quản lý state với useReducer
  const [state, dispatch] = useReducer(profileReducer, initialState);

  /**
   * Hàm cập nhật thông tin người dùng trong localStorage và context
   * @param {Object} updatedUserData - Dữ liệu người dùng cần cập nhật
   * @returns {Object} Kết quả cập nhật { success: boolean, message: string }
   */
  const updateUserAndContext = useCallback(
    (updatedUserData) => {
      const storedUsers = readUsersFromStorage();
      if (!storedUsers) {
        return { success: false, message: MESSAGES.SYSTEM_ERROR_READING_USERS };
      }
      if (!user?.username) {
        return { success: false, message: MESSAGES.USER_NOT_FOUND };
      }

      const userIndex = storedUsers.findIndex((u) => u.username === user.username);
      if (userIndex === -1) {
        return { success: false, message: MESSAGES.USER_NOT_FOUND };
      }

      const updatedUser = { ...storedUsers[userIndex], ...updatedUserData };
      storedUsers[userIndex] = updatedUser;

      const saveSuccess = saveUsersToStorage(storedUsers);
      if (saveSuccess) {
        login(updatedUser);
        return { success: true, message: "" };
      }
      return { success: false, message: MESSAGES.SYSTEM_ERROR_UPDATING_USERS };
    },
    [user, login]
  );

  // Khởi tạo dữ liệu khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }

    // Cập nhật form thông tin cá nhân
    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.PROFILE,
        data: {
          username: user.username,
          email: user.email || "",
          phone: user.phone || "",
        },
      },
    });

    // Cập nhật form địa chỉ
    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.ADDRESS,
        data: { addresses: user.addresses || [] },
      },
    });
  }, [isLoggedIn, navigate, user]);

  /**
   * Xử lý thay đổi giá trị input trong các form
   * @param {Event} e - Sự kiện thay đổi input
   * @param {string} formType - Loại form đang được chỉnh sửa
   */
  const handleInputChange = useCallback(
    (e, formType) => {
      const { name, value } = e.target;
      let data;

      if (formType === FORM_TYPES.ADDRESS) {
        data = {
          newAddress: { ...state.address.newAddress, [name]: value },
        };
      } else {
        data = { [name]: value };
      }

      dispatch({
        type: ACTION_TYPES.UPDATE_FORM_STATE,
        payload: { formType, data },
      });
    },
    [state.address.newAddress]
  );

  /**
   * Xử lý cập nhật thông tin cá nhân
   * @param {Event} e - Sự kiện submit form
   */
  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault();

    const updatedData = {
      email: state.profile.email.trim(),
      phone: state.profile.phone.trim(),
    };

    const { success, message: updateMessage } = updateUserAndContext(updatedData);

    dispatch({
      type: ACTION_TYPES.SET_MESSAGE,
      payload: {
        formType: FORM_TYPES.PROFILE,
        message: success ? MESSAGES.PROFILE_UPDATE_SUCCESS : (updateMessage || MESSAGES.PROFILE_UPDATE_FAILED),
      },
    });
  };

  /**
   * Xử lý đổi mật khẩu
   * @param {Event} e - Sự kiện submit form
   */
  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();

    const storedUsers = readUsersFromStorage();
    if (!storedUsers || !user?.username) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: MESSAGES.SYSTEM_ERROR_READING_USERS },
      });
      return;
    }

    const currentUser = storedUsers.find((u) => u.username === user.username);
    if (!currentUser) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: MESSAGES.USER_NOT_FOUND },
      });
      return;
    }

    const validationError = validatePasswordChange(state.password, currentUser.password);
    if (validationError) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: validationError },
      });
      return;
    }

    const { success, message: updateMessage } = updateUserAndContext({ password: state.password.newPassword });
    if (success) {
      dispatch({
        type: ACTION_TYPES.RESET_FORM,
        payload: {
          formType: FORM_TYPES.PASSWORD,
          defaultData: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
          message: MESSAGES.PASSWORD_CHANGE_SUCCESS,
        },
      });
      setTimeout(logout, LOGOUT_DELAY);
    } else {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message: updateMessage || MESSAGES.PASSWORD_CHANGE_FAILED },
      });
    }
  };

  /**
   * Xử lý thêm địa chỉ mới
   * @param {Event} e - Sự kiện submit form
   */
  const handleAddAddress = (e) => {
    e.preventDefault();

    const validationError = validateAddress(state.address.newAddress);
    if (validationError) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.ADDRESS, message: validationError },
      });
      return;
    }

    const newAddressEntry = {
      id: Date.now(),
      ...state.address.newAddress,
      address: state.address.newAddress.address.trim(),
      name: state.address.newAddress.name.trim(),
      phone: state.address.newAddress.phone.trim(),
    };

    const updatedAddresses = [...state.address.addresses, newAddressEntry];
    const { success, message: updateMessage } = updateUserAndContext({ addresses: updatedAddresses });

    if (success) {
      dispatch({
        type: ACTION_TYPES.RESET_FORM,
        payload: {
          formType: FORM_TYPES.ADDRESS,
          defaultData: {
            addresses: updatedAddresses,
            newAddress: { address: "", name: "", phone: "" },
          },
          message: MESSAGES.ADDRESS_SAVE_SUCCESS,
        },
      });
    } else {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.ADDRESS, message: updateMessage || MESSAGES.ADDRESS_SAVE_FAILED },
      });
    }
  };

  /**
   * Xử lý xóa địa chỉ
   * @param {number|string} addressId - ID của địa chỉ cần xóa
   */
  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== addressId);
    const { success, message: updateMessage } = updateUserAndContext({ addresses: updatedAddresses });

    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.ADDRESS,
        data: {
          addresses: success ? updatedAddresses : state.address.addresses,
          message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : (updateMessage || MESSAGES.ADDRESS_SAVE_FAILED),
        },
      },
    });
  };

  // Kiểm tra đăng nhập
  if (!isLoggedIn || !user?.username) {
    return null;
  }

  // Render giao diện
  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

      {/* Menu điều hướng */}
      <nav className="profile-sections-menu">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            className={state.activeSection === section.id ? "active" : ""}
            onClick={() => dispatch({ type: ACTION_TYPES.SET_ACTIVE_SECTION, payload: section.id })}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Form thông tin cá nhân */}
      {state.activeSection === FORM_TYPES.PROFILE && (
        <ProfileForm
          formData={state.profile}
          onChange={(e) => handleInputChange(e, FORM_TYPES.PROFILE)}
          onSubmit={handleSubmitProfileUpdate}
          message={state.profile.message}
        />
      )}

      {/* Form đổi mật khẩu */}
      {state.activeSection === FORM_TYPES.PASSWORD && (
        <PasswordForm
          formData={state.password}
          onChange={(e) => handleInputChange(e, FORM_TYPES.PASSWORD)}
          onSubmit={handleSubmitPasswordChange}
          message={state.password.message}
        />
      )}

      {/* Form quản lý địa chỉ */}
      {state.activeSection === "addresses" && (
        <AddressForm
          addresses={state.address.addresses}
          newAddressFormData={state.address.newAddress}
          onChange={(e) => handleInputChange(e, FORM_TYPES.ADDRESS)}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          message={state.address.message}
        />
      )}

      {/* Lịch sử đơn hàng */}
      {state.activeSection === "orders" && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory />
        </section>
      )}

      {/* Link quay lại */}
      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

// Export component
export default UserProfilePage;

