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
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!", // Thông báo khi không tìm thấy sản phẩm theo id
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!", // Thông báo khi thêm sản phẩm vào giỏ thành công
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!", // Thông báo khi người dùng chưa đăng nhập
};

// Component chính hiển thị chi tiết sản phẩm
const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ tham số URL
  const navigate = useNavigate(); // Hook để điều hướng người dùng đến các trang khác
  const { addToCart } = useContext(CartContext); // Lấy hàm thêm sản phẩm vào giỏ từ CartContext
  const { isLoggedIn = false } = useContext(AuthContext) || {}; // Lấy trạng thái đăng nhập, mặc định là false nếu không có AuthContext

  const [product, setProduct] = useState(null); // State lưu thông tin sản phẩm, khởi tạo là null
  const [isLoading, setIsLoading] = useState(true); // State kiểm soát trạng thái đang tải dữ liệu
  const [error, setError] = useState(null); // State lưu thông báo lỗi nếu có
  const [successMessage, setSuccessMessage] = useState(""); // State lưu thông báo thành công hoặc yêu cầu đăng nhập

  // Fetch dữ liệu sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const controller = new AbortController(); // Tạo AbortController để hủy yêu cầu fetch nếu cần

    const fetchProduct = async () => {
      try {
        setIsLoading(true); // Bật trạng thái đang tải
        setError(null); // Xóa thông báo lỗi cũ
        const response = await fetch(API_URL, { signal: controller.signal }); // Gửi yêu cầu lấy dữ liệu từ API
        if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH); // Ném lỗi nếu fetch không thành công

        const data = await response.json(); // Chuyển dữ liệu từ JSON sang object JavaScript
        const foundProduct = data.products?.find((p) => p.id === Number(id)); // Tìm sản phẩm khớp với id từ URL
        if (!foundProduct) throw new Error(MESSAGES.ERROR_NOT_FOUND); // Ném lỗi nếu không tìm thấy sản phẩm

        setProduct(foundProduct); // Lưu thông tin sản phẩm vào state
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Lưu thông báo lỗi nếu không phải lỗi do hủy fetch
        }
      } finally {
        setIsLoading(false); // Tắt trạng thái đang tải dù thành công hay thất bại
      }
    };

    fetchProduct(); // Gọi hàm fetch dữ liệu
    return () => controller.abort(); // Cleanup: Hủy fetch khi component unmount hoặc id thay đổi
  }, [id]); // Dependency: chạy lại khi id thay đổi

  // Xử lý thêm sản phẩm vào giỏ hàng, tối ưu với useCallback
  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Hiển thị thông báo yêu cầu đăng nhập nếu chưa đăng nhập
      setTimeout(() => navigate("/login"), 1000); // Chuyển hướng đến trang đăng nhập sau 1 giây
      return;
    }

    if (!product) return; // Không làm gì nếu không có sản phẩm

    addToCart(product); // Thêm sản phẩm vào giỏ hàng qua CartContext
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART); // Hiển thị thông báo thành công

    const timer = setTimeout(() => {
      setSuccessMessage(""); // Xóa thông báo sau 1 giây
      navigate("/cart"); // Chuyển hướng đến trang giỏ hàng
    }, 1000);

    return () => clearTimeout(timer); // Cleanup: Xóa timer nếu component unmount
  }, [product, addToCart, isLoggedIn, navigate]); // Dependencies: chạy lại khi các giá trị này thay đổi

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return <p className="loading">{MESSAGES.LOADING}</p>; // Thông báo đang tải dữ liệu
  }

  // Hiển thị trạng thái lỗi
  if (error) {
    return <p className="error">❌ {error}</p>; // Hiển thị thông báo lỗi nếu có
  }

  // Hiển thị nếu không có sản phẩm
  if (!product) {
    return <p className="warning">⚠ Không có dữ liệu sản phẩm</p>; // Thông báo khi không có sản phẩm
  }

  // Giao diện chính của trang chi tiết sản phẩm
  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name}</h2> {/* Hiển thị tên sản phẩm */}
        <img
          src={product.image} // Đường dẫn ảnh sản phẩm
          alt={product.name} // Văn bản thay thế cho ảnh (accessibility)
          className="product-image" // Class CSS để định dạng ảnh
          loading="lazy" // Tải ảnh theo kiểu lazy để tối ưu hiệu năng
        />
        <div className="price-section">
          <p className="price">
            💰 {product.price.toLocaleString("vi-VN")} VNĐ
          </p> {/* Hiển thị giá sản phẩm, định dạng tiền Việt Nam */}
        </div>
        <p className="description">{product.description}</p> {/* Hiển thị mô tả sản phẩm */}

        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3> {/* Tiêu đề phần thông số kỹ thuật */}
          <ul>
            <li>📱 Màn hình: {product.screen}</li> {/* Thông số màn hình */}
            <li>⚡ Chip: {product.chip}</li> {/* Thông số chip */}
            <li>💾 RAM: {product.ram}</li> {/* Thông số RAM */}
            <li>💽 Bộ nhớ: {product.storage}</li> {/* Thông số bộ nhớ */}
            <li>📷 Camera: {product.camera}</li> {/* Thông số camera */}
            <li>🔋 Pin: {product.battery}</li> {/* Thông số pin */}
          </ul>
        </div>

        {successMessage && (
          <p className="success-message">{successMessage}</p>
          // Hiển thị thông báo thành công hoặc yêu cầu đăng nhập nếu có
        )}
      </section>

      <div className="button-group">
        <button
          className="add-to-cart" // Class CSS cho nút thêm vào giỏ
          onClick={handleAddToCart} // Gọi hàm thêm vào giỏ khi nhấn
          disabled={!product} // Vô hiệu hóa nút nếu không có sản phẩm
        >
          🛒 Thêm vào giỏ {/* Nút thêm sản phẩm vào giỏ hàng */}
        </button>
        <Link to="/home" className="back-button">
          ⬅ Quay lại {/* Liên kết quay lại trang chủ */}
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail; // Xuất component để sử dụng ở nơi khác