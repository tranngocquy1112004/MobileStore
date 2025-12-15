import React from "react";
import ProductCard from "./ProductCard";

const ProductList = React.memo(({ isLoading, isSearching, showNoResults, products }) => (
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
));

ProductList.displayName = "ProductList";

export default ProductList;
