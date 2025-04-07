const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API để lấy dữ liệu sản phẩm

// Các thông báo trạng thái cố định
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải dữ liệu
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo khi có lỗi
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo khi không có sản phẩm
};

// Hàm fetch dữ liệu sản phẩm từ API
async function fetchProducts(signal) {
  try {
    const response = await fetch(API_URL, { signal }); // Gửi yêu cầu lấy dữ liệu với khả năng hủy
    if (!response.ok) throw new Error(MESSAGES.ERROR); // Báo lỗi nếu fetch thất bại
    const data = await response.json(); // Chuyển dữ liệu thành JSON
    return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm hoặc mảng rỗng nếu không hợp lệ
  } catch (error) {
    if (error.name !== "AbortError") throw error; // Ném lỗi nếu không phải lỗi hủy fetch
  }
}

// Component hiển thị thông báo trạng thái
function StatusMessage(type) {
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p> {/* Hiển thị thông báo tương ứng với type */}
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
          loading="lazy" // Tải ảnh theo kiểu lazy để tối ưu hiệu năng
        />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3> {/* Tên sản phẩm */}
        <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ {/* Giá sản phẩm, định dạng tiền VN */}
        </p>
        <a 
          href="/products/${product.id}" 
          class="product-details-link" 
          aria-label="Xem chi tiết ${product.name}" // Accessibility label
        >
          <button class="details-button">Chi tiết</button> {/* Nút xem chi tiết */}
        </a>
      </div>
    </div>
  `;
}

// Component chính hiển thị danh sách sản phẩm
function ProductList() {
  let products = []; // Danh sách sản phẩm, khởi tạo rỗng
  let status = "loading"; // Trạng thái ban đầu là đang tải
  const controller = new AbortController(); // Tạo AbortController để hủy fetch nếu cần

  // Hàm tải dữ liệu sản phẩm
  async function loadProducts() {
    try {
      const productList = await fetchProducts(controller.signal); // Lấy dữ liệu từ API
      products = productList || []; // Cập nhật danh sách sản phẩm
      status = products.length ? "loaded" : "no_products"; // Cập nhật trạng thái dựa trên kết quả
      render(); // Render lại giao diện
    } catch {
      status = "error"; // Cập nhật trạng thái lỗi nếu fetch thất bại
      render(); // Render lại giao diện
    }
  }

  // Hàm render giao diện dựa trên trạng thái
  function render() {
    const app = document.getElementById("app"); // Lấy phần tử root để render
    if (!app) return; // Thoát nếu không tìm thấy phần tử root

    if (status !== "loaded") {
      app.innerHTML = StatusMessage(status); // Hiển thị thông báo trạng thái nếu không phải "loaded"
      return;
    }

    // Tạo danh sách các thẻ sản phẩm
    const productCards = products.map((product) => ProductCard(product)).join("");
    // Render giao diện chính với danh sách sản phẩm
    app.innerHTML = `
      <main class="product-list-container">
        <h1 class="product-list-title">📱 Danh sách sản phẩm</h1> {/* Tiêu đề */}
        <div class="product-grid">${productCards}</div> {/* Grid chứa các sản phẩm */}
      </main>
    `;
  }

  // Khởi chạy tải dữ liệu ngay khi component được gọi
  loadProducts();

  // Cleanup: Hủy fetch khi component bị hủy
  return () => controller.abort();
}

// Khởi chạy component khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  ProductList();
});

// Xuất component nếu sử dụng trong môi trường module
export default ProductList;