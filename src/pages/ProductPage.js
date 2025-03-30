import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductPage.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
};
const PRODUCTS_PER_PAGE = 8;
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

const fetchProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(MESSAGES.ERROR);
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

const ProductCard = ({ id, name, image, price }) => (
  <Link to={`/products/${id}`} className="product-card-link">
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <h3>{name}</h3>
      <p className="price">💰 Giá: {price.toLocaleString("vi-VN")} VNĐ</p>
    </div>
  </Link>
);

const Pagination = ({ currentPage, totalPages, onPrevious, onNext }) => (
  <div className="pagination">
    <button
      className="pagination-button"
      onClick={onPrevious}
      disabled={currentPage === 1}
    >
      Trang trước
    </button>
    <span className="pagination-current">Trang {currentPage}</span>
    <button
      className="pagination-button"
      onClick={onNext}
      disabled={currentPage === totalPages}
    >
      Trang sau
    </button>
  </div>
);

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts();
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const filterProducts = () => {
      let filtered = [...products];
      if (selectedBrand !== "Tất cả") {
        filtered = filtered.filter((product) => product.brand === selectedBrand);
      }
      if (searchQuery.trim()) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setFilteredProducts(filtered);
      setCurrentPage(1);
    };
    filterProducts();
  }, [selectedBrand, searchQuery, products]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleBrandFilter = (brand) => setSelectedBrand(brand);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  if (isLoading) return <p className="loading">{MESSAGES.LOADING}</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="product-page">
      <h2>Danh sách sản phẩm</h2>
      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="brand-buttons">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              className={`brand-button ${selectedBrand === brand ? "active" : ""}`}
              onClick={() => handleBrandFilter(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
      <div className="product-list">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              price={product.price}
            />
          ))
        ) : (
          <p className="no-products">Không có sản phẩm nào phù hợp.</p>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      )}
    </div>
  );
};

export default ProductPage;