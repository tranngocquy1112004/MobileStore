// src/pages/CartPage.js

import React, { useContext } from 'react'; // Import hook useContext từ React
import { Link, useNavigate } from 'react-router-dom'; // Import Link (nếu cần link) và useNavigate để điều hướng chương trình
// Import Contexts để truy cập trạng thái giỏ hàng và xác thực
import { CartContext } from './CartContext'; // Context giỏ hàng
import { AuthContext } from '../account/AuthContext'; // Context xác thực (để kiểm tra trạng thái đăng nhập cho nút thanh toán)

// Import file CSS để định dạng giao diện trang giỏ hàng
import './CartPage.css';

// --- Component CartPage: Hiển thị nội dung giỏ hàng của người dùng ---
// Component này cho phép người dùng xem lại các sản phẩm đã thêm, chỉnh sửa số lượng, xóa sản phẩm
// và tiến hành thanh toán.
const CartPage = () => {
    // --- Sử dụng Contexts ---
    // Lấy dữ liệu giỏ hàng (mảng các item), hàm xóa sản phẩm (removeFromCart), và hàm cập nhật số lượng (updateQuantity) từ CartContext.
    // Giả định CartContext cung cấp các giá trị và hàm này.
    const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
    // Lấy trạng thái đăng nhập (isLoggedIn) từ AuthContext để kiểm tra điều kiện cho nút thanh toán.
    const { isLoggedIn } = useContext(AuthContext); // Giả định AuthContext cung cấp isLoggedIn

    // --- Sử dụng hook useNavigate để điều hướng ---
    const navigate = useNavigate();

    // --- Hàm tính tổng tiền của tất cả sản phẩm trong giỏ hàng ---
    // Sử dụng phương thức .reduce() trên mảng 'cart' để cộng dồn giá trị của từng item (price * quantity).
    const calculateTotal = () => {
        // Kiểm tra nếu cart là null hoặc undefined (trường hợp CartContext chưa kịp load), mặc định là mảng rỗng để tránh lỗi reduce trên null/undefined.
        return (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

     // --- Handler khi người dùng nhấn nút "Tiến hành Thanh toán" ---
     // Hàm này kiểm tra điều kiện trước khi điều hướng đến trang thanh toán.
     const handleProceedToCheckout = () => {
         // 1. Kiểm tra giỏ hàng có trống không.
         if (!cart || cart.length === 0) {
             alert("Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
             // Có thể điều hướng về trang sản phẩm nếu giỏ hàng trống
             // navigate('/home');
             return; // Dừng hàm nếu giỏ hàng trống
         }
         // 2. Kiểm tra người dùng đã đăng nhập chưa.
         // Điều này quan trọng vì trang thanh toán (/checkout) được bảo vệ và yêu cầu đăng nhập.
         if (!isLoggedIn) {
              alert("Vui lòng đăng nhập để tiến hành thanh toán.");
              navigate('/'); // Điều hướng về trang đăng nhập/đăng ký
              return; // Dừng hàm nếu chưa đăng nhập
         }
         // 3. Nếu giỏ hàng không trống và người dùng đã đăng nhập, tiến hành điều hướng.
         navigate('/checkout'); // Điều hướng đến route /checkout
     };


    // --- Render giao diện của trang giỏ hàng ---
    return (
        <div className="cart-container"> {/* Container chính của trang giỏ hàng */}
            <h1 className="page-title">Giỏ hàng của bạn</h1> {/* Tiêu đề trang */}

            {/* Conditional Rendering: Kiểm tra nếu giỏ hàng trống (cart là null/undefined hoặc mảng rỗng) */}
             {(!cart || cart.length === 0) ? (
                 // Nếu giỏ hàng trống, hiển thị thông báo và link quay lại trang sản phẩm
                 <div className="empty-cart-message">
                     <p>Giỏ hàng của bạn đang trống.</p>
                     <Link to="/home">Quay lại cửa hàng</Link> {/* Link về trang chủ/sản phẩm */}
                 </div>
             ) : (
                 // Nếu giỏ hàng có sản phẩm, hiển thị danh sách sản phẩm và tóm tắt đơn hàng
                 <> {/* Sử dụng Fragment để nhóm các phần tử */}
                     <ul className="cart-items-list"> {/* Danh sách các sản phẩm trong giỏ */}
                         {/* Map qua từng item trong mảng cart để hiển thị thông tin */}
                         {cart.map(item => (
                             // Mỗi sản phẩm là một mục danh sách (li)
                             <li key={item.id} className="cart-item"> {/* key={item.id} là bắt buộc khi render danh sách */}
                                 <img src={item.image} alt={item.name} className="item-image"/> {/* Ảnh sản phẩm */}
                                 <div className="item-details"> {/* Container chi tiết sản phẩm */}
                                     <span className="item-name">{item.name}</span> {/* Tên sản phẩm */}
                                     {/* Giá sản phẩm riêng lẻ, định dạng tiền VNĐ */}
                                     <span className="item-price">{item.price.toLocaleString('vi-VN')} VNĐ</span>
                                      {/* Input và nút điều chỉnh số lượng */}
                                      <div className="quantity-control">
                                          {/* Nút giảm số lượng */}
                                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                          {/* Hiển thị số lượng hiện tại */}
                                          <span>{item.quantity}</span>
                                           {/* Nút tăng số lượng */}
                                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                      </div>
                                       {/* Tổng tiền cho sản phẩm riêng lẻ này */}
                                     <span className="item-subtotal">Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</span>
                                 </div>
                                 {/* Nút xóa sản phẩm khỏi giỏ hàng */}
                                 <button onClick={() => removeFromCart(item.id)} className="remove-item-button">Xóa</button>
                             </li>
                         ))}
                     </ul>

                     {/* --- Tóm tắt đơn hàng và nút thanh toán --- */}
                     <div className="cart-summary">
                         {/* Hiển thị tổng tiền của toàn bộ giỏ hàng */}
                         <p className="total-price">
                            <strong>Tổng cộng:</strong> {calculateTotal().toLocaleString('vi-VN')} VNĐ
                         </p>

                         {/* NÚT "TIẾN HÀNH THANH TOÁN" */}
                         {/* Khi click sẽ gọi hàm handleProceedToCheckout */}
                         {/* Nút bị disabled nếu giỏ hàng trống hoặc người dùng chưa đăng nhập */}
                         <button
                             className="proceed-to-checkout-button" // Class CSS
                             onClick={handleProceedToCheckout}
                             disabled={cart.length === 0 || !isLoggedIn} // Điều kiện disabled
                         >
                             Tiến hành Thanh toán
                         </button>
                         {/* Hiển thị thông báo nhỏ nếu disabled do chưa đăng nhập */}
                          {!isLoggedIn && (
                             <p className="login-required-message">Vui lòng đăng nhập để thanh toán.</p>
                         )}
                     </div>
                 </>
             )}

            {/* Có thể thêm các phần khác như: gợi ý sản phẩm, mã giảm giá,... */}
        </div> // Kết thúc cart-container
    );
};

export default CartPage; // Export component CartPage để sử dụng trong App.js