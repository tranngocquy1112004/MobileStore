import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../account/AuthContext";
import "./ProductPage.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!",
  NO_DATA: "⚠ Không có dữ liệu sản phẩm!",
};

const PRODUCTS_PER_PAGE = 8;
const BRAND_FILTERS = ["Tất cả", "Apple", "Samsung", "Xiaomi"];

const ProductPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) || { user: null, logout: () => {} };

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH);
        const { products: productList = [] } = await response.json();
        
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    const filtered = products
      .filter(product => selectedBrand === "Tất cả" || product.brand === selectedBrand)
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedBrand, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Event handlers
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleBrandFilter = (brand) => setSelectedBrand(brand);
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToPage = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };
  const previousPage = () => currentPage > 1 && goToPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && goToPage(currentPage + 1);

  // Loading/Error states
  if (loading) return <p className="loading">{MESSAGES.LOADING}</p>;
  if (error) return <p className="error">❌ {error}</p>;
  if (!products.length) return <p className="warning">{MESSAGES.NO_DATA}</p>;

  return (
    <div className="product-page">
      <Header user={user} onLogout={handleLogout} />
      <ProductFilter
        searchTerm={searchTerm}
        onSearch={handleSearch}
        selectedBrand={selectedBrand}
        onBrandFilter={handleBrandFilter}
      />
      <ProductList products={currentProducts} />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={previousPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
};

// Component con
const Header = ({ user, onLogout }) => (
  <header className="header">
    <Link to="/home" className="store-title">📱 MobileStore</Link>
    <div className="header-right">
      {user && <span className="user-greeting">Xin Chào {user.username}</span>}
      <div className="header-buttons">
        <button className="logout-button" onClick={onLogout}>Đăng xuất</button>
        <Link to="/cart" className="cart-button">🛍 Xem giỏ hàng</Link>
      </div>
    </div>
  </header>
);

const ProductFilter = ({ searchTerm, onSearch, selectedBrand, onBrandFilter }) => (
  <>
    <h2>Danh sách sản phẩm</h2>
    <div className="filter-section">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchTerm}
        onChange={onSearch}
        className="search-input"
      />
      <div className="brand-buttons">
        {BRAND_FILTERS.map(brand => (
          <button
            key={brand}
            onClick={() => onBrandFilter(brand)}
            className={selectedBrand === brand ? "active" : ""}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  </>
);

const ProductList = ({ products }) => (
  <div className="product-list">
    {products.map(product => (
      <div key={product.id} className="product-card">
        <img src={product.image} alt={product.name} className="product-image" />
        <h3>{product.name}</h3>
        <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
        <Link to={`/products/${product.id}`}>
          <button className="detail-button">Xem chi tiết</button>
        </Link>
      </div>
    ))}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPrevious, onNext, onPageChange }) => (
  <div className="pagination">
    <button
      onClick={onPrevious}
      disabled={currentPage === 1}
      className="pagination-button"
    >
      Trang trước
    </button>
    <div className="pagination-numbers">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-number ${currentPage === page ? "active" : ""}`}
        >
          Trang {page}
        </button>
      ))}
    </div>
    <button
      onClick={onNext}
      disabled={currentPage === totalPages}
      className="pagination-button"
    >
      Trang sau
    </button>
  </div>
);

export default ProductPage;