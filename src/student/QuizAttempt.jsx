import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { supabase } from '../api/supabaseClient';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    load();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || result) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, result]);

  async function load() {
    setLoading(true);
    const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
    setQuiz(quizData);
    setSecondsLeft((quizData?.duration_minutes || 20) * 60);

    const { data: qList } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });
    setQuestions(qList || []);
    setLoading(false);
  }

  function selectAnswer(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const { data: authData } = await supabase.auth.getUser();
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) score += 1;
    });

    await supabase.from('quiz_attempts').insert({
      quiz_id: quizId,
      student_id: authData.user.id,
      score,
      total: questions.length,
      submitted_at: new Date().toISOString(),
    });

    setResult({ score, total: questions.length });
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar role="student" />
        <main className="main">
          <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
          </div>
        </main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="app-shell">
        <Sidebar role="student" />
        <main className="main">
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <h1 style={{ fontSize: 30, marginBottom: 10 }}>
              {result.score} / {result.total}
            </h1>
            <p style={{ color: 'rgba(27,26,23,.6)', marginBottom: 24 }}>
              نتيجتك في "{quiz?.title}"
            </p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              رجوع
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <div
          className="page-head"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h1>{quiz?.title}</h1>
          <div
            style={{
              fontFamily: 'Amiri, serif',
              fontSize: 22,
              fontWeight: 700,
              color: secondsLeft < 60 ? '#B14B2A' : '#1B1A17',
            }}
          >
            {minutes}:{seconds}
          </div>
        </div>

        {questions.map((q, i) => (
          <div className="card" style={{ marginBottom: 16 }} key={q.id}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
              {i + 1}. {q.question_text}
            </p>
            {['a', 'b', 'c', 'd'].map((opt) => (
              <label
                key={opt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === opt}
                  onChange={() => selectAnswer(q.id, opt)}
                />
                {q[`option_${opt}`]}
              </label>
            ))}
          </div>
        ))}

        <button className="btn btn-primary" onClick={handleSubmit} style={{ width: '100%', padding: 16 }}>
          تسليم الامتحان
        </button>
      </main>
    </div>
  );
}
