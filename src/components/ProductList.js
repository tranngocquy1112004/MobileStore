const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Đường dẫn tới file JSON chứa dữ liệu sản phẩm

// Các thông báo trạng thái cố định
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo hiển thị khi dữ liệu đang được tải
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo khi xảy ra lỗi trong quá trình tải
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo khi không có sản phẩm nào
};

// Hàm lấy dữ liệu sản phẩm từ API
async function fetchProducts(signal) {
  try {
    const response = await fetch(API_URL, { signal }); // Gửi yêu cầu lấy dữ liệu, hỗ trợ hủy với AbortController
    if (!response.ok) throw new Error(MESSAGES.ERROR); // Ném lỗi nếu yêu cầu không thành công
    const data = await response.json(); // Chuyển dữ liệu từ JSON sang object JavaScript
    return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm, hoặc mảng rỗng nếu dữ liệu không hợp lệ
  } catch (error) {
    if (error.name !== "AbortError") throw error; // Ném lại lỗi nếu không phải lỗi do hủy fetch
  }
}

// Component hiển thị thông báo trạng thái
function StatusMessage(type) {
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
      <!-- Hiển thị thông báo tương ứng với type (loading, error, no_products) -->
    </div>
  `;
}

// Component hiển thị một sản phẩm
function ProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image-container">
        <img 
          src="${product.image}" // Đường dẫn ảnh sản phẩm
          alt="${product.name}" // Văn bản thay thế cho ảnh (accessibility)
          class="product-image" // Class CSS để định dạng ảnh
          loading="lazy" // Tải ảnh theo kiểu lazy để tối ưu hiệu năng
        />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3> <!-- Tên sản phẩm -->
        <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ
          <!-- Giá sản phẩm, định dạng tiền Việt Nam -->
        </p>
        <a 
          href="/products/${product.id}" // Liên kết đến trang chi tiết sản phẩm
          class="product-details-link" // Class CSS cho liên kết
          aria-label="Xem chi tiết ${product.name}" // Văn bản mô tả cho accessibility
        >
          <button class="details-button">Chi tiết</button> <!-- Nút xem chi tiết sản phẩm -->
        </a>
      </div>
    </div>
  `;
}

// Component chính hiển thị danh sách sản phẩm
function ProductList() {
  let products = []; // Danh sách sản phẩm, khởi tạo là mảng rỗng
  let status = "loading"; // Trạng thái ban đầu là đang tải dữ liệu
  const controller = new AbortController(); // Tạo AbortController để hủy yêu cầu fetch nếu cần

  // Hàm tải dữ liệu sản phẩm từ API
  async function loadProducts() {
    try {
      const productList = await fetchProducts(controller.signal); // Gọi hàm fetch với signal để hỗ trợ hủy
      products = productList || []; // Cập nhật danh sách sản phẩm, dùng mảng rỗng nếu không có dữ liệu
      status = products.length ? "loaded" : "no_products"; // Cập nhật trạng thái: có sản phẩm thì "loaded", không thì "no_products"
      render(); // Gọi hàm render để cập nhật giao diện
    } catch {
      status = "error"; // Cập nhật trạng thái thành "error" nếu có lỗi
      render(); // Gọi hàm render để hiển thị thông báo lỗi
    }
  }

  // Hàm render giao diện dựa trên trạng thái
  function render() {
    const app = document.getElementById("app"); // Lấy phần tử root trong DOM để render nội dung
    if (!app) return; // Thoát nếu không tìm thấy phần tử root

    if (status !== "loaded") {
      app.innerHTML = StatusMessage(status); // Hiển thị thông báo trạng thái (loading, error, no_products)
      return;
    }

    // Tạo chuỗi HTML cho danh sách sản phẩm
    const productCards = products.map((product) => ProductCard(product)).join("");
    // Render giao diện chính với danh sách sản phẩm
    app.innerHTML = `
      <main class="product-list-container">
        <h1 class="product-list-title">📱 Danh sách sản phẩm</h1> <!-- Tiêu đề danh sách sản phẩm -->
        <div class="product-grid">${productCards}</div> <!-- Grid chứa các thẻ sản phẩm -->
      </main>
    `;
  }

  // Bắt đầu tải dữ liệu ngay khi component được gọi
  loadProducts();

  // Cleanup: Trả về hàm để hủy fetch khi component bị hủy
  return () => controller.abort(); // Hủy yêu cầu fetch nếu component không còn được sử dụng
}

// Khởi chạy component khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  ProductList(); // Gọi hàm ProductList để bắt đầu hiển thị danh sách sản phẩm
});

// Xuất component nếu sử dụng trong môi trường module (ví dụ: Node.js hoặc bundler)
export default ProductList;