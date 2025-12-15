import React, { createContext, useState, useEffect, useCallback } from "react";

const LOCAL_STORAGE_KEY = "currentUser";

const DEFAULT_AUTH_CONTEXT = {
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext(DEFAULT_AUTH_CONTEXT);

const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && typeof parsedUser === "object" && parsedUser.username) {
        return {
          ...parsedUser,
          email: parsedUser.email || "",
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

const saveUserToStorage = (userData) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Lỗi khi lưu thông tin người dùng vào localStorage:", error);
  }
};

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

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  const login = useCallback((userData) => {
    if (!userData || typeof userData !== "object" || !userData.username) {
      console.error("Dữ liệu người dùng không hợp lệ:", userData);
      return;
    }
    const normalizedUserData = {
      ...userData,
      email: userData.email || "",
    };
    saveUserToStorage(normalizedUserData);
    setIsLoggedIn(true);
    setUser(normalizedUserData);
  }, []);

  const logout = useCallback(() => {
    clearUserFromStorage();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const authContextValue = {
    isLoggedIn,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
