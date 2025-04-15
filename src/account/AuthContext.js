import React, { createContext, useState, useEffect } from "react";

// Định nghĩa key dùng cho localStorage
const LOCAL_STORAGE_KEY = "currentUser";

// Giá trị mặc định cho AuthContext
const defaultAuthContext = {
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
};

// Tạo AuthContext với giá trị mặc định
export const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Khởi tạo trạng thái đăng nhập khi component mount
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);
    }
  }, []);

  // Xử lý đăng nhập: lưu thông tin người dùng và cập nhật trạng thái
  const login = (userData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Xử lý đăng xuất: xóa thông tin và đặt lại trạng thái
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsLoggedIn(false);
    setUser(null);
  };

  // Giá trị cung cấp qua Context
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