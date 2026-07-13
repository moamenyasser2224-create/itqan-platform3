import Sidebar from '../shared/Sidebar';
import { classes, lessons } from '../data/mockData';

export default function LessonViewer() {
  const activeClass = classes[0];
  const classLessons = lessons.filter((l) => l.class_id === activeClass.id);

  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <div className="page-head">
          <h1>{activeClass.title}</h1>
          <p>{activeClass.description}</p>
        </div>

        <div className="card">
          {classLessons.map((l) => (
            <div className="list-row" key={l.id}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{l.title}</p>
                <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                  {l.type === 'recorded'
                    ? `${l.duration_minutes} دقيقة`
                    : `الحصة المباشرة: ${new Date(l.scheduled_at).toLocaleString('ar-EG')}`}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className={`badge ${l.type}`}>{l.type === 'recorded' ? 'مسجل' : 'لايف'}</span>
                <button className="btn btn-ghost">
                  {l.type === 'recorded' ? 'شاهد الدرس' : 'انضم للحصة'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
