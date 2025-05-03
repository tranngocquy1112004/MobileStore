// src/pages/CheckoutPage.js

import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../account/AuthContext';
import { CartContext } from '../pages/CartContext';
import './CheckoutPage.css';

// Hằng số
const LOCAL_STORAGE_ORDERS_KEY = "orders";

const CheckoutPage = () => {
    // Context và hook điều hướng
    const { user, isLoggedIn } = useContext(AuthContext);
    const { cart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    // Quản lý state
    const [shippingInfo, setShippingInfo] = useState({ address: '', name: '', phone: '' });
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
    const [showManualAddressForm, setShowManualAddressForm] = useState(false);
    const [message, setMessage] = useState(null);

    // Tính tổng giỏ hàng với useMemo
    const cartTotal = useMemo(() => (
        Array.isArray(cart) 
            ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) 
            : 0
    ), [cart]);

    // Khởi tạo trang thanh toán
    useEffect(() => {
        // Chuyển hướng nếu chưa đăng nhập
        if (!isLoggedIn || !user) {
            navigate("/");
            return;
        }

        // Chuyển hướng nếu giỏ hàng trống
        if (!cart?.length) {
            navigate("/cart");
            return;
        }

        // Thiết lập địa chỉ ban đầu
        if (user.addresses?.length) {
            const firstAddress = user.addresses[0];
            setShippingInfo(firstAddress);
            setSelectedSavedAddressId(firstAddress.id);
            setShowManualAddressForm(false);
        } else {
            setShowManualAddressForm(true);
            setShippingInfo({ address: '', name: '', phone: '' });
            setSelectedSavedAddressId(null);
        }
    }, [user, isLoggedIn, cart, navigate]);

    // Xử lý lựa chọn địa chỉ đã lưu
    const handleSelectSavedAddress = useCallback((addressId) => {
        const selectedAddr = user?.addresses?.find(addr => addr.id === addressId);
        if (selectedAddr) {
            setShippingInfo(selectedAddr);
            setSelectedSavedAddressId(addressId);
            setShowManualAddressForm(false);
            setMessage(null);
        }
    }, [user]);

    // Xử lý thay đổi form địa chỉ thủ công
    const handleManualAddressChange = useCallback((e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
        setSelectedSavedAddressId(null);
        setMessage(null);
    }, []);

    // Hàm hỗ trợ localStorage
    const readOrdersFromStorage = useCallback(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
            if (!storedData) return [];
            
            const orders = JSON.parse(storedData);
            return Array.isArray(orders) ? orders : [];
        } catch (parseError) {
            console.error("Lỗi khi phân tích dữ liệu đơn hàng từ localStorage:", parseError);
            setMessage("Lỗi hệ thống khi đọc dữ liệu đơn hàng.");
            return [];
        }
    }, []);

    const saveOrdersToStorage = useCallback((ordersToSave) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(ordersToSave));
            return true;
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu đơn hàng vào localStorage:", error);
            setMessage("Lỗi hệ thống khi lưu dữ liệu đơn hàng.");
            return false;
        }
    }, []);

    // Xử lý đặt hàng
    const handlePlaceOrder = useCallback((e) => {
        if (e) e.preventDefault();

        // Kiểm tra dữ liệu
        if (!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone) {
            setMessage("Vui lòng nhập đầy đủ thông tin giao hàng.");
            return;
        }
        
        if (!cart?.length) {
            setMessage("Giỏ hàng của bạn trống.");
            navigate('/cart');
            return;
        }
        
        if (!isLoggedIn || !user?.username) {
            setMessage("Vui lòng đăng nhập để đặt hàng.");
            navigate('/');
            return;
        }

        // Tạo đối tượng đơn hàng
        const newOrder = {
            id: Date.now(),
            username: user.username,
            date: new Date().toISOString(),
            items: cart.map(item => ({
                id: item.id,
                name: item.name || 'Sản phẩm không rõ',
                price: item.price || 0,
                quantity: item.quantity || 0,
            })),
            totalPrice: cartTotal,
            shippingInfo: {
                address: shippingInfo.address,
                name: shippingInfo.name,
                phone: shippingInfo.phone,
            },
            status: 'Đang xử lý',
        };

        // Lưu đơn hàng vào localStorage
        const allOrders = readOrdersFromStorage();
        if (allOrders === null) {
            setMessage("Lỗi hệ thống khi đọc dữ liệu đơn hàng.");
            return;
        }

        allOrders.push(newOrder);
        
        if (!saveOrdersToStorage(allOrders)) {
            return; // Thông báo lỗi đã được đặt trong saveOrdersToStorage
        }

        // Xóa giỏ hàng và điều hướng
        clearCart();
        setMessage("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        
        setTimeout(() => {
            navigate('/orders');
        }, 1500);
    }, [
        shippingInfo, 
        cart, 
        cartTotal, 
        isLoggedIn, 
        user, 
        clearCart, 
        navigate, 
        readOrdersFromStorage, 
        saveOrdersToStorage
    ]);

    // Chuyển đổi giữa địa chỉ đã lưu và nhập thủ công
    const toggleAddressForm = useCallback((showForm) => {
        setShowManualAddressForm(showForm);
        
        if (showForm) {
            setSelectedSavedAddressId(null);
            setShippingInfo({ address: '', name: '', phone: '' });
        } else if (user?.addresses?.length) {
            const firstAddress = user.addresses[0];
            setShippingInfo(firstAddress);
            setSelectedSavedAddressId(firstAddress.id);
        }
        
        setMessage(null);
    }, [user]);

    // Hiển thị thông báo đang tải
    if (!isLoggedIn || !user) {
        return <p className="status-message">Đang kiểm tra trạng thái đăng nhập...</p>;
    }

    if (!cart?.length) {
        return <p className="status-message">Đang kiểm tra giỏ hàng...</p>;
    }

    // Xác định nút đặt hàng có bị vô hiệu hóa không
    const isOrderButtonDisabled = !shippingInfo.address || 
                                !shippingInfo.name || 
                                !shippingInfo.phone || 
                                !isLoggedIn || 
                                !cart?.length;

    return (
        <div className="checkout-container">
            <h1 className="page-title">Thanh toán</h1>

            {/* Hiển thị thông báo */}
            {message && (
                <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {/* Phần Tóm tắt đơn hàng */}
            <div className="order-summary-section">
                <h2>📋 Thông tin đơn hàng</h2>
                {cart?.length > 0 ? (
                    <>
                        <ul className="checkout-cart-items-list">
                            {cart.map((item, index) => (
                                <li key={item.id || index} className="checkout-cart-item">
                                    <span className="item-name">{item.name || 'Sản phẩm không rõ'}</span>
                                    <span className="item-quantity">x {item.quantity || 0}</span>
                                    <span className="item-price">
                                        {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="checkout-total-price">
                            <strong>Tổng tiền:</strong> {cartTotal.toLocaleString("vi-VN")} VNĐ
                        </p>
                    </>
                ) : (
                    <p>Giỏ hàng trống.</p>
                )}
            </div>

            {/* Phần Thông tin giao hàng */}
            <div className="shipping-info-section">
                <h2>🚚 Thông tin giao hàng</h2>

                {/* Hiển thị địa chỉ đã lưu */}
                {isLoggedIn && user?.addresses?.length > 0 && (
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
                            onClick={() => toggleAddressForm(true)}
                        >
                            Nhập địa chỉ mới
                        </button>
                        <hr />
                    </div>
                )}

                {/* Form nhập địa chỉ thủ công */}
                {(showManualAddressForm || (user?.addresses?.length === 0 && isLoggedIn)) ? (
                    <form className="manual-address-entry" onSubmit={handlePlaceOrder}>
                        <h3>Nhập địa chỉ mới:</h3>
                        
                        {user?.addresses?.length > 0 && (
                            <button
                                type="button"
                                className="toggle-address-form-button"
                                onClick={() => toggleAddressForm(false)}
                            >
                                ← Quay lại chọn địa chỉ đã lưu
                            </button>
                        )}
                        
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
                        
                        <button
                            type="submit"
                            className="place-order-button"
                            disabled={isOrderButtonDisabled}
                        >
                            ✅ Đặt hàng
                        </button>
                    </form>
                ) : (
                    isLoggedIn && user?.addresses?.length > 0 && (
                        <button
                            className="place-order-button"
                            onClick={handlePlaceOrder}
                            disabled={isOrderButtonDisabled}
                        >
                            ✅ Đặt hàng
                        </button>
                    )
                )}

                {/* Xem trước thông tin giao hàng */}
                <div className="final-shipping-preview">
                    <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
                    {shippingInfo.address && shippingInfo.name && shippingInfo.phone ? (
                        <p className="shipping-details">
                            <strong>{shippingInfo.name}</strong> - {shippingInfo.phone} <br/>
                            {shippingInfo.address}
                        </p>
                    ) : (
                        <p className="shipping-placeholder">Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;