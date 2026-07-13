import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('البريد أو كلمة المرور غير صحيحة.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);
    navigate(profile?.role === 'teacher' ? '/teacher' : '/student');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>تسجيل الدخول</h1>
        <p className="sub">ادخل لصفّك وتابع طلابك</p>
        {error && <p style={{ color: '#B14B2A', fontSize: 13.5, marginBottom: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
        <div className="auth-switch">
          معملتش حساب لسه؟ <Link to="/register-teacher">سجّل كمعلم</Link> أو{' '}
          <Link to="/register-student">سجّل كطالب</Link>
        </div>
      </div>
    </div>
  );
}
