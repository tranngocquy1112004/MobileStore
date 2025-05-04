import React, { useContext, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import "./Header.css";

// Utility function to calculate total cart item count
const calculateCartItemCount = (cart) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  return safeCart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
};

// Utility function to get display name
const getDisplayName = (user) => user?.username || "Khách";

const Header = () => {
  const { cart } = useContext(CartContext);
  const { user, isLoggedIn, logout } = useContext(AuthContext) || {
    user: null,
    isLoggedIn: false,
    logout: () => {},
  };
  const navigate = useNavigate();

  // Memoized cart item count
  const cartItemCount = useMemo(() => calculateCartItemCount(cart), [cart]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  // Render authenticated user actions
  const renderAuthenticatedActions = () => (
    <>
      <Link to="/profile" className="profile-button" aria-label="View user profile">
        👤 Xin Chào {getDisplayName(user)}
      </Link>
      <button
        className="logout-button"
        onClick={handleLogout}
        aria-label="Log out"
      >
        🚪 Đăng xuất
      </button>
      <Link to="/cart" className="cart-button" aria-label="View cart">
        🛍️ Giỏ hàng ({cartItemCount})
      </Link>
      {user?.role === 'admin' && (
        <Link to="/admin" className="admin-link" aria-label="Access admin dashboard">
          📊 Admin
        </Link>
      )}
    </>
  );

  // Render unauthenticated user actions
  const renderUnauthenticatedActions = () => (
    <Link to="/" className="login-button" aria-label="Log in or register">
      🔑 Đăng nhập
    </Link>
  );

  return (
    <header className="header">
      <Link to="/home" className="store-title">
        📱 MobileStore
      </Link>
      <div className="header-actions">
        {isLoggedIn ? renderAuthenticatedActions() : renderUnauthenticatedActions()}
      </div>
    </header>
  );
};

export default Header;