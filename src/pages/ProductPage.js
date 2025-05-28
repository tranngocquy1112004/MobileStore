import React, { useReducer, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

// --- Hằng số ---
const API_URL = process.env.PUBLIC_URL + "/db.json";
const PRODUCTS_PER_PAGE = 6;
const SEARCH_DEBOUNCE = 500; // milliseconds
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];
const SORT_TYPES = {
  LOW_TO_HIGH: "lowToHigh",
  HIGH_TO_LOW: "highToLow",
};

// Dữ liệu slide
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

// --- Reducer và trạng thái ban đầu ---
const initialState = {
  allProducts: [],
  filters: { brand: BRANDS[0], search: "" },
  currentPage: 1,
  isLoading: true,
  isSearching: false,
  error: null,
};

const productReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, allProducts: action.payload, error: null };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, allProducts: [], error: action.payload };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload }, currentPage: 1, isSearching: true };
    case "SET_SEARCHING":
      return { ...state, isSearching: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SORT_PRODUCTS":
      return {
        ...state,
        allProducts: [...state.allProducts].sort((a, b) =>
          action.payload === SORT_TYPES.LOW_TO_HIGH ? a.price - b.price : b.price - a.price
        ),
        currentPage: 1,
      };
    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters, currentPage: 1, isSearching: true };
    default:
      return state;
  }
};

// --- Hàm tiện ích ---
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

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// --- Custom Hook ---
const useProducts = () => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const debouncedSearch = useDebounce(state.filters.search, SEARCH_DEBOUNCE);

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

  useEffect(() => {
    if (debouncedSearch === state.filters.search && state.isSearching) {
      dispatch({ type: "SET_SEARCHING", payload: false });
    }
  }, [debouncedSearch, state.filters.search, state.isSearching]);

  const filteredProducts = useMemo(() => {
    return state.allProducts
      .filter((p) => state.filters.brand === BRANDS[0] || p.brand === state.filters.brand)
      .filter((p) => {
        const searchTerm = debouncedSearch.trim().toLowerCase();
        return searchTerm ? p.name.toLowerCase().includes(searchTerm) : true;
      });
  }, [state.allProducts, state.filters.brand, debouncedSearch]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
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

// --- Thành phần con ---
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

const FilterSection = React.memo(({ filters, onFilterChange, onBrandSelect, onSort, onResetFilters }) => {
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

// --- Thành phần chính ---
const ProductPage = () => {
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

  const handleFilterChange = useCallback(
    (e) => dispatch({ type: "SET_FILTER", payload: { [e.target.name]: e.target.value } }),
    []
  );

  const handleBrandSelect = useCallback(
    (brand) => dispatch({ type: "SET_FILTER", payload: { brand } }),
    []
  );

  const handleSort = useCallback(
    (sortType) => dispatch({ type: "SORT_PRODUCTS", payload: sortType }),
    []
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        dispatch({ type: "SET_PAGE", payload: page });
      }
    },
    [totalPages]
  );

  const resetFilters = useCallback(
    () => dispatch({ type: "RESET_FILTERS" }),
    []
  );

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
        products={paginatedProducts}
      />
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

export default ProductPage;