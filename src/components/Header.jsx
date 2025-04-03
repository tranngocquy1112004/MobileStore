import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import UserProfileModal from "./UserProfileModal";
import "./Header.css";

// Component Header
const Header = () => {
  // Contexts và Hooks
  const { cart } = useContext(CartContext);
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Lấy số lượng sản phẩm trong giỏ hàng
  const getCartItemCount = () => cart.length || 0;

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
            <button
              className="profile-button"
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Mở thông tin người dùng"
            >
              👤 Xin Chào {getDisplayName()}
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
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
          </>
        ) : (
          <Link
            to="/"
            className="login-button"
            aria-label="Đăng nhập"
          >
            🔑 Đăng nhập
          </Link>
        )}
      </div>

      {isProfileModalOpen && (
        <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </header>
  );
};

export default Header;