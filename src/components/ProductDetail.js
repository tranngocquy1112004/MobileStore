import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import "./ProductDetail.css";

// Constants
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Fetch từ file db.json trong public
const SUCCESS_MESSAGE_TIMEOUT = 2000; // 2 seconds

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, cart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm!");
        }
        const data = await response.json();
        const productList = data?.products || [];
        const foundProduct = productList.find(p => p.id === parseInt(id)); // Tìm sản phẩm theo id
        if (!foundProduct) {
          throw new Error("Sản phẩm không tồn tại!");
        }
        setProduct(foundProduct);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle adding to cart
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product);
    setSuccessMessage("✅ Thêm vào giỏ hàng thành công!");

    // Hide success message after timeout
    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_MESSAGE_TIMEOUT);

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, [product, addToCart]);

  // Render loading, error, or empty states
  if (loading) {
    return <p className="loading">⏳ Đang tải...</p>;
  }

  if (error) {
    return <p className="error">❌ {error}</p>;
  }

  if (!product) {
    return <p className="warning">⚠ Không có dữ liệu sản phẩm!</p>;
  }

  return (
    <div className="product-detail">
      <header className="header">
        <Link to="/home" className="store-title">
          📱 MobileStore
        </Link>
        <Link to="/cart" className="cart-button">
          🛍 Giỏ hàng ({cart.length})
        </Link>
      </header>

      <section className="product-content">
        <h2>{product.name}</h2>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
        <p className="price">
          💰 {product.price.toLocaleString("vi-VN")} VNĐ
        </p>
        <p className="description">{product.description}</p>

        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3>
          <ul>
            <li>📱 Màn hình: {product.screen}</li>
            <li>⚡ Chip: {product.chip}</li>
            <li>💾 RAM: {product.ram}</li>
            <li>💽 Bộ nhớ: {product.storage}</li>
            <li>📷 Camera: {product.camera}</li>
            <li>🔋 Pin: {product.battery}</li>
          </ul>
        </div>

        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>

      <div className="button-group">
        <button className="add-to-cart" onClick={handleAddToCart}>
          🛒 Thêm vào giỏ
        </button>
        <Link to="/home">
          <button className="back-button">⬅ Quay lại</button>
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;