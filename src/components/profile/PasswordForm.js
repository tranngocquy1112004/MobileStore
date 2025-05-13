import React from 'react';
import PropTypes from 'prop-types';
import { MIN_PASSWORD_LENGTH } from '../../constants/profile';

/**
 * Password change form component
 */
const PasswordForm = React.memo(({ formData, onChange, onSubmit, message }) => (
  <section className="change-password-section">
    <h2>Đổi mật khẩu</h2>
    <form onSubmit={onSubmit} className="password-form">
      <div className="form-group">
        <label htmlFor="oldPassword">Mật khẩu cũ:</label>
        <input
          type="password"
          id="oldPassword"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={onChange}
          className="password-input"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">Mật khẩu mới:</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          className="password-input"
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
        <input
          type="password"
          id="confirmNewPassword"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={onChange}
          className="password-input"
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />
      </div>
      <button type="submit" className="change-password-button">
        Đổi mật khẩu
      </button>
    </form>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message}
      </p>
    )}
  </section>
));

PasswordForm.propTypes = {
  formData: PropTypes.shape({
    oldPassword: PropTypes.string.isRequired,
    newPassword: PropTypes.string.isRequired,
    confirmNewPassword: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  message: PropTypes.string,
};

PasswordForm.displayName = 'PasswordForm';

export default PasswordForm; 