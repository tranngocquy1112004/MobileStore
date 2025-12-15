import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";
import { loadProducts } from "../services/productService";
import "../styles/ProductDetail.css";

const MESSAGES = {
  LOADING: "Loading product details...",
  ERROR_FETCH: "Failed to load product data!",
  ERROR_NOT_FOUND: "Product not found!",
  SUCCESS_ADD_TO_CART: "Added to cart successfully!",
  LOGIN_REQUIRED: "Please login to add items to cart!",
};

const createFlyingImageAnimation = (productImage, cartButton) => {
  const productImageRect = productImage.getBoundingClientRect();
  const cartButtonRect = cartButton.getBoundingClientRect();

  const flyingImg = productImage.cloneNode();
  flyingImg.classList.add("flying-to-cart");
  Object.assign(flyingImg.style, {
    position: "fixed",
    top: `${productImageRect.top}px`,
    left: `${productImageRect.left}px`,
    width: `${productImageRect.width}px`,
    height: `${productImageRect.height}px`,
    zIndex: 1000,
    transition: "all 1s ease-in-out, opacity 0.8s ease-in",
    pointerEvents: "none",
  });

  document.body.appendChild(flyingImg);

  requestAnimationFrame(() => {
    Object.assign(flyingImg.style, {
      top: `${cartButtonRect.top + cartButtonRect.height / 2 - 15}px`,
      left: `${cartButtonRect.left + cartButtonRect.width / 2 - 15}px`,
      width: "30px",
      height: "30px",
      opacity: "0.5",
    });
  });

  return flyingImg;
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

  useEffect(() => {
    const controller = new AbortController();
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setMessage("");
        const products = await loadProducts(controller.signal);
        const foundProduct = products.find((p) => p.id === Number(id));
        if (!foundProduct) {
          throw new Error(MESSAGES.ERROR_NOT_FOUND);
        }
        setProduct(foundProduct);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || MESSAGES.ERROR_FETCH);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
    return () => controller.abort();
  }, [id]);

  const handleAddToCart = useCallback(
    (event) => {
      if (!isLoggedIn) {
        setMessage(MESSAGES.LOGIN_REQUIRED);
        setTimeout(() => navigate("/"), 1500);
        return;
      }

      if (!product?.id) {
        console.warn("Invalid product data for cart");
        return;
      }

      addToCart(product);
      setMessage(MESSAGES.SUCCESS_ADD_TO_CART);

      const productImage = event.target.closest(".product-detail")?.querySelector(".product-image");
      const cartButton = document.querySelector(".header .cart-button");

      if (productImage && cartButton) {
        const flyingImg = createFlyingImageAnimation(productImage, cartButton);
        flyingImg.addEventListener("transitionend", () => {
          flyingImg.remove();
          setTimeout(() => navigate("/cart"), 200);
        });
      } else {
        setTimeout(() => navigate("/cart"), 1000);
      }
    },
    [product, addToCart, isLoggedIn, navigate]
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{MESSAGES.LOADING}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">⚠️ {error}</p>
        <div className="button-group">
          <Link to="/home" className="back-button">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">An unexpected error occurred.</p>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name || "Product Details"}</h2>
        <img
          src={product.image}
          alt={product.name || "Product"}
          className="product-image"
          loading="lazy"
        />

        <div className="price-section">
          <p className="price">{formatCurrency(product.price)}</p>
        </div>

        <p className="description">
          {product.description || "No description available."}
        </p>

        <div className="specs">
          <h3>Specifications</h3>
          <ul>
            {product.screen && <li>Screen: {product.screen}</li>}
            {product.chip && <li>Chip: {product.chip}</li>}
            {product.ram && <li>RAM: {product.ram}</li>}
            {product.storage && <li>Storage: {product.storage}</li>}
            {product.camera && <li>Camera: {product.camera}</li>}
            {product.battery && <li>Battery: {product.battery}</li>}
            {!product.screen &&
              !product.chip &&
              !product.ram &&
              !product.storage &&
              !product.camera &&
              !product.battery && <p className="empty-state-small">No specifications available.</p>}
          </ul>
        </div>

        {message && (
          <p className={`status-message ${message === MESSAGES.SUCCESS_ADD_TO_CART ? "success" : "warning"}`}>
            {message}
          </p>
        )}
      </section>

      <div className="button-group">
        <button className="add-to-cart" onClick={handleAddToCart} disabled={!product || isLoading || error}>
          Add to Cart
        </button>
        <Link to="/home" className="back-button">
          ← Back
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;
