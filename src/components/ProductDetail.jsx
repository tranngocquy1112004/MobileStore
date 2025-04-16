import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext"; // Context để quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Context để quản lý trạng thái đăng nhập
import "./ProductDetail.css"; // File CSS để định dạng giao diện chi tiết sản phẩm

// Định nghĩa các hằng số
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // Đường dẫn tới file JSON chứa dữ liệu sản phẩm
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi dữ liệu đang được tải
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!", // Thông báo khi fetch dữ liệu thất bại
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Thông báo khi không tìm thấy sản phẩm
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Thông báo khi thêm sản phẩm vào giỏ thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi người dùng chưa đăng nhập
};

// Component chính hiển thị chi tiết sản phẩm
const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ tham số URL
  const navigate = useNavigate(); // Hook để điều hướng người dùng
  const { addToCart } = useContext(CartContext); // Lấy hàm thêm sản phẩm vào giỏ từ CartContext
  const { isLoggedIn = false } = useContext(AuthContext) || {}; // Lấy trạng thái đăng nhập, mặc định là false

  // State để quản lý dữ liệu và trạng thái giao diện
  const [product, setProduct] = useState(null); // Thông tin sản phẩm
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Thông báo lỗi
  const [successMessage, setSuccessMessage] = useState(""); // Thông báo thành công hoặc yêu cầu đăng nhập

  // Fetch dữ liệu sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const controller = new AbortController(); // Tạo controller để hủy fetch nếu cần

    const fetchProduct = async () => {
      try {
        setIsLoading(true); // Bật trạng thái đang tải
        setError(null); // Xóa lỗi cũ
        const response = await fetch(API_URL, { signal: controller.signal }); // Gửi yêu cầu fetch
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH); // Kiểm tra lỗi fetch

        const data = await response.json(); // Chuyển đổi dữ liệu JSON
        const foundProduct = (Array.isArray(data) ? data : data.products || []).find(
          (p) => p.id === Number(id)
        ); // Tìm sản phẩm theo id
        if (!foundProduct) throw new Error(MESSAGES.ERROR_NOT_FOUND); // Kiểm tra sản phẩm tồn tại

        setProduct(foundProduct); // Cập nhật state sản phẩm
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Lưu lỗi nếu không phải lỗi hủy
        }
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải
      }
    };

    fetchProduct(); // Gọi hàm fetch
    return () => controller.abort(); // Cleanup: Hủy fetch khi component unmount
  }, [id]); // Phụ thuộc vào id

  // Hàm xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Yêu cầu đăng nhập nếu chưa đăng nhập
      setTimeout(() => navigate("/login"), 1000); // Chuyển hướng đến trang đăng nhập sau 1 giây
      return;
    }

    if (!product) return; // Thoát nếu không có sản phẩm

    addToCart(product); // Thêm sản phẩm vào giỏ hàng
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Hiển thị thông báo thành công
    setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo
      navigate("/cart"); // Chuyển hướng đến trang giỏ hàng
    }, 1000);
  }, [product, addToCart, isLoggedIn, navigate]); // Phụ thuộc vào các giá trị này

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  // Hiển thị trạng thái lỗi
  if (error) {
    return <p className="error">❌ {error}</p>;
  }

  // Hiển thị nếu không có sản phẩm
  if (!product) {
    return <p className="warning">⚠ Không có dữ liệu sản phẩm</p>;
  }

  // Giao diện chính
  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name}</h2> {/* Tên sản phẩm */}
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy" // Tải ảnh theo chế độ lazy
        />
        <div className="price-section">
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ {/* Giá sản phẩm định dạng VNĐ */}
          </p>
        </div>
        <p className="description">{product.description}</p> {/* Mô tả sản phẩm */}
        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3> {/* Tiêu đề thông số kỹ thuật */}
          <ul>
            <li>📱 Màn hình: {product.screen || "Không có thông tin"}</li> {/* Thông số màn hình */}
            <li>⚡ Chip: {product.chip || "Không có thông tin"}</li> {/* Thông số chip */}
            <li>💾 RAM: {product.ram || "Không có thông tin"}</li> {/* Thông số RAM */}
            <li>💽 Bộ nhớ: {product.storage || "Không có thông tin"}</li> {/* Thông số bộ nhớ */}
            <li>📷 Camera: {product.camera || "Không có thông tin"}</li> {/* Thông số camera */}
            <li>🔋 Pin: {product.battery || "Không có thông tin"}</li> {/* Thông số pin */}
          </ul>
        </div>
        {successMessage && (
          <p className="success-message">{successMessage}</p> // Thông báo thành công hoặc yêu cầu đăng nhập
        )}
      </section>
      <div className="button-group">
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product} // Vô hiệu hóa nếu không có sản phẩm
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
        >
          🛒 Thêm vào giỏ
        </button>
        <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
          ⬅ Quay lại
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;