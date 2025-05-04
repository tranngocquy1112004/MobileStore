import React, { createContext, useState, useEffect, useCallback } from "react";

// Hằng số
const LOCAL_STORAGE_KEY = "currentUser";

// Giá trị mặc định cho Context
const defaultAuthContext = {
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
};

// Tạo Context
export const AuthContext = createContext(defaultAuthContext);

// Hàm tiện ích để lấy thông tin người dùng từ localStorage
const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && typeof parsedUser === "object" && parsedUser.username) {
        // Đảm bảo email luôn tồn tại, nếu không thì mặc định là ""
        return {
          ...parsedUser,
          email: parsedUser.email || "",
        };
      }
      console.warn("Dữ liệu người dùng trong localStorage không hợp lệ, đã xóa.");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  return null;
};

// Hàm tiện ích để lưu thông tin người dùng vào localStorage
const saveUserToStorage = (userData) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Lỗi khi lưu thông tin người dùng vào localStorage:", error);
  }
};

// Hàm tiện ích để xóa thông tin người dùng khỏi localStorage
const clearUserFromStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("Lỗi khi xóa thông tin người dùng khỏi localStorage:", error);
  }
};

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Khởi tạo trạng thái đăng nhập từ localStorage
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  // Xử lý đăng nhập
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

  // Xử lý đăng xuất
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

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;