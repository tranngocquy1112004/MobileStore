import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

// --- Constants ---
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Path to the product data source
const PRODUCTS_PER_PAGE = 6; // Number of products per page for pagination
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Available brands for filtering

// Data for the promotional carousel slides
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

// --- API Call Function ---
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal });
  if (!response.ok) {
    throw new Error("Không thể tải sản phẩm!");
  }
  const data = await response.json();
  // Handle both array and object with 'products' property
  return Array.isArray(data) ? data : data.products || [];
};

// --- Child Components (Moved outside the main component) ---

const ProductCard = React.memo(({ product }) => {
  // Basic validation
  if (
    !product?.id ||
    !product.name ||
    !product.image ||
    typeof product.price !== "number"
  ) {
    console.error("Invalid product data:", product);
    return null;
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy" // Lazy load images
        />
      </Link>
      <h3>{product.name}</h3>
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p> {/* Format price */}
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

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // Hide pagination if only one page

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

const BrandFilter = React.memo(({ brands, selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {brands.map((brand) => (
      <button
        key={brand}
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Active class for selected brand
        onClick={() => onBrandSelect(brand)}
        aria-pressed={selectedBrand === brand} // Accessibility for toggle buttons
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
          {slide.features.map((feature, i) => (
            <li key={i}>{feature}</li> // Using index as key is acceptable for static lists like this
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


// --- Main Component: ProductPage ---
const ProductPage = () => {
  // --- State management ---
  const [products, setProducts] = useState([]); // Original product list
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered/sorted list for display
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(null); // Error state for fetch errors
  const [currentPage, setCurrentPage] = useState(1); // Current pagination page
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" }); // Filter state (brand and search)
  const [isSearching, setIsSearching] = useState(false); // State for indicating filtering/searching is in progress
  const [showNoResults, setShowNoResults] = useState(false); // State for showing "No results" message

  // Settings for the Slider carousel
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

  // --- Effect hook to fetch product data on mount ---
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const productList = await fetchProducts(signal);
        setProducts(productList);
        setFilteredProducts(productList); // <-- Added this back: Initialize filteredProducts immediately
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching products:", err);
          setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu."); // Provide a default message
          setProducts([]);
          setFilteredProducts([]); // Ensure filtered list is empty on error
          setShowNoResults(true); // Show no results message on fetch error
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();

    // Cleanup function to abort fetch on unmount
    return () => controller.abort();
  }, []); // Empty dependency array means this runs only once on mount

  // --- Effect hook to apply filters (search and brand) and sorting whenever filters or products change ---
  useEffect(() => {
    // Only start the filtering/debouncing process if initial loading is complete
    // This prevents running the filter logic before products are fetched,
    // although the empty initial products array handles this gracefully too.
    if (isLoading) return;


    setIsSearching(true); // Indicate search/filter is starting
    setShowNoResults(false); // Hide previous "No results" message

    // Debounce filter application
    const timeout = setTimeout(() => {
      let filtered = [...products]; // Start with the original product list

      // Apply brand filter
      if (filters.brand !== "Tất cả") {
        filtered = filtered.filter((p) => p.brand === filters.brand);
      }

      // Apply search filter
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(searchTerm)
        );
      }

      // No default sorting applied here, just filtering.
      // Sorting is handled by explicit sort buttons.

      setFilteredProducts(filtered); // Update the filtered list
      setIsSearching(false); // End search/filter indication
      setShowNoResults(filtered.length === 0); // Show no results if the filtered list is empty
      setCurrentPage(1); // Reset to page 1 on filter change

    }, 500); // Debounce delay (500ms)

    // Cleanup function to clear the timeout
    return () => clearTimeout(timeout);

  }, [filters, products, isLoading]); // Re-run effect when filters, products, or isLoading changes

  // --- Function to handle page changes ---
  // Recalculate total pages inside useCallback as it depends on filteredProducts
  const handlePageChange = useCallback(
    (page) => {
      // Ensure filteredProducts is valid before calculating length
      const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
      const totalPages = Math.ceil(safeFilteredProducts.length / PRODUCTS_PER_PAGE);
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage);
    },
    [filteredProducts] // Depends on filteredProducts to calculate totalPages
  );

  // --- Function to handle changes in search input ---
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []); // setFilters is stable, so empty deps are fine

  // --- Function to handle brand selection ---
  const handleBrandSelect = useCallback((brand) => {
    setFilters((prev) => ({ ...prev, brand }));
  }, []); // setFilters is stable, so empty deps are fine

  // --- Function to handle sorting by price low to high ---
  const sortLowToHigh = useCallback(() => {
     // Create a copy before sorting to avoid mutating state directly
     // Ensure filteredProducts is valid before sorting
    const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
    setFilteredProducts([...safeFilteredProducts].sort((a, b) => a.price - b.price));
    setCurrentPage(1); // Reset to page 1 after sorting
  }, [filteredProducts, setFilteredProducts, setCurrentPage]); // Depends on filteredProducts and setters

  // --- Function to handle sorting by price high to low ---
  const sortHighToLow = useCallback(() => {
     // Create a copy before sorting to avoid mutating state directly
     // Ensure filteredProducts is valid before sorting
     const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
    setFilteredProducts([...safeFilteredProducts].sort((a, b) => b.price - a.price));
    setCurrentPage(1); // Reset to page 1 after sorting
  }, [filteredProducts, setFilteredProducts, setCurrentPage]); // Depends on filteredProducts and setters

  // --- Function to reset all filters ---
  const resetFilters = useCallback(() => {
    setFilters({ brand: "Tất cả", search: "" });
    // The effect hook will handle setting filteredProducts back to the original 'products' list and resetting the page
  }, []); // setFilters is stable, so empty deps are fine


  // --- Calculate derived state for the current page's products ---
  // Add a safety check for filteredProducts here too, although state should ensure it's an array
   const safeFilteredProductsForRender = Array.isArray(filteredProducts) ? filteredProducts : [];
   console.log("Render: filteredProducts length:", safeFilteredProductsForRender.length); // Log for debugging
  const totalPages = Math.ceil(safeFilteredProductsForRender.length / PRODUCTS_PER_PAGE); // Calculated here
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = safeFilteredProductsForRender.slice(startIndex, endIndex);


  // --- Render UI ---

  // Render loading state
  if (isLoading && filteredProducts.length === 0 && !error) { // Refined loading condition
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  // Render error state
  if (error && filteredProducts.length === 0) { // Only show error if no products are loaded
    return (
      <div className="status error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button> {/* Simple retry by reloading */}
      </div>
    );
  }

  // Render main product page content
  return (
    <main className="product-page">
      {/* Carousel Section */}
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, i) => (
            <Slide key={i} slide={slide} />
          ))}
        </Slider>
      </div>

      <h1 className="page-title">Danh sách sản phẩm</h1>

      {/* Filter Section */}
      <div className="filter-section">
        <input
          type="text"
          name="search"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={handleFilterChange}
          aria-label="Tìm kiếm sản phẩm theo tên"
        />
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={handleBrandSelect}
        />
        {/* Sorting Buttons */}
        <button className="sort-button" onClick={sortLowToHigh} aria-label="Sắp xếp giá từ thấp tới cao">
          Giá từ thấp tới cao
        </button>
        <button className="sort-button" onClick={sortHighToLow} aria-label="Sắp xếp giá từ cao tới thấp">
          Giá từ cao tới thấp
        </button>
         {/* Reset Filters Button (Show only if filters are applied) */}
        {(filters.brand !== "Tất cả" || filters.search.trim()) && (
             <button onClick={resetFilters} className="reset-filters-button" aria-label="Xóa tất cả bộ lọc">
                 <span className="reset-icon">✕</span> Xóa bộ lọc
             </button>
         )}
      </div>

      {/* Product List / Status Area */}
      <div className="product-list">
        {/* Show spinner only when filtering/searching after initial load */}
        {isSearching && !isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang xử lý...</p> {/* Updated loading text */}
          </div>
        ) : showNoResults ? ( // Show "No results" message
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
             {/* The reset button is now primarily in the filter section */}
          </div>
        ) : ( // Show product grid
          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {/* Only display pagination if there are products after filtering AND more than one page */}
      {safeFilteredProductsForRender.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages} // totalPages is derived state
          onPageChange={handlePageChange}
        />
      )}

    </main>
  );
};

export default ProductPage;