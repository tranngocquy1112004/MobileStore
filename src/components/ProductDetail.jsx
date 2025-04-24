import React, { useEffect, useState, useContext, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useEffect để thực hiện các tác vụ phụ (side effects), useState để quản lý trạng thái cục bộ, useContext để truy cập vào Context API, và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện, giúp tối ưu hiệu suất và tránh re-render không cần thiết
import { Link, useParams, useNavigate } from "react-router-dom"; // Import các thành phần từ react-router-dom: Link để tạo các liên kết điều hướng SPA (Single Page Application) mà không tải lại toàn bộ trang, useParams để trích xuất các tham số từ URL động (ví dụ: ID sản phẩm từ '/products/:id'), và useNavigate để thực hiện điều hướng trang bằng code JavaScript (ví dụ: sau khi thêm vào giỏ hàng)
import { CartContext } from "../pages/CartContext"; // Import CartContext từ đường dẫn tương đối. Context này chứa trạng thái giỏ hàng và các hàm để quản lý giỏ hàng (ví dụ: addToCart, removeFromCart,...)
import { AuthContext } from "../account/AuthContext"; // Import AuthContext từ đường dẫn tương đối. Context này chứa trạng thái xác thực của người dùng (đã đăng nhập hay chưa) và có thể cả thông tin người dùng.
import "./ProductDetail.css"; // Import file CSS để định dạng giao diện cho component chi tiết sản phẩm này

// --- Định nghĩa các hằng số ---

// URL hoặc đường dẫn tới nguồn dữ liệu sản phẩm (thường là file JSON trong thư mục public hoặc API endpoint).
// Sử dụng process.env.PUBLIC_URL để đảm bảo đường dẫn đúng trong cả môi trường phát triển và production khi deploy.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Object chứa các chuỗi thông báo khác nhau sẽ hiển thị cho người dùng trên giao diện, giúp dễ dàng quản lý nội dung thông báo và hỗ trợ quốc tế hóa (nếu cần)
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo hiển thị khi dữ liệu đang được tải
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!", // Thông báo lỗi khi quá trình lấy dữ liệu từ API/file thất bại
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Thông báo hiển thị khi không tìm thấy sản phẩm với ID tương ứng trong dữ liệu đã tải
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Thông báo khi người dùng thêm sản phẩm vào giỏ hàng thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo yêu cầu người dùng đăng nhập trước khi thực hiện hành động (ví dụ: thêm vào giỏ hàng)
};
// Khóa sử dụng để lưu trữ danh sách sản phẩm trong localStorage.
// Việc lưu cache danh sách sản phẩm giúp tăng tốc độ tải trang chi tiết sản phẩm lần sau
// mà không cần fetch lại toàn bộ danh sách từ nguồn gốc mỗi lần.
const LOCAL_STORAGE_PRODUCTS_KEY = "products";


// --- Component chính: ProductDetail (Hiển thị chi tiết một sản phẩm cụ thể) ---
// Đây là functional component hiển thị thông tin chi tiết của một sản phẩm dựa trên ID được truyền qua URL (sử dụng routing).
const ProductDetail = () => {
  // Sử dụng hook useParams() để lấy các tham số động từ URL.
  // Trong trường hợp route là '/products/:id', hook này sẽ trả về một object { id: "giá_trị_id_trên_url" }.
  const { id } = useParams();
  // Sử dụng hook useNavigate() để có khả năng điều hướng người dùng đến các trang khác
  // một cách lập trình (ví dụ: sau khi thêm vào giỏ hàng hoặc khi yêu cầu đăng nhập).
  const navigate = useNavigate();
  // Sử dụng hook useContext() để truy cập vào CartContext đã được cung cấp ở cấp cao hơn.
  // Lấy ra hàm 'addToCart' từ Context để sử dụng chức năng thêm sản phẩm vào giỏ hàng.
  const { addToCart } = useContext(CartContext);
  // Sử dụng hook useContext() để truy cập vào AuthContext đã được cung cấp.
  // Lấy ra trạng thái 'isLoggedIn' để kiểm tra xem người dùng đã đăng nhập hay chưa.
  // Sử dụng cú pháp destructuring với giá trị mặc định (`isLoggedIn = false`)
  // và optional chaining (`|| {}`) để đảm bảo code không bị lỗi nếu AuthContext chưa được cung cấp
  // hoặc thuộc tính `isLoggedIn` không tồn tại (đảm bảo an toàn hơn).
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  // --- State quản lý dữ liệu và trạng thái của component ---
  // State 'product': Lưu trữ thông tin chi tiết của sản phẩm tìm được dưới dạng một object. Ban đầu là null vì chưa có dữ liệu.
  const [product, setProduct] = useState(null);
  // State 'isLoading': Một boolean theo dõi liệu dữ liệu sản phẩm có đang được tải từ nguồn hay không. Ban đầu là true khi component bắt đầu render.
  const [isLoading, setIsLoading] = useState(true);
  // State 'error': Lưu trữ thông báo lỗi dưới dạng một chuỗi nếu có lỗi trong quá trình tải dữ liệu hoặc tìm sản phẩm. Ban đầu là null (không có lỗi).
  const [error, setError] = useState(null);
  // State 'successMessage': Lưu trữ các thông báo tạm thời (ví dụ: "Thêm vào giỏ hàng thành công!", "Vui lòng đăng nhập!"). Ban đầu là chuỗi rỗng.
  const [successMessage, setSuccessMessage] = useState("");

  // --- Effect hook để fetch dữ liệu sản phẩm khi component mount hoặc id trên URL thay đổi ---
  // Effect này là nơi thực hiện các side effect như lấy dữ liệu từ API hoặc localStorage.
  useEffect(() => {
    // Tạo một instance của AbortController. Đối tượng này được sử dụng để tạo một tín hiệu ('signal')
    // có thể dùng để hủy một yêu cầu Fetch API đang chờ xử lý. Quan trọng cho cleanup.
    const controller = new AbortController();
    const signal = controller.signal; // Lấy signal từ controller để truyền vào tùy chọn của fetch().

    // Định nghĩa một hàm bất đồng bộ (async function) để thực hiện việc lấy và xử lý dữ liệu sản phẩm.
    const fetchProduct = async () => {
      try {
        // Đặt lại các state liên quan đến trạng thái trước khi bắt đầu tải dữ liệu mới.
        setIsLoading(true); // Bắt đầu quá trình tải, cập nhật state 'isLoading' thành true.
        setError(null); // Xóa bất kỳ thông báo lỗi nào có thể còn lại từ lần chạy trước.
        setProduct(null); // Đặt lại product về null để đảm bảo giao diện hiển thị loading hoặc lỗi thay vì dữ liệu cũ.
        setSuccessMessage(""); // Xóa bất kỳ thông báo thành công/yêu cầu đăng nhập nào có thể còn lại.


        let productList; // Khai báo biến để lưu trữ danh sách tất cả sản phẩm.


        // --- Logic kiểm tra và sử dụng dữ liệu cache từ localStorage (nếu có) ---
        // Cố gắng lấy chuỗi JSON chứa danh sách tất cả sản phẩm từ localStorage bằng key đã định nghĩa.
        const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);

        // Kiểm tra xem có dữ liệu sản phẩm được lưu trong localStorage hay không và nó có phải là một chuỗi không rỗng không.
        if (cachedProducts) {
          // Nếu tìm thấy dữ liệu trong localStorage
          try {
            // Thử phân tích cú pháp chuỗi JSON thành một mảng/đối tượng JavaScript.
            productList = JSON.parse(cachedProducts);
            console.log("Sử dụng dữ liệu sản phẩm từ localStorage (cache)"); // Ghi log ra console để theo dõi nguồn dữ liệu đang dùng.
          } catch (parseError) {
            // Nếu quá trình parse JSON thất bại (dữ liệu trong localStorage bị hỏng/không hợp lệ)
            console.error("Lỗi khi parse dữ liệu sản phẩm từ localStorage:", parseError); // Ghi log lỗi parse
            localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY); // Xóa dữ liệu bị hỏng khỏi localStorage để tránh lỗi lặp lại.
            productList = []; // Đặt productList thành mảng rỗng để buộc fetch lại từ nguồn gốc.
            console.log("Đã xóa dữ liệu lỗi trong localStorage, sẽ fetch lại từ API."); // Thông báo sẽ fetch lại
          }
        }

        // --- Logic fetch dữ liệu từ API nếu cache không khả dụng hoặc không hợp lệ ---
        // Nếu productList vẫn rỗng (do cache trống ban đầu, cache bị lỗi và đã xóa) HOẶC productList không phải là một mảng, thì mới thực hiện fetch từ API.
        // Điều này đảm bảo dữ liệu luôn được fetch lại từ nguồn gốc nếu cache không khả dụng hoặc không hợp lệ.
        if (!Array.isArray(productList) || productList.length === 0) {
           console.log("Fetch dữ liệu sản phẩm từ API (cache trống hoặc lỗi)"); // Ghi log để theo dõi
           // Gửi yêu cầu Fetch API đến API_URL. Truyền signal để có thể hủy yêu cầu nếu cần.
           const response = await fetch(API_URL, { signal });

           // Kiểm tra thuộc tính 'ok' của response để biết yêu cầu có thành công (status 200-299) hay không.
           if (!response.ok) {
             // Nếu response không OK, ném ra một Error với thông báo lỗi lấy từ hằng số MESSAGES.
             throw new Error(MESSAGES.ERROR_FETCH);
           }

           const data = await response.json(); // Chuyển đổi body của response thành đối tượng/mảng JavaScript từ JSON.
           // Lấy danh sách sản phẩm từ dữ liệu nhận được. Kiểm tra nếu data là mảng trực tiếp hoặc nằm trong thuộc tính 'products' của data.
           productList = Array.isArray(data) ? data : data.products || [];

           // Lưu danh sách sản phẩm vừa fetch được (nếu thành công) vào localStorage để sử dụng cho các lần tải trang tiếp theo.
           // Chỉ lưu nếu productList không rỗng để tránh lưu trữ mảng rỗng khi fetch thất bại hoặc không có sản phẩm.
           if (productList.length > 0) {
               localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
           }
        }


        // --- Tìm sản phẩm cụ thể trong danh sách theo ID ---
        // ID lấy từ useParams() là một chuỗi (string). ID trong dữ liệu sản phẩm JSON thường là một số (number).
        // Sử dụng Number(id) hoặc parseInt(id, 10) để chuyển đổi chuỗi ID từ URL sang kiểu số để so sánh chính xác bằng toán tử so sánh chặt chẽ (===).
        const foundProduct = productList.find((p) => p.id === Number(id));
        console.log(`Tìm sản phẩm với ID: ${id}`, foundProduct); // Log kết quả tìm kiếm

        // Kiểm tra xem có tìm thấy sản phẩm nào khớp với ID hay không.
        if (!foundProduct) {
          // Nếu không tìm thấy sản phẩm (foundProduct là undefined hoặc null), đặt thông báo lỗi "Sản phẩm không tồn tại!".
          setError(MESSAGES.ERROR_NOT_FOUND);
          setProduct(null); // Đảm bảo state 'product' được đặt về null khi không tìm thấy.
          return; // Dừng hàm fetchProduct để không xử lý tiếp.
        }

        // Nếu tìm thấy sản phẩm, cập nhật state 'product' với thông tin chi tiết của sản phẩm đó.
        setProduct(foundProduct);
        // Không cần xóa successMessage ở đây, vì nó liên quan đến hành động thêm vào giỏ hàng, không phải tải dữ liệu.

      } catch (err) {
        // Bắt các lỗi có thể xảy ra trong khối try (ví dụ: lỗi mạng khi fetch, lỗi parse JSON, lỗi ném ra thủ công).
        // Kiểm tra nếu lỗi KHÔNG phải là AbortError. AbortError xảy ra khi yêu cầu fetch bị hủy bởi AbortController (trong cleanup), đây là hành vi mong muốn khi component unmount hoặc dependencies thay đổi nhanh.
        if (err.name !== "AbortError") {
          console.error("Error in fetchProduct:", err); // Ghi log lỗi thật ra console để debug.
          setError(err.message || MESSAGES.ERROR_FETCH); // Cập nhật state 'error' với thông báo lỗi từ đối tượng lỗi, hoặc thông báo lỗi fetch mặc định nếu err.message rỗng.
          setProduct(null); // Đảm bảo state 'product' là null khi có lỗi.
        }
        // Nếu là AbortError, bỏ qua vì đó là lỗi do cleanup xử lý.
      } finally {
        // Khối finally luôn chạy sau try/catch, bất kể có lỗi xảy ra hay không.
        setIsLoading(false); // Kết thúc quá trình tải, đặt state isLoading về false.
      }
    };

    // Gọi hàm fetchProduct để bắt đầu quá trình lấy dữ liệu khi effect chạy (component mount hoặc id thay đổi).
    fetchProduct();

    // Cleanup function cho effect này. Hàm này chạy khi component bị hủy bỏ (unmount)
    // hoặc khi các dependencies của effect ([id]) thay đổi và effect sắp chạy lại (trước khi effect mới chạy).
    // Điều này đảm bảo rằng nếu người dùng nhanh chóng chuyển từ trang chi tiết sản phẩm này sang trang khác,
    // yêu cầu fetch dữ liệu cũ sẽ bị hủy bỏ, tránh race conditions và cập nhật state trên component đã bị hủy.
    return () => controller.abort(); // Hủy yêu cầu fetch API đang chờ xử lý nếu nó vẫn chưa hoàn thành.
  }, [id]); // Mảng dependencies: Effect này sẽ chạy lại mỗi khi giá trị của biến 'id' (lấy từ URL bằng useParams) thay đổi. Điều này đảm bảo rằng khi người dùng xem sản phẩm khác, dữ liệu mới sẽ được tải lại.

  // --- Hàm xử lý khi người dùng nhấn nút "Thêm vào giỏ hàng" ---
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm này chỉ được tạo lại khi các biến trong dependency array thay đổi.
  // Điều này giúp ngăn component hoặc các component con (nếu hàm này được truyền xuống)
  // re-render không cần thiết nếu chỉ có các state khác thay đổi nhưng dependencies của hàm này không đổi.
  const handleAddToCart = useCallback(() => {
    // 1. Kiểm tra trạng thái đăng nhập của người dùng.
    if (!isLoggedIn) {
      // Nếu chưa đăng nhập, đặt thông báo yêu cầu đăng nhập.
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED);
      // Sử dụng setTimeout để chờ một chút (1 giây) trước khi thực hiện điều hướng,
      // giúp người dùng có thời gian đọc thông báo.
      const timer = setTimeout(() => {
        setSuccessMessage(""); // Xóa thông báo trước khi chuyển hướng.
        navigate("/login"); // Chuyển hướng người dùng đến trang đăng nhập.
      }, 1000); // Thời gian chờ là 1000ms (1 giây).
      // Cleanup function cho setTimeout để tránh memory leak nếu component unmount trước khi timer kết thúc.
      return () => clearTimeout(timer);
      // Dừng hàm, không thực hiện các bước tiếp theo nếu chưa đăng nhập.
    }

    // 2. Kiểm tra xem dữ liệu sản phẩm đã được tải và tìm thấy thành công chưa.
    // Đảm bảo state 'product' không phải là null hoặc undefined.
    if (!product) {
      console.warn("Không có dữ liệu sản phẩm hợp lệ để thêm vào giỏ."); // Ghi cảnh báo ra console nếu không có dữ liệu sản phẩm (có thể do đang loading hoặc có lỗi)
      // Có thể hiển thị một thông báo lỗi tạm thời trên UI nếu muốn, nhưng console warn là đủ cho trường hợp này.
      return; // Dừng hàm nếu không có dữ liệu sản phẩm hợp lệ để thêm vào giỏ.
    }

    // 3. Nếu đã đăng nhập và có dữ liệu sản phẩm, gọi hàm 'addToCart' từ CartContext.
    // Hàm addToCart (từ CartContext) được giả định sẽ xử lý việc thêm sản phẩm vào giỏ,
    // bao gồm cả việc tăng số lượng nếu sản phẩm đã tồn tại.
    addToCart(product); // Truyền đối tượng 'product' hiện tại vào hàm addToCart để thêm vào giỏ.

    // 4. Cập nhật UI: Hiển thị thông báo thêm vào giỏ thành công và điều hướng người dùng (tùy chọn).
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Đặt thông báo thành công "Thêm vào giỏ hàng thành công!".
    // Sử dụng setTimeout để chờ một chút (1 giây) trước khi chuyển hướng người dùng đến trang giỏ hàng (tùy chọn điều hướng tự động sau khi thêm).
    // Nếu không muốn tự động chuyển hướng, có thể bỏ khối setTimeout này.
    const timer = setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo sau khi hết thời gian chờ.
      navigate("/cart"); // Chuyển hướng người dùng đến route "/cart" (trang giỏ hàng).
    }, 1000); // Thời gian chờ là 1000ms (1 giây).

     // Cleanup function cho setTimeout để tránh memory leak nếu component unmount trước khi timer kết thúc.
     return () => clearTimeout(timer);

  }, [product, addToCart, isLoggedIn, navigate]); // Mảng dependencies: Hàm này phụ thuộc vào state 'product', hàm 'addToCart' (từ Context), state 'isLoggedIn' (từ Context), và hàm 'navigate' (từ hook useNavigate). Khi bất kỳ dependency nào thay đổi, hàm handleAddToCart sẽ được tạo lại.

  // --- Render giao diện dựa trên trạng thái component (loading, error, hiển thị chi tiết) ---

  // Conditional Rendering: Nếu state 'isLoading' là true, hiển thị giao diện loading spinner.
  if (isLoading) {
    return (
      <div className="loading-container">
        {" "}
        {/* Container bao quanh spinner và text loading */}
        <div className="loading-spinner"></div>{" "}
        {/* Biểu tượng spinner quay */}
        <p className="loading-text">{MESSAGES.LOADING}</p>{" "}
        {/* Hiển thị thông báo "Đang tải..." lấy từ hằng số */}
      </div>
    );
  }

  // Conditional Rendering: Nếu state 'error' có giá trị (khác null hoặc chuỗi rỗng), hiển thị thông báo lỗi.
  if (error) {
    return (
      <div className="product-detail error-state">
        {" "}
        {/* Container hiển thị trạng thái lỗi */}
        <p className="error-message">❌ {error}</p>{" "}
        {/* Hiển thị nội dung thông báo lỗi */}
        {/* Nhóm các nút hành động ở trạng thái lỗi */}
        <div className="button-group">
          {/* Nút "Quay lại trang chủ" sử dụng component Link để điều hướng SPA */}
          <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
            ⬅ Quay lại{" "}
            {/* Nội dung nút */}
          </Link>
        </div>
      </div>
    );
  }

  // Kiểm tra cuối cùng: Nếu không loading, không có lỗi, nhưng state 'product' vẫn là null.
  // Tình huống này hiếm xảy ra nếu logic xử lý lỗi và tìm sản phẩm ở trên đã đúng,
  // nhưng kiểm tra này vẫn an toàn để tránh lỗi render khi product là null.
  // Nếu product là null tại điểm này, có nghĩa là sản phẩm không tìm thấy và đã được xử lý
  // (thông báo lỗi "Sản phẩm không tồn tại!" đã được đặt và hiển thị ở khối if (error) bên trên).
  if (!product) {
       return null; // Không render gì thêm nếu không có dữ liệu sản phẩm hợp lệ để hiển thị chi tiết.
  }


  // --- Render giao diện chi tiết sản phẩm khi dữ liệu đã tải xong và sản phẩm được tìm thấy ---
  // Nếu component không ở trạng thái loading, không có lỗi, và có dữ liệu product hợp lệ, hiển thị chi tiết sản phẩm.
  return (
    <div className="product-detail">
      {" "}
      {/* Container chính bao bọc toàn bộ nội dung của trang chi tiết sản phẩm */}
      {/* Phần nội dung chính của sản phẩm: hình ảnh, tên, giá, mô tả, thông số kỹ thuật */}
      <section className="product-content">
        <h2>{product.name}</h2>{" "}
        {/* Hiển thị tên sản phẩm (lấy từ state 'product') */}
        {/* Hình ảnh sản phẩm */}
        <img
          src={product.image} // Đường dẫn ảnh sản phẩm
          alt={product.name} // Alt text cho ảnh, sử dụng tên sản phẩm (quan trọng cho SEO và khả năng tiếp cận)
          className="product-image" // Class CSS để định dạng ảnh
          loading="lazy" // Thuộc tính giúp trình duyệt chỉ tải ảnh khi nó hiển thị trên màn hình, cải thiện hiệu suất tải trang ban đầu
        />
        {/* Phần hiển thị giá sản phẩm */}
        <div className="price-section">
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ{" "}
            {/* Hiển thị giá sản phẩm, định dạng theo tiền tệ Việt Nam */}
          </p>
        </div>
        <p className="description">{product.description}</p>{" "}
        {/* Hiển thị mô tả sản phẩm */}
        {/* Phần hiển thị thông số kỹ thuật */}
        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3>{" "}
          {/* Tiêu đề cho phần thông số kỹ thuật */}
          <ul>
            {" "}
            {/* Danh sách không có thứ tự để hiển thị các thông số */}
            {/* Hiển thị từng thông số kỹ thuật. Sử dụng toán tử OR (||) để cung cấp một chuỗi mặc định
                ("Không có thông tin") nếu thuộc tính tương ứng trong đối tượng 'product' không tồn tại, là null, undefined, hoặc rỗng. */}
            <li>📱 Màn hình: {product.screen || "Không có thông tin"}</li>
            <li>⚡ Chip: {product.chip || "Không có thông tin"}</li>
            <li>💾 RAM: {product.ram || "Không có thông tin"}</li>
            <li>💽 Bộ nhớ: {product.storage || "Không có thông tin"}</li>
            <li>📷 Camera: {product.camera || "Không có thông tin"}</li>
            <li>🔋 Pin: {product.battery || "Không có thông tin"}</li>
          </ul>
        </div>
        {/* Hiển thị thông báo thành công (ví dụ: "Thêm vào giỏ thành công!") hoặc
            thông báo yêu cầu đăng nhập nếu state 'successMessage' có giá trị (khác chuỗi rỗng). */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>
      {/* --- Nhóm các nút hành động --- */}
      {/* Container chứa các nút "Thêm vào giỏ hàng" và "Quay lại" */}
      <div className="button-group">
        {/* Nút "Thêm vào giỏ hàng" */}
        <button
          className="add-to-cart" // Class CSS để định dạng nút
          onClick={handleAddToCart} // Gắn hàm xử lý sự kiện click nút (đã memoize bằng useCallback)
          disabled={!product} // Vô hiệu hóa nút nếu state 'product' là null (ví dụ: đang loading hoặc có lỗi tìm sản phẩm)
          aria-label={`Thêm ${product?.name || 'sản phẩm này'} vào giỏ hàng`} // Thuộc tính hỗ trợ khả năng tiếp cận. Sử dụng optional chaining (?.) để tránh lỗi nếu product là null.
        >
          🛒 Thêm vào giỏ{" "}
          {/* Nội dung hiển thị trên nút */}
        </button>
        {/* Nút "Quay lại" để điều hướng người dùng về trang chủ hoặc trang danh sách sản phẩm */}
        <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
          ⬅ Quay lại{" "}
          {/* Nội dung nút/liên kết */}
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Export component ProductDetail làm default export để có thể sử dụng ở các file khác (thường là trong cấu hình định tuyến của React Router)