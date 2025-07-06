import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#00b6e9';
const CARD_BG = '#fff';
const CARD_SHADOW = '0 2px 16px rgba(0,182,233,0.08)';
const BORDER_RADIUS = '18px';

const cardStyle: React.CSSProperties = {
  background: CARD_BG,
  borderRadius: BORDER_RADIUS,
  boxShadow: CARD_SHADOW,
  padding: '36px 40px',
  border: '1px solid #eaf6fa',
  minWidth: 340,
  maxWidth: 400,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data && data.session) {
      navigate('/dashboard');
    } else {
      setError('Login failed. Please try again.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6fbfd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#e6f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: PRIMARY, fontWeight: 700 }}>
            🏥
          </div>
          <div>
            <h2 style={{ color: '#222c36', fontWeight: 700, fontSize: '1.7rem', margin: 0 }}>Trauma One</h2>
            <div style={{ color: PRIMARY, fontWeight: 500, fontSize: '1.05rem', marginTop: 4 }}>Hospital Management Login</div>
          </div>
        </div>
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ width: '100%' }}>
            <label style={{ color: '#222c36', fontWeight: 600, marginBottom: 6, display: 'block' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1e7ef', fontSize: 16, marginBottom: 2 }}
              placeholder="Enter your email"
            />
          </div>
          <div style={{ width: '100%' }}>
            <label style={{ color: '#222c36', fontWeight: 600, marginBottom: 6, display: 'block' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1e7ef', fontSize: 16, marginBottom: 2 }}
              placeholder="Enter your password"
            />
          </div>
          {error && <div style={{ color: '#e94f4f', fontWeight: 500, marginTop: 2, textAlign: 'center' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: PRIMARY,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginTop: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 6px rgba(0,182,233,0.08)',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}