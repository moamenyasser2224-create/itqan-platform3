import { useEffect, useState } from 'react';
import Sidebar from '../shared/Sidebar';
import { SkeletonRow } from '../shared/Skeleton';
import { supabase } from '../api/supabaseClient';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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

    const { data: myClasses } = await supabase
      .from('classes')
      .select('id, title')
      .eq('teacher_id', tProfile.id);

    const classIds = (myClasses || []).map((c) => c.id);
    if (classIds.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id, class_id, profiles(full_name)')
      .in('class_id', classIds);

    const classTitleMap = Object.fromEntries((myClasses || []).map((c) => [c.id, c.title]));
    setStudents(
      (enrollments || []).map((e) => ({
        id: e.student_id,
        full_name: e.profiles?.full_name || 'طالب',
        class_title: classTitleMap[e.class_id],
      }))
    );
    setLoading(false);
  }

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="page-head">
          <h1>الطلاب</h1>
          <p>الطلاب المشتركين في صفوفك</p>
        </div>

        <div className="card">
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : students.length === 0 ? (
            <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>لسه مفيش طلاب مشتركين في صفوفك.</p>
          ) : (
            students.map((s, i) => (
              <div className="list-row" key={i}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14.5 }}>{s.full_name}</p>
                  <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>{s.class_title}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
