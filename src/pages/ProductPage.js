import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // Import Link để điều hướng
import "./ProductPage.css";

// Các hằng số cố định
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API để lấy dữ liệu sản phẩm
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách thương hiệu để lọc

// Hàm fetch dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Gửi yêu cầu lấy dữ liệu
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Báo lỗi nếu fetch thất bại
  const data = await response.json(); // Parse dữ liệu JSON
  return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm hoặc mảng rỗng nếu không hợp lệ
};

// Component hiển thị từng sản phẩm
const ProductCard = ({ product }) => {
  // Kiểm tra dữ liệu sản phẩm có hợp lệ không
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Ghi log lỗi nếu dữ liệu sai
    return null; // Không hiển thị nếu dữ liệu không hợp lệ
  }

  return (
    <div className="product-card">
      {/* Ảnh sản phẩm, bọc trong Link để nhấp vào ảnh dẫn đến trang chi tiết */}
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy" // Tải ảnh theo kiểu lazy để tối ưu hiệu suất
        />
      </Link>
      {/* Tên sản phẩm */}
      <h3>{product.name}</h3>
      {/* Giá sản phẩm, định dạng tiền tệ VNĐ */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      {/* Nút "Xem chi tiết", cũng dẫn đến trang chi tiết */}
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

// Component phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang đầu
    >
      Trang trước
    </button>
    <span className="pagination-current">Trang {currentPage}</span> {/* Hiển thị trang hiện tại */}
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối
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
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Thêm class active nếu thương hiệu được chọn
        onClick={() => onBrandSelect(brand)}
      >
        {brand}
      </button>
    ))}
  </div>
);

// Component chính: Trang sản phẩm
const ProductPage = () => {
  const [products, setProducts] = useState([]); // Danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm đã lọc
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [error, setError] = useState(null); // Lưu lỗi nếu xảy ra
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filters, setFilters] = useState({
    brand: "Tất cả", // Bộ lọc thương hiệu
    search: "", // Bộ lọc tìm kiếm
  });

  // Fetch dữ liệu sản phẩm khi component mount
  useEffect(() => {
    const controller = new AbortController(); // Tạo controller để hủy fetch
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal); // Lấy dữ liệu từ API
        setProducts(productList); // Lưu danh sách sản phẩm gốc
        setFilteredProducts(productList); // Lưu danh sách sản phẩm đã lọc
        setIsLoading(false); // Tắt trạng thái đang tải
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Lưu lỗi nếu không phải lỗi hủy fetch
          setIsLoading(false); // Tắt trạng thái đang tải
        }
      }
    };
    loadProducts();
    return () => controller.abort(); // Cleanup: Hủy fetch khi component unmount
  }, []);

  // Tự động lọc sản phẩm khi filters thay đổi
  useEffect(() => {
    let filtered = products;

    // Lọc theo thương hiệu
    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter((product) => product.brand === filters.brand);
    }

    // Lọc theo từ khóa tìm kiếm
    if (filters.search.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredProducts(filtered); // Cập nhật danh sách sản phẩm đã lọc
    setCurrentPage(1); // Quay về trang đầu tiên
  }, [filters, products]); // Dependency: chạy lại khi filters hoặc products thay đổi

  // Xử lý thay đổi trang
  const handlePageChange = useCallback(
    (page) => setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)))),
    [filteredProducts] // Giới hạn trang trong khoảng hợp lệ
  );

  // Xử lý thay đổi bộ lọc (tìm kiếm, thương hiệu)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value })); // Cập nhật giá trị bộ lọc
  };

  // Xử lý chọn thương hiệu
  const handleBrandSelect = (brand) => {
    setFilters((prev) => ({ ...prev, brand })); // Cập nhật thương hiệu được chọn
  };

  // Sắp xếp sản phẩm theo giá tăng dần (thấp tới cao)
  const sortLowToHigh = () => {
    const sorted = [...filteredProducts].sort((a, b) => a.price - b.price); // Sắp xếp tăng dần theo giá
    setFilteredProducts(sorted); // Cập nhật danh sách sản phẩm
    setCurrentPage(1); // Quay về trang đầu tiên
  };

  // Sắp xếp sản phẩm theo giá giảm dần (cao tới thấp)
  const sortHighToLow = () => {
    const sorted = [...filteredProducts].sort((a, b) => b.price - a.price); // Sắp xếp giảm dần theo giá
    setFilteredProducts(sorted); // Cập nhật danh sách sản phẩm
    setCurrentPage(1); // Quay về trang đầu tiên
  };

  // Reset bộ lọc về mặc định
  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "" }); // Đặt lại bộ lọc
    setFilteredProducts(products); // Khôi phục danh sách sản phẩm gốc
    setCurrentPage(1); // Quay về trang đầu
  };

  // Tính toán sản phẩm hiển thị và số trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tổng số trang
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  ); // Lấy sản phẩm cho trang hiện tại

  // Hiển thị khi đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

  // Hiển thị khi có lỗi
  if (error) return (
    <div className="status error">
      <p>❌ {error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Thử lại
      </button>
    </div>
  );

  // Giao diện chính của trang
  return (
    <main className="product-page">
      <h1 className="page-title">Danh sách sản phẩm</h1> {/* Tiêu đề trang */}
      <div className="filter-section">
        <input
          type="text"
          name="search"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={handleFilterChange}
          aria-label="Tìm kiếm sản phẩm"
        /> {/* Ô tìm kiếm, tự động lọc khi nhập/xóa */}
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={handleBrandSelect} // Tự động lọc khi chọn thương hiệu
        />
        {/* Hai button sắp xếp giá */}
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao
        </button>
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp
        </button>
      </div>
      <div className="product-list">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} /> // Hiển thị danh sách sản phẩm
          ))
        ) : (
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc {/* Nút xóa bộ lọc */}
            </button>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        /> // Hiển thị phân trang nếu có hơn 1 trang
      )}
    </main>
  );
};

export default ProductPage; // Xuất component để sử dụng ở nơi khác