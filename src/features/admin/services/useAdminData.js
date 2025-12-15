import { useEffect, useState, useMemo } from "react";
import { formatCurrency } from "../../../utils/formatters";
import { readJsonFromStorage, writeJsonToStorage } from "../../../shared/storage";
import { LOCAL_STORAGE_ORDERS_KEY, LOCAL_STORAGE_USERS_KEY, MESSAGES } from "../models/constants";

const sortOrdersByDateDesc = (orders) => [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

export const useAdminData = () => {
  const [state, setState] = useState({
    users: [],
    orders: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = () => {
      const storedUsers = readJsonFromStorage(LOCAL_STORAGE_USERS_KEY, []);
      const storedOrders = sortOrdersByDateDesc(readJsonFromStorage(LOCAL_STORAGE_ORDERS_KEY, []));
      setState({ users: storedUsers, orders: storedOrders, isLoading: false, error: null });
    };

    const timer = setTimeout(loadData, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteUser = (usernameToDelete) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${usernameToDelete}" và tất cả đơn hàng của họ?`)) {
      return;
    }

    const updatedUsers = state.users.filter((user) => user?.username !== usernameToDelete);
    const updatedOrders = state.orders.filter((order) => order?.username !== usernameToDelete);

    const savedUsers = writeJsonToStorage(LOCAL_STORAGE_USERS_KEY, updatedUsers);
    const savedOrders = writeJsonToStorage(LOCAL_STORAGE_ORDERS_KEY, updatedOrders);

    if (!savedUsers || !savedOrders) {
      setState((prev) => ({ ...prev, error: MESSAGES.SAVE_ERROR }));
      return;
    }

    setState((prev) => ({ ...prev, users: updatedUsers, orders: updatedOrders }));
  };

  const userOrdersMap = useMemo(() => {
    const map = {};
    state.orders.forEach((order) => {
      if (order?.username) {
        map[order.username] = map[order.username] || [];
        map[order.username].push(order);
      }
    });
    return map;
  }, [state.orders]);

  const formatOrderTotal = (value) => formatCurrency(value || 0);

  return { ...state, handleDeleteUser, userOrdersMap, formatOrderTotal };
};
