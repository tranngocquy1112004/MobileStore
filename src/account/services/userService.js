import { LOCAL_STORAGE_KEYS } from "../models/constants";

export const getStoredUsers = () => {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) || [];
    return Array.isArray(storedUsers) ? storedUsers : [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
    return [];
  }
};

export const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu người dùng vào localStorage:", error);
  }
};
