import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function ParentReport() {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    load();
  }, [studentId]);

  async function load() {
    setLoading(true);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single();
    setProfile(profileData);

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('classes(id, title, lessons(count))')
      .eq('student_id', studentId);

    const result = [];
    for (const e of enrollments || []) {
      const c = e.classes;
      const totalLessons = c.lessons?.[0]?.count || 0;

      const { count: completedCount } = await supabase
        .from('lesson_progress')
        .select('id, lessons!inner(class_id)', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('completed', true)
        .eq('lessons.class_id', c.id);

      const { data: watchedData } = await supabase
        .from('lesson_progress')
        .select('watched_seconds, lessons!inner(class_id)')
        .eq('student_id', studentId)
        .eq('lessons.class_id', c.id);

      const totalSeconds = (watchedData || []).reduce((s, w) => s + (w.watched_seconds || 0), 0);

      result.push({
        title: c.title,
        totalLessons,
        completed: completedCount || 0,
        hours: Math.round((totalSeconds / 3600) * 10) / 10,
      });
    }

    setClasses(result);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p>جاري تحميل التقرير...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px' }}>
      <div className="card">
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>تقرير المتابعة</h1>
        <p style={{ color: 'rgba(27,26,23,.6)', marginBottom: 28 }}>
          الطالب: {profile?.full_name || '—'}
        </p>

        {classes.length === 0 ? (
          <p style={{ color: 'rgba(27,26,23,.6)' }}>الطالب مش مشترك في أي صف لسه.</p>
        ) : (
          classes.map((c, i) => {
            const percent = c.totalLessons ? Math.round((c.completed / c.totalLessons) * 100) : 0;
            return (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontWeight: 700, marginBottom: 8 }}>{c.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div className="progress-bar" style={{ width: 200 }}>
                    <div style={{ width: `${percent}%` }} />
                  </div>
                  <span style={{ fontSize: 13 }}>{percent}% مكتمل</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                  {c.completed} من {c.totalLessons} درس · {c.hours} ساعة مذاكرة
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
