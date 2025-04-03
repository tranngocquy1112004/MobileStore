const API_URL = `${process.env.PUBLIC_URL}/db.json`;

// Thông báo trạng thái
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị",
};

// Hàm fetch dữ liệu sản phẩm
async function fetchProducts(signal) {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) throw new Error(MESSAGES.ERROR);

    const data = await response.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    if (error.name !== "AbortError") throw error;
  }
}

// Component hiển thị thông báo trạng thái
function StatusMessage(type) {
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
    </div>
  `;
}

// Component hiển thị một sản phẩm
function ProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image-container">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="product-image" 
          loading="lazy"
        />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ
        </p>
        <a 
          href="/products/${product.id}" 
          class="product-details-link" 
          aria-label="Xem chi tiết ${product.name}"
        >
          <button class="details-button">Chi tiết</button>
        </a>
      </div>
    </div>
  `;
}

// Component chính hiển thị danh sách sản phẩm
function ProductList() {
  let products = [];
  let status = "loading";
  const controller = new AbortController();

  // Hàm load sản phẩm
  async function loadProducts() {
    try {
      const productList = await fetchProducts(controller.signal);
      products = productList || [];
      status = products.length ? "loaded" : "no_products";
      render();
    } catch {
      status = "error";
      render();
    }
  }

  // Hàm render UI
  function render() {
    const app = document.getElementById("app");
    if (!app) return;

    if (status !== "loaded") {
      app.innerHTML = StatusMessage(status);
      return;
    }

    const productCards = products.map(product => ProductCard(product)).join("");
    app.innerHTML = `
      <main class="product-list-container">
        <h1 class="product-list-title">📱 Danh sách sản phẩm</h1>
        <div class="product-grid">${productCards}</div>
      </main>
    `;
  }

  // Khởi chạy load dữ liệu
  loadProducts();

  // Cleanup khi component bị hủy
  return () => controller.abort();
}

// Khởi chạy component
document.addEventListener("DOMContentLoaded", () => {
  ProductList();
});

// Xuất component nếu dùng module
export default ProductList;