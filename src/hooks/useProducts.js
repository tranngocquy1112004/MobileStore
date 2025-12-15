import { useEffect, useMemo, useReducer } from "react";
import { useDebounce } from "./useDebounce";
import { loadProducts } from "../services/productService";

const PRODUCTS_PER_PAGE = 6;
const SEARCH_DEBOUNCE = 500;
export const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];
export const SORT_TYPES = {
  LOW_TO_HIGH: "lowToHigh",
  HIGH_TO_LOW: "highToLow",
};

const initialState = {
  allProducts: [],
  filters: { brand: BRANDS[0], search: "" },
  currentPage: 1,
  isLoading: true,
  isSearching: false,
  error: null,
};

const productReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, allProducts: action.payload, error: null };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, allProducts: [], error: action.payload };
    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        currentPage: 1,
        isSearching: true,
      };
    case "SET_SEARCHING":
      return { ...state, isSearching: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SORT_PRODUCTS":
      return {
        ...state,
        allProducts: [...state.allProducts].sort((a, b) =>
          action.payload === SORT_TYPES.LOW_TO_HIGH ? a.price - b.price : b.price - a.price
        ),
        currentPage: 1,
      };
    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters, currentPage: 1, isSearching: true };
    default:
      return state;
  }
};

export const useProducts = () => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const debouncedSearch = useDebounce(state.filters.search, SEARCH_DEBOUNCE);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await loadProducts(controller.signal);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_ERROR",
          payload: err.message || "Lỗi không xác định khi tải dữ liệu",
        });
      }
    };
    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (debouncedSearch === state.filters.search && state.isSearching) {
      dispatch({ type: "SET_SEARCHING", payload: false });
    }
  }, [debouncedSearch, state.filters.search, state.isSearching]);

  const filteredProducts = useMemo(() => {
    return state.allProducts
      .filter((p) => state.filters.brand === BRANDS[0] || p.brand === state.filters.brand)
      .filter((p) => {
        const searchTerm = debouncedSearch.trim().toLowerCase();
        return searchTerm ? p.name.toLowerCase().includes(searchTerm) : true;
      });
  }, [state.allProducts, state.filters.brand, debouncedSearch]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (state.currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, state.currentPage]);

  return {
    ...state,
    filteredProducts,
    paginatedProducts,
    totalPages,
    showNoResults: filteredProducts.length === 0 && !state.isLoading && !state.isSearching,
    dispatch,
  };
};
