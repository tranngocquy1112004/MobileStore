/**
 * Module hiển thị danh sách sản phẩm từ file JSON bằng Vanilla JavaScript.
 * Module này tự khởi chạy khi DOM đã sẵn sàng để fetch dữ liệu và render giao diện.
 * Nó sử dụng các API trình duyệt tiêu chuẩn (fetch, DOM manipulation, events)
 * thay vì một thư viện/framework như React.
 */

// --- Định nghĩa các hằng số ---

// Đường dẫn tới file JSON chứa dữ liệu sản phẩm.
// ${process.env.PUBLIC_URL} thường được sử dụng trong các môi trường build tool (như Webpack, Create React App)
// để tham chiếu đến thư mục public của ứng dụng. Điều này đảm bảo đường dẫn hoạt động đúng khi deploy.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// ID của phần tử HTML gốc (container) nơi toàn bộ nội dung ứng dụng (danh sách sản phẩm) sẽ được render vào.
// Đảm bảo có một phần tử <div id="app"></div> trong file HTML của bạn.
const ROOT_ELEMENT_ID = "app";

// Object chứa các chuỗi thông báo trạng thái khác nhau hiển thị cho người dùng.
// Các khóa (keys) trùng với tên trạng thái ('loading', 'error', 'no_products') để dễ dàng truy cập.
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo hiển thị khi dữ liệu đang được tải từ nguồn API/file
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo hiển thị khi có lỗi xảy ra trong quá trình fetch dữ liệu
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo hiển thị khi tải xong dữ liệu nhưng danh sách sản phẩm trống rỗng hoặc không hợp lệ
};

// --- Hàm lấy dữ liệu sản phẩm từ API (sử dụng Fetch API) ---
// Hàm async vì sử dụng fetch (trả về Promise) và await để chờ kết quả.
// Nhận một 'signal' từ AbortController để cho phép hủy yêu cầu fetch.
async function fetchProducts(signal) {
  try {
    // Thực hiện yêu cầu HTTP GET đến API_URL đã định nghĩa.
    // Truyền đối tượng 'signal' từ AbortController vào tùy chọn của fetch.
    // Điều này cho phép chúng ta hủy yêu cầu fetch nếu cần thiết (ví dụ: nếu module này không còn cần thiết).
    const response = await fetch(API_URL, { signal });
    // Kiểm tra thuộc tính 'ok' của đối tượng response. 'ok' là true nếu status code là 200-299.
    if (!response.ok) {
      // Nếu response không thành công, ném ra một đối tượng Error mới với thông báo lỗi lấy từ MESSAGES.
      throw new Error(MESSAGES.ERROR);
    }
    // Nếu response thành công, gọi phương thức .json() để phân tích cú pháp body của response thành đối tượng/mảng JavaScript từ JSON.
    const data = await response.json();
    // Kiểm tra cấu trúc dữ liệu nhận được:
    // - Nếu 'data' bản thân nó là một mảng (Array.isArray(data) là true), trả về 'data'.
    // - Nếu 'data' là một đối tượng VÀ có thuộc tính 'products' là mảng, trả về 'data.products'.
    // - Nếu không khớp với hai trường hợp trên, trả về một mảng rỗng []. Logic này giống với cách xử lý trong component React.
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    // Bắt các lỗi có thể xảy ra trong khối try (ví dụ: lỗi mạng, lỗi ném ra ở dòng throw new Error).
    // Kiểm tra nếu tên của lỗi KHÔNG phải là "AbortError".
    // "AbortError" xảy ra khi yêu cầu fetch bị hủy một cách có chủ đích bởi AbortController, đây là hành vi mong muốn trong quá trình cleanup.
    if (error.name !== "AbortError") {
      // Nếu là lỗi khác (lỗi mạng thực sự, lỗi server, lỗi parse JSON không do abort), ném lại lỗi đó.
      // Lỗi này sẽ được bắt và xử lý ở nơi gọi hàm fetchProducts (trong hàm loadProducts).
      throw error;
    }
    // Nếu lỗi là "AbortError", bỏ qua lỗi (không ném lại) và trả về một mảng rỗng. Điều này biểu thị rằng quá trình fetch đã bị dừng.
    return []; // Trả về mảng rỗng khi bị hủy yêu cầu
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
// Hàm này chỉ tạo chuỗi HTML, không gắn sự kiện hay quản lý trạng thái.
function ProductCard(product) {
  // Trả về một chuỗi HTML biểu diễn giao diện của một thẻ sản phẩm.
  // Sử dụng template literals để nhúng các thuộc tính của đối tượng 'product' vào chuỗi HTML.
  // Bao gồm hình ảnh, tên, giá, và liên kết/nút xem chi tiết.
  // Định dạng giá sử dụng toLocaleString("vi-VN") tương tự như trong React.
  return `
    <div class="product-card">
      <div class="product-image-container">
        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-image"
          loading="lazy" />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">
          💰 ${product.price.toLocaleString("vi-VN")} VNĐ
        </p>
        <a
          href="/products/${product.id}"
          class="product-details-link"
          aria-label="Xem chi tiết ${product.name}" >
          <button class="details-button">Chi tiết</button>
        </a>
      </div>
    </div>
  `;
}

// --- Hàm chính quản lý trạng thái và render danh sách sản phẩm ---
// Hàm này đóng vai trò như "Controller" hoặc "Component Logic" trong Vanilla JS.
// Nó quản lý state (dữ liệu), xử lý side effects (fetch), và cập nhật giao diện (render).
function ProductList() {
  let products = []; // Biến cục bộ lưu trữ danh sách sản phẩm đã tải thành công. Ban đầu là mảng rỗng.
  // Biến cục bộ theo dõi trạng thái hiện tại của module ('loading', 'error', 'loaded', 'no_products'). Ban đầu là 'loading'.
  let status = "loading";
  // Tạo một AbortController. Được sử dụng để hủy yêu cầu fetch nếu module này cần dừng hoạt động (ví dụ: chuyển trang trong SPA Vanilla JS).
  const controller = new AbortController();

  // Định nghĩa hàm async để tải danh sách sản phẩm và cập nhật trạng thái.
  async function loadProducts() {
    try {
      // Cập nhật trạng thái loading và render ngay lập tức để người dùng thấy loading spinner/message.
      status = "loading";
      render();

      // Gọi hàm fetchProducts để lấy dữ liệu, truyền signal từ controller để có thể hủy yêu cầu.
      const result = await fetchProducts(controller.signal);
      products = result || []; // Cập nhật biến 'products' với kết quả nhận được. Sử dụng '|| []' để đảm bảo nó luôn là mảng.

      // Cập nhật biến 'status' dựa trên kết quả: Nếu mảng 'products' có phần tử (length > 0), trạng thái là 'loaded', ngược lại là 'no_products'.
      status = products.length > 0 ? "loaded" : "no_products";

    } catch (err) {
      // Bắt lỗi nếu hàm fetchProducts ném lỗi (trừ AbortError đã được xử lý bên trong fetchProducts).
      console.error("Lỗi tải sản phẩm:", err); // Ghi log lỗi chi tiết ra console để debug.
      status = "error"; // Cập nhật biến 'status' thành 'error'.
    } finally {
        // Khối finally luôn chạy sau try/catch, đảm bảo giao diện được render lại
        // với trạng thái cuối cùng (loaded, no_products, hoặc error).
        render(); // Gọi hàm render để cập nhật giao diện người dùng dựa trên trạng thái cuối cùng.
    }
  }

  // Định nghĩa hàm render (vẽ/cập nhật) giao diện người dùng dựa trên trạng thái và dữ liệu hiện tại.
  // Hàm này thao tác trực tiếp với DOM.
  function render() {
    // Lấy phần tử DOM gốc (thường là thẻ div) nơi nội dung sẽ được chèn vào, bằng ID đã định nghĩa.
    const app = document.getElementById(ROOT_ELEMENT_ID);
    // Nếu không tìm thấy phần tử DOM này (ví dụ: ID bị sai trong HTML), ghi lỗi ra console và thoát hàm render để tránh lỗi runtime.
    if (!app) {
      console.error(`Phần tử DOM với ID "${ROOT_ELEMENT_ID}" không được tìm thấy.`);
      return;
    }

    // --- Logic render dựa trên trạng thái hiện tại ---

    // Kiểm tra trạng thái hiện tại.
    if (status === "loading") {
      // Nếu đang loading, xóa nội dung cũ và chèn thông báo loading.
      app.innerHTML = StatusMessage("loading");
    } else if (status === "error") {
      // Nếu có lỗi, xóa nội dung cũ và chèn thông báo lỗi.
      app.innerHTML = StatusMessage("error");
    } else if (status === "no_products") {
       // Nếu không có sản phẩm sau khi tải, xóa nội dung cũ và chèn thông báo không có sản phẩm.
       app.innerHTML = StatusMessage("no_products");
    }
    else if (status === "loaded") {
        // Nếu trạng thái là 'loaded' (đã tải dữ liệu thành công và có sản phẩm)

        // Tạo một mảng các chuỗi HTML, mỗi chuỗi là HTML của một thẻ sản phẩm.
        // Sử dụng phương thức .map() trên mảng 'products', gọi hàm ProductCard cho mỗi sản phẩm để tạo HTML tương ứng.
        const productCardsArray = products.map(ProductCard);
        // Sử dụng phương thức .join("") để nối tất cả các chuỗi HTML của thẻ sản phẩm lại thành một chuỗi HTML lớn duy nhất.
        const productCardsHTML = productCardsArray.join("");

        // Xóa nội dung cũ bên trong phần tử gốc và chèn cấu trúc HTML mới cho danh sách sản phẩm.
        // Bao gồm tiêu đề danh sách và một container div với class 'product-grid' chứa tất cả các thẻ sản phẩm đã tạo.
        app.innerHTML = `
          <main class="product-list-container">
            <h1 class="product-list-title">📱 Danh sách sản phẩm</h1>
            <div class="product-grid">${productCardsHTML}</div>
          </main>
        `;
    }
    // Nếu trạng thái là 'loaded' nhưng mảng products rỗng, logic sẽ rơi vào trạng thái 'no_products' ở trên.
  }

  // --- Khởi chạy ban đầu ---

  // Gọi hàm loadProducts() lần đầu tiên ngay sau khi hàm ProductList được gọi.
  // Điều này bắt đầu quá trình tải dữ liệu và render giao diện ban đầu (trạng thái loading).
  loadProducts();

  // --- Hàm Cleanup (Quan trọng trong môi trường SPA Vanilla JS hoặc khi module/chức năng này bị gỡ bỏ) ---

  // Hàm ProductList trả về một hàm khác. Hàm được trả về này đóng vai trò là hàm cleanup.
  // Trong các framework như React (useEffect), cleanup được quản lý tự động. Trong vanilla JS,
  // bạn sẽ cần tự gọi hàm cleanup này khi module/chức năng này không còn cần thiết nữa
  // (ví dụ: khi bạn chuyển sang trang khác trong ứng dụng SPA xây dựng bằng vanilla JS,
  // bạn sẽ cần xóa DOM cũ và gọi hàm cleanup của module cũ).
  // Hàm cleanup này sẽ được gọi để hủy yêu cầu fetch đang chờ xử lý nếu nó vẫn chưa hoàn thành,
  // giúp tránh memory leaks và các vấn đề tiềm ẩn khác.
  return () => {
    controller.abort(); // Gọi phương thức abort() trên AbortController để hủy yêu cầu fetch liên quan.
    console.log("ProductList cleanup: fetch request aborted."); // Ghi log để biết cleanup đã chạy.
    // Tùy thuộc vào cách quản lý DOM, bạn có thể cần thêm logic dọn dẹp các phần tử DOM đã tạo bởi module này ở đây.
    // Ví dụ: document.getElementById(ROOT_ELEMENT_ID).innerHTML = ''; // Xóa nội dung khỏi root element
  };
}

// --- Chạy ứng dụng sau khi DOM đã sẵn sàng ---

// Thêm một lắng nghe sự kiện cho sự kiện 'DOMContentLoaded' trên đối tượng 'document'.
// Sự kiện này được kích hoạt khi tài liệu HTML ban đầu đã được tải và phân tích cú pháp hoàn toàn (cây DOM đã được xây dựng),
// mà không chờ các tài nguyên phụ như stylesheet, hình ảnh và subframe hoàn tất tải.
// Đảm bảo code truy cập các phần tử DOM (như phần tử ROOT_ELEMENT_ID) chỉ chạy sau sự kiện này.
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed. Initializing ProductList.");
  // Khi DOM đã sẵn sàng (đảm bảo phần tử gốc tồn tại), gọi hàm ProductList() để khởi tạo và chạy module hiển thị danh sách sản phẩm.
  // Gọi hàm ProductList trực tiếp thay vì gán vào biến không sử dụng
  ProductList();

  // Nếu bạn xây dựng một SPA bằng Vanilla JS, bạn sẽ cần lưu biến `cleanupProductList` này
  // và gọi nó khi "unmounting" chức năng này (ví dụ: khi chuyển sang một trang khác không hiển thị danh sách sản phẩm).
  // cleanupProductList(); // Gọi hàm cleanup khi cần
});


// Export hàm ProductList làm default export.
// Điều này cho phép module này có thể được import và sử dụng trong các file JavaScript khác,
// đặc biệt hữu ích trong các hệ thống module (như ES Modules, CommonJS).
// Nếu đây là file JS duy nhất và được nhúng trực tiếp bằng thẻ <script src="..."> trong HTML,
// dòng export này có thể không cần thiết hoặc cần cấu hình build tool phù hợp.
export default ProductList;