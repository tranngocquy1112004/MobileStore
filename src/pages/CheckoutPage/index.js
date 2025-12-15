import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { MESSAGES } from "./constants";
import { useCheckout } from "./useCheckout";
import OrderSummary from "./components/OrderSummary";
import SavedAddressSelector from "./components/SavedAddressSelector";
import ManualAddressForm from "./components/ManualAddressForm";
import ShippingPreview from "./components/ShippingPreview";
import "../../styles/CheckoutPage.css";

const CheckoutPage = () => {
  const { user, isLoggedIn } = React.useContext(AuthContext) || { user: null, isLoggedIn: false };
  const { cart, clearCart } = React.useContext(CartContext) || { cart: [], clearCart: () => {} };
  const navigate = useNavigate();

  const {
    shippingInfo,
    selectedSavedAddressId,
    showManualAddressForm,
    message,
    cartTotal,
    hasValidShippingInfo,
    handleSelectSavedAddress,
    handleManualAddressChange,
    handlePlaceOrder,
    toggleAddressForm,
  } = useCheckout({ user, isLoggedIn, cart, clearCart, navigate });

  if (!isLoggedIn || !user) {
    return (
      <div className="checkout-container">
        <h1 className="page-title">Thanh toán</h1>
        <div className="message error">{MESSAGES.LOGIN_REQUIRED}</div>
        <Link to="/" className="back-to-home">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (!cart?.length) {
    return (
      <div className="checkout-container">
        <h1 className="page-title">Thanh toán</h1>
        <div className="message error">{MESSAGES.EMPTY_CART}</div>
        <Link to="/cart" className="back-to-home">
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="page-title">Thanh toán</h1>
      {message && (
        <div className={`message ${message === MESSAGES.SUCCESS ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <OrderSummary cart={cart} cartTotal={cartTotal} navigate={navigate} />

      <div className="shipping-info-section">
        <h2>📦 Thông tin giao hàng</h2>
        {isLoggedIn && user?.addresses?.length > 0 && (
          <SavedAddressSelector
            addresses={user.addresses}
            selectedAddressId={selectedSavedAddressId}
            onSelect={handleSelectSavedAddress}
            onToggleForm={toggleAddressForm}
          />
        )}
        {(showManualAddressForm || !user?.addresses?.length) && (
          <ManualAddressForm
            shippingInfo={shippingInfo}
            onChange={handleManualAddressChange}
            onSubmit={handlePlaceOrder}
            onToggleForm={toggleAddressForm}
            hasSavedAddresses={user?.addresses?.length > 0}
          />
        )}
        {!showManualAddressForm && user?.addresses?.length > 0 && (
          <button
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={!hasValidShippingInfo}
            aria-label="Xác nhận đặt hàng"
          >
            🛒 Đặt hàng
          </button>
        )}
        <ShippingPreview hasValidShippingInfo={hasValidShippingInfo} shippingInfo={shippingInfo} />
      </div>
    </div>
  );
};

export default CheckoutPage;
