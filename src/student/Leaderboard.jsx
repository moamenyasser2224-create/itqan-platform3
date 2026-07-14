import { useEffect, useState } from 'react';
import Sidebar from '../shared/Sidebar';
import Avatar from '../shared/Avatar';
import { supabase } from '../api/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

export default function Leaderboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    setUserId(authData?.user?.id);

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('student_id, completed, watched_seconds, profiles(full_name, avatar_url)')
      .eq('completed', true);

    const grouped = {};
    (progress || []).forEach((p) => {
      if (!grouped[p.student_id]) {
        grouped[p.student_id] = {
          student_id: p.student_id,
          full_name: p.profiles?.full_name || 'طالب',
          avatar_url: p.profiles?.avatar_url,
          lessons: 0,
          seconds: 0,
        };
      }
      grouped[p.student_id].lessons += 1;
      grouped[p.student_id].seconds += p.watched_seconds || 0;
    });

    const list = Object.values(grouped).sort((a, b) => b.lessons - a.lessons);
    setRanking(list);
    setMyStats(list.find((r) => r.student_id === authData?.user?.id) || null);
    setLoading(false);
  }

  const medal = ['🥇', '🥈', '🥉'];

  return (
    <div className="app-shell">
      <Sidebar role="student" />
      <main className="main">
        <div className="page-head">
          <h1>لوحة التقدم والترتيب</h1>
          <p>شوف تقدمك مقارنة بزمايلك</p>
        </div>

        <div className="grid cols-3" style={{ marginBottom: 28 }}>
          <div className="card stat">
            <div className="label">دروسك المكتملة</div>
            <div className="value">{myStats?.lessons || 0}</div>
          </div>
          <div className="card stat">
            <div className="label">ساعات المذاكرة</div>
            <div className="value">{myStats ? Math.round(myStats.seconds / 3600) : 0}</div>
          </div>
          <div className="card stat">
            <div className="label">ترتيبك</div>
            <div className="value">
              {myStats ? `#${ranking.findIndex((r) => r.student_id === userId) + 1}` : '—'}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>الترتيب العام</h3>
          {loading ? (
            <p>{t('loading')}</p>
          ) : ranking.length === 0 ? (
            <p style={{ color: 'rgba(27,26,23,.6)', fontSize: 14.5 }}>لسه مفيش بيانات كفاية.</p>
          ) : (
            ranking.slice(0, 20).map((r, i) => (
              <div
                className="list-row"
                key={r.student_id}
                style={r.student_id === userId ? { background: 'rgba(185,134,44,.08)' } : {}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, fontWeight: 700 }}>{medal[i] || i + 1}</span>
                  <Avatar size="sm" src={r.avatar_url} name={r.full_name} />
                  <p style={{ fontWeight: 700, fontSize: 14.5 }}>{r.full_name}</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(27,26,23,.6)' }}>{r.lessons} درس</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
