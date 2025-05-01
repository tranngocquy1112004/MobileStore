// src/pages/CartPage.js

import React, { useContext, useCallback } from 'react'; // Import hooks
import { Link, useNavigate } from 'react-router-dom'; // Import navigation components

// Import Contexts
import { CartContext } from './CartContext'; // Cart context
import { AuthContext } from '../account/AuthContext'; // Auth context

// Import CSS
import './CartPage.css';

// --- CartPage Component: Displays and manages user's shopping cart ---
const CartPage = () => {
    // --- Use Contexts ---
    // Get cart data and actions from CartContext
    const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
    // Get login status from AuthContext
    const { isLoggedIn } = useContext(AuthContext);

    // --- Navigation hook ---
    const navigate = useNavigate();

    // --- Calculate total price of items in the cart ---
    const calculateTotal = () => {
        // Ensure cart is an array before reducing
        const safeCart = Array.isArray(cart) ? cart : [];
        // Calculate sum safely, handling potential missing price/quantity
        return safeCart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
    };

    // --- Handler when user clicks "Proceed to Checkout" button ---
    const handleProceedToCheckout = useCallback(() => {
        // --- Validation ---
        // 1. Check if cart is empty
        if (!cart || cart.length === 0) {
            alert("Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
            // navigate('/home'); // Optional: redirect to product page
            return; // Stop if cart is empty
        }
        // 2. Check if user is logged in
        if (!isLoggedIn) {
             alert("Vui lòng đăng nhập để tiến hành thanh toán.");
             navigate('/'); // Redirect to login/signup page
             return; // Stop if not logged in
        }
        // 3. If valid, proceed to checkout page
        navigate('/checkout'); // Navigate to checkout route
    }, [cart, isLoggedIn, navigate]); // Dependencies

    // --- Render Cart Page UI ---
    return (
        <div className="cart-container"> {/* Main container */}
            <h1 className="page-title">Giỏ hàng của bạn</h1> {/* Page title */}

            {/* Conditional Rendering: Check if cart is empty */}
             {(!cart || cart.length === 0) ? (
                 // If cart is empty, show message and link back to store
                 <div className="empty-cart-message">
                     <p>Giỏ hàng của bạn đang trống.</p>
                     <Link to="/home">Quay lại cửa hàng</Link>
                 </div>
             ) : (
                 // If cart has items, display the list and summary
                 <> {/* Fragment to group elements */}
                     <ul className="cart-items-list"> {/* List of items in cart */}
                         {/* Ensure cart is an array before mapping */}
                         {Array.isArray(cart) && cart.map((item, index) => (
                              // Each product is a list item
                              // Use item.id as key, fallback to index if ID is missing (less ideal but safer)
                              <li key={item.id || index} className="cart-item">
                                  {/* Added optional chaining for safety */}
                                  <img src={item?.image} alt={item?.name || 'Sản phẩm'} className="item-image"/>
                                   <div className="item-details"> {/* Item details container */}
                                       <span className="item-name">{item?.name || 'Sản phẩm không rõ'}</span> {/* Product name */}
                                       {/* Single item price, formatted */}
                                       {/* Added optional chaining and default 0 */}
                                       <span className="item-price">{(item?.price || 0).toLocaleString('vi-VN')} VNĐ</span>
                                       {/* Quantity control and display */}
                                        <div className="quantity-control">
                                            {/* Decrement button */}
                                             {/* Added optional chaining for item.quantity check */}
                                            <button onClick={() => updateQuantity(item.id, (item?.quantity || 0) - 1)} disabled={(item?.quantity || 0) <= 1}>-</button>
                                            {/* Current quantity */}
                                            <span>{item?.quantity || 0}</span>
                                            {/* Increment button */}
                                             {/* Added optional chaining for item.quantity check */}
                                            <button onClick={() => updateQuantity(item.id, (item?.quantity || 0) + 1)}>+</button>
                                        </div>
                                        {/* Subtotal for this item */}
                                         {/* Added optional chaining and default 0 */}
                                        <span className="item-subtotal">Tổng: {((item?.price || 0) * (item?.quantity || 0)).toLocaleString('vi-VN')} VNĐ</span>
                                   </div>
                                   {/* Remove item button */}
                                    {/* Ensure item.id exists before calling removeFromCart */}
                                   {item?.id && (
                                        <button onClick={() => removeFromCart(item.id)} className="remove-item-button">Xóa</button>
                                    )}
                               </li>
                           ))}
                       </ul>

                       {/* --- Cart Summary and Checkout Button --- */}
                        <div className="cart-summary">
                            {/* Display total price */}
                            <p className="total-price">
                                <strong>Tổng cộng:</strong> {calculateTotal().toLocaleString('vi-VN')} VNĐ
                            </p>

                            {/* CHECKOUT BUTTON */}
                            {/* Disabled if cart is empty or user is not logged in */}
                            <button
                                className="proceed-to-checkout-button"
                                onClick={handleProceedToCheckout}
                                disabled={cart.length === 0 || !isLoggedIn}
                            >
                                Tiến hành Thanh toán
                            </button>
                            {/* Display login required message if not logged in */}
                            {!isLoggedIn && (
                                 <p className="login-required-message">Vui lòng đăng nhập để thanh toán.</p>
                            )}
                        </div>
                    </>
                )}

            {/* Other sections like product suggestions, discount codes can be added here */}
        </div>
    );
};

export default CartPage;