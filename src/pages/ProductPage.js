import React, { useEffect, useState, useCallback } from "react"; // Import các hook cần thiết từ React
import { Link } from "react-router-dom"; // Import Link để điều hướng
import "./ProductPage.css"; // Import file CSS cho styling

// Constants - Định nghĩa các hằng số
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu từ file JSON
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách thương hiệu để lọc

// Hàm fetch dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => { // Nhận signal để hủy request nếu cần
  const response = await fetch(API_URL, { signal }); // Gửi request tới API
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Kiểm tra lỗi response
  const data = await response.json(); // Chuyển response thành JSON
  return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm hoặc rỗng nếu không hợp lệ
};

// Component ProductCard - Hiển thị thông tin một sản phẩm
const ProductCard = ({ product }) => { // Nhận prop product
  // Kiểm tra dữ liệu sản phẩm có hợp lệ không
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Log lỗi nếu dữ liệu không đúng
    return null; // Trả về null nếu không hợp lệ
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card-link" aria-label={`Xem chi tiết ${product.name}`}>
      {/* Link điều hướng tới trang chi tiết sản phẩm */}
      <div className="product-card"> {/* Container cho card sản phẩm */}
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" /> {/* Hình ảnh sản phẩm */}
        <h3>{product.name}</h3> {/* Tên sản phẩm */}
        <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p> {/* Giá sản phẩm định dạng VN */}
      </div>
    </Link>
  );
};

// Component Pagination - Điều khiển phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => { // Nhận các prop cần thiết
  // Kiểm tra prop hợp lệ
  if (typeof currentPage !== "number" || typeof totalPages !== "number" || typeof onPageChange !== "function") {
    console.error("Props phân trang không hợp lệ"); // Log lỗi nếu prop không đúng
    return null; // Trả về null nếu không hợp lệ
  }

  return (
    <div className="pagination"> {/* Container cho phân trang */}
      <button
        className="pagination-button" // Nút "Trang trước"
        onClick={() => onPageChange(currentPage - 1)} // Giảm trang hiện tại
        disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang 1
      >
        Trang trước
      </button>
      <span className="pagination-current">Trang {currentPage}</span> {/* Hiển thị trang hiện tại */}
      <button
        className="pagination-button" // Nút "Trang sau"
        onClick={() => onPageChange(currentPage + 1)} // Tăng trang hiện tại
        disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối
      >
        Trang sau
      </button>
    </div>
  );
};

// Component BrandFilter - Lọc theo thương hiệu
const BrandFilter = ({ brands, selectedBrand, onBrandSelect }) => { // Nhận các prop cần thiết
  if (!Array.isArray(brands)) { // Kiểm tra brands có phải mảng không
    console.error("Danh sách thương hiệu phải là mảng"); // Log lỗi nếu không hợp lệ
    return null; // Trả về null nếu không hợp lệ
  }

  return (
    <div className="brand-buttons"> {/* Container cho các nút thương hiệu */}
      {brands.map((brand) => ( // Duyệt qua danh sách thương hiệu
        <button
          key={brand} // Key duy nhất cho mỗi nút
          className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Class động dựa trên lựa chọn
          onClick={() => onBrandSelect(brand)} // Gọi hàm chọn thương hiệu
        >
          {brand} {/* Tên thương hiệu */}
        </button>
      ))}
    </div>
  );
};

// Component chính ProductPage - Trang danh sách sản phẩm
const ProductPage = () => {
  // State quản lý dữ liệu và trạng thái
  const [products, setProducts] = useState([]); // Danh sách tất cả sản phẩm
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm đã lọc
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Lưu lỗi nếu có
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" }); // Bộ lọc (thương hiệu và tìm kiếm)

  // useEffect để fetch dữ liệu khi component mount
  useEffect(() => {
    const controller = new AbortController(); // Tạo controller để hủy request
    const loadProducts = async () => { // Hàm tải sản phẩm
      try {
        const productList = await fetchProducts(controller.signal); // Gọi hàm fetch với signal
        setProducts(productList); // Cập nhật danh sách sản phẩm
        setIsLoading(false); // Tắt trạng thái đang tải
      } catch (err) {
        if (err.name !== "AbortError") { // Kiểm tra lỗi không phải do hủy request
          setError(err.message); // Cập nhật lỗi
          setIsLoading(false); // Tắt trạng thái đang tải
        }
      }
    };

    loadProducts(); // Gọi hàm tải sản phẩm
    return () => controller.abort(); // Cleanup: hủy request khi unmount
  }, []); // Dependency rỗng: chỉ chạy khi mount

  // useEffect để lọc sản phẩm khi filters hoặc products thay đổi
  useEffect(() => {
    const filtered = products
      .filter((product) => filters.brand === "Tất cả" || product.brand === filters.brand) // Lọc theo thương hiệu
      .filter((product) =>
        filters.search.trim() // Lọc theo tìm kiếm (nếu có)
          ? product.name.toLowerCase().includes(filters.search.toLowerCase())
          : true
      );
    setFilteredProducts(filtered); // Cập nhật danh sách đã lọc
    setCurrentPage(1); // Reset về trang 1 khi lọc thay đổi
  }, [filters, products]); // Dependency: filters và products

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tổng số trang
  const currentProducts = filteredProducts.slice( // Lấy sản phẩm cho trang hiện tại
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Handlers - Các hàm xử lý sự kiện
  const handlePageChange = useCallback(
    (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))), // Đảm bảo trang trong khoảng hợp lệ
    [totalPages] // Dependency: totalPages
  );

  const handleBrandSelect = useCallback(
    (brand) => setFilters((prev) => ({ ...prev, brand })), // Cập nhật thương hiệu trong filters
    [] // Không có dependency
  );

  const handleSearchChange = useCallback(
    (e) => setFilters((prev) => ({ ...prev, search: e.target.value })), // Cập nhật tìm kiếm trong filters
    [] // Không có dependency
  );

  const resetFilters = () => setFilters({ brand: "Tất cả", search: "" }); // Reset bộ lọc về mặc định

  // Render giao diện dựa trên trạng thái
  if (isLoading) { // Trạng thái đang tải
    return (
      <div className="status loading"> {/* Container cho trạng thái tải */}
        <p>⏳ Đang tải sản phẩm...</p> {/* Thông báo đang tải */}
      </div>
    );
  }

  if (error) { // Trạng thái lỗi
    return (
      <div className="status error"> {/* Container cho trạng thái lỗi */}
        <p>❌ {error}</p> {/* Hiển thị thông báo lỗi */}
        <button onClick={() => window.location.reload()} className="retry-button"> {/* Nút thử lại */}
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <main className="product-page"> {/* Container chính của trang */}
      <h1 className="page-title">Danh sách sản phẩm</h1> {/* Tiêu đề trang */}

      <div className="filter-section"> {/* Phần bộ lọc */}
        <input
          type="text" // Ô tìm kiếm
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search} // Giá trị tìm kiếm từ state
          onChange={handleSearchChange} // Xử lý thay đổi tìm kiếm
          aria-label="Tìm kiếm sản phẩm" // Accessibility
        />
        <BrandFilter
          brands={BRANDS} // Truyền danh sách thương hiệu
          selectedBrand={filters.brand} // Thương hiệu đang chọn
          onBrandSelect={handleBrandSelect} // Hàm chọn thương hiệu
        />
      </div>

      <div className="product-list"> {/* Danh sách sản phẩm */}
        {currentProducts.length > 0 ? ( // Kiểm tra có sản phẩm nào không
          currentProducts.map((product) => ( // Duyệt qua sản phẩm hiện tại
            <ProductCard key={product.id} product={product} /> // Render từng sản phẩm
          ))
        ) : (
          <div className="no-products-container"> {/* Trường hợp không có sản phẩm */}
            <p className="no-products-message">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm</p>
            <button onClick={resetFilters} className="reset-filters-button"> {/* Nút reset bộ lọc */}
              <span className="reset-icon">✕</span> Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {totalPages > 1 && ( // Hiển thị phân trang nếu có hơn 1 trang
        <Pagination
          currentPage={currentPage} // Trang hiện tại
          totalPages={totalPages} // Tổng số trang
          onPageChange={handlePageChange} // Hàm thay đổi trang
        />
      )}
    </main>
  );
};

export default ProductPage; // Xuất component để sử dụng