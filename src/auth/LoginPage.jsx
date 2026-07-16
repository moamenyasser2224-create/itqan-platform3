import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, toggleLang } = useLanguage();
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
      setError('البريد أو كلمة المرور غير صحيحة / Invalid email or password.');
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
        <div style={{ textAlign: 'end', marginBottom: 8 }}>
          <a onClick={toggleLang} style={{ cursor: 'pointer', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
            🌐 {t('changeLanguage')}
          </a>
        </div>
        <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="إتقان" />
        <h1>{t('login')}</h1>
        <p className="sub">منصة إتقان التعليمية</p>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13.5, marginBottom: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('email')}</label>
            <input name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="field">
            <label>{t('password')}</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? t('loggingIn') : t('loginBtn')}
          </button>
        </form>
        <div className="auth-switch">
          {t('noAccount')} <Link to="/register-teacher">{t('registerAsTeacher')}</Link>{' / '}
          <Link to="/register-student">{t('registerAsStudent')}</Link>
        </div>
      </div>
    </div>
  );
}
