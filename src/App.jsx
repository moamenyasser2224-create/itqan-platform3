import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './auth/LoginPage';
import RegisterTeacher from './auth/RegisterTeacher';
import RegisterStudent from './auth/RegisterStudent';

import TeacherDashboard from './teacher/Dashboard';
import ClassManager from './teacher/ClassManager';
import StudentsList from './teacher/StudentsList';

import StudentDashboard from './student/Dashboard';
import LessonViewer from './student/LessonViewer';

export default function App() {
  return (
    <BrowserRouter basename="/itqan-platform3">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-teacher" element={<RegisterTeacher />} />
        <Route path="/register-student" element={<RegisterStudent />} />

        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<ClassManager />} />
        <Route path="/teacher/students" element={<StudentsList />} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/classes" element={<LessonViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
