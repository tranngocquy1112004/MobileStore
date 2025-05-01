/**
 * Module hiển thị danh sách sản phẩm từ file JSON bằng Vanilla JavaScript.
 * Module này tự khởi chạy khi DOM đã sẵn sàng.
 */

// --- Constants ---

// Path to the JSON file containing product data.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// ID of the root HTML element where the application content will be rendered.
const ROOT_ELEMENT_ID = "app";

// Status messages displayed to the user.
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị",
};

// --- Function to fetch product data using Fetch API ---
// Takes a signal from AbortController for request cancellation.
async function fetchProducts(signal) {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) {
      throw new Error(MESSAGES.ERROR);
    }
    const data = await response.json();
    // Return data array or data.products array, default to empty array
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    // Re-throw error if it's not an AbortError (caused by cleanup)
    if (error.name !== "AbortError") {
      throw error;
    }
    // Return empty array if the request was aborted
    return [];
  }
}

// --- Function to generate HTML string for a status message ---
function StatusMessage(type) {
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
    </div>
  `;
}

// --- Function to generate HTML string for a product card ---
// Takes a product object. Generates static HTML.
function ProductCard(product) {
  // Add basic safety checks for product properties
  const id = product?.id;
  const name = product?.name || 'Sản phẩm không rõ';
  const image = product?.image || ''; // Use a default empty string or a placeholder image path
  const price = product?.price;

  // Check if essential properties exist before rendering a card
  if (typeof id === 'undefined' || !name || typeof price !== 'number') {
      console.warn("Dữ liệu sản phẩm không hợp lệ, bỏ qua:", product);
      return ''; // Return empty string for invalid product data
  }

  return `
    <div class="product-card">
      <div class="product-image-container">
        <img
          src="${image}"
          alt="${name}"
          class="product-image"
          loading="lazy" />
      </div>
      <div class="product-info">
        <h3 class="product-name">${name}</h3>
        <p class="product-price">
          💰 ${price.toLocaleString("vi-VN")} VNĐ
        </p>
        <a
          href="/products/${id}"
          class="product-details-link"
          aria-label="Xem chi tiết ${name}" >
          <button class="details-button">Chi tiết</button>
        </a>
      </div>
    </div>
  `;
}

// --- Main function managing state, fetch, and rendering ---
function ProductList() {
  let products = []; // Local variable for product data state
  let status = "loading"; // Local variable for module status state ('loading', 'error', 'loaded', 'no_products')
  const controller = new AbortController(); // AbortController for fetch cancellation

  // Define async function to load products and update status
  async function loadProducts() {
    try {
      status = "loading";
      render(); // Render loading state immediately

      const result = await fetchProducts(controller.signal);
      products = result || []; // Update products data

      status = products.length > 0 ? "loaded" : "no_products"; // Determine final status

    } catch (err) {
      // Catch errors (excluding AbortError)
      console.error("Lỗi tải sản phẩm:", err);
      status = "error";
    } finally {
      render(); // Render final state (loaded, no_products, or error)
    }
  }

  // Define function to render the UI based on status and data
  function render() {
    const app = document.getElementById(ROOT_ELEMENT_ID);
    if (!app) {
      console.error(`Phần tử DOM với ID "${ROOT_ELEMENT_ID}" không được tìm thấy.`);
      return;
    }

    // --- Rendering logic based on status ---
    if (status === "loading") {
      app.innerHTML = StatusMessage("loading");
    } else if (status === "error") {
      app.innerHTML = StatusMessage("error");
    } else if (status === "no_products") {
      app.innerHTML = StatusMessage("no_products");
    } else if (status === "loaded") {
      // Generate HTML for product cards
      // Ensure products is an array before mapping
       const productCardsArray = Array.isArray(products) ? products.map(ProductCard) : [];
      const productCardsHTML = productCardsArray.join("");

      // Insert the product list HTML into the root element
      app.innerHTML = `
        <main class="product-list-container">
          <h1 class="product-list-title">📱 Danh sách sản phẩm</h1>
          <div class="product-grid">${productCardsHTML}</div>
        </main>
      `;
    }
  }

  // --- Initial Launch ---
  // Start the data loading and rendering process
  loadProducts();

  // --- Cleanup Function ---
  // Returns a function that can be called manually to clean up (abort fetch).
  return () => {
    controller.abort(); // Cancel pending fetch request
    // console.log("ProductList cleanup: fetch request aborted."); // Dev log
    // Optional: add logic here to clear DOM elements created by this module
    // document.getElementById(ROOT_ELEMENT_ID).innerHTML = '';
  };
}

// --- Run module after DOM is ready ---
document.addEventListener("DOMContentLoaded", () => {
  // console.log("DOM fully loaded and parsed. Initializing ProductList."); // Dev log
  // Initialize and run the ProductList module
  ProductList();
  // In a Vanilla JS SPA, you would save the returned cleanup function here
  // const cleanupProductList = ProductList();
  // and call cleanupProductList() when "unmounting" this module/page.
});


// Export the main function (optional depending on usage)
export default ProductList;