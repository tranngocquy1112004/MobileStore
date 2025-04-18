import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

// Định nghĩa URL API và các hằng số
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL để lấy dữ liệu sản phẩm từ file JSON
const PRODUCTS_PER_PAGE = 6; // Số lượng sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách các thương hiệu để lọc

// Dữ liệu cho các slide trong carousel
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

// Hàm lấy dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Gửi yêu cầu lấy dữ liệu với AbortController
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Kiểm tra nếu yêu cầu thất bại
  const data = await response.json(); // Chuyển đổi phản hồi thành JSON
  return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm hoặc mảng rỗng nếu không hợp lệ
};

// Component hiển thị thẻ sản phẩm
const ProductCard = ({ product }) => {
  // Kiểm tra dữ liệu sản phẩm có hợp lệ không
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Ghi log lỗi nếu dữ liệu không hợp lệ
    return null; // Trả về null nếu sản phẩm không hợp lệ
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        {/* Hình ảnh sản phẩm với lazy loading */}
      </Link>
      <h3>{product.name}</h3> {/* Tên sản phẩm */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p> {/* Giá sản phẩm định dạng tiền VN */}
      <Link
        to={`/products/${product.id}`}
        className="view-details-button"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        Xem chi tiết {/* Nút xem chi tiết sản phẩm */}
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
      disabled={currentPage === 1}
    >
      Trang trước {/* Nút chuyển về trang trước */}
    </button>
    <span className="pagination-current">Trang {currentPage}</span> {/* Hiển thị trang hiện tại */}
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Trang sau {/* Nút chuyển đến trang sau */}
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
        {brand} {/* Nút lọc theo thương hiệu, trạng thái active nếu được chọn */}
      </button>
    ))}
  </div>
);

// Component hiển thị slide trong carousel
const Slide = ({ slide }) => (
  <div className="slide">
    <div className="slide-content">
      <div className="slide-text">
        <h2>{slide.title}</h2> {/* Tiêu đề slide */}
        <h3>{slide.subtitle}</h3> {/* Phụ đề slide */}
        <ul>
          {slide.features.map((feature, index) => (
            <li key={index}>{feature}</li> // Danh sách các tính năng
          ))}
        </ul>
      </div>
      <div className="slide-image">
        <img src={slide.image} alt={slide.title} loading="lazy" /> {/* Hình ảnh slide với lazy loading */}
      </div>
      <Link to={slide.link} className="slide-button">
        {slide.buttonText} {/* Nút hành động trên slide */}
      </Link>
    </div>
  </div>
);

// Component chính của trang sản phẩm
const ProductPage = () => {
  // Khai báo các state
  const [products, setProducts] = useState([]); // Lưu danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Lưu danh sách sản phẩm đã lọc
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Lưu lỗi nếu có
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" }); // Bộ lọc (thương hiệu, tìm kiếm)
  const [isSearching, setIsSearching] = useState(false); // Trạng thái đang tìm kiếm
  const [showNoResults, setShowNoResults] = useState(false); // Hiển thị thông báo không có kết quả

  // Cấu hình cho slider carousel
  const sliderSettings = {
    dots: true, // Hiển thị chấm điều hướng
    infinite: true, // Vòng lặp vô hạn
    speed: 500, // Tốc độ chuyển slide
    slidesToShow: 1, // Số slide hiển thị cùng lúc
    slidesToScroll: 1, // Số slide cuộn mỗi lần
    autoplay: true, // Tự động chạy
    autoplaySpeed: 3000, // Thời gian giữa các slide
    arrows: true, // Hiển thị mũi tên điều hướng
  };

  // Lấy dữ liệu sản phẩm khi component được mount
  useEffect(() => {
    const controller = new AbortController(); // Tạo AbortController để hủy fetch nếu cần
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal); // Gọi hàm lấy sản phẩm
        setProducts(productList); // Cập nhật danh sách sản phẩm
        setFilteredProducts(productList); //// Cập nhật danh sách sản phẩm đã lọc
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Cập nhật lỗi nếu không phải lỗi hủy
        }
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải
      }
    };
    loadProducts();
    return () => controller.abort(); // Hủy fetch khi component unmount
  }, []);

  // Lọc sản phẩm khi bộ lọc thay đổi
  useEffect(() => {
    let filtered = [...products]; // Sao chép danh sách sản phẩm gốc

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

    setIsSearching(true); // Bật trạng thái đang tìm kiếm
    setShowNoResults(false); // Ẩn thông báo không có kết quả

    // Đợi 1 giây để hiển thị kết quả lọc (debounce)
    const timeout = setTimeout(() => {
      setFilteredProducts(filtered); // Cập nhật danh sách sản phẩm đã lọc
      setIsSearching(false); // Tắt trạng thái đang tìm kiếm
      setShowNoResults(filtered.length === 0); // Hiển thị thông báo nếu không có kết quả
      setCurrentPage(1); // Đặt lại về trang đầu tiên
    }, 1000);

    return () => clearTimeout(timeout); // Xóa timeout khi filters thay đổi
  }, [filters, products]);

  // Hàm xử lý chuyển trang
  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))));
      // Đảm bảo trang nằm trong khoảng hợp lệ
    },
    [filteredProducts]
  );

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value })); // Cập nhật bộ lọc
  };

  // Xử lý chọn thương hiệu
  const handleBrandSelect = (brand) => {
    setFilters((prev) => ({ ...prev, brand })); // Cập nhật thương hiệu được chọn
  };

  // Sắp xếp giá từ thấp đến cao
  const sortLowToHigh = () => {
    setFilteredProducts([...filteredProducts].sort((a, b) => a.price - b.price));
    setCurrentPage(1); // Đặt lại về trang đầu tiên
  };

  // Sắp xếp giá từ cao đến thấp
  const sortHighToLow = () => {
    setFilteredProducts([...filteredProducts].sort((a, b) => b.price - a.price));
    setCurrentPage(1); // Đặt lại về trang đầu tiên
  };

  // Đặt lại bộ lọc
  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "" }); // Đặt lại bộ lọc
    setFilteredProducts(products); // Khôi phục danh sách sản phẩm gốc
    setCurrentPage(1); // Đặt lại về trang đầu tiên
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  // Lấy danh sách sản phẩm cho trang hiện tại
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
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

  // Giao diện chính
  return (
    <main className="product-page">
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, index) => (
            <Slide key={index} slide={slide} /> // Hiển thị các slide trong carousel
          ))}
        </Slider>
      </div>
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
        /> {/* Ô tìm kiếm sản phẩm */}
        <BrandFilter
          brands={BRANDS}
          selectedBrand={filters.brand}
          onBrandSelect={handleBrandSelect}
        /> {/* Bộ lọc thương hiệu */}
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao {/* Nút sắp xếp giá tăng dần */}
        </button>
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp {/* Nút sắp xếp giá giảm dần */}
        </button>
      </div>
      <div className="product-list">
        {isSearching ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải...</p> {/* Hiển thị khi đang tìm kiếm */}
          </div>
        ) : showNoResults ? (
          <div className="no-products-container">
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc {/* Nút xóa bộ lọc */}
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} /> // Hiển thị danh sách sản phẩm
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        /> // Hiển thị phân trang nếu có nhiều hơn 1 trang
      )}
    </main>
  );
};

export default ProductPage;