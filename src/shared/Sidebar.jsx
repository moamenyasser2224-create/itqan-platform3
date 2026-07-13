import { NavLink } from 'react-router-dom';

const teacherLinks = [
  { to: '/teacher', label: 'الرئيسية', end: true },
  { to: '/teacher/classes', label: 'صفوفي' },
  { to: '/teacher/students', label: 'الطلاب' },
];

const studentLinks = [
  { to: '/student', label: 'الرئيسية', end: true },
  { to: '/student/classes', label: 'صفوفي' },
];

export default function Sidebar({ role }) {
  const links = role === 'teacher' ? teacherLinks : studentLinks;
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
    </aside>
  );
}
