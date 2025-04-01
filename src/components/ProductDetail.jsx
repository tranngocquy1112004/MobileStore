// Import các thư viện và hook cần thiết từ React
import React, { useEffect, useState, useContext, useCallback } from "react";
// Import các component từ react-router-dom để điều hướng
import { Link, useParams, useNavigate } from "react-router-dom";
// Import các context để sử dụng giỏ hàng và xác thực
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
// Import file CSS cho component
import "./ProductDetail.css";

// Đường dẫn API và các thông báo
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!",
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!",
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};

// Component chính ProductDetail
const ProductDetail = () => {
  // Lấy id sản phẩm từ URL params
  const { id } = useParams();
  // Hook để điều hướng
  const navigate = useNavigate();
  // Lấy hàm addToCart từ CartContext
  const { addToCart } = useContext(CartContext);
  // Lấy trạng thái đăng nhập từ AuthContext, mặc định là false nếu không có
  const { isLoggedIn = false } = useContext(AuthContext) || {};
  
  // Các state quản lý dữ liệu và trạng thái
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Effect để fetch dữ liệu sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const controller = new AbortController(); // Tạo AbortController để hủy request khi unmount
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Gửi request fetch với signal từ AbortController
        const response = await fetch(API_URL, { signal: controller.signal });
        
        // Nếu response không ok thì throw error
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH);
        
        // Parse dữ liệu JSON từ response
        const data = await response.json();
        // Tìm sản phẩm theo id trong danh sách products
        const foundProduct = data.products?.find(p => p.id === parseInt(id));
        
        // Nếu không tìm thấy sản phẩm thì throw error
        if (!foundProduct) throw new Error(MESSAGES.ERROR_NOT_FOUND);
        
        // Cập nhật state product và xóa error nếu có
        setProduct(foundProduct);
        setError(null);
      } catch (err) {
        // Bỏ qua lỗi nếu là AbortError (khi component unmount)
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        // Dù có lỗi hay không cũng set loading = false
        setLoading(false);
      }
    };

    fetchProduct();
    // Cleanup function để hủy request khi component unmount
    return () => controller.abort();
  }, [id]); // Dependency là id, sẽ chạy lại effect khi id thay đổi

  // Hàm xử lý thêm vào giỏ hàng, sử dụng useCallback để tối ưu hiệu năng
  const handleAddToCart = useCallback(() => {
    // Nếu chưa đăng nhập thì hiển thị thông báo và chuyển hướng đến trang login sau 1 giây
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED);
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    // Nếu không có product thì return
    if (!product) return;
    
    // Thêm sản phẩm vào giỏ hàng
    addToCart(product);
    // Hiển thị thông báo thành công
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART);
    
    // Sau 1 giây thì xóa thông báo và chuyển hướng về trang chủ
    const timer = setTimeout(() => {
      setSuccessMessage("");
      navigate("/home");
    }, 1000);

    // Cleanup function để clear timeout nếu component unmount
    return () => clearTimeout(timer);
  }, [product, addToCart, isLoggedIn, navigate]); // Các dependency của useCallback

  // Hiển thị các trạng thái loading, error hoặc không có product
  if (loading) return <p className="loading">{MESSAGES.LOADING}</p>;
  if (error) return <p className="error">❌ {error}</p>;
  if (!product) return <p className="warning">⚠ Không có dữ liệu sản phẩm</p>;

  // Render chi tiết sản phẩm
  return (
    <div className="product-detail">
      <section className="product-content">
        {/* Tên sản phẩm */}
        <h2>{product.name}</h2>
        {/* Ảnh sản phẩm với lazy loading */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image" 
          loading="lazy"
        />
        
        {/* Giá sản phẩm */}
        <div className="price-section">
          <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
        </div>
        
        {/* Mô tả sản phẩm */}
        <p className="description">{product.description}</p>

        {/* Thông số kỹ thuật */}
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

        {/* Hiển thị thông báo thành công nếu có */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>

      {/* Nhóm button hành động */}
      <div className="button-group">
        {/* Button thêm vào giỏ hàng */}
        <button 
          className="add-to-cart" 
          onClick={handleAddToCart}
          disabled={!product}
        >
          🛒 Thêm vào giỏ
        </button>
        {/* Link quay lại trang chủ */}
        <Link to="/home" className="back-button">
          ⬅ Quay lại
        </Link>
      </div>
    </div>
  );
};

// Export component ProductDetail
export default ProductDetail;