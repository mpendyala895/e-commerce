import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStart, fetchSuccess, fetchFailure, setSelectedCategory, setSortBy, resetFilters } from '../features/productsSlice';
import { getProducts } from '../services/productApi';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Filter, SlidersHorizontal } from 'lucide-react';

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, searchTerm, selectedCategory, sortBy } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    const fetchAllProducts = async () => {
      dispatch(fetchStart());
      try {
        const data = await getProducts();
        dispatch(fetchSuccess(data));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching products';
        dispatch(fetchFailure(errorMsg));
      }
    };
    fetchAllProducts();
  }, [dispatch]);

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">All Products</h1>
          <p className="text-slate-500 text-sm mt-1">
            Showing {filteredItems.length} products matching your choices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(resetFilters())}
            className="text-xs text-slate-500 hover:text-indigo-600 font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Categories
              </h4>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => dispatch(setSelectedCategory(''))}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedCategory === ''
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => dispatch(setSelectedCategory(cat))}
                    className={`text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Sort By
              </h4>
              <select
                value={sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <Loader />
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Products Found"
              description="We couldn't find any products matching your search criteria. Try adjusting your filter tags or search key."
              actionText="Reset All Filters"
              actionPath="/products"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
