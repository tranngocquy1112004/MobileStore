import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Product card component displaying individual product information
 */
const ProductCard = React.memo(({ product }) => {
  if (!product?.id || !product.name || !product.image || typeof product.price !== "number") {
    console.error("Dữ liệu sản phẩm không hợp lệ:", product);
    return null;
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      </Link>
      <h3>{product.name}</h3>
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>
      <Link to={`/products/${product.id}`} className="view-details-button" aria-label={`Xem chi tiết ${product.name}`}>
        Xem chi tiết
      </Link>
    </div>
  );
});

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

ProductCard.displayName = 'ProductCard';

export default ProductCard; 