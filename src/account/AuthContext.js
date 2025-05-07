import React, { createContext, useState, useEffect, useCallback } from "react";

// --- HẰNG SỐ ---
// Khóa lưu trữ thông tin người dùng trong localStorage
const LOCAL_STORAGE_KEY = "currentUser";

// Giá trị mặc định cho Context
const DEFAULT_AUTH_CONTEXT = {
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
};

// Tạo Context
export const AuthContext = createContext(DEFAULT_AUTH_CONTEXT);

// --- HÀM TIỆN ÍCH ---

/**
 * Lấy thông tin người dùng từ localStorage
 * @returns {Object|null} Thông tin người dùng hoặc null nếu không hợp lệ
 */
const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && typeof parsedUser === "object" && parsedUser.username) {
        return {
          ...parsedUser,
          email: parsedUser.email || "", // Đảm bảo email luôn tồn tại
        };
      }
      console.warn("Dữ liệu người dùng trong localStorage không hợp lệ, đã xóa.");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};

/**
 * Lưu thông tin người dùng vào localStorage
 * @param {Object} userData - Dữ liệu người dùng
 */
const saveUserToStorage = (userData) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Lỗi khi lưu thông tin người dùng vào localStorage:", error);
  }
};

/**
 * Xóa thông tin người dùng khỏi localStorage
 */
const clearUserFromStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("Lỗi khi xóa thông tin người dùng khỏi localStorage:", error);
  }
};

// --- THÀNH PHẦN CHÍNH ---

/**
 * Provider cho quản lý trạng thái xác thực người dùng
 * @param {Object} props - Props chứa children
 * @returns {JSX.Element} Component Provider
 */
const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * Khởi tạo trạng thái đăng nhập từ localStorage khi component mount
   */
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  /**
   * Xử lý đăng nhập với dữ liệu người dùng
   * @param {Object} userData - Dữ liệu người dùng (ít nhất phải có username)
   */
  const login = useCallback((userData) => {
    if (!userData || typeof userData !== "object" || !userData.username) {
      console.error("Dữ liệu người dùng không hợp lệ:", userData);
      return;
    }
    const normalizedUserData = {
      ...userData,
      email: userData.email || "", // Đảm bảo email luôn tồn tại
    };
    saveUserToStorage(normalizedUserData);
    setIsLoggedIn(true);
    setUser(normalizedUserData);
  }, []);

  /**
   * Xử lý đăng xuất
   */
  const logout = useCallback(() => {
    clearUserFromStorage();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // Giá trị Context
  const authContextValue = {
    isLoggedIn,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;