import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

export default function Challenges({ classId, isTeacher }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myProgress, setMyProgress] = useState({});

  useEffect(() => {
    load();
  }, [classId]);

  async function load() {
    setLoading(true);
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('class_id', classId)
      .gte('ends_at', now)
      .order('ends_at', { ascending: true });
    setChallenges(data || []);

    if (!isTeacher) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const progressMap = {};
        for (const c of data || []) {
          const { count } = await supabase
            .from('lesson_progress')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', authData.user.id)
            .eq('completed', true)
            .gte('last_watched_at', c.starts_at)
            .lte('last_watched_at', c.ends_at);
          progressMap[c.id] = count || 0;
        }
        setMyProgress(progressMap);
      }
    }
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const title = e.target.title.value;
    const description = e.target.description.value;
    const period = e.target.period.value;
    const target_lessons = Number(e.target.target_lessons.value);

    const ends_at = new Date();
    ends_at.setDate(ends_at.getDate() + (period === 'daily' ? 1 : 7));

    const { error } = await supabase.from('challenges').insert({
      class_id: classId,
      title,
      description,
      period,
      target_lessons,
      ends_at: ends_at.toISOString(),
    });

    setSaving(false);
    if (!error) {
      setShowForm(false);
      e.target.reset();
      load();
    }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 16 }}>التحديات</h3>
        {isTeacher && (
          <button className="btn btn-ghost" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'إلغاء' : '+ تحدي جديد'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
          <div className="field">
            <label>عنوان التحدي</label>
            <input name="title" type="text" placeholder="مثال: أنهِ 3 دروس الأسبوع ده" required />
          </div>
          <div className="field">
            <label>وصف قصير</label>
            <input name="description" type="text" placeholder="اختياري" />
          </div>
          <div className="field">
            <label>المدة</label>
            <select name="period">
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
            </select>
          </div>
          <div className="field">
            <label>عدد الدروس المطلوبة</label>
            <input name="target_lessons" type="number" min="1" defaultValue="3" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'إنشاء التحدي'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="skeleton" style={{height:13,width:120}} />
      ) : challenges.length === 0 ? (
        <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>لا يوجد تحديات نشطة حاليًا.</p>
      ) : (
        challenges.map((c) => {
          const progress = myProgress[c.id] || 0;
          const percent = Math.min(100, Math.round((progress / c.target_lessons) * 100));
          return (
            <div className="list-row" key={c.id}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14.5 }}>{c.title}</p>
                <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                  {c.period === 'daily' ? 'يومي' : 'أسبوعي'} · حتى {new Date(c.ends_at).toLocaleDateString('ar-EG')}
                </p>
              </div>
              {!isTeacher && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="progress-bar">
                    <div style={{ width: `${percent}%` }} />
                  </div>
                  <span style={{ fontSize: 12.5 }}>
                    {progress}/{c.target_lessons}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
