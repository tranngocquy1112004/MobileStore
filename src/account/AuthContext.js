// Import các thư viện và hook cần thiết từ React
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
export const AuthProvider = ({ children }) => { // Nhận props children (các component con)
  // State quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Khởi tạo: chưa đăng nhập
  // State quản lý thông tin người dùng
  const [user, setUser] = useState(null); // Khởi tạo: không có thông tin người dùng

  // useEffect để kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const initializeAuth = () => { // Hàm khởi tạo trạng thái xác thực
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY); // Lấy dữ liệu người dùng từ localStorage
      if (savedUser) { // Nếu có dữ liệu
        const parsedUser = JSON.parse(savedUser); // Chuyển chuỗi JSON thành object
        setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập thành true
        setUser(parsedUser); // Cập nhật thông tin người dùng
      }
    };

    initializeAuth(); // Gọi hàm khởi tạo
  }, []); // Dependency rỗng: chỉ chạy một lần khi mount

  // Hàm xử lý đăng nhập
  const login = (userData) => { // Nhận dữ liệu người dùng từ tham số
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData)); // Lưu dữ liệu vào localStorage dưới dạng JSON
    setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập thành true
    setUser(userData); // Cập nhật thông tin người dùng
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Xóa dữ liệu người dùng khỏi localStorage
    setIsLoggedIn(false); // Cập nhật trạng thái đăng nhập thành false
    setUser(null); // Đặt lại thông tin người dùng về null
  };

  // Tạo object giá trị context để cung cấp cho các component con
  const authContextValue = {
    isLoggedIn, // Trạng thái đăng nhập hiện tại
    user, // Thông tin người dùng hiện tại
    login, // Hàm xử lý đăng nhập
    logout, // Hàm xử lý đăng xuất
  };

  return (
    <AuthContext.Provider value={authContextValue}> {/* Cung cấp context cho các component con */}
      {children} {/* Render các component con được bao bọc */}
    </AuthContext.Provider>
  );
};