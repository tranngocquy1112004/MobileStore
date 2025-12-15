import React from "react";
import { Link } from "react-router-dom";
import OrderHistory from "../../orders/OrderHistory";
import { MIN_PASSWORD_LENGTH } from "../models/constants";
import "../../../styles/UserProfilePage.css";

const validateProfileFormProps = (props) => {
  const { formData, onChange, onSubmit, message } = props;
  if (!formData || typeof formData !== "object") return false;
  if (typeof formData.username !== "string") return false;
  if (typeof formData.email !== "string") return false;
  if (typeof formData.phone !== "string") return false;
  if (typeof onChange !== "function") return false;
  if (typeof onSubmit !== "function") return false;
  if (message !== undefined && typeof message !== "string") return false;
  return true;
};

const validatePasswordFormProps = (props) => {
  const { formData, onChange, onSubmit, message } = props;
  if (!formData || typeof formData !== "object") return false;
  if (typeof formData.oldPassword !== "string") return false;
  if (typeof formData.newPassword !== "string") return false;
  if (typeof formData.confirmNewPassword !== "string") return false;
  if (typeof onChange !== "function") return false;
  if (typeof onSubmit !== "function") return false;
  if (message !== undefined && typeof message !== "string") return false;
  return true;
};

const validateAddressFormProps = (props) => {
  const { addresses, newAddressFormData, onChange, onAddAddress, onDeleteAddress, message } = props;
  if (!Array.isArray(addresses)) return false;
  for (const addr of addresses) {
    if (!addr || typeof addr !== "object") return false;
    if (typeof addr.id !== "string" && typeof addr.id !== "number") return false;
    if (typeof addr.address !== "string") return false;
    if (typeof addr.name !== "string") return false;
    if (typeof addr.phone !== "string") return false;
  }
  if (!newAddressFormData || typeof newAddressFormData !== "object") return false;
  if (typeof newAddressFormData.address !== "string") return false;
  if (typeof newAddressFormData.name !== "string") return false;
  if (typeof newAddressFormData.phone !== "string") return false;
  if (typeof onChange !== "function") return false;
  if (typeof onAddAddress !== "function") return false;
  if (typeof onDeleteAddress !== "function") return false;
  if (message !== undefined && typeof message !== "string") return false;
  return true;
};

const ProfileForm = React.memo((props) => {
  if (!validateProfileFormProps(props)) {
    console.error("ProfileForm: Props không hợp lệ");
    return null;
  }

  const { formData, onChange, onSubmit, message } = props;

  return (
    <section className="profile-info-section">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={onSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="profile-username">Tên đăng nhập:</label>
          <input type="text" id="profile-username" name="username" value={formData.username} className="profile-input" disabled readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Email:</label>
          <input type="email" id="profile-email" name="email" value={formData.email} onChange={onChange} className="profile-input" />
        </div>
        <div className="form-group">
          <label htmlFor="profile-phone">Số điện thoại:</label>
          <input type="tel" id="profile-phone" name="phone" value={formData.phone} onChange={onChange} className="profile-input" />
        </div>
        <button type="submit" className="profile-update-button">
          Cập nhật thông tin
        </button>
      </form>
      {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</p>}
    </section>
  );
});

ProfileForm.displayName = "ProfileForm";

const PasswordForm = React.memo((props) => {
  if (!validatePasswordFormProps(props)) {
    console.error("PasswordForm: Props không hợp lệ");
    return null;
  }

  const { formData, onChange, onSubmit, message, minLength } = props;

  return (
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
            minLength={minLength}
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
            minLength={minLength}
          />
        </div>
        <button type="submit" className="change-password-button">
          Đổi mật khẩu
        </button>
      </form>
      {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</p>}
    </section>
  );
});

PasswordForm.displayName = "PasswordForm";

const AddressForm = React.memo((props) => {
  if (!validateAddressFormProps(props)) {
    console.error("AddressForm: Props không hợp lệ");
    return null;
  }

  const { addresses, newAddressFormData, onChange, onAddAddress, onDeleteAddress, message } = props;

  return (
    <section className="addresses-section">
      <h2>Địa chỉ giao hàng</h2>
      <h3>Thêm địa chỉ mới</h3>
      <form onSubmit={onAddAddress} className="address-form">
        <div className="form-group">
          <label htmlFor="new-address-address">Địa chỉ:</label>
          <input type="text" id="new-address-address" name="address" value={newAddressFormData.address} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="new-address-name">Người nhận:</label>
          <input type="text" id="new-address-name" name="name" value={newAddressFormData.name} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="new-address-phone">Điện thoại:</label>
          <input type="tel" id="new-address-phone" name="phone" value={newAddressFormData.phone} onChange={onChange} required />
        </div>
        <button type="submit">Lưu địa chỉ mới</button>
      </form>
      {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</p>}

      <h3>Danh sách địa chỉ ({addresses.length})</h3>
      {addresses.length === 0 ? (
        <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
      ) : (
        <ul className="address-list">
          {addresses.map((addr) => (
            <li key={addr.id} className="address-item">
              <p>
                <strong>Địa chỉ:</strong> {addr.address}
              </p>
              <p>
                <strong>Người nhận:</strong> {addr.name}
              </p>
              <p>
                <strong>Điện thoại:</strong> {addr.phone}
              </p>
              <button className="delete-address-button" onClick={() => onDeleteAddress(addr.id)}>
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});

AddressForm.displayName = "AddressForm";

const UserProfileView = ({
  user,
  state,
  FORM_TYPES,
  SECTIONS,
  handleInputChange,
  handleSubmitProfileUpdate,
  handleSubmitPasswordChange,
  handleAddAddress,
  handleDeleteAddress,
  setActiveSection,
}) => {
  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user?.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

      <nav className="profile-sections-menu">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            className={state.activeSection === section.id ? "active" : ""}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {state.activeSection === FORM_TYPES.PROFILE && (
        <ProfileForm
          formData={state.profile}
          onChange={(e) => handleInputChange(e, FORM_TYPES.PROFILE)}
          onSubmit={handleSubmitProfileUpdate}
          message={state.profile.message}
        />
      )}

      {state.activeSection === FORM_TYPES.PASSWORD && (
        <PasswordForm
          formData={state.password}
          onChange={(e) => handleInputChange(e, FORM_TYPES.PASSWORD)}
          onSubmit={handleSubmitPasswordChange}
          message={state.password.message}
          minLength={MIN_PASSWORD_LENGTH}
        />
      )}

      {state.activeSection === "addresses" && (
        <AddressForm
          addresses={state.address.addresses}
          newAddressFormData={state.address.newAddress}
          onChange={(e) => handleInputChange(e, FORM_TYPES.ADDRESS)}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          message={state.address.message}
        />
      )}

      {state.activeSection === "orders" && (
        <section className="order-history-section">
          <h2>Lịch sử đơn hàng</h2>
          <OrderHistory />
        </section>
      )}

      <div className="back-link">
        <Link to="/home">← Quay lại cửa hàng</Link>
      </div>
    </div>
  );
};

export default UserProfileView;
