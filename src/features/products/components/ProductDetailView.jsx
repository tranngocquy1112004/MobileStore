import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../utils/formatters";
import ProductSpecs from "./ProductSpecs";

const ProductDetailView = ({ product, message, onAddToCart, isLoading, error }) => {
  return (
    <div className="product-detail">
      <section className="product-content">
        <h2>{product.name || "Product Details"}</h2>
        <img src={product.image} alt={product.name || "Product"} className="product-image" loading="lazy" />

        <div className="price-section">
          <p className="price">{formatCurrency(product.price)}</p>
        </div>

        <p className="description">{product.description || "No description available."}</p>

        <ProductSpecs product={product} />

        {message && (
          <p className={`status-message ${message.includes("successfully") ? "success" : "warning"}`}>{message}</p>
        )}
      </section>

      <div className="button-group">
        <button className="add-to-cart" onClick={onAddToCart} disabled={!product || isLoading || error}>
          Add to Cart
        </button>
        <Link to="/home" className="back-button">
          ← Back
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailView;
