import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

const teacherLinks = [
  { to: '/teacher', label: 'الرئيسية', end: true },
  { to: '/teacher/classes', label: 'صفوفي' },
  { to: '/teacher/students', label: 'الطلاب' },
];

const studentLinks = [
  { to: '/student', label: 'الرئيسية', end: true },
];

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const links = role === 'teacher' ? teacherLinks : studentLinks;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        إتقـان<span>.</span>
      </div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {link.label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
        تسجيل الخروج
      </a>
    </aside>
  );
}
