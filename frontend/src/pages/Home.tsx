import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStart, fetchSuccess, fetchFailure } from '../features/productsSlice';
import { getProducts } from '../services/productApi';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      dispatch(fetchStart());
      try {
        const data = await getProducts();
        dispatch(fetchSuccess(data));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching products';
        dispatch(fetchFailure(errorMsg));
      }
    };
    fetchHomeProducts();
  }, [dispatch]);

  const featuredProducts = items.slice(0, 4);

  return (
    <div className="space-y-16">
      <section className="relative bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-3xl overflow-hidden px-8 py-16 sm:px-16 sm:py-24 text-white shadow-xl">
        <div className="relative z-10 max-w-xl space-y-6">
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider">
            Summer Collection 2026
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
            Discover Quality Products at E-Shop
          </h1>
          <p className="text-indigo-100 text-base leading-relaxed">
            Experience premium shopping with our next-generation fast delivery and secured payment system.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 md:opacity-40 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-400 via-indigo-600 to-transparent"></div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start space-x-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Wide Catalog</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Browse thousands of items curated directly from quality-verified suppliers.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Secure Checkout</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your transactions are protected by advanced cryptographic JWT verification.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Instant Notification</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Receive live order state updates sent via microservice-based event queues.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 text-sm">Grab them before they run out of inventory</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            No products available at the moment.
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
