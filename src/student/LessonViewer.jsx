import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { supabase } from '../api/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';
import Community from '../shared/Community';
import Challenges from '../shared/Challenges';

export default function LessonViewer() {
  const { classId } = useParams();
  const { t } = useLanguage();
  const [classInfo, setClassInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
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

    const { data: materialList } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    setMaterials(materialList || []);

    const { data: quizList } = await supabase
      .from('quizzes')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    setQuizzes(quizList || []);

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
          <p>{t('loading')}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <Link
          to="/student"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginBottom: 18, textDecoration: 'none' }}
        >
          ← رجوع لصفوفي
        </Link>
        <div className="page-head">
          <h1>{classInfo?.title}</h1>
          <p>{classInfo?.description}</p>
        </div>

        {playingLesson && (
          <div
            className="card fade-in"
            style={{ marginBottom: 24, padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}
          >
            {playingLesson.video_url ? (
              <video
                key={playingLesson.id}
                src={playingLesson.video_url}
                controls
                autoPlay
                style={{ width: '100%', display: 'block', maxHeight: 460, background: '#000' }}
                onEnded={() => markWatched(playingLesson)}
              />
            ) : (
              <p style={{ padding: 20 }}>مفيش فيديو مرفوع للدرس ده لسه.</p>
            )}
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>{t('materialsAndFiles')}</h3>
          {materials.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>{t('noMaterials')}</p>
          ) : (
            materials.map((m) => (
              <div className="list-row" key={m.id}>
                <p style={{ fontWeight: 700, fontSize: 14.5 }}>{m.title}</p>
                <a className="btn btn-ghost" href={m.file_url} target="_blank" rel="noreferrer">
                  {t('download')}
                </a>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          {lessons.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>لسه مفيش دروس في الصف ده.</p>
          ) : (
            lessons.map((l) => (
              <div className="list-row" key={l.id}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{l.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {l.type === 'recorded'
                      ? 'درس مسجل'
                      : `الحصة المباشرة: ${new Date(l.live_scheduled_at).toLocaleString('ar-EG')}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className={`badge ${l.type}`}>{l.type === 'recorded' ? 'مسجل' : 'لايف'}</span>
                  {l.type === 'recorded' ? (
                    <button className="btn btn-ghost" onClick={() => setPlayingLesson(l)}>
                      {t('watchLesson')}
                    </button>
                  ) : (
                    <button className="btn btn-ghost" disabled>
                      {t('joinLive')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {quizzes.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>الامتحانات</h3>
            {quizzes.map((q) => (
              <div className="list-row" key={q.id}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14.5 }}>{q.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{q.duration_minutes} دقيقة</p>
                </div>
                <Link to={`/student/quiz/${q.id}`} className="btn btn-primary">
                  ابدأ الامتحان
                </Link>
              </div>
            ))}
          </div>
        )}

        <Challenges classId={classId} isTeacher={false} />
        <Community classId={classId} />
      </main>
    </div>
  );
}
