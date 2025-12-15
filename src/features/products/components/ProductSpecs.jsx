import React from "react";

const ProductSpecs = ({ product }) => {
  const specItems = [
    product.screen && { label: "Screen", value: product.screen },
    product.chip && { label: "Chip", value: product.chip },
    product.ram && { label: "RAM", value: product.ram },
    product.storage && { label: "Storage", value: product.storage },
    product.camera && { label: "Camera", value: product.camera },
    product.battery && { label: "Battery", value: product.battery },
  ].filter(Boolean);

  return (
    <div className="specs">
      <h3>Specifications</h3>
      <ul>
        {specItems.length > 0 ? (
          specItems.map((item) => (
            <li key={item.label}>
              {item.label}: {item.value}
            </li>
          ))
        ) : (
          <p className="empty-state-small">No specifications available.</p>
        )}
      </ul>
    </div>
  );
};

export default ProductSpecs;
