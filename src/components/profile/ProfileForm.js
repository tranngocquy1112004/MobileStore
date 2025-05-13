import React from 'react';
import PropTypes from 'prop-types';

/**
 * Profile information form component
 */
const ProfileForm = React.memo(({ formData, onChange, onSubmit, message }) => (
  <section className="profile-info-section">
    <h2>Thông tin cá nhân</h2>
    <form onSubmit={onSubmit} className="profile-form">
      <div className="form-group">
        <label htmlFor="profile-username">Tên đăng nhập:</label>
        <input
          type="text"
          id="profile-username"
          name="username"
          value={formData.username}
          className="profile-input"
          disabled
          readOnly
        />
      </div>
      <div className="form-group">
        <label htmlFor="profile-email">Email:</label>
        <input
          type="email"
          id="profile-email"
          name="email"
          value={formData.email}
          onChange={onChange}
          className="profile-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="profile-phone">Số điện thoại:</label>
        <input
          type="tel"
          id="profile-phone"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          className="profile-input"
        />
      </div>
      <button type="submit" className="profile-update-button">
        Cập nhật thông tin
      </button>
    </form>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message}
      </p>
    )}
  </section>
));

ProfileForm.propTypes = {
  formData: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  message: PropTypes.string,
};

ProfileForm.displayName = 'ProfileForm';

export default ProfileForm; 