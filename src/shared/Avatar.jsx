export default function Avatar({ src, name, size = 'md' }) {
  const initial = name ? name.trim().charAt(0) : '؟';
  return (
    <div className={`avatar ${size === 'sm' ? 'sm' : ''}`}>
      {src ? <img src={src} alt={name || 'صورة'} /> : initial}
    </div>
  );
}
