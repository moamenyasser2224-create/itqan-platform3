import { useEffect, useState } from 'react';

// __BUILD_VERSION__ بيتحط أوتوماتيك وقت البناء (من vite.config.js)
const CURRENT_VERSION = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : '0';

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.version && data.version !== CURRENT_VERSION) {
          setUpdateAvailable(true);
        }
      } catch {
        // تجاهل أي خطأ شبكة، هيحاول تاني بعد شوية
      }
    };

    const interval = setInterval(checkForUpdate, 60000); // كل دقيقة
    checkForUpdate();

    return () => clearInterval(interval);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        insetInlineEnd: 20,
        zIndex: 999,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: '14px 18px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 320,
        animation: 'fadeInUp .35s ease both',
      }}
    >
      <div>
        <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>فيه تحديث جديد للمنصة</p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>حدّث الصفحة عشان تاخد آخر إضافة</p>
      </div>
      <button
        className="btn btn-primary"
        style={{ padding: '9px 16px', fontSize: 12.5, whiteSpace: 'nowrap' }}
        onClick={() => window.location.reload()}
      >
        تحديث
      </button>
    </div>
  );
}
