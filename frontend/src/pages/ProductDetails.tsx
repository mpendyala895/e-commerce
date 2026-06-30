import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStart, fetchSuccess, fetchFailure } from '../features/productsSlice';
import { getProducts } from '../services/productApi';
import { addToCart } from '../features/cartSlice';
import { Product } from '../types';
import Loader from '../components/Loader';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.products);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      if (items.length === 0) {
        dispatch(fetchStart());
        try {
          const data = await getProducts();
          dispatch(fetchSuccess(data));
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Error fetching products';
          dispatch(fetchFailure(errorMsg));
        }
      }
    };
    loadProducts();
  }, [dispatch, items.length]);

  useEffect(() => {
    if (items.length > 0 && id) {
      const found = items.find((item) => item.id === id);
      if (found) {
        setProduct(found);
      } else {
        navigate('/404');
      }
    }
  }, [items, id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
    }
  };

  if (loading || !product) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      <Link
        to="/products"
        className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to products</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-black text-indigo-600">
              ₹{product.price.toFixed(2)}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <button
              onClick={handleAddToCart}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-4 px-6 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>

            <div className="grid grid-cols-3 gap-4 pt-4 text-center text-[11px] text-slate-500 font-medium">
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl">
                <Truck className="w-5 h-5 text-slate-400 mb-1" />
                <span>Free Delivery</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl">
                <RefreshCw className="w-5 h-5 text-slate-400 mb-1" />
                <span>7-Day Return</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-slate-400 mb-1" />
                <span>1-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
