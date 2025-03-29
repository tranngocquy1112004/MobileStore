import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext"; // Import CartContext để quản lý giỏ hàng
import { AuthContext } from "../account/AuthContext"; // Import AuthContext để kiểm tra trạng thái đăng nhập
import "./ProductDetail.css"; // Import file CSS để định dạng giao diện

// Constants - Các hằng số cố định để dễ quản lý và tái sử dụng
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu từ file JSON
const SUCCESS_MESSAGE_TIMEOUT = 2000; // Thời gian hiển thị thông báo thành công (2 giây)
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải dữ liệu
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!", // Thông báo khi fetch dữ liệu thất bại
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Thông báo khi không tìm thấy sản phẩm
  WARNING_NO_DATA: "⚠ Không có dữ liệu sản phẩm!", // Thông báo khi không có sản phẩm
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Thông báo khi thêm vào giỏ thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi chưa đăng nhập
};

// Component ProductDetail - Hiển thị chi tiết sản phẩm
const ProductDetail = () => {
  const { id } = useParams(); // Lấy id sản phẩm từ URL params
  const { addToCart, cart } = useContext(CartContext); // Lấy hàm addToCart và danh sách cart từ CartContext
  const authContext = useContext(AuthContext); // Lấy AuthContext để kiểm tra trạng thái đăng nhập
  const { isLoggedIn } = authContext || { isLoggedIn: false }; // Giải cấu trúc isLoggedIn, mặc định là false nếu không có context
  const navigate = useNavigate(); // Hook để điều hướng giữa các trang

  const [product, setProduct] = useState(null); // State lưu thông tin sản phẩm, ban đầu là null
  const [loading, setLoading] = useState(true); // State theo dõi trạng thái tải dữ liệu, ban đầu là true
  const [error, setError] = useState(null); // State lưu thông báo lỗi, ban đầu là null
  const [successMessage, setSuccessMessage] = useState(""); // State lưu thông báo thành công, ban đầu rỗng

  // Hook useEffect để lấy dữ liệu sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true); // Đặt trạng thái đang tải
        const response = await fetch(API_URL); // Gửi yêu cầu lấy dữ liệu từ API_URL
        if (!response.ok) {
          throw new Error(MESSAGES.ERROR_FETCH); // Ném lỗi nếu response không thành công
        }
        const data = await response.json(); // Chuyển dữ liệu phản hồi thành JSON
        const productList = data?.products || []; // Lấy danh sách sản phẩm từ dữ liệu, mặc định là mảng rỗng
        const foundProduct = productList.find((p) => p.id === parseInt(id)); // Tìm sản phẩm theo id
        if (!foundProduct) {
          throw new Error(MESSAGES.ERROR_NOT_FOUND); // Ném lỗi nếu không tìm thấy sản phẩm
        }
        setProduct(foundProduct); // Cập nhật state với sản phẩm tìm thấy
      } catch (err) {
        setError(err.message); // Lưu thông báo lỗi vào state nếu có lỗi xảy ra
      } finally {
        setLoading(false); // Tắt trạng thái đang tải dù thành công hay thất bại
      }
    };

    fetchProduct(); // Gọi hàm lấy dữ liệu
  }, [id]); // Chạy lại khi id thay đổi

  // Hàm xử lý thêm sản phẩm vào giỏ hàng, dùng useCallback để tối ưu hiệu năng
  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo nếu chưa đăng nhập
      setTimeout(() => navigate("/"), 1000); // Chuyển hướng về trang đăng nhập sau 1 giây
      return;
    }

    if (!product) return; // Thoát nếu không có sản phẩm
    addToCart(product); // Gọi hàm từ CartContext để thêm sản phẩm vào giỏ
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Hiển thị thông báo thành công

    const timer = setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo sau SUCCESS_MESSAGE_TIMEOUT
    }, SUCCESS_MESSAGE_TIMEOUT);

    return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount
  }, [product, addToCart, isLoggedIn, navigate]); // Phụ thuộc vào các giá trị này

  // Xử lý giao diện khi đang tải
  if (loading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  // Xử lý giao diện khi có lỗi
  if (error) {
    return <p className="error">❌ {error}</p>;
  }

  // Xử lý giao diện khi không có sản phẩm
  if (!product) {
    return <p className="warning">{MESSAGES.WARNING_NO_DATA}</p>;
  }

  // Render giao diện chi tiết sản phẩm
  return (
    <div className="product-detail">
      <header className="header">
        {/* Link quay lại trang chủ */}
        <Link to="/home" className="store-title">
          📱 MobileStore
        </Link>
        {/* Link đến trang giỏ hàng, hiển thị số lượng sản phẩm */}
        <Link to="/cart" className="cart-button">
          🛍 Giỏ hàng ({cart.length})
        </Link>
      </header>

      <section className="product-content">
        <h2>{product.name}</h2> {/* Tên sản phẩm */}
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        /> {/* Hình ảnh sản phẩm */}
        <p className="price">
          💰 {product.price.toLocaleString("vi-VN")} VNĐ {/* Giá sản phẩm, định dạng tiền tệ VN */}
        </p>
        <p className="description">{product.description}</p> {/* Mô tả sản phẩm */}

        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3> {/* Tiêu đề thông số kỹ thuật */}
          <ul>
            <li>📱 Màn hình: {product.screen}</li> {/* Thông số màn hình */}
            <li>⚡ Chip: {product.chip}</li> {/* Thông số chip */}
            <li>💾 RAM: {product.ram}</li> {/* Thông số RAM */}
            <li>💽 Bộ nhớ: {product.storage}</li> {/* Thông số bộ nhớ */}
            <li>📷 Camera: {product.camera}</li> {/* Thông số camera */}
            <li>🔋 Pin: {product.battery}</li> {/* Thông số pin */}
          </ul>
        </div>

        {/* Hiển thị thông báo thành công hoặc yêu cầu đăng nhập nếu có */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>

      <div className="button-group">
        {/* Nút thêm vào giỏ hàng */}
        <button className="add-to-cart" onClick={handleAddToCart}>
          🛒 Thêm vào giỏ
        </button>
        {/* Nút quay lại trang chủ */}
        <Link to="/home">
          <button className="back-button">⬅ Quay lại</button>
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Xuất component để sử dụng ở nơi khác