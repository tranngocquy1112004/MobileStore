// pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductPage.css";

// Constants
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "❌ Không thể tải sản phẩm!",
};
const PRODUCTS_PER_PAGE = 8; // Số sản phẩm mỗi trang
const BRANDS = ["Tất cả", "Xiaomi", "iPhone", "Samsung"]; // Danh sách thương hiệu

// Component ProductPage - Hiển thị danh sách sản phẩm
const ProductPage = () => {
  const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // State lưu danh sách sản phẩm đã lọc
  const [loading, setLoading] = useState(true); // State theo dõi trạng thái tải dữ liệu
  const [error, setError] = useState(null); // State lưu thông báo lỗi
  const [currentPage, setCurrentPage] = useState(1); // State lưu trang hiện tại
  const [selectedBrand, setSelectedBrand] = useState("Tất cả"); // State lưu thương hiệu được chọn
  const [searchQuery, setSearchQuery] = useState(""); // State lưu từ khóa tìm kiếm

  // Hook useEffect để lấy dữ liệu sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(MESSAGES.ERROR_FETCH);
        }
        const data = await response.json();
        const productList = Array.isArray(data) ? data : data.products || [];
        setProducts(productList);
        setFilteredProducts(productList); // Ban đầu hiển thị tất cả sản phẩm
      } catch (err) {
        console.error("Lỗi:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Hook useEffect để lọc sản phẩm khi thương hiệu hoặc từ khóa tìm kiếm thay đổi
  useEffect(() => {
    let filtered = products;

    // Lọc theo thương hiệu
    if (selectedBrand !== "Tất cả") {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [selectedBrand, searchQuery, products]);

  // Tính toán số trang và sản phẩm hiển thị trên trang hiện tại
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Tổng số trang
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE; // Chỉ số bắt đầu của sản phẩm
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE); // Sản phẩm trên trang hiện tại

  // Xử lý chuyển trang
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Xử lý chọn thương hiệu
  const handleBrandFilter = (brand) => {
    setSelectedBrand(brand);
  };

  // Xử lý thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Xử lý giao diện khi đang tải
  if (loading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  // Xử lý giao diện khi có lỗi
  if (error) {
    return <p className="error">{MESSAGES.ERROR_FETCH}</p>;
  }

  // Render danh sách sản phẩm
  return (
    <div className="product-page">
      <h2> Danh sách sản phẩm</h2>

      {/* Bộ lọc thương hiệu và tìm kiếm */}
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
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h3>{product.name}</h3>
              <p className="price">💰 Giá: {product.price.toLocaleString("vi-VN")} VNĐ</p>
              <Link to={`/products/${product.id}`}>
                <button className="detail-button">Chi tiết</button>
              </Link>
            </div>
          ))
        ) : (
          <p className="no-products">Không có sản phẩm nào phù hợp.</p>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>
          <span className="pagination-current">Trang {currentPage}</span>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductPage;