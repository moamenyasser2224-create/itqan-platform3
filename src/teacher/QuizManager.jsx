import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

export default function QuizManager({ classId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  useEffect(() => {
    load();
  }, [classId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(count)')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    setQuizzes(data || []);
    setLoading(false);
  }

  async function handleCreateQuiz(e) {
    e.preventDefault();
    setSavingQuiz(true);
    const title = e.target.title.value;
    const duration_minutes = Number(e.target.duration_minutes.value);

    const { data, error } = await supabase
      .from('quizzes')
      .insert({ class_id: classId, title, duration_minutes })
      .select()
      .single();

    setSavingQuiz(false);
    if (!error) {
      setShowQuizForm(false);
      e.target.reset();
      load();
      openQuiz(data);
    }
  }

  async function openQuiz(quiz) {
    setActiveQuiz(quiz);
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });
    setQuizQuestions(data || []);
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setSavingQuestion(true);
    const form = e.target;

    const { error } = await supabase.from('quiz_questions').insert({
      quiz_id: activeQuiz.id,
      question_text: form.question_text.value,
      option_a: form.option_a.value,
      option_b: form.option_b.value,
      option_c: form.option_c.value,
      option_d: form.option_d.value,
      correct_option: form.correct_option.value,
      order_index: quizQuestions.length,
    });

    setSavingQuestion(false);
    if (!error) {
      form.reset();
      openQuiz(activeQuiz);
      load();
    }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 16 }}>الامتحانات</h3>
        <button className="btn btn-ghost" onClick={() => setShowQuizForm((s) => !s)}>
          {showQuizForm ? 'إلغاء' : '+ امتحان جديد'}
        </button>
      </div>

      {showQuizForm && (
        <form onSubmit={handleCreateQuiz} style={{ marginBottom: 20 }}>
          <div className="field">
            <label>عنوان الامتحان</label>
            <input name="title" type="text" placeholder="مثال: امتحان الوحدة الأولى" required />
          </div>
          <div className="field">
            <label>المدة بالدقايق</label>
            <input name="duration_minutes" type="number" min="1" defaultValue="20" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingQuiz}>
            {savingQuiz ? 'جاري الإنشاء...' : 'إنشاء وإضافة أسئلة'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="skeleton" style={{height:13,width:120}} />
      ) : quizzes.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>لسه مفيش امتحانات.</p>
      ) : (
        quizzes.map((q) => (
          <div className="list-row" key={q.id}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14.5 }}>{q.title}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                {q.duration_minutes} دقيقة · {q.quiz_questions?.[0]?.count || 0} سؤال
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => openQuiz(q)}>
              إدارة الأسئلة
            </button>
          </div>
        ))
      )}

      {activeQuiz && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <h4 style={{ fontSize: 14.5, marginBottom: 12 }}>أسئلة: {activeQuiz.title}</h4>

          {quizQuestions.map((q, i) => (
            <p key={q.id} style={{ fontSize: 13.5, marginBottom: 8 }}>
              {i + 1}. {q.question_text} <span style={{ color: 'var(--primary)' }}>(الإجابة: {q.correct_option})</span>
            </p>
          ))}

          <form onSubmit={handleAddQuestion} style={{ marginTop: 14 }}>
            <div className="field">
              <label>نص السؤال</label>
              <input name="question_text" type="text" required />
            </div>
            <div className="grid cols-2" style={{ marginBottom: 16 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>اختيار أ</label>
                <input name="option_a" type="text" required />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>اختيار ب</label>
                <input name="option_b" type="text" required />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>اختيار ج</label>
                <input name="option_c" type="text" required />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>اختيار د</label>
                <input name="option_d" type="text" required />
              </div>
            </div>
            <div className="field">
              <label>الإجابة الصحيحة</label>
              <select name="correct_option">
                <option value="a">أ</option>
                <option value="b">ب</option>
                <option value="c">ج</option>
                <option value="d">د</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingQuestion}>
              {savingQuestion ? 'جاري الإضافة...' : '+ إضافة سؤال'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
