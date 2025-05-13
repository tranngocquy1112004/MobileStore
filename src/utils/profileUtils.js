import { LOCAL_STORAGE_USERS_KEY, MIN_PASSWORD_LENGTH, MESSAGES } from '../constants/profile';

/**
 * Reads users data from localStorage
 * @returns {Array|null} Array of users or null if error
 */
export const readUsersFromStorage = () => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Error reading users from localStorage:", error);
    return null;
  }
};

/**
 * Saves users data to localStorage
 * @param {Array} users - Array of user objects
 * @returns {boolean} Success status
 */
export const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
    return false;
  }
};

/**
 * Validates password change data
 * @param {Object} passwordData - Password change form data
 * @param {string} currentPassword - Current user password
 * @returns {string|null} Error message or null if valid
 */
export const validatePasswordChange = (passwordData, currentPassword) => {
  const { oldPassword, newPassword, confirmNewPassword } = passwordData;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return MESSAGES.EMPTY_PASSWORD_FIELDS;
  }
  if (newPassword !== confirmNewPassword) {
    return MESSAGES.PASSWORDS_NOT_MATCH;
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return MESSAGES.PASSWORD_TOO_SHORT;
  }
  if (newPassword === oldPassword) {
    return MESSAGES.PASSWORD_SAME_AS_OLD;
  }
  if (currentPassword !== oldPassword) {
    return MESSAGES.PASSWORD_CHANGE_FAILED;
  }
  return null;
};

/**
 * Validates address data
 * @param {Object} addressData - Address form data
 * @returns {string|null} Error message or null if valid
 */
export const validateAddress = ({ address, name, phone }) => {
  if (!address?.trim() || !name?.trim() || !phone?.trim()) {
    return MESSAGES.ADDRESS_EMPTY_FIELDS;
  }
  return null;
}; 