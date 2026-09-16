import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  BookOpen, Search, Clock, CheckCircle, GraduationCap
} from 'lucide-react';

export default function Browse() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [enrolling, setEnrolling] = useState(null);
  const navigate = useNavigate();

  // ✅ role is read once from localStorage
  const role = localStorage.getItem('role');
  const isStudent = role === 'student';

  const loadData = async () => {
    try {
      const [publicRes, myRes] = await Promise.all([
        api.get('/auth/public-courses/'),
        // mentor doesn't have enrollments — the backend returns [] for mentors
        api.get('/auth/my-enrollments/').catch(() => ({ data: [] })),
      ]);
      setCourses(publicRes.data);
      setEnrolledIds((myRes.data || []).map((e) => e.course));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEnroll = async (courseId) => {
    // ✅ safety net — never fire the request for a mentor
    if (!isStudent) {
      alert('Only students can enroll in courses. You are signed in as a mentor.');
      return;
    }
    setEnrolling(courseId);
    try {
      await api.post(`/auth/courses/${courseId}/enroll/`);
      await loadData();
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      console.error(err);
      alert('Failed to enroll: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.mentor_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>Browse Courses</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Courses</h1>
          <p className="text-slate-600">
            {isStudent
              ? 'Discover courses from expert mentors and enroll to start learning.'
              : 'Preview courses offered by mentors on LearnNest.'}
          </p>
        </div>

        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, mentors, or categories..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading courses...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-16 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses found</h3>
            <p className="text-slate-500">
              {search ? 'Try a different search term.' : 'No courses available yet.'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => {
              const isEnrolled = enrolledIds.includes(c.id);
              const imgSrc = c.display_image || c.image;
              return (
                <Card key={c.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-blue-500 to-indigo-600">
                    {imgSrc ? (
                      <img src={imgSrc} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-14 h-14 text-white/60" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-slate-700">
                      {c.price || 'Free'}
                    </div>
                    {isEnrolled && (
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Enrolled
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{c.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[42px]">
                      {c.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      {c.mentor_avatar ? (
                        <img
                          src={c.mentor_avatar}
                          alt={c.mentor_name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {c.mentor_name?.charAt(0) || 'M'}
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        By <strong className="text-slate-700">{c.mentor_name}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {c.duration_weeks} weeks
                      </span>
                      {c.category && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{c.category}</span>
                      )}
                    </div>

                    {/* ✅ Role-aware action area */}
                    {isStudent ? (
                      <Button
                        onClick={() => !isEnrolled && handleEnroll(c.id)}
                        disabled={isEnrolled}
                        isLoading={enrolling === c.id}
                        className="w-full mt-4"
                        variant={isEnrolled ? 'outline' : 'primary'}
                      >
                        {isEnrolled ? (
                          <><CheckCircle className="w-4 h-4" /> Already Enrolled</>
                        ) : (
                          <>Enroll Now</>
                        )}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full mt-4 opacity-70 cursor-not-allowed"
                      >
                        Mentors can't enroll
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}