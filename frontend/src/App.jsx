import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import MentorDashboard from './pages/MentorDashboard';
import MentorCourseView from './pages/MentorCourseView';
import Browse from './pages/Browse';
import StudentExamView from './pages/StudentExamView';
import StudentTaskView from './pages/StudentTaskView';
import StudentCourseView from './pages/StudentCourseView';

function App() {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const isStudent = role === 'student';
  const isMentor = role === 'mentor';

  return (
    <Router>
      <Routes>
        {/* ============================================
            PUBLIC ROUTES
            ============================================ */}
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            token ? (
              <Navigate to={isMentor ? '/mentor' : '/dashboard'} replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/signup"
          element={
            token ? (
              <Navigate to={isMentor ? '/mentor' : '/dashboard'} replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* ============================================
            PROTECTED ROUTES
            ============================================ */}

        {/* Dashboard — students only */}
        <Route
          path="/dashboard"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isMentor ? (
              <Navigate to="/mentor" replace />
            ) : (
              <>
                <Navbar />
                <Dashboard />
              </>
            )
          }
        />

        {/* Mentor dashboard — mentors only */}
        <Route
          path="/mentor"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isStudent ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <Navbar />
                <MentorDashboard />
              </>
            )
          }
        />

        {/* Browse courses — anyone logged in */}
        <Route
          path="/browse"
          element={
            token ? (
              <>
                <Navbar />
                <Browse />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Student course view — students only */}
        <Route
          path="/mentor-course/:id"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isMentor ? (
              <Navigate to="/mentor" replace />
            ) : (
              <>
                <Navbar />
                <StudentCourseView />
              </>
            )
          }
        />

        {/* Legacy course detail — students only */}
        <Route
          path="/course/:id"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isMentor ? (
              <Navigate to="/mentor" replace />
            ) : (
              <>
                <Navbar />
                <CourseDetail />
              </>
            )
          }
        />

        {/* Student exam taking page — students only */}
        <Route
          path="/exam/:id"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isMentor ? (
              <Navigate to="/mentor" replace />
            ) : (
              <>
                <Navbar />
                <StudentExamView />
              </>
            )
          }
        />

        {/* Student task submission page — students only */}
        <Route
          path="/task/:id"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : isMentor ? (
              <Navigate to="/mentor" replace />
            ) : (
              <>
                <Navbar />
                <StudentTaskView />
              </>
            )
          }
        />

        {/* ============================================
            FALLBACK — redirect unknown routes to Home
            ============================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;