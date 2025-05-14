import React, { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

// --- Constants ---
const API_URL = process.env.PUBLIC_URL + "/db.json";
const PRODUCTS_PER_PAGE = 6;
const SEARCH_DEBOUNCE = 500; // milliseconds
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

// Simplified slide data (assuming image paths are correct)
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

// --- Reducer and Initial State for Product Hook ---
const productReducerInitialState = {
    allProducts: [], // Store all fetched products
    filters: { brand: BRANDS[0], search: "" },
    currentPage: 1,
    isLoading: true,
    isSearching: false, // Indicates if search/filter is actively being applied (e.g., while debouncing)
    error: null,
};

function productReducer(state, action) {
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
             // Sort 'allProducts' to maintain the sorted order for subsequent filtering/pagination
            const sortedProducts = [...state.allProducts].sort((a, b) =>
                action.payload === "lowToHigh" ? a.price - b.price : b.price - a.price
            );
            return { ...state, allProducts: sortedProducts, currentPage: 1 };
        case "RESET_FILTERS":
            return { ...state, filters: productReducerInitialState.filters, currentPage: 1, isSearching: true };
        default:
            return state;
    }
}

// --- Utilities ---
/**
 * Fetches product data from the API.
 * @param {AbortSignal} signal - Abort signal for canceling the request.
 * @returns {Promise<Array>} - Array of products.
 */
const fetchProducts = async (signal) => {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) {
        // Improved error handling: include status
        const errorDetail = `Status: ${response.status}`;
        throw new Error(`Không thể tải sản phẩm. ${errorDetail}`);
    }
    const data = await response.json();
     // Ensure the fetched data is an array or contains a products array
    if (!Array.isArray(data) && !Array.isArray(data.products)) {
        throw new Error("Dữ liệu sản phẩm không đúng định dạng.");
    }
    return Array.isArray(data) ? data : data.products;
  } catch (error) {
    if (error.name === "AbortError") {
        console.log("Fetch aborted");
        return []; // Return empty array on abort
    }
     // Re-throw other errors
    throw error;
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
 * Custom hook to manage product fetching, filtering, sorting, and pagination using useReducer.
 * @returns {Object} - State and dispatch function.
 */
const useProductsReducer = () => {
    const [state, dispatch] = useReducer(productReducer, productReducerInitialState);

    // Fetch products on mount
    useEffect(() => {
      const controller = new AbortController();
      const loadProducts = async () => {
        dispatch({ type: "FETCH_START" });
        try {
          const data = await fetchProducts(controller.signal);
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        } catch (err) {
          dispatch({ type: "FETCH_ERROR", payload: err.message || "Lỗi khi tải dữ liệu." });
        }
      };
      loadProducts();
      return () => controller.abort();
    }, []);

    // Debounce the search filter
    const debouncedSearch = useDebounce(state.filters.search, SEARCH_DEBOUNCE);

    // Effect to stop searching indication after debounce completes
    useEffect(() => {
        // Only set isSearching to false if the debounced search matches the current search
        // This prevents flickering if a new search starts before the debounce finishes
        if (debouncedSearch === state.filters.search && state.isSearching) {
            dispatch({ type: "SET_SEARCHING", payload: false });
        }
    }, [debouncedSearch, state.filters.search, state.isSearching]); // Depend on debouncedSearch and original search


    // Memoized filtering logic based on debounced search and current brand filter
    const filteredProducts = useMemo(() => {
      const { allProducts, filters } = state;
      return allProducts
        .filter((p) => (filters.brand === "Tất cả" ? true : p.brand === filters.brand))
        .filter((p) =>
          debouncedSearch.trim() // Use the debounced search term
            ? p.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
            : true
        );
    }, [state.allProducts, state.filters.brand, debouncedSearch]); // Depend on allProducts, brand, and debouncedSearch

    // Memoized pagination logic
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
      const startIndex = (state.currentPage - 1) * PRODUCTS_PER_PAGE;
      return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredProducts, state.currentPage]);

    return {
      state: {
        ...state, // Spread all state properties
        filteredProducts, // Add computed filtered products
        paginatedProducts, // Add computed paginated products
        totalPages, // Add computed total pages
        showNoResults: filteredProducts.length === 0 && !state.isLoading && !state.isSearching, // Refined no results check
      },
      dispatch, // Return the dispatch function
    };
};


// --- Child Components ---
/**
 * Displays a single product card.
 */
const ProductCard = React.memo(({ product }) => {
  // More robust data validation
  if (!product || typeof product.id === 'undefined' || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Invalid product data:", product);
    return null; // Don't render invalid cards
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      </Link>
      <h3>{product.name}</h3>
      {/* Use toLocaleString for better currency formatting */}
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
    <nav className="pagination" aria-label="Phân trang sản phẩm">
      <div>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
          aria-label="Trang trước"
        >
          Trang trước
        </button>
        <span className="pagination-current">Trang {currentPage} / {totalPages}</span> {/* Show total pages */}
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
const FilterSection = React.memo(({ filters, onFilterChange, onBrandSelect, onSort, onResetFilters, isSearching }) => {
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
        disabled={isSearching} // Disable input while searching/debouncing
      />
      <BrandFilter selectedBrand={filters.brand} onBrandSelect={onBrandSelect} />
      <button
        className="sort-button"
        onClick={() => onSort("lowToHigh")}
        aria-label="Sắp xếp giá từ thấp tới cao"
        disabled={isSearching} // Disable button while searching/debouncing
      >
        Giá từ thấp tới cao
      </button>
      <button
        className="sort-button"
        onClick={() => onSort("highToLow")}
        aria-label="Sắp xếp giá từ cao tới thấp"
         disabled={isSearching} // Disable button while searching/debouncing
      >
        Giá từ cao tới thấp
      </button>
      {hasActiveFilters && (
        <button
            onClick={onResetFilters}
            className="reset-filters-button"
            aria-label="Xóa tất cả bộ lọc"
            disabled={isSearching} // Disable button while searching/debouncing
        >
          <span className="reset-icon">✕</span> Xóa bộ lọc
        </button>
      )}
    </div>
  );
});

/**
 * Renders the product list or loading/no-results states.
 */
const ProductList = React.memo(({ isLoading, isSearching, showNoResults, products, error }) => {
     if (isLoading && products.length === 0 && !error) {
        return (
            <div className="status loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (error && products.length === 0) {
        return (
            <div className="status error">
                <p>❌ {error}</p>
                {/* Consider a more sophisticated retry mechanism if needed */}
                <button onClick={() => window.location.reload()} className="retry-button" aria-label="Thử lại tải trang">
                    Thử lại
                </button>
            </div>
        );
    }

    if (isSearching && products.length === 0 && !showNoResults) { // Show processing spinner *before* no results if search is active
        return (
            <div className="status loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">Đang xử lý tìm kiếm...</p>
            </div>
        );
    }


    if (showNoResults) {
        return (
            <div className="status no-products">
                <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
            </div>
        );
    }


  return (
    <div className="product-list">
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
});

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
  const { state, dispatch } = useProductsReducer();
  const {
      isLoading,
      isSearching,
      error,
      filters,
      paginatedProducts,
      currentPage,
      totalPages,
      showNoResults,
  } = state; // Destructure state directly

  // Handlers using dispatch
  const handleFilterChange = useCallback((e) => {
    dispatch({ type: "SET_FILTER", payload: { [e.target.name]: e.target.value } });
  }, [dispatch]); // dispatch is stable, but good practice to include

  const handleBrandSelect = useCallback((brand) => {
    dispatch({ type: "SET_FILTER", payload: { brand } });
  }, [dispatch]);

  const handleSort = useCallback((sortType) => {
    dispatch({ type: "SORT_PRODUCTS", payload: sortType });
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    // Basic bounds checking before dispatching
    if (page >= 1 && page <= totalPages) {
         dispatch({ type: "SET_PAGE", payload: page });
    }
  }, [dispatch, totalPages]); // Depend on totalPages as it can change

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, [dispatch]);


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
        isSearching={isSearching} // Pass down isSearching to disable controls
      />
      <ProductList
        isLoading={isLoading}
        isSearching={isSearching} // Pass down for handling processing state
        showNoResults={showNoResults}
        products={paginatedProducts}
        error={error} // Pass down error for display in ProductList
      />
      {paginatedProducts.length > 0 && totalPages > 1 && ( // Only show pagination if there are products to display and more than one page
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