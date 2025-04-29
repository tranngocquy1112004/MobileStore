import React, { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../account/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import "./UserProfilePage.css";

// Import OrderHistory component (path đã sửa)
import OrderHistory from "./OrderHistory"; // Điều chỉnh lại path nếu cần thiết

// --- Định nghĩa hằng số ---
const LOCAL_STORAGE_USERS_KEY = "users";
const MIN_PASSWORD_LENGTH = 6;

const MESSAGES = {
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
  PASSWORD_CHANGE_FAILED: "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.",
  PASSWORDS_NOT_MATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
  EMPTY_PASSWORD_FIELDS: "Vui lòng điền đầy đủ các trường mật khẩu.",
  PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ!",
  PROFILE_UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
  PROFILE_UPDATE_FAILED: "Cập nhật thông tin thất bại. Vui lòng thử lại.",
  ADDRESS_SAVE_SUCCESS: "Lưu địa chỉ thành công!",
  ADDRESS_SAVE_FAILED: "Lưu địa chỉ thất bại. Vui lòng thử lại.",
  ADDRESS_DELETE_SUCCESS: "Xóa địa chỉ thành công!",
};


const UserProfilePage = () => {
  const { user, isLoggedIn, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileFormData, setProfileFormData] = useState({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
  });
   const [profileMessage, setProfileMessage] = useState("");

   const [addresses, setAddresses] = useState(user?.addresses || []);
   const [newAddressFormData, setNewAddressFormData] = useState({ address: '', name: '', phone: '' });
   const [addressMessage, setAddressMessage] = useState('');

  const [activeSection, setActiveSection] = useState('profile');


  useEffect(() => {
    if (!isLoggedIn || !user) {
       console.log("Người dùng chưa đăng nhập hoặc thông tin user không khả dụng, chuyển hướng.");
       navigate("/");
    } else {
         setProfileFormData({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
         });
         setAddresses(user.addresses || []);
    }
  }, [isLoggedIn, navigate, user]);


  const handleInputChange = useCallback((e, formType) => {
      const { name, value } = e.target;
      if (formType === 'password') {
          setPasswordFormData(prev => ({ ...prev, [name]: value }));
          setPasswordMessage("");
      } else if (formType === 'profile') {
           setProfileFormData(prev => ({ ...prev, [name]: value }));
           setProfileMessage("");
      } else if (formType === 'newAddress') {
           setNewAddressFormData(prev => ({ ...prev, [name]: value }));
           setAddressMessage("");
      }
  }, []);


  const handleSubmitPasswordChange = useCallback((e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmNewPassword } = passwordFormData;
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordMessage(MESSAGES.EMPTY_PASSWORD_FIELDS); return; }
    if (newPassword !== confirmPassword) {
      setPasswordMessage(MESSAGES.PASSWORDS_NOT_MATCH); return; }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordMessage(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`); return; }
    if (newPassword === oldPassword) {
        setPasswordMessage(MESSAGES.PASSWORD_SAME_AS_OLD); return; }

    let storedUsers = [];
    try { storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
       if (!Array.isArray(storedUsers)) storedUsers = []; } catch (error) {
      console.error("Lỗi khi đọc danh sách người dùng từ localStorage để đổi mật khẩu:", error);
      setPasswordMessage("Lỗi hệ thống, không thể xác thực mật khẩu cũ."); return; }

    const userIndex = storedUsers.findIndex(u => u.username === user.username);
    if (userIndex === -1 || storedUsers[userIndex].password !== oldPassword) {
         setPasswordMessage(MESSAGES.PASSWORD_CHANGE_FAILED);
         console.warn(`Đổi mật khẩu thất bại cho người dùng ${user?.username || 'không xác định'}. Mật khẩu cũ không khớp.`);
         return; }

    storedUsers[userIndex].password = newPassword;
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(storedUsers));

    const updatedUserForContext = {
        ...user,
        password: newPassword,
     };
    login(updatedUserForContext);

    setPasswordFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    setPasswordMessage(MESSAGES.PASSWORD_CHANGE_SUCCESS);
    console.log(`Người dùng ${user.username} đã đổi mật khẩu thành công.`);

    setTimeout(() => {
      logout();
    }, 2000);

  }, [passwordFormData, user, login, logout, MIN_PASSWORD_LENGTH]);


    const handleSubmitProfileUpdate = useCallback((e) => {
        e.preventDefault();
        console.log("Đang xử lý cập nhật thông tin cá nhân:", profileFormData);

        let storedUsers = [];
        try { storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
             if (!Array.isArray(storedUsers)) storedUsers = [];
        } catch (error) {
            console.error("Lỗi khi đọc danh sách người dùng để cập nhật profile:", error);
            setProfileMessage(MESSAGES.PROFILE_UPDATE_FAILED); return; }

        const userIndex = storedUsers.findIndex(u => u.username === user.username);

        if (userIndex > -1) {
            storedUsers[userIndex] = {
                ...storedUsers[userIndex],
                username: profileFormData.username,
                email: profileFormData.email,
                phone: profileFormData.phone,
            };

            localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(storedUsers));

             const updatedUserForContext = {
                 ...user,
                 username: profileFormData.username,
                 email: profileFormData.email,
                 phone: profileFormData.phone,
             };
             login(updatedUserForContext);


            setProfileMessage(MESSAGES.PROFILE_UPDATE_SUCCESS);
            console.log(`Cập nhật thông tin người dùng ${profileFormData.username} thành công.`);

        } else {
             setProfileMessage(MESSAGES.PROFILE_UPDATE_FAILED);
             console.warn(`Không tìm thấy người dùng hiện tại ${user?.username} để cập nhật profile.`);
        }


    }, [profileFormData, user, login]);


    const handleNewAddressChange = useCallback((e) => {
         handleInputChange(e, 'newAddress');
    }, [handleInputChange]);


    const handleAddAddress = useCallback((e) => {
        e.preventDefault();
        const { address, name, phone } = newAddressFormData;
        if (!address.trim() || !name.trim() || !phone.trim()) {
            setAddressMessage("Vui lòng điền đủ thông tin địa chỉ, tên và số điện thoại.");
            return; }

        const newAddress = {
            id: Date.now(),
            address: address.trim(),
            name: name.trim(),
            phone: phone.trim(),
        };

        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);
        setNewAddressFormData({ address: '', name: '', phone: '' });
        setAddressMessage(MESSAGES.ADDRESS_SAVE_SUCCESS);

        updateUserAddressesInStorage(updatedAddresses, user, login);
        console.log("Đã thêm địa chỉ mới:", newAddress);

    }, [newAddressFormData, addresses, user, login]);


     const handleDeleteAddress = useCallback((addressIdToDelete) => {
         if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
             return;
         }

         const updatedAddresses = addresses.filter(addr => addr.id !== addressIdToDelete);
         setAddresses(updatedAddresses);
         setAddressMessage(MESSAGES.ADDRESS_DELETE_SUCCESS);

         updateUserAddressesInStorage(updatedAddresses, user, login);
         console.log(`Đã xóa địa chỉ có ID: ${addressIdToDelete}`);

     }, [addresses, user, login]);

    const updateUserAddressesInStorage = useCallback((updatedAddressesList, currentUser, loginContextFn) => {
        let storedUsers = [];
        try {
             storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY)) || [];
             if (!Array.isArray(storedUsers)) storedUsers = [];
        } catch (error) {
            console.error("Lỗi khi đọc danh sách người dùng từ localStorage để cập nhật địa chỉ:", error);
            setAddressMessage(MESSAGES.ADDRESS_SAVE_FAILED);
            return;
        }

        const userIndex = storedUsers.findIndex(u => u.username === currentUser.username);

        if (userIndex > -1) {
            storedUsers[userIndex] = { ...storedUsers[userIndex], addresses: updatedAddressesList };
            localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(storedUsers));

             const updatedUserForContext = { ...currentUser, addresses: updatedAddressesList };
             loginContextFn(updatedUserForContext);

             console.log(`Đã cập nhật địa chỉ cho người dùng ${currentUser.username} trong localStorage.`);

        } else {
             console.warn(`Không tìm thấy người dùng hiện tại ${currentUser?.username} để cập nhật địa chỉ.`);
             setAddressMessage(MESSAGES.ADDRESS_SAVE_FAILED);
        }
    }, [login]);


  if (!isLoggedIn || !user) {
      return null;
  }


  return (
    <div className="user-profile-container">
      <h1>Xin chào, {user.username}!</h1>
      <p>Quản lý thông tin và đơn hàng của bạn.</p>

        <div className="profile-sections-menu">
            <button
                className={activeSection === 'profile' ? 'active' : ''}
                onClick={() => setActiveSection('profile')}
                aria-label="Xem và chỉnh sửa thông tin cá nhân"
            >
                Thông tin cá nhân
            </button>
             <button
                className={activeSection === 'password' ? 'active' : ''}
                onClick={() => setActiveSection('password')}
                 aria-label="Thay đổi mật khẩu"
            >
                Đổi mật khẩu
            </button>
             <button
                className={activeSection === 'addresses' ? 'active' : ''}
                onClick={() => setActiveSection('addresses')}
                 aria-label="Quản lý địa chỉ giao hàng"
            >
                Địa chỉ giao hàng
            </button>
             <button
                className={activeSection === 'orders' ? 'active' : ''}
                onClick={() => setActiveSection('orders')}
                 aria-label="Xem lịch sử đơn hàng"
            >
                Lịch sử đơn hàng
            </button>
        </div>


        {activeSection === 'profile' && (
            <section className="profile-info-section">
                <h2>Thông tin cá nhân</h2>
                 <form onSubmit={handleSubmitProfileUpdate} className="profile-form">
                    <div className="form-group">
                         <label htmlFor="profile-username">Tên đăng nhập:</label>
                         <input
                            type="text"
                            id="profile-username"
                            name="username"
                            value={profileFormData.username}
                            onChange={(e) => handleInputChange(e, 'profile')}
                            className="profile-input"
                            disabled
                            />
                    </div>
                     <div className="form-group">
                         <label htmlFor="profile-email">Email:</label>
                         <input
                             type="email"
                             id="profile-email"
                             name="email"
                             value={profileFormData.email}
                             onChange={(e) => handleInputChange(e, 'profile')}
                             className="profile-input"
                             />
                     </div>
                     <div className="form-group">
                         <label htmlFor="profile-phone">Số điện thoại:</label>
                         <input
                             type="tel"
                             id="profile-phone"
                             name="phone"
                             value={profileFormData.phone}
                             onChange={(e) => handleInputChange(e, 'profile')}
                             className="profile-input"
                             />
                     </div>

                     <button type="submit" className="profile-update-button">
                         Cập nhật thông tin
                     </button>
                 </form>
                {profileMessage && <p className={`message ${profileMessage.includes('thành công') ? 'success' : profileMessage.includes('thất bại') ? 'error' : ''}`}>{profileMessage}</p>}
            </section>
        )}

        {activeSection === 'password' && (
             <section className="change-password-section">
                <h2>Đổi mật khẩu</h2>
                <form onSubmit={handleSubmitPasswordChange} className="password-form">
                    <div className="form-group">
                        <label htmlFor="oldPassword">Mật khẩu cũ:</label>
                        <input
                            type="password"
                            id="oldPassword"
                            name="oldPassword"
                            value={passwordFormData.oldPassword}
                            onChange={(e) => handleInputChange(e, 'password')}
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
                            value={passwordFormData.newPassword}
                            onChange={(e) => handleInputChange(e, 'password')}
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
                            value={passwordFormData.confirmPassword}
                            onChange={(e) => handleInputChange(e, 'password')}
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
                {passwordMessage && <p className={`message ${passwordMessage.includes('thành công') ? 'success' : (passwordMessage.includes('thất bại') || passwordMessage.includes('không khớp') || passwordMessage.includes('không đúng') || passwordMessage.includes('ít nhất') || passwordMessage.includes('trùng')) ? 'error' : ''}`}>{passwordMessage}</p>}
            </section>
        )}

        {activeSection === 'addresses' && (
            <section className="addresses-section">
                 <h2>Địa chỉ giao hàng</h2>

                 <h3>Thêm địa chỉ mới</h3>
                 <form onSubmit={handleAddAddress} className="address-form">
                     <div className="form-group">
                         <label htmlFor="new-address-address">Địa chỉ:</label>
                         <input
                            type="text"
                            id="new-address-address"
                            name="address"
                            placeholder="Nhập địa chỉ chi tiết"
                            value={newAddressFormData.address}
                            onChange={(e) => handleNewAddressChange(e)}
                            required
                            />
                     </div>
                     <div className="form-group">
                         <label htmlFor="new-address-name">Người nhận:</label>
                         <input
                            type="text"
                            id="new-address-name"
                            name="name"
                            placeholder="Tên người nhận"
                            value={newAddressFormData.name}
                             onChange={(e) => handleNewAddressChange(e)}
                             required
                            />
                     </div>
                     <div className="form-group">
                         <label htmlFor="new-address-phone">Điện thoại:</label>
                         <input
                            type="tel"
                            id="new-address-phone"
                            name="phone"
                            placeholder="Số điện thoại liên hệ"
                            value={newAddressFormData.phone}
                            onChange={(e) => handleNewAddressChange(e)}
                             required
                            />
                     </div>
                     <button type="submit">Lưu địa chỉ mới</button>
                 </form>

                 {addressMessage && <p className={`message ${addressMessage.includes('thành công') ? 'success' : addressMessage.includes('thất bại') ? 'error' : ''}`}>{addressMessage}</p>}


                 <h3>Danh sách địa chỉ của bạn ({addresses.length})</h3>
                  {addresses.length === 0 ? (
                      <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>
                  ) : (
                      <ul className="address-list">
                          {addresses.map(addr => (
                              // Sử dụng id duy nhất làm key
                              <li key={addr.id} className="address-item">
                                  <p><strong>Địa chỉ:</strong> {addr.address}</p>
                                  <p><strong>Người nhận:</strong> {addr.name}</p>
                                  <p><strong>Điện thoại:</strong> {addr.phone}</p>
                                   <button
                                       className="delete-address-button"
                                       onClick={() => handleDeleteAddress(addr.id)}
                                       aria-label={`Xóa địa chỉ ${addr.address}`}>
                                       Xóa
                                   </button>
                              </li>
                          ))}
                      </ul>
                  )}
            </section>
        )}


        {activeSection === 'orders' && (
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

export default UserProfilePage;