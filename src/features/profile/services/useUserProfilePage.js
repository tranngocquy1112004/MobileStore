import { useCallback, useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  LOCAL_STORAGE_USERS_KEY,
  MIN_PASSWORD_LENGTH,
  LOGOUT_DELAY,
  FORM_TYPES,
  SECTIONS,
  MESSAGES,
} from "../models/constants";

const ACTION_TYPES = {
  SET_ACTIVE_SECTION: "SET_ACTIVE_SECTION",
  UPDATE_FORM_STATE: "UPDATE_FORM_STATE",
  SET_MESSAGE: "SET_MESSAGE",
  RESET_FORM: "RESET_FORM",
};

const initialState = {
  activeSection: FORM_TYPES.PROFILE,
  profile: {
    username: "",
    email: "",
    phone: "",
    message: "",
  },
  password: {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    message: "",
  },
  address: {
    addresses: [],
    newAddress: {
      address: "",
      name: "",
      phone: "",
    },
    message: "",
  },
};

const profileReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };
    case ACTION_TYPES.UPDATE_FORM_STATE: {
      const { formType, data } = action.payload;
      return {
        ...state,
        [formType]: { ...state[formType], ...data, message: "" },
      };
    }
    case ACTION_TYPES.SET_MESSAGE: {
      const { formType, message } = action.payload;
      return {
        ...state,
        [formType]: { ...state[formType], message },
      };
    }
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

const readUsersFromStorage = () => {
  try {
    const usersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return JSON.parse(usersData || "[]");
  } catch (error) {
    console.error(MESSAGES.SYSTEM_ERROR_READING_USERS, error);
    return null;
  }
};

const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error(MESSAGES.SYSTEM_ERROR_UPDATING_USERS, error);
    return false;
  }
};

const validatePasswordChange = ({ oldPassword, newPassword, confirmNewPassword }, currentPassword) => {
  if (oldPassword !== currentPassword) return MESSAGES.INVALID_OLD_PASSWORD;
  if (newPassword.length < MIN_PASSWORD_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (newPassword !== confirmNewPassword) return MESSAGES.PASSWORDS_NOT_MATCH;
  if (newPassword === oldPassword) return MESSAGES.PASSWORD_SAME_AS_OLD;
  return null;
};

const validateAddress = ({ address, name, phone }) => {
  if (!address.trim()) return MESSAGES.ADDRESS_REQUIRED;
  if (!name.trim()) return MESSAGES.NAME_REQUIRED;
  if (!phone.trim() || !/^\d{10,11}$/.test(phone.trim())) return MESSAGES.INVALID_PHONE;
  return null;
};

export const useUserProfilePage = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(profileReducer, initialState);

  if (!authContext) {
    console.error("AuthContext phải được cung cấp. Đảm bảo bọc UserProfilePage bằng AuthProvider.");
    return null;
  }

  const { user, isLoggedIn, login, logout } = authContext;

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
        data: {
          username: user.username,
          email: user.email || "",
          phone: user.phone || "",
        },
      },
    });

    dispatch({
      type: ACTION_TYPES.UPDATE_FORM_STATE,
      payload: {
        formType: FORM_TYPES.ADDRESS,
        data: { addresses: user.addresses || [] },
      },
    });
  }, [isLoggedIn, navigate, user]);

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
        message: success ? MESSAGES.PROFILE_UPDATE_SUCCESS : updateMessage || MESSAGES.PROFILE_UPDATE_FAILED,
      },
    });
  };

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
          message: success ? MESSAGES.ADDRESS_DELETE_SUCCESS : updateMessage || MESSAGES.ADDRESS_SAVE_FAILED,
        },
      },
    });
  };

  const setActiveSection = (sectionId) => {
    dispatch({ type: ACTION_TYPES.SET_ACTIVE_SECTION, payload: sectionId });
  };

  return {
    state,
    FORM_TYPES,
    SECTIONS,
    user,
    isLoggedIn,
    handleInputChange,
    handleSubmitProfileUpdate,
    handleSubmitPasswordChange,
    handleAddAddress,
    handleDeleteAddress,
    setActiveSection,
  };
};
