import Sidebar from '../shared/Sidebar';
import { classes, lessons } from '../data/mockData';

export default function ClassManager() {
  const activeClass = classes[0];
  const classLessons = lessons.filter((l) => l.class_id === activeClass.id);

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>{activeClass.title}</h1>
            <p>{activeClass.description}</p>
          </div>
          <button className="btn btn-primary">+ إضافة درس جديد</button>
        </div>

        <div className="card">
          {classLessons.map((l) => (
            <div className="list-row" key={l.id}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{l.title}</p>
                <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                  {l.type === 'recorded'
                    ? `${l.duration_minutes} دقيقة`
                    : `مجدول: ${new Date(l.scheduled_at).toLocaleString('ar-EG')}`}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className={`badge ${l.type}`}>{l.type === 'recorded' ? 'مسجل' : 'لايف'}</span>
                <div className="progress-bar">
                  <div style={{ width: `${l.completed_by_percent}%` }} />
                </div>
                <span style={{ fontSize: 13, minWidth: 34 }}>{l.completed_by_percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
