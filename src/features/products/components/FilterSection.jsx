import React from "react";
import BrandFilter from "./BrandFilter";
import { BRANDS, SORT_TYPES } from "../models/constants";

const FilterSection = React.memo(({ filters, onFilterChange, onBrandSelect, onSort, onResetFilters }) => {
  const hasActiveFilters = filters.brand !== BRANDS[0] || filters.search.trim();

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
        onClick={() => onSort(SORT_TYPES.LOW_TO_HIGH)}
        aria-label="Sắp xếp giá từ thấp tới cao"
      >
        Giá từ thấp tới cao
      </button>
      <button
        className="sort-button"
        onClick={() => onSort(SORT_TYPES.HIGH_TO_LOW)}
        aria-label="Sắp xếp giá từ cao tới thấp"
      >
        Giá từ cao tới thấp
      </button>
      {hasActiveFilters && (
        <button onClick={onResetFilters} className="reset-filters-button" aria-label="Xóa tất cả bộ lọc">
          <span className="reset-icon">🗑</span> Xóa bộ lọc
        </button>
      )}
    </div>
  );
});

FilterSection.displayName = "FilterSection";

export default FilterSection;
