import { API_URL } from '../constants/product';

/**
 * Fetches products from the API
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Promise<Array>} Array of products
 */
export const fetchProducts = async (signal) => {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) throw new Error("Không thể tải sản phẩm!");
    const data = await response.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    if (error.name !== "AbortError") throw error;
    return [];
  }
};

/**
 * Filters products based on brand and search criteria
 * @param {Array} products - Array of products to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered products
 */
export const filterProducts = (products, { brand, search }) => {
  return products
    .filter((p) => (brand === "Tất cả" ? true : p.brand === brand))
    .filter((p) =>
      search.trim()
        ? p.name.toLowerCase().includes(search.trim().toLowerCase())
        : true
    );
};

/**
 * Sorts products by price
 * @param {Array} products - Array of products to sort
 * @param {string} sortType - Sort type ('lowToHigh' or 'highToLow')
 * @returns {Array} Sorted products
 */
export const sortProducts = (products, sortType) => {
  return [...products].sort((a, b) =>
    sortType === "lowToHigh" ? a.price - b.price : b.price - a.price
  );
};

/**
 * Paginates products
 * @param {Array} products - Array of products to paginate
 * @param {number} currentPage - Current page number
 * @param {number} productsPerPage - Number of products per page
 * @returns {Array} Products for current page
 */
export const paginateProducts = (products, currentPage, productsPerPage) => {
  const startIndex = (currentPage - 1) * productsPerPage;
  return products.slice(startIndex, startIndex + productsPerPage);
}; 