import React from 'react';
import { Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setSearchTerm } from '../features/productsSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchTerm = useAppSelector((state) => state.products.searchTerm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative w-full max-w-lg">
      <input
        type="text"
        placeholder="Search for products, brands and more..."
        value={searchTerm}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
      />
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
    </form>
  );
};

export default SearchBar;
