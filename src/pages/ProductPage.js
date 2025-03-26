import React, { useEffect, useState } from "react"; // Loại bỏ useContext không dùng
import { Link, useNavigate } from "react-router-dom";
import "./ProductPage.css";

// Hằng số được định nghĩa ở đầu file
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm mỗi trang
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu
const BRANDS = ["all", "Apple", "Samsung", "Xiaomi"]; // Danh sách thương hiệu cố định để dễ quản lý

const ProductPage = () => {
  // Khai báo state ngắn gọn, rõ ràng
  const [products, setProducts] = useState([]); // Danh sách tất cả sản phẩm
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm đã lọc
  const [currentUser, setCurrentUser] = useState(null); // Thông tin người dùng hiện tại
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [selectedBrand, setSelectedBrand] = useState("all"); // Thương hiệu được chọn
  const navigate = useNavigate(); // Hook điều hướng của React Router

  // Lấy dữ liệu sản phẩm và người dùng khi component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        
        const data = await response.json(); // Parse JSON trực tiếp, bỏ qua bước lấy text trung gian
        const productList = data?.products || []; // Dùng optional chaining để tránh lỗi
        
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setProducts([]);
        setFilteredProducts([]);
      }
    };

    const loadUser = () => {
      const savedUser = JSON.parse(localStorage.getItem("currentUser") || "null"); // Thêm fallback
      setCurrentUser(savedUser);
    };

    fetchProducts();
    loadUser();
  }, []); // Dependency array rỗng vì chỉ chạy 1 lần khi mount

  // Lọc sản phẩm theo thương hiệu và từ khóa tìm kiếm
  useEffect(() => {
    const filtered = products
      .filter(product => selectedBrand === "all" || product.brand === selectedBrand) // Lọc thương hiệu
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())); // Lọc tìm kiếm

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang 1 khi có thay đổi lọc
  }, [searchTerm, selectedBrand, products]); // Dependency array rõ ràng

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/");
  };

  // Logic phân trang được tối ưu
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tổng số trang
  const paginatedProducts = filteredProducts.slice( // Lấy sản phẩm cho trang hiện tại
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Hàm điều hướng trang
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  // Tạo hiệu ứng hoa anh đào rơi
  const renderSakuraSpans = () => (
    Array.from({ length: 30 }, (_, index) => <span key={index} />) // Trả về trực tiếp JSX
  );

  return (
    <div className="container">
      <div className="sakura-fall">{renderSakuraSpans()}</div>

      {/* Header */}
      <header className="header">
        <Link to="/home" className="store-title">📱MobileStore</Link>
        <div className="header-actions">
          {currentUser ? (
            <div className="user-section">
              <p className="welcome-msg">👋 Xin chào, {currentUser.username}!</p>
              <button className="logout-button" onClick={handleLogout}>🚪 Đăng xuất</button>
            </div>
          ) : (
            <Link to="/" className="login-link">Đăng nhập</Link>
          )}
          <Link to="/cart" className="cart-link">🛒 Xem giỏ hàng</Link>
        </div>
      </header>

      {/* Phần sản phẩm */}
      <section className="product-section">
        <div className="product-header">
          <h2 className="product-title">Danh sách sản phẩm</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Bộ lọc thương hiệu dùng map để ngắn gọn */}
        <div className="brand-filter">
          {BRANDS.map(brand => (
            <button
              key={brand}
              className={`brand-button ${selectedBrand === brand ? "active" : ""}`}
              onClick={() => setSelectedBrand(brand)}
            >
              {brand === "all" ? "Tất cả" : brand}
            </button>
          ))}
        </div>

        {/* Hiển thị sản phẩm */}
        {filteredProducts.length === 0 ? (
          <p className="no-results">Không tìm thấy sản phẩm nào.</p>
        ) : (
          <div className="product-grid">
            {paginatedProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`} className="product-link">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <p className="product-name">{product.name}</p>
                  <p className="product-price">💰 {product.price} VNĐ</p>
                </Link>
                <Link to={`/products/${product.id}`}>
                  <button className="product-button">Xem chi tiết</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Phân trang */}
      <div className="pagination">
        <button onClick={goToPrevPage} disabled={currentPage === 1}>⬅ Trang trước</button>
        <span>Trang {currentPage}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>Trang sau ➡</button>
      </div>
    </div>
  );
};

export default ProductPage;