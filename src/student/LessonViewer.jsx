import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { supabase } from '../api/supabaseClient';

export default function LessonViewer() {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingLesson, setPlayingLesson] = useState(null);

  useEffect(() => {
    load();
  }, [classId]);

  async function load() {
    setLoading(true);
    const { data: cls } = await supabase.from('classes').select('*').eq('id', classId).single();
    setClassInfo(cls);

    const { data: lessonList } = await supabase
      .from('lessons')
      .select('*')
      .eq('class_id', classId)
      .order('order_index', { ascending: true });
    setLessons(lessonList || []);
    setLoading(false);
  }

  async function markWatched(lesson) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    await supabase.from('lesson_progress').upsert(
      {
        student_id: authData.user.id,
        lesson_id: lesson.id,
        completed: true,
        last_watched_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,lesson_id' }
    );
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar role="student" />
        <main className="main">
          <p>جاري التحميل...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <div className="page-head">
          <h1>{classInfo?.title}</h1>
          <p>{classInfo?.description}</p>
        </div>

        {playingLesson && (
          <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            {playingLesson.video_url ? (
              <video
                src={playingLesson.video_url}
                controls
                style={{ width: '100%', display: 'block', maxHeight: 460 }}
                onEnded={() => markWatched(playingLesson)}
              />
            ) : (
              <p style={{ padding: 20 }}>مفيش فيديو مرفوع للدرس ده لسه.</p>
            )}
          </div>
        )}

        <div className="card">
          {lessons.length === 0 ? (
            <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>لسه مفيش دروس في الصف ده.</p>
          ) : (
            lessons.map((l) => (
              <div className="list-row" key={l.id}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{l.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                    {l.type === 'recorded'
                      ? 'درس مسجل'
                      : `الحصة المباشرة: ${new Date(l.live_scheduled_at).toLocaleString('ar-EG')}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className={`badge ${l.type}`}>{l.type === 'recorded' ? 'مسجل' : 'لايف'}</span>
                  {l.type === 'recorded' ? (
                    <button className="btn btn-ghost" onClick={() => setPlayingLesson(l)}>
                      شاهد الدرس
                    </button>
                  ) : (
                    <button className="btn btn-ghost" disabled>
                      انضم للحصة
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
