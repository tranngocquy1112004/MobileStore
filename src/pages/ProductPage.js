import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./ProductPage.css";

// Các hằng số cố định
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu sản phẩm
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách thương hiệu để lọc

// Hàm lấy dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal });
  if (!response.ok) throw new Error("Không thể tải sản phẩm!");
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || []; // Đảm bảo trả về mảng sản phẩm
};

// Component hiển thị từng sản phẩm
const ProductCard = ({ product }) => {
  // Kiểm tra dữ liệu sản phẩm có hợp lệ không
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

// Component phân trang
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

// Component lọc theo thương hiệu
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

// Component chính: Trang sản phẩm
const ProductPage = () => {
  // State quản lý dữ liệu và trạng thái
  const [products, setProducts] = useState([]); // Danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm sau khi lọc
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Lỗi nếu có
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "", minPrice: "", maxPrice: "" }); // Bộ lọc

  // Tải dữ liệu sản phẩm khi component mount
  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal);
        setProducts(productList);
        setFilteredProducts(productList);
        setIsLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };
    loadProducts();
    return () => controller.abort(); // Hủy yêu cầu khi component unmount
  }, []);

  // Hàm thay đổi trang
  const handlePageChange = useCallback(
    (page) => setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)))),
    [filteredProducts]
  );

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    const filtered = products
      .filter((product) => filters.brand === "Tất cả" || product.brand === filters.brand) // Lọc theo thương hiệu
      .filter((product) =>
        filters.search.trim() ? product.name.toLowerCase().includes(filters.search.toLowerCase()) : true // Lọc theo tìm kiếm
      )
      .filter((product) => (filters.minPrice ? product.price >= parseInt(filters.minPrice) : true)) // Lọc giá tối thiểu
      .filter((product) => (filters.maxPrice ? product.price <= parseInt(filters.maxPrice) : true)); // Lọc giá tối đa

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang đầu
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "", minPrice: "", maxPrice: "" });
    setFilteredProducts(products);
    setCurrentPage(1);
  };

  // Tính toán tổng số trang và sản phẩm hiển thị trên trang hiện tại
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Trạng thái đang tải
  if (isLoading) return <div className="status loading"><p>⏳ Đang tải sản phẩm...</p></div>;

  // Trạng thái lỗi
  if (error) return (
    <div className="status error">
      <p>❌ {error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">Thử lại</button>
    </div>
  );

  // Giao diện chính
  return (
    <main className="product-page">
      <h1 className="page-title">Danh sách sản phẩm</h1>
      {/* Bộ lọc */}
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
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={(brand) => setFilters((prev) => ({ ...prev, brand }))}
        />
        <button className="filter-button" onClick={applyFilters}>Lọc</button>
      </div>
      {/* Danh sách sản phẩm */}
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
      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </main>
  );
};

export default ProductPage;