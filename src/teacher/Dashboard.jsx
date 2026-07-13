import Sidebar from '../shared/Sidebar';
import { currentUser, teacherProfile, classes, students } from '../data/mockData';

export default function TeacherDashboard() {
  const totalStudents = classes.reduce((sum, c) => sum + c.students_count, 0);

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="page-head">
          <h1>أهلًا، {currentUser.full_name}</h1>
          <p>
            الاشتراك: نشط حتى {teacherProfile.subscription_expires_at} — {teacherProfile.subject}
          </p>
        </div>

        <div className="grid cols-4" style={{ marginBottom: 28 }}>
          <div className="card stat">
            <div className="label">إجمالي الطلاب</div>
            <div className="value">{totalStudents}</div>
          </div>
          <div className="card stat">
            <div className="label">عدد الصفوف</div>
            <div className="value">{classes.length}</div>
          </div>
          <div className="card stat">
            <div className="label">الدروس المرفوعة</div>
            <div className="value">{classes.reduce((s, c) => s + c.lessons_count, 0)}</div>
          </div>
          <div className="card stat">
            <div className="label">متوسط التقدم</div>
            <div className="value">
              {Math.round(students.reduce((s, st) => s + st.progress_percent, 0) / students.length)}%
            </div>
          </div>
        </div>

        <div className="grid cols-2">
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: 17 }}>صفوفي</h3>
            {classes.map((c) => (
              <div className="list-row" key={c.id}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14.5 }}>{c.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                    {c.students_count} طالب · {c.lessons_count} درس
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: 17 }}>آخر نشاط للطلاب</h3>
            {students.map((s) => (
              <div className="list-row" key={s.id}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14.5 }}>{s.full_name}</p>
                  <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>{s.last_active}</p>
                </div>
                <div className="progress-bar">
                  <div style={{ width: `${s.progress_percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
