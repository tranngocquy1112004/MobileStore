// src/pages/CheckoutPage.js

import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react'; // Thêm useMemo
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../account/AuthContext';
import { CartContext } from '../pages/CartContext'; // Đảm bảo path đúng

import './CheckoutPage.css';

// Hằng số key cho đơn hàng trong localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders";

const CheckoutPage = () => {
    // Lấy thông tin người dùng và trạng thái đăng nhập từ AuthContext
    const { user, isLoggedIn } = useContext(AuthContext);
    // Lấy thông tin giỏ hàng và hàm clearCart từ CartContext
    const { cart, clearCart } = useContext(CartContext);

    // Hook điều hướng
    const navigate = useNavigate();

    // --- Quản lý State cho thông tin giao hàng ---
    // Lưu trữ chi tiết thông tin giao hàng cuối cùng sẽ dùng cho đơn hàng
    const [shippingInfo, setShippingInfo] = useState({ address: '', name: '', phone: '' });

    // Lưu trữ ID của địa chỉ đã lưu được chọn (nếu có)
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);

    // Kiểm soát hiển thị form nhập địa chỉ thủ công
    const [showManualAddressForm, setShowManualAddressForm] = useState(false);

    // State cho thông báo lỗi hoặc thành công
    const [message, setMessage] = useState(null);


    // --- Hook Effect để xử lý thiết lập ban đầu và chuyển hướng ---
    useEffect(() => {
        // Chuyển hướng nếu chưa đăng nhập
        if (!isLoggedIn || !user) {
            console.log("Người dùng chưa đăng nhập, chuyển hướng về trang đăng nhập.");
            navigate("/");
            return; // Dừng thực thi effect
        }

        // Chuyển hướng nếu giỏ hàng rỗng
        if (!cart || cart.length === 0) {
            console.log("Giỏ hàng rỗng, chuyển hướng về trang giỏ hàng.");
            navigate("/cart");
            return; // Dừng thực thi effect
        }

        // Nếu người dùng đã đăng nhập và có địa chỉ đã lưu
        if (user.addresses && user.addresses.length > 0) {
            // Tự động chọn địa chỉ đã lưu đầu tiên
            const firstAddress = user.addresses[0];
            setShippingInfo(firstAddress);
            setSelectedSavedAddressId(firstAddress.id);
            setShowManualAddressForm(false); // Ẩn form nhập thủ công
        } else {
            // Nếu không có địa chỉ đã lưu, hiển thị form nhập thủ công
            setShowManualAddressForm(true);
            setShippingInfo({ address: '', name: '', phone: '' }); // Đảm bảo shippingInfo được reset
            setSelectedSavedAddressId(null); // Đảm bảo không có địa chỉ đã lưu nào được chọn
        }
    }, [user, isLoggedIn, cart, navigate]); // Dependencies: user, isLoggedIn, cart, navigate

    // --- Handlers cho việc chọn và nhập địa chỉ ---

    // Handler khi người dùng chọn một radio button địa chỉ đã lưu
    const handleSelectSavedAddress = useCallback((addressId) => {
        // Tìm địa chỉ được chọn trong danh sách địa chỉ đã lưu của người dùng
        const selectedAddr = user?.addresses?.find(addr => addr.id === addressId);
        if (selectedAddr) {
            setShippingInfo(selectedAddr); // Cập nhật state shippingInfo
            setSelectedSavedAddressId(addressId); // Cập nhật state ID được chọn
            setShowManualAddressForm(false); // Ẩn form nhập thủ công
            setMessage(null); // Xóa thông báo
        }
    }, [user]); // Dependency: user context

    // Handler khi người dùng nhập liệu vào các input của form địa chỉ thủ công
    const handleManualAddressChange = useCallback((e) => {
        const { name, value } = e.target;
        // Sử dụng functional update để cập nhật state dựa trên giá trị trước đó
        setShippingInfo(prev => ({ ...prev, [name]: value }));
        setSelectedSavedAddressId(null); // Bỏ chọn bất kỳ địa chỉ đã lưu nào
        setMessage(null); // Xóa thông báo
        // Trạng thái showManualAddressForm được quản lý bởi nút toggle, không phải ở đây
    }, []); // setShippingInfo và setSelectedSavedAddressId là stable

    // --- Helper function để đọc đơn hàng từ localStorage ---
    const readOrdersFromStorage = useCallback(() => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        if (!storedData) {
            return [];
        }
        try {
            const orders = JSON.parse(storedData);
            // Đảm bảo dữ liệu là mảng, nếu không thì trả về mảng rỗng
            return Array.isArray(orders) ? orders : [];
        } catch (parseError) {
            console.error("Lỗi khi phân tích dữ liệu đơn hàng từ localStorage:", parseError);
            setMessage("Lỗi hệ thống khi đọc dữ liệu đơn hàng."); // Thông báo lỗi parse
            return []; // Trả về mảng rỗng nếu parse lỗi
        }
    }, []); // Không có dependencies

    // --- Helper function để lưu đơn hàng vào localStorage ---
    const saveOrdersToStorage = useCallback((ordersToSave) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(ordersToSave));
            return true; // Lưu thành công
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu đơn hàng vào localStorage:", error);
            setMessage("Lỗi hệ thống khi lưu dữ liệu đơn hàng."); // Thông báo lỗi lưu
            return false; // Lưu thất bại
        }
    }, []); // Không có dependencies


    // --- Handler cho việc đặt hàng ---
    // Sử dụng useCallback để hàm không bị tạo lại không cần thiết
    const handlePlaceOrder = useCallback((e) => {
        // Ngăn chặn hành vi submit form mặc định nếu được gắn vào form
        if (e) e.preventDefault();

        // --- Kiểm tra dữ liệu (Validation) ---
        // Kiểm tra thông tin giao hàng đã đầy đủ chưa
        if (!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone) {
            setMessage("Vui lòng nhập đầy đủ thông tin giao hàng.");
            return; // Dừng nếu thiếu thông tin
        }
        // Kiểm tra giỏ hàng có rỗng không (nên được ngăn chặn bởi useEffect, nhưng kiểm tra lại cho an toàn)
        if (!cart || cart.length === 0) {
            setMessage("Giỏ hàng của bạn trống.");
            navigate('/cart'); // Chuyển hướng về trang giỏ hàng
            return;
        }
        // Kiểm tra người dùng đã đăng nhập chưa (nên được ngăn chặn bởi useEffect)
        if (!isLoggedIn || !user || !user.username) {
            setMessage("Vui lòng đăng nhập để đặt hàng.");
            navigate('/'); // Chuyển hướng về trang chủ/đăng nhập
            return;
        }

        // --- Tạo đối tượng đơn hàng ---
        const newOrder = {
            id: Date.now(), // Tạo ID đơn giản (xem xét sử dụng uuid cho ứng dụng phức tạp hơn)
            username: user.username, // Lưu username
            date: new Date().toISOString(), // Lưu ngày/giờ đặt hàng theo chuẩn ISO
            items: cart.map(item => ({ // Tạo bản sao của item trong giỏ hàng, đảm bảo dữ liệu an toàn
                id: item.id,
                name: item.name || 'Sản phẩm không rõ',
                price: item.price || 0,
                quantity: item.quantity || 0,
            })),
            // Tính tổng tiền một cách an toàn
            totalPrice: cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
            shippingInfo: { // Tạo bản sao của shippingInfo
                address: shippingInfo.address,
                name: shippingInfo.name,
                phone: shippingInfo.phone,
            },
            status: 'Pending', // Trạng thái ban đầu
            // Thêm các trường khác như phương thức thanh toán, ghi chú, v.v. nếu cần
        };

        // --- Lưu đơn hàng vào localStorage ---
        const allOrders = readOrdersFromStorage(); // Sử dụng helper để đọc
        if (allOrders === null) { // readOrdersFromStorage trả về null nếu có lỗi parse nghiêm trọng
             setMessage("Lỗi hệ thống khi đọc dữ liệu đơn hàng.");
             return;
        }


        allOrders.push(newOrder); // Thêm đơn hàng mới

        // Sử dụng helper để lưu
        if (!saveOrdersToStorage(allOrders)) {
             // Thông báo lỗi đã được xử lý trong saveOrdersToStorage
             return;
        }

        // --- Xóa giỏ hàng sau khi đặt hàng thành công ---
        clearCart();

        // --- Thông báo thành công và điều hướng ---
        // Thay thế alert bằng cách cập nhật state message
        setMessage("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        console.log("Đã đặt hàng thành công:", newOrder);

        // Điều hướng đến trang lịch sử đơn hàng sau một khoảng trễ ngắn để người dùng thấy thông báo
        setTimeout(() => {
             navigate('/orders');
        }, 1500); // Trễ 1.5 giây

    }, [shippingInfo, cart, isLoggedIn, user, clearCart, navigate, readOrdersFromStorage, saveOrdersToStorage, setMessage]); // Dependencies: shippingInfo, cart, isLoggedIn, user, clearCart, navigate, và các helper functions, setMessage

    // --- Tính toán tổng tiền giỏ hàng sử dụng useMemo ---
    const cartTotal = useMemo(() => {
        // Đảm bảo cart là mảng trước khi reduce
        return Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) : 0;
    }, [cart]); // Tính toán lại khi cart thay đổi


    // --- Render UI ---

    // Hiển thị trạng thái loading hoặc chuyển hướng (chủ yếu được xử lý bởi useEffect)
    // Các thông báo này cung cấp phản hồi tức thì trong quá trình kiểm tra ngắn trước khi chuyển hướng
    if (!isLoggedIn || !user) {
        return <p className="status-message">Đang kiểm tra trạng thái đăng nhập...</p>;
    }

    if (!cart || cart.length === 0) {
         return <p className="status-message">Đang kiểm tra giỏ hàng...</p>;
    }


    return (
        <div className="checkout-container"> {/* Container chính */}
            <h1 className="page-title">Thanh toán</h1>

            {/* Hiển thị thông báo */}
            {message && (
                <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {/* --- Phần Tóm tắt đơn hàng --- */}
            <div className="order-summary-section">
                <h2>📋 Thông tin đơn hàng</h2>
                {/* Đảm bảo cart không rỗng trước khi render (dư thừa do useEffect, nhưng an toàn) */}
                {cart && cart.length > 0 ? (
                    <>
                        <ul className="checkout-cart-items-list">
                            {/* Đảm bảo cart là mảng trước khi map */}
                            {Array.isArray(cart) && cart.map((item, index) => (
                                 // Sử dụng item.id làm key, fallback về index nếu thiếu id (ít lý tưởng hơn)
                                <li key={item.id || index} className="checkout-cart-item">
                                    <span className="item-name">{item.name || 'Sản phẩm không rõ'}</span>
                                    <span className="item-quantity">x {item.quantity || 0}</span>
                                    {/* Định dạng giá tiền một cách an toàn */}
                                    <span className="item-price">
                                        {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VNĐ
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="checkout-total-price">
                            <strong>Tổng tiền:</strong> {cartTotal.toLocaleString("vi-VN")} VNĐ {/* Sử dụng giá trị đã tính bằng useMemo */}
                        </p>
                    </>
                ) : (
                    <p>Giỏ hàng trống.</p>
                )}
            </div>

            {/* --- Phần Thông tin giao hàng --- */}
            <div className="shipping-info-section">
                <h2>🚚 Thông tin giao hàng</h2>

                {/* Hiển thị lựa chọn địa chỉ đã lưu nếu người dùng có địa chỉ đã lưu */}
                {isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                    <div className="saved-addresses-selection">
                        <h3>Chọn địa chỉ đã lưu:</h3>
                        <ul className="address-options-list">
                            {user.addresses.map(addr => (
                                <li key={addr.id}> {/* Sử dụng addr.id làm key */}
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
                            onClick={() => {
                                setShowManualAddressForm(true);
                                setSelectedSavedAddressId(null); // Bỏ chọn địa chỉ đã lưu
                                setShippingInfo({ address: '', name: '', phone: '' }); // Reset form nhập thủ công
                                setMessage(null); // Xóa thông báo
                            }}
                        >
                            Nhập địa chỉ mới
                        </button>
                        <hr />
                    </div>
                )}

                {/* Hiển thị form nhập địa chỉ thủ công */}
                {/* Hiển thị nếu showManualAddressForm là true HOẶC nếu không có địa chỉ đã lưu và người dùng đã đăng nhập */}
                {(showManualAddressForm || (user?.addresses?.length === 0 && isLoggedIn)) ? (
                     // Bọc các input địa chỉ thủ công trong một form
                    <form className="manual-address-entry" onSubmit={handlePlaceOrder}> {/* Gắn handler vào sự kiện submit của form */}
                        <h3>Nhập địa chỉ mới:</h3>
                        {/* Nếu có địa chỉ đã lưu tồn tại, thêm nút để quay lại chọn địa chỉ đã lưu */}
                        {user?.addresses && user.addresses.length > 0 && (
                            <button
                                type="button" // Đặt type="button" để ngăn form submit khi click
                                className="toggle-address-form-button"
                                onClick={() => {
                                    setShowManualAddressForm(false);
                                     // Tùy chọn: chọn lại địa chỉ đã lưu đầu tiên khi quay lại
                                    if (user.addresses.length > 0) {
                                        const firstAddress = user.addresses[0];
                                        setShippingInfo(firstAddress);
                                        setSelectedSavedAddressId(firstAddress.id);
                                    }
                                    setMessage(null); // Xóa thông báo
                                }}
                            >
                                ← Quay lại chọn địa chỉ đã lưu
                            </button>
                        )}
                        {/* Các trường input địa chỉ thủ công */}
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
                        {/* Tùy chọn: nút để lưu địa chỉ mới vào hồ sơ */}
                        {/* <button type="button" onClick={handleSaveManualAddressToProfile}>Lưu địa chỉ này vào hồ sơ</button> */}

                        {/* Nút Đặt hàng giờ nằm TRONG form này */}
                        <button
                             type="submit" // Loại nút là submit
                             className="place-order-button"
                             // Logic disabled vẫn giữ nguyên
                             disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone || !isLoggedIn || !cart || cart.length === 0}
                         >
                             ✅ Đặt hàng
                         </button>
                    </form>
                ) : (
                    // Nếu form nhập thủ công không hiển thị VÀ có địa chỉ đã lưu,
                    // Nút Đặt hàng cần nằm ngoài form
                    isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                         // Nút Đặt hàng khi chọn địa chỉ đã lưu
                        <button
                             className="place-order-button"
                             onClick={handlePlaceOrder} // Gắn handler vào onClick
                             // Logic disabled vẫn giữ nguyên
                             disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone || !isLoggedIn || !cart || cart.length === 0}
                         >
                             ✅ Đặt hàng
                         </button>
                     )
                )}


                {/* --- Xem trước thông tin giao hàng cuối cùng --- */}
                 {/* Phần này hiển thị chi tiết địa chỉ đang được chọn/nhập */}
                 <div className="final-shipping-preview">
                     <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
                      {/* Hiển thị xem trước nếu shippingInfo có đủ các trường */}
                     {shippingInfo.address && shippingInfo.name && shippingInfo.phone ? (
                         <p className="shipping-details">
                             <strong>{shippingInfo.name}</strong> - {shippingInfo.phone} <br/>
                             {shippingInfo.address}
                         </p>
                     ) : (
                         <p className="shipping-placeholder">Vui lòng chọn hoặc nhập địa chỉ giao hàng ở trên.</p>
                     )}
                 </div>


            </div> {/* Kết thúc shipping-info-section */}


            {/* Lưu ý: Các phần về phương thức thanh toán, ghi chú, v.v. có thể đặt ở đây */}

        </div> // Kết thúc checkout-container
    );
};

export default CheckoutPage;
