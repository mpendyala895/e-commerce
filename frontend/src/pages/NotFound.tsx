import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6">
      <div className="bg-amber-50 p-6 rounded-full text-amber-500 shadow-xs">
        <Search className="w-12 h-12 animate-pulse" />
      </div>
      <h1 className="text-6xl font-black text-slate-800">404</h1>
      <h2 className="text-2xl font-bold text-slate-700">Page Not Found</h2>
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
        The page you are looking for does not exist or has been moved. Use the options below to get back on track.
      </p>
      <div className="pt-4 flex items-center space-x-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Go to Home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
        >
          Shop Catalog
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
