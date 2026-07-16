import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import Avatar from './Avatar';

export default function Community({ classId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    load();
  }, [classId]);

  async function load() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    setUserId(authData?.user?.id);

    const { data } = await supabase
      .from('questions')
      .select('*, profiles(full_name, avatar_url), answers(id, body, created_at, profiles(full_name, avatar_url))')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    setQuestions(data || []);
    setLoading(false);
  }

  async function handlePostQuestion(e) {
    e.preventDefault();
    setPosting(true);
    const title = e.target.title.value;
    const body = e.target.body.value;

    const { error } = await supabase.from('questions').insert({
      class_id: classId,
      author_id: userId,
      title,
      body,
    });

    setPosting(false);
    if (!error) {
      setShowForm(false);
      e.target.reset();
      load();
    }
  }

  async function handlePostAnswer(questionId) {
    if (!answerText.trim()) return;
    const { error } = await supabase.from('answers').insert({
      question_id: questionId,
      author_id: userId,
      body: answerText,
    });
    if (!error) {
      setAnswerText('');
      load();
    }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 16 }}>مجتمع الصف — أسئلة وأجوبة</h3>
        <button className="btn btn-ghost" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'إلغاء' : '+ سؤال جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePostQuestion} style={{ marginBottom: 20 }}>
          <div className="field">
            <label>عنوان السؤال</label>
            <input name="title" type="text" placeholder="اكتب سؤالك باختصار" required />
          </div>
          <div className="field">
            <label>تفاصيل (اختياري)</label>
            <input name="body" type="text" placeholder="أي تفاصيل إضافية" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={posting}>
            {posting ? 'جاري النشر...' : 'نشر السؤال'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="skeleton" style={{height:13,width:120}} />
      ) : questions.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>لسه مفيش أسئلة. ابدأ أول نقاش.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} style={{ borderBottom: '1px solid var(--line)', padding: '14px 0' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setOpenQuestion(openQuestion === q.id ? null : q.id)}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: 14.5 }}>{q.title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {q.profiles?.full_name} · {q.answers?.length || 0} إجابة
                </p>
              </div>
              <span style={{ fontSize: 13, color: 'var(--primary)' }}>
                {openQuestion === q.id ? 'اغلاق' : 'عرض'}
              </span>
            </div>

            {openQuestion === q.id && (
              <div style={{ marginTop: 14, paddingRight: 12 }}>
                {q.body && <p style={{ fontSize: 13.5, marginBottom: 12 }}>{q.body}</p>}

                {(q.answers || []).map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <Avatar size="sm" src={a.profiles?.avatar_url} name={a.profiles?.full_name} />
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700 }}>{a.profiles?.full_name}</p>
                      <p style={{ fontSize: 13.5 }}>{a.body}</p>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    type="text"
                    placeholder="اكتب إجابتك..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: 13.5,
                    }}
                  />
                  <button className="btn btn-primary" onClick={() => handlePostAnswer(q.id)}>
                    إرسال
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
