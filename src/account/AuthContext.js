import React, { createContext, useState, useEffect } from "react";

// Định nghĩa key dùng cho localStorage
const LOCAL_STORAGE_KEY = "currentUser"; // Key để lưu thông tin người dùng hiện tại

// Giá trị mặc định cho AuthContext
const defaultAuthContext = {
  isLoggedIn: false, // Trạng thái đăng nhập mặc định
  user: null, // Thông tin người dùng mặc định
  login: () => {}, // Hàm đăng nhập mặc định
  logout: () => {}, // Hàm đăng xuất mặc định
};

// Tạo AuthContext với giá trị mặc định
export const AuthContext = createContext(defaultAuthContext);

// Component AuthProvider cung cấp context cho các component con
export const AuthProvider = ({ children }) => {
  // State để quản lý trạng thái đăng nhập và thông tin người dùng
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Trạng thái đăng nhập
  const [user, setUser] = useState(null); // Thông tin người dùng

  // Khởi tạo trạng thái đăng nhập từ localStorage khi component mount
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY); // Lấy dữ liệu người dùng từ localStorage
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser); // Parse dữ liệu JSON
        setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập
        setUser(parsedUser); // Cập nhật thông tin người dùng
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu người dùng:", error); // Log lỗi nếu parse thất bại
      }
    }
  }, []); // Chỉ chạy một lần khi component mount

  // Hàm xử lý đăng nhập
  const login = (userData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData)); // Lưu thông tin người dùng vào localStorage
    setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập
    setUser(userData); // Cập nhật thông tin người dùng
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Xóa thông tin người dùng khỏi localStorage
    setIsLoggedIn(false); // Đặt lại trạng thái đăng nhập
    setUser(null); // Xóa thông tin người dùng
  };

  // Đối tượng giá trị context để cung cấp cho các component con
  const authContextValue = {
    isLoggedIn, // Trạng thái đăng nhập
    user, // Thông tin người dùng
    login, // Hàm đăng nhập
    logout, // Hàm đăng xuất
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children} {/* Render các component con */}
    </AuthContext.Provider>
  );
};

export default AuthProvider;