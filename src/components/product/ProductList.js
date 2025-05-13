import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';

/**
 * Product list component displaying a grid of products
 */
const ProductList = ({ isLoading, isSearching, showNoResults, products }) => (
  <div className="product-list">
    {isSearching && !isLoading ? (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang xử lý...</p>
      </div>
    ) : showNoResults ? (
      <div className="no-products-container">
        <p className="no-products-message">Không có sản phẩm nào phù hợp</p>
      </div>
    ) : (
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </div>
);

ProductList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isSearching: PropTypes.bool.isRequired,
  showNoResults: PropTypes.bool.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
};

ProductList.displayName = 'ProductList';

export default ProductList; 