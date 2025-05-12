import React from 'react';
import ProductList from '../../components/ProductList';

const FishingGear = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <ProductList 
        category="đồ câu"
        title="Đồ Câu"
      />
    </div>
  );
};

export default FishingGear; 