import React from 'react';
import PropTypes from 'prop-types';
import { BRANDS } from '../../constants/product';

/**
 * Brand filter component for filtering products by brand
 */
const BrandFilter = React.memo(({ selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {BRANDS.map((brand) => (
      <button
        key={brand}
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`}
        onClick={() => onBrandSelect(brand)}
        aria-pressed={selectedBrand === brand}
      >
        {brand}
      </button>
    ))}
  </div>
));

BrandFilter.propTypes = {
  selectedBrand: PropTypes.string.isRequired,
  onBrandSelect: PropTypes.func.isRequired,
};

BrandFilter.displayName = 'BrandFilter';

export default BrandFilter; 