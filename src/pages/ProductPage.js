import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick"; // Thư viện để tạo carousel
import "slick-carousel/slick/slick.css"; // CSS mặc định của react-slick
import "slick-carousel/slick/slick-theme.css"; // Theme CSS của react-slick
import "./ProductPage.css";

// Các hằng số cố định
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Đường dẫn tới file JSON chứa dữ liệu sản phẩm
const PRODUCTS_PER_PAGE = 8; // Số lượng sản phẩm hiển thị trên mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"]; // Danh sách các thương hiệu để lọc sản phẩm

// Dữ liệu tĩnh cho các slide (dựa trên hình ảnh bạn cung cấp)
const SLIDES = [
  {
    image: "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg",
    title: "iPhone 16 Pro Max",
    subtitle: "Thiết kế Titan tuyệt đẹp.",
    features: [
      "Trả góp lên đến 3 TRIỆU",
      "Khách hàng mới GIẢM 300K",
      "Góp 12 Tháng từ 76K/Ngày",
    ],
    link: "/products/4", // Liên kết đến sản phẩm iPhone 16 Pro Max (id: 4 trong JSON đã chỉnh sửa)
    buttonText: "Mua ngay",
  },
  {
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_1__3.png",
    title: "Samsung Galaxy S25 Ultra",
    subtitle: "Công nghệ AI tiên tiến.",
    features: [
      "Giảm ngay 2 TRIỆU",
      "Tặng kèm sạc nhanh 45W",
      "Bảo hành chính hãng 2 năm",
    ],
    link: "/products/1", // Liên kết đến sản phẩm Samsung Galaxy S25 Ultra (id: 1 trong JSON đã chỉnh sửa)
    buttonText: "Mua ngay",
  },
  {
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15-ultra_12_.png",
    title: "Xiaomi 15 Ultra",
    subtitle: "Camera 200MP Leica đỉnh cao.",
    features: [
      "Trả góp 0% lãi suất",
      "Giảm 500K khi thanh toán online",
      "Tặng tai nghe Xiaomi Buds 4",
    ],
    link: "/products/3", // Liên kết đến sản phẩm Xiaomi 15 Ultra (id: 3 trong JSON đã chỉnh sửa)
    buttonText: "Mua ngay",
  },
];

// Hàm lấy dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Gửi yêu cầu lấy dữ liệu với khả năng hủy (AbortController)
  if (!response.ok) throw new Error("Không thể tải sản phẩm!"); // Ném lỗi nếu yêu cầu thất bại
  const data = await response.json(); // Chuyển dữ liệu từ JSON sang object JavaScript
  return Array.isArray(data) ? data : data.products || []; // Trả về mảng sản phẩm, nếu không hợp lệ thì trả mảng rỗng
};

// Component hiển thị thông tin của từng sản phẩm
const ProductCard = ({ product }) => {
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product); // Ghi log lỗi nếu dữ liệu sản phẩm thiếu hoặc sai
    return null; // Không render nếu dữ liệu không hợp lệ
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        {/* Liên kết đến trang chi tiết sản phẩm khi nhấp vào ảnh */}
        <img
          src={product.image} // Đường dẫn ảnh sản phẩm
          alt={product.name} // Tên sản phẩm làm văn bản thay thế (alt text)
          className="product-image" // Class CSS để định dạng ảnh
          loading="lazy" // Tải ảnh theo kiểu lazy để tối ưu tốc độ
        />
      </Link>
      <h3>{product.name}</h3> {/* Hiển thị tên sản phẩm */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      {/* Hiển thị giá sản phẩm, định dạng theo kiểu tiền tệ Việt Nam */}
      <Link
        to={`/products/${product.id}`} // Liên kết đến trang chi tiết sản phẩm
        className="view-details-button" // Class CSS để định dạng nút
        aria-label={`Xem chi tiết ${product.name}`} // Văn bản mô tả cho accessibility
      >
        Xem chi tiết {/* Nút để xem chi tiết sản phẩm */}
      </Link>
    </div>
  );
};

// Component phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button
      className="pagination-button" // Class CSS cho nút "Trang trước"
      onClick={() => onPageChange(currentPage - 1)} // Chuyển sang trang trước khi nhấp
      disabled={currentPage === 1} // Vô hiệu hóa nút nếu đang ở trang đầu tiên
    >
      Trang trước
    </button>
    <span className="pagination-current">Trang {currentPage}</span>
    {/* Hiển thị số trang hiện tại */}
    <button
      className="pagination-button" // Class CSS cho nút "Trang sau"
      onClick={() => onPageChange(currentPage + 1)} // Chuyển sang trang sau khi nhấp
      disabled={currentPage === totalPages} // Vô hiệu hóa nút nếu đang ở trang cuối
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
        key={brand} // Key duy nhất cho mỗi nút thương hiệu
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`}
        // Thêm class "active" nếu thương hiệu đang được chọn
        onClick={() => onBrandSelect(brand)} // Gọi hàm chọn thương hiệu khi nhấp
      >
        {brand} {/* Hiển thị tên thương hiệu */}
      </button>
    ))}
  </div>
);

// Component hiển thị từng slide trong carousel
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
      {/* Di chuyển nút "Mua ngay" ra ngoài slide-text để đặt dưới hình ảnh */}
      <Link to={slide.link} className="slide-button">
        {slide.buttonText}
      </Link>
    </div>
  </div>
);

// Component chính: Trang danh sách sản phẩm
const ProductPage = () => {
  const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // State lưu danh sách sản phẩm sau khi lọc
  const [isLoading, setIsLoading] = useState(true); // State kiểm soát trạng thái đang tải
  const [error, setError] = useState(null); // State lưu thông báo lỗi nếu có
  const [currentPage, setCurrentPage] = useState(1); // State lưu số trang hiện tại
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });
  // State lưu các bộ lọc (thương hiệu và từ khóa tìm kiếm)

  // Cấu hình cho carousel (react-slick)
  const sliderSettings = {
    dots: true, // Hiển thị chấm điều hướng
    infinite: true, // Vòng lặp vô hạn
    speed: 500, // Tốc độ chuyển slide (ms)
    slidesToShow: 1, // Hiển thị 1 slide mỗi lần
    slidesToScroll: 1, // Chuyển 1 slide mỗi lần
    autoplay: true, // Tự động chuyển slide
    autoplaySpeed: 3000, // Thời gian giữa các lần chuyển (ms)
    arrows: true, // Hiển thị mũi tên điều hướng
  };

  // Lấy dữ liệu sản phẩm khi component được mount
  useEffect(() => {
    const controller = new AbortController(); // Tạo AbortController để hủy yêu cầu fetch nếu cần
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal); // Gọi hàm lấy dữ liệu
        setProducts(productList); // Cập nhật danh sách sản phẩm gốc
        setFilteredProducts(productList); // Cập nhật danh sách sản phẩm đã lọc
        setIsLoading(false); // Tắt trạng thái đang tải
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Lưu thông báo lỗi nếu không phải lỗi hủy
          setIsLoading(false); // Tắt trạng thái đang tải
        }
      }
    };
    loadProducts(); // Gọi hàm tải dữ liệu
    return () => controller.abort(); // Cleanup: Hủy fetch khi component unmount
  }, []); // Dependency rỗng: chỉ chạy một lần khi mount

  // Lọc sản phẩm khi filters thay đổi
  useEffect(() => {
    let filtered = [...products]; // Tạo bản sao của danh sách sản phẩm gốc

    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter((product) => product.brand === filters.brand);
      // Lọc theo thương hiệu nếu không phải "Tất cả"
    }

    if (filters.search.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
      // Lọc theo từ khóa tìm kiếm (không phân biệt hoa thường)
    }

    setFilteredProducts(filtered); // Cập nhật danh sách sản phẩm đã lọc
    setCurrentPage(1); // Quay về trang đầu tiên sau khi lọc
  }, [filters, products]); // Dependency: chạy lại khi filters hoặc products thay đổi

  // Hàm xử lý thay đổi trang
  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))));
      // Giới hạn trang trong khoảng từ 1 đến tổng số trang
    },
    [filteredProducts] // Dependency: cập nhật khi danh sách sản phẩm lọc thay đổi
  );

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target; // Lấy name và value từ input
    setFilters((prev) => ({ ...prev, [name]: value })); // Cập nhật giá trị bộ lọc tương ứng
  };

  // Hàm xử lý chọn thương hiệu
  const handleBrandSelect = (brand) => {
    setFilters((prev) => ({ ...prev, brand })); // Cập nhật thương hiệu được chọn
  };

  // Hàm sắp xếp sản phẩm theo giá tăng dần
  const sortLowToHigh = () => {
    const sorted = [...filteredProducts].sort((a, b) => a.price - a.price); // Sắp xếp từ thấp đến cao
    setFilteredProducts(sorted); // Cập nhật danh sách sản phẩm
    setCurrentPage(1); // Quay về trang đầu tiên
  };

  // Hàm sắp xếp sản phẩm theo giá giảm dần
  const sortHighToLow = () => {
    const sorted = [...filteredProducts].sort((a, b) => b.price - a.price); // Sắp xếp từ cao đến thấp
    setFilteredProducts(sorted); // Cập nhật danh sách sản phẩm
    setCurrentPage(1); // Quay về trang đầu tiên
  };

  // Hàm reset bộ lọc về mặc định
  const resetFilters = () => {
    setFilters({ brand: "Tất cả", search: "" }); // Đặt lại bộ lọc về giá trị mặc định
    setFilteredProducts(products); // Khôi phục danh sách sản phẩm gốc
    setCurrentPage(1); // Quay về trang đầu tiên
  };

  // Tính toán sản phẩm hiển thị và tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tổng số trang
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  ); // Lấy danh sách sản phẩm cho trang hiện tại

  // Hiển thị giao diện khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div> {/* Hiệu ứng spinner khi tải */}
        <p className="loading-text">Đang tải...</p> {/* Thông báo đang tải */}
      </div>
    );
  }

  // Hiển thị giao diện khi có lỗi
  if (error) {
    return (
      <div className="status error">
        <p>❌ {error}</p> {/* Hiển thị thông báo lỗi */}
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại {/* Nút để thử tải lại trang */}
        </button>
      </div>
    );
  }

  // Giao diện chính của trang sản phẩm
  return (
    <main className="product-page">
      <div className="carousel-section">
        <Slider {...sliderSettings}>
          {SLIDES.map((slide, index) => (
            <Slide key={index} slide={slide} />
          ))}
        </Slider>
      </div>
      <h1 className="page-title">Danh sách sản phẩm</h1> {/* Tiêu đề trang */}
      <div className="filter-section">
        <input
          type="text"
          name="search"
          className="search-input" // Class CSS cho ô tìm kiếm
          placeholder="Tìm kiếm sản phẩm..." // Gợi ý trong ô tìm kiếm
          value={filters.search} // Giá trị hiện tại của ô tìm kiếm
          onChange={handleFilterChange} // Xử lý khi nhập/xóa từ khóa
          aria-label="Tìm kiếm sản phẩm" // Văn bản mô tả cho accessibility
        />
        <BrandFilter
          brands={BRANDS} // Danh sách thương hiệu
          selectedBrand={filters.brand} // Thương hiệu đang được chọn
          onBrandSelect={handleBrandSelect} // Hàm xử lý khi chọn thương hiệu
        />
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao {/* Nút sắp xếp giá tăng dần */}
        </button>
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp {/* Nút sắp xếp giá giảm dần */}
        </button>
      </div>

      {/* Phần slide (carousel) ngay phía trên danh sách sản phẩm */}
      <div className="product-list">
        {currentProducts.length > 0 ? (
          <div className="product-grid">
         {currentProducts.slice(0, 6).map((product) => (
    <ProductCard key={product.id} product={product} />
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

export default ProductPage; // Xuất component để sử dụng ở nơi khác