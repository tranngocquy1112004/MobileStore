// src/pages/CartPage.js

import React, { useContext, useCallback, useMemo } from 'react'; // Import hooks, thêm useMemo
import { Link, useNavigate } from 'react-router-dom'; // Import navigation components

// Import Contexts
import { CartContext } from './CartContext'; // Cart context
import { AuthContext } from '../account/AuthContext'; // Auth context

// Import CSS
import './CartPage.css';

// --- CartPage Component: Hiển thị và quản lý giỏ hàng của người dùng ---
const CartPage = () => {
    // --- Sử dụng Contexts ---
    // Lấy dữ liệu giỏ hàng và các hành động từ CartContext
    const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
    // Lấy trạng thái đăng nhập từ AuthContext
    const { isLoggedIn } = useContext(AuthContext);

    // --- Hook điều hướng ---
    const navigate = useNavigate();

    // --- Tính toán tổng tiền của các sản phẩm trong giỏ hàng sử dụng useMemo ---
    // useMemo giúp tránh tính toán lại tổng tiền mỗi khi component render lại nếu giỏ hàng không thay đổi
    const cartTotal = useMemo(() => {
        // Đảm bảo cart là một mảng trước khi reduce
        const safeCart = Array.isArray(cart) ? cart : [];
        // Tính tổng một cách an toàn, xử lý các trường hợp thiếu price/quantity
        return safeCart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
    }, [cart]); // Dependency: cart (tính toán lại khi cart thay đổi)


    // --- Handler khi người dùng click nút "Tiến hành Thanh toán" ---
    // Sử dụng useCallback để hàm này không bị tạo lại không cần thiết
    const handleProceedToCheckout = useCallback(() => {
        // --- Kiểm tra dữ liệu (Validation) ---
        // 1. Kiểm tra giỏ hàng có rỗng không
        if (!cart || cart.length === 0) {
            // Sử dụng alert tạm thời, có thể thay bằng thông báo trong UI
            alert("Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
            // navigate('/home'); // Tùy chọn: chuyển hướng về trang sản phẩm
            return; // Dừng nếu giỏ hàng rỗng
        }
        // 2. Kiểm tra người dùng đã đăng nhập chưa
        if (!isLoggedIn) {
             // Sử dụng alert tạm thời, có thể thay bằng thông báo trong UI
             alert("Vui lòng đăng nhập để tiến hành thanh toán.");
             navigate('/'); // Chuyển hướng về trang đăng nhập/đăng ký
             return; // Dừng nếu chưa đăng nhập
        }
        // 3. Nếu hợp lệ, chuyển hướng đến trang thanh toán
        navigate('/checkout'); // Điều hướng đến route checkout
    }, [cart, isLoggedIn, navigate]); // Dependencies: cart, isLoggedIn, navigate

    // --- Render UI Trang Giỏ hàng ---
    return (
        <div className="cart-container"> {/* Container chính */}
            <h1 className="page-title">Giỏ hàng của bạn</h1> {/* Tiêu đề trang */}

            {/* Render có điều kiện: Kiểm tra nếu giỏ hàng rỗng */}
             {(!cart || cart.length === 0) ? (
                 // Nếu giỏ hàng rỗng, hiển thị thông báo và link quay lại cửa hàng
                 <div className="empty-cart-message">
                     <p>Giỏ hàng của bạn đang trống.</p>
                     <Link to="/home" className="back-to-home">Quay lại cửa hàng</Link>
                 </div>
             ) : (
                 // Nếu giỏ hàng có sản phẩm, hiển thị danh sách và tóm tắt
                 <> {/* Fragment để nhóm các phần tử */}
                     <ul className="cart-items-list"> {/* Danh sách các sản phẩm trong giỏ hàng */}
                         {/* Đảm bảo cart là một mảng trước khi map */}
                         {Array.isArray(cart) && cart.map((item, index) => (
                              // Mỗi sản phẩm là một mục trong danh sách
                              // Sử dụng item.id làm key, fallback về index nếu ID thiếu (ít lý tưởng hơn nhưng an toàn)
                             <li key={item.id || index} className="cart-item">
                                  {/* Thêm optional chaining để an toàn khi truy cập thuộc tính */}
                                 <img src={item?.image} alt={item?.name || 'Sản phẩm'} className="item-image"/>
                                  <div className="item-details"> {/* Container chi tiết sản phẩm */}
                                     <span className="item-name">{item?.name || 'Sản phẩm không rõ'}</span> {/* Tên sản phẩm */}
                                      {/* Giá của một sản phẩm, đã định dạng */}
                                      {/* Thêm optional chaining và giá trị mặc định 0 */}
                                     <span className="item-price">{(item?.price || 0).toLocaleString('vi-VN')} VNĐ</span>
                                      {/* Điều khiển số lượng và hiển thị */}
                                      <div className="quantity-control">
                                          {/* Nút giảm số lượng */}
                                           {/* Thêm optional chaining cho kiểm tra item.quantity */}
                                          <button onClick={() => updateQuantity(item?.id, (item?.quantity || 0) - 1)} disabled={(item?.quantity || 0) <= 1}>-</button>
                                          {/* Số lượng hiện tại */}
                                         <span>{item?.quantity || 0}</span>
                                          {/* Nút tăng số lượng */}
                                           {/* Thêm optional chaining cho kiểm tra item.quantity */}
                                          <button onClick={() => updateQuantity(item?.id, (item?.quantity || 0) + 1)}>+</button>
                                      </div>
                                       {/* Tổng tiền cho sản phẩm này */}
                                       {/* Thêm optional chaining và giá trị mặc định 0 */}
                                     <span className="item-subtotal">Tổng: {((item?.price || 0) * (item?.quantity || 0)).toLocaleString('vi-VN')} VNĐ</span>
                                  </div>
                                   {/* Nút xóa sản phẩm */}
                                   {/* Đảm bảo item.id tồn tại trước khi gọi removeFromCart */}
                                  {item?.id && (
                                       <button onClick={() => removeFromCart(item.id)} className="remove-item-button">Xóa</button>
                                   )}
                               </li>
                           ))}
                       </ul>

                        {/* --- Tóm tắt giỏ hàng và Nút Thanh toán --- */}
                        <div className="cart-summary">
                             {/* Hiển thị tổng tiền */}
                            <p className="total-price">
                                <strong>Tổng cộng:</strong> {cartTotal.toLocaleString('vi-VN')} VNĐ {/* Sử dụng giá trị đã tính bằng useMemo */}
                            </p>

                             {/* NÚT THANH TOÁN */}
                             {/* Disabled nếu giỏ hàng rỗng hoặc người dùng chưa đăng nhập */}
                            <button
                                className="proceed-to-checkout-button"
                                onClick={handleProceedToCheckout}
                                disabled={cart.length === 0 || !isLoggedIn}
                            >
                                Tiến hành Thanh toán
                            </button>
                             {/* Hiển thị thông báo yêu cầu đăng nhập nếu chưa đăng nhập */}
                             {!isLoggedIn && (
                                  <p className="login-required-message">Vui lòng đăng nhập để thanh toán.</p>
                              )}
                        </div>
                    </>
                )}

            {/* Các phần khác như gợi ý sản phẩm, mã giảm giá có thể thêm vào đây */}
        </div>
    );
};

export default CartPage;
