import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./ProductList.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị",
};

const fetchProducts = async (signal) => {
  try {
    const response = await fetch(API_URL, { signal });
    if (!response.ok) throw new Error(MESSAGES.ERROR);
    
    const data = await response.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    if (error.name !== "AbortError") throw error;
  }
};

const StatusMessage = ({ type }) => (
  <div className={`status-container ${type}`}>
    <p className="status-message">{MESSAGES[type.toUpperCase()]}</p>
  </div>
);

const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-image-container">
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image" 
        loading="lazy"
      />
    </div>
    <div className="product-info">
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">
        💰 {product.price.toLocaleString("vi-VN")} VNĐ
      </p>
      <Link 
        to={`/products/${product.id}`} 
        className="product-details-link"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <button className="details-button">Chi tiết</button>
      </Link>
    </div>
  </div>
);

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal);
        setProducts(productList || []);
        setStatus(productList?.length ? "loaded" : "no_products");
      } catch {
        setStatus("error");
      }
    };

    loadProducts();
    return () => controller.abort();
  }, []);

  if (status !== "loaded") {
    return <StatusMessage type={status} />;
  }

  return (
    <main className="product-list-container">
      <h1 className="product-list-title">📱 Danh sách sản phẩm</h1>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

StatusMessage.propTypes = {
  type: PropTypes.oneOf(["loading", "error", "no_products"]).isRequired,
};

export default ProductList;