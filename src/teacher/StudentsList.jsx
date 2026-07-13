import Sidebar from '../shared/Sidebar';
import { students } from '../data/mockData';

export default function StudentsList() {
  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="page-head">
          <h1>الطلاب</h1>
          <p>متابعة تقدم كل طالب في صفوفك</p>
        </div>

        <div className="card">
          {students.map((s) => (
            <div className="list-row" key={s.id}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14.5 }}>{s.full_name}</p>
                <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>آخر نشاط: {s.last_active}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="progress-bar">
                  <div style={{ width: `${s.progress_percent}%` }} />
                </div>
                <span style={{ fontSize: 13, minWidth: 34 }}>{s.progress_percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
