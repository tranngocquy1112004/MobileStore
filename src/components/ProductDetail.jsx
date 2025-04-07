import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext"; // Context để quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Context để quản lý trạng thái đăng nhập
import "./ProductDetail.css"; // File CSS cho giao diện chi tiết sản phẩm

// Định nghĩa các hằng số
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL để fetch dữ liệu sản phẩm từ file JSON
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải dữ liệu
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!", // Thông báo khi fetch dữ liệu thất bại
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Thông báo khi không tìm thấy sản phẩm
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Thông báo khi thêm vào giỏ hàng thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi người dùng chưa đăng nhập
};

// Component chính hiển thị chi tiết sản phẩm
const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL params
  const navigate = useNavigate(); // Hook để điều hướng người dùng
  const { addToCart } = useContext(CartContext); // Lấy hàm addToCart từ CartContext
  const { isLoggedIn = false } = useContext(AuthContext) || {}; // Lấy trạng thái đăng nhập, mặc định false nếu không có

  const [product, setProduct] = useState(null); // State lưu thông tin sản phẩm
  const [isLoading, setIsLoading] = useState(true); // State kiểm soát trạng thái đang tải
  const [error, setError] = useState(null); // State lưu thông báo lỗi
  const [successMessage, setSuccessMessage] = useState(""); // State lưu thông báo thành công hoặc yêu cầu đăng nhập

  // Fetch dữ liệu sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const controller = new AbortController(); // Tạo AbortController để hủy fetch nếu cần

    const fetchProduct = async () => {
      try {
        setIsLoading(true); // Bật trạng thái đang tải
        const response = await fetch(API_URL, { signal: controller.signal }); // Fetch dữ liệu từ API
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH); // Báo lỗi nếu fetch thất bại

        const data = await response.json(); // Parse dữ liệu JSON
        const foundProduct = data.products?.find((p) => p.id === Number(id)); // Tìm sản phẩm theo id
        if (!foundProduct) throw new Error(MESSAGES.ERROR_NOT_FOUND); // Báo lỗi nếu không tìm thấy

        setProduct(foundProduct); // Lưu sản phẩm vào state
        setError(null); // Xóa thông báo lỗi nếu có
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message); // Xử lý lỗi, bỏ qua nếu là AbortError
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải
      }
    };

    fetchProduct(); // Gọi hàm fetch
    return () => controller.abort(); // Cleanup: Hủy fetch khi component unmount
  }, [id]); // Dependency: chạy lại khi id thay đổi

  // Xử lý thêm sản phẩm vào giỏ hàng, dùng useCallback để tối ưu
  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập
      setTimeout(() => navigate("/login"), 1000); // Chuyển hướng đến trang đăng nhập sau 1 giây
      return;
    }

    if (!product) return; // Không làm gì nếu không có sản phẩm

    addToCart(product); // Thêm sản phẩm vào giỏ hàng
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Hiển thị thông báo thành công

    const timer = setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo
      navigate("/cart"); // Chuyển hướng về trang chủ
    }, 1000);

    return () => clearTimeout(timer); // Cleanup: Xóa timer nếu component unmount
  }, [product, addToCart, isLoggedIn, navigate]); // Dependencies của useCallback

  // Hiển thị trạng thái đang tải
  if (isLoading) return <p className="loading">{MESSAGES.LOADING}</p>;
  // Hiển thị trạng thái lỗi
  if (error) return <p className="error">❌ {error}</p>;
  // Hiển thị nếu không có sản phẩm
  if (!product) return <p className="warning">⚠ Không có dữ liệu sản phẩm</p>;

  // Giao diện chi tiết sản phẩm
  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name}</h2> {/* Tên sản phẩm */}
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy" // Tải ảnh theo kiểu lazy để tối ưu
        />
        <div className="price-section">
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ {/* Giá sản phẩm, định dạng VNĐ */}
          </p>
        </div>
        <p className="description">{product.description}</p> {/* Mô tả sản phẩm */}

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
          <p className="success-message">{successMessage}</p> // Hiển thị thông báo thành công hoặc yêu cầu đăng nhập
        )}
      </section>

      <div className="button-group">
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product} // Vô hiệu hóa nếu không có sản phẩm
        >
          🛒 Thêm vào giỏ {/* Nút thêm vào giỏ hàng */}
        </button>
        <Link to="/home" className="back-button">
          ⬅ Quay lại {/* Nút quay lại trang chủ */}
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Xuất component để sử dụng ở nơi khác