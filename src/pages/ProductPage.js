import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; // CSS cấu hình cho slider
import "slick-carousel/slick/slick-theme.css"; // CSS theme cho slider
import "./ProductPage.css"; // CSS riêng của trang sản phẩm

// --- HẰNG SỐ ---
// Đường dẫn API để tải dữ liệu sản phẩm từ file JSON
const API_URL = process.env.PUBLIC_URL + "/db.json";

// Cấu hình số lượng sản phẩm hiển thị mỗi trang
const PRODUCTS_PER_PAGE = 6;

// Danh sách thương hiệu để lọc sản phẩm
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

// Thời gian trễ cho debounce khi tìm kiếm (milliseconds)
const SEARCH_DEBOUNCE = 500;

// Dữ liệu slide quảng cáo ở đầu trang
const SLIDES = [
  {
    image: "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg",
    title: "iPhone 16 Pro Max",
    subtitle: "Thiết kế Titan tuyệt đẹp.",
    features: [
      "Trả góp lên đến 3 TRIỆU",
      "Khách hàng mới GIẢM 300K",
      "Góp 12 Tháng từ 76K/Ngày",
    ],
    link: "/products/4",
    buttonText: "Mua ngay",
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

// --- HÀM TIỆN ÍCH ---

/**
 * Hàm lấy dữ liệu sản phẩm từ API
 * @param {AbortSignal} signal - Tín hiệu để huỷ fetch khi cần
 * @returns {Promise<Array>} Danh sách sản phẩm
 */
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal });
  
  if (!response.ok) {
    throw new Error("Không thể tải sản phẩm!");
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

// --- COMPONENTS CON ---

/**
 * Component hiển thị thẻ sản phẩm đơn lẻ
 * @param {Object} props - Props của component
 * @param {Object} props.product - Thông tin sản phẩm cần hiển thị
 */
const ProductCard = React.memo(({ product }) => {
  // Kiểm tra dữ liệu hợp lệ
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product);
    return null;
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy" // Lazy load ảnh để tối ưu hiệu năng
        />
      </Link>
      <h3>{product.name}</h3>
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      <Link
        to={`/products/${product.id}`}
        className="view-details-button"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        Xem chi tiết
      </Link>
    </div>
  );
});

/**
 * Component hiển thị phân trang
 * @param {Object} props - Props của component
 * @param {number} props.currentPage - Trang hiện tại
 * @param {number} props.totalPages - Tổng số trang
 * @param {Function} props.onPageChange - Hàm xử lý khi chuyển trang
 */
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Ẩn phân trang nếu chỉ có 1 trang
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
        aria-label="Trang trước"
      >
        Trang trước
      </button>
      <span className="pagination-current">Trang {currentPage}</span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
        aria-label="Trang sau"
      >
        Trang sau
      </button>
    </div>
  );
});

/**
 * Component hiển thị bộ lọc thương hiệu
 * @param {Object} props - Props của component
 * @param {Array} props.brands - Danh sách thương hiệu
 * @param {string} props.selectedBrand - Thương hiệu đang được chọn
 * @param {Function} props.onBrandSelect - Hàm xử lý khi chọn thương hiệu
 */
const BrandFilter = React.memo(({ brands, selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {brands.map((brand) => (
      <button
        key={brand}
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`}
        onClick={() => onBrandSelect(brand)}
        aria-pressed={selectedBrand === brand}
      >
        {brand}
      </button>
    ))}
  </div>
));

/**
 * Component hiển thị một slide trong carousel
 * @param {Object} props - Props của component
 * @param {Object} props.slide - Thông tin slide cần hiển thị
 */
const Slide = React.memo(({ slide }) => (
  <div className="slide">
    <div className="slide-content">
      <div className="slide-text">
        <h2>{slide.title}</h2>
        <h3>{slide.subtitle}</h3>
        <ul>
          {slide.features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      </div>
      <div className="slide-image">
        <img src={slide.image} alt={slide.title} loading="lazy" />
      </div>
      <Link to={slide.link} className="slide-button">
        {slide.buttonText}
      </Link>
    </div>
  </div>
));

/**
 * Component chính trang sản phẩm
 */
const ProductPage = () => {
  // --- STATE MANAGEMENT ---
  
  // Danh sách sản phẩm gốc từ API
  const [products, setProducts] = useState([]);
  
  // Danh sách sản phẩm đã được lọc/tìm kiếm để hiển thị
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Trạng thái tải dữ liệu ban đầu
  const [isLoading, setIsLoading] = useState(true);
  
  // Lỗi khi tải dữ liệu nếu có
  const [error, setError] = useState(null);
  
  // Trang hiện tại trong phân trang
  const [currentPage, setCurrentPage] = useState(1);
  
  // Bộ lọc gồm thương hiệu và từ khoá tìm kiếm
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });
  
  // Trạng thái đang lọc/tìm kiếm
  const [isSearching, setIsSearching] = useState(false);
  
  // Hiển thị thông báo không có kết quả
  const [showNoResults, setShowNoResults] = useState(false);

  // --- CẤU HÌNH SLIDER ---
  const sliderSettings = {
    dots: true,            // Hiển thị điểm điều hướng
    infinite: true,        // Lặp vô hạn
    speed: 500,            // Tốc độ animation (ms)
    slidesToShow: 1,       // Số slide hiển thị cùng lúc
    slidesToScroll: 1,     // Số slide chuyển mỗi lần
    autoplay: true,        // Tự động chuyển slide
    autoplaySpeed: 3000,   // Thời gian mỗi slide (ms)
    arrows: true,          // Hiển thị nút điều hướng
  };

  // --- EFFECTS ---

  /**
   * Effect tải dữ liệu sản phẩm khi component mount
   */
  useEffect(() => {
    // Tạo controller để có thể huỷ request khi unmount
    const controller = new AbortController();
    const signal = controller.signal;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy dữ liệu sản phẩm từ API
        const data = await fetchProducts(signal);
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        // Bỏ qua lỗi AbortError khi component unmount
        if (err.name !== "AbortError") {
          setError(err.message || "Lỗi khi tải dữ liệu.");
          setProducts([]);
          setFilteredProducts([]);
          setShowNoResults(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    // Cleanup: huỷ request khi unmount
    return () => controller.abort();
  }, []);

  /**
   * Effect lọc sản phẩm khi filters hoặc products thay đổi
   * Áp dụng debounce để tránh lọc quá nhiều lần
   */
  useEffect(() => {
    // Bỏ qua nếu đang tải dữ liệu ban đầu
    if (isLoading) return;

    setIsSearching(true);
    setShowNoResults(false);

    // Debounce 500ms để tránh lọc quá nhiều lần khi gõ tìm kiếm
    const debounceTimer = setTimeout(() => {
      let filtered = [...products];

      // Lọc theo thương hiệu
      if (filters.brand !== "Tất cả") {
        filtered = filtered.filter((p) => p.brand === filters.brand);
      }

      // Lọc theo từ khoá tìm kiếm
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(searchTerm)
        );
      }

      setFilteredProducts(filtered);
      setIsSearching(false);
      setShowNoResults(filtered.length === 0);
      setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
    }, SEARCH_DEBOUNCE);

    // Cleanup: huỷ timer nếu filters thay đổi liên tục
    return () => clearTimeout(debounceTimer);
  }, [filters, products, isLoading]);

  // --- XỬ LÝ SỰ KIỆN ---

  /**
   * Xử lý chuyển trang trong phân trang
   * @param {number} page - Trang muốn chuyển đến
   */
  const handlePageChange = useCallback(
    (page) => {
      const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
      // Giới hạn trang trong khoảng hợp lệ [1, totalPages]
      const newPage = Math.min(Math.max(page, 1), totalPages);
      setCurrentPage(newPage);
    },
    [filteredProducts]
  );

  /**
   * Xử lý khi thay đổi giá trị trong ô tìm kiếm
   * @param {Event} e - Sự kiện change
   */
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Xử lý khi chọn thương hiệu
   * @param {string} brand - Thương hiệu được chọn
   */
  const handleBrandSelect = useCallback((brand) => {
    setFilters((prev) => ({ ...prev, brand }));
  }, []);

  /**
   * Sắp xếp sản phẩm theo giá từ thấp đến cao
   */
  const sortLowToHigh = useCallback(() => {
    const sorted = [...filteredProducts].sort((a, b) => a.price - b.price);
    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [filteredProducts]);

  /**
   * Sắp xếp sản phẩm theo giá từ cao đến thấp
   */
  const sortHighToLow = useCallback(() => {
    const sorted = [...filteredProducts].sort((a, b) => b.price - a.price);
    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [filteredProducts]);

  /**
   * Reset tất cả bộ lọc về giá trị mặc định
   */
  const resetFilters = useCallback(() => {
    setFilters({ brand: "Tất cả", search: "" });
  }, []);

  // --- TÍNH TOÁN DỮ LIỆU HIỂN THỊ ---
  
  // Tính tổng số trang cho phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  
  // Vị trí bắt đầu của dữ liệu trang hiện tại
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  
  // Lấy danh sách sản phẩm cho trang hiện tại
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  // --- RENDER THEO TRẠNG THÁI ---

  // Hiển thị màn hình loading khi đang tải dữ liệu ban đầu
  if (isLoading && filteredProducts.length === 0 && !error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error && filteredProducts.length === 0) {
    return (
      <div className="status error">
        <p>❌ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
          aria-label="Thử lại tải lại trang"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // --- RENDER CHÍNH ---
  return (
    <main className="product-page">
      {/* Phần carousel quảng cáo */}
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, i) => (
            <Slide key={i} slide={slide} />
          ))}
        </Slider>
      </div>

      <h1 className="page-title">Danh sách sản phẩm</h1>

      {/* Phần bộ lọc và tìm kiếm */}
      <div className="filter-section">
        {/* Ô tìm kiếm */}
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          aria-label="Tìm kiếm sản phẩm theo tên"
        />
        
        {/* Bộ lọc thương hiệu */}
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={handleBrandSelect}
        />
        
        {/* Nút sắp xếp giá */}
        <button
          className="sort-button"
          onClick={sortLowToHigh}
          aria-label="Sắp xếp giá từ thấp tới cao"
        >
          Giá từ thấp tới cao
        </button>
        <button
          className="sort-button"
          onClick={sortHighToLow}
          aria-label="Sắp xếp giá từ cao tới thấp"
        >
          Giá từ cao tới thấp
        </button>
        
        {/* Nút reset bộ lọc - chỉ hiện khi có bộ lọc được áp dụng */}
        {(filters.brand !== "Tất cả" || filters.search.trim()) && (
          <button
            onClick={resetFilters}
            className="reset-filters-button"
            aria-label="Xóa tất cả bộ lọc"
          >
            <span className="reset-icon">✕</span> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Phần hiển thị danh sách sản phẩm */}
      <div className="product-list">
        {isSearching && !isLoading ? (
          // Hiển thị trạng thái đang tìm kiếm/lọc
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang xử lý...</p>
          </div>
        ) : showNoResults ? (
          // Hiển thị khi không có sản phẩm phù hợp với bộ lọc
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
          </div>
        ) : (
          // Hiển thị danh sách sản phẩm dạng lưới
          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Phần phân trang - chỉ hiển thị khi có nhiều hơn 1 trang */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
};

export default ProductPage;