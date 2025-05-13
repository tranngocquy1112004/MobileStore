import React from 'react';
import PropTypes from 'prop-types';
import BrandFilter from './BrandFilter';

/**
 * Filter section component for product filtering and sorting
 */
const FilterSection = ({ filters, onFilterChange, onBrandSelect, onSort, onResetFilters }) => {
  const hasActiveFilters = filters.brand !== "Tất cả" || filters.search.trim();

  return (
    <div className="filter-section">
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={onFilterChange}
        className="search-input"
        placeholder="Tìm kiếm sản phẩm..."
        aria-label="Tìm kiếm sản phẩm theo tên"
      />
      <BrandFilter selectedBrand={filters.brand} onBrandSelect={onBrandSelect} />
      <button
        className="sort-button"
        onClick={() => onSort("lowToHigh")}
        aria-label="Sắp xếp giá từ thấp tới cao"
      >
        Giá từ thấp tới cao
      </button>
      <button
        className="sort-button"
        onClick={() => onSort("highToLow")}
        aria-label="Sắp xếp giá từ cao tới thấp"
      >
        Giá từ cao tới thấp
      </button>
      {hasActiveFilters && (
        <button onClick={onResetFilters} className="reset-filters-button" aria-label="Xóa tất cả bộ lọc">
          <span className="reset-icon">✕</span> Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

FilterSection.propTypes = {
  filters: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onBrandSelect: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};

FilterSection.displayName = 'FilterSection';

export default FilterSection; 