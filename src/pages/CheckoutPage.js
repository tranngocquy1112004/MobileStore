// src/pages/CheckoutPage.js

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../account/AuthContext';
import { CartContext } from '../pages/CartContext';

import './CheckoutPage.css';

// Constant key for orders in localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders";

const CheckoutPage = () => {
    // Get user info and login status from AuthContext
    const { user, isLoggedIn } = useContext(AuthContext);
    // Get cart info and clearCart function from CartContext
    const { cart, clearCart } = useContext(CartContext);

    // Navigation hook
    const navigate = useNavigate();

    // --- State management for shipping information ---
    // Stores the final shipping details to be used for the order
    const [shippingInfo, setShippingInfo] = useState({ address: '', name: '', phone: '' });

    // Stores the ID of the selected saved address (if any)
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);

    // Controls visibility of the manual address entry form
    const [showManualAddressForm, setShowManualAddressForm] = useState(false);


    // --- Effect hook to handle initial setup and redirects ---
    useEffect(() => {
        // Redirect if not logged in
        if (!isLoggedIn || !user) {
            console.log("Người dùng chưa đăng nhập, chuyển hướng về trang đăng nhập.");
            navigate("/");
            return;
        }

        // Redirect if cart is empty
        if (!cart || cart.length === 0) {
            console.log("Giỏ hàng rỗng, chuyển hướng về trang giỏ hàng.");
            navigate("/cart");
            return;
        }

        // If user is logged in and has saved addresses
        if (user.addresses && user.addresses.length > 0) {
            // Automatically select the first saved address
            const firstAddress = user.addresses[0];
            setShippingInfo(firstAddress);
            setSelectedSavedAddressId(firstAddress.id);
            setShowManualAddressForm(false); // Hide manual form
        } else {
            // If no saved addresses, show the manual form
            setShowManualAddressForm(true);
            setShippingInfo({ address: '', name: '', phone: '' }); // Ensure shippingInfo is reset
            setSelectedSavedAddressId(null); // Ensure no saved address is selected
        }
    }, [user, isLoggedIn, cart, navigate]); // Dependencies

    // --- Handlers for address selection and entry ---

    // Handler when a user selects a saved address radio button
    const handleSelectSavedAddress = useCallback((addressId) => {
        // Find the selected address in the user's saved addresses
        const selectedAddr = user?.addresses?.find(addr => addr.id === addressId);
        if (selectedAddr) {
            setShippingInfo(selectedAddr); // Update shippingInfo state
            setSelectedSavedAddressId(addressId); // Update selected ID state
            setShowManualAddressForm(false); // Hide manual form
        }
    }, [user]); // Dependency: user context

    // Handler when user types into the manual address form inputs
    const handleManualAddressChange = useCallback((e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value })); // Update shippingInfo state
        setSelectedSavedAddressId(null); // Deselect any saved address
        // showManualAddressForm state is managed by the toggle button, not directly here
    }, []); // setShippingInfo and setSelectedSavedAddressId are stable


    // --- Handler for placing the order ---
    const handlePlaceOrder = useCallback((e) => {
         // Prevent default form submission if attached to a form
        if (e) e.preventDefault();

        // --- Validation ---
        // Check if shipping information is complete
        if (!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone) {
            alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
            return; // Stop if info is missing
        }
        // Check if cart is empty (should be prevented by useEffect, but double check)
        if (!cart || cart.length === 0) {
            alert("Giỏ hàng của bạn trống.");
            navigate('/cart'); // Redirect to cart
            return;
        }
        // Check if user is logged in (should be prevented by useEffect)
        if (!isLoggedIn || !user || !user.username) {
            alert("Vui lòng đăng nhập để đặt hàng.");
            navigate('/'); // Redirect to home/login
            return;
        }

        // --- Create the order object ---
        const newOrder = {
            id: Date.now(), // Simple ID generation (consider uuid for robustness)
            username: user.username, // Store username
            date: new Date().toISOString(), // Store order date/time
            items: cart, // Store cart items
            totalPrice: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0), // Calculate total price safely
            shippingInfo: shippingInfo, // Store final shipping info
            status: 'Pending', // Initial status
            // Add other fields like payment method, notes, etc. if needed
        };

        // --- Save the order to localStorage ---
        const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        let allOrders = [];

        if (storedData) {
            try {
                allOrders = JSON.parse(storedData);
            } catch (parseError) {
                console.error("Lỗi khi phân tích dữ liệu đơn hàng từ localStorage:", parseError);
                // If parsing fails, treat existing data as empty, maybe log a warning
                // localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY); // Optional: clear bad data
            }
        }

        // Ensure allOrders is an array before pushing
        if (!Array.isArray(allOrders)) {
             console.warn("Dữ liệu đơn hàng trong localStorage không phải là mảng, sử dụng mảng rỗng.");
             allOrders = [];
        }

        allOrders.push(newOrder); // Add new order
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(allOrders)); // Save updated list

        // --- Clear the cart after successful order ---
        clearCart();

        // --- Success message and navigation ---
        alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        console.log("Đã đặt hàng thành công:", newOrder);

        // Navigate to order history page
        navigate('/orders');

    }, [shippingInfo, cart, isLoggedIn, user, clearCart, navigate]); // Dependencies


     // Render loading or redirect state (mostly handled by useEffect)
     // These messages provide immediate feedback during the brief check before redirect
     if (!isLoggedIn || !user) {
         return <p>Đang kiểm tra trạng thái đăng nhập...</p>;
     }

     if (!cart || cart.length === 0) {
          return <p>Đang kiểm tra giỏ hàng...</p>;
     }


    return (
        <div className="checkout-container"> {/* Main container */}
            <h1 className="page-title">Thanh toán</h1>

            {/* --- Order Summary Section --- */}
            <div className="order-summary-section">
                <h2>📋 Thông tin đơn hàng</h2>
                {/* Check cart is not empty before rendering (redundant due to useEffect, but safe) */}
                 {cart && cart.length > 0 ? (
                     <>
                         <ul className="checkout-cart-items-list">
                             {/* Ensure cart is an array before mapping */}
                             {Array.isArray(cart) && cart.map((item, index) => (
                                  // Using item.id as key, fallback to index if id is missing
                                 <li key={item.id || index} className="checkout-cart-item">
                                     <span className="item-name">{item.name || 'Sản phẩm không rõ'}</span>
                                     <span className="item-quantity">x {item.quantity || 0}</span>
                                     <span className="item-price">{(item.price || 0) * (item.quantity || 0).toLocaleString("vi-VN")} VNĐ</span> {/* Added optional chaining */}
                                 </li>
                             ))}
                         </ul>
                         <p className="checkout-total-price">
                             <strong>Tổng tiền:</strong> {cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toLocaleString("vi-VN")} VNĐ {/* Added optional chaining */}
                         </p>
                     </>
                 ) : (
                     <p>Giỏ hàng trống.</p>
                 )}
            </div>

            {/* --- Shipping Information Section --- */}
            <div className="shipping-info-section">
                <h2>🚚 Thông tin giao hàng</h2>

                {/* Display saved addresses selection if user has saved addresses */}
                {isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                    <div className="saved-addresses-selection">
                        <h3>Chọn địa chỉ đã lưu:</h3>
                        <ul className="address-options-list">
                            {user.addresses.map(addr => (
                                <li key={addr.id}>
                                    <input
                                        type="radio"
                                        id={`saved-address-${addr.id}`}
                                        name="shippingAddressOption"
                                        checked={selectedSavedAddressId === addr.id}
                                        onChange={() => handleSelectSavedAddress(addr.id)}
                                    />
                                    <label htmlFor={`saved-address-${addr.id}`} className="address-option-label">
                                        <strong>{addr.name}</strong> - {addr.phone} - {addr.address}
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="toggle-address-form-button"
                            onClick={() => { setShowManualAddressForm(true); setSelectedSavedAddressId(null); }}
                        >
                            Nhập địa chỉ mới
                        </button>
                         <hr />
                    </div>
                )}

                {/* Display manual address entry form */}
                {/* Show if showManualAddressForm is true OR if no saved addresses exist */}
                {(showManualAddressForm || (user?.addresses?.length === 0 && isLoggedIn)) ? (
                     // Wrapped manual address inputs in a form
                     <form className="manual-address-entry" onSubmit={handlePlaceOrder}> {/* Attached handler to form submit */}
                         <h3>Nhập địa chỉ mới:</h3>
                         {/* If saved addresses exist, add button to switch back */}
                         {user?.addresses && user.addresses.length > 0 && (
                             <button
                                 type="button" // Set type="button" to prevent form submission
                                 className="toggle-address-form-button"
                                 onClick={() => { setShowManualAddressForm(false); /* Optional: re-select first saved address */ }}
                             >
                                 ← Quay lại chọn địa chỉ đã lưu
                             </button>
                         )}
                         {/* Manual address input fields */}
                         <div className="form-group">
                             <label htmlFor="manual-address-input">Địa chỉ:</label>
                             <input
                                 type="text"
                                 id="manual-address-input"
                                 name="address"
                                 placeholder="Nhập địa chỉ chi tiết"
                                 value={shippingInfo.address}
                                 onChange={handleManualAddressChange}
                                 required
                             />
                         </div>
                          <div className="form-group">
                             <label htmlFor="manual-name-input">Người nhận:</label>
                             <input
                                 type="text"
                                 id="manual-name-input"
                                 name="name"
                                 placeholder="Tên người nhận"
                                 value={shippingInfo.name}
                                 onChange={handleManualAddressChange}
                                 required
                             />
                         </div>
                          <div className="form-group">
                             <label htmlFor="manual-phone-input">Điện thoại:</label>
                             <input
                                 type="tel"
                                 id="manual-phone-input"
                                 name="phone"
                                 placeholder="Số điện thoại liên hệ"
                                 value={shippingInfo.phone}
                                 onChange={handleManualAddressChange}
                                 required
                             />
                         </div>
                         {/* Optional: button to save new address to profile */}
                         {/* <button type="button" onClick={handleSaveManualAddressToProfile}>Lưu địa chỉ này vào hồ sơ</button> */}

                         {/* Place order button is now INSIDE this form */}
                         <button
                              type="submit" // Button type is submit
                              className="place-order-button"
                              // Disabled logic remains the same
                              disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone || !isLoggedIn || !cart || cart.length === 0}
                          >
                              ✅ Đặt hàng
                          </button>
                     </form>
                 ) : (
                    // If manual form is not shown and there are saved addresses,
                    // the Place Order button needs to be outside the form
                    isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                        // Place order button for saved addresses
                        <button
                             className="place-order-button"
                             onClick={handlePlaceOrder} // Attach handler to onClick
                             // Disabled logic remains the same
                             disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone || !isLoggedIn || !cart || cart.length === 0}
                         >
                             ✅ Đặt hàng
                         </button>
                     )
                 )}


                {/* --- Final Shipping Preview --- */}
                 {/* This section shows the currently selected/entered address details */}
                 <div className="final-shipping-preview">
                     <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
                      {/* Display preview if shippingInfo has all fields */}
                     {shippingInfo.address && shippingInfo.name && shippingInfo.phone ? (
                         <p className="shipping-details">
                             <strong>{shippingInfo.name}</strong> - {shippingInfo.phone} <br/>
                             {shippingInfo.address}
                         </p>
                     ) : (
                         <p className="shipping-placeholder">Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên.</p>
                     )}
                 </div>


            </div> {/* End shipping-info-section */}


            {/* Note: Payment method, notes, etc. sections could go here */}

        </div> // End checkout-container
    );
};

export default CheckoutPage;