import React, { useEffect, useState, useCallback } from "react"; // Import các hook cần thiết từ thư viện React: useEffect để thực hiện các tác vụ phụ (side effects), useState để quản lý trạng thái cục bộ, và useCallback để ghi nhớ (memoize) các hàm xử lý sự kiện nhằm tối ưu hiệu suất
import { Link } from "react-router-dom"; // Import component Link từ react-router-dom để tạo các liên kết điều hướng trong ứng dụng SPA (Single Page Application) mà không tải lại toàn bộ trang
import Slider from "react-slick"; // Import thư viện slider phổ biến (react-slick) để tạo banner quảng cáo dạng carousel
import "slick-carousel/slick/slick.css"; // Import file CSS mặc định của thư viện react-slick (bắt buộc)
import "slick-carousel/slick/slick-theme.css"; // Import file CSS theme mặc định của thư viện react-slick (bạn có thể thay thế bằng CSS tùy chỉnh của mình)
import "./ProductPage.css"; // Import file CSS tùy chỉnh để định dạng giao diện cho component ProductPage này

// --- Hằng số ---

// URL hoặc đường dẫn tới nguồn dữ liệu sản phẩm.
// Sử dụng `${process.env.PUBLIC_URL}/db.json` để tham chiếu đến file db.json trong thư mục 'public'.
// Điều này đảm bảo đường dẫn hoạt động đúng trong cả môi trường phát triển và production khi deploy.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Số lượng sản phẩm tối đa sẽ hiển thị trên mỗi trang khi thực hiện phân trang.
const PRODUCTS_PER_PAGE = 6;
// Mảng chứa danh sách các tên thương hiệu có sẵn để người dùng lựa chọn lọc sản phẩm.
// "Tất cả" là một tùy chọn đặc biệt để hiển thị tất cả sản phẩm.
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

// Mảng chứa dữ liệu (text, hình ảnh, link) cho các slide (banner) hiển thị ở đầu trang bằng Slider.
const SLIDES = [
  {
    image:
      "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg", // Đường dẫn ảnh cho slide 1
    title: "iPhone 16 Pro Max", // Tiêu đề chính của slide 1
    subtitle: "Thiết kế Titan tuyệt đẹp.", // Phụ đề/mô tả ngắn cho slide 1
    features: [
      "Trả góp lên đến 3 TRIỆU", // Danh sách các đặc điểm nổi bật hoặc ưu đãi dạng bullet points
      "Khách hàng mới GIẢM 300K",
      "Góp 12 Tháng từ 76K/Ngày",
    ],
    link: "/products/4", // Đường dẫn điều hướng khi người dùng click vào slide hoặc nút "Mua ngay"
    buttonText: "Mua ngay", // Nội dung hiển thị trên nút hành động
  },
  {
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_1__3.png",
    title: "Samsung Galaxy S25 Ultra",
    subtitle: "Công nghệ AI tiên tiến.",
    features: [
      "Giảm ngay 2 TRIỆU",
      "Tặng kèm sạc nhanh 45W",
      "Bảo hành chính hãng 2 năm",
    ],
    link: "/products/1",
    buttonText: "Mua ngay",
  },
  {
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15-ultra_12_.png",
    title: "Xiaomi 15 Ultra",
    subtitle: "Camera 200MP Leica đỉnh cao.",
    features: [
      "Trả góp 0% lãi suất",
      "Giảm 500K khi thanh toán online",
      "Tặng tai nghe Xiaomi Buds 4",
    ],
    link: "/products/3",
    buttonText: "Mua ngay",
  },
];

// --- Hàm gọi API để lấy dữ liệu sản phẩm ---
// Hàm async thực hiện việc gửi yêu cầu fetch dữ liệu từ API_URL.
// Nhận 'signal' từ AbortController để có thể hủy yêu cầu fetch nếu component unmount trước khi hoàn thành.
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Thực hiện yêu cầu fetch tới API_URL với signal
  // Kiểm tra thuộc tính 'ok' của response để xác định yêu cầu có thành công hay không (status code 200-299).
  if (!response.ok) {
    // Nếu response không OK, ném ra một đối tượng Error mới với thông báo lỗi.
    throw new Error("Không thể tải sản phẩm!"); // Sử dụng một chuỗi thông báo cố định.
  }
  const data = await response.json(); // Parse body của response thành đối tượng/mảng JavaScript từ JSON.
  // Trả về mảng sản phẩm. Kiểm tra cấu trúc dữ liệu nhận được:
  // Nếu 'data' bản thân nó là một mảng (Array.isArray(data) là true), trả về 'data'.
  // Nếu 'data' là một đối tượng VÀ có thuộc tính 'products' là mảng, trả về 'data.products'.
  // Nếu không khớp với hai trường hợp trên, trả về một mảng rỗng [].
  return Array.isArray(data) ? data : data.products || [];
};

// --- Component con: ProductCard (Hiển thị thông tin chi tiết một sản phẩm dưới dạng thẻ) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering. Component chỉ render lại khi props của nó thay đổi.
const ProductCard = React.memo(({ product }) => {
  // Thực hiện kiểm tra cơ bản để đảm bảo dữ liệu sản phẩm hợp lệ trước khi cố gắng render.
  if (
    !product?.id || // ID phải tồn tại và không null/undefined
    !product.name || // Tên sản phẩm phải tồn tại
    !product.image || // Đường dẫn ảnh phải tồn tại
    typeof product.price !== "number" // Giá phải là một số
  ) {
    console.error("Invalid product data:", product); // Ghi log lỗi ra console nếu dữ liệu không hợp lệ
    return null; // Trả về null để không render bất cứ thứ gì cho dữ liệu sản phẩm không hợp lệ.
  }

  return (
    <div className="product-card">
      {" "}
      {/* Container chính cho một thẻ sản phẩm riêng lẻ */}
      {/* Liên kết (Link) bao quanh hình ảnh sản phẩm. Khi click vào ảnh, sẽ điều hướng đến trang chi tiết sản phẩm. */}
      {/* 'to={`/products/${product.id}`}' tạo đường dẫn động dựa trên ID của sản phẩm. */}
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        {" "}
        {/* 'aria-label' cung cấp mô tả cho người dùng trình đọc màn hình */}
        {/* Hình ảnh sản phẩm */}
        <img
          src={product.image} // Đường dẫn ảnh
          alt={product.name} // Alt text cho ảnh, sử dụng tên sản phẩm
          className="product-image" // Class CSS để định dạng ảnh
          loading="lazy" // Thuộc tính HTML5 yêu cầu trình duyệt tải ảnh theo chế độ lazy loading (tải khi ảnh gần hiển thị), cải thiện hiệu suất ban đầu.
        />
      </Link>
      <h3>{product.name}</h3> {/* Tiêu đề (thẻ h3) hiển thị tên sản phẩm */}
      {/* Đoạn văn bản hiển thị giá sản phẩm, định dạng theo tiền tệ Việt Nam. */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>{" "}
      {/* toLocaleString("vi-VN") định dạng số thành chuỗi tiền tệ VNĐ */}
      {/* Nút (Link) "Xem chi tiết" dẫn đến trang chi tiết sản phẩm */}
      <Link
        to={`/products/${product.id}`} // Đường dẫn đến trang chi tiết sản phẩm
        className="view-details-button" // Class CSS để định dạng nút
        aria-label={`Xem chi tiết ${product.name}`} // Thuộc tính hỗ trợ khả năng tiếp cận
      >
        Xem chi tiết{" "}
        {/* Nội dung hiển thị trên nút */}
      </Link>
    </div>
  );
});

// --- Component con: Pagination (Hiển thị các nút điều hướng phân trang) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering. Component chỉ render lại khi props của nó thay đổi.
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Nếu tổng số trang nhỏ hơn hoặc bằng 1, không hiển thị bộ phân trang.
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {" "}
      {/* Container cho bộ phận phân trang */}
      {/* Nút "Trang trước". Bị vô hiệu hóa nếu đang ở trang đầu tiên (currentPage là 1). */}
      <button
        onClick={() => onPageChange(currentPage - 1)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onPageChange' (truyền qua props) với số trang mới là trang hiện tại trừ đi 1.
        disabled={currentPage === 1} // Thuộc tính 'disabled' dựa vào điều kiện.
        className="pagination-button" // Class CSS
      >
        Trang trước{" "}
        {/* Nội dung nút */}
      </button>
      {/* Hiển thị thông tin trang hiện tại. */}
      <span className="pagination-current">Trang {currentPage}</span>{" "}
      {/* Hiển thị số trang hiện tại */}
      {/* Nút "Trang sau". Bị vô hiệu hóa nếu đang ở trang cuối cùng (currentPage bằng totalPages). */}
      <button
        onClick={() => onPageChange(currentPage + 1)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onPageChange' với số trang mới là trang hiện tại cộng thêm 1.
        disabled={currentPage === totalPages} // Thuộc tính 'disabled' dựa vào điều kiện.
        className="pagination-button" // Class CSS
      >
        Trang sau{" "}
        {/* Nội dung nút */}
      </button>
    </div>
  );
});

// --- Component con: BrandFilter (Hiển thị các nút lọc theo thương hiệu) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering. Component chỉ render lại khi props của nó thay đổi.
const BrandFilter = React.memo(({ brands, selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {" "}
    {/* Container cho nhóm nút lọc theo thương hiệu */}
    {/* Lặp (map) qua mảng 'brands' để tạo một nút button cho mỗi thương hiệu */}
    {brands.map((brand) => (
      <button
        key={brand} // Key duy nhất cho mỗi nút trong danh sách (tên thương hiệu là duy nhất)
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Thêm class CSS 'active' vào nút nếu tên thương hiệu của nút đó trùng với 'selectedBrand' hiện tại
        onClick={() => onBrandSelect(brand)} // Gắn hàm xử lý sự kiện click. Gọi hàm 'onBrandSelect' (truyền qua props) với tên thương hiệu của nút đó.
      >
        {brand}{" "}
        {/* Nội dung hiển thị trên nút (tên thương hiệu) */}
      </button>
    ))}
  </div>
));

// --- Component con: Slide (Hiển thị nội dung một slide trong carousel) ---
// Sử dụng React.memo() để tối ưu hóa hiệu suất rendering. Component chỉ render lại khi props của nó thay đổi.
const Slide = React.memo(({ slide }) => (
  <div className="slide">
    {" "}
    {/* Container chính cho một slide */}
    <div className="slide-content">
      {" "}
      {/* Container chứa nội dung bên trong slide. Sử dụng flexbox để căn chỉnh ảnh và text. */}
      <div className="slide-text">
        {" "}
        {/* Phần bên trái chứa văn bản (tiêu đề, phụ đề, đặc điểm) */}
        <h2>{slide.title}</h2> {/* Tiêu đề chính của slide */}
        <h3>{slide.subtitle}</h3> {/* Phụ đề của slide */}
        <ul>
          {" "}
          {/* Danh sách các đặc điểm hoặc ưu đãi */}
          {/* Lặp (map) qua mảng 'features' của slide để tạo các list item */}
          {slide.features.map((feature, i) => (
            <li key={i}>{feature}</li> // Hiển thị từng đặc điểm. Sử dụng index làm key (an toàn nếu mảng features không thay đổi thứ tự).
          ))}
        </ul>
      </div>
      <div className="slide-image">
        {" "}
        {/* Phần bên phải chứa hình ảnh của slide */}
        <img src={slide.image} alt={slide.title} loading="lazy" />{" "}
        {/* Hình ảnh slide, sử dụng tiêu đề làm alt text, lazy loading */}
      </div>
      {/* Nút hành động (ví dụ: "Mua ngay"), sử dụng component Link để điều hướng đến trang chi tiết sản phẩm hoặc trang khác. */}
      <Link to={slide.link} className="slide-button">
        {" "}
        {/* 'to={slide.link}' là đường dẫn đích */}
        {slide.buttonText}{" "}
        {/* Nội dung hiển thị trên nút */}
      </Link>
    </div>
  </div>
));

// --- Component chính: ProductPage (Trang hiển thị danh sách sản phẩm) ---
// Đây là functional component hiển thị toàn bộ nội dung của trang danh sách sản phẩm.
const ProductPage = () => {
  // --- State quản lý dữ liệu và trạng thái của component ---
  // State 'products': Lưu trữ TOÀN BỘ danh sách sản phẩm gốc được fetch từ API. Mảng này không thay đổi khi áp dụng lọc/tìm kiếm/sắp xếp. Ban đầu là mảng rỗng [].
  const [products, setProducts] = useState([]);
  // State 'filteredProducts': Lưu trữ danh sách sản phẩm SAU KHI đã áp dụng các bộ lọc (thương hiệu, tìm kiếm) và sắp xếp. Đây là mảng được dùng để hiển thị. Ban đầu là mảng rỗng [].
  const [filteredProducts, setFilteredProducts] = useState([]);
  // State 'isLoading': Boolean theo dõi trạng thái đang tải dữ liệu ban đầu từ API. Ban đầu là true.
  const [isLoading, setIsLoading] = useState(true);
  // State 'error': Lưu trữ thông báo lỗi (chuỗi) nếu quá trình fetch dữ liệu gặp vấn đề. Ban đầu là null.
  const [error, setError] = useState(null);
  // State 'currentPage': Lưu trữ số trang hiện tại đang hiển thị trong bộ phân trang. Ban đầu là 1.
  const [currentPage, setCurrentPage] = useState(1);
  // State 'filters': Đối tượng lưu trữ trạng thái hiện tại của các bộ lọc. Bao gồm 'brand' (thương hiệu được chọn) và 'search' (từ khóa tìm kiếm).
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });
  // State 'isSearching': Boolean theo dõi liệu bộ lọc/tìm kiếm có đang được áp dụng và xử lý hay không (để hiển thị spinner hoặc hiệu ứng). Ban đầu là false.
  const [isSearching, setIsSearching] = useState(false);
  // State 'showNoResults': Boolean theo dõi liệu có nên hiển thị thông báo "Không có sản phẩm nào phù hợp" hay không. Ban đầu là false.
  const [showNoResults, setShowNoResults] = useState(false);

  // --- Cài đặt cho Slider carousel (component của react-slick) ---
  // Đối tượng chứa các tùy chọn cấu hình cho Slider.
  const sliderSettings = {
    dots: true, // Hiển thị các chỉ số slide (dạng chấm) ở dưới carousel
    infinite: true, // Cho phép lặp lại các slide vô hạn sau khi đến slide cuối cùng
    speed: 500, // Tốc độ chuyển động giữa các slide (miliseconds)
    slidesToShow: 1, // Số lượng slide hiển thị cùng lúc trong viewport
    slidesToScroll: 1, // Số lượng slide cuộn đi sau mỗi lần chuyển (tự động hoặc bằng nút)
    autoplay: true, // Tự động chuyển slide sau mỗi khoảng thời gian
    autoplaySpeed: 3000, // Khoảng thời gian chờ trước khi tự động chuyển slide tiếp theo (miliseconds)
    arrows: true, // Hiển thị các mũi tên điều hướng (trước/sau)
  };

  // --- Effect hook để tải dữ liệu sản phẩm từ API khi component mount ---
  // Effect này là nơi thực hiện việc fetch dữ liệu sản phẩm ban đầu.
  useEffect(() => {
    // Tạo một instance của AbortController. Được dùng để hủy yêu cầu fetch nếu component bị hủy trước khi fetch hoàn thành.
    const controller = new AbortController();
    const signal = controller.signal; // Lấy signal từ controller để truyền vào tùy chọn của fetch().

    // Định nghĩa một hàm async để thực hiện quá trình tải dữ liệu và cập nhật state.
    const load = async () => {
      try {
        setIsLoading(true); // Bắt đầu quá trình tải, đặt state 'isLoading' thành true.
        setError(null); // Xóa thông báo lỗi cũ nếu có.

        // Gọi hàm fetchProducts để lấy dữ liệu từ API, truyền signal để có thể hủy.
        const productList = await fetchProducts(signal);
        setProducts(productList); // Cập nhật state 'products' (danh sách gốc) với dữ liệu vừa tải.
        setFilteredProducts(productList); // Ban đầu, danh sách sản phẩm đã lọc cũng chính là danh sách gốc.
        // Không cần đặt showNoResults ở đây ngay lập tức. Logic trong effect lọc (useEffect thứ hai) sẽ xử lý sau.
      } catch (err) {
        // Bắt các lỗi xảy ra trong quá trình fetch.
        // Kiểm tra nếu lỗi KHÔNG phải là AbortError (lỗi do cleanup hủy yêu cầu).
        if (err.name !== "AbortError") {
          console.error("Error fetching products:", err); // Ghi log lỗi thật ra console.
          setError(err.message); // Cập nhật state 'error' với thông báo lỗi để hiển thị trên UI.
          setProducts([]); // Đặt state 'products' về mảng rỗng khi có lỗi fetch.
          setFilteredProducts([]); // Đảm bảo 'filteredProducts' cũng rỗng khi có lỗi.
          setShowNoResults(true); // Hiển thị thông báo "Không có kết quả" nếu fetch lỗi hoặc trả về danh sách rỗng.
        }
        // Nếu là AbortError, bỏ qua vì đó là lỗi do cleanup xử lý.
      } finally {
        // Khối finally luôn chạy sau try/catch (trừ khi có lỗi nghiêm trọng không thể phục hồi).
        setIsLoading(false); // Kết thúc quá trình tải, đặt state 'isLoading' thành false.
      }
    };

    load(); // Gọi hàm load() để bắt đầu quá trình tải dữ liệu khi component mount.

    // Hàm cleanup cho effect này. Chạy khi component unmount hoặc khi dependencies thay đổi và effect sắp chạy lại.
    return () => controller.abort(); // Hủy yêu cầu fetch API đang chờ xử lý nếu nó vẫn chưa hoàn thành. Giúp tránh memory leaks và các vấn đề liên quan đến cập nhật state trên component đã bị hủy.
  }, []); // Mảng dependencies rỗng []: Đảm bảo effect này chỉ chạy MỘT LẦN duy nhất sau lần render đầu tiên (tương tự lifecycle method componentDidMount).

  // --- Effect hook để áp dụng các bộ lọc (tìm kiếm và thương hiệu) và sắp xếp ---
  // Effect này chạy mỗi khi state 'filters' hoặc state 'products' thay đổi.
  useEffect(() => {
    let filtered = [...products]; // Tạo một bản sao của danh sách sản phẩm gốc ('products') để làm việc, tránh sửa đổi trực tiếp state gốc.

    // 1. Lọc theo thương hiệu: Nếu bộ lọc thương hiệu hiện tại KHÔNG phải là "Tất cả"
    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter((p) => p.brand === filters.brand); // Lọc và chỉ giữ lại các sản phẩm có thuộc tính 'brand' trùng khớp với 'filters.brand'.
    }

    // 2. Lọc theo từ khóa tìm kiếm: Nếu có từ khóa tìm kiếm (kiểm tra sau khi loại bỏ khoảng trắng ở đầu/cuối không rỗng)
    if (filters.search.trim()) {
      // Lọc và chỉ giữ lại các sản phẩm có thuộc tính 'name' (sau khi chuyển sang chữ thường)
      // bao gồm (includes) chuỗi từ khóa tìm kiếm (sau khi loại bỏ khoảng trắng và chuyển sang chữ thường).
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // --- Logic Debouncing và cập nhật UI ---
    setIsSearching(true); // Đặt state 'isSearching' thành true để báo hiệu rằng đang có quá trình lọc/tìm kiếm (có thể hiển thị spinner hoặc hiệu ứng).
    setShowNoResults(false); // Ẩn thông báo "Không có kết quả" trong khi đang xử lý tìm kiếm mới.

    // Sử dụng setTimeout để tạo hiệu ứng "debounce". Logic cập nhật state 'filteredProducts' và 'isSearching'
    // sẽ chỉ được thực thi sau khi người dùng ngừng gõ hoặc thay đổi bộ lọc trong một khoảng thời gian nhất định (500ms).
    // Điều này giúp giảm số lần cập nhật UI không cần thiết khi người dùng gõ nhanh liên tục vào ô tìm kiếm.
    const timeout = setTimeout(() => {
      setFilteredProducts(filtered); // Cập nhật state 'filteredProducts' với danh sách sản phẩm đã lọc cuối cùng.
      setIsSearching(false); // Kết thúc trạng thái đang tìm kiếm.
      // Sau khi quá trình lọc/tìm kiếm hoàn tất, kiểm tra xem danh sách kết quả ('filtered') có rỗng không.
      // Nếu rỗng, đặt state 'showNoResults' thành true để hiển thị thông báo "Không có sản phẩm nào phù hợp".
      setShowNoResults(filtered.length === 0);
      setCurrentPage(1); // Luôn reset về trang 1 mỗi khi áp dụng bộ lọc mới hoặc khi danh sách sản phẩm gốc thay đổi.
    }, 500); // Độ trễ là 500 miliseconds.

    // Hàm cleanup cho effect này: Chạy khi state 'filters' hoặc 'products' thay đổi (trước khi effect mới chạy lại)
    // hoặc khi component unmount.
    // Xóa bỏ hẹn giờ đã tạo (timeout) để ngăn hàm callback bên trong setTimeout chạy
    // nếu một thay đổi khác đến trước khi timeout cũ kết thúc.
    return () => clearTimeout(timeout);
  }, [filters, products]); // Mảng dependencies: Effect chạy lại mỗi khi state 'filters' hoặc state 'products' thay đổi.

  // --- Hàm xử lý khi chuyển trang (trong phân trang) ---
  // Nhận số trang mới cần chuyển đến ('page').
  // Sử dụng useCallback để ghi nhớ hàm này. Hàm sẽ được tạo lại khi state 'filteredProducts' thay đổi.
  // Điều này là cần thiết vì logic giới hạn số trang hợp lệ phụ thuộc vào tổng số trang, mà tổng số trang lại phụ thuộc vào 'filteredProducts'.
  const handlePageChange = useCallback(
    (page) => {
      // Tính toán số trang mới, đảm bảo nó nằm trong khoảng hợp lệ từ 1 đến tổng số trang ('totalPages').
      // Math.max(1, page) đảm bảo số trang không nhỏ hơn 1.
      // Math.min(..., totalPages) đảm bảo số trang không lớn hơn tổng số trang.
      const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tính lại tổng số trang (phụ thuộc vào filteredProducts)
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage); // Cập nhật state 'currentPage' với số trang mới đã được giới hạn hợp lệ.
    },
    [filteredProducts] // Mảng dependencies: Hàm phụ thuộc vào state 'filteredProducts' (để tính tổng số trang).
  );

  // --- Hàm xử lý khi giá trị của input tìm kiếm hoặc input khác trong filter-section thay đổi ---
  // Nhận sự kiện thay đổi (change event 'e').
  const handleFilterChange = (e) => {
    const { name, value } = e.target; // Lấy thuộc tính 'name' và 'value' của input đã thay đổi.
    // Cập nhật state 'filters'. Sử dụng functional update để đảm bảo cập nhật dựa trên giá trị trước đó ('prev').
    // Tạo một bản sao của state 'filters' hiện tại (...prev) và ghi đè lên thuộc tính có tên [name] với giá trị mới 'value'.
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Lưu ý: Việc cập nhật state 'filters' sẽ kích hoạt effect hook thứ hai (useEffect([filters, products])) để thực hiện lọc lại.
  };

  // --- Hàm xử lý khi người dùng chọn một thương hiệu từ bộ lọc nút ---
  // Nhận tên thương hiệu ('brand') được chọn.
  const handleBrandSelect = (brand) => {
    // Cập nhật state 'filters'. Đặt lại chỉ thuộc tính 'brand' thành tên thương hiệu mới được chọn.
    setFilters((prev) => ({ ...prev, brand }));
    // Việc cập nhật state 'filters' này cũng sẽ kích hoạt effect hook thứ hai để thực hiện lọc lại.
  };

  // --- Hàm xử lý sắp xếp sản phẩm theo giá từ thấp đến cao ---
  const sortLowToHigh = () => {
    // Tạo một bản sao của mảng 'filteredProducts' hiện tại ([...filteredProducts]).
    // Sử dụng phương thức .sort() để sắp xếp bản sao này.
    // Hàm so sánh (a, b) => a.price - b.price sẽ sắp xếp tăng dần theo giá (a đứng trước b nếu giá a nhỏ hơn giá b).
    setFilteredProducts([...filteredProducts].sort((a, b) => a.price - b.price)); // Cập nhật state 'filteredProducts' với mảng đã sắp xếp.
    setCurrentPage(1); // Reset về trang 1 sau khi sắp xếp.
  };

  // --- Hàm xử lý sắp xếp sản phẩm theo giá từ cao đến thấp ---
  const sortHighToLow = () => {
    // Tạo một bản sao của mảng 'filteredProducts' hiện tại ([...filteredProducts]).
    // Sử dụng phương thức .sort() để sắp xếp bản sao này.
    // Hàm so sánh (a, b) => b.price - a.price sẽ sắp xếp giảm dần theo giá (b đứng trước a nếu giá b lớn hơn giá a).
    setFilteredProducts([...filteredProducts].sort((a, b) => b.price - a.price)); // Cập nhật state 'filteredProducts' với mảng đã sắp xếp.
    setCurrentPage(1); // Reset về trang 1 sau khi sắp xếp.
  };

  // --- Hàm xử lý reset lại tất cả các bộ lọc (thương hiệu và tìm kiếm) ---
  const resetFilters = () => {
    // Đặt lại state 'filters' về giá trị mặc định ban đầu ("Tất cả" thương hiệu, tìm kiếm rỗng).
    setFilters({ brand: "Tất cả", search: "" });
    setFilteredProducts(products); // Đặt lại danh sách sản phẩm hiển thị về toàn bộ danh sách gốc ('products').
    setCurrentPage(1); // Reset về trang 1.
  };

  // --- Tính toán các giá trị dẫn xuất từ state ---
  // Các giá trị này được tính toán mỗi khi state liên quan thay đổi và component re-render.

  // Tính tổng số trang cần thiết cho phân trang dựa trên số lượng sản phẩm đã lọc và số sản phẩm trên mỗi trang.
  // Math.ceil() đảm bảo làm tròn lên để có đủ trang cho những sản phẩm lẻ.
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  // Tính chỉ số (index) bắt đầu của slice mảng 'filteredProducts' để lấy ra các sản phẩm cho trang hiện tại.
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  // Tính chỉ số (index) kết thúc (không bao gồm) của slice mảng 'filteredProducts'.
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  // Lấy ra mảng con chứa các sản phẩm chỉ hiển thị trên trang hiện tại bằng phương thức .slice().
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // --- Render giao diện dựa trên trạng thái loading và lỗi ---

  // Nếu state 'isLoading' là true (đang tải dữ liệu ban đầu), hiển thị giao diện loading spinner.
  if (isLoading) {
    return (
      <div className="loading-container">
        {" "}
        {/* Container cho giao diện loading */}
        <div className="loading-spinner"></div>{" "}
        {/* Biểu tượng spinner quay */}
        <p className="loading-text">Đang tải...</p>{" "}
        {/* Thông báo "Đang tải..." */}
      </div>
    );
  }

  // Nếu state 'error' có giá trị (khác null), hiển thị thông báo lỗi.
  if (error) {
    return (
      <div className="status error">
        {" "}
        {/* Container cho thông báo lỗi */}
        <p>❌ {error}</p>{" "}
        {/* Hiển thị nội dung thông báo lỗi */}
        {/* Nút "Thử lại", khi click sẽ tải lại toàn bộ trang trình duyệt để thử fetch lại dữ liệu. */}
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại{" "}
          {/* Nội dung nút */}
        </button>
      </div>
    );
  }

  // --- Render giao diện chính của trang sản phẩm khi dữ liệu đã tải xong và không có lỗi ---
  // Đây là phần giao diện hiển thị sau khi quá trình tải dữ liệu ban đầu hoàn tất thành công.
  return (
    <main className="product-page">
      {" "}
      {/* Thẻ <main> bao bọc nội dung chính của trang */}
      {/* Phần hiển thị Carousel (banner quảng cáo) ở đầu trang */}
      <div className="carousel-section">
        {/* Sử dụng component Slider từ react-slick. Thuộc tính {...sliderSettings} áp dụng tất cả các cài đặt đã định nghĩa trước đó. */}
        <Slider {...sliderSettings}>
          {/* Lặp (map) qua mảng SLIDES (chứa dữ liệu cho các banner) */}
          {SLIDES.map((slide, i) => (
            <Slide key={i} slide={slide} /> // Render component con Slide cho mỗi banner. Sử dụng index làm key (an toàn vì mảng SLIDES cố định).
          ))}
        </Slider>
      </div>

      {/* Tiêu đề chính của trang danh sách sản phẩm */}
      <h1 className="page-title">Danh sách sản phẩm</h1>{" "}
      {/* Tiêu đề trang */}

      {/* Phần chứa các bộ lọc và sắp xếp sản phẩm */}
      <div className="filter-section">
        {" "}
        {/* Container cho các bộ điều khiển lọc và sắp xếp */}
        {/* Input để tìm kiếm sản phẩm theo tên */}
        <input
          type="text" // Kiểu input là text
          name="search" // Tên của input, dùng để cập nhật state 'filters'
          className="search-input" // Class CSS
          placeholder="Tìm kiếm sản phẩm..." // Placeholder
          value={filters.search} // Gán giá trị từ state 'filters.search' (Controlled Component)
          onChange={handleFilterChange} // Gắn hàm xử lý sự kiện thay đổi input.
          aria-label="Tìm kiếm sản phẩm theo tên" // Thuộc tính hỗ trợ khả năng tiếp cận
        />
        {/* Component BrandFilter để hiển thị các nút lọc theo thương hiệu */}
        <BrandFilter
          brands={BRANDS} // Truyền danh sách các thương hiệu có sẵn (từ hằng số)
          selectedBrand={filters.brand} // Truyền thương hiệu hiện tại đang được chọn từ state 'filters'
          onBrandSelect={handleBrandSelect} // Truyền hàm xử lý khi người dùng chọn một thương hiệu từ bộ lọc
        />
        {/* Nút để sắp xếp danh sách sản phẩm theo giá từ thấp đến cao */}
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao{" "}
          {/* Nội dung nút */}
        </button>
        {/* Nút để sắp xếp danh sách sản phẩm theo giá từ cao đến thấp */}
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp{" "}
          {/* Nội dung nút */}
        </button>
      </div>

      {/* Khu vực hiển thị danh sách sản phẩm hoặc các thông báo trạng thái khác */}
      <div className="product-list">
        {" "}
        {/* Container chính hiển thị danh sách sản phẩm hoặc thông báo */}
        {/* Conditional Rendering: Hiển thị spinner nếu đang tìm kiếm, thông báo "Không có kết quả" nếu không tìm thấy, hoặc lưới sản phẩm. */}
        {isSearching ? ( // Nếu state 'isSearching' là true
          <div className="loading-container">
            {" "}
            {/* Container cho spinner loading */}
            <div className="loading-spinner"></div>{" "}
            {/* Biểu tượng spinner quay */}
            <p className="loading-text">Đang tải...</p>{" "}
            {/* Thông báo "Đang tải..." */}
          </div>
        ) : showNoResults ? ( // Nếu KHÔNG đang tìm kiếm VÀ state 'showNoResults' là true (nghĩa là không có sản phẩm nào khớp bộ lọc)
          <div className="no-products-container">
            {" "}
            {/* Container thông báo không có kết quả */}
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>{" "}
            {/* Thông báo "Không có sản phẩm nào phù hợp" */}
            {/* Nút "Xóa bộ lọc", khi click sẽ gọi hàm resetFilters để đặt lại tất cả các bộ lọc. */}
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc{" "}
              {/* Nội dung nút */}
            </button>
          </div>
        ) : (
          // Nếu KHÔNG đang tìm kiếm VÀ state 'showNoResults' là false (nghĩa là có sản phẩm sau khi lọc)
          <div className="product-grid">
            {" "}
            {/* Container dạng lưới để hiển thị các thẻ sản phẩm */}
            {/* Lặp (map) qua mảng 'currentProducts' (các sản phẩm chỉ trên trang hiện tại)
                      để render một component ProductCard cho mỗi sản phẩm. */}
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} /> // Render component con ProductCard, truyền ID sản phẩm làm key và đối tượng product làm prop.
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị component Phân trang chỉ khi tổng số trang lớn hơn 1 */}
      {totalPages > 1 && ( // Kiểm tra nếu tổng số trang (totalPages) lớn hơn 1
        <Pagination
          currentPage={currentPage} // Truyền state 'currentPage' làm prop cho Pagination
          totalPages={totalPages} // Truyền biến 'totalPages' đã tính toán làm prop
          onPageChange={handlePageChange} // Truyền hàm xử lý chuyển trang ('handlePageChange', đã memoize) làm prop
        />
      )}
    </main>
  );
};

export default ProductPage; // Export component ProductPage làm default export để có thể sử dụng ở các file khác (thường là trong cấu hình định tuyến)