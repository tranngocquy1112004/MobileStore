import React, { useEffect, useState } from "react";
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

// --- Utilities ---
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

// --- Custom Hooks ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// --- Child Components ---
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

// --- Main Component ---
const ProductPage = () => {
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    isLoading: true,
    error: null,
    currentPage: 1,
    filters: { brand: "Tất cả", search: "" },
    isSearching: false,
    showNoResults: false,
  });

  const { products, filteredProducts, isLoading, error, currentPage, filters, isSearching, showNoResults } = state;
  const debouncedFilters = useDebounce(filters, SEARCH_DEBOUNCE);

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

  // Fetch products on mount
  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const data = await fetchProducts(controller.signal);
        setState((prev) => ({
          ...prev,
          products: data,
          filteredProducts: data,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.message || "Lỗi khi tải dữ liệu.",
          products: [],
          filteredProducts: [],
          isLoading: false,
          showNoResults: true,
        }));
      }
    };
    loadProducts();
    return () => controller.abort();
  }, []);

  // Filter and sort products
  useEffect(() => {
    if (isLoading) return;

    const filtered = products
      .filter((p) => (debouncedFilters.brand === "Tất cả" ? true : p.brand === debouncedFilters.brand))
      .filter((p) =>
        debouncedFilters.search.trim()
          ? p.name.toLowerCase().includes(debouncedFilters.search.trim().toLowerCase())
          : true
      );

    setState((prev) => ({
      ...prev,
      filteredProducts: filtered,
      isSearching: false,
      showNoResults: filtered.length === 0,
      currentPage: 1,
    }));
  }, [debouncedFilters, products, isLoading]);

  // Event handlers
  const handlePageChange = (page) => {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    setState((prev) => ({ ...prev, currentPage: Math.min(Math.max(page, 1), totalPages) }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, filters: { ...prev.filters, [name]: value }, isSearching: true }));
  };

  const handleBrandSelect = (brand) => {
    setState((prev) => ({ ...prev, filters: { ...prev.filters, brand }, isSearching: true }));
  };

  const handleSort = (sortType) => {
    setState((prev) => ({
      ...prev,
      filteredProducts: [...prev.filteredProducts].sort((a, b) =>
        sortType === "lowToHigh" ? a.price - b.price : b.price - a.price
      ),
      currentPage: 1,
    }));
  };

  const resetFilters = () => {
    setState((prev) => ({ ...prev, filters: { brand: "Tất cả", search: "" }, isSearching: true }));
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  // Render states
  if (isLoading && !filteredProducts.length && !error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error && !filteredProducts.length) {
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
        products={currentProducts}
      />
      {filteredProducts.length > 0 && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </main>
  );
};

export default ProductPage;