import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { supabase } from '../api/supabaseClient';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [myClasses, setMyClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolling, setEnrolling] = useState(null);

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
      .select('class_id, classes(*, teacher_profiles(subject, profiles(full_name)))')
      .eq('student_id', authData.user.id);

    const enrolledIds = (enrollments || []).map((e) => e.class_id);
    setMyClasses(enrollments || []);

    const { data: allClasses } = await supabase
      .from('classes')
      .select('*, teacher_profiles(subject, profiles(full_name))');

    setAvailableClasses((allClasses || []).filter((c) => !enrolledIds.includes(c.id)));
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
          <h1>صفوفي</h1>
          <p>تابع دروسك المسجلة والحصص المباشرة</p>
        </div>

        {myClasses.length > 0 && (
          <div className="grid cols-2" style={{ marginBottom: 32 }}>
            {myClasses.map(({ classes: c }) => (
              <Link to={`/student/classes/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="card">
                  <h3 style={{ fontSize: 17, marginBottom: 6 }}>{c.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'rgba(27,26,23,.62)' }}>
                    {c.teacher_profiles?.profiles?.full_name || 'المعلم'}
                  </p>
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
            <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>مفيش صفوف متاحة دلوقتي.</p>
          </div>
        ) : (
          <div className="grid cols-2">
            {availableClasses.map((c) => (
              <div className="card" key={c.id}>
                <h3 style={{ fontSize: 17, marginBottom: 6 }}>{c.title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(27,26,23,.62)', marginBottom: 14 }}>
                  {c.teacher_profiles?.profiles?.full_name || 'المعلم'} · {c.teacher_profiles?.subject}
                </p>
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
