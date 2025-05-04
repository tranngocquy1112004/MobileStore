import React, { useContext, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from '../account/AuthContext';
import './CartPage.css';

// Hàm tính tổng giỏ hàng
const calculateCartTotal = (cart) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  return safeCart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tối ưu tính toán tổng tiền với useMemo
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  // Xử lý thanh toán với useCallback
  const handleProceedToCheckout = useCallback(() => {
    if (!cart || cart.length === 0) {
      alert("Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để tiến hành thanh toán.");
      navigate('/');
      return;
    }
    navigate('/checkout');
  }, [cart, isLoggedIn, navigate]);

  // Hàm render danh sách sản phẩm
  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return (
        <div className="empty-cart-message">
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link to="/home" className="back-to-home">Quay lại cửa hàng</Link>
        </div>
      );
    }

    return (
      <ul className="cart-items-list">
        {cart.map((item, index) => (
          <li key={item?.id || index} className="cart-item">
            <img src={item?.image} alt={item?.name || 'Sản phẩm'} className="item-image" />
            <div className="item-details">
              <span className="item-name">{item?.name || 'Sản phẩm không rõ'}</span>
              <span className="item-price">{(item?.price || 0).toLocaleString('vi-VN')} VNĐ</span>
              <div className="quantity-control">
                <button
                  onClick={() => updateQuantity(item?.id, (item?.quantity || 0) - 1)}
                  disabled={(item?.quantity || 0) <= 1}
                >
                  -
                </button>
                <span>{item?.quantity || 0}</span>
                <button
                  onClick={() => updateQuantity(item?.id, (item?.quantity || 0) + 1)}
                >
                  +
                </button>
              </div>
              <span className="item-subtotal">
                Tổng: {((item?.price || 0) * (item?.quantity || 0)).toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            {item?.id && (
              <button
                onClick={() => removeFromCart(item.id)}
                className="remove-item-button"
              >
                Xóa
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Hàm render tóm tắt giỏ hàng
  const renderCartSummary = () => (
    <div className="cart-summary">
      <p className="total-price">
        <strong>Tổng cộng:</strong> {cartTotal.toLocaleString('vi-VN')} VNĐ
      </p>
      <button
        className="proceed-to-checkout-button"
        onClick={handleProceedToCheckout}
        disabled={!cart || cart.length === 0 || !isLoggedIn}
      >
        Tiến hành Thanh toán
      </button>
      {!isLoggedIn && (
        <p className="login-required-message">Vui lòng đăng nhập để thanh toán.</p>
      )}
    </div>
  );

  return (
    <div className="cart-container">
      <h1 className="page-title">Giỏ hàng của bạn</h1>
      {renderCartItems()}
      {cart?.length > 0 && renderCartSummary()}
    </div>
  );
};

export default CartPage;