import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const full_name = e.target.full_name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.user) {
      setError(signUpError?.message || 'حصل خطأ أثناء إنشاء الحساب.');
      setLoading(false);
      return;
    }

    await supabase.from('profiles').insert({ id: data.user.id, role: 'student', full_name });

    setLoading(false);
    navigate('/student');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>سجّل كطالب</h1>
        <p className="sub">وابدأ بمتابعة دروسك مع معلمك</p>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13.5, marginBottom: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>الاسم الكامل</label>
            <input name="full_name" type="text" placeholder="اسمك بالكامل" required />
          </div>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input
              name="password"
              type="password"
              placeholder="8 أحرف على الأقل، تحتوي رقم وحرف"
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
              title="لازم 8 أحرف على الأقل وتحتوي على حرف ورقم"
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
        <div className="auth-switch">
          عندك حساب؟ <Link to="/login">سجّل دخول</Link>
        </div>
      </div>
    </div>
  );
}
