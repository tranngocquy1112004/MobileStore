import { readJsonFromStorage, writeJsonToStorage } from "../../../shared/storage";
import { LOCAL_STORAGE_ORDERS_KEY } from "../models/constants";

export const readOrders = () => readJsonFromStorage(LOCAL_STORAGE_ORDERS_KEY, []);

export const saveOrders = (orders) => writeJsonToStorage(LOCAL_STORAGE_ORDERS_KEY, orders);
