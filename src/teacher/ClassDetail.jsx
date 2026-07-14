import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { supabase } from '../api/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';
import Community from '../shared/Community';
import Challenges from '../shared/Challenges';
import QuizManager from './QuizManager';

export default function ClassDetail() {
  const { classId } = useParams();
  const { t } = useLanguage();
  const [classInfo, setClassInfo] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [lessonType, setLessonType] = useState('recorded');

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

    setLoading(false);
  }

  async function handleAddLesson(e) {
    e.preventDefault();
    setSaving(true);

    const title = e.target.title.value;
    const type = lessonType;

    let payload = {
      class_id: classId,
      title,
      type,
      order_index: lessons.length,
    };

    if (type === 'recorded') {
      const file = e.target.video?.files?.[0];
      if (file) {
        const maxSizeMB = 500;
        if (!file.type.startsWith('video/')) {
          alert('لازم ترفع ملف فيديو بس.');
          setSaving(false);
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`حجم الفيديو أكبر من ${maxSizeMB} ميجا. اضغطه وحاول تاني.`);
          setSaving(false);
          return;
        }
        setUploadProgress('جاري رفع الفيديو...');
        const filePath = `${classId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('lesson-videos')
          .upload(filePath, file);

        if (uploadError) {
          alert('حصل خطأ في رفع الفيديو: ' + uploadError.message);
          setSaving(false);
          setUploadProgress('');
          return;
        }

        const { data: publicUrl } = supabase.storage.from('lesson-videos').getPublicUrl(filePath);
        payload.video_url = publicUrl.publicUrl;
      }
      setUploadProgress('');
    } else {
      payload.live_scheduled_at = e.target.scheduled_at.value;
    }

    const { error } = await supabase.from('lessons').insert(payload);
    setSaving(false);

    if (!error) {
      setShowForm(false);
      e.target.reset();
      load();
    } else {
      alert('حصل خطأ: ' + error.message);
    }
  }

  async function handleAddMaterial(e) {
    e.preventDefault();
    setSavingMaterial(true);

    const title = e.target.title.value;
    const file = e.target.file.files?.[0];

    if (!file) {
      setSavingMaterial(false);
      return;
    }

    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`حجم الملف أكبر من ${maxSizeMB} ميجا.`);
      setSavingMaterial(false);
      return;
    }

    const filePath = `${classId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('materials').upload(filePath, file);

    if (uploadError) {
      alert('حصل خطأ في رفع الملف: ' + uploadError.message);
      setSavingMaterial(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from('materials').getPublicUrl(filePath);

    const { error } = await supabase.from('materials').insert({
      class_id: classId,
      title,
      file_url: publicUrl.publicUrl,
      file_type: file.type,
    });

    setSavingMaterial(false);

    if (!error) {
      setShowMaterialForm(false);
      e.target.reset();
      load();
    } else {
      alert('حصل خطأ: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar role="teacher" />
        <main className="main">
          <p>{t('loading')}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />
      <main className="main">
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>{classInfo?.title}</h1>
            <p>{classInfo?.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setShowMaterialForm((s) => !s)}>
              {showMaterialForm ? t('cancel') : t('addMaterial')}
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? t('cancel') : t('addLesson')}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <form onSubmit={handleAddLesson}>
              <div className="field">
                <label>عنوان الدرس</label>
                <input name="title" type="text" placeholder="مثال: مقدمة في المعادلات" required />
              </div>

              <div className="field">
                <label>نوع الدرس</label>
                <select value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
                  <option value="recorded">مسجل (رفع فيديو)</option>
                  <option value="live">حصة مباشرة (لايف)</option>
                </select>
              </div>

              {lessonType === 'recorded' ? (
                <div className="field">
                  <label>ملف الفيديو</label>
                  <input name="video" type="file" accept="video/*" />
                </div>
              ) : (
                <div className="field">
                  <label>موعد الحصة</label>
                  <input name="scheduled_at" type="datetime-local" required />
                </div>
              )}

              {uploadProgress && (
                <p style={{ fontSize: 13, color: '#8A6620', marginBottom: 12 }}>{uploadProgress}</p>
              )}

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'إضافة الدرس'}
              </button>
            </form>
          </div>
        )}

        {showMaterialForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <form onSubmit={handleAddMaterial}>
              <div className="field">
                <label>{t('materialTitle')}</label>
                <input name="title" type="text" placeholder="مثال: ملخص الوحدة الأولى" required />
              </div>
              <div className="field">
                <label>{t('chooseFile')}</label>
                <input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingMaterial}>
                {savingMaterial ? t('uploading') : t('save')}
              </button>
            </form>
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>{t('materialsAndFiles')}</h3>
          {materials.length === 0 ? (
            <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>{t('noMaterials')}</p>
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
                      ? l.video_url
                        ? 'فيديو مرفوع'
                        : 'بدون فيديو'
                      : `مجدول: ${new Date(l.live_scheduled_at).toLocaleString('ar-EG')}`}
                  </p>
                </div>
                <span className={`badge ${l.type}`}>{l.type === 'recorded' ? 'مسجل' : 'لايف'}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <Challenges classId={classId} isTeacher={true} />
          <QuizManager classId={classId} />
          <Community classId={classId} />
        </div>
      </main>
    </div>
  );
}
