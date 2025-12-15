// Simple JSON-based localStorage helpers to keep read/write logic consistent
export const readJsonFromStorage = (key, fallback = []) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch (error) {
    console.error(`Lỗi đọc localStorage key="${key}":`, error);
    return fallback;
  }
};

export const writeJsonToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Lỗi ghi localStorage key="${key}":`, error);
    return false;
  }
};
