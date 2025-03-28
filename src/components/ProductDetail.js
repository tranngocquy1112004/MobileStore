import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import "./ProductDetail.css";

const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const SUCCESS_MESSAGE_TIMEOUT = 2000;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!",
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!",
  WARNING_NO_DATA: "⚠ Không có dữ liệu sản phẩm!",
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, cart } = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const { isLoggedIn } = authContext || { isLoggedIn: false };
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(MESSAGES.ERROR_FETCH);
        }
        const data = await response.json();
        const productList = data?.products || [];
        const foundProduct = productList.find((p) => p.id === parseInt(id));
        if (!foundProduct) {
          throw new Error(MESSAGES.ERROR_NOT_FOUND);
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

  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED);
      setTimeout(() => {
        navigate("/");
      }, 1000);
      return;
    }

    if (!product) return;
    addToCart(product);
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART);

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_MESSAGE_TIMEOUT);

    return () => clearTimeout(timer);
  }, [product, addToCart, isLoggedIn, navigate]);

  if (loading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  if (error) {
    return <p className="error">❌ {error}</p>;
  }

  if (!product) {
    return <p className="warning">{MESSAGES.WARNING_NO_DATA}</p>;
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
        <img src={product.image} alt={product.name} className="product-image" />
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