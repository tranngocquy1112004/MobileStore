import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Import các page từ thư mục pages để nhất quán
import ProductPage from "./pages/ProductPage";
import ProductDetail from "./components/ProductDetail"; // Chuyển từ ./components sang ./pages
import Account from "./account/Account"; // Chuyển từ ./account sang ./pages
import CartPage from "./pages/CartPage";
import { CartProvider } from "./pages/CartContext";
import Footer from "./components/Footer"; // Giữ nguyên vì Footer là component

const App = () => {
  return (
    // CartProvider cung cấp context cho giỏ hàng, bao bọc toàn bộ ứng dụng
    <CartProvider>
      {/* HashRouter được sử dụng để hỗ trợ client-side routing trên Netlify */}
      <Router>
        <Routes>
          {/* Route mặc định: Trang đăng nhập/đăng ký */}
          <Route path="/" element={<Account />} />
          {/* Route cho trang danh sách sản phẩm */}
          <Route path="/home" element={<ProductPage />} />
          {/* Route cho trang chi tiết sản phẩm, với tham số :id */}
          <Route path="/products/:id" element={<ProductDetail />} />
          {/* Route cho trang giỏ hàng */}
          <Route path="/cart" element={<CartPage />} />
          {/* Redirect nếu người dùng truy cập vào route không tồn tại */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Footer hiển thị trên tất cả các trang */}
        <Footer />
      </Router>
    </CartProvider>
  );
};

export default App;