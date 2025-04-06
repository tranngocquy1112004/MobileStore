import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./ProductPage.css";

// Các hằng số cố định
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu sản phẩm
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách thương hiệu để lọc

// Hàm lấy dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Fetch dữ liệu từ API
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Kiểm tra nếu fetch thất bại
  const data = await response.json(); // Parse dữ liệu JSON
  return Array.isArray(data) ? data : data.products || []; // Đảm bảo trả về mảng sản phẩm
};

// Component hiển thị từng sản phẩm
const ProductCard = ({ product }) => {
  // Kiểm tra dữ liệu sản phẩm có hợp lệ không
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Log lỗi nếu dữ liệu không hợp lệ
    return null; // Không render nếu dữ liệu không hợp lệ
  }

  return (
    <div className="product-card">
      {/* Hình ảnh sản phẩm */}
      <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      {/* Tên sản phẩm */}
      <h3>{product.name}</h3>
      {/* Giá sản phẩm, định dạng tiền tệ VNĐ */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      {/* Nút "Xem chi tiết" điều hướng đến trang chi tiết sản phẩm */}
      <Link to={`/products/${product.id}`} className="view-details-button" aria-label={`Xem chi tiết ${product.name}`}>
        Xem chi tiết
      </Link>
    </div>
  );
};

// Component phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    {/* Nút "Trang trước" */}
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Trang trước
    </button>
    {/* Hiển thị trang hiện tại */}
    <span className="pagination-current">Trang {currentPage}</span>
    {/* Nút "Trang sau" */}
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
    {/* Hiển thị danh sách các nút lọc thương hiệu */}
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
    const controller = new AbortController(); // Tạo AbortController để hủy fetch
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal); // Fetch dữ liệu sản phẩm
        setProducts(productList); // Lưu danh sách sản phẩm gốc
        setFilteredProducts(productList); // Lưu danh sách sản phẩm đã lọc
        setIsLoading(false); // Tắt trạng thái đang tải
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Lưu thông báo lỗi nếu không phải lỗi hủy fetch
          setIsLoading(false); // Tắt trạng thái đang tải
        }
      }
    };
    loadProducts(); // Gọi hàm fetch
    return () => controller.abort(); // Hủy fetch khi component unmount
  }, []);

  // Hàm thay đổi trang, sử dụng useCallback để tránh tạo lại hàm không cần thiết
  const handlePageChange = useCallback(
    (page) => setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)))),
    [filteredProducts]
  );

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target; // Lấy name và value từ input
    setFilters((prev) => ({
      ...prev,
      [name]: value, // Cập nhật bộ lọc tương ứng
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

    setFilteredProducts(filtered); // Cập nhật danh sách sản phẩm đã lọc
    setCurrentPage(1); // Reset về trang đầu
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "", minPrice: "", maxPrice: "" }); // Reset bộ lọc về mặc định
    setFilteredProducts(products); // Khôi phục danh sách sản phẩm gốc
    setCurrentPage(1); // Reset về trang đầu
  };

  // Tính toán tổng số trang và sản phẩm hiển thị trên trang hiện tại
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tổng số trang
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  ); // Sản phẩm trên trang hiện tại

  // Trạng thái đang tải
  if (isLoading) return <div className="status loading"><p>⏳ Đang tải sản phẩm...</p></div>;

  // Trạng thái lỗi
  if (error) return (
    <div className="status error">
      <p>❌ {error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Thử lại
      </button>
    </div>
  );

  // Giao diện chính
  return (
    <main className="product-page">
      {/* Tiêu đề trang */}
      <h1 className="page-title">Danh sách sản phẩm</h1>
      {/* Bộ lọc */}
      <div className="filter-section">
        {/* Input tìm kiếm sản phẩm */}
        <input
          type="text"
          name="search"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={handleFilterChange}
          aria-label="Tìm kiếm sản phẩm"
        />
        {/* Input giá tối thiểu */}
        <input
          type="number"
          name="minPrice"
          className="price-input"
          placeholder="Giá tối thiểu"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        {/* Input giá tối đa */}
        <input
          type="number"
          name="maxPrice"
          className="price-input"
          placeholder="Giá tối đa"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        {/* Component lọc theo thương hiệu */}
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={(brand) => setFilters((prev) => ({ ...prev, brand }))}
        />
        {/* Nút áp dụng bộ lọc */}
        <button className="filter-button" onClick={applyFilters}>
          Lọc
        </button>
      </div>
      {/* Danh sách sản phẩm */}
      <div className="product-list">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
            {/* Nút xóa bộ lọc */}
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
      {/* Phân trang, chỉ hiển thị nếu có nhiều hơn 1 trang */}
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

// Xuất component để sử dụng ở nơi khác
export default ProductPage;