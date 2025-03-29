import React, { useContext } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Import các page và component từ thư mục tương ứng
import ProductPage from "./pages/ProductPage"; // Trang danh sách sản phẩm
import ProductDetail from "./components/ProductDetail"; // Trang chi tiết sản phẩm (chuyển từ components sang pages)
import Account from "./account/Account"; // Trang đăng nhập/đăng ký (chuyển từ account sang pages)
import CartPage from "./pages/CartPage"; // Trang giỏ hàng
import OrderHistory from "./pages/OrderHistory";
import { AuthContext } from "./account/AuthContext"; // Context quản lý trạng thái xác thực
import { AuthProvider } from "./account/AuthContext"; // Provider cho AuthContext
import { CartProvider } from "./pages/CartContext"; // Provider cho CartContext
import Footer from "./components/Footer"; // Component Footer chung

// Component ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const authContext = useContext(AuthContext); // Lấy AuthContext từ useContext
  const { isLoggedIn } = authContext || { isLoggedIn: false }; // Giải cấu trúc isLoggedIn, mặc định false nếu không có context

  if (!isLoggedIn) {
    // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập ("/")
    return <Navigate to="/" replace />; // replace để không lưu lịch sử điều hướng
  }

  // Nếu đã đăng nhập, render các component con
  return children;
};

// Component App - Định nghĩa cấu trúc ứng dụng và routing
const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Account />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <ProductPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App; // Xuất component App để sử dụng làm root của ứng dụng