import React, { useReducer, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import OrderHistory from "./OrderHistory";
import ProfileForm from "../components/profile/ProfileForm";
import PasswordForm from "../components/profile/PasswordForm";
import AddressForm from "../components/profile/AddressForm";
import { MESSAGES } from "../constants/profile";
import { readUsersFromStorage, saveUsersToStorage, validatePasswordChange, validateAddress } from "../utils/profileUtils";
import "./UserProfilePage.css";

// Initial state for the reducer
const initialState = {
  activeSection: "profile",
  profile: { username: "", email: "", phone: "", message: "" },
  password: { oldPassword: "", newPassword: "", confirmNewPassword: "", message: "" },
  address: { addresses: [], newAddress: { address: "", name: "", phone: "" }, message: "" },
};

// Reducer for managing state
function profileReducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "UPDATE_PASSWORD":
      return { ...state, password: { ...state.password, ...action.payload } };
    case "UPDATE_ADDRESS":
      return { ...state, address: { ...state.address, ...action.payload } };
    case "RESET_ADDRESS_FORM":
      return {
        ...state,
        address: {
          ...state.address,
          newAddress: { address: "", name: "", phone: "" },
          message: action.payload.message,
        },
      };
    default:
      return state;
  }
}

/**
 * Main user profile page component
 */
const UserProfilePage = () => {
  const { user, isLoggedIn, login, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Initialize user data
  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }

    dispatch({
      type: "UPDATE_PROFILE",
      payload: { 
        username: user.username, 
        email: user.email || "", 
        phone: user.phone || "" 
      },
    });
    
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: { addresses: user.addresses || [] },
    });
  }, [isLoggedIn, navigate, user]);

  const updateUserInStorage = (updatedUserData) => {
    const storedUsers = readUsersFromStorage();
    if (!storedUsers || !user?.username) {
      return { 
        success: false, 
        message: !storedUsers ? MESSAGES.SYSTEM_ERROR_READING_USERS : MESSAGES.USER_NOT_FOUND 
      };
    }

    const userIndex = storedUsers.findIndex((u) => u.username === user.username);
    if (userIndex === -1) {
      return { success: false, message: MESSAGES.USER_NOT_FOUND };
    }

    const updatedUser = { ...storedUsers[userIndex], ...updatedUserData };
    storedUsers[userIndex] = updatedUser;
    
    return {
      success: saveUsersToStorage(storedUsers),
      updatedUser,
    };
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    const actionType = {
      profile: "UPDATE_PROFILE",
      password: "UPDATE_PASSWORD",
      address: "UPDATE_ADDRESS",
    }[formType];

    dispatch({
      type: actionType,
      payload: formType === "address"
        ? { newAddress: { ...state.address.newAddress, [name]: value }, message: "" }
        : { [name]: value, message: "" },
    });
  };

  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault();
    const updatedData = { 
      email: state.profile.email.trim(), 
      phone: state.profile.phone.trim() 
    };
    
    const { success, updatedUser } = updateUserInStorage(updatedData);
    
    dispatch({
      type: "UPDATE_PROFILE",
      payload: { 
        message: success 
          ? MESSAGES.PROFILE_UPDATE_SUCCESS 
          : MESSAGES.PROFILE_UPDATE_FAILED 
      },
    });

    if (success) {
      login(updatedUser);
    }
  };

  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    const storedUsers = readUsersFromStorage();
    if (!storedUsers) {
      dispatch({ 
        type: "UPDATE_PASSWORD", 
        payload: { message: MESSAGES.SYSTEM_ERROR_READING_USERS } 
      });
      return;
    }

    const currentUser = storedUsers.find((u) => u.username === user.username);
    if (!currentUser) {
      dispatch({ 
        type: "UPDATE_PASSWORD", 
        payload: { message: MESSAGES.USER_NOT_FOUND } 
      });
      return;
    }

    const error = validatePasswordChange(state.password, currentUser.password);
    if (error) {
      dispatch({ type: "UPDATE_PASSWORD", payload: { message: error } });
      return;
    }

    const { success } = updateUserInStorage({ password: state.password.newPassword });
    
    if (success) {
      dispatch({
        type: "UPDATE_PASSWORD",
        payload: {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          message: MESSAGES.PASSWORD_CHANGE_SUCCESS,
        },
      });
      setTimeout(logout, 2000);
    } else {
      dispatch({ 
        type: "UPDATE_PASSWORD", 
        payload: { message: MESSAGES.SYSTEM_ERROR_UPDATING_USERS } 
      });
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const error = validateAddress(state.address.newAddress);
    if (error) {
      dispatch({ type: "UPDATE_ADDRESS", payload: { message: error } });
      return;
    }

    const newAddress = {
      id: Date.now(),
      ...state.address.newAddress,
      address: state.address.newAddress.address.trim(),
      name: state.address.newAddress.name.trim(),
      phone: state.address.newAddress.phone.trim(),
    };

    const updatedAddresses = [...state.address.addresses, newAddress];
    const { success, updatedUser } = updateUserInStorage({ addresses: updatedAddresses });
    
    dispatch({
      type: success ? "RESET_ADDRESS_FORM" : "UPDATE_ADDRESS",
      payload: {
        addresses: success ? updatedAddresses : state.address.addresses,
        message: success ? MESSAGES.ADDRESS_SAVE_SUCCESS : MESSAGES.ADDRESS_SAVE_FAILED,
      },
    });

    if (success) {
      login(updatedUser);
    }
  };

  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    
    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== addressId);
    const { success, updatedUser } = updateUserInStorage({ addresses: updatedAddresses });
    
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: {
        addresses: success ? updatedAddresses : state.address.addresses,
        message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : MESSAGES.SYSTEM_ERROR_UPDATING_USERS,
      },
    });

    if (success) {
      login(updatedUser);
    }
  };

  if (!isLoggedIn || !user?.username) return null;

  const sections = [
    { id: "profile", label: "Thông tin cá nhân" },
    { id: "password", label: "Đổi mật khẩu" },
    { id: "addresses", label: "Địa chỉ giao hàng" },
    { id: "orders", label: "Lịch sử đơn hàng" },
  ];

  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>
      
      <nav className="profile-sections-menu">
        {sections.map((section) => (
          <button
            key={section.id}
            className={state.activeSection === section.id ? "active" : ""}
            onClick={() => dispatch({ type: "SET_ACTIVE_SECTION", payload: section.id })}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {state.activeSection === "profile" && (
        <ProfileForm
          formData={state.profile}
          onChange={(e) => handleInputChange(e, "profile")}
          onSubmit={handleSubmitProfileUpdate}
          message={state.profile.message}
        />
      )}

      {state.activeSection === "password" && (
        <PasswordForm
          formData={state.password}
          onChange={(e) => handleInputChange(e, "password")}
          onSubmit={handleSubmitPasswordChange}
          message={state.password.message}
        />
      )}

      {state.activeSection === "addresses" && (
        <AddressForm
          addresses={state.address.addresses}
          newAddressFormData={state.address.newAddress}
          onChange={(e) => handleInputChange(e, "address")}
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