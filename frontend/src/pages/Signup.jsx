import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  BookOpen, Lock, User, Mail, GraduationCap, Briefcase,
  AlertCircle, CheckCircle, Image, Heart, BookMarked
} from 'lucide-react';

const STUDENT_INTERESTS = [
  'Python', 'Web Development', 'Data Science', 'Machine Learning',
  'UI/UX Design', 'Mobile Development', 'Cybersecurity', 'Cloud Computing',
  'Digital Marketing', 'Finance', 'Photography', 'Public Speaking'
];

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    expertise: '',
    bio: '',
    interests: [],
    teaching_subjects: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        role,
        interests: form.interests.join(', '),
      };

      const res = await api.post('/auth/signup/', payload);

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('role', res.data.user.role);

      setSuccess(true);
      setTimeout(() => {
        const target = res.data.user.role === 'mentor' ? '/mentor' : '/dashboard';
        window.location.replace(target);
      }, 800);
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors).flat()[0];
        setError(typeof firstError === 'string' ? firstError : 'Signup failed.');
      } else {
        setError('Signup failed. Please try again.');
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-4">
        <Card className="w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account created!</h2>
          <p className="text-slate-500">Redirecting you to your {role} dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-4 py-10">
      <Card className="w-full max-w-2xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join LearnNest as a student or mentor</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
              role === 'student'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            I'm a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('mentor')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
              role === 'mentor'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            I'm a Mentor
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Alex"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Kumar"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="alexkumar"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Profile Picture URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Profile Picture URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            {form.avatar && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={form.avatar}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs text-slate-500">Preview</span>
              </div>
            )}
          </div>

          {/* STUDENT FIELDS */}
          {role === 'student' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                What do you want to study?
              </label>
              <div className="flex flex-wrap gap-2">
                {STUDENT_INTERESTS.map((interest) => {
                  const isSelected = form.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {isSelected && '✓ '}{interest}
                    </button>
                  );
                })}
              </div>
              {form.interests.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Selected: <strong>{form.interests.join(', ')}</strong>
                </p>
              )}
            </div>
          )}

          {/* MENTOR FIELDS */}
          {role === 'mentor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Expertise <span className="text-slate-400 font-normal">(e.g. Python, React, Data Science)</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="expertise"
                    value={form.expertise}
                    onChange={handleChange}
                    placeholder="Python, Data Science"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                  <BookMarked className="w-4 h-4 text-blue-500" />
                  Courses you want to teach
                </label>
                <input
                  name="teaching_subjects"
                  value={form.teaching_subjects}
                  onChange={handleChange}
                  placeholder="Python for Beginners, Web Development Basics"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Separate multiple courses with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tell students about your experience..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </>
          )}

          <Button type="submit" size="lg" className="w-full" isLoading={loading}>
            Create {role === 'mentor' ? 'Mentor' : 'Student'} Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}