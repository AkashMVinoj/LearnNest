import { Link } from 'react-router-dom';
import { BookOpen, Menu } from 'lucide-react';
import { useState } from 'react';

export const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">LearnNest</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Features</a>
            <a href="#courses" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Courses</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">About</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-slate-600 hover:text-blue-600 py-2">Features</a>
              <a href="#courses" className="text-sm text-slate-600 hover:text-blue-600 py-2">Courses</a>
              <a href="#about" className="text-sm text-slate-600 hover:text-blue-600 py-2">About</a>
              <Link to="/login" className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 rounded-lg text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};