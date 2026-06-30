import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch } from '../app/hooks';
import { addToCart } from '../features/cartSlice';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-video w-full bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-700 shadow-xs">
          {product.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-indigo-600 line-clamp-1 transition-colors">
          {product.name}
        </h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-extrabold text-slate-900">
            ₹{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
