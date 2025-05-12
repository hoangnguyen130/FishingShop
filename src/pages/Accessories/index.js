import React from 'react';
import ProductList from '../../components/ProductList';

const Accessories = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <ProductList 
        category="phụ kiện"
        title="Phụ Kiện"
      />
    </div>
  );
};

export default Accessories; 