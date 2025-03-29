import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Constants - Các hằng số cố định để quản lý dễ dàng
const API_URL = `${process.env.PUBLIC_URL}/db.json`; // URL API lấy dữ liệu từ file JSON
const MESSAGES = {
  LOADING: "⏳ Đang tải...", // Thông báo khi đang tải dữ liệu
  ERROR_FETCH: "❌ Không thể tải sản phẩm!", // Thông báo khi tải dữ liệu thất bại
};

// Component ProductList - Hiển thị danh sách sản phẩm
const ProductList = () => {
  const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm, ban đầu là mảng rỗng
  const [loading, setLoading] = useState(true); // State theo dõi trạng thái tải dữ liệu, ban đầu là true
  const [error, setError] = useState(null); // State lưu thông báo lỗi, ban đầu là null

  // Hook useEffect để lấy dữ liệu sản phẩm khi component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL); // Gửi yêu cầu lấy dữ liệu từ API_URL
        if (!response.ok) {
          throw new Error(MESSAGES.ERROR_FETCH); // Ném lỗi nếu response không thành công
        }
        const data = await response.json(); // Chuyển dữ liệu phản hồi thành JSON
        // Xử lý dữ liệu: nếu là mảng thì dùng trực tiếp, nếu là object thì lấy thuộc tính products
        const productList = Array.isArray(data) ? data : data.products || [];
        setProducts(productList); // Cập nhật state với danh sách sản phẩm
      } catch (err) {
        console.error("Lỗi:", err); // Ghi log lỗi để debug
        setError(err.message); // Lưu thông báo lỗi vào state
      } finally {
        setLoading(false); // Tắt trạng thái đang tải dù thành công hay thất bại
      }
    };

    fetchProducts(); // Gọi hàm lấy dữ liệu
  }, []); // Dependency array rỗng, chỉ chạy một lần khi component mount

  // Xử lý giao diện khi đang tải
  if (loading) {
    return <p className="loading">{MESSAGES.LOADING}</p>;
  }

  // Xử lý giao diện khi có lỗi
  if (error) {
    return <p className="error">{MESSAGES.ERROR_FETCH}</p>;
  }

  // Render danh sách sản phẩm
  return (
    <div className="product-list">
      <h2>📱 Danh sách sản phẩm</h2> {/* Tiêu đề danh sách */}
      <div
        style={{
          display: "flex", // Sử dụng flexbox để sắp xếp các sản phẩm
          gap: "20px", // Khoảng cách giữa các sản phẩm
          flexWrap: "wrap", // Cho phép xuống dòng khi hết chiều ngang
          justifyContent: "center", // Căn giữa các sản phẩm
        }}
      >
        {products.map((product) => (
          // Hiển thị từng sản phẩm trong danh sách
          <div
            key={product.id} // Key duy nhất để React quản lý danh sách
            className="product-card"
            style={{
              border: "1px solid #ddd", // Viền nhẹ xung quanh sản phẩm
              padding: "10px", // Khoảng đệm bên trong
              maxWidth: "200px", // Chiều rộng tối đa của mỗi thẻ sản phẩm
              textAlign: "center", // Căn giữa nội dung
              backgroundColor: "#fff5f7", // Màu nền nhạt
              borderRadius: "5px", // Bo góc nhẹ
            }}
          >
            <img
              src={product.image} // Đường dẫn hình ảnh sản phẩm
              alt={product.name} // Văn bản thay thế khi hình không tải được
              style={{ maxWidth: "100%", height: "auto" }} // Đảm bảo hình ảnh không vượt quá khung
            />
            <h3
              style={{ fontSize: "1.1rem", margin: "5px 0" }} // Tiêu đề sản phẩm với kích thước chữ và khoảng cách
            >
              {product.name} {/* Tên sản phẩm */}
            </h3>
            <p
              style={{ fontSize: "1rem", color: "#ff80ab" }} // Giá sản phẩm với màu chữ nổi bật
            >
              💰 Giá: ${product.price} {/* Hiển thị giá sản phẩm */}
            </p>
            <Link to={`/products/${product.id}`}> {/* Link đến trang chi tiết sản phẩm */}
              <button
                style={{
                  padding: "5px 10px", // Khoảng đệm bên trong nút
                  backgroundColor: "#ff80ab", // Màu nền nút
                  color: "white", // Màu chữ
                  border: "none", // Không viền
                  borderRadius: "5px", // Bo góc
                  cursor: "pointer", // Con trỏ chuột khi hover
                }}
              >
                Chi tiết {/* Nội dung nút */}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList; // Xuất component để sử dụng ở nơi khác