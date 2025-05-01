// Import necessary React hooks: useState, useContext, useCallback
import React, { useState, useContext, useCallback } from "react";
// Import AuthContext for user data and logout function
import { AuthContext } from "../account/AuthContext"; // Assuming AuthContext path is correct
// Import CSS for styling
import "./UserProfileModal.css";

// --- Local Constants ---

// Key for storing all registered users in localStorage
const LOCAL_STORAGE_USERS_KEY = "users";
// Key for storing the currently logged-in user in localStorage (assuming AuthContext uses this)
const LOCAL_STORAGE_CURRENT_USER_KEY = "currentUser"; // Define constant for consistency
// Minimum length requirement for the new password
const MIN_PASSWORD_LENGTH = 6;

// --- UserProfileModal Component ---
// Displays user's basic info and a form to change password.
// Receives onClose prop: Function to call when the modal should close.
const UserProfileModal = ({ onClose }) => {
  // Access user data and logout function from AuthContext
  const { user, logout } = useContext(AuthContext);

  // --- State for form inputs and feedback message ---
  const [oldPassword, setOldPassword] = useState(""); // State for old password input
  const [newPassword, setNewPassword] = useState(""); // State for new password input
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password input
  const [message, setMessage] = useState(""); // State for success/error message

  // --- Handler for password change form submission ---
  const handleChangePassword = useCallback((e) => {
    e.preventDefault(); // Prevent default form submission

    setMessage(""); // Clear previous message

    // --- Validation Checks ---
    // Check if old password matches the current user's password
    if (oldPassword !== user?.password) { // Use optional chaining
      setMessage("Mật khẩu cũ không đúng!");
      return;
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Check minimum length of the new password
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setMessage(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`);
      return;
    }

    // Check if the new password is the same as the old password
    if (newPassword === oldPassword) {
        setMessage("Mật khẩu mới không được trùng với mật khẩu cũ!");
        return;
    }


    // --- Update password in localStorage (Frontend Demo Only - INSECURE) ---
    // WARNING: Storing passwords in plain text in localStorage is highly insecure.
    // In a real application, handle password changes via a secure backend API.

    // Load all users from localStorage
    let storedUsers = [];
    const storedUsersData = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (storedUsersData) {
        try {
            storedUsers = JSON.parse(storedUsersData);
            // Ensure it's an array after parsing
            if (!Array.isArray(storedUsers)) {
                 console.warn("Dữ liệu người dùng trong localStorage không phải là mảng sau parse.");
                 storedUsers = []; // Use empty array if not an array
            }
        } catch (error) {
            console.error("Lỗi khi đọc danh sách người dùng từ localStorage:", error);
             // If parsing fails, proceed with empty array
            storedUsers = [];
             // Optional: remove corrupted data if parsing fails
            // localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
        }
    }


    // Find and update the current user's password in the users list
    const updatedUsers = storedUsers.map((storedUser) =>
      storedUser.username === user?.username // Compare username safely
        ? { ...storedUser, password: newPassword } // Update password
        : storedUser // Keep other users unchanged
    );

    // Save the updated users list back to localStorage
    try {
         localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
         console.error("Lỗi khi lưu danh sách người dùng cập nhật vào localStorage:", error);
         setMessage("Lỗi hệ thống khi lưu mật khẩu mới."); // Show error message
         return; // Stop if saving fails
    }


    // Update the logged-in user's info in localStorage (assuming AuthContext reads this key)
    // Ensure user object exists before saving
    if (user) {
        try {
             localStorage.setItem(
               LOCAL_STORAGE_CURRENT_USER_KEY, // Use the constant key
               JSON.stringify({ ...user, password: newPassword }) // Update password in current user object
            );
        } catch (error) {
             console.error("Lỗi khi lưu thông tin người dùng hiện tại cập nhật vào localStorage:", error);
             // Continue even if this specific save fails, main user list is updated
        }
    }


    // --- Handle Successful Password Change ---
    setMessage(`Đổi mật khẩu thành công! Vui lòng đăng nhập lại.`); // Success message
    // Clear input fields
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Logout and close modal after a delay (forces re-login with new password)
    setTimeout(() => {
      logout(); // Call logout function
      onClose(); // Call onClose prop
    }, 2000); // 2 seconds delay
  }, [user, oldPassword, newPassword, confirmPassword, logout, onClose]); // Dependencies

  // --- Render Modal UI ---
  return (
    // Modal overlay for background dimming
    // Add onClick={onClose} here if you want clicking outside the modal to close it
    <div className="modal-overlay">
      {/* Modal content container */}
      {/* Stop propagation to prevent clicks inside from closing via overlay click */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Thông tin người dùng</h2> {/* Modal title */}

        {/* --- Basic User Info Section --- */}
        <div className="user-info">
          <p>
            <strong>Tên đăng nhập:</strong>{" "}
            {/* Display username safely */}
            {user?.username || "Không có dữ liệu"}
          </p>
          {/* Add other user info here if available in the 'user' object */}
        </div>

        <h3>Đổi mật khẩu</h3> {/* Password change section title */}

        {/* --- Change Password Form --- */}
        {/* Attach onSubmit handler to the form */}
        <form onSubmit={handleChangePassword}>
          {/* Old password input */}
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu cũ"
            autoComplete="current-password" // Suggest current password for browser autofill
          />
          {/* New password input */}
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-label="Nhập mật khẩu mới"
            autoComplete="new-password" // Suggest new password for browser autofill
            minLength={MIN_PASSWORD_LENGTH} // Use constant for min length
          />
          {/* Confirm new password input */}
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label="Xác nhận mật khẩu mới"
            autoComplete="new-password" // Suggest new password for browser autofill
            minLength={MIN_PASSWORD_LENGTH} // Use constant for min length
          />

          {/* --- Display Message --- */}
          {/* Show message if state is not empty */}
          {message && (
            // Apply success/error class based on message content
            <p className={message.includes("thành công") ? "success" : "error"}>
              {message}
            </p>
          )}

          {/* --- Modal Action Buttons --- */}
          <div className="modal-buttons">
            {/* Submit button for the form */}
            <button type="submit" className="confirm-button">
              Đổi mật khẩu
            </button>
            {/* Close modal button */}
            <button
              type="button" // Prevent button from submitting the form
              className="cancel-button"
              onClick={onClose} // Call onClose prop
              aria-label="Đóng modal"
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;