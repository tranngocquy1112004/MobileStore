import { useEffect, useReducer, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { readOrders } from "../services/orderService";

const ERROR_MESSAGES = {
  LOGIN_REQUIRED: "Vui lòng đăng nhập để xem đơn hàng.",
  STORAGE_ERROR: "Không thể lấy dữ liệu đơn hàng từ bộ nhớ. Vui lòng thử lại.",
  LOAD_ERROR: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.",
};

const initialState = {
  userOrders: [],
  isLoading: true,
  error: null,
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, userOrders: action.payload, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, userOrders: [], isLoading: false, error: action.payload };
    default:
      return state;
  }
};

export const useUserOrders = () => {
  const { user, isLoggedIn } = useContext(AuthContext) || { user: null, isLoggedIn: false };
  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    if (!isLoggedIn || !user?.username) {
      dispatch({ type: "FETCH_SUCCESS", payload: [] });
      return;
    }

    dispatch({ type: "FETCH_START" });
    try {
      const allOrders = readOrders();
      if (!Array.isArray(allOrders)) {
        dispatch({ type: "FETCH_ERROR", payload: ERROR_MESSAGES.STORAGE_ERROR });
        return;
      }
      const filtered = allOrders.filter((order) => order.username === user.username);
      const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      dispatch({ type: "FETCH_SUCCESS", payload: sorted });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message || ERROR_MESSAGES.LOAD_ERROR });
    }
  }, [user, isLoggedIn]);

  return state;
};
