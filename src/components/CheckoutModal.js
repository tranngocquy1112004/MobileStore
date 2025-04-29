// Import necessary React hooks: useState to manage the local state of the form (shipping information, validation errors), and useCallback to memoize event handler functions (handleChange, validateForm, handleSubmit), helping to optimize performance and avoid unnecessary re-renders of child components (if any) or the modal itself.
import React, { useState, useCallback } from "react";
// Import the CSS file for styling this checkout modal component
import "./CheckoutModal.css";

// --- CheckoutModal Component ---
// This component displays a dialog box (modal) allowing the user to review the items in the cart
// and enter shipping information (name, address, phone number) before confirming the final order.
// Receives props from the parent component (usually CartPage):
// - cart: Array containing the list of products currently in the user's cart.
// - totalPrice: The total monetary value of all products in the cart.
// - onConfirm: A callback function that will be called from the parent component when the user clicks the "Confirm Order" button and the form is valid. This function usually receives the entered shipping information object as a parameter.
// - onCancel: A callback function that will be called from the parent component when the user clicks the "Cancel" button or clicks outside the modal to close it.
const CheckoutModal = ({ cart, totalPrice, onConfirm, onCancel }) => {
  // --- Local Constant ---
  // Message string displayed inside the modal if the cart item list is empty.
  // This situation is rare if the "Checkout" button on the Cart page is correctly disabled when the cart is empty,
  // but it's still necessary to handle it to ensure consistent UI.
  const EMPTY_CART_MODAL_MESSAGE = "Không có sản phẩm trong giỏ hàng để thanh toán."; // Clarified message

  // --- State managing shipping information entered by the user in the form ---
  // The 'shippingInfo' state is an object storing data from the input fields in the shipping information form.
  // Initial value is an object with 'name', 'address', 'phone' properties, all as empty strings, reflecting the initial state of the form.
  const [shippingInfo, setShippingInfo] = useState({
    name: "", // Stores the recipient's Full Name
    address: "", // Stores the detailed Shipping Address
    phone: "", // Stores the Contact Phone Number
  });

  // --- State managing validation error messages for each form field ---
  // The 'validationErrors' state is an object where keys are the names of the form fields ('name', 'address', 'phone')
  // and values are the corresponding error message strings if there is an error for that field. If there is no error for a field, the value is an empty string or the property does not exist in the object.
  // This state controls the display of validation error messages next to the input fields.
  const [validationErrors, setValidationErrors] = useState({});

  // --- Function to handle the event when the value of input fields in the form changes ---
  // This function is attached to the 'onChange' event of each input in the form.
  // Uses useCallback to memoize this function. This function is only re-created once
  // because it does not depend on any variables or states from the outer scope that need tracking for the function to work correctly.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target; // Get the 'name' attribute (name of the input: "name", "address", "phone") and 'value' (current value of the input) from the input element that triggered the change event
    // Update the 'shippingInfo' state. Use functional update (prev => ...) to ensure the state is updated based on the previous state value.
    // Create a copy of the current 'shippingInfo' object (...prev) and update the value for the property named [name] to the new entered 'value'.
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    // Clear the error message for the current input field immediately when the user starts typing (the value of that field changes), so the error message disappears instantly and is not distracting.
    setValidationErrors((prev) => ({ ...prev, [name]: "" })); // Set the error message for the field [name] to an empty string.
  }, []); // Empty dependency array []: This function does not depend on any variables from the outer scope that need tracking for the function to work.

  // --- Function to validate the entire form before submitting ---
  // This function performs validation on the data entered by the user in the form.
  // Uses useCallback to memoize the function. This function will be re-created when the 'shippingInfo' state changes
  // because the validation logic is based on the current data in 'shippingInfo'.
  const validateForm = useCallback(() => {
    const errors = {}; // Create an empty object to collect all found validation errors. Keys will be field names, values will be error messages.
    const { name, address, phone } = shippingInfo; // Get the current values of the fields from the 'shippingInfo' state to validate.

    // --- Check required fields that must not be empty (after trimming leading/trailing whitespace) ---
    if (!name.trim()) {
      errors.name = "Vui lòng nhập họ và tên"; // Add an error message to the 'errors' object if the 'name' field is empty after trim().
    }
    if (!address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng"; // Add an error message if the 'address' field is empty after trim().
    }
    // Validate the phone number field:
    // 1. Check if it's empty
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại"; // Add an error message if the 'phone' field is empty after trim().
    } else if (!/^(0|\+84)?[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      // 2. If not empty, check the phone number format.
      // Use a Regular Expression (Regex) to validate the format of Vietnamese mobile phone numbers.
      // This Regex accepts numbers starting with '0' or '+84' (optional), followed by a digit from 3, 5, 7, 8, 9, and ending with 8 any digits.
      // .test(phone) will return true if the 'phone' string matches the regex, otherwise false.
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx"; // Add an error message and format suggestion if it doesn't match the regex.
    }

    // Update the 'validationErrors' state with the 'errors' object just created (containing all found errors).
    // Updating this state will cause the component to re-render and display the corresponding error messages on the UI.
    setValidationErrors(errors);
    // Return true if the 'errors' object has no properties (meaning no errors), otherwise return false.
    // Use Object.keys(errors).length to check the number of properties in the errors object.
    return Object.keys(errors).length === 0;
  }, [shippingInfo]); // Dependency array: The function depends on the 'shippingInfo' state. When shippingInfo changes, the validateForm function will be re-created to use the latest value.

  // --- Function to handle the form submission event ---
  // This function is attached to the 'onSubmit' event of the <form> tag.
  // Uses useCallback to memoize the function. This function will be re-created when the 'validateForm' function
  // or the 'onConfirm' function (passed from props) change.
  const handleSubmit = useCallback((e) => {
    e.preventDefault(); // Prevent the browser's default form submission behavior (prevents page reload).
    // Call the 'validateForm' function to check the validity of the data in the form before processing.
    if (validateForm()) {
      // If the 'validateForm' function returns true (meaning the entire form is valid):
      // Call the 'onConfirm' function passed from the parent component, passing along the 'shippingInfo' object
      // (containing the data entered by the user and successfully validated).
      // shippingInfo is accessed via closure from the scope of the CheckoutModal component.
      onConfirm(shippingInfo);
    }
    // If the form is not valid (validateForm() returns false), the validateForm() function has already automatically updated the validationErrors state
    // and the corresponding error messages will be displayed next to the input fields on the UI. The handleSubmit function will stop here.
  }, [validateForm, onConfirm, shippingInfo]); // Dependency array: The function depends on the 'validateForm' function (to call validation), the 'onConfirm' function (to call callback on success), and the 'shippingInfo' state (to pass form data).

  return (
    // --- Modal Overlay ---
    // This div layer creates a semi-transparent overlay covering the entire screen, highlighting the modal and preventing interaction with the content below.
    // Clicking on this overlay (outside the modal content) will trigger the 'onCancel' function from props to close the modal.
    <div className="modal-overlay" onClick={onCancel}>
      {/* --- Main Modal Content --- */}
      {/* This is the container holding the actual content of the modal (order summary, form, buttons). */}
      {/* onClick={(e) => e.stopPropagation()}: Attach this event to the modal content.
            The stopPropagation() method on the event object (e) prevents the click event inside this modal
            from bubbling up (propagating) to parent elements, specifically the 'modal-overlay' layer.
            This ensures that clicking anywhere inside the modal does not reach the overlay
            and trigger the onCancel function to close the modal. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🛒 Xác nhận thanh toán</h2>{" "}
        {/* Title of the modal */}
        {/* --- Order Summary Section --- */}
        {/* Container displaying the list of items in the cart and the total price within the modal. */}
        <div className="order-summary">
          <h3>📋 Thông tin đơn hàng</h3>{" "}
          {/* Title for the order summary section */}
          {/* Conditional Rendering: Check if the 'cart' array has products (cart.length > 0) to display order details */}
          {cart && cart.length > 0 ? ( // Check if cart exists and has elements
            <>
              {" "}
              {/* Use a Fragment to group child elements (ul, p) without creating unnecessary extra parent HTML tags in the DOM */}
              {/* Unordered list displaying each product in the cart */}
              <ul className="cart-items-list">
                {cart.map((item) => (
                  // Map over each 'item' in the 'cart' array to create a list item for each product
                  <li key={item.id} className="cart-item">
                    {" "}
                    {/* Each item in the cart is a list item. key={item.id} is important for React performance when rendering lists */}
                    <span className="item-name">{item.name}</span>{" "}
                    {/* Product name */}
                    <span className="item-quantity">x {item.quantity}</span>{" "}
                    {/* Product quantity */}
                    <span className="item-price">
                      {/* Calculate and display the total price of that item (price * quantity), formatted according to Vietnamese currency */}
                      {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </li>
                ))}
              </ul>
              {/* Display the total price of the entire order */}
              <p className="total-price">
                <strong>Tổng tiền:</strong> {totalPrice.toLocaleString("vi-VN")}{" "}
                {/* Display "Total Price" bold and the total price formatted according to Vietnamese currency */}
                VNĐ{" "}
                {/* Currency unit */}
              </p>
            </>
          ) : (
            // Conditional Rendering: If the cart is empty (cart.length === 0 or cart is null/undefined), display a message
            <p className="empty-cart-message">{EMPTY_CART_MODAL_MESSAGE}</p>
          )}
        </div>
        {/* --- Shipping Information Form --- */}
        {/* Form tag for the user to fill in shipping details. When the form is submitted (e.g., by clicking a button type="submit"), the handleSubmit function (memoized) will be called. */}
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>🚚 Thông tin giao hàng</h3>{" "}
          {/* Title for the shipping information form section */}
          {/* Input group for Full Name */}
          <div className="form-group">
            {" "}
            {/* Container for label, input, and error message */}
            <label htmlFor="name">Họ và tên:</label>{" "}
            {/* Label tag linked to the input with id="name". htmlFor="name" improves accessibility (clicking the label focuses the corresponding input) */}
            <input
              type="text" // Input type is text for name
              id="name" // ID of the input (must match the htmlFor of the label)
              name="name" // Name of the input, used in the handleChange function to identify which field is changing and update the 'shippingInfo' state
              placeholder="Nhập họ và tên người nhận" // Placeholder displaying input instructions when the input is empty
              value={shippingInfo.name} // Bind the current value from shippingInfo.name state to the input (This is a Controlled Component in React)
              onChange={handleChange} // Attach the change event handler function (memoized)
              className={validationErrors.name ? "error" : ""} // Add the 'error' class to the input if there is a validation error message for the 'name' field in the validationErrors.name state.
              aria-label="Nhập họ và tên người nhận" // Accessibility attribute for users using screen readers
              required // HTML5 attribute requiring this field not to be empty on form submission. Browsers might also display default validation messages.
            />
            {/* Conditional Rendering: Display the error message if there is a validation error for the 'name' field (validationErrors.name has a value) */}
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span> // Display the error content from validationErrors.name
            )}
          </div>
          {/* Input group for Address */}
          <div className="form-group">
            <label htmlFor="address">Địa chỉ:</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Nhập địa chỉ giao hàng chi tiết"
              value={shippingInfo.address}
              onChange={handleChange}
              className={validationErrors.address ? "error" : ""}
              aria-label="Nhập địa chỉ giao hàng"
              required
            />
            {validationErrors.address && (
              <span className="error-message">{validationErrors.address}</span>
            )}
          </div>
          {/* Input group for Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel" // 'tel' input type suggests a numeric keyboard on mobile devices and may have built-in browser validation (though Regex validation is more detailed)
              id="phone"
              name="phone"
              placeholder="Nhập số điện thoại liên hệ"
              value={shippingInfo.phone}
              onChange={handleChange}
              className={validationErrors.phone ? "error" : ""}
              aria-label="Nhập số điện thoại liên hệ"
              required
            />
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>
          {/* --- Group of action buttons in the modal --- */}
          {/* Container holding Confirm and Cancel buttons */}
          <div className="modal-buttons">
            {/* Confirm Order button */}
            <button
              type="submit" // Button type is "submit", clicking it will trigger the form's submit event (and call the handleSubmit function attached to the form)
              className="confirm-button" // CSS class for styling the confirm button
              // disabled={cart.length === 0} // Could add disabled if cart is empty, although logic on CartPage already disables the button that opens the modal
              aria-label="Xác nhận đặt hàng" // Accessibility attribute
            >
              ✅ Xác nhận đặt hàng{" "}
              {/* Content displayed on the button */}
            </button>
            {/* Cancel button */}
            <button
              type="button" // Important: Button type is "button" to prevent this button from automatically triggering the form submit event when clicked. Without type="button", the browser treats it as the default submit button.
              className="cancel-button" // CSS class for styling the cancel button
              onClick={onCancel} // Attach the 'onCancel' function from props to close the modal when clicked.
              aria-label="Hủy đặt hàng" // Accessibility attribute
            >
              ❌ Hủy{" "}
              {/* Content displayed on the button */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal; // Export the CheckoutModal component as the default export so it can be used in other files (e.g., CartPage needs to display this modal when the user checks out)