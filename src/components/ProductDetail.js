import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import "./ProductDetail.css";

// Constants
// - API_URL: Đường dẫn đến file db.json trong thư mục public
// - Sử dụng process.env.PUBLIC_URL để đảm bảo đường dẫn đúng trên cả local và production
const API_URL = `${process.env.PUBLIC_URL}/db.json`;

// - SUCCESS_MESSAGE_TIMEOUT: Thời gian hiển thị thông báo thành công (2 giây)
const SUCCESS_MESSAGE_TIMEOUT = 2000;

// - MESSAGES: Các thông báo cố định để dễ quản lý và bảo trì
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!",
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!",
  WARNING_NO_DATA: "⚠ Không có dữ liệu sản phẩm!",
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!",
};

const ProductDetail = () => {
  // Hook để lấy id từ URL (ví dụ: /products/1 thì id là "1")
  const { id } = useParams();

  // Hook để sử dụng CartContext, lấy hàm addToCart và state cart
  const { addToCart, cart } = useContext(CartContext);

  // State để lưu thông tin sản phẩm
  // - product: Lưu thông tin chi tiết của sản phẩm (từ db.json)
  const [product, setProduct] = useState(null);

  // State để quản lý trạng thái loading
  // - loading: true khi đang fetch dữ liệu, false khi hoàn tất
  const [loading, setLoading] = useState(true);

  // State để lưu thông báo lỗi
  // - error: Lưu thông báo lỗi nếu fetch thất bại
  const [error, setError] = useState(null);

  // State để hiển thị thông báo thành công
  // - successMessage: Hiển thị thông báo khi thêm vào giỏ hàng thành công
  const [successMessage, setSuccessMessage] = useState("");

  // Effect để fetch thông tin sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    // Hàm fetchProduct để lấy dữ liệu từ db.json
    const fetchProduct = async () => {
      try {
        // Gửi request đến API_URL (db.json)
        const response = await fetch(API_URL);
        // Kiểm tra nếu response không thành công
        if (!response.ok) {
          throw new Error(MESSAGES.ERROR_FETCH);
        }
        // Parse dữ liệu JSON
        const data = await response.json();
        // Lấy danh sách sản phẩm từ data (mặc định là mảng rỗng nếu không có)
        const productList = data?.products || [];
        // Tìm sản phẩm theo id (chuyển id từ string sang number)
        const foundProduct = productList.find((p) => p.id === parseInt(id));
        // Nếu không tìm thấy sản phẩm, throw error
        if (!foundProduct) {
          throw new Error(MESSAGES.ERROR_NOT_FOUND);
        }
        // Cập nhật state product với sản phẩm tìm được
        setProduct(foundProduct);
      } catch (err) {
        // Lưu thông báo lỗi vào state nếu fetch thất bại
        setError(err.message);
      } finally {
        // Tắt trạng thái loading sau khi fetch hoàn tất (dù thành công hay thất bại)
        setLoading(false);
      }
    };

    // Gọi hàm fetchProduct
    fetchProduct();
  }, [id]); // Dependency: id, để fetch lại khi id thay đổi

  // Hàm xử lý thêm sản phẩm vào giỏ hàng
  // - Sử dụng useCallback để tránh tạo lại hàm không cần thiết khi component re-render
  const handleAddToCart = useCallback(() => {
    // Nếu không có sản phẩm, không làm gì
    if (!product) return;

    // Gọi hàm addToCart từ CartContext để thêm sản phẩm vào giỏ
    addToCart(product);
    // Hiển thị thông báo thành công
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART);

    // Ẩn thông báo sau SUCCESS_MESSAGE_TIMEOUT (2 giây)
    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_MESSAGE_TIMEOUT);

    // Cleanup: Xóa timeout khi component unmount để tránh memory leak
    return () => clearTimeout(timer);
  }, [product, addToCart]); // Dependencies: product, addToCart

  // Render trạng thái loading
  // - Hiển thị thông báo "Đang tải..." khi đang fetch dữ liệu
  if (loading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  // Render trạng thái lỗi
  // - Hiển thị thông báo lỗi nếu fetch thất bại
  if (error) {
    return <p className="error">❌ {error}</p>;
  }

  // Render trạng thái không có dữ liệu
  // - Hiển thị thông báo nếu không tìm thấy sản phẩm
  if (!product) {
    return <p className="warning">{MESSAGES.WARNING_NO_DATA}</p>;
  }

  // Render giao diện chi tiết sản phẩm
  return (
    <div className="product-detail">
      {/* Header với tiêu đề và nút giỏ hàng */}
      <header className="header">
        {/* Link về trang chủ */}
        <Link to="/home" className="store-title">
          📱 MobileStore
        </Link>
        {/* Link đến trang giỏ hàng, hiển thị số lượng sản phẩm trong giỏ */}
        <Link to="/cart" className="cart-button">
          🛍 Giỏ hàng ({cart.length})
        </Link>
      </header>

      {/* Nội dung chi tiết sản phẩm */}
      <section className="product-content">
        {/* Tên sản phẩm */}
        <h2>{product.name}</h2>
        {/* Hình ảnh sản phẩm */}
        <img src={product.image} alt={product.name} className="product-image" />
        {/* Giá sản phẩm, định dạng theo kiểu Việt Nam (VD: 10.000.000 VNĐ) */}
        <p className="price">
          💰 {product.price.toLocaleString("vi-VN")} VNĐ
        </p>
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

        {/* Hiển thị thông báo thành công khi thêm vào giỏ hàng */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>

      {/* Nhóm nút điều khiển */}
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

export default ProductDetail;