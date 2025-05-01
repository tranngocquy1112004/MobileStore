// Import necessary React hooks
import React, { useEffect, useState, useContext, useCallback } from "react";
// Import components from react-router-dom
import { Link, useParams, useNavigate } from "react-router-dom";
// Import Contexts
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
// Import CSS
import "./ProductDetail.css";

// --- Constants ---

// URL for product data
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// Messages for user feedback
const MESSAGES = {
  LOADING: "⏳ Đang tải...",
  ERROR_FETCH: "Không thể tải dữ liệu sản phẩm!",
  ERROR_NOT_FOUND: "Sản phẩm không tồn tại!",
  SUCCESS_ADD_TO_CART: "✅ Thêm vào giỏ hàng thành công!",
  LOGIN_REQUIRED: "Vui lòng đăng nhập để tiếp tục!",
};
// Key for caching product list in localStorage
const LOCAL_STORAGE_PRODUCTS_KEY = "products";


// --- ProductDetail Component ---
// Displays details of a specific product based on URL ID.
const ProductDetail = () => {
  // Get product ID from URL parameters
  const { id } = useParams();
  // Navigation hook
  const navigate = useNavigate();
  // Get addToCart function from CartContext
  const { addToCart } = useContext(CartContext);
  // Get isLoggedIn state from AuthContext safely
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  // --- State management ---
  const [product, setProduct] = useState(null); // Stores fetched product details
  const [isLoading, setIsLoading] = useState(true); // Loading status
  const [error, setError] = useState(null); // Error message
  const [successMessage, setSuccessMessage] = useState(""); // Success/info message

  // --- Effect hook to fetch product data on mount or ID change ---
  useEffect(() => {
    const controller = new AbortController(); // For fetch cancellation
    const signal = controller.signal;

    const fetchProduct = async () => {
      try {
        // Reset state before fetching
        setIsLoading(true);
        setError(null);
        setProduct(null);
        setSuccessMessage(""); // Clear messages

        let productList; // Variable to hold product list

        // --- Cache Check ---
        const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);

        if (cachedProducts) {
          try {
             productList = JSON.parse(cachedProducts);
             // console.log("Sử dụng dữ liệu sản phẩm từ localStorage"); // Dev log
             // Ensure cached data is an array
             if (!Array.isArray(productList)) {
                  console.warn("Dữ liệu sản phẩm trong localStorage không phải là mảng, sẽ fetch lại.");
                  productList = []; // Treat as empty if not an array
                   // Optional: remove corrupted data if parsing succeeds but it's not an array
                  // localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY);
             }
          } catch (parseError) {
            console.error("Lỗi khi parse dữ liệu sản phẩm từ localStorage:", parseError);
            productList = []; // Treat as empty if parse fails
            // Optional: remove corrupted data if parsing fails
            // localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY);
             console.log("Xóa dữ liệu lỗi trong localStorage, sẽ fetch lại.");
          }
        }

        // --- Fetch from API if cache is empty or invalid ---
        if (!Array.isArray(productList) || productList.length === 0) {
            console.log("Fetch dữ liệu sản phẩm từ API (cache trống hoặc lỗi)");
            const response = await fetch(API_URL, { signal });

            if (!response.ok) {
                throw new Error(MESSAGES.ERROR_FETCH);
            }

            const data = await response.json();
            productList = Array.isArray(data) ? data : data.products || [];

            // Cache the fetched list if not empty
            if (productList.length > 0) {
                try {
                   localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
                } catch (storageError) {
                   console.error("Lỗi khi lưu dữ liệu sản phẩm vào localStorage:", storageError);
                }
            }
        }


        // --- Find product by ID ---
        // Convert id from URL string to number for comparison
        const foundProduct = Array.isArray(productList) ? productList.find((p) => p.id === Number(id)) : undefined;
        // console.log(`Tìm sản phẩm với ID: ${id}`, foundProduct); // Dev log

        if (!foundProduct) {
          setError(MESSAGES.ERROR_NOT_FOUND); // Set error if not found
          setProduct(null); // Ensure product state is null
          return;
        }

        // If product is found, update state
        setProduct(foundProduct);

      } catch (err) {
        // Catch errors (excluding AbortError)
        if (err.name !== "AbortError") {
          console.error("Error in fetchProduct:", err);
          setError(err.message || MESSAGES.ERROR_FETCH); // Set error message
          setProduct(null); // Ensure product state is null
        }
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchProduct(); // Start fetching

    // Cleanup: abort fetch on unmount or ID change
    return () => controller.abort();
  }, [id]); // Effect re-runs when 'id' changes

  // --- Handler for "Add to Cart" button click ---
  const handleAddToCart = useCallback((event) => {
    // 1. Check user login status
    if (!isLoggedIn) {
      setSuccessMessage(MESSAGES.LOGIN_REQUIRED); // Display login required message
      // Navigate to login page after a delay
      setTimeout(() => {
        setSuccessMessage(""); // Clear message
        navigate("/login"); // Redirect
      }, 1000); // 1 second delay
      return; // Stop here if not logged in
    }

    // 2. Check if product data is available
    if (!product || typeof product.id === 'undefined') { // Check for valid product object
      console.warn("Không có dữ liệu sản phẩm hợp lệ để thêm vào giỏ.");
      return; // Stop if no valid product
    }

    // 3. Add product to cart using CartContext function
    addToCart(product); // Add the current product

    // 4. Update UI: Display success message
    setSuccessMessage(MESSAGES.SUCCESS_ADD_TO_CART);

    // --- Trigger "Fly to Cart" Animation (Direct DOM Manipulation) ---
     // Note: This animation logic directly manipulates the DOM outside of React's render cycle.
     // This approach can be harder to manage in complex applications compared to React-based animation libraries.

    const productImage = event.target.closest('.product-detail')?.querySelector('.product-image'); // Get product image element safely
    const cartButton = document.querySelector('.header .cart-button'); // Get cart button element (selector assumes header structure)

    if (productImage && cartButton) {
         const productImageRect = productImage.getBoundingClientRect(); // Get image position/size
         const cartButtonRect = cartButton.getBoundingClientRect(); // Get cart button position/size

         // Create and style a clone of the product image for animation
         const flyingImg = productImage.cloneNode();
         flyingImg.classList.add('flying-to-cart'); // Add class for CSS animation
         Object.assign(flyingImg.style, { // Set inline styles
             position: 'fixed',
             top: `${productImageRect.top}px`,
             left: `${productImageRect.left}px`,
             width: `${productImageRect.width}px`,
             height: `${productImageRect.height}px`,
             zIndex: 1000, // Ensure it's on top
             transition: 'top 1s ease-in-out, left 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, opacity 0.8s ease-in',
         });

         document.body.appendChild(flyingImg); // Append clone to body

         // Start the transition in the next animation frame
         requestAnimationFrame(() => {
              Object.assign(flyingImg.style, {
                 top: `${cartButtonRect.top + cartButtonRect.height / 2 - flyingImg.height / 2}px`, // Target Y
                 left: `${cartButtonRect.left + cartButtonRect.width / 2 - flyingImg.width / 2}px`, // Target X
                 width: '30px', // Smaller target size
                 height: '30px',
                 opacity: '0.5', // Fade out
             });
         });


         // Remove the flying image after the animation ends
         flyingImg.addEventListener('transitionend', () => {
             flyingImg.remove();
             // Navigate to cart page after a short delay following animation
              setTimeout(() => {
                 setSuccessMessage(""); // Clear message
                 navigate("/cart"); // Navigate
             }, 200); // Additional delay
         });

    } else {
      // Fallback: if animation elements not found, just navigate after a delay
       console.warn("Could not find animation elements (product image or cart button). Skipping animation."); // Log warning
       setTimeout(() => {
           setSuccessMessage(""); // Clear message
           navigate("/cart"); // Navigate
       }, 1000); // 1 second delay
    }

  }, [product, addToCart, isLoggedIn, navigate]); // Dependencies

  // --- Render UI based on status ---

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{MESSAGES.LOADING}</p>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">❌ {error}</p>
        <div className="button-group">
          <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
            ⬅ Quay lại
          </Link>
        </div>
      </div>
    );
  }

  // If not loading, no error, and product is null (shouldn't happen if error is set correctly)
  // This check is redundant if error handling above is correct, but harmless.
  // Removed the redundant check as planned.


  // --- Render product detail UI ---
  // Ensure product is available before rendering details
  if (!product) {
       // This case should ideally be covered by the error state above,
       // but as a final safeguard, return null or a default message.
       // Since error state handles 'not found', this suggests a logic flaw if reached without error.
       // Let's return a default message or error state if product is unexpectedly null here.
       // Given the error state handles "not found", reaching here with product=null implies an uncaught logic flaw.
       // It's better to rely on the explicit error state rendering. Removed this redundant check.
       return null; // Re-adding as a safeguard, though ideally unreachable.
  }


  return (
    <div className="product-detail">
      {/* Main product content */}
      <section className="product-content">
        <h2>{product.name || 'Chi tiết sản phẩm'}</h2> {/* Display name safely */}
        {/* Product image */}
        <img
          src={product.image || ''} // Display image safely
          alt={product.name || 'Sản phẩm'} // Alt text safely
          className="product-image"
          loading="lazy"
        />
        {/* Price section */}
        <div className="price-section">
          {/* Display price safely */}
          <p className="price">
            💰 {(product.price || 0).toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
        <p className="description">{product.description || 'Không có mô tả.'}</p> {/* Display description safely */}
        {/* Specifications section */}
        <div className="specs">
          <h3>⚙️ Thông số kỹ thuật</h3>
          <ul>
            {/* Display specs safely using optional chaining and default values */}
            <li>📱 Màn hình: {product?.screen || "Không có thông tin"}</li>
            <li>⚡ Chip: {product?.chip || "Không có thông tin"}</li>
            <li>💾 RAM: {product?.ram || "Không có thông tin"}</li>
            <li>💽 Bộ nhớ: {product?.storage || "Không có thông tin"}</li>
            <li>📷 Camera: {product?.camera || "Không có thông tin"}</li>
            <li>🔋 Pin: {product?.battery || "Không có thông tin"}</li>
             {/* Optional: Check if any spec was displayed */}
             {!(product?.screen || product?.chip || product?.ram || product?.storage || product?.camera || product?.battery) && (
                 <p className="empty-state-small">Không có thông tin chi tiết nào.</p>
             )}
          </ul>
        </div>
        {/* Display success/info message */}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </section>
      {/* Action Buttons Group */}
      <div className="button-group">
        {/* "Add to Cart" button */}
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product || isLoading || error} // Disable if no product, loading, or error
          aria-label={`Thêm ${product?.name || 'sản phẩm này'} vào giỏ hàng`}
        >
          🛒 Thêm vào giỏ
        </button>
        {/* "Back" button */}
        <Link to="/home" className="back-button" aria-label="Quay lại trang chủ">
          ⬅ Quay lại
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;