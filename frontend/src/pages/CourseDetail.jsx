import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import {
  ArrowLeft, CheckCircle2, Circle, PlayCircle, FileText,
  Link as LinkIcon, Calendar, Clock, Users, BookOpen
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    api.get(`/courses/${id}/`)
      .then((res) => setCourse(res.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load course.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleComplete = async (materialId, isCurrentlyCompleted) => {
    // Optimistic update
    setCourse((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === materialId ? { ...m, is_completed: !isCurrentlyCompleted } : m
      ),
    }));

    try {
      await api.post(`/materials/${materialId}/toggle-complete/`);
      // Refresh progress from server
      const res = await api.get(`/courses/${id}/`);
      setCourse(res.data);
    } catch (err) {
      console.error(err);
      // Revert on failure
      setCourse((prev) => ({
        ...prev,
        materials: prev.materials.map((m) =>
          m.id === materialId ? { ...m, is_completed: isCurrentlyCompleted } : m
        ),
      }));
      alert('Failed to update. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-20 w-full mb-3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Course not found'}</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">← Back to courses</Link>
      </div>
    );
  }

  const completedCount = course.materials.filter((m) => m.is_completed).length;
  const totalCount = course.materials.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const tabs = [
    { id: 'materials', label: 'Study Materials', count: course.materials.length },
    { id: 'assignments', label: 'Assignments', count: course.assignments.length },
    { id: 'classes', label: 'Live Classes', count: course.classrooms.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      {/* Hero */}
      <Card className="overflow-hidden mb-8">
        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-700">
          {course.image && (
            <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            <h1 className="text-3xl font-bold mb-1">{course.title}</h1>
            <p className="text-white/80 text-sm line-clamp-2">{course.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-6 mb-5 text-sm">
            {course.faculty && (
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4" />
                <span>By <strong className="text-slate-900">{course.faculty.first_name || course.faculty.username}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="w-4 h-4" />
              <span>{totalCount} Materials</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{completedCount} of {totalCount} completed</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition relative ${
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'materials' && (
        <MaterialsTab materials={course.materials} onToggle={toggleComplete} />
      )}
      {activeTab === 'assignments' && <AssignmentsTab assignments={course.assignments} />}
      {activeTab === 'classes' && <ClassesTab classrooms={course.classrooms} />}
    </div>
  );
}

const MaterialsTab = ({ materials, onToggle }) => {
  if (materials.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-700 mb-1">No materials yet</h3>
        <p className="text-sm text-slate-500">Study materials will appear here once added.</p>
      </Card>
    );
  }

  const getIcon = (type) => {
    if (type === 'video') return <PlayCircle className="w-5 h-5 text-red-500" />;
    if (type === 'pdf') return <FileText className="w-5 h-5 text-amber-500" />;
    return <LinkIcon className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <Card key={material.id} className="p-4 flex items-center justify-between hover:shadow-md transition">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              {getIcon(material.type)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-800 truncate">{material.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="capitalize">{material.type}</span>
                {material.duration_minutes > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {material.duration_minutes} min
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">Open</Button>
            </a>
            <Button
              variant={material.is_completed ? 'success' : 'outline'}
              size="sm"
              onClick={() => onToggle(material.id, material.is_completed)}
            >
              {material.is_completed ? (
                <><CheckCircle2 className="w-4 h-4" /> Done</>
              ) : (
                <><Circle className="w-4 h-4" /> Mark done</>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const AssignmentsTab = ({ assignments }) => {
  if (assignments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-700 mb-1">No assignments yet</h3>
        <p className="text-sm text-slate-500">Assignments will appear here once published.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const due = new Date(a.due_date);
        const isOverdue = due < new Date() && a.status === 'pending';
        return (
          <Card key={a.id} className="p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{a.title}</h3>
                {a.description && (
                  <p className="text-sm text-slate-500 mt-1">{a.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due {due.toLocaleDateString()}
                  </span>
                  <span>Max score: {a.max_score}</span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                a.status === 'evaluated' ? 'bg-emerald-50 text-emerald-700' :
                a.status === 'submitted' ? 'bg-blue-50 text-blue-700' :
                isOverdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {isOverdue ? 'Overdue' : a.status_label}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const ClassesTab = ({ classrooms }) => {
  if (classrooms.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-700 mb-1">No live classes scheduled</h3>
        <p className="text-sm text-slate-500">You haven't been assigned to a classroom yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {classrooms.map((c) => {
        const date = new Date(c.scheduled_at);
        return (
          <Card key={c.id} className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{c.title}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {date.toLocaleString()}
              </p>
            </div>
            {c.meeting_link && (
              <a href={c.meeting_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Join</Button>
              </a>
            )}
          </Card>
        );
      })}
    </div>
  );
};