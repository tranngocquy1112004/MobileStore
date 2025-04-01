import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import UserProfileModal from "./UserProfileModal";
import "./Header.css";

/**
 * Component Header - Hiển thị thanh điều hướng chính của ứng dụng
 * Bao gồm logo, nút đăng nhập/đăng xuất, và giỏ hàng
 * @returns {JSX.Element} - Giao diện header
 */
const Header = () => {
  // Sử dụng context để truy cập thông tin giỏ hàng và người dùng
  const { cart } = useContext(CartContext);
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  
  // Hook điều hướng và state cho modal profile
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  /**
   * Xử lý sự kiện đăng xuất
   * Gọi hàm logout từ AuthContext và chuyển hướng về trang đăng nhập
   */
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  /**
   * Hiển thị số lượng sản phẩm trong giỏ hàng
   * @returns {string} - Chuỗi hiển thị số lượng sản phẩm
   */
  const getCartItemsCount = () => {
    return cart.length || 0;
  };

  /**
   * Hiển thị tên người dùng hoặc "Khách" nếu không có
   * @returns {string} - Tên hiển thị của người dùng
   */
  const getDisplayName = () => {
    return user?.username || "Khách";
  };

  return (
    <header className="header">
      {/* Logo và tên cửa hàng */}
      <Link to="/home" className="store-title">
        📱 MobileStore
      </Link>
      
      {/* Khu vực điều hướng và tương tác */}
      <div className="header-actions">
        {isLoggedIn ? (
          <>
            {/* Nút hiển thị thông tin người dùng */}
            <button
              className="profile-button"
              onClick={() => setShowProfileModal(true)}
              aria-label="Mở thông tin người dùng"
            >
              👤 Xin Chào {getDisplayName()}
            </button>
            
            {/* Nút đăng xuất */}
            <button 
              className="logout-button" 
              onClick={handleLogout}
              aria-label="Đăng xuất"
            >
              🚪 Đăng xuất
            </button>
            
            {/* Liên kết đến trang giỏ hàng */}
            <Link 
              to="/cart" 
              className="cart-button"
              aria-label="Xem giỏ hàng"
            >
              🛍️ Giỏ hàng ({getCartItemsCount()})
            </Link>
          </>
        ) : (
          /* Nút đăng nhập nếu chưa đăng nhập */
          <Link 
            to="/" 
            className="login-button"
            aria-label="Đăng nhập"
          >
            🔑 Đăng nhập
          </Link>
        )}
      </div>
      
      {/* Modal thông tin người dùng - chỉ hiển thị khi được kích hoạt */}
      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </header>
  );
};

export default Header;