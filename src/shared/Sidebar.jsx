import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import Avatar from './Avatar';
import { useLanguage } from '../i18n/LanguageContext';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const teacherLinks = [
    { to: '/teacher', label: t('home'), end: true },
    { to: '/teacher/classes', label: t('myClasses') },
    { to: '/teacher/students', label: t('students') },
  ];
  const studentLinks = [{ to: '/student', label: t('home'), end: true }];
  const links = role === 'teacher' ? teacherLinks : studentLinks;

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', authData.user.id)
      .single();
    setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <div className="mobile-topbar">
        <div className="logo">
          {t('appName')}
          <span>.</span>
        </div>
        <button onClick={() => setMenuOpen((v) => !v)} aria-label="menu">
          ☰
        </button>
      </div>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="logo">
          {t('appName')}
          <span>.</span>
        </div>

        <div className="profile-chip">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} />
          <div>
            <div className="name">{profile?.full_name || '...'}</div>
            <div className="role">{role === 'teacher' ? t('teacher') : t('student')}</div>
          </div>
        </div>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <a onClick={toggleLang} style={{ cursor: 'pointer' }}>
          🌐 {t('changeLanguage')}
        </a>
        <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
          {t('logout')}
        </a>
      </aside>
    </>
  );
}
