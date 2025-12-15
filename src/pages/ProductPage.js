// ===== IMPORTS =====
// React core và hooks
import React, { useReducer, useEffect, useMemo, useCallback, useRef } from "react";
// React Router components
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
// Thư viện slider
import Slider from "react-slick";
// Styles cho slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// CSS của component
import "./ProductPage.css";

// ===== CONSTANTS =====
// URL API để lấy dữ liệu sản phẩm
const API_URL = process.env.PUBLIC_URL + "/db.json";
// Số sản phẩm hiển thị trên mỗi trang
const PRODUCTS_PER_PAGE = 6;
// Thời gian delay khi tìm kiếm (ms)
const SEARCH_DEBOUNCE = 500;
// Danh sách các thương hiệu
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];
// Các loại sắp xếp
const SORT_TYPES = {
  LOW_TO_HIGH: "lowToHigh",  // Giá từ thấp đến cao
  HIGH_TO_LOW: "highToLow",  // Giá từ cao đến thấp
};

// Dữ liệu cho slider
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

// Cấu hình cho slider
const sliderSettings = {
  dots: true,           // Hiển thị dots
  infinite: true,       // Lặp vô hạn
  speed: 500,          // Tốc độ chuyển slide
  slidesToShow: 1,      // Số slide hiển thị
  slidesToScroll: 1,    // Số slide cuộn mỗi lần
  autoplay: true,       // Tự động chuyển slide
  autoplaySpeed: 3000,  // Thời gian chờ giữa các slide
  arrows: true,         // Hiển thị nút điều hướng
};

// ===== REDUCER VÀ INITIAL STATE =====
// Trạng thái ban đầu của ứng dụng
const initialState = {
  allProducts: [],      // Danh sách tất cả sản phẩm
  filters: {            // Bộ lọc
    brand: BRANDS[0],   // Thương hiệu được chọn
    search: ""          // Từ khóa tìm kiếm
  },
  currentPage: 1,       // Trang hiện tại
  isLoading: true,      // Trạng thái đang tải
  isSearching: false,   // Trạng thái đang tìm kiếm
  error: null,          // Lỗi nếu có
};

/**
 * Reducer xử lý các action liên quan đến sản phẩm
 * @param {Object} state - State hiện tại
 * @param {Object} action - Action được dispatch
 * @returns {Object} State mới
 */
const productReducer = (state, action) => {
  switch (action.type) {
    // Bắt đầu fetch dữ liệu
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    
    // Fetch dữ liệu thành công
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, allProducts: action.payload, error: null };
    
    // Fetch dữ liệu thất bại
    case "FETCH_ERROR":
      return { ...state, isLoading: false, allProducts: [], error: action.payload };
    
    // Cập nhật bộ lọc
    case "SET_FILTER":
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload }, 
        currentPage: 1, 
        isSearching: true 
      };
    
    // Cập nhật trạng thái tìm kiếm
    case "SET_SEARCHING":
      return { ...state, isSearching: action.payload };
    
    // Cập nhật trang hiện tại
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    
    // Sắp xếp sản phẩm
    case "SORT_PRODUCTS":
      return {
        ...state,
        allProducts: [...state.allProducts].sort((a, b) =>
          action.payload === SORT_TYPES.LOW_TO_HIGH ? a.price - b.price : b.price - a.price
        ),
        currentPage: 1,
      };
    
    // Reset bộ lọc về mặc định
    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters, currentPage: 1, isSearching: true };
    
    default:
      return state;
  }
};

// ===== UTILITY FUNCTIONS =====
/**
 * Hàm fetch dữ liệu sản phẩm từ API
 * @param {AbortSignal} signal - Signal để hủy request
 * @returns {Promise<Array>} Danh sách sản phẩm
 */
const fetchProducts = async (signal) => {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) {
      throw new Error(`Không thể tải sản phẩm (Mã lỗi: ${response.status})`);
    }
    const data = await response.json();
    const products = Array.isArray(data) ? data : data.products;
    if (!Array.isArray(products)) {
      throw new Error("Dữ liệu sản phẩm không đúng định dạng");
    }
    return products;
  } catch (error) {
    if (error.name === "AbortError") return [];
    throw error;
  }
};

/**
 * Custom hook để debounce giá trị
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms)
 * @returns {any} Giá trị sau khi debounce
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// ===== CUSTOM HOOKS =====
/**
 * Custom hook quản lý logic sản phẩm
 * @returns {Object} State và các hàm xử lý sản phẩm
 */
const useProducts = () => {
  // Khởi tạo reducer
  const [state, dispatch] = useReducer(productReducer, initialState);
  
  // Debounce giá trị tìm kiếm
  const debouncedSearch = useDebounce(state.filters.search, SEARCH_DEBOUNCE);

  // Effect fetch dữ liệu khi component mount
  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await fetchProducts(controller.signal);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_ERROR", payload: err.message || "Lỗi không xác định khi tải dữ liệu" });
      }
    };
    loadProducts();
    return () => controller.abort();
  }, []);

  // Effect xử lý trạng thái tìm kiếm
  useEffect(() => {
    if (debouncedSearch === state.filters.search && state.isSearching) {
      dispatch({ type: "SET_SEARCHING", payload: false });
    }
  }, [debouncedSearch, state.filters.search, state.isSearching]);

  // Lọc sản phẩm theo brand và từ khóa tìm kiếm
  const filteredProducts = useMemo(() => {
    return state.allProducts
      .filter((p) => state.filters.brand === BRANDS[0] || p.brand === state.filters.brand)
      .filter((p) => {
        const searchTerm = debouncedSearch.trim().toLowerCase();
        return searchTerm ? p.name.toLowerCase().includes(searchTerm) : true;
      });
  }, [state.allProducts, state.filters.brand, debouncedSearch]);

  // Tính toán số trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  
  // Phân trang sản phẩm
  const paginatedProducts = useMemo(() => {
    const start = (state.currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, state.currentPage]);

  return {
    ...state,
    filteredProducts,
    paginatedProducts,
    totalPages,
    showNoResults: filteredProducts.length === 0 && !state.isLoading && !state.isSearching,
    dispatch,
  };
};

// ===== COMPONENTS =====
/**
 * Component hiển thị thông tin sản phẩm
 * Sử dụng React.memo để tối ưu performance
 */
const ProductCard = React.memo(({ product }) => {
  // Kiểm tra tính hợp lệ của dữ liệu sản phẩm
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
      <p className="price">{formatCurrency(product.price)}</p>
      <Link to={`/products/${product.id}`} className="view-details-button" aria-label={`Xem chi tiết ${product.name}`}>
        Xem chi tiết
      </Link>
    </div>
  );
});

/**
 * Component hiển thị bộ lọc thương hiệu
 * Sử dụng React.memo để tối ưu performance
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
 * Component hiển thị phân trang
 * Sử dụng React.memo để tối ưu performance
 */
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Không hiển thị nếu chỉ có 1 trang
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
 * Component hiển thị bộ lọc và tìm kiếm
 * Sử dụng React.memo để tối ưu performance
 */
const FilterSection = React.memo(({ filters, onFilterChange, onBrandSelect, onSort, onResetFilters }) => {
  // Kiểm tra xem có bộ lọc đang active không
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
});

/**
 * Component hiển thị danh sách sản phẩm
 * Sử dụng React.memo để tối ưu performance
 */
const ProductList = React.memo(({ isLoading, isSearching, showNoResults, products }) => (
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
));

/**
 * Component hiển thị một slide trong slider
 * Sử dụng React.memo để tối ưu performance
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

// ===== MAIN COMPONENT =====
/**
 * Component chính của trang sản phẩm
 * Quản lý hiển thị danh sách sản phẩm, bộ lọc, tìm kiếm và phân trang
 */
const ProductPage = () => {
  // Lấy state và các hàm xử lý từ custom hook
  const {
    isLoading,
    isSearching,
    error,
    filters,
    paginatedProducts,
    currentPage,
    totalPages,
    showNoResults,
    dispatch,
  } = useProducts();

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = useCallback(
    (e) => dispatch({ type: "SET_FILTER", payload: { [e.target.name]: e.target.value } }),
    []
  );

  // Xử lý chọn thương hiệu
  const handleBrandSelect = useCallback(
    (brand) => dispatch({ type: "SET_FILTER", payload: { brand } }),
    []
  );

  // Xử lý sắp xếp sản phẩm
  const handleSort = useCallback(
    (sortType) => dispatch({ type: "SORT_PRODUCTS", payload: sortType }),
    []
  );

  // Xử lý thay đổi trang
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        dispatch({ type: "SET_PAGE", payload: page });
      }
    },
    [totalPages]
  );

  // Xử lý reset bộ lọc
  const resetFilters = useCallback(
    () => dispatch({ type: "RESET_FILTERS" }),
    []
  );

  return (
    <main className="product-page">
      {/* Phần slider */}
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, index) => (
            <Slide key={index} slide={slide} />
          ))}
        </Slider>
      </div>

      {/* Tiêu đề trang */}
      <h1 className="page-title">Danh sách sản phẩm</h1>

      {/* Phần bộ lọc và tìm kiếm */}
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onBrandSelect={handleBrandSelect}
        onSort={handleSort}
        onResetFilters={resetFilters}
      />

      {/* Danh sách sản phẩm */}
      <ProductList
        isLoading={isLoading}
        isSearching={isSearching}
        showNoResults={showNoResults}
        products={paginatedProducts}
      />

      {/* Phân trang */}
      {paginatedProducts.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
};

// Export component
export default ProductPage;
