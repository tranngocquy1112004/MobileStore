/**
 * Module hiển thị danh sách sản phẩm từ file JSON
 * Sử dụng vanilla JavaScript để render giao diện
 */

// Định nghĩa các hằng số
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Đường dẫn tới file JSON chứa dữ liệu sản phẩm
const ROOT_ELEMENT_ID = "app"; // ID của phần tử DOM để render nội dung

// Các thông báo trạng thái
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo khi có lỗi
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo khi không có sản phẩm
};

// Hàm lấy dữ liệu sản phẩm từ API
async function fetchProducts(signal) {
  try {
    const response = await fetch(API_URL, { signal }); // Gửi yêu cầu fetch với signal để hủy nếu cần
    if (!response.ok) throw new Error(MESSAGES.ERROR); // Kiểm tra nếu response không thành công
    const data = await response.json(); // Chuyển đổi response thành JSON
    return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm hoặc rỗng nếu không hợp lệ
  } catch (error) {
    if (error.name !== "AbortError") throw error; // Ném lỗi nếu không phải lỗi hủy
    return []; // Trả về mảng rỗng nếu bị hủy
  }
}

// Hàm tạo HTML cho thông báo trạng thái
function StatusMessage(type) {
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
    </div>
  `;
}

// Hàm tạo HTML cho một sản phẩm
function ProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image-container">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="product-image" 
          loading="lazy" // Tải ảnh theo chế độ lazy để tối ưu hiệu suất
        />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3> <!-- Tên sản phẩm -->
        <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ <!-- Giá sản phẩm định dạng VNĐ -->
        </p>
        <a 
          href="/products/${product.id}" 
          class="product-details-link" 
          aria-label="Xem chi tiết ${product.name}"
        >
          <button class="details-button">Chi tiết</button> <!-- Nút xem chi tiết -->
        </a>
      </div>
    </div>
  `;
}

// Hàm chính để quản lý và hiển thị danh sách sản phẩm
function ProductList() {
  let products = []; // Mảng lưu trữ danh sách sản phẩm
  let status = "loading"; // Trạng thái hiện tại: loading, loaded, error, no_products
  const controller = new AbortController(); // Tạo controller để hủy fetch nếu cần

  // Hàm tải danh sách sản phẩm
  async function loadProducts() {
    try {
      const result = await fetchProducts(controller.signal); // Lấy dữ liệu sản phẩm
      products = result || []; // Cập nhật danh sách sản phẩm
      status = products.length ? "loaded" : "no_products"; // Cập nhật trạng thái
      render(); // Render giao diện
    } catch {
      status = "error"; // Cập nhật trạng thái lỗi
      render(); // Render giao diện lỗi
    }
  }

  // Hàm render giao diện
  function render() {
    const app = document.getElementById(ROOT_ELEMENT_ID); // Lấy phần tử DOM chính
    if (!app) return; // Thoát nếu không tìm thấy phần tử

    // Hiển thị thông báo trạng thái nếu không phải trạng thái loaded
    if (status !== "loaded") {
      app.innerHTML = StatusMessage(status);
      return;
    }

    // Tạo HTML cho danh sách sản phẩm
    const productCardsHTML = products.map(ProductCard).join("");
    app.innerHTML = `
      <main class="product-list-container">
        <h1 class="product-list-title">📱 Danh sách sản phẩm</h1> <!-- Tiêu đề danh sách -->
        <div class="product-grid">${productCardsHTML}</div> <!-- Lưới sản phẩm -->
      </main>
    `;
  }

  // Khởi chạy tải sản phẩm
  loadProducts();

  // Trả về hàm cleanup để hủy fetch khi cần
  return () => controller.abort();
}

// Gọi ProductList khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  ProductList();
});

export default ProductList;