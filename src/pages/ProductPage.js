import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import "./ProductPage.css";

// Constants
const PRODUCTS_PER_PAGE = 8;
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const ProductPage = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const navigate = useNavigate();

  // Fetch products and user on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text(); // Lấy nội dung thô trước khi parse JSON
        console.log("Raw response from /db.json:", text); // Debug: In nội dung thô
        const data = JSON.parse(text); // Parse JSON từ nội dung thô
        console.log("Parsed data from db.json:", data); // Debug: In dữ liệu đã parse
        // Kiểm tra xem data có key "products" không
        if (data && data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          console.error("No 'products' key found in db.json");
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setFilteredProducts([]);
      }
    };

    const loadUser = () => {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    };

    fetchProducts();
    loadUser();
  }, []);

  // Handle search and brand filter
  useEffect(() => {
    let filtered = products;

    // Lọc theo thương hiệu
    if (selectedBrand !== "all") {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    // Lọc theo từ khóa tìm kiếm
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  }, [searchTerm, selectedBrand, products]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Render sakura falling animation
  const renderSakuraSpans = () => {
    return Array.from({ length: 30 }, (_, index) => <span key={index} />);
  };

  return (
    <div className="container">
      <div className="sakura-fall">{renderSakuraSpans()}</div>

      <header className="header">
        <Link to="/home" className="store-title">
          📱MobileStore
        </Link>

        <div className="header-actions">
          {currentUser ? (
            <div className="user-section">
              <p className="welcome-msg">👋 Xin chào, {currentUser.username}!</p>
              <button className="logout-button" onClick={handleLogout}>
                🚪 Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/" className="login-link">
              Đăng nhập
            </Link>
          )}
          <Link to="/cart" className="cart-link">
            🛒 Xem giỏ hàng
          </Link>
        </div>
      </header>

      <section className="product-section">
        <div className="product-header">
          <h2 className="product-title">Danh sách sản phẩm</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Thêm các nút lọc thương hiệu */}
        <div className="brand-filter">
          <button
            className={`brand-button ${selectedBrand === "all" ? "active" : ""}`}
            onClick={() => setSelectedBrand("all")}
          >
            Tất cả
          </button>
          <button
            className={`brand-button ${selectedBrand === "Apple" ? "active" : ""}`}
            onClick={() => setSelectedBrand("Apple")}
          >
            Apple
          </button>
          <button
            className={`brand-button ${selectedBrand === "Samsung" ? "active" : ""}`}
            onClick={() => setSelectedBrand("Samsung")}
          >
            Samsung
          </button>
          <button
            className={`brand-button ${selectedBrand === "Xiaomi" ? "active" : ""}`}
            onClick={() => setSelectedBrand("Xiaomi")}
          >
            Xiaomi
          </button>
        </div>

        {filteredProducts.length === 0 && (
          <p className="no-results">Không tìm thấy sản phẩm nào.</p>
        )}
        <div className="product-grid">
          {currentProducts.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/products/${product.id}`} className="product-link">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <p className="product-name">{product.name}</p>
                <p className="product-price">💰 {product.price} VNĐ</p>
              </Link>
              <Link to={`/products/${product.id}`}>
                <button className="product-button">Xem chi tiết</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="pagination">
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          ⬅ Trang trước
        </button>
        <span>Trang {currentPage}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Trang sau ➡
        </button>
      </div>
    </div>
  );
};

export default ProductPage;