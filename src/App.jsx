import React, { useContext } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Import các page và component từ thư mục tương ứng
import ProductPage from "./pages/ProductPage"; // Trang danh sách sản phẩm
import ProductDetail from "./components/ProductDetail"// Trang chi tiết sản phẩm (đã chuyển sang pages)
import Account from "./account/Account"; // Trang đăng nhập/đăng ký
import CartPage from "./pages/CartPage"; // Trang giỏ hàng
import OrderHistory from "./pages/OrderHistory"; // Trang lịch sử đơn hàng
import AdminDashboard from "./pages/AdminDashboard"; // Import component AdminDashboard
import { AuthContext } from "./account/AuthContext"; // Context quản lý trạng thái xác thực (Named import)
import AuthProvider from "./account/AuthContext"; // Provider cho AuthContext (Default import)
import { CartProvider } from "./pages/CartContext"; // Provider cho CartContext
import Footer from "./components/Footer"; // Component Footer chung
import Header from "./components/Header"; // Component Header chung

// Component ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  // Lấy AuthContext từ useContext
  const authContext = useContext(AuthContext);
  // Giải cấu trúc isLoggedIn từ context, mặc định false nếu context hoặc isLoggedIn không tồn tại
  const { isLoggedIn } = authContext || { isLoggedIn: false };

  // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập ("/")
  if (!isLoggedIn) {
    // Sử dụng Navigate component để thực hiện điều hướng
    return <Navigate to="/" replace />; // replace để không lưu trang hiện tại vào lịch sử trình duyệt
  }

  // Nếu đã đăng nhập, render các component con (trang được bảo vệ)
  return children;
};

// Component App - Định nghĩa cấu trúc ứng dụng và routing
const App = () => {
  return (
    // AuthProvider cung cấp Context xác thực cho toàn bộ ứng dụng
    <AuthProvider>
      {/* CartProvider cung cấp Context giỏ hàng cho toàn bộ ứng dụng */}
      <CartProvider>
        {/* Router bao bọc toàn bộ phần định tuyến của ứng dụng */}
        <Router>
          {/* Header sẽ hiển thị ở tất cả các trang vì nó nằm ngoài Routes */}
          <Header />
          {/* Container chính cho nội dung của các trang. Có thể thêm CSS để tạo khoảng cách với header/footer */}
          <div className="app-content">
            {/* Routes chứa tất cả các định nghĩa Route */}
            <Routes>
              {/* Route cho trang đăng nhập/đăng ký. Đây là trang không cần đăng nhập. */}
              <Route path="/" element={<Account />} />
              {/* Route thay thế cho trang đăng nhập/đăng ký nếu dùng path khác */}
              {/* <Route path="/account" element={<Account />} /> */}

              {/* Các Route được bảo vệ, chỉ có thể truy cập khi đã đăng nhập */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <ProductPage /> {/* Trang danh sách sản phẩm */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetail /> {/* Trang chi tiết sản phẩm, lấy ID từ URL */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage /> {/* Trang giỏ hàng */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory /> {/* Trang lịch sử đơn hàng */}
                  </ProtectedRoute>
                }
              />

              {/* Route mới cho trang Admin Dashboard */}
              {/* Lưu ý: Route này CHƯA được bảo vệ. Bạn cần thêm logic kiểm tra quyền admin nếu cần. */}
               <Route path="/admin" element={<AdminDashboard />} />


              {/* Route xử lý các URL không khớp với bất kỳ Route nào ở trên */}
              {/* Chuyển hướng người dùng về trang chủ hoặc trang đăng nhập tùy thuộc trạng thái đăng nhập */}
              {/* Hiện tại đang chuyển hướng về trang gốc "/" */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </div>
          {/* Footer sẽ hiển thị ở tất cả các trang vì nó nằm ngoài Routes */}
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App; // Xuất component App để sử dụng làm root của ứng dụng
