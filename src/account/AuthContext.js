import React, { createContext, useState, useEffect } from "react";

// Constants
const LOCAL_STORAGE_KEY = "currentUser"; // Khai báo key cố định dùng để lưu trữ dữ liệu user trong localStorage

// Default context value
const defaultAuthContext = {
  isLoggedIn: false, // Giá trị mặc định: người dùng chưa đăng nhập
  user: null, // Giá trị mặc định: không có thông tin user
  login: () => {}, // Hàm login mặc định, chưa làm gì cả
  logout: () => {}, // Hàm logout mặc định, chưa làm gì cả
};

// Create AuthContext
export const AuthContext = createContext(defaultAuthContext); // Tạo Context với giá trị mặc định là defaultAuthContext

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  // Khai báo state để theo dõi trạng thái đăng nhập, giá trị ban đầu là false
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Khai báo state để lưu thông tin user, giá trị ban đầu là null
  const [user, setUser] = useState(null);

  // Hook useEffect chạy một lần khi component mount để kiểm tra trạng thái đăng nhập
  useEffect(() => {
    // Hàm khởi tạo trạng thái xác thực từ localStorage
    const initializeAuth = () => {
      // Lấy dữ liệu user từ localStorage dựa trên LOCAL_STORAGE_KEY
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Nếu có dữ liệu trong localStorage
      if (savedUser) {
        // Parse chuỗi JSON thành object
        const parsedUser = JSON.parse(savedUser);
        // Cập nhật trạng thái đăng nhập thành true
        setIsLoggedIn(true);
        // Cập nhật thông tin user từ dữ liệu đã parse
        setUser(parsedUser);
      }
    };

    // Gọi hàm khởi tạo
    initializeAuth();
  }, []); // Dependency array rỗng, chỉ chạy một lần khi component mount

  // Hàm xử lý đăng nhập
  const login = (userData) => {
    // Lưu thông tin userData vào localStorage dưới dạng chuỗi JSON
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    // Cập nhật trạng thái đăng nhập thành true
    setIsLoggedIn(true);
    // Cập nhật thông tin user từ dữ liệu truyền vào
    setUser(userData);
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    // Xóa dữ liệu user khỏi localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    // Cập nhật trạng thái đăng nhập thành false
    setIsLoggedIn(false);
    // Đặt lại thông tin user về null
    setUser(null);
  };

  // Tạo object chứa các giá trị sẽ cung cấp qua Context
  const authContextValue = {
    isLoggedIn, // Trạng thái đăng nhập hiện tại
    user, // Thông tin user hiện tại
    login, // Hàm để đăng nhập
    logout, // Hàm để đăng xuất
  };

  // Render AuthContext.Provider và truyền giá trị context cho các component con
  return (
    <AuthContext.Provider value={authContextValue}>
      {children} {/* Hiển thị các component con được bao bọc bởi AuthProvider */}
    </AuthContext.Provider>
  );
};