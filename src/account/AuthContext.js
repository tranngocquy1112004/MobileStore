import React, { createContext, useState, useEffect } from "react";

// Tạo AuthContext với giá trị mặc định
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

// Key cho localStorage
const LOCAL_STORAGE_KEY = "currentUser";

// AuthProvider cung cấp trạng thái xác thực cho các component con
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Khởi tạo trạng thái từ localStorage
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (savedUser) {
      setIsLoggedIn(true);
      setUser(savedUser);
    }
  }, []);

  // Đăng nhập và lưu user vào localStorage
  const login = (userData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Đăng xuất và xóa dữ liệu
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsLoggedIn(false);
    setUser(null);
  };

  // Giá trị context
  const value = {
    isLoggedIn,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};