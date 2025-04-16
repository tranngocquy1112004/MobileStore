import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductPage.css";

// Định nghĩa URL API và các hằng số
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL để fetch dữ liệu sản phẩm từ file db.json
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm hiển thị trên mỗi trang
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

// Hàm fetch danh sách sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Gửi yêu cầu fetch với signal để hủy nếu cần
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Kiểm tra nếu response không thành công
  const data = await response.json(); // Chuyển đổi response thành JSON
  return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm hoặc rỗng nếu không hợp lệ
};

// Component ProductCard hiển thị thông tin một sản phẩm
const ProductCard = ({ product }) => {
  // Kiểm tra dữ liệu sản phẩm có hợp lệ không
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Log lỗi nếu dữ liệu không hợp lệ
    return null; // Trả về null để không hiển thị card
  }

  return (
    <div className="product-card">
      {/* Link đến trang chi tiết sản phẩm */}
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy" // Tải ảnh theo chế độ lazy để tối ưu hiệu suất
        />
      </Link>
      <h3>{product.name}</h3> {/* Tên sản phẩm */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p> {/* Giá sản phẩm định dạng VNĐ */}
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

// Component Pagination để điều hướng trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage - 1)} // Chuyển đến trang trước
      disabled={currentPage === 1} // Vô hiệu hóa nếu đang ở trang đầu
    >
      Trang trước
    </button>
    <span className="pagination-current">Trang {currentPage}</span> {/* Hiển thị trang hiện tại */}
    <button
      className="pagination-button"
      onClick={() => onPageChange(currentPage + 1)} // Chuyển đến trang sau
      disabled={currentPage === totalPages} // Vô hiệu hóa nếu đang ở trang cuối
    >
      Trang sau
    </button>
  </div>
);

// Component BrandFilter để lọc theo thương hiệu
const BrandFilter = ({ brands, selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {brands.map((brand) => (
      <button
        key={brand}
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Thêm class active nếu thương hiệu được chọn
        onClick={() => onBrandSelect(brand)} // Gọi hàm khi chọn thương hiệu
      >
        {brand}
      </button>
    ))}
  </div>
);

// Component Slide để hiển thị một slide trong carousel
const Slide = ({ slide }) => (
  <div className="slide">
    <div className="slide-content">
      <div className="slide-text">
        <h2>{slide.title}</h2> {/* Tiêu đề slide */}
        <h3>{slide.subtitle}</h3> {/* Phụ đề slide */}
        <ul>
          {slide.features.map((feature, index) => (
            <li key={index}>{feature}</li> // Hiển thị danh sách tính năng
          ))}
        </ul>
      </div>
      <div className="slide-image">
        <img src={slide.image} alt={slide.title} loading="lazy" /> {/* Hình ảnh slide */}
      </div>
      <Link to={slide.link} className="slide-button">
        {slide.buttonText} {/* Nút hành động của slide */}
      </Link>
    </div>
  </div>
);

// Component chính ProductPage
const ProductPage = () => {
  // State để quản lý danh sách sản phẩm, sản phẩm đã lọc, trạng thái tải, lỗi, trang hiện tại và bộ lọc
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });

  // Cấu hình cho slider carousel
  const sliderSettings = {
    dots: true, // Hiển thị chấm điều hướng
    infinite: true, // Lặp vô hạn
    speed: 500, // Tốc độ chuyển slide
    slidesToShow: 1, // Hiển thị 1 slide mỗi lần
    slidesToScroll: 1, // Cuộn 1 slide mỗi lần
    autoplay: true, // Tự động chạy
    autoplaySpeed: 3000, // Thời gian giữa các slide (3 giây)
    arrows: true, // Hiển thị mũi tên điều hướng
  };

  // Fetch sản phẩm khi component mount
  useEffect(() => {
    const controller = new AbortController(); // Tạo controller để hủy fetch nếu cần
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal); // Lấy danh sách sản phẩm
        setProducts(productList); // Cập nhật state sản phẩm
        setFilteredProducts(productList); // Cập nhật state sản phẩm đã lọc
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Cập nhật lỗi nếu không phải lỗi hủy
        }
      } finally {
        setIsLoading(false); // Tắt trạng thái tải
      }
    };
    loadProducts();
    return () => controller.abort(); // Hủy fetch khi component unmount
  }, []);

  // Lọc sản phẩm khi filters hoặc products thay đổi
  useEffect(() => {
    let filtered = [...products]; // Sao chép danh sách sản phẩm

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
    setCurrentPage(1); // Đặt lại về trang 1
  }, [filters, products]);

  // Hàm thay đổi trang, sử dụng useCallback để tối ưu hiệu suất
  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))));
    },
    [filteredProducts]
  );

  // Xử lý thay đổi bộ lọc (tìm kiếm hoặc thương hiệu)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn thương hiệu
  const handleBrandSelect = (brand) => {
    setFilters((prev) => ({ ...prev, brand }));
  };

  // Sắp xếp giá từ thấp đến cao
  const sortLowToHigh = () => {
    setFilteredProducts([...filteredProducts].sort((a, b) => a.price - b.price));
    setCurrentPage(1); // Đặt lại về trang 1
  };

  // Sắp xếp giá từ cao đến thấp
  const sortHighToLow = () => {
    setFilteredProducts([...filteredProducts].sort((a, b) => b.price - a.price));
    setCurrentPage(1); // Đặt lại về trang 1
  };

  // Đặt lại bộ lọc
  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "" }); // Đặt lại bộ lọc
    setFilteredProducts(products); // Đặt lại danh sách sản phẩm
    setCurrentPage(1); // Đặt lại về trang 1
  };

  // Tính tổng số trang và danh sách sản phẩm hiện tại
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
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

  // Hiển thị lỗi nếu có
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
      {/* Phần carousel */}
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, index) => (
            <Slide key={index} slide={slide} /> // Hiển thị từng slide
          ))}
        </Slider>
      </div>
      <h1 className="page-title">Danh sách sản phẩm</h1> {/* Tiêu đề trang */}
      {/* Phần bộ lọc */}
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
      {/* Danh sách sản phẩm */}
      <div className="product-list">
        {currentProducts.length > 0 ? (
          <div className="product-grid">
            {currentProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} /> // Hiển thị tối đa 6 sản phẩm
            ))}
          </div>
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