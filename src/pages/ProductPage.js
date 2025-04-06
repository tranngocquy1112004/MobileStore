import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./ProductPage.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const PRODUCTS_PER_PAGE = 8;
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

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
    <Link to={`/products/${product.id}`} className="product-card-link" aria-label={`Xem chi tiết ${product.name}`}>
      <div className="product-card">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        <h3>{product.name}</h3>
        <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      </div>
    </Link>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Trang trước
      </button>
      <span className="pagination-current">Trang {currentPage} / {totalPages}</span>
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

const BrandFilter = ({ brands, selectedBrand, onBrandSelect }) => {
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

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "", minPrice: "", maxPrice: "" });

  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal);
        setProducts(productList);
        setFilteredProducts(productList); // Ban đầu hiển thị tất cả sản phẩm
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

  const handlePageChange = useCallback(
    (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
    [filteredProducts]
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filtered = products
      .filter((product) => filters.brand === "Tất cả" || product.brand === filters.brand)
      .filter((product) =>
        filters.search.trim() ? product.name.toLowerCase().includes(filters.search.toLowerCase()) : true
      )
      .filter((product) =>
        filters.minPrice ? product.price >= parseInt(filters.minPrice) : true
      )
      .filter((product) =>
        filters.maxPrice ? product.price <= parseInt(filters.maxPrice) : true
      );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "", minPrice: "", maxPrice: "" });
    setFilteredProducts(products); // Reset về tất cả sản phẩm
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setFilters({ brand: "Tất cả", search: "", minPrice: "", maxPrice: "" }); // Xóa search và reset bộ lọc
    setFilteredProducts(products); // Hiển thị tất cả sản phẩm
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  if (isLoading) return <div className="status loading"><p>⏳ Đang tải sản phẩm...</p></div>;
  if (error) return (
    <div className="status error">
      <p>❌ {error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">Thử lại</button>
    </div>
  );

  return (
    <main className="product-page">
      <h1 className="page-title">Danh sách sản phẩm</h1>
      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            name="search"
            className="search-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={handleFilterChange}
            aria-label="Tìm kiếm sản phẩm"
          />
          {filters.search && (
            <button className="clear-search-button" onClick={clearSearch} aria-label="Xóa tìm kiếm">
              ✕
            </button>
          )}
        </div>
        <input
          type="number"
          name="minPrice"
          className="price-input"
          placeholder="Giá tối thiểu"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          className="price-input"
          placeholder="Giá tối đa"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <BrandFilter brands={BRANDS} selectedBrand={filters.brand} onBrandSelect={(brand) => setFilters((prev) => ({ ...prev, brand }))} />
        <button className="filter-button" onClick={applyFilters}>Lọc</button>
      </div>
      <div className="product-list">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
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