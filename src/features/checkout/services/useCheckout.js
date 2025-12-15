import { useEffect, useMemo, useState } from "react";
import { MESSAGES } from "../models/constants";
import { calculateCartTotal, initializeEmailJS, readOrdersFromStorage, saveOrdersToStorage, sendEmailConfirmation } from "./helpers";

export const useCheckout = ({ user, isLoggedIn, cart, clearCart, navigate }) => {
  const [state, setState] = useState({
    shippingInfo: { address: "", name: "", phone: "" },
    selectedSavedAddressId: null,
    showManualAddressForm: false,
    message: null,
  });

  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);
  const hasValidShippingInfo = state.shippingInfo.address && state.shippingInfo.name && state.shippingInfo.phone;

  useEffect(() => {
    initializeEmailJS();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setState((prev) => ({ ...prev, message: MESSAGES.LOGIN_REQUIRED }));
      return;
    }
    if (!cart?.length) {
      setState((prev) => ({ ...prev, message: MESSAGES.EMPTY_CART }));
      return;
    }
    if (user.addresses?.length) {
      const firstAddress = user.addresses[0];
      setState((prev) => ({
        ...prev,
        shippingInfo: firstAddress,
        selectedSavedAddressId: firstAddress.id,
        showManualAddressForm: false,
      }));
    } else {
      setState((prev) => ({ ...prev, showManualAddressForm: true }));
    }
  }, [user, isLoggedIn, cart]);

  const handleSelectSavedAddress = (addressId) => {
    const selectedAddr = user?.addresses?.find((addr) => addr.id === addressId);
    if (selectedAddr) {
      setState((prev) => ({
        ...prev,
        shippingInfo: selectedAddr,
        selectedSavedAddressId: addressId,
        showManualAddressForm: false,
        message: null,
      }));
    }
  };

  const handleManualAddressChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, [name]: value },
      selectedSavedAddressId: null,
      message: null,
    }));
  };

  const toggleAddressForm = (showForm) => {
    setState((prev) => {
      const newState = { ...prev, showManualAddressForm: showForm, message: null };
      if (showForm) {
        newState.selectedSavedAddressId = null;
        newState.shippingInfo = { address: "", name: "", phone: "" };
      } else if (user?.addresses?.length) {
        const firstAddress = user.addresses[0];
        newState.shippingInfo = firstAddress;
        newState.selectedSavedAddressId = firstAddress.id;
      }
      return newState;
    });
  };

  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault();

    if (!hasValidShippingInfo) {
      setState((prev) => ({ ...prev, message: MESSAGES.INVALID_SHIPPING }));
      return;
    }

    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      setState((prev) => ({ ...prev, message: MESSAGES.INVALID_EMAIL }));
      return;
    }

    const newOrder = {
      id: Date.now(),
      username: user.username,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name || "Sản phẩm không rõ",
        price: item.price || 0,
        quantity: item.quantity || 0,
      })),
      totalPrice: cartTotal,
      shippingInfo: { ...state.shippingInfo },
      status: "Đang xử lý",
    };

    const allOrders = readOrdersFromStorage();
    if (allOrders === null) {
      setState((prev) => ({ ...prev, message: MESSAGES.READ_ERROR }));
      return;
    }

    if (!saveOrdersToStorage([...allOrders, newOrder])) {
      setState((prev) => ({ ...prev, message: MESSAGES.SAVE_ERROR }));
      return;
    }

    sendEmailConfirmation(newOrder, user, (msg) => setState((prev) => ({ ...prev, message: msg })));

    setState((prev) => ({ ...prev, message: MESSAGES.SUCCESS }));
    setTimeout(() => {
      clearCart();
      navigate("/orders");
    }, 3000);
  };

  return {
    shippingInfo: state.shippingInfo,
    selectedSavedAddressId: state.selectedSavedAddressId,
    showManualAddressForm: state.showManualAddressForm,
    message: state.message,
    cartTotal,
    hasValidShippingInfo,
    handleSelectSavedAddress,
    handleManualAddressChange,
    handlePlaceOrder,
    toggleAddressForm,
  };
};
