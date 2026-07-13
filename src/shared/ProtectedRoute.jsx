import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function ProtectedRoute({ children, allowedRole }) {
  const [status, setStatus] = useState('checking'); // checking | ok | denied

  useEffect(() => {
    check();
  }, []);

  async function check() {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setStatus('denied');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      setStatus('denied');
      return;
    }

    if (allowedRole && profile.role !== allowedRole) {
      setStatus('wrong-role');
      setStatus({ wrongRole: profile.role });
      return;
    }

    setStatus('ok');
  }

  if (status === 'checking') {
    return (
      <div className="auth-page">
        <p style={{ color: 'rgba(27,26,23,.6)' }}>جاري التحقق من الحساب...</p>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace />;
  }

  if (status && status.wrongRole) {
    return <Navigate to={status.wrongRole === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return children;
}
