import React from 'react';
import { useAppSelector } from '../app/hooks';
import { User as UserIcon, Mail, IdentificationCard } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500 font-semibold">
        No user profile found. Please log in.
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details and credentials</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-32 relative">
          <div className="absolute -bottom-10 left-8 bg-indigo-50 border-4 border-white text-indigo-600 text-2xl font-black w-20 h-20 rounded-2xl flex items-center justify-center shadow-md">
            {initials}
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Customer Account</p>
          </div>

          <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <UserIcon className="w-5 h-5 text-slate-400" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </span>
                <span className="text-sm font-semibold text-slate-700">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
