import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-white font-extrabold text-lg tracking-tight">E-Shop</span>
            <p className="mt-4 text-sm text-slate-400">
              High-performance, secure e-commerce shopping platform driven by microservices architecture.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>All Products</li>
              <li>Featured Goods</li>
              <li>Hot Deals</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>Contact Us</li>
              <li>Refund Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} E-Shop Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
