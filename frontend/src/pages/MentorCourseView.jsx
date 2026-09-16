import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Briefcase, BookOpen, Plus, Image as ImageIcon, X, Clock,
  Send, Users, ClipboardList, MessageSquare, Upload, Video,
  ArrowLeft, Edit, Trash2, FileText, Inbox, CheckCircle, Mail
} from 'lucide-react';

export default function MentorDashboard() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    courses_registered: 0,
    active_students: 0,
    pending_reviews: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    image_file: null,
    duration_weeks: 4,
    price: 'Free',
  });
  const username = localStorage.getItem('username') || 'Mentor';

  const loadData = async () => {
    try {
      const [profileRes, coursesRes, statsRes] = await Promise.all([
        api.get('/auth/me/'),
        api.get('/auth/mentor-courses/'),
        api.get('/auth/mentor-stats/').catch(() => ({
          data: { courses_registered: 0, active_students: 0, pending_reviews: 0 },
        })),
      ]);
      setProfile(profileRes.data);
      setCourses(coursesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('duration_weeks', form.duration_weeks);
      if (form.image) formData.append('image', form.image);
      if (form.image_file) formData.append('image_file', form.image_file);

      await api.post('/auth/mentor-courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm({
        title: '', description: '', category: '',
        image: '', image_file: null, duration_weeks: 4, price: 'Free',
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create course: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'tasks', label: 'Assign Tasks', icon: ClipboardList },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'submissions', label: 'Submissions', icon: Inbox },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={username}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Mentor Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{username}</span>
            </h1>
            {profile?.expertise && (
              <p className="text-slate-600 text-sm mt-1">Expertise: <strong>{profile.expertise}</strong></p>
            )}
          </div>
          <Button onClick={() => { setActiveTab('courses'); setShowForm(true); }} size="lg">
            <Plus className="w-4 h-4" />
            Register New Course
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Courses Registered</p>
            <p className="text-3xl font-bold text-slate-900">{stats.courses_registered}</p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Active Students</p>
            <p className="text-3xl font-bold text-slate-900">{stats.active_students}</p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Pending Reviews</p>
            <p className="text-3xl font-bold text-slate-900">{stats.pending_reviews}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto">
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

        {/* Tab Content */}
        {activeTab === 'courses' && (
          <CoursesTab
            loading={loading}
            courses={courses}
            onRegisterClick={() => setShowForm(true)}
            onReload={loadData}
          />
        )}
        {activeTab === 'tasks' && <MentorTasks courses={courses} />}
        {activeTab === 'exams' && <MentorExams courses={courses} />}
        {activeTab === 'submissions' && <MentorSubmissions />}
        {activeTab === 'students' && <StudentsList />}
        {activeTab === 'messages' && <MessagesPanel />}
      </div>

      {/* New Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Register New Course</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Advanced Python Programming"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  placeholder="What will students learn?"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Python, Web Dev"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (weeks)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_weeks}
                    onChange={(e) => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Free or $49"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Cover Image <span className="text-slate-400 font-normal">(upload or paste URL)</span>
                </label>

                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
                  onClick={() => document.getElementById('cover-upload').click()}
                >
                  {form.image_file ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={URL.createObjectURL(form.image_file)}
                        alt="Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                          {form.image_file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(form.image_file.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm({ ...form, image_file: null });
                          }}
                          className="text-xs text-red-600 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Click to upload an image</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG — max 5MB</p>
                    </>
                  )}
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File too large. Max 5MB.');
                          return;
                        }
                        setForm({ ...form, image_file: file });
                      }
                    }}
                  />
                </div>

                <div className="relative mt-3">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Or paste an image URL: https://..."
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Create Course
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ============================================
   MY COURSES TAB
   ============================================ */
function CoursesTab({ loading, courses, onRegisterClick, onReload }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (courses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
        <p className="text-slate-500 mb-6">Register your first course to start teaching students.</p>
        <Button onClick={onRegisterClick}>
          <Plus className="w-4 h-4" /> Register Course
        </Button>
      </Card>
    );
  }

  if (selectedCourse) {
    return <VideoManager course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/mentor-courses/${course.id}/`);
      await onReload();
    } catch (err) {
      alert('Failed to delete: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => {
          const imgSrc = c.display_image || c.image;
          return (
            <Card key={c.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-indigo-600">
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
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[42px]">{c.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {c.duration_weeks} weeks
                  </span>
                  {c.category && <span className="bg-slate-100 px-2 py-0.5 rounded">{c.category}</span>}
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button onClick={() => setSelectedCourse(c)} className="w-full">
                    <Video className="w-4 h-4" /> Manage Videos
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingCourse(c)} className="flex-1">
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(c)} className="flex-1 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={async () => {
            setEditingCourse(null);
            await onReload();
          }}
        />
      )}
    </>
  );
}

/* ============================================
   EDIT COURSE MODAL
   ============================================ */
function EditCourseModal({ course, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    category: course.category || '',
    price: course.price || 'Free',
    duration_weeks: course.duration_weeks || 4,
    image: course.image || '',
    image_file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('duration_weeks', form.duration_weeks);
      if (form.image) fd.append('image', form.image);
      if (form.image_file) fd.append('image_file', form.image_file);

      await api.patch(`/auth/mentor-courses/${course.id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await onSaved();
    } catch (err) {
      console.error(err);
      alert('Failed to update: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit Course</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (weeks)</label>
              <input
                type="number"
                min="1"
                value={form.duration_weeks}
                onChange={(e) => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price</label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Replace Cover Image <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer"
              onClick={() => document.getElementById('edit-cover-upload').click()}
            >
              {form.image_file ? (
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={URL.createObjectURL(form.image_file)}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="text-left">
                    <p className="text-sm text-slate-700">{form.image_file.name}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setForm({ ...form, image_file: null }); }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-sm text-slate-600">Click to upload a new image</p>
                </>
              )}
              <input
                id="edit-cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, image_file: file });
                }}
              />
            </div>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="Or paste image URL"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-sm mt-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ============================================
   VIDEO MANAGER (with Publish All)
   ============================================ */
function VideoManager({ course, onBack }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_file: null,
    video_url: '',
    duration_minutes: 0,
  });

  const loadVideos = async () => {
    try {
      const res = await api.get(`/auth/courses/${course.id}/videos/`);
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(); }, [course.id]);

  const totalVideos = videos.length;
  const publishedCount = videos.filter(v => v.is_published).length;
  const allPublished = totalVideos > 0 && publishedCount === totalVideos;

  const publishAll = async (publish) => {
    setPublishing(true);
    try {
      await api.post(`/auth/courses/${course.id}/videos/publish-all/`, {
        is_published: publish,
      });
      await loadVideos();
    } catch (err) {
      alert('Failed: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setPublishing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('duration_minutes', form.duration_minutes);
      if (form.video_url) fd.append('video_url', form.video_url);
      if (form.video_file) fd.append('video_file', form.video_file);

      await api.post(`/auth/courses/${course.id}/videos/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm({ title: '', description: '', video_file: null, video_url: '', duration_minutes: 0 });
      setShowForm(false);
      await loadVideos();
    } catch (err) {
      console.error(err);
      alert('Failed: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/auth/videos/${videoId}/`);
      await loadVideos();
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
          <p className="text-sm text-slate-500">
            Manage video lessons
            {totalVideos > 0 && (
              <span className="ml-2 text-slate-400">· {publishedCount}/{totalVideos} published</span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          {totalVideos > 0 && (
            <Button
              variant={allPublished ? 'outline' : 'success'}
              onClick={() => publishAll(!allPublished)}
              isLoading={publishing}
            >
              {allPublished ? <>📥 Unpublish All</> : <>📤 Publish All ({totalVideos})</>}
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Upload className="w-4 h-4" /> Upload Video
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading videos...</p>
      ) : videos.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No videos yet</h3>
          <p className="text-slate-500 mb-6">Upload your first video lesson.</p>
          <Button onClick={() => setShowForm(true)}>
            <Upload className="w-4 h-4" /> Upload Video
          </Button>
        </Card>
      ) : (
        <>
          <Card className={`p-4 mb-4 border-2 ${allPublished ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-3">
              {allPublished ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">
                    <strong>All {totalVideos} videos are published.</strong> Students can watch them now.
                  </p>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>{publishedCount} of {totalVideos} videos are published.</strong> Click <strong>"Publish All"</strong> to make all videos visible.
                  </p>
                </>
              )}
            </div>
          </Card>

          <div className="space-y-3">
            {videos.map((v) => (
              <Card key={v.id} className={`p-4 flex items-center justify-between gap-4 ${v.is_published ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${v.is_published ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <Video className={`w-5 h-5 ${v.is_published ? 'text-emerald-600' : 'text-slate-500'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 truncate">{v.title}</h3>
                      {v.is_published ? (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap">✓ Published</span>
                      ) : (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">Draft</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{v.description}</p>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      {v.duration_minutes > 0 && <span>{v.duration_minutes} min</span>}
                      <span>{v.display_video ? 'Ready' : 'No file'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {v.display_video && (
                    <a href={v.display_video} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">Play</Button>
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Upload Video</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Variables"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Video File</label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer"
                  onClick={() => document.getElementById('video-upload').click()}
                >
                  {form.video_file ? (
                    <p className="text-sm text-slate-700">{form.video_file.name}</p>
                  ) : (
                    <>
                      <Video className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-sm text-slate-600">Click to upload a video</p>
                    </>
                  )}
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, video_file: file });
                    }}
                  />
                </div>
              </div>
              <div className="text-center text-xs text-slate-400">— OR —</div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Video URL</label>
                <input
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Upload Video
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ============================================
   MENTOR TASKS — WITH MANDATORY COURSE SELECT
   ============================================ */
function MentorTasks({ courses }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    due_date: '',
    max_score: 100,
  });

  const loadTasks = async () => {
    try {
      const res = await api.get('/auth/mentor-tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course) {
      alert('Please select a course. This is required so the task appears on the student course page.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/mentor-tasks/', {
        title: form.title,
        description: form.description,
        course: form.course,
        due_date: form.due_date || null,
        max_score: form.max_score,
      });
      setForm({ title: '', description: '', course: '', due_date: '', max_score: 100 });
      setShowForm(false);
      await loadTasks();
    } catch (err) {
      alert('Failed: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/auth/mentor-tasks/${id}/`);
      await loadTasks();
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Assigned Tasks</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks yet</h3>
          <p className="text-slate-500 mb-6">Create your first task and assign it to a course.</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Create Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800">{t.title}</h3>
                <p className="text-sm text-slate-500">{t.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                  {t.course_title && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">📘 {t.course_title}</span>}
                  {t.due_date && <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>}
                  <span>Max Score: {t.max_score}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => setEditingTask(t)}>
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Task</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description / Question
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="4"
                  placeholder="Write the assignment question or instructions here…"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Course * <span className="text-red-500">(required to appear on student course page)</span>
                </label>
                <select
                  required
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">— Select a course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Score</label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Create Task
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          courses={courses}
          onClose={() => setEditingTask(null)}
          onSaved={async () => {
            setEditingTask(null);
            await loadTasks();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   EDIT TASK MODAL
   ============================================ */
function EditTaskModal({ task, courses, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    course: task.course || task.course_id || '',
    due_date: task.due_date ? String(task.due_date).slice(0, 10) : '',
    max_score: task.max_score || 100,
    priority: task.priority || 'medium',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/auth/tasks/${task.id}/`, {
        title: form.title,
        description: form.description,
        course: form.course || null,
        due_date: form.due_date || null,
        max_score: form.max_score,
        priority: form.priority,
      });
      await onSaved();
    } catch (err) {
      alert('Failed to update task: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description / Question
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="5"
              placeholder="Write the assignment question or instructions here…"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— Select a course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Score</label>
              <input
                type="number"
                min="1"
                value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ============================================
   MENTOR EXAMS — WITH EDIT
   ============================================ */
function MentorExams({ courses }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    date: '',
    duration_minutes: 60,
    total_marks: 100,
  });

  const loadExams = async () => {
    try {
      const res = await api.get('/auth/mentor-exams/');
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/mentor-exams/', {
        title: form.title,
        description: form.description,
        course: form.course || null,
        date: form.date || null,
        duration_minutes: form.duration_minutes,
        total_marks: form.total_marks,
      });
      setForm({ title: '', description: '', course: '', date: '', duration_minutes: 60, total_marks: 100 });
      setShowForm(false);
      await loadExams();
    } catch (err) {
      alert('Failed: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await api.delete(`/auth/mentor-exams/${id}/`);
      await loadExams();
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Exams</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Schedule Exam
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : exams.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No exams scheduled</h3>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Schedule Exam
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map((ex) => (
            <Card key={ex.id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{ex.title}</h3>
                  {ex.is_published ? (
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      ✓ Published
                    </span>
                  ) : (
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{ex.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                  {ex.course_title && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">📘 {ex.course_title}</span>}
                  {ex.date && <span>Date: {new Date(ex.date).toLocaleDateString()}</span>}
                  {ex.duration_minutes && <span>Duration: {ex.duration_minutes} min</span>}
                  {ex.total_marks && <span>Marks: {ex.total_marks}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingExam(ex)}>
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(ex.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Schedule Exam</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">— Select course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Marks</label>
                <input
                  type="number"
                  min="1"
                  value={form.total_marks}
                  onChange={(e) => setForm({ ...form, total_marks: parseInt(e.target.value) || 100 })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Schedule
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {editingExam && (
        <EditExamModal
          exam={editingExam}
          courses={courses}
          onClose={() => setEditingExam(null)}
          onSaved={async () => {
            setEditingExam(null);
            await loadExams();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   EDIT EXAM MODAL
   ============================================ */
function EditExamModal({ exam, courses, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: exam.title || '',
    description: exam.description || '',
    course: exam.course || '',
    duration_minutes: exam.duration_minutes || 60,
    total_marks: exam.total_marks || 100,
    is_published: exam.is_published || false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/auth/mentor-exams/${exam.id}/`, {
        title: form.title,
        description: form.description,
        course: form.course || null,
        duration_minutes: form.duration_minutes,
        total_marks: form.total_marks,
        is_published: form.is_published,
      });
      await onSaved();
    } catch (err) {
      alert('Failed to update: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Exam</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— Select course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (min)</label>
              <input
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Marks</label>
              <input
                type="number"
                min="1"
                value={form.total_marks}
                onChange={(e) => setForm({ ...form, total_marks: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="exam-published"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="exam-published" className="text-sm text-slate-700">
              Publish this exam (students can see and take it)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ============================================
   MENTOR SUBMISSIONS
   ============================================ */
function MentorSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });

  const loadSubmissions = async () => {
    try {
      const res = await api.get('/auth/mentor-submissions/');
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubmissions(); }, []);

  const handleGrade = async (id) => {
    try {
      await api.patch(`/auth/tasks/${id}/`, {
        grade: gradeData.score,
        feedback: gradeData.feedback,
        status: 'completed',
      });
      setGradingId(null);
      setGradeData({ score: '', feedback: '' });
      await loadSubmissions();
    } catch (err) {
      alert('Failed: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Student Submissions</h2>
        <span className="text-sm text-slate-500">
          {submissions.length} submission{submissions.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No submissions yet</h3>
          <p className="text-slate-500">
            Student work will appear here once they submit a task.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">
                      {s.task_title || s.title}
                    </h3>
                    {s.status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {(s.student_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{s.student_name || 'Unassigned'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {s.course_title && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        📘 {s.course_title}
                      </span>
                    )}
                    {s.video_title && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                        🎬 {s.video_title}
                      </span>
                    )}
                    {s.created_at && (
                      <span className="text-slate-500">
                        {new Date(s.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {s.content && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-1">Submission:</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{s.content}</p>
                    </div>
                  )}

                  {s.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-blue-700 mb-1">Your feedback:</p>
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">{s.feedback}</p>
                    </div>
                  )}

                  {s.file && (
                    <a
                      href={s.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 text-sm hover:underline"
                    >
                      📎 Download attached file
                    </a>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  {s.score != null && s.score !== '' ? (
                    <>
                      <p className="text-2xl font-bold text-emerald-600">{s.score}</p>
                      <p className="text-xs text-slate-500">Graded</p>
                      <button
                        onClick={() => {
                          setGradingId(s.id);
                          setGradeData({ score: s.score || '', feedback: s.feedback || '' });
                        }}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        Edit grade
                      </button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setGradingId(s.id);
                        setGradeData({ score: '', feedback: '' });
                      }}
                    >
                      Grade
                    </Button>
                  )}
                </div>
              </div>

              {gradingId === s.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Score"
                      value={gradeData.score}
                      onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                      className="sm:col-span-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                    />
                    <textarea
                      placeholder="Feedback to student…"
                      rows="2"
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleGrade(s.id)}>
                      Save Grade
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setGradingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   STUDENTS LIST — FULL DETAIL VIEW
   ============================================ */
function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/mentor-students/');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-slate-500">Loading students...</p>;

  if (students.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No students yet</h3>
        <p className="text-slate-500">
          Students who enroll in your courses will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((st) => {
        const isOpen = expandedId === st.id;
        const completed = st.tasks?.completed ?? 0;
        const total = st.tasks?.total ?? 0;

        return (
          <Card key={st.id} className="overflow-hidden">
            <div
              className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition"
              onClick={() => setExpandedId(isOpen ? null : st.id)}
            >
              {st.avatar ? (
                <img
                  src={st.avatar}
                  alt={st.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {(st.username || 'S').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{st.name}</p>
                <p className="text-sm text-slate-500 truncate">{st.email || st.username}</p>
                {st.interests && (
                  <p className="text-xs text-blue-600 mt-0.5 truncate">
                    🎯 {st.interests}
                  </p>
                )}
              </div>

              <div className="hidden md:flex gap-6 text-center">
                <div>
                  <p className="text-xs text-slate-500">Courses</p>
                  <p className="font-bold text-slate-900">{st.courses?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tasks Done</p>
                  <p className="font-bold text-emerald-600">{completed}/{total}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="font-bold text-amber-600">{st.tasks?.pending ?? 0}</p>
                </div>
              </div>

              <span className="text-slate-400 text-lg">{isOpen ? '−' : '+'}</span>
            </div>

            {isOpen && (
              <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    📘 Enrolled Courses
                  </h4>
                  {st.courses?.length === 0 ? (
                    <p className="text-sm text-slate-400">Not enrolled in any of your courses.</p>
                  ) : (
                    <div className="space-y-3">
                      {st.courses.map((c) => (
                        <div key={c.course_id} className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-sm font-medium text-slate-800">{c.course_title}</p>
                            <p className="text-xs font-bold text-blue-600">{c.progress}%</p>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    📋 Task Breakdown
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">Pending</p>
                      <p className="text-lg font-bold text-slate-700">{st.tasks?.pending ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">In Progress</p>
                      <p className="text-lg font-bold text-blue-600">{st.tasks?.in_progress ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">Submitted</p>
                      <p className="text-lg font-bold text-amber-600">{st.tasks?.submitted ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">Completed</p>
                      <p className="text-lg font-bold text-emerald-600">{st.tasks?.completed ?? 0}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Joined: {st.joined ? new Date(st.joined).toLocaleDateString() : '—'}
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ============================================
   MESSAGES PANEL — click works via inner div
   ============================================ */
function MessagesPanel() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  const loadMessages = async (studentId) => {
    try {
      const res = await api.get(`/auth/messages/${studentId}/`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedStudent) return;
    setSending(true);
    try {
      await api.post(`/auth/messages/${selectedStudent.id}/`, { content: newMessage });
      setNewMessage('');
      await loadMessages(selectedStudent.id);
    } catch (err) {
      alert('Failed to send: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Messages</h2>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : conversations.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No conversations yet</h3>
          <p className="text-slate-500">
            Only students enrolled in your courses can be messaged here.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            {conversations.map((c) => (
              <Card
                key={c.id}
                className={`transition ${
                  selectedStudent?.id === c.id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:shadow-md'
                }`}
              >
                {/* ✅ inner clickable div — works whether Card spreads props or not */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    setSelectedStudent(c);
                    loadMessages(c.id);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(c.username || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 truncate">{c.username}</p>
                        {c.role && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            c.role === 'mentor'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {c.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {c.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="md:col-span-2">
            {selectedStudent ? (
              <Card className="p-5 h-[500px] flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200">
                  Chat with {selectedStudent.username}
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
                  <p className="text-slate-500">Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}