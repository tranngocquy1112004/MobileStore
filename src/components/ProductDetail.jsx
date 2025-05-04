import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../pages/CartContext";
import { AuthContext } from "../account/AuthContext";
import "./ProductDetail.css";

// Constants
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
const LOCAL_STORAGE_PRODUCTS_KEY = "products";
const MESSAGES = {
  LOADING: "Loading product details...",
  ERROR_FETCH: "Failed to load product data!",
  ERROR_NOT_FOUND: "Product not found!",
  SUCCESS_ADD_TO_CART: "Added to cart successfully!",
  LOGIN_REQUIRED: "Please login to add items to cart!",
};

// Utility function to fetch products from API
const fetchProductsFromApi = async (signal) => {
  const response = await fetch(API_URL, { signal });
  if (!response.ok) throw new Error(MESSAGES.ERROR_FETCH);
  const data = await response.json();
  return Array.isArray(data) ? data : data.products || [];
};

// Utility function to load products from localStorage
const loadProductsFromStorage = () => {
  try {
    const cachedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (cachedProducts) {
      const parsedProducts = JSON.parse(cachedProducts);
      return Array.isArray(parsedProducts) ? parsedProducts : [];
    }
  } catch (error) {
    console.error("Error parsing cached product data:", error);
  }
  return [];
};

// Utility function to save products to localStorage
const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error saving product data to localStorage:", error);
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isLoggedIn = false } = useContext(AuthContext) || {};

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch product data
  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProduct(null);
        setMessage("");

        let productList = loadProductsFromStorage();
        if (!productList.length) {
          productList = await fetchProductsFromApi(controller.signal);
          saveProductsToStorage(productList);
        }

        const productIdNumber = Number(id);
        const foundProduct = productList.find((p) => p.id === productIdNumber);

        if (!foundProduct) {
          setError(MESSAGES.ERROR_NOT_FOUND);
          return;
        }

        setProduct(foundProduct);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || MESSAGES.ERROR_FETCH);
          setProduct(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  // Handle adding product to cart
  const handleAddToCart = useCallback(
    (event) => {
      if (!isLoggedIn) {
        setMessage(MESSAGES.LOGIN_REQUIRED);
        setTimeout(() => {
          setMessage("");
          navigate("/");
        }, 1500);
        return;
      }

      if (!product || typeof product.id === 'undefined') {
        console.warn("Invalid product data for cart");
        return;
      }

      addToCart(product);
      setMessage(MESSAGES.SUCCESS_ADD_TO_CART);

      const productImage = event.target.closest('.product-detail')?.querySelector('.product-image');
      const cartButton = document.querySelector('.header .cart-button');

      if (productImage && cartButton) {
        const productImageRect = productImage.getBoundingClientRect();
        const cartButtonRect = cartButton.getBoundingClientRect();

        const flyingImg = productImage.cloneNode();
        flyingImg.classList.add('flying-to-cart');
        Object.assign(flyingImg.style, {
          position: 'fixed',
          top: `${productImageRect.top}px`,
          left: `${productImageRect.left}px`,
          width: `${productImageRect.width}px`,
          height: `${productImageRect.height}px`,
          zIndex: 1000,
          transition: 'top 1s ease-in-out, left 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, opacity 0.8s ease-in',
          pointerEvents: 'none',
        });

        document.body.appendChild(flyingImg);

        requestAnimationFrame(() => {
          Object.assign(flyingImg.style, {
            top: `${cartButtonRect.top + cartButtonRect.height / 2 - flyingImg.height / 2}px`,
            left: `${cartButtonRect.left + cartButtonRect.width / 2 - flyingImg.width / 2}px`,
            width: '30px',
            height: '30px',
            opacity: '0.5',
          });
        });

        flyingImg.addEventListener('transitionend', () => {
          flyingImg.remove();
          setTimeout(() => {
            setMessage("");
            navigate("/cart");
          }, 200);
        });
      } else {
        setTimeout(() => {
          setMessage("");
          navigate("/cart");
        }, 1000);
      }
    },
    [product, addToCart, isLoggedIn, navigate]
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{MESSAGES.LOADING}</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">❌ {error}</p>
        <div className="button-group">
          <Link to="/home" className="back-button" aria-label="Back to home">
            ⬅ Back
          </Link>
        </div>
      </div>
    );
  }

  // Render product details
  if (!product) {
    return <div className="product-detail error-state"><p className="error-message">An unexpected error occurred.</p></div>;
  }

  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name || 'Product Details'}</h2>
        <img
          src={product.image || ''}
          alt={product.name || 'Product'}
          className="product-image"
          loading="lazy"
        />
        <div className="price-section">
          <p className="price">
            💰 {(product.price || 0).toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
        <p className="description">{product.description || 'No description available.'}</p>
        <div className="specs">
          <h3>⚙️ Specifications</h3>
          <ul>
            <li>📱 Screen: {product?.screen || "N/A"}</li>
            <li>⚡ Chip: {product?.chip || "N/A"}</li>
            <li>💾 RAM: {product?.ram || "N/A"}</li>
            <li>💽 Storage: {product?.storage || "N/A"}</li>
            <li>📷 Camera: {product?.camera || "N/A"}</li>
            <li>🔋 Battery: {product?.battery || "N/A"}</li>
            {!(product?.screen || product?.chip || product?.ram || product?.storage || product?.camera || product?.battery) && (
              <p className="empty-state-small">No specifications available.</p>
            )}
          </ul>
        </div>
        {message && (
          <p className={`status-message ${message.includes("successfully") ? "success" : "warning"}`}>
            {message}
          </p>
        )}
      </section>
      <div className="button-group">
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={!product || isLoading || error}
          aria-label={`Add ${product?.name || 'this product'} to cart`}
        >
          🛒 Add to Cart
        </button>
        <Link to="/home" className="back-button" aria-label="Back to home">
          ⬅ Back
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;