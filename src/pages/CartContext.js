import React, { createContext, useState, useCallback } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const findItem = (id) => cart.find((item) => item.id === id);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existingItem = findItem(product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [findItem]); // Thêm findItem vào dependency array

  const updateQuantity = useCallback((id, change) => {
    setCart((prev) => {
      const item = findItem(id);
      if (!item) return prev;

      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        return prev.filter((item) => item.id !== id);
      }

      return prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    });
  }, [findItem]); // Thêm findItem vào dependency array

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = {
    cart,
    addToCart,
    increaseQuantity: (id) => updateQuantity(id, 1),
    decreaseQuantity: (id) => updateQuantity(id, -1),
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};