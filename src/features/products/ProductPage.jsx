import React, { useCallback } from "react";
import "../../styles/ProductPage.css";
import HeroSlider from "./components/HeroSlider";
import FilterSection from "./components/FilterSection";
import ProductList from "./components/ProductList";
import Pagination from "./components/Pagination";
import { useProducts } from "./services/useProducts";

const ProductPage = () => {
  const { isLoading, isSearching, error, filters, paginatedProducts, currentPage, totalPages, showNoResults, dispatch } =
    useProducts();

  const handleFilterChange = useCallback(
    (e) => dispatch({ type: "SET_FILTER", payload: { [e.target.name]: e.target.value } }),
    [dispatch]
  );

  const handleBrandSelect = useCallback((brand) => dispatch({ type: "SET_FILTER", payload: { brand } }), [dispatch]);

  const handleSort = useCallback((sortType) => dispatch({ type: "SORT_PRODUCTS", payload: sortType }), [dispatch]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        dispatch({ type: "SET_PAGE", payload: page });
      }
    },
    [dispatch, totalPages]
  );

  const resetFilters = useCallback(() => dispatch({ type: "RESET_FILTERS" }), [dispatch]);

  if (error) {
    return (
      <div className="loading-container">
        <p className="loading-text">Ồn rồi, lỗi: {error}</p>
      </div>
    );
  }

  return (
    <main className="product-page">
      <HeroSlider />

      <h1 className="page-title">Danh sách sản phẩm</h1>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onBrandSelect={handleBrandSelect}
        onSort={handleSort}
        onResetFilters={resetFilters}
      />

      <ProductList
        isLoading={isLoading}
        isSearching={isSearching}
        showNoResults={showNoResults}
        products={paginatedProducts}
      />

      {paginatedProducts.length > 0 && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </main>
  );
};

export default ProductPage;
