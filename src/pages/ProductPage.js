import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const PRODUCTS_PER_PAGE = 8;
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

const SLIDES = [
  {
    image:
      "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg",
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

const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal });
  if (!response.ok) throw new Error("Không thể tải sản phẩm!");
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

const ProductCard = ({ product }) => {
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
          loading="lazy"
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
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Trang trước
    </button>
    <span className="pagination-current">Trang {currentPage}</span>
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Trang sau
    </button>
  </div>
);

const BrandFilter = ({ brands, selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {brands.map((brand) => (
      <button
        key={brand}
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`}
        onClick={() => onBrandSelect(brand)}
      >
        {brand}
      </button>
    ))}
  </div>
);

const Slide = ({ slide }) => (
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
);

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);

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

  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal);
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter((product) => product.brand === filters.brand);
    }

    if (filters.search.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setIsSearching(true);
    setShowNoResults(false);

    const timeout = setTimeout(() => {
      setFilteredProducts(filtered);
      setIsSearching(false);
      setShowNoResults(filtered.length === 0);
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [filters, products]);

  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))));
    },
    [filteredProducts]
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandSelect = (brand) => {
    setFilters((prev) => ({ ...prev, brand }));
  };

  const sortLowToHigh = () => {
    setFilteredProducts([...filteredProducts].sort((a, b) => a.price - b.price));
    setCurrentPage(1);
  };

  const sortHighToLow = () => {
    setFilteredProducts([...filteredProducts].sort((a, b) => b.price - a.price));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "" });
    setFilteredProducts(products);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
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
      <div className="filter-section">
        <input
          type="text"
          name="search"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={handleFilterChange}
          aria-label="Tìm kiếm sản phẩm"
        />
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={handleBrandSelect}
        />
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao
        </button>
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp
        </button>
      </div>
      <div className="product-list">
        {isSearching ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải...</p>
          </div>
        ) : showNoResults ? (
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {currentProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
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
