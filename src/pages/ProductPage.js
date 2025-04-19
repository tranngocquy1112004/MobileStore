import React, { useEffect, useState, useCallback } from "react"; // Import các hook cần thiết từ React (useEffect, useState, useCallback)
import { Link } from "react-router-dom"; // Import Link từ react-router-dom để điều hướng giữa các trang mà không tải lại toàn bộ trang
import Slider from "react-slick"; // Import thư viện slider (react-slick) cho banner quảng cáo
import "slick-carousel/slick/slick.css"; // Import CSS mặc định của react-slick
import "slick-carousel/slick/slick-theme.css"; // Import CSS theme mặc định của react-slick
import "./ProductPage.css"; // Import CSS tùy chỉnh cho component ProductPage

// --- Hằng số ---

// URL hoặc đường dẫn tới nguồn dữ liệu sản phẩm (file JSON trong trường hợp này)
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Số lượng sản phẩm tối đa hiển thị trên mỗi trang khi phân trang
const PRODUCTS_PER_PAGE = 6;
// Mảng chứa danh sách các thương hiệu có sẵn để lọc sản phẩm
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

// Mảng chứa dữ liệu cho các slide (banner) hiển thị ở đầu trang
const SLIDES = [
  {
    image:
      "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg", // Đường dẫn ảnh cho slide này
    title: "iPhone 16 Pro Max", // Tiêu đề chính của slide
    subtitle: "Thiết kế Titan tuyệt đẹp.", // Phụ đề hoặc mô tả ngắn gọn
    features: [
      "Trả góp lên đến 3 TRIỆU", // Danh sách các đặc điểm nổi bật hoặc ưu đãi
      "Khách hàng mới GIẢM 300K",
      "Góp 12 Tháng từ 76K/Ngày",
    ],
    link: "/products/4", // Đường dẫn khi nhấn nút hoặc slide
    buttonText: "Mua ngay", // Nội dung hiển thị trên nút
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
// Hàm async thực hiện fetch dữ liệu. Nhận signal từ AbortController để có thể hủy yêu cầu.
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Thực hiện yêu cầu fetch tới API_URL
  // Kiểm tra nếu response không thành công (status code nằm ngoài khoảng 200-299)
  if (!response.ok) {
    throw new Error("Không thể tải sản phẩm!"); // Ném lỗi nếu response không OK
  }
  const data = await response.json(); // Parse body của response thành đối tượng/mảng JavaScript từ JSON
  // Trả về mảng sản phẩm. Kiểm tra cấu trúc dữ liệu nhận được, ưu tiên mảng trực tiếp hoặc thuộc tính 'products' nếu là object.
  return Array.isArray(data) ? data : data.products || [];
};

// --- Component con: ProductCard (Hiển thị thông tin một sản phẩm) ---
const ProductCard = React.memo(({ product }) => { // Sử dụng React.memo để tối ưu hóa, tránh re-render nếu props không đổi
  // Kiểm tra các thuộc tính cần thiết của sản phẩm để đảm bảo dữ liệu hợp lệ trước khi hiển thị
  if (
    !product?.id || // ID phải tồn tại
    !product.name || // Tên phải tồn tại
    !product.image || // Ảnh phải tồn tại
    typeof product.price !== "number" // Giá phải là kiểu số
  ) {
    console.error("Invalid product data:", product); // Ghi log lỗi nếu dữ liệu sản phẩm không hợp lệ
    return null; // Không render gì nếu dữ liệu không hợp lệ
  }

  return (
    <div className="product-card"> {/* Container chính cho thẻ sản phẩm */}
      {/* Liên kết (Link) bao quanh ảnh sản phẩm để dẫn đến trang chi tiết */}
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        {/* Hình ảnh sản phẩm. Sử dụng loading="lazy" để trình duyệt chỉ tải ảnh khi cần. */}
        <img
          src={product.image}
          alt={product.name} // Alt text cho ảnh, quan trọng cho SEO và khả năng tiếp cận
          className="product-image"
          loading="lazy"
        />
      </Link>
      <h3>{product.name}</h3> {/* Tiêu đề (Tên sản phẩm) */}
      {/* Đoạn văn bản hiển thị giá sản phẩm, định dạng theo tiền tệ Việt Nam (toLocaleString) */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      {/* Nút (Link) "Xem chi tiết" dẫn đến trang chi tiết sản phẩm */}
      <Link
        to={`/products/${product.id}`}
        className="view-details-button"
        aria-label={`Xem chi tiết ${product.name}`} // Aria label cho khả năng tiếp cận
      >
        Xem chi tiết
      </Link>
    </div>
  );
}); // Kết thúc React.memo

// --- Component con: Pagination (Hiển thị các nút phân trang) ---
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => { // Sử dụng React.memo để tối ưu hóa
  // Nếu chỉ có 1 trang, không cần hiển thị phân trang
  if (totalPages <= 1) return null;

  return (
    <div className="pagination"> {/* Container cho bộ phân trang */}
      {/* Nút "Trang trước". Disabled nếu đang ở trang 1. */}
      <button
        onClick={() => onPageChange(currentPage - 1)} // Gọi hàm onPageChange với trang trước đó
        disabled={currentPage === 1} // Vô hiệu hóa nút nếu currentPage là 1
        className="pagination-button"
      >
        Trang trước
      </button>
      {/* Hiển thị số trang hiện tại */}
      <span className="pagination-current">Trang {currentPage}</span>
      {/* Nút "Trang sau". Disabled nếu đang ở trang cuối cùng. */}
      <button
        onClick={() => onPageChange(currentPage + 1)} // Gọi hàm onPageChange với trang kế tiếp
        disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu currentPage bằng tổng số trang
        className="pagination-button"
      >
        Trang sau
      </button>
    </div>
  );
}); // Kết thúc React.memo

// --- Component con: BrandFilter (Hiển thị các nút lọc theo thương hiệu) ---
const BrandFilter = React.memo(({ brands, selectedBrand, onBrandSelect }) => ( // Sử dụng React.memo để tối ưu hóa
  <div className="brand-buttons"> {/* Container cho nhóm nút lọc */}
    {/* Map qua mảng brands để tạo các nút tương ứng */}
    {brands.map((brand) => (
      <button
        key={brand} // Key duy nhất cho mỗi nút trong danh sách
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Thêm class 'active' nếu thương hiệu này đang được chọn
        onClick={() => onBrandSelect(brand)} // Gọi hàm onBrandSelect với tên thương hiệu khi click
      >
        {brand} {/* Nội dung hiển thị trên nút (tên thương hiệu) */}
      </button>
    ))}
  </div>
)); // Kết thúc React.memo

// --- Component con: Slide (Hiển thị nội dung một slide trong carousel) ---
const Slide = React.memo(({ slide }) => ( // Sử dụng React.memo để tối ưu hóa
  <div className="slide"> {/* Container cho một slide */}
    <div className="slide-content"> {/* Nội dung bên trong slide (flex container) */}
      <div className="slide-text"> {/* Phần văn bản của slide */}
        <h2>{slide.title}</h2> {/* Tiêu đề */}
        <h3>{slide.subtitle}</h3> {/* Phụ đề */}
        <ul> {/* Danh sách các đặc điểm/ưu đãi */}
          {slide.features.map((feature, i) => (
            <li key={i}>{feature}</li> // Hiển thị từng đặc điểm
          ))}
        </ul>
      </div>
      <div className="slide-image"> {/* Phần hình ảnh của slide */}
        <img src={slide.image} alt={slide.title} loading="lazy" /> {/* Ảnh slide */}
      </div>
      {/* Nút hành động (Mua ngay), sử dụng Link để điều hướng */}
      <Link to={slide.link} className="slide-button">
        {slide.buttonText}
      </Link>
    </div>
  </div>
)); // Kết thúc React.memo


// --- Component chính: ProductPage (Trang hiển thị danh sách sản phẩm) ---
const ProductPage = () => {
  // --- State quản lý dữ liệu và trạng thái ---
  const [products, setProducts] = useState([]); // State lưu trữ TOÀN BỘ danh sách sản phẩm gốc từ API
  const [filteredProducts, setFilteredProducts] = useState([]); // State lưu trữ danh sách sản phẩm sau khi áp dụng lọc và tìm kiếm
  const [isLoading, setIsLoading] = useState(true); // State boolean theo dõi trạng thái tải dữ liệu ban đầu
  const [error, setError] = useState(null); // State lưu thông báo lỗi nếu quá trình tải dữ liệu gặp vấn đề
  const [currentPage, setCurrentPage] = useState(1); // State lưu trữ số trang hiện tại đang hiển thị
  // State object lưu trữ các bộ lọc hiện tại (thương hiệu và từ khóa tìm kiếm)
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });
  const [isSearching, setIsSearching] = useState(false); // State boolean theo dõi trạng thái đang áp dụng bộ lọc/tìm kiếm (để hiển thị spinner)
  // State boolean theo dõi trạng thái hiển thị thông báo "Không có kết quả"
  const [showNoResults, setShowNoResults] = useState(false);

  // --- Cài đặt cho Slider carousel ---
  const sliderSettings = {
    dots: true, // Hiển thị các chấm chỉ số slide
    infinite: true, // Cho phép lặp vô hạn các slide
    speed: 500, // Tốc độ chuyển động của slide (milliseconds)
    slidesToShow: 1, // Số lượng slide hiển thị cùng một lúc
    slidesToScroll: 1, // Số lượng slide cuộn mỗi lần nhấn nút hoặc tự động
    autoplay: true, // Tự động chuyển slide
    autoplaySpeed: 3000, // Khoảng thời gian giữa các lần tự động chuyển slide (milliseconds)
    arrows: true, // Hiển thị mũi tên điều hướng (previous/next)
  };

  // --- Effect hook để tải dữ liệu sản phẩm từ API khi component mount ---
  useEffect(() => {
    const controller = new AbortController(); // Tạo instance của AbortController để có thể hủy yêu cầu fetch
    const signal = controller.signal; // Lấy signal từ controller

    const load = async () => { // Hàm async để thực hiện việc tải dữ liệu
      try {
        setIsLoading(true); // Bắt đầu tải, đặt isLoading về true
        setError(null); // Xóa lỗi cũ nếu có

        const productList = await fetchProducts(signal); // Gọi hàm fetchProducts để lấy dữ liệu, truyền signal
        setProducts(productList); // Cập nhật state 'products' với dữ liệu gốc
        setFilteredProducts(productList); // Ban đầu, danh sách lọc là toàn bộ danh sách sản phẩm
        // Không cần setShowNoResults(productList.length === 0) ở đây vì effect lọc sẽ xử lý sau
      } catch (err) {
        // Bắt lỗi. Kiểm tra nếu lỗi không phải là AbortError (do cleanup gọi controller.abort())
        if (err.name !== "AbortError") {
          console.error("Error fetching products:", err); // Ghi log lỗi thật
          setError(err.message); // Cập nhật state 'error' với thông báo lỗi
          setProducts([]); // Đảm bảo products rỗng khi có lỗi
          setFilteredProducts([]); // Đảm bảo filteredProducts rỗng khi có lỗi
          setShowNoResults(true); // Hiển thị thông báo không có kết quả nếu fetch lỗi hoặc rỗng
        }
      } finally {
        setIsLoading(false); // Dù thành công hay thất bại (không phải AbortError), kết thúc loading
      }
    };

    load(); // Gọi hàm load để bắt đầu tải dữ liệu

    // Cleanup function: Hàm này chạy khi component unmount hoặc khi dependencies thay đổi
    // Hủy yêu cầu fetch nếu nó vẫn đang chạy để tránh memory leaks và lỗi không mong muốn
    return () => controller.abort();
  }, []); // Dependency array rỗng []: Effect chỉ chạy MỘT LẦN duy nhất sau lần render đầu tiên (tương tự componentDidMount)

  // --- Effect hook để áp dụng các bộ lọc (tìm kiếm và thương hiệu) và sắp xếp ---
  // Effect này chạy mỗi khi state 'filters' hoặc state 'products' thay đổi
  useEffect(() => {
    let filtered = [...products]; // Bắt đầu với bản sao của danh sách sản phẩm gốc

    // 1. Lọc theo thương hiệu: Nếu bộ lọc thương hiệu KHÔNG phải là "Tất cả"
    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter((p) => p.brand === filters.brand); // Giữ lại các sản phẩm có brand khớp
    }

    // 2. Lọc theo từ khóa tìm kiếm: Nếu có từ khóa tìm kiếm (sau khi trim() không rỗng)
    if (filters.search.trim()) {
      // Giữ lại các sản phẩm có tên (chuyển hết sang chữ thường) bao gồm từ khóa tìm kiếm (cũng chuyển sang chữ thường)
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // --- Debouncing và cập nhật UI ---
    setIsSearching(true); // Đặt trạng thái đang tìm kiếm (có thể hiển thị spinner)
    setShowNoResults(false); // Ẩn thông báo "Không có kết quả" trong khi đang tìm kiếm

    // Sử dụng setTimeout để tạo hiệu ứng "debounce".
    // Logic lọc/hiển thị sẽ chỉ chạy sau khi người dùng ngừng gõ hoặc thay đổi bộ lọc trong 1 giây.
    // Điều này tránh việc cập nhật UI liên tục khi người dùng gõ nhanh vào ô tìm kiếm.
    const timeout = setTimeout(() => {
      setFilteredProducts(filtered); // Cập nhật state 'filteredProducts' với danh sách đã lọc
      setIsSearching(false); // Kết thúc trạng thái tìm kiếm
      // Sau khi lọc xong, kiểm tra xem danh sách kết quả có rỗng không để hiển thị thông báo phù hợp
      setShowNoResults(filtered.length === 0);
      setCurrentPage(1); // Luôn reset về trang 1 khi bộ lọc hoặc danh sách sản phẩm gốc thay đổi
    }, 500); // Độ trễ 500ms

    // Cleanup function cho effect này: Xóa timeout nếu dependencies thay đổi trước khi timeout cũ kết thúc.
    // Điều này đảm bảo chỉ có timeout cuối cùng sau khi người dùng ngừng gõ mới được thực thi.
    return () => clearTimeout(timeout);

  }, [filters, products]); // Dependency array: Effect chạy lại khi state 'filters' hoặc 'products' thay đổi

  // --- Hàm xử lý khi chuyển trang (trong phân trang) ---
  // Sử dụng useCallback để hàm này chỉ được tạo lại khi state 'filteredProducts' thay đổi.
  const handlePageChange = useCallback(
    (page) => {
      // Tính toán số trang mới, đảm bảo nó nằm trong khoảng hợp lệ (từ 1 đến totalPages)
      const newPage = Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)));
      setCurrentPage(newPage); // Cập nhật state số trang hiện tại
    },
    [filteredProducts] // Dependency array: hàm này phụ thuộc vào filteredProducts (để tính totalPages)
  );

  // --- Hàm xử lý khi giá trị của input tìm kiếm thay đổi ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target; // Lấy tên (name) và giá trị (value) của input
    // Cập nhật state 'filters': giữ lại các giá trị filter cũ, chỉ cập nhật giá trị của trường có tên 'name' tương ứng
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // --- Hàm xử lý khi chọn một thương hiệu từ bộ lọc nút ---
  const handleBrandSelect = (brand) => {
    // Cập nhật state 'filters', đặt lại chỉ mục thương hiệu được chọn
    setFilters((prev) => ({ ...prev, brand }));
  };

  // --- Hàm xử lý sắp xếp sản phẩm theo giá từ thấp đến cao ---
  const sortLowToHigh = () => {
    // Tạo một bản sao của mảng 'filteredProducts', sắp xếp nó và cập nhật state
    // Hàm sort: (a, b) => a.price - b.price sẽ sắp xếp tăng dần theo giá
    setFilteredProducts([...filteredProducts].sort((a, b) => a.price - b.price));
    setCurrentPage(1); // Reset về trang 1 sau khi sắp xếp
  };

  // --- Hàm xử lý sắp xếp sản phẩm theo giá từ cao đến thấp ---
  const sortHighToLow = () => {
    // Tạo một bản sao của mảng 'filteredProducts', sắp xếp nó và cập nhật state
    // Hàm sort: (a, b) => b.price - a.price sẽ sắp xếp giảm dần theo giá
    setFilteredProducts([...filteredProducts].sort((a, b) => b.price - a.price));
    setCurrentPage(1); // Reset về trang 1 sau khi sắp xếp
  };

  // --- Hàm xử lý reset lại tất cả các bộ lọc ---
  const resetFilters = () => {
    // Đặt lại state 'filters' về giá trị mặc định ban đầu
    setFilters({ brand: "Tất cả", search: "" });
    setFilteredProducts(products); // Đặt lại danh sách hiển thị về toàn bộ sản phẩm gốc
    setCurrentPage(1); // Reset về trang 1
  };

  // --- Tính toán các giá trị dẫn xuất từ state ---
  // Tính tổng số trang cần thiết cho phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  // Lấy danh sách các sản phẩm sẽ hiển thị trên trang hiện tại
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // --- Render giao diện dựa trên trạng thái loading và lỗi ---

  // Nếu đang trong trạng thái tải dữ liệu ban đầu (isLoading là true)
  if (isLoading) {
    return (
      <div className="loading-container"> {/* Container cho loading */}
        <div className="loading-spinner"></div> {/* Biểu tượng spinner quay */}
        <p className="loading-text">Đang tải...</p> {/* Thông báo loading */}
      </div>
    );
  }

  // Nếu có lỗi trong quá trình tải dữ liệu (error khác null)
  if (error) {
    return (
      <div className="status error"> {/* Container thông báo lỗi */}
        <p>❌ {error}</p> {/* Hiển thị nội dung lỗi */}
        {/* Nút "Thử lại", khi click sẽ tải lại trang */}
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  // --- Render giao diện chính của trang sản phẩm khi dữ liệu đã tải xong và không có lỗi ---
  return (
    <main className="product-page"> {/* Thẻ main bao bọc nội dung chính của trang */}
      {/* Phần hiển thị Carousel (banner) */}
      <div className="carousel-section">
        <Slider {...sliderSettings}> {/* Sử dụng component Slider với các cài đặt đã định nghĩa */}
          {/* Map qua mảng SLIDES để tạo các Slide component */}
          {SLIDES.map((slide, i) => (
            <Slide key={i} slide={slide} /> // Render từng slide
          ))}
        </Slider>
      </div>

      {/* Tiêu đề chính của trang sản phẩm */}
      <h1 className="page-title">Danh sách sản phẩm</h1>

      {/* Phần chứa các bộ lọc và sắp xếp */}
      <div className="filter-section">
        {/* Input để tìm kiếm sản phẩm theo tên */}
        <input
          type="text"
          name="search"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search} // Gán giá trị input từ state filters.search
          onChange={handleFilterChange} // Gắn hàm xử lý khi giá trị input thay đổi
          aria-label="Tìm kiếm sản phẩm theo tên"
        />
        {/* Component BrandFilter để lọc theo thương hiệu */}
        <BrandFilter
          brands={BRANDS} // Truyền danh sách các thương hiệu
          selectedBrand={filters.brand} // Truyền thương hiệu đang được chọn từ state
          onBrandSelect={handleBrandSelect} // Truyền hàm xử lý khi chọn thương hiệu
        />
        {/* Nút sắp xếp sản phẩm theo giá từ thấp đến cao */}
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao
        </button>
        {/* Nút sắp xếp sản phẩm theo giá từ cao đến thấp */}
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp
        </button>
      </div>

      {/* Khu vực hiển thị danh sách sản phẩm hoặc các thông báo trạng thái (đang tìm kiếm, không có kết quả) */}
      <div className="product-list">
        {/* Nếu đang trong quá trình tìm kiếm (isSearching là true), hiển thị spinner */}
        {isSearching ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải...</p>
          </div>
        ) : showNoResults ? ( // Nếu không đang tìm kiếm VÀ showNoResults là true (không tìm thấy kết quả)
          <div className="no-products-container"> {/* Container thông báo không có kết quả */}
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p> {/* Thông báo */}
            {/* Nút "Xóa bộ lọc", khi click sẽ gọi hàm resetFilters */}
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc
            </button>
          </div>
        ) : (
          // Nếu không đang tìm kiếm VÀ có kết quả (showNoResults là false)
          <div className="product-grid"> {/* Container dạng lưới để hiển thị các thẻ sản phẩm */}
            {/* Map qua danh sách sản phẩm hiện tại (cho trang hiện tại) để render các ProductCard */}
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} /> // Render từng ProductCard
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị component Phân trang chỉ khi có nhiều hơn 1 trang (totalPages > 1) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage} // Truyền số trang hiện tại
          totalPages={totalPages} // Truyền tổng số trang
          onPageChange={handlePageChange} // Truyền hàm xử lý khi người dùng chuyển trang
        />
      )}
    </main>
  );
};

export default ProductPage; // Export component ProductPage để sử dụng ở các file khác (trong phần routing)