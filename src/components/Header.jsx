import React, { useContext, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "../styles/Header.css";

/**
 * Hàm tiện ích để tính tổng số lượng sản phẩm trong giỏ hàng
 * @param {Array} cart - Mảng chứa các sản phẩm trong giỏ hàng
 * @returns {number} - Tổng số lượng sản phẩm
 */
const calculateCartItemCount = (cart) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  return safeCart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
};

/**
 * Hàm tiện ích để lấy tên hiển thị của người dùng
 * @param {Object} user - Đối tượng chứa thông tin người dùng
 * @returns {string} - Tên hiển thị của người dùng
 */
const getDisplayName = (user) => user?.username || "Khách";

/**
 * Component Header - Hiển thị thanh điều hướng chính của ứng dụng
 * Bao gồm logo, các nút đăng nhập/đăng xuất, giỏ hàng và các liên kết khác
 */
const Header = () => {
  // Lấy thông tin giỏ hàng từ CartContext
  const { cart } = useContext(CartContext);
  
  // Lấy thông tin người dùng và các hàm xác thực từ AuthContext
  const { user, isLoggedIn, logout } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
    logout: () => {},
  };
  
  // Hook để điều hướng trang
  const navigate = useNavigate();

  // Tối ưu hóa việc tính toán số lượng sản phẩm trong giỏ hàng
  const cartItemCount = useMemo(() => calculateCartItemCount(cart), [cart]);

  /**
   * Xử lý sự kiện đăng xuất
   * Đăng xuất người dùng và chuyển hướng về trang chủ
   */
  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  /**
   * Render các nút điều hướng cho người dùng đã đăng nhập
   * Bao gồm: thông tin người dùng, nút đăng xuất, giỏ hàng và liên kết admin (nếu có quyền)
   */
  const renderAuthenticatedActions = () => (
    <>
      <Link to="/profile" className="profile-button" aria-label="Xem thông tin người dùng">
        👤 Xin Chào {getDisplayName(user)}
      </Link>
      <button
        className="logout-button"
        onClick={handleLogout}
        aria-label="Đăng xuất"
      >
        🚪 Đăng xuất
      </button>
      <Link to="/cart" className="cart-button" aria-label="Xem giỏ hàng">
        🛍️ Giỏ hàng ({cartItemCount})
      </Link>
      {user?.role === 'admin' && (
        <Link to="/admin" className="admin-link" aria-label="Truy cập trang quản trị">
          📊 Admin
        </Link>
      )}
    </>
  );

  /**
   * Render nút đăng nhập cho người dùng chưa đăng nhập
   */
  const renderUnauthenticatedActions = () => (
    <Link to="/" className="login-button" aria-label="Đăng nhập hoặc đăng ký">
      🔑 Đăng nhập
    </Link>
  );

  console.log('User addresses:', user?.addresses);

  return (
    <header className="header">
      {/* Logo và tên cửa hàng */}
      <Link to="/home" className="store-title">
        📱 MobileStore
      </Link>
      
      {/* Khu vực chứa các nút điều hướng */}
      <div className="header-actions">
        {isLoggedIn ? renderAuthenticatedActions() : renderUnauthenticatedActions()}
      </div>
    </header>
  );
};

export default Header;
