// Import các thư viện và thành phần cần thiết
import React, { useEffect, useState } from "react"; // React core và các hooks
import PropTypes from "prop-types"; // Thư viện kiểm tra kiểu dữ liệu props
import { Link } from "react-router-dom"; // Thành phần điều hướng trong React Router
import "./ProductList.css"; // File CSS cho component

// Đường dẫn API lấy dữ liệu từ file db.json trong thư mục public
const API_URL = `${process.env.PUBLIC_URL}/db.json`;

// Đối tượng chứa các thông báo trạng thái
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải dữ liệu
  ERROR: "❌ Không thể tải sản phẩm!", // Thông báo khi có lỗi
  NO_PRODUCTS: "Không có sản phẩm nào để hiển thị", // Thông báo khi không có sản phẩm
};

// Hàm bất đồng bộ để fetch dữ liệu sản phẩm từ API
const fetchProducts = async (signal) => {
  try {
    // Gửi request fetch với AbortSignal để có thể hủy request
    const response = await fetch(API_URL, { signal });
    // Nếu response không ok thì throw error
    if (!response.ok) throw new Error(MESSAGES.ERROR);
    
    // Parse dữ liệu JSON từ response
    const data = await response.json();
    // Kiểm tra nếu data là mảng thì trả về data, ngược lại trả về data.products hoặc mảng rỗng
    return Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    // Bắt lỗi nhưng bỏ qua nếu là AbortError (khi component unmount)
    if (error.name !== "AbortError") throw error;
  }
};

// Component hiển thị thông báo trạng thái
const StatusMessage = ({ type }) => (
  <div className={`status-container ${type}`}>
    {/* Hiển thị message tương ứng với type */}
    <p className="status-message">{MESSAGES[type.toUpperCase()]}</p>
  </div>
);

// Component hiển thị thông tin một sản phẩm
const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-image-container">
      {/* Ảnh sản phẩm với lazy loading */}
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image" 
        loading="lazy"
      />
    </div>
    <div className="product-info">
      {/* Tên sản phẩm */}
      <h3 className="product-name">{product.name}</h3>
      {/* Giá sản phẩm được định dạng theo tiếng Việt */}
      <p className="product-price">
        💰 {product.price.toLocaleString("vi-VN")} VNĐ
      </p>
      {/* Link đến trang chi tiết sản phẩm */}
      <Link 
        to={`/products/${product.id}`} 
        className="product-details-link"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <button className="details-button">Chi tiết</button>
      </Link>
    </div>
  </div>
);

// Component chính hiển thị danh sách sản phẩm
const ProductList = () => {
  // State lưu trữ danh sách sản phẩm
  const [products, setProducts] = useState([]);
  // State lưu trữ trạng thái hiện tại (loading, error, no_products, loaded)
  const [status, setStatus] = useState("loading");

  // Effect chạy khi component mount để load dữ liệu
  useEffect(() => {
    // Tạo AbortController để có thể hủy request khi component unmount
    const controller = new AbortController();
    
    // Hàm bất đồng bộ load sản phẩm
    const loadProducts = async () => {
      try {
        // Gọi hàm fetchProducts với signal từ AbortController
        const productList = await fetchProducts(controller.signal);
        // Cập nhật state products
        setProducts(productList || []);
        // Cập nhật status dựa trên có dữ liệu hay không
        setStatus(productList?.length ? "loaded" : "no_products");
      } catch {
        // Nếu có lỗi thì set status error
        setStatus("error");
      }
    };

    // Gọi hàm loadProducts
    loadProducts();
    // Cleanup function để hủy request khi component unmount
    return () => controller.abort();
  }, []); // Dependency array rỗng để chỉ chạy một lần khi mount

  // Nếu status khác loaded thì hiển thị StatusMessage tương ứng
  if (status !== "loaded") {
    return <StatusMessage type={status} />;
  }

  // Render danh sách sản phẩm khi đã load thành công
  return (
    <main className="product-list-container">
      {/* Tiêu đề danh sách sản phẩm */}
      <h1 className="product-list-title">📱 Danh sách sản phẩm</h1>
      {/* Grid hiển thị các sản phẩm */}
      <div className="product-grid">
        {/* Map qua mảng products để render từng ProductCard */}
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};

// Kiểm tra prop types cho ProductCard
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

// Kiểm tra prop types cho StatusMessage
StatusMessage.propTypes = {
  type: PropTypes.oneOf(["loading", "error", "no_products"]).isRequired,
};

// Export component ProductList làm component mặc định
export default ProductList;