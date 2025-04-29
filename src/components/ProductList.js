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
    return []; // Return empty array when aborted request
  }
}

// --- Hàm tạo chuỗi HTML cho thông báo trạng thái (loading, error, no_products) ---
// Nhận vào kiểu thông báo ('loading', 'error', 'no_products').
function StatusMessage(type) {
  // Return an HTML string using template literals.
  // Create a div tag as a container, with class 'status-container' and a dynamic class based on the 'type' passed in.
  // Inside is a paragraph tag with class 'status-message' and content from the MESSAGES object,
  // converting the 'type' string to uppercase (e.g., 'loading' -> 'LOADING') to get the correct key from MESSAGES.
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
  // Return an HTML string representing the UI of a product card.
  // Use template literals to embed properties of the 'product' object into the HTML string.
  // Includes image, name, price, and a link/button to view details.
  // Format the price using toLocaleString("vi-VN") similar to the React components.
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
  let products = []; // Local variable storing the list of successfully loaded products. Initially an empty array.
  // Local variable tracking the current status of the module ('loading', 'error', 'loaded', 'no_products'). Initially 'loading'.
  let status = "loading";
  // Create an AbortController. Used to cancel the fetch request if this module needs to stop operating (e.g., navigating to another page in a Vanilla JS SPA).
  const controller = new AbortController();

  // Define an async function to load the product list and update the status.
  async function loadProducts() {
    try {
      // Update the loading status and render immediately so the user sees the loading spinner/message.
      status = "loading";
      render();

      // Call the fetchProducts function to get data, passing the signal from the controller to be able to cancel the request.
      const result = await fetchProducts(controller.signal);
      products = result || []; // Update the 'products' variable with the received result. Use '|| []' to ensure it's always an array.

      // Update the 'status' variable based on the result: If the 'products' array has elements (length > 0), status is 'loaded', otherwise it's 'no_products'.
      status = products.length > 0 ? "loaded" : "no_products";

    } catch (err) {
      // Catch errors if the fetchProducts function throws an error (excluding AbortError which is handled inside fetchProducts).
      console.error("Lỗi tải sản phẩm:", err); // Log the detailed error to the console for debugging.
      status = "error"; // Update the 'status' variable to 'error'.
    } finally {
        // The finally block always runs after try/catch, ensuring the UI is re-rendered
        // with the final status (loaded, no_products, or error).
        render(); // Call the render function to update the user interface based on the final status.
    }
  }

  // Define the render function (draw/update) the user interface based on the current status and data.
  // This function directly manipulates the DOM.
  function render() {
    // Get the root DOM element (usually a div tag) where the content will be inserted, using the defined ID.
    const app = document.getElementById(ROOT_ELEMENT_ID);
    // If this DOM element is not found (e.g., incorrect ID in HTML), log an error to the console and exit the render function to avoid runtime errors.
    if (!app) {
      console.error(`Phần tử DOM với ID "${ROOT_ELEMENT_ID}" không được tìm thấy.`);
      return;
    }

    // --- Rendering logic based on the current status ---

    // Check the current status.
    if (status === "loading") {
      // If loading, clear old content and insert the loading message.
      app.innerHTML = StatusMessage("loading");
    } else if (status === "error") {
      // If there's an error, clear old content and insert the error message.
      app.innerHTML = StatusMessage("error");
    } else if (status === "no_products") {
       // If there are no products after loading, clear old content and insert the no products message.
       app.innerHTML = StatusMessage("no_products");
    }
    else if (status === "loaded") {
        // If the status is 'loaded' (data has been successfully loaded and there are products)

        // Create an array of HTML strings, where each string is the HTML for a product card.
        // Use the .map() method on the 'products' array, calling the ProductCard function for each product to generate the corresponding HTML.
        const productCardsArray = products.map(ProductCard);
        // Use the .join("") method to concatenate all the HTML strings of the product cards into a single large HTML string.
        const productCardsHTML = productCardsArray.join("");

        // Clear the old content inside the root element and insert the new HTML structure for the product list.
        // Includes the list title and a container div with class 'product-grid' containing all the generated product cards.
        app.innerHTML = `
          <main class="product-list-container">
            <h1 class="product-list-title">📱 Danh sách sản phẩm</h1>
            <div class="product-grid">${productCardsHTML}</div>
          </main>
        `;
    }
    // If the status is 'loaded' but the products array is empty, the logic will fall into the 'no_products' state above.
  }

  // --- Initial Launch ---

  // Call the loadProducts() function for the first time right after the ProductList function is called.
  // This starts the data loading process and initial UI rendering (loading state).
  loadProducts();

  // --- Cleanup Function (Important in Vanilla JS SPA environment or when this module/feature is removed) ---

  // The ProductList function returns another function. This returned function acts as the cleanup function.
  // In frameworks like React (useEffect), cleanup is managed automatically. In vanilla JS,
  // you will need to manually call this cleanup function when this module/feature is no longer needed
  // (e.g., when you navigate to another page in an SPA built with vanilla JS,
  // you will need to clear the old DOM and call the cleanup function of the old module).
  // This cleanup function will be called to cancel any pending fetch request if it hasn't completed yet,
  // helping to prevent memory leaks and other potential issues.
  return () => {
    controller.abort(); // Call the abort() method on the AbortController to cancel the associated fetch request.
    console.log("ProductList cleanup: fetch request aborted."); // Log to indicate that cleanup has run.
    // Depending on how DOM is managed, you might need to add logic here to clean up DOM elements created by this module.
    // Example: document.getElementById(ROOT_ELEMENT_ID).innerHTML = ''; // Clear content from root element
  };
}

// --- Run the application after the DOM is ready ---

// Add an event listener for the 'DOMContentLoaded' event on the 'document' object.
// This event is fired when the initial HTML document has been completely loaded and parsed (the DOM tree has been constructed),
// without waiting for stylesheets, images, and subframes to finish loading.
// Ensures code accessing DOM elements (like the ROOT_ELEMENT_ELEMENT_ID element) runs only after this event.
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed. Initializing ProductList.");
  // When the DOM is ready (ensuring the root element exists), call the ProductList() function to initialize and run the product list display module.
  // Call the ProductList function directly instead of assigning to an unused variable
  ProductList();

  // If you were building a Vanilla JS SPA, you would need to save this `cleanupProductList` variable
  // and call it when "unmounting" this functionality (e.g., when navigating to a different page that doesn't display the product list).
  // cleanupProductList(); // Call the cleanup function when needed
});


// Export the ProductList function as the default export.
// This allows this module to be imported and used in other JavaScript files,
// especially useful in module systems (like ES Modules, CommonJS).
// If this is the only JS file and is embedded directly using a <script src="..."> tag in HTML,
// this export line might not be necessary or might require appropriate build tool configuration.
export default ProductList;