import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

// --- Constants ---
const API_URL = process.env.PUBLIC_URL + "/db.json";
const PRODUCTS_PER_PAGE = 6;
const SEARCH_DEBOUNCE = 500;
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];
const SLIDES = [
  {
    image: "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg",
    title: "iPhone 16 Pro Max",
    subtitle: "Thiết kế Titan tuyệt đẹp.",
    features: ["Trả góp lên đến 3 TRIỆU", "Khách hàng mới GIẢM 300K", "Góp 12 Tháng từ 76K/Ngày"],
    link: "/products/4",
    buttonText: "Mua ngay",
  },
  {
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_1__3.png",
    title: "Samsung Galaxy S25 Ultra",
    subtitle: "Công nghệ AI tiên tiến.",
    features: ["Giảm ngay 2 TRIỆU", "Tặng kèm sạc nhanh 45W", "Bảo hành chính hãng 2 năm"],
    link: "/products/1",
    buttonText: "Mua ngay",
  },
  {
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15-ultra_12_.png",
    title: "Xiaomi 15 Ultra",
    subtitle: "Camera 200MP Leica đỉnh cao.",
    features: ["Trả góp 0% lãi suất", "Giảm 500K khi thanh toán online", "Tặng tai nghe Xiaomi Buds 4"],
    link: "/products/3",
    buttonText: "Mua ngay",
  },
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
};

// --- Utilities ---
/**
 * Fetches product data from the API.
 * @param {AbortSignal} signal - Abort signal for canceling the request.
 * @returns {Promise<Array>} - Array of products.
 */
const fetchProducts = async (signal) => {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) throw new Error("Không thể tải sản phẩm!");
    const data = await response.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    if (error.name !== "AbortError") throw error;
    return [];
  }
};

/**
 * Custom hook to debounce a value.
 * @param {any} value - Value to debounce.
 * @param {number} delay - Debounce delay in milliseconds.
 * @returns {any} - Debounced value.
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

/**
 * Custom hook to manage product fetching, filtering, and pagination.
 * @param {Object} initialFilters - Initial filter values.
 * @returns {Object} - Products, filters, and handlers.
 */
const useProducts = (initialFilters) => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProducts(controller.signal);
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Lỗi khi tải dữ liệu.");
        setProducts([]);
        setIsLoading(false);
      }
    };
    loadProducts();
    return () => controller.abort();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => (filters.brand === "Tất cả" ? true : p.brand === filters.brand))
      .filter((p) =>
        filters.search.trim()
          ? p.name.toLowerCase().includes(filters.search.trim().toLowerCase())
          : true
      );
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Handlers
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSearching(true);
    setCurrentPage(1);
  };

  const handleBrandSelect = (brand) => {
    setFilters((prev) => ({ ...prev, brand }));
    setIsSearching(true);
    setCurrentPage(1);
  };

  const handleSort = (sortType) => {
    setProducts((prev) =>
      [...prev].sort((a, b) => (sortType === "lowToHigh" ? a.price - b.price : b.price - a.price))
    );
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setIsSearching(true);
    setCurrentPage(1);
  };

  return {
    products: paginatedProducts,
    filteredProducts,
    isLoading,
    isSearching,
    setIsSearching,
    error,
    filters,
    currentPage,
    totalPages,
    handleFilterChange,
    handleBrandSelect,
    handleSort,
    handlePageChange,
    resetFilters,
    showNoResults: filteredProducts.length === 0,
  };
};

// --- Child Components ---
/**
 * Displays a single product card.
 */
const ProductCard = React.memo(({ product }) => {
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product);
    return null;
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      </Link>
      <h3>{product.name}</h3>
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      <Link to={`/products/${product.id}`} className="view-details-button" aria-label={`Xem chi tiết ${product.name}`}>
        Xem chi tiết
      </Link>
    </div>
  );
});

/**
 * Renders pagination controls.
 */
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang">
      <div>
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
    </nav>
  );
});

/**
 * Renders brand filter buttons.
 */
const BrandFilter = React.memo(({ selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {BRANDS.map((brand) => (
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
 * Renders the filter and sort controls.
 */
const FilterSection = ({ filters, onFilterChange, onBrandSelect, onSort, onResetFilters }) => {
  const hasActiveFilters = filters.brand !== "Tất cả" || filters.search.trim();

  return (
    <div className="filter-section">
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={onFilterChange}
        className="search-input"
        placeholder="Tìm kiếm sản phẩm..."
        aria-label="Tìm kiếm sản phẩm theo tên"
      />
      <BrandFilter selectedBrand={filters.brand} onBrandSelect={onBrandSelect} />
      <button
        className="sort-button"
        onClick={() => onSort("lowToHigh")}
        aria-label="Sắp xếp giá từ thấp tới cao"
      >
        Giá từ thấp tới cao
      </button>
      <button
        className="sort-button"
        onClick={() => onSort("highToLow")}
        aria-label="Sắp xếp giá từ cao tới thấp"
      >
        Giá từ cao tới thấp
      </button>
      {hasActiveFilters && (
        <button onClick={onResetFilters} className="reset-filters-button" aria-label="Xóa tất cả bộ lọc">
          <span className="reset-icon">✕</span> Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

/**
 * Renders the product list or loading/no-results states.
 */
const ProductList = ({ isLoading, isSearching, showNoResults, products }) => (
  <div className="product-list">
    {isSearching && !isLoading ? (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang xử lý...</p>
      </div>
    ) : showNoResults ? (
      <div className="no-products-container">
        <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
      </div>
    ) : (
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </div>
);

/**
 * Renders a single carousel slide.
 */
const Slide = React.memo(({ slide }) => (
  <div className="slide">
    <div className="slide-content">
      <div className="slide-text">
        <h2>{slide.title}</h2>
        <h3>{slide.subtitle}</h3>
        <ul>
          {slide.features.map((feature, index) => (
            <li key={index}>{feature}</li>
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

// --- Main Component ---
/**
 * Product page component displaying a carousel, filters, and product list.
 */
const ProductPage = () => {
  const initialFilters = { brand: BRANDS[0], search: "" };
  const {
    products,
    isLoading,
    isSearching,
    setIsSearching,
    error,
    filters,
    currentPage,
    totalPages,
    handleFilterChange,
    handleBrandSelect,
    handleSort,
    handlePageChange,
    resetFilters,
    showNoResults,
  } = useProducts(initialFilters);

  const debouncedFilters = useDebounce(filters, SEARCH_DEBOUNCE);

  // Update searching state after debounce
  useEffect(() => {
    setIsSearching(false);
  }, [debouncedFilters, setIsSearching]);

  if (isLoading && !products.length && !error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error && !products.length) {
    return (
      <div className="status error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()} className="retry-button" aria-label="Thử lại tải trang">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <main className="product-page">
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, index) => (
            <Slide key={index} slide={slide} />
          ))}
        </Slider>
      </div>
      <h1 className="page-title">Danh sách sản phẩm</h1>
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onBrandSelect={handleBrandSelect}
        onSort={handleSort}
        onResetFilters={resetFilters}
      />
      <ProductList
        isLoading={isLoading}
        isSearching={isSearching}
        showNoResults={showNoResults}
        products={products}
      />
      {products.length > 0 && totalPages > 1 && (
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