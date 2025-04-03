import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./ProductPage.css";

// Constants
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const PRODUCTS_PER_PAGE = 8;
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

// Fetch dữ liệu sản phẩm
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal });
  if (!response.ok) throw new Error("Không thể tải sản phẩm!");
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

// Component ProductCard
const ProductCard = ({ product }) => {
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product);
    return null;
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card-link" aria-label={`Xem chi tiết ${product.name}`}>
      <div className="product-card">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        <h3>{product.name}</h3>
        <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      </div>
    </Link>
  );
};

// Component Pagination
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (typeof currentPage !== "number" || typeof totalPages !== "number" || typeof onPageChange !== "function") {
    console.error("Props phân trang không hợp lệ");
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Trang trước
      </button>
      <span className="pagination-current">Trang {currentPage}/{totalPages}</span>
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Trang sau
      </button>
    </div>
  );
};

// Component BrandFilter
const BrandFilter = ({ brands, selectedBrand, onBrandSelect }) => {
  if (!Array.isArray(brands)) {
    console.error("Danh sách thương hiệu phải là mảng");
    return null;
  }

  return (
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
};

// Component ProductPage
const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });

  // Fetch dữ liệu khi mount
  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal);
        setProducts(productList);
        setIsLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    loadProducts();
    return () => controller.abort();
  }, []);

  // Lọc sản phẩm
  useEffect(() => {
    const filtered = products
      .filter((product) => filters.brand === "Tất cả" || product.brand === filters.brand)
      .filter((product) =>
        filters.search.trim()
          ? product.name.toLowerCase().includes(filters.search.toLowerCase())
          : true
      );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [filters, products]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Handlers
  const handlePageChange = useCallback(
    (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
    [totalPages]
  );

  const handleBrandSelect = useCallback(
    (brand) => setFilters((prev) => ({ ...prev, brand })),
    []
  );

  const handleSearchChange = useCallback(
    (e) => setFilters((prev) => ({ ...prev, search: e.target.value })),
    []
  );

  const resetFilters = () => setFilters({ brand: "Tất cả", search: "" });

  // Render trạng thái
  if (isLoading) {
    return (
      <div className="status loading">
        <p>⏳ Đang tải sản phẩm...</p>
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
      <h1 className="page-title">Danh sách sản phẩm</h1>

      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={handleSearchChange}
          aria-label="Tìm kiếm sản phẩm"
        />
        <BrandFilter brands={BRANDS} selectedBrand={filters.brand} onBrandSelect={handleBrandSelect} />
      </div>

      <div className="product-list">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm</p>
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </main>
  );
};

export default ProductPage;