import React, { useState, useContext, useCallback } from "react";
// Import Link và useNavigate từ react-router-dom
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
// KHÔNG import UserProfileModal nữa nếu dùng trang Profile
// import UserProfileModal from "./UserProfileModal";
import "./Header.css";

// Component Header
const Header = () => {
  // Contexts và Hooks
  const { cart } = useContext(CartContext);
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // KHÔNG cần state này nữa nếu dùng trang Profile
  // const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Xử lý đăng xuất
  const handleLogout = useCallback(() => { // Giữ useCallback
    logout();
    navigate("/");
  }, [logout, navigate]);

  // Lấy số lượng sản phẩm trong giỏ hàng (đã sửa dùng reduce)
  const getCartItemCount = () => (cart || []).reduce((sum, item) => sum + item.quantity, 0);

  // Lấy tên hiển thị của người dùng
  const getDisplayName = () => user?.username || "Khách";

  return (
    <header className="header">
      <Link to="/home" className="store-title">
        📱 MobileStore
      </Link>

      <div className="header-actions">
        {isLoggedIn ? (
          <>
            {/* THAY THẾ nút button mở modal bằng Link đến trang Profile */}
            <Link
               to="/profile" // <-- Route đến trang hồ sơ người dùng
               className="profile-button" // Giữ class CSS để định dạng giống nút
               aria-label="Mở trang thông tin người dùng" // Cập nhật aria-label
             >
              👤 Xin Chào {getDisplayName()}
            </Link>

            <button
              className="logout-button"
              onClick={handleLogout} // Giữ nguyên hàm handleLogout
              aria-label="Đăng xuất"
            >
              🚪 Đăng xuất
            </button>

            <Link
              to="/cart"
              className="cart-button"
              aria-label="Xem giỏ hàng"
            >
              🛍️ Giỏ hàng ({getCartItemCount()})
            </Link>

             {/* Link Admin nếu có */}
             {user?.role === 'admin' && (
               <Link to="/admin" className="admin-link" aria-label="Truy cập bảng điều khiển Admin">
                 📊 Admin
               </Link>
             )}
          </>
        ) : (
          // Nếu chưa đăng nhập: Hiển thị link Đăng nhập/Đăng ký
          <Link
            to="/"
            className="login-button"
            aria-label="Đăng nhập hoặc đăng ký"
          >
            🔑 Đăng nhập
          </Link>
        )}
      </div>

      {/* XÓA conditional rendering của UserProfileModal */}
      {/* {isProfileModalOpen && (
        <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )} */}
    </header>
  );
};

export default Header;