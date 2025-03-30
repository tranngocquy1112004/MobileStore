import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import UserProfileModal from "./UserProfileModal";
import "./Header.css";

const Header = () => {
  const { cart } = useContext(CartContext);
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/home" className="store-title">
        MobileStore
      </Link>
      <div className="header-actions">
        {isLoggedIn ? (
          <>
            <button
              className="profile-button"
              onClick={() => setShowProfileModal(true)}
            >
              Xin Chào {user?.username || "Khách"}
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Đăng xuất
            </button>
            <Link to="/cart" className="cart-button">
              🛍 Xem giỏ hàng ({cart.length})
            </Link>
          </>
        ) : (
          <Link to="/" className="login-button">
            Đăng nhập
          </Link>
        )}
      </div>
      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </header>
  );
};

export default Header;