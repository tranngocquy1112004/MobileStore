// src/components/Header.js

import React, { useContext, useCallback, useMemo } from "react"; // Import hooks, thêm useMemo
// Import Link và useNavigate từ react-router-dom
import { Link, useNavigate } from "react-router-dom";

// Import Contexts
import { CartContext } from "../pages/CartContext"; // Import Cart context
import { AuthContext } from "../account/AuthContext"; // Import Auth context

// Import CSS
import "./Header.css";

// --- Component Header: Hiển thị thanh header của ứng dụng ---
// Bao gồm tiêu đề cửa hàng, thông tin người dùng, giỏ hàng và link admin.
const Header = () => {
  // --- Sử dụng Contexts và Hooks ---
  // Lấy dữ liệu giỏ hàng từ CartContext
  const { cart } = useContext(CartContext);
  // Lấy thông tin người dùng, trạng thái đăng nhập và hàm logout từ AuthContext
  // Sử dụng optional chaining và giá trị mặc định để an toàn
  const { user, isLoggedIn, logout } = useContext(AuthContext) || { user: null, isLoggedIn: false, logout: () => {} };

  // Hook điều hướng
  const navigate = useNavigate();

  // --- Handler xử lý đăng xuất ---
  // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
  const handleLogout = useCallback(() => {
    logout(); // Gọi hàm logout từ AuthContext
    navigate("/"); // Chuyển hướng về trang chủ/đăng nhập sau khi đăng xuất
  }, [logout, navigate]); // Dependencies: logout và navigate (navigate là stable)

  // --- Tính toán tổng số lượng sản phẩm trong giỏ hàng sử dụng useMemo ---
  // useMemo giúp tính toán lại số lượng chỉ khi 'cart' thay đổi
  const cartItemCount = useMemo(() => {
      // Đảm bảo cart là một mảng trước khi reduce
      const safeCart = Array.isArray(cart) ? cart : [];
      // Tính tổng an toàn, xử lý trường hợp item hoặc quantity thiếu
      return safeCart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  }, [cart]); // Dependency: cart

  // --- Lấy tên hiển thị cho người dùng đã đăng nhập ---
  // Sử dụng optional chaining để truy cập user.username an toàn
  const getDisplayName = () => user?.username || "Khách"; // Sử dụng username nếu có, ngược lại là 'Khách'

  // --- Render UI Header ---
  return (
    <header className="header">
      {/* Tiêu đề cửa hàng và link về trang chủ */}
      <Link to="/home" className="store-title">
        📱 MobileStore
      </Link>

      {/* Các hành động trên header (profile, logout, cart, admin) */}
      <div className="header-actions">
        {isLoggedIn ? (
          // Nếu đã đăng nhập: Hiển thị các tùy chọn cho người dùng đã đăng nhập
          <> {/* Fragment để nhóm các phần tử */}
            {/* Link đến Trang Hồ sơ Người dùng */}
            {/* Thay thế nút mở modal trước đây */}
            <Link
                to="/profile" // Route đến trang hồ sơ người dùng
                className="profile-button" // Giữ class CSS cho styling
                aria-label="Mở trang thông tin người dùng" // Cập nhật label accessibility
             >
              👤 Xin Chào {getDisplayName()} {/* Hiển thị lời chào kèm tên người dùng */}
            </Link>

            {/* Nút Đăng xuất */}
            <button
              className="logout-button"
              onClick={handleLogout} // Gắn handler đăng xuất
              aria-label="Đăng xuất" // Label accessibility
            >
              🚪 Đăng xuất
            </button>

            {/* Link đến Trang Giỏ hàng */}
            {/* Class 'cart-button' có thể dùng làm điểm neo cho animation "bay tới giỏ hàng" */}
            <Link
              to="/cart"
              className="cart-button"
              aria-label="Xem giỏ hàng"
            >
              🛍️ Giỏ hàng ({cartItemCount}) {/* Hiển thị số lượng sản phẩm trong giỏ hàng (đã tính bằng useMemo) */}
            </Link>

            {/* Link đến Admin Dashboard (Hiển thị có điều kiện) */}
            {/* Chỉ hiển thị nếu người dùng đã đăng nhập và có vai trò 'admin' */}
             {user?.role === 'admin' && ( // Kiểm tra đối tượng user và thuộc tính role một cách an toàn
               <Link to="/admin" className="admin-link" aria-label="Truy cập bảng điều khiển Admin">
                 📊 Admin
               </Link>
             )}
          </>
        ) : (
          // Nếu chưa đăng nhập: Hiển thị Link Đăng nhập/Đăng ký
          <Link
            to="/" // Route đến trang đăng nhập/đăng ký
            className="login-button"
            aria-label="Đăng nhập hoặc đăng ký"
          >
            🔑 Đăng nhập
          </Link>
        )}
      </div>

      {/* Component UserProfileModal đã bị loại bỏ */}
    </header>
  );
};

export default Header; // Export component Header
