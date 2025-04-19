/**
 * Module hiển thị danh sách sản phẩm từ file JSON.
 * Sử dụng vanilla JavaScript (JS thuần) để thao tác DOM và render giao diện.
 */

// --- Định nghĩa các hằng số ---

// Đường dẫn tới file JSON chứa dữ liệu sản phẩm.
// process.env.PUBLIC_URL thường được dùng trong các project build tool (như Create React App)
// để trỏ tới thư mục public.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// ID của phần tử HTML mà chúng ta sẽ render nội dung vào.
const ROOT_ELEMENT_ID = "app";

// Các thông báo trạng thái khác nhau hiển thị cho người dùng.
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi dữ liệu đang được tải
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo khi có lỗi xảy ra trong quá trình tải
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo khi tải xong nhưng không có sản phẩm nào
};

// --- Hàm lấy dữ liệu sản phẩm từ API ---
// Hàm async vì sử dụng fetch và await
async function fetchProducts(signal) {
  try {
    // Thực hiện yêu cầu HTTP GET đến API_URL.
    // Truyền signal từ AbortController để có thể hủy yêu cầu nếu cần.
    const response = await fetch(API_URL, { signal });
    // Kiểm tra nếu response không thành công (ví dụ: status code 404, 500).
    if (!response.ok) {
      // Ném một Error mới với thông báo lỗi.
      throw new Error(MESSAGES.ERROR);
    }
    // Chuyển đổi body của response thành JSON.
    const data = await response.json();
    // Kiểm tra cấu trúc dữ liệu trả về:
    // Nếu data là một mảng, trả về data đó.
    // Nếu data là object và có thuộc tính 'products' là mảng, trả về data.products.
    // Nếu không phải các trường hợp trên, trả về mảng rỗng.
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    // Bắt các lỗi xảy ra trong quá trình fetch.
    // Kiểm tra nếu lỗi không phải là 'AbortError' (lỗi do yêu cầu bị hủy).
    if (error.name !== "AbortError") {
      throw error; // Ném lại lỗi để được xử lý ở nơi gọi hàm này.
    }
    // Nếu là 'AbortError', nghĩa là yêu cầu đã bị hủy một cách chủ động,
    // chúng ta không coi đó là lỗi nghiêm trọng và trả về mảng rỗng.
    return [];
  }
}

// --- Hàm tạo chuỗi HTML cho thông báo trạng thái ---
function StatusMessage(type) {
  // Tạo một div với class 'status-container' và một class động dựa trên 'type' (loading, error, no_products).
  // Bên trong là một paragraph với class 'status-message' và nội dung lấy từ MESSAGES.
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
    </div>
  `;
}

// --- Hàm tạo chuỗi HTML cho một thẻ sản phẩm (Product Card) ---
function ProductCard(product) {
  // Kiểm tra dữ liệu sản phẩm cơ bản để tránh lỗi render nếu thiếu thông tin.
  // Mặc dù trong JS thuần không bắt buộc kiểm tra như React Component,
  // việc này giúp mã mạnh mẽ hơn. (Không bắt buộc phải thêm kiểm tra này nếu dữ liệu luôn đúng định dạng).
  // if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
  //   console.error("Invalid product data:", product);
  //   return ''; // Trả về chuỗi rỗng nếu dữ liệu không hợp lệ
  // }

  return `
    <div class="product-card">
      <div class="product-image-container">
        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-image"
          loading="lazy" // Sử dụng thuộc tính loading="lazy" để trình duyệt chỉ tải ảnh khi nó gần hiển thị trên viewport
        />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3> <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ </p>
        <a
          href="/products/${product.id}" // Liên kết đến trang chi tiết sản phẩm (đường dẫn giả định)
          class="product-details-link"
          aria-label="Xem chi tiết ${product.name}" // Aria label cho khả năng tiếp cận
        >
          <button class="details-button">Chi tiết</button> </a>
      </div>
    </div>
  `;
}

// --- Hàm chính quản lý trạng thái và render danh sách sản phẩm ---
function ProductList() {
  let products = []; // Biến cục bộ để lưu danh sách sản phẩm đã tải.
  let status = "loading"; // Biến cục bộ theo dõi trạng thái hiện tại ('loading', 'loaded', 'error', 'no_products').
  // Tạo một AbortController. Signal của nó sẽ được dùng để hủy yêu cầu fetch nếu cần
  // (ví dụ: nếu component này bị "hủy" trước khi fetch hoàn thành, trong môi trường framework).
  const controller = new AbortController();

  // Hàm async để tải danh sách sản phẩm.
  async function loadProducts() {
    try {
      // Gọi hàm fetchProducts để lấy dữ liệu, truyền signal.
      const result = await fetchProducts(controller.signal);
      products = result || []; // Cập nhật biến products với kết quả (đảm bảo là mảng).
      // Cập nhật trạng thái: nếu có sản phẩm (products.length > 0) là 'loaded', ngược lại là 'no_products'.
      status = products.length ? "loaded" : "no_products";
      render(); // Sau khi cập nhật state (biến cục bộ), gọi hàm render để cập nhật giao diện.
    } catch (err) {
      // Nếu fetchProducts ném lỗi (không phải AbortError), bắt lỗi ở đây.
      console.error("Lỗi tải sản phẩm:", err); // Ghi log lỗi ra console.
      status = "error"; // Cập nhật trạng thái thành 'error'.
      render(); // Gọi hàm render để hiển thị thông báo lỗi.
    }
  }

  // Hàm render (vẽ) giao diện dựa trên trạng thái và dữ liệu hiện tại.
  function render() {
    // Lấy phần tử DOM chính bằng ID.
    const app = document.getElementById(ROOT_ELEMENT_ID);
    // Nếu không tìm thấy phần tử, thoát hàm.
    if (!app) {
      console.error(`Phần tử DOM với ID "${ROOT_ELEMENT_ID}" không được tìm thấy.`);
      return;
    }

    // --- Render dựa trên trạng thái ---

    // Nếu trạng thái KHÔNG phải 'loaded' (tức là 'loading', 'error', 'no_products')
    if (status !== "loaded") {
      // Xóa nội dung cũ và chèn HTML của thông báo trạng thái tương ứng.
      app.innerHTML = StatusMessage(status);
      // Dừng hàm render tại đây.
      return;
    }

    // Nếu trạng thái là 'loaded' (có sản phẩm và đã tải xong)

    // Tạo chuỗi HTML cho tất cả các thẻ sản phẩm bằng cách map mảng products
    // qua hàm ProductCard và nối các chuỗi HTML lại.
    const productCardsHTML = products.map(ProductCard).join("");
    // Xóa nội dung cũ và chèn cấu trúc HTML cho danh sách sản phẩm
    app.innerHTML = `
      <main class="product-list-container">
        <h1 class="product-list-title">📱 Danh sách sản phẩm</h1> <div class="product-grid">${productCardsHTML}</div> </main>
    `;
  }

  // --- Khởi chạy ---

  // Gọi hàm loadProducts lần đầu tiên để bắt đầu tải dữ liệu khi ProductList được gọi.
  loadProducts();

  // --- Cleanup (Quan trọng trong môi trường SPA hoặc khi tái sử dụng component) ---

  // Trả về một hàm cleanup. Hàm này sẽ được gọi khi component này (hoặc logic này)
  // không còn cần thiết nữa (ví dụ: khi chuyển sang trang khác trong ứng dụng SPA).
  // Hàm cleanup sẽ hủy yêu cầu fetch đang chờ xử lý nếu nó chưa hoàn thành,
  // giúp tránh lỗi hoặc rò rỉ bộ nhớ.
  return () => {
    controller.abort(); // Gọi hàm abort trên AbortController để hủy yêu cầu fetch.
  };
}

// --- Chạy ứng dụng sau khi DOM đã sẵn sàng ---

// Thêm một event listener để lắng nghe sự kiện 'DOMContentLoaded'.
// Sự kiện này bắn ra khi tài liệu HTML đầu tiên đã được tải và phân tích cú pháp hoàn toàn,
// mà không cần chờ stylesheet, image, và subframe hoàn tất tải.
document.addEventListener("DOMContentLoaded", () => {
  // Khi DOM đã sẵn sàng, gọi hàm ProductList để khởi tạo và render danh sách sản phẩm.
  ProductList();
});

// Export ProductList làm default export (nếu muốn sử dụng module này trong các file JS khác).
// Điều này không bắt buộc nếu đây là file JS duy nhất được include trực tiếp vào HTML.
export default ProductList;