import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const MESSAGES = {
  EMPTY_CART: "Giỏ hàng của bạn đang trống.",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
  CONTEXT_ERROR: "Không thể truy cập giỏ hàng. Vui lòng thử lại.",
};

const calculateCartTotal = (cart) =>
  cart.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);

export const useCartPage = () => {
  const cartContext = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [guardMessage, setGuardMessage] = useState(null);

  if (!cartContext || !authContext) {
    setError(MESSAGES.CONTEXT_ERROR);
    return { error };
  }

  const { cart = [], removeFromCart, updateQuantity } = cartContext;
  const { isLoggedIn = false } = authContext;

  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  const handleProceedToCheckout = () => {
    if (!cart.length) {
      setGuardMessage(MESSAGES.EMPTY_CART);
      return;
    }
    if (!isLoggedIn) {
      setGuardMessage(MESSAGES.LOGIN_REQUIRED);
      navigate("/");
      return;
    }
    setGuardMessage(null);
    navigate("/checkout");
  };

  return {
    cart,
    cartTotal,
    isLoggedIn,
    removeFromCart: removeFromCart || (() => console.warn("removeFromCart not implemented")),
    updateQuantity: updateQuantity || (() => console.warn("updateQuantity not implemented")),
    handleProceedToCheckout,
    guardMessage,
    error,
  };
};
