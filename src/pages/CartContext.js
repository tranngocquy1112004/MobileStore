import React, { createContext, useState, useCallback } from "react";

export const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const findItem = useCallback((id) => cart.find((item) => item.id === id), [cart]);

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
  }, [findItem]);

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartContextValue = {
    cart,
    addToCart,
    increaseQuantity: (id) => updateQuantity(id, 1),
    decreaseQuantity: (id) => updateQuantity(id, -1),
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={cartContextValue}>{children}</CartContext.Provider>
  );
};

export default CartProvider;