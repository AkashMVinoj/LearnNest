import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Send, CheckCircle, ClipboardList } from 'lucide-react';

export default function StudentTaskView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/auth/tasks/')
      .then((res) => {
        const found = res.data.find((t) => t.id === parseInt(id));
        setTask(found);
        if (found?.submission) setSubmission(found.submission);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const submitTask = async () => {
    if (!submission.trim()) {
      alert('Please write something before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/auth/tasks/${id}/`, {
        submission: submission,
        status: 'submitted',
      });
      setSuccess(true);
    } catch (err) {
      alert('Failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="max-w-3xl mx-auto px-4 py-12">Loading...</p>;
  if (!task) return <p className="max-w-3xl mx-auto px-4 py-12 text-red-600">Task not found.</p>;

  if (success || task.status === 'submitted' || task.status === 'completed') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {task.status === 'completed' ? 'Task Completed!' : 'Task Submitted!'}
          </h2>
          <p className="text-slate-500 mb-6">
            {task.status === 'completed'
              ? 'Your mentor has reviewed your submission.'
              : 'Your mentor will review your submission soon.'}
          </p>
          {task.feedback && (
            <div className="bg-emerald-50 p-4 rounded-lg text-left mb-4">
              <p className="text-xs font-medium text-emerald-800 mb-1">Mentor Feedback:</p>
              <p className="text-sm text-emerald-700">{task.feedback}</p>
              {task.grade && <p className="text-sm font-bold text-emerald-800 mt-2">Grade: {task.grade}</p>}
            </div>
          )}
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
            <p className="text-slate-600 mt-2">{task.description}</p>
            {task.video_title && (
              <p className="text-xs text-slate-500 mt-2">📹 Related to: {task.video_title}</p>
            )}
            {task.due_date && (
              <p className="text-xs text-slate-500 mt-1">
                📅 Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Submission
        </label>
        <textarea
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          rows="8"
          placeholder="Type your answer or paste a link to your work..."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 resize-none"
        />
        <div className="flex justify-end mt-4">
          <Button onClick={submitTask} isLoading={submitting}>
            <Send className="w-4 h-4" /> Submit Task
          </Button>
        </div>
      </Card>
    </div>
  );
}