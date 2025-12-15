import { useCallback, useEffect, useState } from "react";
import { loadProducts } from "./productService";
import { PRODUCT_MESSAGES } from "../models/constants";

export const useProductDetail = ({ productId, addToCart, isLoggedIn, navigate }) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setMessage("");
        const products = await loadProducts(controller.signal);
        const foundProduct = products.find((p) => p.id === Number(productId));
        if (!foundProduct) {
          throw new Error(PRODUCT_MESSAGES.ERROR_NOT_FOUND);
        }
        setProduct(foundProduct);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || PRODUCT_MESSAGES.ERROR_FETCH);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [productId]);

  const handleAddToCart = useCallback(
    (event, animationCallback) => {
      if (!isLoggedIn) {
        setMessage(PRODUCT_MESSAGES.LOGIN_REQUIRED);
        setTimeout(() => navigate("/"), 1500);
        return;
      }

      if (!product?.id) {
        console.warn("Invalid product data for cart");
        return;
      }

      addToCart(product);
      setMessage(PRODUCT_MESSAGES.SUCCESS_ADD_TO_CART);

      const handled = typeof animationCallback === "function" ? animationCallback(event, product) : false;
      if (!handled) {
        setTimeout(() => navigate("/cart"), 1000);
      }
    },
    [product, addToCart, isLoggedIn, navigate]
  );

  return { product, isLoading, error, message, handleAddToCart };
};
