import React, { useContext } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Import các page từ thư mục pages để nhất quán
import ProductPage from "./pages/ProductPage";
import ProductDetail from "./components/ProductDetail"; // Chuyển từ ./components sang ./pages
import Account from "./account/Account"; // Chuyển từ ./account sang ./pages
import { AuthContext } from "./account/AuthContext";
import { AuthProvider } from "./account/AuthContext";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./pages/CartContext";
import Footer from "./components/Footer"; // Giữ nguyên vì Footer là component

const ProtectedRoute = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isLoggedIn } = authContext || { isLoggedIn: false };

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;