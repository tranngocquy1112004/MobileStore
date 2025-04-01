import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./ProductList.css";

// Constants
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị",
};

// Utility Functions
const fetchProducts = async (signal) => {
  try {
    const response = await fetch(API_URL, { signal });
    
    if (!response.ok) throw new Error(MESSAGES.ERROR);
    
    const data = await response.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("API fetch error:", error);
      throw error;
    }
  }
};

// Sub-components
const StatusMessage = ({ type }) => (
  <p className={`status-message ${type}-message`}>
    {MESSAGES[type.toUpperCase()]}
  </p>
);

const ProductCard = ({ id, name, image, price }) => (
  <div className="product-card">
    <div className="product-image-container">
      <img src={image} alt={name} className="product-image" loading="lazy" />
    </div>
    <div className="product-info">
      <h3 className="product-name">{name}</h3>
      <p className="product-price">
        💰 {price.toLocaleString("vi-VN")} VNĐ
      </p>
      <Link to={`/products/${id}`} className="product-details-link">
        <button className="details-button">Chi tiết</button>
      </Link>
    </div>
  </div>
);

// Main Component
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts(controller.signal);
        if (!productList?.length) return setStatus("no_products");
        
        setProducts(productList);
        setStatus("loaded");
      } catch (err) {
        console.error("Product loading error:", err);
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
    <div className="product-list-container">
      <h2 className="product-list-title">📱 Danh sách sản phẩm</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

// Prop Types
ProductCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
};

StatusMessage.propTypes = {
  type: PropTypes.oneOf(["loading", "error", "no_products"]).isRequired,
};

export default ProductList;