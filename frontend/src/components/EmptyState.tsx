import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionPath?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionPath = '/products',
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto my-12">
      <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-5">
        <ShoppingBag className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 text-sm">{description}</p>
      {actionText && (
        <Link
          to={actionPath}
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
