import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import Avatar from '../shared/Avatar';
import { SkeletonCard } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { supabase } from '../api/supabaseClient';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [myClasses, setMyClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolling, setEnrolling] = useState(null);
  const [studyPlan, setStudyPlan] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return setLoading(false);
    setUserId(authData.user.id);

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('class_id, classes(*, teacher_profiles(subject, profiles(full_name, avatar_url)))')
      .eq('student_id', authData.user.id);

    const enrolledIds = (enrollments || []).map((e) => e.class_id);
    setMyClasses(enrollments || []);

    const { data: allClasses } = await supabase
      .from('classes')
      .select('*, teacher_profiles(subject, profiles(full_name, avatar_url))');

    setAvailableClasses((allClasses || []).filter((c) => !enrolledIds.includes(c.id)));

    // خطة المذاكرة اليومية: أقرب 3 دروس لسه معملهاش الطالب من صفوفه
    if (enrolledIds.length > 0) {
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, title, class_id, classes(title)')
        .in('class_id', enrolledIds)
        .order('order_index', { ascending: true });

      const { data: completedProgress } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', authData.user.id)
        .eq('completed', true);

      const completedIds = new Set((completedProgress || []).map((p) => p.lesson_id));
      const remaining = (allLessons || []).filter((l) => !completedIds.has(l.id)).slice(0, 3);
      setStudyPlan(remaining);
    }

    setLoading(false);
  }

  async function handleEnroll(classId) {
    setEnrolling(classId);
    const { error } = await supabase.from('enrollments').insert({
      student_id: userId,
      class_id: classId,
    });
    setEnrolling(null);
    if (!error) load();
    else alert('حصل خطأ: ' + error.message);
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar role="student" />
        <main className="main">
          <div className="skeleton" style={{ height: 28, width: 180, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: 260, marginBottom: 28 }} />
          <div className="grid cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>صفوفي</h1>
            <p>تابع دروسك المسجلة والحصص المباشرة</p>
          </div>
          <Link to="/student/leaderboard" className="btn btn-ghost">🏆 لوحة الترتيب</Link>
        </div>

        {studyPlan.length > 0 && (
          <div className="card" style={{ marginBottom: 28, borderColor: 'var(--gold)' }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>📅 خطة مذاكرة اليوم</h3>
            {studyPlan.map((l) => (
              <Link
                to={`/student/classes/${l.class_id}`}
                key={l.id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="list-row">
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14.5 }}>{l.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>{l.classes?.title}</p>
                  </div>
                  <span className="btn btn-ghost" style={{ pointerEvents: 'none' }}>
                    ابدأ
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {myClasses.length > 0 && (
          <div className="grid cols-2" style={{ marginBottom: 32 }}>
            {myClasses.map(({ classes: c }) => (
              <Link to={`/student/classes/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="card">
                  <h3 style={{ fontSize: 17, marginBottom: 10 }}>{c.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar
                      size="sm"
                      src={c.teacher_profiles?.profiles?.avatar_url}
                      name={c.teacher_profiles?.profiles?.full_name}
                    />
                    <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                      {c.teacher_profiles?.profiles?.full_name || 'المعلم'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="page-head">
          <h1 style={{ fontSize: 20 }}>صفوف متاحة للاشتراك</h1>
        </div>

        {availableClasses.length === 0 ? (
          <div className="card">
            <EmptyState title="مفيش صفوف متاحة دلوقتي" subtitle="تابعنا، صفوف جديدة بتضاف باستمرار" />
          </div>
        ) : (
          <div className="grid cols-2">
            {availableClasses.map((c) => (
              <div className="card" key={c.id}>
                <h3 style={{ fontSize: 17, marginBottom: 10 }}>{c.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Avatar
                    size="sm"
                    src={c.teacher_profiles?.profiles?.avatar_url}
                    name={c.teacher_profiles?.profiles?.full_name}
                  />
                  <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                    {c.teacher_profiles?.profiles?.full_name || 'المعلم'} · {c.teacher_profiles?.subject}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleEnroll(c.id)}
                  disabled={enrolling === c.id}
                >
                  {enrolling === c.id ? 'جاري الاشتراك...' : 'اشترك في الصف'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
