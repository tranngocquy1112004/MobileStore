import React from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination component for navigating through product pages
 */
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang">
      <div>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
          aria-label="Trang trước"
        >
          Trang trước
        </button>
        <span className="pagination-current">Trang {currentPage}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
          aria-label="Trang sau"
        >
          Trang sau
        </button>
      </div>
    </nav>
  );
});

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

Pagination.displayName = 'Pagination';

export default Pagination; 