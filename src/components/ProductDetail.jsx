// components/ProductDetail.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import "./ProductDetail.css";

/**
 * Các hằng số được tách riêng để dễ bảo trì và điều chỉnh
 */
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

/**
 * Component ProductDetail - Hiển thị chi tiết sản phẩm và cho phép thêm vào giỏ hàng
 * @returns {JSX.Element} - Giao diện hiển thị chi tiết sản phẩm
 */
const ProductDetail = () => {
  // Lấy thông tin ID sản phẩm từ URL params
  const { id } = useParams();
  
  // Sử dụng context để truy cập giỏ hàng và trạng thái đăng nhập
  const { addToCart, cart } = useContext(CartContext); // Giữ lại biến cart để sử dụng sau này
  const { isLoggedIn = false } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  // Các state quản lý dữ liệu và trạng thái
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Fetch dữ liệu sản phẩm từ API khi component mount hoặc ID thay đổi
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
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

  /**
   * Xử lý thêm sản phẩm vào giỏ hàng
   * Kiểm tra đăng nhập và hiển thị thông báo thành công
   * Sử dụng useCallback để tránh tạo lại hàm khi re-render
   */
  const handleAddToCart = useCallback(() => {
    // Kiểm tra trạng thái đăng nhập
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED);
      // Chuyển hướng về trang chủ sau 1 giây nếu chưa đăng nhập
      setTimeout(() => {
        navigate("/");
      }, 1000);
      return;
    }

    // Đảm bảo sản phẩm đã được tải
    if (!product) return;
    
    // Thêm vào giỏ hàng và hiển thị thông báo
    addToCart(product);
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART);

    // Tự động ẩn thông báo sau một khoảng thời gian
    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_MESSAGE_TIMEOUT);

    // Dọn dẹp timer khi component unmount hoặc hàm được gọi lại
    return () => clearTimeout(timer);
  }, [product, addToCart, isLoggedIn, navigate]);

  // Các phần hiển thị dựa trên trạng thái khác nhau
  if (loading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  if (error) {
    return <p className="error">❌ {error}</p>;
  }

  if (!product) {
    return <p className="warning">{MESSAGES.WARNING_NO_DATA}</p>;
  }

  // Giao diện chính khi đã tải xong dữ liệu
  return (
    <div className="product-detail">
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
            {/* Hiển thị các thông số kỹ thuật của sản phẩm */}
            <li>📱 Màn hình: {product.screen}</li>
            <li>⚡ Chip: {product.chip}</li>
            <li>💾 RAM: {product.ram}</li>
            <li>💽 Bộ nhớ: {product.storage}</li>
            <li>📷 Camera: {product.camera}</li>
            <li>🔋 Pin: {product.battery}</li>
          </ul>
        </div>

        {/* Hiển thị thông báo thành công nếu có */}
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