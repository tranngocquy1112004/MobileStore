import React, { useReducer, useContext, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import OrderHistory from "./OrderHistory";
import ProfileForm from "../components/profile/ProfileForm";
import PasswordForm from "../components/profile/PasswordForm";
import AddressForm from "../components/profile/AddressForm";
import "./UserProfilePage.css";

// Constants for messages, form types, action types, and sections
const MESSAGES = {
  LOGIN_REQUIRED: "Vui lòng đăng nhập để truy cập trang này.",
  PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau giây lát.",
  ADDRESS_SAVE_SUCCESS: "Thêm địa chỉ thành công!",
  ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
  SYSTEM_ERROR_READING_USERS: "Lỗi hệ thống khi đọc dữ liệu người dùng.",
  SYSTEM_ERROR_UPDATING_USERS: "Lỗi hệ thống khi cập nhật dữ liệu người dùng.",
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  INVALID_OLD_PASSWORD: "Mật khẩu cũ không đúng.",
  PASSWORD_TOO_SHORT: "Mật khẩu mới phải có ít nhất 6 ký tự.",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",
  ADDRESS_REQUIRED: "Địa chỉ không được để trống.",
  NAME_REQUIRED: "Tên người nhận không được để trống.",
  INVALID_PHONE: "Số điện thoại không hợp lệ.",
};

const FORM_TYPES = {
  PROFILE: "profile",
  PASSWORD: "password",
  ADDRESS: "address",
};

const ACTION_TYPES = {
  SET_ACTIVE_SECTION: "SET_ACTIVE_SECTION",
  UPDATE_FORM_STATE: "UPDATE_FORM_STATE",
  SET_MESSAGE: "SET_MESSAGE",
  RESET_FORM: "RESET_FORM",
};

const SECTIONS = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "password", label: "Đổi mật khẩu" },
  { id: "addresses", label: "Địa chỉ giao hàng" },
  { id: "orders", label: "Lịch sử đơn hàng" },
];

const LOGOUT_DELAY = 2000; // milliseconds

// Initial state for the reducer
const initialState = {
  activeSection: FORM_TYPES.PROFILE,
  profile: { username: "", email: "", phone: "", message: "" },
  password: { oldPassword: "", newPassword: "", confirmNewPassword: "", message: "" },
  address: { addresses: [], newAddress: { address: "", name: "", phone: "" }, message: "" },
};

// Reducer function to manage state transitions
const profileReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };
    case ACTION_TYPES.UPDATE_FORM_STATE: {
      const { formType, data } = action.payload;
      return { ...state, [formType]: { ...state[formType], ...data, message: "" } };
    }
    case ACTION_TYPES.SET_MESSAGE: {
      const { formType, message } = action.payload;
      return { ...state, [formType]: { ...state[formType], message } };
    }
    case ACTION_TYPES.RESET_FORM: {
      const { formType, defaultData, message } = action.payload;
      return { ...state, [formType]: { ...defaultData, message } };
    }
    default:
      return state;
  }
};

// Utility functions for local storage operations and validations
const readUsersFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    return null;
  }
};

const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
};

const validatePasswordChange = ({ oldPassword, newPassword, confirmNewPassword }, currentPassword) => {
  if (oldPassword !== currentPassword) return MESSAGES.INVALID_OLD_PASSWORD;
  if (newPassword.length < 6) return MESSAGES.PASSWORD_TOO_SHORT;
  if (newPassword !== confirmNewPassword) return MESSAGES.PASSWORD_MISMATCH;
  return null;
};

const validateAddress = ({ address, name, phone }) => {
  if (!address.trim()) return MESSAGES.ADDRESS_REQUIRED;
  if (!name.trim()) return MESSAGES.NAME_REQUIRED;
  if (!phone.trim() || !/^\d{10,11}$/.test(phone)) return MESSAGES.INVALID_PHONE;
  return null;
};

// Main UserProfilePage component
const UserProfilePage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    // This error should ideally be caught by a proper error boundary or handled gracefully
    console.error("AuthContext must be provided. Ensure UserProfilePage is wrapped in AuthProvider.");
    return null; // Or render an error message
  }
  const { user, isLoggedIn, login, logout } = authContext;

  const navigate = useNavigate();
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Memoized function to update user data in storage and context
  const updateUserAndContext = useCallback(
    (updatedUserData) => {
      const storedUsers = readUsersFromStorage();
      if (!storedUsers) return { success: false, message: MESSAGES.SYSTEM_ERROR_READING_USERS };
      if (!user?.username) return { success: false, message: MESSAGES.USER_NOT_FOUND };

      const userIndex = storedUsers.findIndex((u) => u.username === user.username);
      if (userIndex === -1) return { success: false, message: MESSAGES.USER_NOT_FOUND };

      const updatedUser = { ...storedUsers[userIndex], ...updatedUserData };
      storedUsers[userIndex] = updatedUser;

      const saveSuccess = saveUsersToStorage(storedUsers);
      if (saveSuccess) {
        login(updatedUser); // Update AuthContext with new user data
        return { success: true, message: "" };
      }
      return { success: false, message: MESSAGES.SYSTEM_ERROR_UPDATING_USERS };
    },
    [user, login]
  );

  // Effect to initialize user data on component mount or user change
  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }

    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.PROFILE,
        data: { username: user.username, email: user.email || "", phone: user.phone || "" },
      },
    });

    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: { formType: FORM_TYPES.ADDRESS, data: { addresses: user.addresses || [] } },
    });
  }, [isLoggedIn, navigate, user]); // Dependencies for useEffect

  // Handles input changes for all forms
  const handleInputChange = useCallback(
    (e, formType) => {
      const { name, value } = e.target;
      const data =
        formType === FORM_TYPES.ADDRESS
          ? { newAddress: { ...state.address.newAddress, [name]: value } }
          : { [name]: value };
      dispatch({ type: ACTION_TYPES.UPDATE_FORM_STATE, payload: { formType, data } });
    },
    [state.address.newAddress] // Dependency for useCallback
  );

  // Handles profile update submission
  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault();
    const updatedData = {
      email: state.profile.email.trim(),
      phone: state.profile.phone.trim(),
    };

    const { success, message } = updateUserAndContext(updatedData);
    dispatch({
      type: ACTION_TYPES.SET_MESSAGE,
      payload: { formType: FORM_TYPES.PROFILE, message: success ? MESSAGES.PROFILE_UPDATE_SUCCESS : message },
    });
  };

  // Handles password change submission
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

    const { success, message } = updateUserAndContext({ password: state.password.newPassword });
    if (success) {
      dispatch({
        type: ACTION_TYPES.RESET_FORM,
        payload: {
          formType: FORM_TYPES.PASSWORD,
          defaultData: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
          message: MESSAGES.PASSWORD_CHANGE_SUCCESS,
        },
      });
      setTimeout(logout, LOGOUT_DELAY); // Log out after a delay
    } else {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: { formType: FORM_TYPES.PASSWORD, message },
      });
    }
  };

  // Handles adding a new address
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

    const newAddress = {
      id: Date.now(), // Simple unique ID
      ...state.address.newAddress,
      address: state.address.newAddress.address.trim(),
      name: state.address.newAddress.name.trim(),
      phone: state.address.newAddress.phone.trim(),
    };

    const updatedAddresses = [...state.address.addresses, newAddress];
    const { success, message } = updateUserAndContext({ addresses: updatedAddresses });
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
        payload: { formType: FORM_TYPES.ADDRESS, message },
      });
    }
  };

  // Handles deleting an address
  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== addressId);
    const { success, message } = updateUserAndContext({ addresses: updatedAddresses });
    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.ADDRESS,
        data: {
          addresses: success ? updatedAddresses : state.address.addresses,
          message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : message,
        },
      },
    });
  };

  // Render nothing if not logged in or no user
  if (!isLoggedIn || !user?.username) {
    return null;
  }

  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

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

      {state.activeSection === FORM_TYPES.PROFILE && (
        <ProfileForm
          formData={state.profile}
          onChange={(e) => handleInputChange(e, FORM_TYPES.PROFILE)}
          onSubmit={handleSubmitProfileUpdate}
          message={state.profile.message}
        />
      )}

      {state.activeSection === FORM_TYPES.PASSWORD && (
        <PasswordForm
          formData={state.password}
          onChange={(e) => handleInputChange(e, FORM_TYPES.PASSWORD)}
          onSubmit={handleSubmitPasswordChange}
          message={state.password.message}
        />
      )}

      {state.activeSection === FORM_TYPES.ADDRESS && (
        <AddressForm
          addresses={state.address.addresses}
          newAddressFormData={state.address.newAddress}
          onChange={(e) => handleInputChange(e, FORM_TYPES.ADDRESS)}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          message={state.address.message}
        />
      )}

      {state.activeSection === "orders" && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory />
        </section>
      )}

      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

export default UserProfilePage;