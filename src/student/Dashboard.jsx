import { Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { studentEnrolledClasses } from '../data/mockData';

export default function StudentDashboard() {
  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <div className="page-head">
          <h1>صفوفي</h1>
          <p>تابع دروسك المسجلة والحصص المباشرة</p>
        </div>

        <div className="grid cols-2">
          {studentEnrolledClasses.map((c) => (
            <Link to="/student/classes" key={c.id} style={{ textDecoration: 'none' }}>
              <div className="card">
                <h3 style={{ fontSize: 17, marginBottom: 6 }}>{c.title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(27,26,23,.62)', marginBottom: 16 }}>
                  {c.teacher_name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="progress-bar" style={{ width: '100%' }}>
                    <div style={{ width: `${c.progress_percent}%` }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.progress_percent}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
