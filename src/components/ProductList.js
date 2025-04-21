/**
 * Module hiển thị danh sách sản phẩm từ file JSON bằng Vanilla JavaScript.
 * Module này tự khởi chạy khi DOM đã sẵn sàng để fetch dữ liệu và render giao diện.
 */

// --- Định nghĩa các hằng số ---

// Đường dẫn tới file JSON chứa dữ liệu sản phẩm.
// ${process.env.PUBLIC_URL} thường được sử dụng trong các dự án React (như Create React App)
// để tham chiếu đến thư mục public. Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// ID của phần tử HTML gốc nơi toàn bộ nội dung ứng dụng sẽ được render vào.
const ROOT_ELEMENT_ID = "app";

// Object chứa các chuỗi thông báo trạng thái khác nhau hiển thị cho người dùng.
// Các khóa (keys) trùng với tên trạng thái ('loading', 'error', 'no_products').
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo hiển thị khi dữ liệu đang được tải từ nguồn
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo hiển thị khi có lỗi xảy ra trong quá trình fetch dữ liệu
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo hiển thị khi tải xong dữ liệu nhưng danh sách sản phẩm trống rỗng
};

// --- Hàm lấy dữ liệu sản phẩm từ API ---
// Hàm async vì sử dụng fetch (trả về Promise) và await để chờ kết quả.
async function fetchProducts(signal) {
  try {
    // Thực hiện yêu cầu HTTP GET đến API_URL đã định nghĩa.
    // Truyền đối tượng 'signal' từ AbortController vào tùy chọn của fetch.
    // Điều này cho phép chúng ta hủy yêu cầu fetch nếu cần thiết (ví dụ: nếu người dùng rời trang).
    const response = await fetch(API_URL, { signal });
    // Kiểm tra thuộc tính 'ok' của đối tượng response. 'ok' là true nếu status code là 200-299.
    if (!response.ok) {
      // Nếu response không thành công, ném ra một đối tượng Error mới với thông báo lỗi lấy từ MESSAGES.
      throw new Error(MESSAGES.ERROR);
    }
    // Nếu response thành công, gọi phương thức .json() để phân tích cú pháp body của response thành JSON.
    const data = await response.json();
    // Kiểm tra cấu trúc dữ liệu nhận được:
    // - Nếu 'data' bản thân nó là một mảng (Array.isArray(data) là true), trả về 'data'.
    // - Nếu 'data' là một đối tượng VÀ có thuộc tính 'products' là mảng, trả về 'data.products'.
    // - Nếu không khớp với hai trường hợp trên, trả về một mảng rỗng [].
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    // Bắt các lỗi có thể xảy ra trong khối try (ví dụ: lỗi mạng, lỗi ném ra ở dòng throw new Error).
    // Kiểm tra nếu tên của lỗi KHÔNG phải là "AbortError".
    // "AbortError" xảy ra khi yêu cầu fetch bị hủy bởi AbortController, đây là hành vi mong muốn trong quá trình cleanup.
    if (error.name !== "AbortError") {
      throw error; // Nếu là lỗi khác, ném lại lỗi đó để nó có thể được bắt và xử lý ở nơi gọi hàm fetchProducts (trong loadProducts).
    }
    // Nếu lỗi là "AbortError", bỏ qua lỗi và trả về một mảng rỗng. Điều này biểu thị rằng quá trình fetch đã bị dừng một cách có chủ đích.
    return [];
  }
}

// --- Hàm tạo chuỗi HTML cho thông báo trạng thái (loading, error, no_products) ---
// Nhận vào kiểu thông báo ('loading', 'error', 'no_products').
function StatusMessage(type) {
  // Trả về một chuỗi HTML sử dụng template literals.
  // Tạo một thẻ div làm container, với class 'status-container' và một class động là 'type' truyền vào.
  // Bên trong là một thẻ paragraph với class 'status-message' và nội dung lấy từ object MESSAGES,
  // chuyển kiểu 'type' thành chữ hoa (ví dụ: 'loading' -> 'LOADING') để lấy đúng key từ MESSAGES.
  return `
    <div class="status-container ${type}">
      <p class="status-message">${MESSAGES[type.toUpperCase()]}</p>
    </div>
  `;
}

// --- Hàm tạo chuỗi HTML cho một thẻ sản phẩm (Product Card) ---
// Nhận vào một đối tượng 'product'.
function ProductCard(product) {
  // Trả về một chuỗi HTML biểu diễn giao diện của một thẻ sản phẩm.
  // Sử dụng template literals để nhúng các thuộc tính của đối tượng 'product' vào chuỗi HTML.
  return `
    <div class="product-card"> <div class="product-image-container"> <img
          src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
      </div>
      <div class="product-info"> <h3 class="product-name">${product.name}</h3> <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ </p>
        <a
          href="/products/${product.id}" class="product-details-link" aria-label="Xem chi tiết ${product.name}" >
          <button class="details-button">Chi tiết</button> </a>
      </div>
    </div>
  `;
}

// --- Hàm chính quản lý trạng thái và render danh sách sản phẩm ---
// Hàm này đóng vai trò tương tự như một React Component về mặt quản lý state (dù thủ công) và render.
function ProductList() {
  let products = []; // Biến cục bộ lưu trữ danh sách sản phẩm. Ban đầu là mảng rỗng.
  // Biến cục bộ theo dõi trạng thái hiện tại của quá trình tải/hiển thị dữ liệu. Ban đầu là 'loading'.
  let status = "loading";
  // Tạo một AbortController. Được sử dụng để hủy yêu cầu fetch nếu hàm ProductList được gọi lại (trong môi trường phức tạp hơn) hoặc trước khi fetch hoàn thành.
  const controller = new AbortController();

  // Định nghĩa hàm async để tải danh sách sản phẩm và cập nhật trạng thái.
  async function loadProducts() {
    try {
      // Gọi hàm fetchProducts để lấy dữ liệu, truyền signal từ controller để có thể hủy yêu cầu.
      const result = await fetchProducts(controller.signal);
      products = result || []; // Cập nhật biến 'products' với kết quả. Sử dụng '|| []' để đảm bảo nó luôn là mảng.
      // Cập nhật biến 'status': Nếu mảng 'products' có phần tử (length > 0), trạng thái là 'loaded', ngược lại là 'no_products'.
      status = products.length ? "loaded" : "no_products";
      render(); // Sau khi cập nhật biến state (products và status), gọi hàm render để cập nhật giao diện người dùng.
    } catch (err) {
      // Bắt lỗi nếu hàm fetchProducts ném lỗi (trừ AbortError).
      console.error("Lỗi tải sản phẩm:", err); // Ghi log lỗi chi tiết ra console.
      status = "error"; // Cập nhật biến 'status' thành 'error'.
      render(); // Gọi hàm render để hiển thị thông báo lỗi trên giao diện.
    }
  }

  // Định nghĩa hàm render (vẽ) giao diện người dùng dựa trên trạng thái và dữ liệu hiện tại.
  function render() {
    // Lấy phần tử DOM gốc (thường là thẻ div) nơi nội dung sẽ được chèn vào, bằng ID đã định nghĩa.
    const app = document.getElementById(ROOT_ELEMENT_ID);
    // Nếu không tìm thấy phần tử DOM này, ghi lỗi ra console và thoát hàm render.
    if (!app) {
      console.error(`Phần tử DOM với ID "${ROOT_ELEMENT_ID}" không được tìm thấy.`);
      return;
    }

    // --- Logic render dựa trên trạng thái hiện tại ---

    // Nếu trạng thái KHÔNG phải là 'loaded' (tức là đang 'loading', 'error', hoặc 'no_products')
    if (status !== "loaded") {
      // Xóa toàn bộ nội dung HTML hiện tại bên trong phần tử gốc.
      // Chèn HTML của thông báo trạng thái tương ứng bằng cách gọi hàm StatusMessage(status).
      app.innerHTML = StatusMessage(status);
      return; // Dừng hàm render tại đây.
    }

    // Nếu trạng thái là 'loaded' (đã tải dữ liệu thành công và có sản phẩm)

    // Tạo một mảng các chuỗi HTML, mỗi chuỗi là HTML của một thẻ sản phẩm.
    // Sử dụng phương thức .map() trên mảng 'products', gọi hàm ProductCard cho mỗi sản phẩm.
    // Sử dụng phương thức .join("") để nối tất cả các chuỗi HTML của thẻ sản phẩm lại thành một chuỗi HTML lớn.
    const productCardsHTML = products.map(ProductCard).join("");
    // Xóa nội dung cũ và chèn cấu trúc HTML cho danh sách sản phẩm.
    // Bao gồm tiêu đề danh sách và một container div với class 'product-grid' chứa tất cả các thẻ sản phẩm đã tạo.
    app.innerHTML = `
      <main class="product-list-container"> <h1 class="product-list-title">📱 Danh sách sản phẩm</h1> <div class="product-grid">${productCardsHTML}</div> </main>
    `;
  }

  // --- Khởi chạy ban đầu ---

  // Gọi hàm loadProducts() lần đầu tiên ngay sau khi hàm ProductList được gọi.
  // Điều này bắt đầu quá trình tải dữ liệu và render giao diện ban đầu (trạng thái loading).
  loadProducts();

  // --- Hàm Cleanup (Quan trọng trong môi trường SPA hoặc khi module/component bị gỡ bỏ) ---

  // Hàm ProductList trả về một hàm khác. Hàm được trả về này đóng vai trò là hàm cleanup.
  // Trong môi trường React, hàm trả về từ useEffect sẽ là hàm cleanup. Trong vanilla JS,
  // bạn sẽ cần tự gọi hàm cleanup này khi module/chức năng này không còn cần thiết nữa
  // (ví dụ: khi bạn chuyển sang trang khác trong ứng dụng SPA xây dựng bằng vanilla JS).
  // Hàm cleanup này sẽ được gọi để hủy yêu cầu fetch đang chờ xử lý nếu nó vẫn chưa hoàn thành.
  return () => {
    controller.abort(); // Gọi phương thức abort() trên AbortController để hủy yêu cầu fetch liên quan.
    console.log("ProductList cleanup: fetch request aborted."); // Ghi log để biết cleanup đã chạy.
    // Có thể thêm logic dọn dẹp DOM ở đây nếu cần, tùy thuộc vào cách bạn quản lý vòng đời của module này.
  };
}

// --- Chạy ứng dụng sau khi DOM đã sẵn sàng ---

// Thêm một lắng nghe sự kiện cho sự kiện 'DOMContentLoaded' trên đối tượng 'document'.
// Sự kiện này được kích hoạt khi tài liệu HTML ban đầu đã được tải và phân tích cú pháp hoàn toàn,
// mà không chờ các tài nguyên phụ như stylesheet, hình ảnh và subframe hoàn tất tải.
document.addEventListener("DOMContentLoaded", () => {
  // Khi DOM đã sẵn sàng (đảm bảo phần tử gốc tồn tại), gọi hàm ProductList() để khởi tạo và chạy module hiển thị danh sách sản phẩm.
  // Gán kết quả trả về (hàm cleanup) vào một biến nếu bạn cần gọi nó sau này.
  const cleanupProductList = ProductList();
  // Ví dụ: Nếu đây là SPA, khi chuyển trang, bạn sẽ gọi cleanupProductList().
  // Tuy nhiên, trong một trang web đơn giản chỉ chạy một lần, hàm cleanup này có thể không bao giờ được gọi rõ ràng.
});

// Export hàm ProductList làm default export.
// Điều này cho phép module này có thể được import và sử dụng trong các file JavaScript khác,
// đặc biệt hữu ích trong các hệ thống module (như ES Modules, CommonJS).
// Nếu đây là file JS duy nhất và được nhúng trực tiếp bằng thẻ <script>, dòng export này có thể không cần thiết hoặc cần cấu hình build tool.
export default ProductList;