import { IconEmpty } from './icons';

export default function EmptyState({ title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gold-dim)' }}>
      <IconEmpty />
      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginTop: 14, marginBottom: 4 }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'rgba(21,19,15,.5)', marginBottom: action ? 16 : 0 }}>{subtitle}</p>
      )}
      {action}
    </div>
  );
}
