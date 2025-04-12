const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Đường dẫn tới file JSON chứa dữ liệu sản phẩm
const ROOT_ELEMENT_ID = "app"; // ID của phần tử DOM để render nội dung

const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị",
};

// Hàm lấy dữ liệu sản phẩm từ JSON
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

// Hiển thị thông báo trạng thái
function StatusMessage(type) {
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
    </div>
  `;
}

// Hiển thị một sản phẩm đơn lẻ
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

// Giao diện chính: danh sách sản phẩm
function ProductList() {
  let products = [];
  let status = "loading";
  const controller = new AbortController();

  async function loadProducts() {
    try {
      const result = await fetchProducts(controller.signal);
      products = result || [];
      status = products.length ? "loaded" : "no_products";
      render();
    } catch {
      status = "error";
      render();
    }
  }

  function render() {
    const app = document.getElementById(ROOT_ELEMENT_ID);
    if (!app) return;

    if (status !== "loaded") {
      app.innerHTML = StatusMessage(status);
      return;
    }

    const productCardsHTML = products.map(ProductCard).join("");
    app.innerHTML = `
      <main class="product-list-container">
        <h1 class="product-list-title">📱 Danh sách sản phẩm</h1>
        <div class="product-grid">${productCardsHTML}</div>
      </main>
    `;
  }

  // Khởi chạy
  loadProducts();

  // Trả về cleanup
  return () => controller.abort();
}

// Gọi khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  ProductList();
});

export default ProductList;
