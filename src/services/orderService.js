import { readJsonFromStorage, writeJsonToStorage } from "./storage";

export const LOCAL_STORAGE_ORDERS_KEY = "orders";

export const readOrders = () => readJsonFromStorage(LOCAL_STORAGE_ORDERS_KEY, []);

export const saveOrders = (orders) => writeJsonToStorage(LOCAL_STORAGE_ORDERS_KEY, orders);
