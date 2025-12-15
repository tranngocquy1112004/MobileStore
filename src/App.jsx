import React, { useContext } from "react"; // Import hook useContext từ thư viện React
// Import các thành phần cần thiết từ react-router-dom cho việc định tuyến:
// HashRouter sử dụng dấu '#' trong URL (thường dùng cho các ứng dụng đơn giản hoặc deploy trên server tĩnh)
// Routes bao bọc các định nghĩa Route
// Route định nghĩa một route cụ thể (path và component tương ứng)
// Navigate dùng để điều hướng chương trình (thay thế Redirect trong v5)
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import các page và component từ thư mục tương ứng:
import ProductPage from "./pages/ProductPage"; // Trang danh sách sản phẩm
// Import ProductDetail từ thư mục pages (đúng như comment đã ghi nhận chuyển sang pages)
import ProductDetail from "./components/ProductDetail"; // Trang chi tiết sản phẩm
import Account from "./account/Account"; // Trang đăng nhập/đăng ký/đăng xuất
import CartPage from "./pages/CartPage"; // Trang giỏ hàng
import OrderHistory from "./pages/OrderHistory"; // Trang lịch sử đơn hàng
import AdminDashboard from "./pages/AdminDashboard"; // Component AdminDashboard
import UserProfilePage from "./pages/UserProfilePage"; // Component UserProfilePage (trang hồ sơ người dùng)
import CheckoutPage from "./pages/CheckoutPage";
// Import AuthProvider (default export) và AuthContext (named export) từ cùng file
import AuthProvider, { AuthContext } from "./context/AuthContext";
// Import CartProvider (named export) từ file CartContext
import { CartProvider } from "./context/CartContext";

// Import các component layout chung
import Footer from "./components/Footer"; // Component Footer chung
import Header from "./components/Header"; // Component Header chung

// --- Component ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập ---
// Component này nhận các component con (children) làm prop.
// Nó kiểm tra trạng thái đăng nhập và chỉ render children nếu đã đăng nhập,
// ngược lại sẽ điều hướng về trang đăng nhập.
const ProtectedRoute = ({ children }) => {
  // Sử dụng useContext để lấy AuthContext.
  // AuthContext được cung cấp bởi AuthProvider bọc phía trên.
  const authContext = useContext(AuthContext);
  // Giải cấu trúc isLoggedIn từ context.
  // Cung cấp giá trị mặc định { isLoggedIn: false } để tránh lỗi nếu context chưa sẵn sàng
  // hoặc AuthContext chưa được cung cấp đúng cách.
  const { isLoggedIn } = authContext || { isLoggedIn: false };

  // Nếu trạng thái isLoggedIn là false (chưa đăng nhập),
  // sử dụng component Navigate để chuyển hướng người dùng.
  if (!isLoggedIn) {
    // Navigate to "/" (trang đăng nhập/đăng ký)
    // replace prop: Khi điều hướng, nó sẽ thay thế entry hiện tại trong lịch sử trình duyệt
    // thay vì thêm một entry mới. Điều này giúp người dùng không thể quay lại trang bị bảo vệ
    // bằng cách nhấn nút back của trình duyệt.
    return <Navigate to="/" replace />;
  }

  // Nếu trạng thái isLoggedIn là true (đã đăng nhập),
  // component sẽ render các children (trang được bảo vệ) mà nó bao bọc.
  return children;
};

// --- Component App - Định nghĩa cấu trúc ứng dụng và routing ---
// Đây là component gốc của ứng dụng React.
// Nó thiết lập Context Providers và cấu hình React Router để điều hướng giữa các trang.
const App = () => {
  return (
    // Bọc toàn bộ ứng dụng bằng AuthProvider để cung cấp Context xác thực
    // cho tất cả các component con có thể truy cập.
    <AuthProvider>
      {/* Bọc phần ứng dụng cần truy cập Context giỏ hàng bằng CartProvider */}
      {/* Thông thường AuthProvider sẽ bọc CartProvider vì CartContext có thể cần thông tin user */}
      <CartProvider>
        {/* Bọc toàn bộ phần định tuyến của ứng dụng bằng Router */}
        <Router>
          {/* Header và Footer là các component layout chung,
              chúng được đặt bên ngoài Routes để hiển thị ở tất cả các trang */}
          <Header />

          {/* Một div container có thể thêm CSS để tạo padding cho nội dung chính,
              tránh bị header/footer che khuất. */}
          <div className="app-content">
            {/* Routes component chứa tất cả các định nghĩa Route của ứng dụng */}
            <Routes>
              {/* Route cho trang đăng nhập/đăng ký. Đây là trang công khai (không cần đăng nhập). */}
              <Route path="/" element={<Account />} />
              {/* Có thể thêm các route công khai khác tại đây nếu cần */}

              {/* --- Các Route được bảo vệ (yêu cầu người dùng phải đăng nhập) --- */}
              {/* Sử dụng component ProtectedRoute để bao bọc các component trang cần bảo vệ.
                  Nếu người dùng chưa đăng nhập khi truy cập các path này, ProtectedRoute sẽ chuyển hướng họ về trang "/" (Account). */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute> {/* Bọc ProductPage bằng ProtectedRoute */}
                    <ProductPage /> {/* Trang danh sách sản phẩm */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute> {/* Bọc ProductDetail bằng ProtectedRoute */}
                    {/* ProductDetail nhận ID sản phẩm từ URL thông qua useParams hook */}
                    <ProductDetail /> {/* Trang chi tiết sản phẩm */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute> {/* Bọc CartPage bằng ProtectedRoute */}
                    <CartPage /> {/* Trang giỏ hàng */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute> {/* Bọc OrderHistory bằng ProtectedRoute */}
                    <OrderHistory /> {/* Trang lịch sử đơn hàng */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage /> {/* Trang Thanh toán */}
                  </ProtectedRoute>
                }
              />
               <Route
                path="/profile"
                element={
                  <ProtectedRoute> {/* Bọc UserProfilePage bằng ProtectedRoute */}
                    <UserProfilePage /> {/* Trang hồ sơ người dùng */}
                  </ProtectedRoute>
                }
              />


              {/* --- Route cho trang Admin Dashboard --- */}
              {/* Route này hiện tại CHƯA được bảo vệ bởi ProtectedRoute.
                  Để bảo vệ route admin, bạn sẽ cần tạo một AdminProtectedRoute
                  kiểm tra cả trạng thái đăng nhập VÀ vai trò (role) của người dùng. */}
              <Route path="/admin" element={<AdminDashboard />} />
               {/* Có thể thêm các Route khác cho admin dashboard tại đây nếu cần */}


              {/* --- Route xử lý các URL không khớp (Fallback/404) --- */}
              {/* Route với path="*" sẽ khớp với bất kỳ URL nào không khớp với các Route đã định nghĩa ở trên. */}
              {/* Sử dụng Navigate để chuyển hướng người dùng về trang gốc "/" (trang đăng nhập/đăng ký). */}
              {/* Bạn có thể thay đổi đích đến này tùy theo logic ứng dụng (ví dụ: về trang chủ nếu đã đăng nhập). */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </div>

          {/* Footer là component layout chung, hiển thị ở tất cả các trang */}
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App; // Export component App làm default export để sử dụng trong file entry point (thường là index.js)
