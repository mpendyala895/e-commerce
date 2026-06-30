import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, ShoppingBag, History } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/authSlice';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-extrabold text-xl tracking-tight">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              <span>E-Shop</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/products" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">
                Shop
              </Link>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative text-slate-600 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-slate-50">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'ROLE_ADMIN' && (
                  <Link to="/admin" className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <Link to="/orders" className="text-slate-600 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-slate-50" title="Order History">
                  <History className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="flex items-center space-x-1.5 text-slate-700 hover:text-indigo-600 transition-colors">
                  <UserIcon className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium">{user?.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-slate-600 hover:text-rose-600 transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center space-x-4">
            <Link to="/cart" className="relative text-slate-600 p-1.5">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-1.5 focus:outline-none">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-3">
          <div className="py-2">
            <SearchBar />
          </div>
          <Link to="/products" onClick={() => setIsOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-indigo-600">
            Shop Products
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'ROLE_ADMIN' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-2 text-indigo-600 font-bold hover:text-indigo-700">
                  Admin Panel
                </Link>
              )}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-indigo-600">
                My Profile ({user?.firstName})
              </Link>
              <Link to="/orders" onClick={() => setIsOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-indigo-600">
                Order History
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left py-2 text-rose-600 font-medium flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2 text-slate-600 font-medium border border-slate-200 rounded-xl">
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-2 bg-indigo-600 text-white font-medium rounded-xl">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
