// src/pages/CheckoutPage.js

import React, { useState, useContext, useEffect, useCallback } from 'react';
// Import các hook cần thiết
import { useNavigate } from 'react-router-dom'; // Để điều hướng sau khi đặt hàng

// Import Contexts
import { AuthContext } from '../account/AuthContext'; // Lấy thông tin người dùng và địa chỉ đã lưu
import { CartContext } from '../pages/CartContext'; // Lấy thông tin giỏ hàng và hàm xóa giỏ hàng

// Import CSS
import './CheckoutPage.css';

// Định nghĩa key cho đơn hàng trong localStorage
const LOCAL_STORAGE_ORDERS_KEY = "orders"; // Đảm bảo key này khớp với OrderHistory và AdminDashboard

const CheckoutPage = () => {
    // Lấy thông tin người dùng và trạng thái đăng nhập từ AuthContext
    const { user, isLoggedIn } = useContext(AuthContext);
    // Lấy thông tin giỏ hàng và hàm xóa giỏ hàng từ CartContext
    const { cart, clearCart } = useContext(CartContext); // Giả định CartContext có hàm clearCart

    // Sử dụng hook useNavigate để điều hướng
    const navigate = useNavigate();

    // --- State quản lý thông tin địa chỉ giao hàng ---
    // State để lưu địa chỉ giao hàng cuối cùng được chọn/nhập sẽ dùng cho đơn hàng
    const [shippingInfo, setShippingInfo] = useState({ address: '', name: '', phone: '' });

    // State để lưu ID của địa chỉ đã lưu được chọn (nếu người dùng chọn địa chỉ đã lưu)
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);

    // State để điều khiển việc hiển thị form nhập địa chỉ mới
    const [showManualAddressForm, setShowManualAddressForm] = useState(false);

    // --- Effect để tải địa chỉ đã lưu và chọn mặc định (nếu có) khi component mount ---
    useEffect(() => {
        // Chuyển hướng về trang chủ hoặc trang đăng nhập nếu chưa đăng nhập
        if (!isLoggedIn || !user) {
             console.log("Người dùng chưa đăng nhập, chuyển hướng về trang đăng nhập.");
             navigate("/");
             return; // Dừng effect ở đây
        }

         // Nếu giỏ hàng rỗng, chuyển hướng về trang giỏ hàng hoặc trang sản phẩm
        if (!cart || cart.length === 0) {
             console.log("Giỏ hàng rỗng, chuyển hướng về trang giỏ hàng.");
             navigate("/cart"); // Hoặc navigate("/home")
             return; // Dừng effect ở đây
        }


        // Nếu người dùng đã đăng nhập và có địa chỉ đã lưu
        if (user.addresses && user.addresses.length > 0) {
            // Tự động chọn địa chỉ đầu tiên đã lưu làm mặc định
            setShippingInfo(user.addresses[0]);
            setSelectedSavedAddressId(user.addresses[0].id);
            setShowManualAddressForm(false); // Ẩn form nhập mới
        } else {
            // Nếu không có địa chỉ đã lưu, hiển thị form nhập mới
            setShowManualAddressForm(true);
            setShippingInfo({ address: '', name: '', phone: '' }); // Reset shippingInfo
            setSelectedSavedAddressId(null);
        }
    }, [user, isLoggedIn, cart, navigate]); // Dependencies: user, isLoggedIn, cart, và navigate

    // --- Handlers cho phần chọn và nhập địa chỉ ---

    // Handler khi người dùng chọn một địa chỉ đã lưu (Radio button onChange)
    const handleSelectSavedAddress = useCallback((addressId) => {
        // Tìm địa chỉ được chọn trong danh sách addresses của user
        const selectedAddr = user?.addresses?.find(addr => addr.id === addressId);
        if (selectedAddr) {
            // Cập nhật state shippingInfo với thông tin địa chỉ đã chọn
            setShippingInfo(selectedAddr);
            // Cập nhật state ID địa chỉ đã chọn
            setSelectedSavedAddressId(addressId);
            // Ẩn form nhập địa chỉ mới
            setShowManualAddressForm(false);
        }
    }, [user]); // Dependency: user context

     // Handler khi người dùng nhập thông tin vào form địa chỉ mới (Input onChange)
    const handleManualAddressChange = useCallback((e) => {
        const { name, value } = e.target;
        // Cập nhật state shippingInfo với thông tin nhập từ form mới
        setShippingInfo(prev => ({ ...prev, [name]: value }));
        // Bỏ chọn địa chỉ đã lưu (nếu đang chọn)
        setSelectedSavedAddressId(null);
        // Đảm bảo form nhập thủ công đang hiển thị
        // setShowManualAddressForm(true); // Không cần thiết vì state này được quản lý bởi nút chuyển đổi
    }, []); // Không phụ thuộc vào biến ngoài cần theo dõi

    // --- Hàm xử lý khi người dùng quyết định đặt hàng ---
    const handlePlaceOrder = useCallback(() => {
        // --- Validation trước khi đặt hàng ---
        // Kiểm tra xem thông tin giao hàng cuối cùng đã đủ chưa
        if (!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone) {
            alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
            return; // Dừng nếu thiếu thông tin
        }
        // Kiểm tra giỏ hàng có trống không (trường hợp hiếm xảy ra nhờ effect nhưng vẫn cần kiểm tra)
         if (!cart || cart.length === 0) {
             alert("Giỏ hàng của bạn trống.");
             // Có thể điều hướng về trang giỏ hàng hoặc trang sản phẩm
             navigate('/cart');
             return; // Dừng nếu giỏ hàng trống
         }

         // Kiểm tra người dùng đã đăng nhập chưa (trường hợp hiếm xảy ra nhờ effect)
         if (!isLoggedIn || !user || !user.username) {
             alert("Vui lòng đăng nhập để đặt hàng.");
             navigate('/');
             return;
         }


        // --- Tạo đối tượng đơn hàng ---
        const newOrder = {
            id: Date.now(), // ID đơn hàng đơn giản (có thể dùng logic khác phức tạp hơn trong thực tế)
            username: user.username, // Lưu username của người đặt
            date: new Date().toISOString(), // Lưu ngày giờ đặt hàng theo chuẩn ISO 8601
            items: cart, // Lưu danh sách sản phẩm từ giỏ hàng (bao gồm id, name, price, quantity)
            totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0), // Tính tổng tiền từ giỏ hàng
            shippingInfo: shippingInfo, // Lưu thông tin giao hàng cuối cùng đã chọn/nhập
            status: 'Pending', // Trạng thái đơn hàng ban đầu (ví dụ: Chờ xử lý)
            // Thêm các thông tin khác nếu cần (phương thức thanh toán, ghi chú, v.v.)
        };

        // --- Lưu đơn hàng vào localStorage ---
        let allOrders = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)) || []; // Đọc danh sách đơn hàng hiện có
         if (!Array.isArray(allOrders)) { // Đảm bảo biến đọc được là mảng
             console.warn("Dữ liệu đơn hàng trong localStorage không phải là mảng, đặt lại.");
             localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY); // Xóa dữ liệu lỗi
             allOrders = []; // Khởi tạo mảng rỗng
         }

        allOrders.push(newOrder); // Thêm đơn hàng mới vào danh sách
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(allOrders)); // Lưu lại toàn bộ danh sách đã cập nhật

        // --- Xóa giỏ hàng sau khi đặt hàng ---
        clearCart(); // Gọi hàm xóa giỏ hàng từ CartContext (giả định CartContext có hàm này)

        // --- Thông báo đặt hàng thành công và điều hướng ---
        alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        console.log("Đã đặt hàng thành công:", newOrder);

        // Điều hướng người dùng đến trang lịch sử đơn hàng hoặc trang xác nhận
        navigate('/orders'); // Điều hướng đến trang lịch sử đơn hàng

    }, [shippingInfo, cart, isLoggedIn, user, clearCart, navigate]); // Dependencies: shippingInfo, cart, isLoggedIn, user, clearCart, navigate


     // Hiển thị loading hoặc redirect nếu cần thiết
     if (!isLoggedIn || !user) {
         return <p>Đang kiểm tra trạng thái đăng nhập...</p>; // Hoặc render null, redirect đã có trong useEffect
     }

     if (!cart || cart.length === 0) {
          return <p>Đang kiểm tra giỏ hàng...</p>; // Hoặc render null, redirect đã có trong useEffect
     }


    return (
        <div className="checkout-container"> {/* Container chính của trang thanh toán */}
            <h1 className="page-title">Thanh toán</h1>

            {/* --- Phần hiển thị giỏ hàng --- */}
            <div className="order-summary-section">
                <h2>📋 Thông tin đơn hàng</h2>
                {/* Kiểm tra giỏ hàng không rỗng trước khi hiển thị (đã kiểm tra ở useEffect, nhưng thêm kiểm tra ở đây để an toàn) */}
                 {cart && cart.length > 0 ? (
                     <>
                         <ul className="checkout-cart-items-list">
                             {cart.map(item => (
                                  <li key={item.id} className="checkout-cart-item">
                                      <span className="item-name">{item.name}</span>
                                      <span className="item-quantity">x {item.quantity}</span>
                                      <span className="item-price">{(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ</span>
                                  </li>
                              ))}
                         </ul>
                         <p className="checkout-total-price">
                             <strong>Tổng tiền:</strong> {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("vi-VN")} VNĐ
                         </p>
                     </>
                 ) : (
                      <p>Giỏ hàng trống.</p> // Trường hợp này hiếm xảy ra nhờ useEffect redirect
                 )}
            </div>


            {/* --- Phần chọn địa chỉ giao hàng --- */}
            <div className="shipping-info-section">
                <h2>🚚 Thông tin giao hàng</h2>

                {/* Hiển thị địa chỉ đã lưu nếu người dùng đã đăng nhập và có địa chỉ */}
                {isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                    <div className="saved-addresses-selection">
                        <h3>Chọn địa chỉ đã lưu:</h3>
                        <ul className="address-options-list"> {/* Danh sách các tùy chọn địa chỉ */}
                            {user.addresses.map(addr => (
                                <li key={addr.id}> {/* Sử dụng id địa chỉ làm key */}
                                    <input
                                        type="radio" // Radio button cho phép chọn 1 trong nhiều
                                        id={`saved-address-${addr.id}`} // ID duy nhất cho input
                                        name="shippingAddressOption" // Cùng name cho tất cả radio trong nhóm
                                        checked={selectedSavedAddressId === addr.id} // Checked nếu ID khớp với state selectedSavedAddressId
                                        onChange={() => handleSelectSavedAddress(addr.id)} // Khi thay đổi, gọi handler với ID địa chỉ
                                    />
                                    {/* Label liên kết với input (tăng khả năng tiếp cận), hiển thị thông tin địa chỉ */}
                                    <label htmlFor={`saved-address-${addr.id}`} className="address-option-label">
                                        <strong>{addr.name}</strong> - {addr.phone} - {addr.address}
                                    </label>
                                </li>
                            ))}
                        </ul>
                        {/* Nút để chuyển sang chế độ nhập địa chỉ mới */}
                        <button
                            className="toggle-address-form-button"
                            onClick={() => { setShowManualAddressForm(true); setSelectedSavedAddressId(null); }} // Khi click, hiển thị form nhập mới và bỏ chọn địa chỉ lưu
                        >
                           Nhập địa chỉ mới
                        </button>
                         <hr /> {/* Đường phân cách trực quan */}
                    </div>
                )}


                {/* Hiển thị form nhập địa chỉ mới:
                    - Khi showManualAddressForm là true (người dùng click "Nhập địa chỉ mới")
                    - HOẶC khi không có địa chỉ đã lưu nhưng người dùng đã đăng nhập
                */}
                {showManualAddressForm || (user?.addresses?.length === 0 && isLoggedIn) ? (
                     <div className="manual-address-entry">
                         <h3>Nhập địa chỉ mới:</h3>
                         {/* Nếu có địa chỉ đã lưu, thêm nút để quay lại chọn địa chỉ lưu */}
                         {user?.addresses && user.addresses.length > 0 && (
                             <button
                                className="toggle-address-form-button"
                                onClick={() => { setShowManualAddressForm(false); /* Optional: re-select first saved address */ }} // Khi click, ẩn form nhập mới
                             >
                                 ← Quay lại chọn địa chỉ đã lưu
                             </button>
                         )}
                         {/* Form nhập liệu địa chỉ mới */}
                         {/* Không cần thẻ <form> riêng vì nút "Đặt hàng" ở dưới sẽ submit toàn bộ */}
                         <div className="form-group">
                             <label htmlFor="manual-address-input">Địa chỉ:</label>
                             <input
                                 type="text"
                                 id="manual-address-input"
                                 name="address" // Name khớp với key trong shippingInfo
                                 placeholder="Nhập địa chỉ chi tiết"
                                 value={shippingInfo.address} // Value được bind với state shippingInfo
                                 onChange={handleManualAddressChange} // Handler cập nhật shippingInfo
                                 required // Yêu cầu nhập
                                 />
                         </div>
                          <div className="form-group">
                             <label htmlFor="manual-name-input">Người nhận:</label>
                             <input
                                 type="text"
                                 id="manual-name-input"
                                 name="name" // Name khớp với key trong shippingInfo
                                 placeholder="Tên người nhận"
                                 value={shippingInfo.name} // Value được bind với state shippingInfo
                                 onChange={handleManualAddressChange}
                                 required
                                 />
                         </div>
                          <div className="form-group">
                             <label htmlFor="manual-phone-input">Điện thoại:</label>
                             <input
                                 type="tel" // type="tel" gợi ý bàn phím số trên mobile
                                 id="manual-phone-input"
                                 name="phone" // Name khớp với key trong shippingInfo
                                 placeholder="Số điện thoại liên hệ"
                                 value={shippingInfo.phone} // Value được bind với state shippingInfo
                                 onChange={handleManualAddressChange}
                                 required
                                 />
                         </div>
                          {/* Có thể thêm nút "Lưu địa chỉ này vào hồ sơ" tại đây nếu muốn người dùng lưu địa chỉ mới ngay lúc checkout */}
                         {/* <button onClick={handleSaveManualAddressToProfile}>Lưu địa chỉ này vào hồ sơ</button> */}
                     </div>
                ) : null}


                {/* --- Hiển thị địa chỉ giao hàng cuối cùng sẽ được sử dụng --- */}
                {/* Phần này hiển thị thông tin địa chỉ hiện đang được chọn hoặc nhập để xác nhận */}
                <div className="final-shipping-preview">
                     <h3>Địa chỉ sẽ dùng để giao hàng:</h3>
                     {/* Kiểm tra state shippingInfo để hiển thị thông tin, chỉ hiển thị khi có đủ 3 trường */}
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


            {/* --- Nút Đặt hàng --- */}
            {/* Nút này chỉ khả dụng khi đã đăng nhập, giỏ hàng không trống và thông tin giao hàng đã đầy đủ */}
            <button
                className="place-order-button"
                onClick={handlePlaceOrder} // Gắn handler xử lý đặt hàng
                // Disabled nếu thiếu thông tin cần thiết
                disabled={!shippingInfo.address || !shippingInfo.name || !shippingInfo.phone || !isLoggedIn || !cart || cart.length === 0}
            >
                ✅ Đặt hàng
            </button>

             {/* Có thể thêm các phần khác tại đây: tổng tiền cuối cùng (lặp lại), phương thức thanh toán, ghi chú... */}

        </div> // End checkout-container
    );
};

export default CheckoutPage; // Export component Thanh toán