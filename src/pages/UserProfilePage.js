import React, { useReducer, useContext, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import OrderHistory from "./OrderHistory";
import ProfileForm from "../components/profile/ProfileForm";
import PasswordForm from "../components/profile/PasswordForm";
import AddressForm from "../components/profile/AddressForm";
import { MESSAGES } from "../constants/profile";
import { readUsersFromStorage, saveUsersToStorage, validatePasswordChange, validateAddress } from "../utils/profileUtils"; // Assuming these utils exist and are correct
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
    case "UPDATE_PROFILE_STATE": // Renamed for clarity
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "UPDATE_PASSWORD_STATE": // Renamed for clarity
      return { ...state, password: { ...state.password, ...action.payload } };
    case "UPDATE_ADDRESS_STATE": // Renamed for clarity
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
    case "SET_MESSAGE": // Generic message handling
        const { formType, message } = action.payload;
        return {
            ...state,
            [formType]: {
                ...state[formType],
                message: message,
            },
        };
    case "RESET_PASSWORD_FORM": // Added action to reset password form on success
        return {
            ...state,
            password: {
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: "",
                message: action.payload.message,
            }
        };
    default:
      return state;
  }
}

/**
 * Main user profile page component
 */
const UserProfilePage = () => {
  // Safely access AuthContext properties
  const authContext = useContext(AuthContext);
  const { user, isLoggedIn, login, logout } = authContext || {};

  const navigate = useNavigate();
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Effect to initialize user data and handle authentication check
  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      alert(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }

    // Initialize state with user data from context
    dispatch({
      type: "UPDATE_PROFILE_STATE",
      payload: {
        username: user.username,
        email: user.email || "",
        phone: user.phone || ""
      },
    });

    dispatch({
      type: "UPDATE_ADDRESS_STATE",
      payload: { addresses: user.addresses || [] },
    });
  }, [isLoggedIn, navigate, user]); // Depend on isLoggedIn, navigate, and user

  // Memoized function to update user data in storage and context
  const updateUserAndContext = useCallback((updatedUserData) => {
    const storedUsers = readUsersFromStorage();
    if (!storedUsers) {
      return {
        success: false,
        message: MESSAGES.SYSTEM_ERROR_READING_USERS
      };
    }

    if (!user?.username) {
         return {
            success: false,
            message: MESSAGES.USER_NOT_FOUND // Should ideally not happen due to useEffect check
         };
    }

    const userIndex = storedUsers.findIndex((u) => u.username === user.username);
    if (userIndex === -1) {
      return { success: false, message: MESSAGES.USER_NOT_FOUND };
    }

    const updatedUser = { ...storedUsers[userIndex], ...updatedUserData };
    storedUsers[userIndex] = updatedUser;

    const saveSuccess = saveUsersToStorage(storedUsers);

    if (saveSuccess) {
       // Update AuthContext state
       login(updatedUser);
       return { success: true, updatedUser, message: "" }; // Return empty message on success
    } else {
       return { success: false, message: MESSAGES.SYSTEM_ERROR_UPDATING_USERS };
    }
  }, [user, login]); // Depend on user and login from context

  // Generic input change handler
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    const actionType = {
      profile: "UPDATE_PROFILE_STATE",
      password: "UPDATE_PASSWORD_STATE",
      address: "UPDATE_ADDRESS_STATE",
    }[formType];

    if (!actionType) {
        console.error(`Unknown form type: ${formType}`);
        return;
    }

    dispatch({
      type: actionType,
      payload: formType === "address"
        ? { newAddress: { ...state.address.newAddress, [name]: value }, message: "" }
        : { [name]: value, message: "" },
    });
  };

  // Handle profile update submission
  const handleSubmitProfileUpdate = (e) => {
    e.preventDefault();
    const updatedData = {
      email: state.profile.email.trim(),
      phone: state.profile.phone.trim()
    };

    const { success, message } = updateUserAndContext(updatedData);

    dispatch({
      type: "SET_MESSAGE",
      payload: {
        formType: "profile",
        message: success ? MESSAGES.PROFILE_UPDATE_SUCCESS : message,
      },
    });
  };

  // Handle password change submission
  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();

    const storedUsers = readUsersFromStorage(); // Read users to get current password for validation
    if (!storedUsers || !user?.username) {
        dispatch({
            type: "SET_MESSAGE",
            payload: { formType: "password", message: MESSAGES.SYSTEM_ERROR_READING_USERS }
        });
        return;
    }

    const currentUser = storedUsers.find((u) => u.username === user.username);
    if (!currentUser) {
        dispatch({
            type: "SET_MESSAGE",
            payload: { formType: "password", message: MESSAGES.USER_NOT_FOUND }
        });
        return;
    }

    const validationError = validatePasswordChange(state.password, currentUser.password);
    if (validationError) {
      dispatch({ type: "SET_MESSAGE", payload: { formType: "password", message: validationError } });
      return;
    }

    const { success, message } = updateUserAndContext({ password: state.password.newPassword });

    if (success) {
      dispatch({
        type: "RESET_PASSWORD_FORM", // Reset form fields and set success message
        payload: { message: MESSAGES.PASSWORD_CHANGE_SUCCESS },
      });
      setTimeout(logout, 2000); // Logout after a delay
    } else {
      dispatch({
          type: "SET_MESSAGE",
          payload: { formType: "password", message: message },
        });
    }
  };

  // Handle adding a new address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const validationError = validateAddress(state.address.newAddress);
    if (validationError) {
      dispatch({ type: "SET_MESSAGE", payload: { formType: "address", message: validationError } });
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
    const { success, updatedUser, message } = updateUserAndContext({ addresses: updatedAddresses });

    if (success) {
         dispatch({
            type: "RESET_ADDRESS_FORM", // Reset form and set success message
            payload: { message: MESSAGES.ADDRESS_SAVE_SUCCESS },
         });
         // The login(updatedUser) call is handled inside updateUserAndContext
    } else {
        dispatch({
            type: "SET_MESSAGE",
            payload: { formType: "address", message: message },
        });
    }
  };

  // Handle deleting an address
  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    const updatedAddresses = state.address.addresses.filter((addr) => addr.id !== addressId);
    const { success, message } = updateUserAndContext({ addresses: updatedAddresses });

    dispatch({
        type: "UPDATE_ADDRESS_STATE", // Update address list state
        payload: {
            addresses: success ? updatedAddresses : state.address.addresses, // Revert if save failed
            message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : message,
        },
    });
     // The login(updatedUser) call is handled inside updateUserAndContext
  };

  // Render null or loading if not logged in (handled by useEffect redirect)
  if (!isLoggedIn || !user?.username) {
      return null; // Or a loading spinner if preferred
  }

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
          {/* Assuming OrderHistory component fetches and displays order data */}
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