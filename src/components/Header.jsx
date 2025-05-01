import React, { useContext, useCallback } from "react";
// Import Link and useNavigate from react-router-dom
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
// UserProfileModal import is removed as it's replaced by a separate profile page
// import UserProfileModal from "./UserProfileModal";
import "./Header.css";

// Header Component
const Header = () => {
  // Contexts and Hooks
  const { cart } = useContext(CartContext); // Get cart data
  const { user, isLoggedIn, logout } = useContext(AuthContext); // Get user info, login status, and logout function
  const navigate = useNavigate(); // Navigation hook
  // isProfileModalOpen state is removed as modal is no longer used

  // Handle logout
  const handleLogout = useCallback(() => {
    logout(); // Call logout function from AuthContext
    navigate("/"); // Redirect to home/login page after logout
  }, [logout, navigate]); // Dependencies

  // Calculate total number of items in cart
  const getCartItemCount = () => {
      // Ensure cart is an array before reducing, handle potential missing quantity safely
      const safeCart = Array.isArray(cart) ? cart : [];
      return safeCart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  };

  // Get display name for the logged-in user
  const getDisplayName = () => user?.username || "Khách"; // Use username if available, otherwise 'Khách'

  return (
    <header className="header">
      {/* Store title and link to homepage */}
      <Link to="/home" className="store-title">
        📱 MobileStore
      </Link>

      <div className="header-actions">
        {isLoggedIn ? (
          <> {/* Fragment to group elements when logged in */}
            {/* Link to User Profile Page */}
            {/* Replaces the button that opened the modal */}
            <Link
                to="/profile" // Route to the user profile page
                className="profile-button" // Keep CSS class for styling
                aria-label="Mở trang thông tin người dùng" // Updated accessibility label
             >
              👤 Xin Chào {getDisplayName()} {/* Display welcome message with username */}
            </Link>

            {/* Logout Button */}
            <button
              className="logout-button"
              onClick={handleLogout} // Attach logout handler
              aria-label="Đăng xuất" // Accessibility label
            >
              🚪 Đăng xuất
            </button>

            {/* Link to Cart Page */}
            {/* Class 'cart-button' is used as a target for the "fly to cart" animation */}
            <Link
              to="/cart"
              className="cart-button"
              aria-label="Xem giỏ hàng"
            >
              🛍️ Giỏ hàng ({getCartItemCount()}) {/* Display cart item count */}
            </Link>

            {/* Admin Dashboard Link (Conditional) */}
            {/* Show only if user is logged in and has 'admin' role */}
             {user?.role === 'admin' && ( // Check user object and role safely
                <Link to="/admin" className="admin-link" aria-label="Truy cập bảng điều khiển Admin">
                  📊 Admin
                </Link>
              )}
          </>
        ) : (
          // If not logged in: Display Login/Signup Link
          <Link
            to="/" // Route to the login/signup page
            className="login-button"
            aria-label="Đăng nhập hoặc đăng ký"
          >
            🔑 Đăng nhập
          </Link>
        )}
      </div>

      {/* UserProfileModal conditional rendering is removed */}
    </header>
  );
};

export default Header; // Export Header component