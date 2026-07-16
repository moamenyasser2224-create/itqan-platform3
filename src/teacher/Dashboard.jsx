import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import Avatar from '../shared/Avatar';
import { SkeletonStats, SkeletonRow } from '../shared/Skeleton';
import { supabase } from '../api/supabaseClient';

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setLoading(false);
      return;
    }
    setUserId(authData.user.id);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    setProfile(profileData);

    const { data: tProfile } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    setTeacherProfile(tProfile);

    if (tProfile) {
      const { data: classList } = await supabase
        .from('classes')
        .select('*, lessons(count), enrollments(count)')
        .eq('teacher_id', tProfile.id)
        .order('created_at', { ascending: false });

      setClasses(classList || []);

      const totalLessons = (classList || []).reduce(
        (sum, c) => sum + (c.lessons?.[0]?.count || 0),
        0
      );
      const totalStudents = (classList || []).reduce(
        (sum, c) => sum + (c.enrollments?.[0]?.count || 0),
        0
      );
      setLessonsCount(totalLessons);
      setStudentsCount(totalStudents);
    }

    setLoading(false);
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      alert('لازم ترفع صورة بس.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة أكبر من 5 ميجا.');
      return;
    }

    setUploading(true);
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) {
      alert('حصل خطأ في رفع الصورة: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.from('profiles').update({ avatar_url: publicUrl.publicUrl }).eq('id', userId);

    setUploading(false);
    load();
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar role="teacher" />
        <main className="main">
          <div className="skeleton" style={{ height: 28, width: 220, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: 300, marginBottom: 28 }} />
          <SkeletonStats count={4} />
          <div className="card">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="topbar">
          <div className="headline">
            <h1>أهلًا، {profile?.full_name || 'معلم'}</h1>
            <p>
              {teacherProfile
                ? `${teacherProfile.subject || ''} — الاشتراك: ${
                    teacherProfile.subscription_status === 'trial' ? 'فترة تجربة' : 'نشط'
                  }`
                : 'استكمل بيانات حسابك للبدء'}
            </p>
          </div>

          <div className="avatar-upload">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} />
            <label className="upload-btn">
              {uploading ? 'جاري الرفع...' : profile?.avatar_url ? 'تغيير الصورة' : 'إضافة صورة شخصية'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid cols-4" style={{ marginBottom: 28 }}>
          <div className="card stat">
            <div className="label">إجمالي الطلاب</div>
            <div className="value">{studentsCount}</div>
          </div>
          <div className="card stat">
            <div className="label">عدد الصفوف</div>
            <div className="value">{classes.length}</div>
          </div>
          <div className="card stat">
            <div className="label">الدروس المرفوعة</div>
            <div className="value">{lessonsCount}</div>
          </div>
          <div className="card stat">
            <div className="label">حالة الاشتراك</div>
            <div className="value" style={{ fontSize: 20 }}>
              {teacherProfile?.subscription_status === 'trial' ? 'تجربة' : 'نشط'}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 17 }}>صفوفي</h3>
            <Link to="/teacher/classes" className="btn btn-primary">
              + صف جديد
            </Link>
          </div>

          {classes.length === 0 ? (
            <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>
              لسه معملتش أي صف. دوس "+ صف جديد" وابدأ.
            </p>
          ) : (
            classes.map((c) => (
              <Link to={`/teacher/classes/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="list-row">
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14.5 }}>{c.title}</p>
                    <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>
                      {c.enrollments?.[0]?.count || 0} طالب · {c.lessons?.[0]?.count || 0} درس
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
