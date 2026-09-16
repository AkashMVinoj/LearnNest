import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Bell, LogOut, Home } from 'lucide-react';
import api from '../../services/api';

export const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role');
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Route-aware dashboard link
  const dashboardPath = role === 'mentor' ? '/mentor' : '/dashboard';

  // Load profile (avatar + full name) on mount
  useEffect(() => {
    api.get('/auth/me/')
      .then((res) => {
        setAvatar(res.data.avatar);
        setFullName(
          `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim() || res.data.username
        );
      })
      .catch((err) => console.error('Failed to load profile:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={dashboardPath} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">LearnNest</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search your courses..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Home */}
            <Link
              to="/"
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Home"
            >
              <Home className="w-5 h-5 text-slate-600" />
            </Link>

            {/* Bell */}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-slate-100 rounded-full transition"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ display: avatar ? 'none' : 'flex' }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {fullName || username}
                </span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{fullName || username}</p>
                      <p className="text-xs text-slate-500 truncate">
                        @{username} {role && `· ${role}`}
                      </p>
                    </div>

                    <Link
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Home className="w-4 h-4" />
                      {role === 'mentor' ? 'Mentor Dashboard' : 'Dashboard'}
                    </Link>

                    <Link
                      to="/browse"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Search className="w-4 h-4" />
                      Browse Courses
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Logout (Quick button) */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-slate-600 hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};