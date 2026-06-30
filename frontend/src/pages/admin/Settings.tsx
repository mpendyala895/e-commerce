import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { 
  User as UserIcon, 
  Lock, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  Save,
  ShieldCheck
} from 'lucide-react';
import { adminUpdateUser } from '../../services/adminApi';
import { loginSuccess } from '../../features/authSlice';

const Settings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Profile Form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password Form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Info alerts
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!user?.id) return;
    try {
      const updated = await adminUpdateUser(user.id, {
        firstName,
        lastName,
        email,
        password: password || undefined
      } as any);
      
      // Update Redux state
      dispatch(loginSuccess({ 
        token: localStorage.getItem('token') || '', 
        user: { ...user, ...updated } as any
      }));

      setMessage('Profile settings updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile settings');
    }
  };

  // Connectivity metrics (mock statuses reflecting project configuration ports)
  const serviceStatuses = [
    { name: 'API Gateway (Port 8080)', status: 'online', type: 'Gateway Router' },
    { name: 'User Service (Port 8087)', status: 'online', type: 'MySQL Database' },
    { name: 'Product Service (Port 8083)', status: 'online', type: 'MongoDB Database' },
    { name: 'Inventory Service (Port 8082)', status: 'online', type: 'MySQL Database' },
    { name: 'Order Service (Port 8081)', status: 'online', type: 'MySQL Database' },
    { name: 'Orchestrator Service (Port 8085)', status: 'online', type: 'Saga State Machine' },
    { name: 'Notification Service (Port 8084)', status: 'online', type: 'Kafka Consumer' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage administrative credentials, security configurations, and monitor service links</p>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-rose-100">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Settings form */}
        <div className="md:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-150 pb-3">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-base">Admin Profile Details</h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <div className="flex items-center space-x-2 pb-3">
                <Lock className="w-4.5 h-4.5 text-indigo-600" />
                <h4 className="font-bold text-slate-700 text-sm">Security Credentials</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={password !== confirmPassword}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                  password !== confirmPassword 
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Save className="w-4.5 h-4.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Microservices Health Dashboard */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-150 pb-3">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-base">Backend Health</h3>
          </div>

          <div className="space-y-4">
            {serviceStatuses.map((service, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="block font-bold text-slate-800 leading-tight">{service.name}</span>
                  <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{service.type}</span>
                </div>
                <div className="flex items-center space-x-1 font-bold text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Online</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-indigo-800 leading-relaxed font-semibold">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p>System Security Level: High. Paths are checked via API Gateway Gateway Filter. Ensure JWT keys remain synced.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
