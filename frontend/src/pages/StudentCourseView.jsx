import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft, Play, CheckCircle, Clock, BookOpen, FileText,
  ClipboardList, User, Calendar, X, Send, MessageSquare,
} from 'lucide-react';

export default function StudentCourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [progress, setProgress] = useState({ completed_video_ids: [], progress_percent: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [openTask, setOpenTask] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const loadAll = async () => {
    try {
      const [coursesRes, videosRes, assignmentsRes, examsRes, progressRes] = await Promise.all([
        api.get('/auth/public-courses/'),
        api.get(`/auth/courses/${id}/videos/`),
        api.get(`/auth/courses/${id}/my-assignments/`).catch(() => ({ data: [] })),
        api.get(`/auth/courses/${id}/my-exams/`).catch(() => ({ data: [] })),
        api.get(`/auth/courses/${id}/progress/`).catch(() => ({ data: { completed_video_ids: [], progress_percent: 0 } })),
      ]);

      const foundCourse = coursesRes.data.find((c) => String(c.id) === String(id));
      console.log('LOADED COURSE:', foundCourse);   // ✅ diagnostic
      setCourse(foundCourse || null);
      setVideos(videosRes.data);
      setAssignments(assignmentsRes.data);
      setExams(examsRes.data);
      setProgress(progressRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const markWatched = async (videoId) => {
    try {
      await api.post(`/auth/videos/${videoId}/mark-watched/`);
      await loadAll();
    } catch (err) {
      alert('Failed to mark watched.');
    }
  };

  const unmarkWatched = async (videoId) => {
    try {
      await api.post(`/auth/videos/${videoId}/unmark-watched/`);
      await loadAll();
    } catch (err) {
      alert('Failed to unmark.');
    }
  };

  if (loading) return <p className="p-10 text-slate-500">Loading course…</p>;
  if (!course) return <p className="p-10 text-slate-500">Course not found.</p>;

  const completedIds = new Set(progress.completed_video_ids || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Course header */}
        <Card className="overflow-hidden mb-8">
          <div className="relative h-56 bg-gradient-to-br from-blue-600 to-indigo-700">
            {course.display_image || course.image ? (
              <img
                src={course.display_image || course.image}
                alt={course.title}
                className="w-full h-full object-cover opacity-70"
              />
            ) : null}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-sm text-white/90 mt-1 max-w-2xl">{course.description}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> By{' '}
                <strong className="text-slate-800">
                  {course.mentor_name || course.mentor || 'Mentor'}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {course.duration_weeks} weeks
              </span>
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4" /> {videos.length} videos
              </span>

              <button
                type="button"
                onClick={() => {
                  console.log('CHAT BTN CLICKED — mentor_id =', course.mentor_id, '| mentor =', course.mentor);
                  setShowChat(true);
                }}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
              </button>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600 font-medium">Course Progress</span>
                <span className="font-bold text-blue-600">{progress.progress_percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                  style={{ width: `${progress.progress_percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {(progress.completed_video_ids || []).length} of {videos.length} videos completed
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: 'videos',      label: 'Video Lessons', icon: Play,          count: videos.length },
            { id: 'assignments', label: 'Assignments',   icon: ClipboardList, count: assignments.length },
            { id: 'exams',       label: 'Exams',         icon: FileText,      count: exams.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition relative ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* ─── Videos tab ─── */}
        {activeTab === 'videos' && (
          <div className="space-y-3">
            {videos.length === 0 ? (
              <Card className="p-12 text-center">
                <Play className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No videos published yet.</p>
              </Card>
            ) : (
              videos.map((v) => {
                const isDone = completedIds.has(v.id);
                return (
                  <Card key={v.id} className={`p-5 flex items-center gap-4 ${isDone ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                      {isDone ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Play className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{v.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{v.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{v.duration_minutes} min</p>
                    </div>
                    <div className="flex gap-2">
                      {v.display_video && (
                        <a href={v.display_video} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">Watch</Button>
                        </a>
                      )}
                      {isDone ? (
                        <Button size="sm" variant="success" onClick={() => unmarkWatched(v.id)}>
                          Done
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => markWatched(v.id)}>
                          Mark Done
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ─── Assignments tab ─── */}
        {activeTab === 'assignments' && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <Card className="p-12 text-center">
                <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No assignments yet.</p>
              </Card>
            ) : (
              assignments.map((t) => (
                <Card
                  key={t.id}
                  className="p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 transition"
                  onClick={() => setOpenTask(t)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{t.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          t.status === 'completed'   ? 'bg-emerald-100 text-emerald-700'
                        : t.status === 'submitted'   ? 'bg-amber-100 text-amber-700'
                        : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700'
                        :                              'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status?.replace('_', ' ') || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                        {t.course_title && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">📘 {t.course_title}</span>}
                        {t.due_date && <span>Due {new Date(t.due_date).toLocaleDateString()}</span>}
                        {t.mentor_name && <span>👤 {t.mentor_name}</span>}
                        {t.priority && <span className="capitalize">{t.priority}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {t.grade ? (
                        <>
                          <p className="text-2xl font-bold text-emerald-600">{t.grade}</p>
                          <p className="text-xs text-slate-500">Grade</p>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setOpenTask(t); }}
                          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* ─── Exams tab ─── */}
        {activeTab === 'exams' && (
          <div className="space-y-3">
            {exams.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No exams published yet.</p>
              </Card>
            ) : (
              exams.map((ex) => (
                <Card key={ex.id} className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800">{ex.title}</h3>
                    <p className="text-sm text-slate-500">{ex.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                      <span>{ex.question_count} questions</span>
                      <span>{ex.duration_minutes} min</span>
                      <span>{ex.total_marks} marks</span>
                      {ex.best_score != null && (
                        <span className="text-emerald-600 font-semibold">Best: {ex.best_score}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/exam/${ex.id}`}>
                    <Button size="sm">{ex.passed ? 'View' : 'Start Exam'}</Button>
                  </Link>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Task detail modal */}
      {openTask && (
        <TaskDetailModal
          task={openTask}
          onClose={() => setOpenTask(null)}
          onUpdated={async () => {
            setOpenTask(null);
            await loadAll();
          }}
        />
      )}

      {/* ✅ Inline chat drawer — no mentor_id guard so it always mounts */}
      {showChat && (
        <InlineChatDrawer
          mentorId={course.mentor_id || course.mentor}
          mentorName={course.mentor_name || 'Mentor'}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

/* ============================================
   INLINE CHAT DRAWER
   ============================================ */
function InlineChatDrawer({ mentorId, mentorName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/auth/messages/${mentorId}/`);
      setMessages(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Could not load messages.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, [mentorId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/auth/messages/${mentorId}/`, { content: newMessage });
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      alert('Failed to send: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {mentorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate">{mentorName}</p>
              <p className="text-xs text-slate-500">Mentor · ID {mentorId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-8">Loading…</p>
          ) : error ? (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
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

        <div className="p-4 border-t border-slate-200 flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
          />
          <Button onClick={handleSend} isLoading={sending} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   TASK DETAIL MODAL
   ============================================ */
function TaskDetailModal({ task, onClose, onUpdated }) {
  const [submission, setSubmission] = useState(task.submission || '');
  const [submitting, setSubmitting] = useState(false);

  const isEditable = task.status !== 'completed';
  const alreadySubmitted = task.status === 'submitted' || task.status === 'completed';

  const handleSubmit = async () => {
    if (!submission.trim()) {
      alert('Please write your submission before sending.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/auth/tasks/${task.id}/`, { submission, status: 'submitted' });
      await onUpdated();
    } catch (err) {
      alert('Failed to submit: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/auth/tasks/${task.id}/`, { submission, status: 'in_progress' });
      await onUpdated();
    } catch (err) {
      alert('Failed to save draft.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                task.status === 'completed'   ? 'bg-emerald-100 text-emerald-700'
              : task.status === 'submitted'   ? 'bg-amber-100 text-amber-700'
              : task.status === 'in_progress' ? 'bg-blue-100 text-blue-700'
              :                              'bg-slate-100 text-slate-600'
              }`}>
                {task.status?.replace('_', ' ') || 'pending'}
              </span>
              {task.priority && (
                <span className="text-xs text-slate-500 capitalize">Priority: {task.priority}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {task.course_title && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>{task.course_title}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
          {task.mentor_name && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-purple-500" />
              <span>Assigned by {task.mentor_name}</span>
            </div>
          )}
          {task.video_title && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Play className="w-4 h-4 text-indigo-500" />
              <span>Related to: {task.video_title}</span>
            </div>
          )}
        </div>

        {task.description && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Instructions</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          </div>
        )}

        {alreadySubmitted && task.submission && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Your Submission</h4>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-900 whitespace-pre-wrap">{task.submission}</p>
            </div>
          </div>
        )}

        {task.feedback && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Mentor Feedback</h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{task.feedback}</p>
            </div>
          </div>
        )}

        {task.grade && (
          <div className="mb-5 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-900">
              <strong>Grade:</strong> {task.grade}
            </p>
          </div>
        )}

        {isEditable && !alreadySubmitted && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Your Submission</h4>
            <textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              rows="6"
              placeholder="Write your answer here…"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleSaveDraft} isLoading={submitting} className="flex-1">
                Save Draft
              </Button>
              <Button type="button" onClick={handleSubmit} isLoading={submitting} className="flex-1">
                <Send className="w-4 h-4" /> Submit
              </Button>
            </div>
          </div>
        )}

        {task.status === 'completed' && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-800 font-medium">
              This assignment is completed. Nice work!
            </p>
          </div>
        )}

        {task.status === 'submitted' && !task.grade && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800 font-medium">
              Waiting for your mentor to grade this submission.
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}