import React, { useCallback, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/ProductDetail.css";
import ProductDetailView from "./components/ProductDetailView";
import { useProductDetail } from "./services/useProductDetail";
import { PRODUCT_MESSAGES } from "./models/constants";

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

  const animateToCart = useCallback((event) => {
    const productImage = event?.target?.closest(".product-detail")?.querySelector(".product-image");
    const cartButton = document.querySelector(".header .cart-button");

    if (productImage && cartButton) {
      const flyingImg = createFlyingImageAnimation(productImage, cartButton);
      flyingImg.addEventListener("transitionend", () => {
        flyingImg.remove();
        setTimeout(() => navigate("/cart"), 200);
      });
      return true;
    }
    return false;
  }, [navigate]);

  const { product, isLoading, error, message, handleAddToCart } = useProductDetail({
    productId: id,
    addToCart,
    isLoggedIn,
    navigate,
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{PRODUCT_MESSAGES.LOADING}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail error-state">
        <p className="error-message">😢 {error}</p>
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

  const onAddToCart = (event) => handleAddToCart(event, animateToCart);

  return <ProductDetailView product={product} message={message} onAddToCart={onAddToCart} isLoading={isLoading} error={error} />;
};

export default ProductDetail;
