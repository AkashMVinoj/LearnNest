import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { BookOpen, User, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // 1) get JWT tokens
      const tokenRes = await api.post('/token/', {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem('access_token', tokenRes.data.access);
      localStorage.setItem('refresh_token', tokenRes.data.refresh);

      // 2) fetch profile to learn role + username
      const meRes = await api.get('/auth/me/', {
        headers: { Authorization: `Bearer ${tokenRes.data.access}` },
      });
      const role = meRes.data.role;
      localStorage.setItem('username', meRes.data.username);
      localStorage.setItem('role', role);

      // 3) redirect based on role
      navigate(role === 'mentor' ? '/mentor' : '/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Welcome to LearnNest
          </h1>
          <p className="text-sm text-slate-500">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg break-words">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={submitting}
              className="w-full py-3 text-base font-medium"
            >
              Sign In
            </Button>
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}