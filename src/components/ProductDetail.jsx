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
  // Lấy ID sản phẩm từ URL params
  const { id } = useParams();
  // Hook để điều hướng người dùng
  const navigate = useNavigate();
  // Lấy hàm addToCart từ CartContext để thêm sản phẩm vào giỏ hàng
  const { addToCart } = useContext(CartContext);
  // Lấy trạng thái đăng nhập từ AuthContext, mặc định là false nếu không có
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  // State để lưu trữ thông tin sản phẩm
  const [product, setProduct] = useState(null);
  // State để kiểm soát trạng thái đang tải
  const [isLoading, setIsLoading] = useState(true);
  // State để lưu trữ thông báo lỗi
  const [error, setError] = useState(null);
  // State để hiển thị thông báo thành công hoặc yêu cầu đăng nhập
  const [successMessage, setSuccessMessage] = useState("");

  // useEffect để fetch dữ liệu sản phẩm khi component mount hoặc khi id thay đổi
  useEffect(() => {
    // Tạo AbortController để hủy fetch nếu component unmount
    const controller = new AbortController();

    // Hàm fetch dữ liệu sản phẩm từ API
    const fetchProduct = async () => {
      try {
        setIsLoading(true); // Bật trạng thái đang tải
        // Fetch dữ liệu từ file JSON
        const response = await fetch(API_URL, { signal: controller.signal });
        // Kiểm tra nếu response không thành công thì throw error
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH);

        // Parse dữ liệu JSON
        const data = await response.json();
        // Tìm sản phẩm theo id
        const foundProduct = data.products?.find(p => p.id === Number(id));
        // Nếu không tìm thấy sản phẩm, throw error
        if (!foundProduct) throw new Error(MESSAGES.ERROR_NOT_FOUND);

        setProduct(foundProduct); // Lưu sản phẩm vào state
        setError(null); // Xóa thông báo lỗi nếu có
      } catch (err) {
        // Xử lý lỗi, trừ trường hợp lỗi do hủy fetch (AbortError)
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải
      }
    };

    fetchProduct(); // Gọi hàm fetch
    // Cleanup: Hủy fetch nếu component unmount
    return () => controller.abort();
  }, [id]); // Dependency: chạy lại khi id thay đổi

  // Hàm xử lý thêm sản phẩm vào giỏ hàng, sử dụng useCallback để tránh tạo lại hàm không cần thiết
  const handleAddToCart = useCallback(() => {
    // Kiểm tra nếu người dùng chưa đăng nhập
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập
      setTimeout(() => navigate("/login"), 1000); // Chuyển hướng đến trang đăng nhập sau 1 giây
      return;
    }

    // Kiểm tra nếu không có sản phẩm thì không làm gì
    if (!product) return;

    addToCart(product); // Thêm sản phẩm vào giỏ hàng
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Hiển thị thông báo thành công

    // Tạo timer để xóa thông báo và chuyển hướng về trang chủ sau 1 giây
    const timer = setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo
      navigate("/home"); // Chuyển hướng về trang chủ
    }, 1000);

    // Cleanup: Xóa timer nếu component unmount
    return () => clearTimeout(timer);
  }, [product, addToCart, isLoggedIn, navigate]); // Dependencies của useCallback

  // Render trạng thái loading
  if (isLoading) return <p className="loading">{MESSAGES.LOADING}</p>;
  // Render trạng thái lỗi
  if (error) return <p className="error">❌ {error}</p>;
  // Render nếu không có sản phẩm
  if (!product) return <p className="warning">⚠ Không có dữ liệu sản phẩm</p>;

  // Render chi tiết sản phẩm
  return (
    <div className="product-detail">
      {/* Phần nội dung chính của sản phẩm */}
      <section className="product-content">
        <h2>{product.name}</h2> {/* Tên sản phẩm */}
        <img
          src={product.image} // Hình ảnh sản phẩm
          alt={product.name} // Alt text cho hình ảnh
          className="product-image" // Class CSS cho hình ảnh
          loading="lazy" // Tải hình ảnh theo kiểu lazy loading
        />
        <div className="price-section">
          {/* Giá sản phẩm, định dạng tiền tệ VNĐ */}
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
        <p className="description">{product.description}</p> {/* Mô tả sản phẩm */}

        {/* Thông số kỹ thuật của sản phẩm */}
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

        {/* Hiển thị thông báo thành công hoặc yêu cầu đăng nhập nếu có */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>

      {/* Nhóm các nút điều hướng */}
      <div className="button-group">
        {/* Nút thêm vào giỏ hàng */}
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product} // Vô hiệu hóa nếu không có sản phẩm
        >
          🛒 Thêm vào giỏ
        </button>
        {/* Nút quay lại trang chủ */}
        <Link to="/home" className="back-button">
          ⬅ Quay lại
        </Link>
      </div>
    </div>
  );
};

// Xuất component để sử dụng ở nơi khác
export default ProductDetail;