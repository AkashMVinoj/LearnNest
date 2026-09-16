import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft, FileText, CheckCircle, XCircle, Trophy, AlertCircle
} from 'lucide-react';

export default function StudentExamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadData = async () => {
    try {
      const [examRes, attRes] = await Promise.all([
        api.get(`/auth/exams/${id}/`),
        api.get(`/auth/exams/${id}/my-attempts/`).catch(() => ({ data: [] })),
      ]);
      setExam(examRes.data);
      setQuestions(examRes.data.questions || []);
      setAttempts(attRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAnswer = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const submitExam = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/auth/exams/${id}/submit/`, { answers });
      setResult(res.data);
      await loadData();
    } catch (err) {
      alert('Failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setSubmitting(false);
    }
  };

  const startRetest = () => {
    setAnswers({});
    setResult(null);
  };

  if (loading) return <p className="max-w-4xl mx-auto px-4 py-12 text-slate-500">Loading exam...</p>;
  if (!exam) return <p className="max-w-4xl mx-auto px-4 py-12 text-red-600">Exam not found.</p>;

  const passedAttempt = attempts.find(a => a.passed);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Exam Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
            {exam.course_title && <p className="text-sm text-slate-500">{exam.course_title}</p>}
          </div>
        </div>
        {exam.description && <p className="text-slate-600 mt-3">{exam.description}</p>}
        <div className="flex flex-wrap gap-6 mt-4 text-sm text-slate-600">
          <span>📝 {questions.length} questions</span>
          <span>⏱ {exam.duration_minutes} min</span>
          <span>🎯 {exam.total_marks} marks</span>
          <span>✅ Passing: 60%</span>
        </div>
      </Card>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card className="p-5 mb-6">
          <h3 className="font-bold text-slate-900 mb-3">Your Attempts</h3>
          <div className="space-y-2">
            {attempts.map((a) => {
              const pct = exam.total_marks > 0 ? Math.round((a.score / exam.total_marks) * 100) : 0;
              return (
                <div key={a.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    {a.passed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium text-slate-700">Attempt #{a.attempt_number}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(a.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  <span className={`font-bold ${a.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {a.score} / {exam.total_marks} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Result Banner */}
      {result && (
        <Card className={`p-6 mb-6 border-2 ${result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-4">
            {result.passed ? (
              <Trophy className="w-12 h-12 text-emerald-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-600" />
            )}
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${result.passed ? 'text-emerald-800' : 'text-red-800'}`}>
                {result.passed ? '🎉 You passed!' : 'You did not pass'}
              </h3>
              <p className="text-sm mt-1">
                Score: <strong>{result.score} / {result.total_possible}</strong> — Attempt #{result.attempt_number}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Exam Body */}
      {!result && !passedAttempt && (
        <>
          <div className="space-y-4 mb-6">
            {questions.map((q, idx) => (
              <Card key={q.id} className="p-5">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-3">{q.question_text}</p>
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const optKey = `option_${opt.toLowerCase()}`;
                        const isSelected = answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswer(q.id, opt)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg border transition ${
                              isSelected
                                ? 'bg-blue-50 border-blue-400 text-blue-800 font-medium'
                                : 'bg-white border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <strong className="mr-2">{opt}.</strong> {q[optKey]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Answered: <strong className="text-slate-900">{Object.keys(answers).length} / {questions.length}</strong>
            </div>
            <Button onClick={submitExam} isLoading={submitting} disabled={questions.length === 0}>
              Submit Exam
            </Button>
          </Card>
        </>
      )}

      {/* Retake Button */}
      {!result && !passedAttempt && attempts.length > 0 && (
        <Card className="p-6 text-center mt-6">
          <p className="text-slate-600 mb-4">
            You can retake the exam. Your best score will be kept.
          </p>
          <Button onClick={startRetest}>Start New Attempt</Button>
        </Card>
      )}

      {/* Passed Banner */}
      {passedAttempt && (
        <Card className="p-8 text-center bg-emerald-50 border-emerald-200">
          <Trophy className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-800 mb-2">You passed this exam!</h3>
          <p className="text-emerald-700">
            Best score: <strong>{passedAttempt.score} / {exam.total_marks}</strong>
          </p>
          <Link to="/dashboard" className="inline-block mt-4">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}