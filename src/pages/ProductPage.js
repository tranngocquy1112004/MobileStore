// Import các thư viện cần thiết
import React, { useEffect, useState, useCallback } from "react"; // Các hook cơ bản của React
import { Link } from "react-router-dom"; // Thư viện điều hướng trang
import "./ProductPage.css"; // File CSS cho trang sản phẩm

// Các hằng số cấu hình
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Đường dẫn file JSON chứa dữ liệu
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách thương hiệu để lọc

// Hàm fetch dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Gọi API với AbortSignal để có thể hủy request
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Báo lỗi nếu request không thành công
  const data = await response.json(); // Chuyển đổi dữ liệu từ JSON sang object
  return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm (xử lý cả 2 trường hợp data là array hoặc object)
};

// Component hiển thị thẻ sản phẩm
const ProductCard = ({ product }) => {
  // Kiểm tra dữ liệu sản phẩm hợp lệ trước khi hiển thị
  if (!product || !product.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Log lỗi ra console
    return null; // Không hiển thị gì nếu dữ liệu không hợp lệ
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card-link" aria-label={`Xem chi tiết ${product.name}`}>
      <div className="product-card">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image" 
          loading="lazy" // Tối ưu tải ảnh
        />
        <h3>{product.name}</h3> {/* Tên sản phẩm */}
        <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p> {/* Giá sản phẩm định dạng VNĐ */}
      </div>
    </Link>
  );
};

// Component phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Kiểm tra props truyền vào có hợp lệ không
  if (typeof currentPage !== "number" || typeof totalPages !== "number" || typeof onPageChange !== "function") {
    console.error("Props phân trang không hợp lệ"); // Log lỗi nếu props không đúng
    return null; // Không hiển thị gì nếu props không hợp lệ
  }

  return (
    <div className="pagination">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)} // Chuyển về trang trước
        disabled={currentPage === 1} // Disable nút nếu đang ở trang đầu
      >
        Trang trước
      </button>
      <span className="pagination-current">
        Trang {currentPage}/{totalPages} {/* Hiển thị số trang hiện tại/tổng số trang */}
      </span>
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)} // Chuyển đến trang sau
        disabled={currentPage === totalPages} // Disable nút nếu đang ở trang cuối
      >
        Trang sau
      </button>
    </div>
  );
};

// Component bộ lọc thương hiệu
const BrandFilter = ({ brands, selectedBrand, onBrandSelect }) => {
  // Kiểm tra brands có phải là mảng không
  if (!Array.isArray(brands)) {
    console.error("Danh sách thương hiệu phải là mảng");
    return null; // Không hiển thị gì nếu brands không phải mảng
  }

  return (
    <div className="brand-buttons">
      {brands.map((brand) => ( // Render từng nút lọc thương hiệu
        <button
          key={brand} // Key duy nhất cho mỗi nút
          className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Thêm class active nếu được chọn
          onClick={() => onBrandSelect(brand)} // Xử lý khi chọn thương hiệu
        >
          {brand} {/* Tên thương hiệu */}
        </button>
      ))}
    </div>
  );
};

// Component chính - Trang sản phẩm
const ProductPage = () => {
  // State quản lý dữ liệu và trạng thái
  const [products, setProducts] = useState([]); // Danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm sau khi lọc
  const [status, setStatus] = useState({ loading: true, error: null }); // Trạng thái loading/error
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filters, setFilters] = useState({ // Bộ lọc
    brand: "Tất cả", // Lọc theo thương hiệu
    search: "" // Lọc theo từ khóa tìm kiếm
  });

  // Effect lấy dữ liệu sản phẩm khi component mount
  useEffect(() => {
    const controller = new AbortController(); // Tạo AbortController để hủy request khi cần
    let isMounted = true; // Biến kiểm tra component có còn mounted không

    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal); // Gọi API lấy danh sách sản phẩm
        if (isMounted) { // Chỉ cập nhật state nếu component vẫn mounted
          setProducts(productList); // Lưu danh sách sản phẩm
          setStatus({ loading: false, error: null }); // Cập nhật trạng thái thành công
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") { // Bỏ qua lỗi do hủy request
          setStatus({ loading: false, error: err.message }); // Cập nhật trạng thái lỗi
        }
      }
    };

    loadProducts(); // Gọi hàm lấy dữ liệu
    return () => { // Cleanup function khi component unmount
      isMounted = false; // Đánh dấu component đã unmount
      controller.abort(); // Hủy request nếu đang chạy
    };
  }, []); // Chỉ chạy một lần khi component mount

  // Effect lọc sản phẩm khi filters hoặc products thay đổi
  useEffect(() => {
    let filtered = [...products]; // Tạo bản sao của danh sách sản phẩm
    
    // Lọc theo thương hiệu nếu không chọn "Tất cả"
    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }
    
    // Lọc theo từ khóa tìm kiếm nếu có
    if (filters.search.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered); // Cập nhật danh sách sản phẩm đã lọc
    setCurrentPage(1); // Reset về trang 1 sau khi lọc
  }, [filters, products]); // Chạy lại khi filters hoặc products thay đổi

  // Tính toán số trang và sản phẩm hiện tại
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tính tổng số trang
  const currentProducts = filteredProducts.slice( // Lấy danh sách sản phẩm cho trang hiện tại
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Hàm xử lý chuyển trang (được memoize để tránh tạo lại hàm không cần thiết)
  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages))); // Đảm bảo trang nằm trong khoảng hợp lệ
  }, [totalPages]); // Chỉ tạo lại hàm khi totalPages thay đổi

  // Hàm xử lý chọn thương hiệu (được memoize)
  const handleBrandSelect = useCallback((brand) => {
    setFilters(prev => ({ ...prev, brand })); // Cập nhật filter brand
  }, []); // Chỉ tạo lại hàm một lần

  // Hàm xử lý thay đổi từ khóa tìm kiếm (được memoize)
  const handleSearchChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, search: e.target.value })); // Cập nhật search term
  }, []); // Chỉ tạo lại hàm một lần

  // Hiển thị trạng thái loading
  if (status.loading) {
    return (
      <div className="status loading">
        <p>⏳ Đang tải sản phẩm...</p> {/* Thông báo loading */}
      </div>
    );
  }

  // Hiển thị trạng thái lỗi
  if (status.error) {
    return (
      <div className="status error">
        <p>❌ {status.error}</p> {/* Thông báo lỗi */}
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại {/* Nút reload trang */}
        </button>
      </div>
    );
  }

  // Render giao diện chính
  return (
    <main className="product-page">
      <h1 className="page-title">Danh sách sản phẩm</h1> {/* Tiêu đề trang */}
      
      {/* Phần bộ lọc */}
      <div className="filter-section">
        {/* Ô tìm kiếm sản phẩm */}
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={handleSearchChange} // Xử lý khi thay đổi nội dung tìm kiếm
          aria-label="Tìm kiếm sản phẩm" // Mô tả cho accessibility
        />
        
        {/* Bộ lọc thương hiệu */}
        <BrandFilter 
          brands={BRANDS} 
          selectedBrand={filters.brand} 
          onBrandSelect={handleBrandSelect} 
        />
      </div>
      
      {/* Danh sách sản phẩm */}
      <div className="product-list">
        {currentProducts.length > 0 ? ( // Kiểm tra có sản phẩm nào không
          currentProducts.map(product => ( // Render danh sách sản phẩm
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          // Hiển thị khi không có sản phẩm phù hợp
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm</p>
            <button 
              onClick={() => setFilters({ brand: "Tất cả", search: "" })} // Reset bộ lọc
              className="reset-filters-button"
            >
              <span className="reset-icon">✕</span> Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
      
      {/* Hiển thị phân trang nếu có nhiều hơn 1 trang */}
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

export default ProductPage; // Xuất component để sử dụng