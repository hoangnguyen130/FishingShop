import { Link } from "react-router-dom";

function ProductItem({ data }) {

  return (
    <Link
      to={`/products/${data._id}`}
      className="block p-2 text-gray-900 no-underline hover:bg-gray-100 transition-colors duration-200"
    >
      <div className="flex items-center">
        <img
          src={Array.isArray(data.images) ? data.images[0] : data.images}
          alt={data.productName}
          className="w-12 h-12 object-cover rounded-md mr-3"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/50')}
        />
        <div className="flex-1">
          <p className="text-sm font-medium">{data.productName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.type} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProductItem;