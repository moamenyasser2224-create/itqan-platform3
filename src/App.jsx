import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './auth/LoginPage';
import RegisterTeacher from './auth/RegisterTeacher';
import RegisterStudent from './auth/RegisterStudent';

import TeacherDashboard from './teacher/Dashboard';
import ClassManager from './teacher/ClassManager';
import ClassDetail from './teacher/ClassDetail';
import StudentsList from './teacher/StudentsList';

import StudentDashboard from './student/Dashboard';
import LessonViewer from './student/LessonViewer';
import Leaderboard from './student/Leaderboard';
import QuizAttempt from './student/QuizAttempt';

import ParentReport from './shared/ParentReport';
import ProtectedRoute from './shared/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter basename="/itqan-platform3">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-teacher" element={<RegisterTeacher />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/report/:studentId" element={<ParentReport />} />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRole="teacher">
              <ClassManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/:classId"
          element={
            <ProtectedRoute allowedRole="teacher">
              <ClassDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRole="teacher">
              <StudentsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes/:classId"
          element={
            <ProtectedRoute allowedRole="student">
              <LessonViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/leaderboard"
          element={
            <ProtectedRoute allowedRole="student">
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/:quizId"
          element={
            <ProtectedRoute allowedRole="student">
              <QuizAttempt />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
