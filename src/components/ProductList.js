import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Constants
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR: "❌ Không thể tải sản phẩm!",
};

// Utility function to fetch products
const fetchProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(MESSAGES.ERROR);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

// Product Card Component
const ProductCard = ({ id, name, image, price }) => (
  <div className="product-card">
    <img src={image} alt={name} />
    <h3>{name}</h3>
    <p>💰 Giá: ${price}</p>
    <Link to={`/products/${id}`}>
      <button>Chi tiết</button>
    </Link>
  </div>
);

// Main ProductList Component
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await fetchProducts();
        setProducts(productList);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (isLoading) return <p className="loading">{MESSAGES.LOADING}</p>;
  if (error) return <p className="error">{MESSAGES.ERROR}</p>;

  return (
    <div className="product-list">
      <h2>📱 Danh sách sản phẩm</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;