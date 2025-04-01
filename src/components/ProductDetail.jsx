import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import "./ProductDetail.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!",
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!",
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isLoggedIn = false } = useContext(AuthContext) || {};
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL, { signal: controller.signal });
        
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH);
        
        const data = await response.json();
        const foundProduct = data.products?.find(p => p.id === parseInt(id));
        
        if (!foundProduct) throw new Error(MESSAGES.ERROR_NOT_FOUND);
        
        setProduct(foundProduct);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED);
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (!product) return;
    
    addToCart(product);
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART);
    
    const timer = setTimeout(() => {
      setSuccessMessage("");
      navigate("/home");
    }, 1000);

    return () => clearTimeout(timer);
  }, [product, addToCart, isLoggedIn, navigate]);

  if (loading) return <p className="loading">{MESSAGES.LOADING}</p>;
  if (error) return <p className="error">❌ {error}</p>;
  if (!product) return <p className="warning">⚠ Không có dữ liệu sản phẩm</p>;

  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name}</h2>
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image" 
          loading="lazy"
        />
        
        <div className="price-section">
          <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
        </div>
        
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
        <button 
          className="add-to-cart" 
          onClick={handleAddToCart}
          disabled={!product}
        >
          🛒 Thêm vào giỏ
        </button>
        <Link to="/home" className="back-button">
          ⬅ Quay lại
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;