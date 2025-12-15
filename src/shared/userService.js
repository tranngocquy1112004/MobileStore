import { readJsonFromStorage, writeJsonToStorage } from "./storage";

export const LOCAL_STORAGE_USERS_KEY = "users";

export const readUsers = () => readJsonFromStorage(LOCAL_STORAGE_USERS_KEY, []);

export const saveUsers = (users) => writeJsonToStorage(LOCAL_STORAGE_USERS_KEY, users);
