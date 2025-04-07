import React, { createContext, useState, useEffect } from "react";

// Định nghĩa key cố định dùng cho localStorage
const LOCAL_STORAGE_KEY = "currentUser"; // Key để lưu thông tin người dùng hiện tại trong localStorage

// Giá trị mặc định cho AuthContext
const defaultAuthContext = {
  isLoggedIn: false, // Trạng thái mặc định: chưa đăng nhập
  user: null, // Thông tin người dùng mặc định: không có
  login: () => {}, // Hàm đăng nhập mặc định (không làm gì)
  logout: () => {}, // Hàm đăng xuất mặc định (không làm gì)
};

// Tạo AuthContext với giá trị mặc định
export const AuthContext = createContext(defaultAuthContext); // Context để chia sẻ trạng thái xác thực

// Component AuthProvider - Cung cấp context xác thực cho các component con
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State quản lý trạng thái đăng nhập, mặc định là false
  const [user, setUser] = useState(null); // State quản lý thông tin người dùng, mặc định là null

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY); // Lấy dữ liệu người dùng từ localStorage
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser); // Parse chuỗi JSON thành object
        setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập thành true
        setUser(parsedUser); // Cập nhật thông tin người dùng
      }
    };

    initializeAuth(); // Gọi hàm khởi tạo
  }, []); // Dependency rỗng: chỉ chạy một lần khi component mount

  // Hàm xử lý đăng nhập
  const login = (userData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData)); // Lưu thông tin người dùng vào localStorage
    setIsLoggedIn(true); // Đặt trạng thái đăng nhập thành true
    setUser(userData); // Cập nhật thông tin người dùng
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Xóa thông tin người dùng khỏi localStorage
    setIsLoggedIn(false); // Đặt trạng thái đăng nhập thành false
    setUser(null); // Đặt lại thông tin người dùng về null
  };

  // Object chứa các giá trị cung cấp qua Context
  const authContextValue = {
    isLoggedIn, // Trạng thái đăng nhập hiện tại
    user, // Thông tin người dùng hiện tại
    login, // Hàm xử lý đăng nhập
    logout, // Hàm xử lý đăng xuất
  };

  // Cung cấp context cho các component con
  return (
    <AuthContext.Provider value={authContextValue}>
      {children} {/* Render các component con được bao bọc */}
    </AuthContext.Provider>
  );
};

export default AuthProvider; // Xuất AuthProvider để sử dụng ở nơi khác (thường trong App)