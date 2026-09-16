import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import {
  BookOpen, TrendingUp, Award, Sparkles, Plus,
  MessageSquare, Send, Mail,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolled_courses: 0,
    average_progress: 0,
    items_completed: 0,
    completed_videos: 0,
    completed_tasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const username = localStorage.getItem('username') || 'Student';

  // Redirect mentors to their own dashboard
  useEffect(() => {
    if (role === 'mentor') {
      navigate('/mentor', { replace: true });
    }
  }, [role, navigate]);

  // ✅ read ?tab=messages so the "Message Mentor" shortcut works
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'messages') setActiveTab('messages');
  }, []);

  // Load student data
  useEffect(() => {
    if (role !== 'student') return;

    const loadData = async () => {
      try {
        const [enrollRes, statsRes] = await Promise.all([
          api.get('/auth/my-enrollments/'),
          api.get('/auth/student-stats/').catch(() => ({
            data: { enrolled_courses: 0, average_progress: 0, items_completed: 0 },
          })),
        ]);

        const enrolled = enrollRes.data.map((e) => ({
          id: e.course,
          ...e.course_details,
          progress_percent: e.progress || 0,
          enrolled_at: e.enrolled_at,
        }));
        setCourses(enrolled);
        setStats(statsRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role]);

  if (role === 'mentor') return null;

  const tabs = [
    { id: 'courses',  label: 'My Courses', icon: BookOpen },
    { id: 'messages', label: 'Messages',   icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Your Learning Journey</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {username}
            </span>{' '}
            👋
          </h1>
          <p className="text-lg text-slate-600">Here's your learning overview for today.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition relative ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* ── COURSES TAB ── */}
        {activeTab === 'courses' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              <StatCard icon={BookOpen}   label="Enrolled Courses"  value={stats.enrolled_courses}             color="blue"    trend="Active" />
              <StatCard icon={TrendingUp} label="Average Progress"  value={`${stats.average_progress}%`}       color="emerald" trend={`${stats.completed_videos || 0} videos done`} />
              <StatCard icon={Award}      label="Items Completed"   value={stats.items_completed}              color="amber"   trend={`${stats.completed_tasks || 0} tasks done`} />
            </div>

            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {courses.length} course{courses.length !== 1 && 's'} enrolled
                </p>
              </div>
              <Link
                to="/browse"
                className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm hover:shadow-md transition"
              >
                <Plus className="w-4 h-4" /> Browse Courses
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="p-16 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  You aren't enrolled in any courses yet. Browse our catalog to find a course.
                </p>
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-5 py-3 rounded-lg shadow-md transition"
                >
                  <Plus className="w-4 h-4" /> Browse Courses
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && <StudentMessagesPanel />}
      </div>
    </div>
  );
}

/* ============================================
   Student messages panel — chat with mentors
   ============================================ */
function StudentMessagesPanel() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await api.get('/auth/mentor-conversations/');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  const loadMessages = async (mentorId) => {
    try {
      const res = await api.get(`/auth/messages/${mentorId}/`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedMentor) return;
    setSending(true);
    try {
      await api.post(`/auth/messages/${selectedMentor.id}/`, { content: newMessage });
      setNewMessage('');
      await loadMessages(selectedMentor.id);
    } catch (err) {
      alert('Failed to send: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading conversations...</p>;

  if (conversations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No mentors yet</h3>
        <p className="text-slate-500">
          Enroll in a course to start chatting with its mentor.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Contact list */}
      <div className="space-y-2">
        {conversations.map((c) => (
          <Card
            key={c.id}
            className={`p-4 cursor-pointer transition ${
              selectedMentor?.id === c.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => { setSelectedMentor(c); loadMessages(c.id); }}
          >
            <div className="flex items-center gap-3">
              {c.avatar ? (
                <img src={c.avatar} alt={c.username} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(c.username || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-slate-800 truncate">{c.username}</p>
                  {c.role && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                      {c.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {c.last_message || 'No messages yet'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chat pane */}
      <div className="md:col-span-2">
        {selectedMentor ? (
          <Card className="p-5 h-[500px] flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200">
              Chat with {selectedMentor.username}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No messages yet. Say hello!</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      m.is_mine
                        ? 'bg-blue-600 text-white ml-auto rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                    <div className={`text-xs mt-1 ${m.is_mine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
              <Button onClick={handleSend} isLoading={sending} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center h-[500px] flex items-center justify-center">
            <div>
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Select a mentor to start messaging</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ============================================
   Stat + Course cards (unchanged)
   ============================================ */
const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  const colors = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100' },
  };
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color].bg} ring-4 ${colors[color].ring}`}>
          <Icon className={`w-6 h-6 ${colors[color].text}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[color].bg} ${colors[color].text}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </Card>
  );
};

const CourseCard = ({ course }) => {
  const imgSrc = course.display_image || course.image;
  return (
    <Link to={`/mentor-course/${course.id}`} className="group">
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-44 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
            {course.progress_percent || 0}%
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 min-h-[42px] leading-relaxed">
            {course.description || 'No description available.'}
          </p>

          {course.mentor_name && (
            <div className="flex items-center gap-2 mt-3">
              {course.mentor_avatar ? (
                <img src={course.mentor_avatar} alt={course.mentor_name} className="w-6 h-6 rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {course.mentor_name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-slate-500">By {course.mentor_name}</span>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">Progress</span>
              <span>{course.progress_percent || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${course.progress_percent || 0}%` }} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};