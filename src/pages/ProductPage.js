import React, { useEffect, useState, useCallback } from "react"; // Import necessary React hooks: useEffect for side effects, useState for local state management, and useCallback for memoizing event handler functions to optimize performance.
import { Link } from "react-router-dom"; // Import the Link component from react-router-dom to create navigation links in a Single Page Application (SPA) without full page reloads.
import Slider from "react-slick"; // Import the popular react-slick slider library to create a carousel-style promotional banner.
import "slick-carousel/slick/slick.css"; // Import the default CSS file for react-slick (required).
import "slick-carousel/slick/slick-theme.css"; // Import the default theme CSS file for react-slick (can be replaced with custom CSS).
import "./ProductPage.css"; // Import a custom CSS file to style this ProductPage component.

// --- Constants ---

// URL or path to the product data source.
// Using `${process.env.PUBLIC_URL}/db.json` references the db.json file in the 'public' directory.
// This ensures the path works correctly in both development and production environments after deployment.
const API_URL = `${process.env.PUBLIC_URL}/db.json`;
// The maximum number of products to display per page during pagination.
const PRODUCTS_PER_PAGE = 6;
// Array containing the list of available brand names for user filtering.
// "Tất cả" (All) is a special option to display all products.
const BRANDS = ["Tất cả", "Xiaomi", "Apple", "Samsung"];

// Array containing data (text, images, links) for the slides (banners) displayed at the top of the page using the Slider.
const SLIDES = [
  {
    image:
      "https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg", // Image path for slide 1
    title: "iPhone 16 Pro Max", // Main title for slide 1
    subtitle: "Thiết kế Titan tuyệt đẹp.", // Subtitle/short description for slide 1
    features: [
      "Trả góp lên đến 3 TRIỆU", // List of key features or offers as bullet points
      "Khách hàng mới GIẢM 300K",
      "Góp 12 Tháng từ 76K/Ngày",
    ],
    link: "/products/4", // Navigation path when the user clicks the slide or the "Buy Now" button.
    buttonText: "Mua ngay", // Text displayed on the action button.
  },
  {
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_1__3.png",
    title: "Samsung Galaxy S25 Ultra",
    subtitle: "Công nghệ AI tiên tiến.",
    features: [
      "Giảm ngay 2 TRIỆU",
      "Tặng kèm sạc nhanh 45W",
      "Bảo hành chính hãng 2 năm",
    ],
    link: "/products/1",
    buttonText: "Mua ngay",
  },
  {
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15-ultra_12_.png",
    title: "Xiaomi 15 Ultra",
    subtitle: "Camera 200MP Leica đỉnh cao.",
    features: [
      "Trả góp 0% lãi suất",
      "Giảm 500K khi thanh toán online",
      "Tặng tai nghe Xiaomi Buds 4",
    ],
    link: "/products/3",
    buttonText: "Mua ngay",
  },
];

// --- API Call Function to Fetch Product Data ---
// An async function to perform the data fetch request from API_URL.
// Accepts 'signal' from AbortController to allow cancelling the fetch request if the component unmounts before it completes.
const fetchProducts = async (signal) => {
  const response = await fetch(API_URL, { signal }); // Execute the fetch request to API_URL with the signal.
  // Check the 'ok' property of the response to determine if the request was successful (status code 200-299).
  if (!response.ok) {
    // If the response is not OK, throw a new Error object with an error message.
    throw new Error("Không thể tải sản phẩm!"); // Use a fixed error message string.
  }
  const data = await response.json(); // Parse the response body from JSON into a JavaScript object/array.
  // Return the array of products. Check the structure of the received data:
  // If 'data' itself is an array (Array.isArray(data) is true), return 'data'.
  // If 'data' is an object AND has a 'products' property which is an array, return 'data.products'.
  // If neither of the above cases match, return an empty array [].
  return Array.isArray(data) ? data : data.products || [];
};

// --- Child Component: ProductCard (Displays detailed information for a single product as a card) ---
// Uses React.memo() to optimize rendering performance. The component only re-renders when its props change.
const ProductCard = React.memo(({ product }) => {
  // Perform basic validation to ensure product data is valid before attempting to render.
  if (
    !product?.id || // ID must exist and not be null/undefined
    !product.name || // Product name must exist
    !product.image || // Image path must exist
    typeof product.price !== "number" // Price must be a number
  ) {
    console.error("Invalid product data:", product); // Log an error to the console if data is invalid.
    return null; // Return null to render nothing for invalid product data.
  }

  return (
    <div className="product-card">
      {" "}
      {/* Main container for a single product card */}
      {/* Link component wrapping the product image. Clicking the image navigates to the product details page. */}
      {/* 'to={`/products/${product.id}`}' creates a dynamic path based on the product's ID. */}
      <Link to={`/products/${product.id}`} aria-label={`Xem chi tiết ${product.name}`}>
        {" "}
        {/* 'aria-label' provides a description for screen reader users */}
        {/* Product image */}
        <img
          src={product.image} // Image path
          alt={product.name} // Alt text for the image, using the product name
          className="product-image" // CSS class for image styling
          loading="lazy" // HTML5 attribute requesting the browser to load the image lazily (load when near the viewport), improving initial performance.
        />
      </Link>
      <h3>{product.name}</h3> {/* Heading (h3 tag) displaying the product name */}
      {/* Paragraph displaying the product price, formatted according to Vietnamese currency. */}
      <p className="price">💰 {product.price.toLocaleString("vi-VN")} VNĐ</p>{" "}
      {/* toLocaleString("vi-VN") formats the number as a Vietnamese currency string */}
      {/* "View Details" button (Link component) navigating to the product details page */}
      <Link
        to={`/products/${product.id}`} // Path to the product details page
        className="view-details-button" // CSS class for button styling
        aria-label={`Xem chi tiết ${product.name}`} // Accessibility attribute
      >
        Xem chi tiết{" "}
        {/* Button text */}
      </Link>
    </div>
  );
});

// --- Child Component: Pagination (Displays pagination navigation buttons) ---
// Uses React.memo() to optimize rendering performance. The component only re-renders when its props change.
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // If the total number of pages is less than or equal to 1, do not display the pagination component.
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {" "}
      {/* Container for the pagination component */}
      {/* "Previous Page" button. Disabled if currently on the first page (currentPage is 1). */}
      <button
        onClick={() => onPageChange(currentPage - 1)} // Attach click event handler. Call the 'onPageChange' function (passed via props) with the new page number (current page minus 1).
        disabled={currentPage === 1} // 'disabled' attribute based on the condition.
        className="pagination-button" // CSS class
      >
        Trang trước{" "}
        {/* Button text */}
      </button>
      {/* Display current page information. */}
      <span className="pagination-current">Trang {currentPage}</span>{" "}
      {/* Display the current page number */}
      {/* "Next Page" button. Disabled if currently on the last page (currentPage equals totalPages). */}
      <button
        onClick={() => onPageChange(currentPage + 1)} // Attach click event handler. Call the 'onPageChange' function with the new page number (current page plus 1).
        disabled={currentPage === totalPages} // 'disabled' attribute based on the condition.
        className="pagination-button" // CSS class
      >
        Trang sau{" "}
        {/* Button text */}
      </button>
    </div>
  );
});

// --- Child Component: BrandFilter (Displays brand filtering buttons) ---
// Uses React.memo() to optimize rendering performance. The component only re-renders when its props change.
const BrandFilter = React.memo(({ brands, selectedBrand, onBrandSelect }) => (
  <div className="brand-buttons">
    {" "}
    {/* Container for the group of brand filter buttons */}
    {/* Map over the 'brands' array to create a button for each brand */}
    {brands.map((brand) => (
      <button
        key={brand} // Unique key for each button in the list (brand name is unique)
        className={`brand-button ${selectedBrand === brand ? "active" : ""}`} // Add the 'active' CSS class to the button if its brand name matches the current 'selectedBrand' state.
        onClick={() => onBrandSelect(brand)} // Attach click event handler. Call the 'onBrandSelect' function (passed via props) with the brand name of that button.
      >
        {brand}{" "}
        {/* Text displayed on the button (brand name) */}
      </button>
    ))}
  </div>
));

// --- Child Component: Slide (Displays the content of a single slide in the carousel) ---
// Uses React.memo() to optimize rendering performance. The component only re-renders when its props change.
const Slide = React.memo(({ slide }) => (
  <div className="slide">
    {" "}
    {/* Main container for a single slide */}
    <div className="slide-content">
      {" "}
      {/* Container for the content inside the slide. Uses flexbox for aligning image and text. */}
      <div className="slide-text">
        {" "}
        {/* Left section containing text (title, subtitle, features) */}
        <h2>{slide.title}</h2> {/* Main title of the slide */}
        <h3>{slide.subtitle}</h3> {/* Subtitle of the slide */}
        <ul>
          {" "}
          {/* List of features or offers */}
          {/* Map over the 'features' array of the slide to create list items */}
          {slide.features.map((feature, i) => (
            <li key={i}>{feature}</li> // Display each feature. Use index as key (safe if the features array order doesn't change).
          ))}
        </ul>
      </div>
      <div className="slide-image">
        {" "}
        {/* Right section containing the slide image */}
        <img src={slide.image} alt={slide.title} loading="lazy" />{" "}
        {/* Slide image, using title as alt text, lazy loading */}
      </div>
      {/* Action button (e.g., "Buy Now"), using the Link component to navigate to the product details page or another page. */}
      <Link to={slide.link} className="slide-button">
        {" "}
        {/* 'to={slide.link}' is the destination path */}
        {slide.buttonText}{" "}
        {/* Text displayed on the button */}
      </Link>
    </div>
  </div>
));

// --- Main Component: ProductPage (Page displaying the list of products) ---
// This is the functional component that renders the entire product list page content.
const ProductPage = () => {
  // --- State management for data and component status ---
  // 'products' state: Stores the ENTIRE original list of products fetched from the API. This array does not change when filters/search/sort are applied. Initially an empty array [].
  const [products, setProducts] = useState([]);
  // 'filteredProducts' state: Stores the list of products AFTER applying filters (brand, search) and sorting. This is the array used for display. Initially an empty array [].
  const [filteredProducts, setFilteredProducts] = useState([]);
  // 'isLoading' state: Boolean tracking the initial data loading status from the API. Initially true.
  const [isLoading, setIsLoading] = useState(true);
  // 'error' state: Stores the error message (string) if data fetching encounters an issue. Initially null.
  const [error, setError] = useState(null);
  // 'currentPage' state: Stores the current page number being displayed in pagination. Initially 1.
  const [currentPage, setCurrentPage] = useState(1);
  // 'filters' state: Object storing the current state of filters. Includes 'brand' (selected brand) and 'search' (search keyword).
  const [filters, setFilters] = useState({ brand: "Tất cả", search: "" });
  // 'isSearching' state: Boolean tracking if filtering/searching is currently being applied and processed (to show a spinner or effect). Initially false.
  const [isSearching, setIsSearching] = useState(false);
  // 'showNoResults' state: Boolean tracking whether to display the "No matching products found" message. Initially false.
  const [showNoResults, setShowNoResults] = useState(false);

  // --- Settings for the Slider carousel (react-slick component) ---
  // Object containing configuration options for the Slider.
  const sliderSettings = {
    dots: true, // Display slide indicators (dots) below the carousel
    infinite: true, // Allow infinite looping of slides after reaching the last one
    speed: 500, // Transition speed between slides (milliseconds)
    slidesToShow: 1, // Number of slides to show simultaneously in the viewport
    slidesToScroll: 1, // Number of slides to scroll per transition (automatic or by button)
    autoplay: true, // Automatically advance slides after a certain interval
    autoplaySpeed: 3000, // Delay before automatically advancing to the next slide (milliseconds)
    arrows: true, // Display previous/next navigation arrows
  };

  // --- Effect hook to fetch product data from the API when the component mounts ---
  // This effect is where the initial product data fetching occurs.
  useEffect(() => {
    // Create an instance of AbortController. Used to cancel the fetch request if the component is unmounted before the fetch completes.
    const controller = new AbortController();
    const signal = controller.signal; // Get the signal from the controller to pass into the fetch() options.

    // Define an async function to perform the data loading process and update state.
    const load = async () => {
      try {
        setIsLoading(true); // Start the loading process, set 'isLoading' state to true.
        setError(null); // Clear any previous error message.

        // Call the fetchProducts function to get data from the API, passing the signal for cancellation.
        const productList = await fetchProducts(signal);
        setProducts(productList); // Update the 'products' state (original list) with the fetched data.
        setFilteredProducts(productList); // Initially, the filtered product list is the same as the original list.
        // No need to set showNoResults here immediately. Logic in the filtering effect (second useEffect) will handle this later.
      } catch (err) {
        // Catch any errors that occur during the fetch process.
        // Check if the error is NOT an AbortError (an error caused by cleanup cancelling the request).
        if (err.name !== "AbortError") {
          console.error("Error fetching products:", err); // Log the real error to the console.
          setError(err.message); // Update the 'error' state with the error message to display on the UI.
          setProducts([]); // Set the 'products' state to an empty array on fetch error.
          setFilteredProducts([]); // Ensure 'filteredProducts' is also empty on error.
          setShowNoResults(true); // Display the "No results" message if fetch fails or returns an empty list.
        }
        // If it's an AbortError, ignore it as it's handled by cleanup.
      } finally {
        // The finally block always runs after try/catch (unless a severe, unrecoverable error occurs).
        setIsLoading(false); // End the loading process, set 'isLoading' state to false.
      }
    };

    load(); // Call the load() function to start the data loading process when the component mounts.

    // Cleanup function for this effect. Runs when the component unmounts or when dependencies change and the effect is about to re-run.
    return () => controller.abort(); // Cancel the pending API fetch request if it hasn't completed yet. Helps prevent memory leaks and issues related to updating state on an unmounted component.
  }, []); // Empty dependency array []: Ensures this effect runs only ONCE after the initial render (similar to componentDidMount lifecycle method).

  // --- Effect hook to apply filters (search and brand) and sorting ---
  // This effect runs whenever the 'filters' state or the 'products' state changes.
  useEffect(() => {
    let filtered = [...products]; // Create a copy of the original product list ('products') to work with, avoiding direct modification of the original state.

    // 1. Filter by brand: If the current brand filter is NOT "Tất cả" (All)
    if (filters.brand !== "Tất cả") {
      filtered = filtered.filter((p) => p.brand === filters.brand); // Filter and keep only products whose 'brand' property matches 'filters.brand'.
    }

    // 2. Filter by search keyword: If there is a search keyword (check after trimming whitespace is not empty)
    if (filters.search.trim()) {
      // Filter and keep only products whose 'name' property (after converting to lowercase)
      // includes the search keyword string (after trimming whitespace and converting to lowercase).
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // --- Debouncing Logic and UI Update ---
    setIsSearching(true); // Set 'isSearching' state to true to indicate that filtering/searching is in progress (can show a spinner or effect).
    setShowNoResults(false); // Hide the "No results" message while a new search is being processed.

    // Use setTimeout to create a "debounce" effect. The logic to update the 'filteredProducts' and 'isSearching' states
    // will only be executed after the user stops typing or changing filters for a certain period (500ms).
    // This helps reduce unnecessary UI updates when the user types rapidly into the search box.
    const timeout = setTimeout(() => {
      setFilteredProducts(filtered); // Update the 'filteredProducts' state with the final filtered list of products.
      setIsSearching(false); // End the searching state.
      // After the filtering/searching process is complete, check if the result list ('filtered') is empty.
      // If empty, set the 'showNoResults' state to true to display the "No matching products found" message.
      setShowNoResults(filtered.length === 0);
      setCurrentPage(1); // Always reset to page 1 whenever a new filter is applied or the original product list changes.
    }, 500); // The delay is 500 milliseconds.

    // Cleanup function for this effect: Runs when the 'filters' or 'products' state changes (before the new effect runs)
    // or when the component unmounts.
    // Clear the scheduled timeout to prevent the callback function inside setTimeout from running
    // if another change occurs before the old timeout finishes.
    return () => clearTimeout(timeout);
  }, [filters, products]); // Dependency array: The effect re-runs whenever the 'filters' state or 'products' state changes.

  // --- Function to handle page changes (in pagination) ---
  // Accepts the new page number to navigate to ('page').
  // Uses useCallback to memoize this function. The function will be re-created when the 'filteredProducts' state changes.
  // This is necessary because the logic for clamping the valid page number depends on the total number of pages, which in turn depends on 'filteredProducts'.
  const handlePageChange = useCallback(
    (page) => {
      // Calculate the new page number, ensuring it stays within the valid range from 1 to the total number of pages ('totalPages').
      // Math.max(1, page) ensures the page number is not less than 1.
      // Math.min(..., totalPages) ensures the page number is not greater than the total number of pages.
      const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Recalculate the total number of pages (depends on filteredProducts)
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage); // Update the 'currentPage' state with the new, valid page number.
    },
    [filteredProducts] // Dependency array: The function depends on the 'filteredProducts' state (to calculate total pages).
  );

  // --- Function to handle changes in the search input or other inputs in the filter-section ---
  // Accepts the change event ('e').
  const handleFilterChange = (e) => {
    const { name, value } = e.target; // Get the 'name' and 'value' properties of the changed input.
    // Update the 'filters' state. Use a functional update to ensure the update is based on the previous value ('prev').
    // Create a copy of the current 'filters' state (...prev) and overwrite the property with the name [name] with the new value 'value'.
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Note: Updating the 'filters' state will trigger the second effect hook (useEffect([filters, products])) to re-run the filtering.
  };

  // --- Function to handle user selecting a brand from the button filter ---
  // Accepts the selected brand name ('brand').
  const handleBrandSelect = (brand) => {
    // Update the 'filters' state. Only update the 'brand' property to the new selected brand name.
    setFilters((prev) => ({ ...prev, brand }));
    // Updating the 'filters' state will also trigger the second effect hook to re-run the filtering.
  };

  // --- Function to handle sorting products by price from low to high ---
  const sortLowToHigh = () => {
    // Create a copy of the current 'filteredProducts' array ([...filteredProducts]).
    // Use the .sort() method to sort this copy.
    // The comparison function (a, b) => a.price - b.price will sort in ascending order by price (a comes before b if a's price is less than b's price).
    setFilteredProducts([...filteredProducts].sort((a, b) => a.price - b.price)); // Update the 'filteredProducts' state with the sorted array.
    setCurrentPage(1); // Reset to page 1 after sorting.
  };

  // --- Function to handle sorting products by price from high to low ---
  const sortHighToLow = () => {
    // Create a copy of the current 'filteredProducts' array ([...filteredProducts]).
    // Use the .sort() method to sort this copy.
    // The comparison function (a, b) => b.price - a.price will sort in descending order by price (b comes before a if b's price is greater than a's price).
    setFilteredProducts([...filteredProducts].sort((a, b) => b.price - a.price)); // Update the 'filteredProducts' state with the sorted array.
    setCurrentPage(1); // Reset to page 1 after sorting.
  };

  // --- Function to handle resetting all filters (brand and search) ---
  const resetFilters = () => {
    // Reset the 'filters' state to its initial default values ("Tất cả" brand, empty search).
    setFilters({ brand: "Tất cả", search: "" });
    setFilteredProducts(products); // Reset the displayed product list back to the entire original list ('products').
    setCurrentPage(1); // Reset to page 1.
  };

  // --- Calculate derived values from state ---
  // These values are calculated each time the related state changes and the component re-renders.

  // Calculate the total number of pages needed for pagination based on the number of filtered products and products per page.
  // Math.ceil() ensures rounding up to have enough pages for any remaining products.
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  // Calculate the starting index of the slice from the 'filteredProducts' array to get products for the current page.
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  // Calculate the ending index (exclusive) of the slice from the 'filteredProducts' array.
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  // Get the sub-array containing only the products to be displayed on the current page using the .slice() method.
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // --- Render UI based on loading and error states ---

  // If the 'isLoading' state is true (initial data is being loaded), display a loading spinner UI.
  if (isLoading) {
    return (
      <div className="loading-container">
        {" "}
        {/* Container for the loading UI */}
        <div className="loading-spinner"></div>{" "}
        {/* Spinning spinner icon */}
        <p className="loading-text">Đang tải...</p>{" "}
        {/* "Loading..." message */}
      </div>
    );
  }

  // If the 'error' state has a value (is not null), display the error message.
  if (error) {
    return (
      <div className="status error">
        {" "}
        {/* Container for the error message */}
        <p>❌ {error}</p>{" "}
        {/* Display the error message content */}
        {/* "Retry" button, clicking which reloads the entire browser page to attempt fetching data again. */}
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại{" "}
          {/* Button text */}
        </button>
      </div>
    );
  }

  // --- Render the main UI of the product page when data is loaded and no errors occurred ---
  // This is the UI section displayed after the initial data loading process is successfully completed.
  return (
    <main className="product-page">
      {" "}
      {/* <main> tag wraps the main content of the page */}
      {/* Section displaying the Carousel (promotional banner) at the top */}
      <div className="carousel-section">
        {/* Use the Slider component from react-slick. The {...sliderSettings} prop applies all the previously defined settings. */}
        <Slider {...sliderSettings}>
          {/* Map over the SLIDES array (containing data for the banners) */}
          {SLIDES.map((slide, i) => (
            <Slide key={i} slide={slide} /> // Render the child Slide component for each banner. Use index as key (safe as SLIDES array is fixed).
          ))}
        </Slider>
      </div>

      {/* Main title of the product list page */}
      <h1 className="page-title">Danh sách sản phẩm</h1>{" "}
      {/* Page title */}

      {/* Section containing product filters and sorting controls */}
      <div className="filter-section">
        {" "}
        {/* Container for filter and sort controls */}
        {/* Input for searching products by name */}
        <input
          type="text" // Input type is text
          name="search" // Input name, used to update the 'filters' state
          className="search-input" // CSS class
          placeholder="Tìm kiếm sản phẩm..." // Placeholder text
          value={filters.search} // Bind value from 'filters.search' state (Controlled Component)
          onChange={handleFilterChange} // Attach input change event handler function.
          aria-label="Tìm kiếm sản phẩm theo tên" // Accessibility attribute
        />
        {/* BrandFilter component to display brand filtering buttons */}
        <BrandFilter
          brands={BRANDS} // Pass the list of available brands (from constants)
          selectedBrand={filters.brand} // Pass the currently selected brand from the 'filters' state
          onBrandSelect={handleBrandSelect} // Pass the handler function for when a user selects a brand from the filter
        />
        {/* Button to sort the product list by price from low to high */}
        <button className="sort-button" onClick={sortLowToHigh}>
          Giá từ thấp tới cao{" "}
          {/* Button text */}
        </button>
        {/* Button to sort the product list by price from high to low */}
        <button className="sort-button" onClick={sortHighToLow}>
          Giá từ cao tới thấp{" "}
          {/* Button text */}
        </button>
      </div>

      {/* Area displaying the product list or other status messages */}
      <div className="product-list">
        {" "}
        {/* Main container for displaying the product list or messages */}
        {/* Conditional Rendering: Display spinner if searching, "No results" message if no matches found, or the product grid. */}
        {isSearching ? ( // If 'isSearching' state is true
          <div className="loading-container">
            {" "}
            {/* Container for loading spinner */}
            <div className="loading-spinner"></div>{" "}
            {/* Spinning spinner icon */}
            <p className="loading-text">Đang tải...</p>{" "}
            {/* "Loading..." message */}
          </div>
        ) : showNoResults ? ( // If NOT searching AND 'showNoResults' state is true (meaning no products match the filters)
          <div className="no-products-container">
            {" "}
            {/* Container for no results message */}
            <p className="no-products-message">Không có sản phẩm nào phù hợp</p>{" "}
            {/* "No matching products found" message */}
            {/* "Clear Filters" button, clicking which calls the resetFilters function to reset all filters. */}
            <button onClick={resetFilters} className="reset-filters-button">
              <span className="reset-icon">✕</span> Xóa bộ lọc{" "}
              {/* Button text */}
            </button>
          </div>
        ) : (
          // If NOT searching AND 'showNoResults' state is false (meaning there are products after filtering)
          <div className="product-grid">
            {" "}
            {/* Grid container to display product cards */}
            {/* Map over the 'currentProducts' array (products only on the current page)
                            to render a ProductCard component for each product. */}
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} /> // Render the child ProductCard component, passing product ID as key and the product object as prop.
            ))}
          </div>
        )}
      </div>

      {/* Display the Pagination component only when the total number of pages is greater than 1 */}
      {totalPages > 1 && ( // Check if the total number of pages (totalPages) is greater than 1
        <Pagination
          currentPage={currentPage} // Pass the 'currentPage' state as a prop to Pagination
          totalPages={totalPages} // Pass the calculated 'totalPages' variable as a prop
          onPageChange={handlePageChange} // Pass the memoized page change handler function ('handlePageChange') as a prop
        />
      )}
    </main>
  );
};

export default ProductPage; // Export the ProductPage component as the default export so it can be used in other files (usually in routing configuration)