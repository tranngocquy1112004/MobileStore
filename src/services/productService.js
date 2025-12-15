const PRODUCTS_KEY = "products";
const API_URL = `${process.env.PUBLIC_URL}/db.json`;

export const getCachedProducts = () => {
  try {
    const cached = localStorage.getItem(PRODUCTS_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error("Lỗi parse cache sản phẩm:", error);
    return [];
  }
};

export const cacheProducts = (products) => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Lỗi lưu cache sản phẩm:", error);
  }
};

export const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal });
  if (!response.ok) throw new Error("Failed to load product data!");
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

export const loadProducts = async (signal) => {
  let products = getCachedProducts();
  if (!products.length) {
    products = await fetchProducts(signal);
    cacheProducts(products);
  }
  return products;
};
