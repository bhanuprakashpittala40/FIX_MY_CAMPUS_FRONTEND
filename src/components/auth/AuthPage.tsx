import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  Building2,
  GraduationCap,
  Briefcase,
  Wrench,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role, department });
      } else {
        await login({ email, password });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'STUDENT' as Role,
      name: 'Alex Rivera',
      dept: 'Computer Science Dept',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Student Portal',
      desc: 'Submit issues, track real-time SLA progress, and confirm or reopen fixes.',
    },
    {
      role: 'FACULTY' as Role,
      name: 'Dr. Patricia Gomez',
      dept: 'School of Engineering',
      icon: Briefcase,
      color: 'from-violet-600 to-purple-600',
      badge: 'Faculty Portal',
      desc: 'Report classroom, lab equipment, and academic infrastructure faults.',
    },
    {
      role: 'MAINTENANCE' as Role,
      name: 'Marcus Vance',
      dept: 'Electrical Maintenance',
      icon: Wrench,
      color: 'from-amber-600 to-orange-600',
      badge: 'Technician Console',
      desc: 'Accept assignments, update status, put on hold, and upload resolution proof.',
    },
    {
      role: 'ADMIN' as Role,
      name: 'Dean Sarah Jenkins',
      dept: 'Campus Operations',
      icon: Shield,
      color: 'from-campus-700 to-campus-900',
      badge: 'Admin Command',
      desc: 'Manage campus complaints, assign staff, view analytics, and configure SLAs.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-campus-600 to-campus-400 items-center justify-center text-white shadow-xl shadow-campus-500/20 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Fix My <span className="text-campus-400">Campus</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Smart Campus Complaint & SLA Governance System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4 sm:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Instant 1-Click Demo Logins */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Instant One-Click Demo Access
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <div
                  key={acc.role}
                  onClick={() => switchDemoRole(acc.role)}
                  className="bg-slate-800/90 border border-slate-700/80 hover:border-campus-400 hover:bg-slate-800 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600">
                        {acc.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white group-hover:text-campus-300 transition-colors">
                      {acc.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{acc.dept}</p>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{acc.desc}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-campus-400 group-hover:text-campus-300">
                    <span>Enter as {acc.role}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Standard Auth Form */}
        <div className="md:col-span-5 bg-white py-8 px-6 shadow-2xl rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h3>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg(null);
              }}
              className="text-xs text-campus-600 hover:text-campus-700 font-bold"
            >
              {isRegister ? 'Already registered? Login' : 'New here? Register'}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samantha Hayes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-campus-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CS"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-campus-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-campus-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-campus-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-campus-600 hover:bg-campus-700 text-white font-bold text-xs shadow-md shadow-campus-600/20 disabled:opacity-50 transition-all mt-2"
            >
              {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
