import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { SkeletonCard } from '../shared/Skeleton';
import EmptyState from '../shared/EmptyState';
import { supabase } from '../api/supabaseClient';

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return setLoading(false);

    const { data: tProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (!tProfile) return setLoading(false);
    setTeacherId(tProfile.id);

    const { data: classList } = await supabase
      .from('classes')
      .select('*, lessons(count), enrollments(count)')
      .eq('teacher_id', tProfile.id)
      .order('created_at', { ascending: false });

    setClasses(classList || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const title = e.target.title.value;
    const description = e.target.description.value;

    const { error } = await supabase.from('classes').insert({
      teacher_id: teacherId,
      title,
      description,
    });

    setSaving(false);
    if (!error) {
      setShowForm(false);
      e.target.reset();
      load();
    }
  }

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>صفوفي</h1>
            <p>أنشئ صفوفك وأضف الدروس فيها</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'إلغاء' : '+ صف جديد'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>اسم الصف</label>
                <input name="title" type="text" placeholder="مثال: الجبر - الصف الثالث الثانوي" required />
              </div>
              <div className="field">
                <label>وصف مختصر</label>
                <input name="description" type="text" placeholder="عن إيه الصف ده؟" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'إنشاء الصف'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : classes.length === 0 ? (
          <div className="card">
            <EmptyState
              title="لسه معملتش صفوف"
              subtitle="ابدأ بإنشاء أول صف ليك وشوفه هنا"
              action={
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  + صف جديد
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid cols-2">
            {classes.map((c) => (
              <Link to={`/teacher/classes/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="card">
                  <h3 style={{ fontSize: 17, marginBottom: 6 }}>{c.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'rgba(27,26,23,.62)', marginBottom: 14 }}>
                    {c.description || 'بدون وصف'}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>
                    {c.enrollments?.[0]?.count || 0} طالب · {c.lessons?.[0]?.count || 0} درس
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
