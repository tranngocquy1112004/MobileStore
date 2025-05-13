import React from 'react';
import PropTypes from 'prop-types';

/**
 * Address management form component
 */
const AddressForm = React.memo(({ 
  addresses, 
  newAddressFormData, 
  onChange, 
  onAddAddress, 
  onDeleteAddress, 
  message 
}) => (
  <section className="addresses-section">
    <h2>Địa chỉ giao hàng</h2>
    <h3>Thêm địa chỉ mới</h3>
    <form onSubmit={onAddAddress} className="address-form">
      <div className="form-group">
        <label htmlFor="new-address-address">Địa chỉ:</label>
        <input
          type="text"
          id="new-address-address"
          name="address"
          value={newAddressFormData.address}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="new-address-name">Người nhận:</label>
        <input
          type="text"
          id="new-address-name"
          name="name"
          value={newAddressFormData.name}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="new-address-phone">Điện thoại:</label>
        <input
          type="tel"
          id="new-address-phone"
          name="phone"
          value={newAddressFormData.phone}
          onChange={onChange}
          required
        />
      </div>
      <button type="submit">Lưu địa chỉ mới</button>
    </form>
    {message && (
      <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
        {message}
      </p>
    )}
    <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3>
    {addresses.length === 0 ? (
      <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
    ) : (
      <ul className="address-list">
        {addresses.map((addr) => (
          <li key={addr.id} className="address-item">
            <p><strong>Địa chỉ:</strong> {addr.address}</p>
            <p><strong>Người nhận:</strong> {addr.name}</p>
            <p><strong>Điện thoại:</strong> {addr.phone}</p>
            <button
              className="delete-address-button"
              onClick={() => onDeleteAddress(addr.id)}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
));

AddressForm.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      address: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
    })
  ).isRequired,
  newAddressFormData: PropTypes.shape({
    address: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onAddAddress: PropTypes.func.isRequired,
  onDeleteAddress: PropTypes.func.isRequired,
  message: PropTypes.string,
};

AddressForm.displayName = 'AddressForm';

export default AddressForm; 