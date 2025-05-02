/**
 * Module hiển thị danh sách sản phẩm từ file JSON bằng Vanilla JavaScript.
 * Module này tự khởi chạy khi DOM đã sẵn sàng và quản lý trạng thái tải/lỗi/hiển thị.
 */

// --- Hằng số ---

// Đường dẫn đến nguồn dữ liệu sản phẩm (file JSON).
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// ID của phần tử HTML gốc nơi nội dung ứng dụng sẽ được render.
const ROOT_ELEMENT_ID = "app";

// Các thông báo trạng thái hiển thị cho người dùng.
const MESSAGES = {
  LOADING: "⏳ Đang tải sản phẩm...", // Thêm chi tiết vào thông báo loading
  ERROR: "❌ Không thể tải sản phẩm! Vui lòng thử lại sau.", // Thêm gợi ý thử lại
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị.", // Rõ ràng hơn
};

// --- Hàm fetch dữ liệu sản phẩm sử dụng Fetch API ---
// Nhận một signal từ AbortController để cho phép hủy bỏ request.
async function fetchProducts(signal) {
  try {
    const response = await fetch(API_URL, { signal });

    // Kiểm tra nếu response không thành công (ví dụ: status code 404, 500)
    if (!response.ok) {
      // Tạo một Error mới với thông báo lỗi từ hằng số MESSAGES
      throw new Error(MESSAGES.ERROR);
    }

    const data = await response.json();

    // Kiểm tra xem dữ liệu trả về có phải là mảng không.
    // Nếu không phải mảng, thử truy cập thuộc tính 'products' (nếu có).
    // Mặc định trả về mảng rỗng nếu không tìm thấy dữ liệu hợp lệ.
    return Array.isArray(data) ? data : data.products || [];

  } catch (error) {
    // Bắt lỗi. Nếu lỗi là AbortError (do request bị hủy), trả về mảng rỗng.
    // Nếu là lỗi khác, ném lại lỗi để hàm gọi nó có thể xử lý.
    if (error.name === "AbortError") {
      console.log("Fetch request đã bị hủy bỏ."); // Log khi request bị hủy
      return []; // Trả về mảng rỗng khi bị hủy
    }
    // Ném lại lỗi nếu không phải AbortError
    throw error;
  }
}

// --- Hàm tạo chuỗi HTML cho thông báo trạng thái ---
// Nhận loại trạng thái ('loading', 'error', 'no_products').
function StatusMessage(type) {
  // Đảm bảo loại trạng thái hợp lệ và lấy thông báo tương ứng từ MESSAGES
  const messageText = MESSAGES[type.toUpperCase()] || "Không rõ trạng thái";
  const className = type; // Sử dụng loại trạng thái làm class CSS

  return `
    <div class="status-container ${className}">
      <p class="status-message">${messageText}</p>
      ${type === 'error' ? '<button class="retry-button" onclick="window.location.reload()">Thử lại</button>' : ''}
      ${type === 'loading' ? '<div class="loading-spinner"></div>' : ''}
    </div>
  `;
}

// --- Hàm tạo chuỗi HTML cho một thẻ sản phẩm ---
// Nhận một đối tượng sản phẩm. Tạo ra chuỗi HTML tĩnh.
function ProductCard(product) {
  // Thêm kiểm tra an toàn và cung cấp giá trị mặc định cho các thuộc tính sản phẩm
  const id = product?.id;
  const name = product?.name || 'Sản phẩm không rõ';
  const image = product?.image || 'placeholder.png'; // Sử dụng ảnh placeholder nếu thiếu (cần thêm ảnh này)
  const price = product?.price;

  // Kiểm tra nếu các thuộc tính thiết yếu không tồn tại hoặc không hợp lệ
  if (typeof id === 'undefined' || !name || typeof price !== 'number') {
      console.warn("Dữ liệu sản phẩm không hợp lệ, bỏ qua:", product);
      return ''; // Trả về chuỗi rỗng nếu dữ liệu sản phẩm không hợp lệ
  }

  // Định dạng giá tiền theo chuẩn Việt Nam
  const formattedPrice = price.toLocaleString("vi-VN");

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
          💰 ${formattedPrice} VNĐ
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

// --- Hàm chính quản lý trạng thái, fetch dữ liệu và render ---
// Module này tự quản lý trạng thái cục bộ (sử dụng biến trong closure).
function ProductList() {
  let products = []; // Biến cục bộ lưu trữ dữ liệu sản phẩm
  let status = "loading"; // Biến cục bộ lưu trữ trạng thái module ('loading', 'error', 'loaded', 'no_products')
  const controller = new AbortController(); // AbortController để hủy bỏ fetch request

  // Định nghĩa hàm bất đồng bộ để tải sản phẩm và cập nhật trạng thái
  async function loadProducts() {
    try {
      status = "loading"; // Đặt trạng thái loading
      render(); // Render trạng thái loading ngay lập tức

      const result = await fetchProducts(controller.signal); // Gọi hàm fetchProducts
      products = result || []; // Cập nhật dữ liệu sản phẩm, đảm bảo là mảng

      // Xác định trạng thái cuối cùng dựa trên số lượng sản phẩm
      status = products.length > 0 ? "loaded" : "no_products";

    } catch (err) {
      // Bắt các lỗi xảy ra trong quá trình fetch (trừ AbortError đã xử lý trong fetchProducts)
      console.error("Lỗi tải sản phẩm:", err); // Log lỗi chi tiết
      status = "error"; // Đặt trạng thái lỗi
    } finally {
      render(); // Render trạng thái cuối cùng (loaded, no_products, hoặc error)
    }
  }

  // Định nghĩa hàm render UI dựa trên trạng thái và dữ liệu
  function render() {
    const app = document.getElementById(ROOT_ELEMENT_ID);
    // Kiểm tra nếu phần tử gốc không được tìm thấy
    if (!app) {
      console.error(`Phần tử DOM với ID "${ROOT_ELEMENT_ID}" không được tìm thấy.`);
      return; // Dừng render nếu không tìm thấy phần tử gốc
    }

    // --- Logic render dựa trên trạng thái ---
    if (status === "loading") {
      app.innerHTML = StatusMessage("loading");
    } else if (status === "error") {
      app.innerHTML = StatusMessage("error");
    } else if (status === "no_products") {
      app.innerHTML = StatusMessage("no_products");
    } else if (status === "loaded") {
      // Kiểm tra an toàn: Đảm bảo products là mảng trước khi map
      const productCardsArray = Array.isArray(products) ? products.map(ProductCard) : [];
      // Nối mảng các chuỗi HTML thành một chuỗi duy nhất
      const productCardsHTML = productCardsArray.join("");

      // Chèn HTML của danh sách sản phẩm vào phần tử gốc
      app.innerHTML = `
        <main class="product-list-container">
          <h1 class="product-list-title">📱 Danh sách sản phẩm</h1>
          <div class="product-grid">${productCardsHTML}</div>
        </main>
      `;
    }
  }

  // --- Khởi chạy ban đầu ---
  // Bắt đầu quá trình tải dữ liệu và render.
  loadProducts();

  // --- Hàm Cleanup ---
  // Trả về một hàm cleanup có thể được gọi thủ công để dọn dẹp (hủy bỏ fetch).
  // Điều này hữu ích trong các ứng dụng SPA Vanilla JS khi chuyển đổi giữa các "trang".
  return () => {
    controller.abort(); // Hủy bỏ request fetch đang chờ xử lý
    console.log("ProductList cleanup: fetch request aborted."); // Log khi cleanup được gọi
    // Tùy chọn: thêm logic ở đây để xóa các phần tử DOM được tạo bởi module này khi "unmount"
    // document.getElementById(ROOT_ELEMENT_ID).innerHTML = '';
  };
}

// --- Chạy module sau khi DOM đã sẵn sàng ---
// Lắng nghe sự kiện DOMContentLoaded để đảm bảo DOM đã được parse hoàn toàn.
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed. Initializing ProductList (Vanilla JS)."); // Log khi khởi tạo
  // Khởi tạo và chạy module ProductList
  ProductList();
  // Trong một ứng dụng SPA Vanilla JS phức tạp hơn, bạn sẽ lưu hàm cleanup được trả về
  // const cleanupProductList = ProductList();
  // và gọi cleanupProductList() khi "unmounting" module/trang này.
});

// Export hàm chính (tùy chọn, phụ thuộc vào cách bạn cấu trúc dự án)
// export default ProductList; // Bỏ export default nếu module tự chạy và không cần import ở nơi khác
