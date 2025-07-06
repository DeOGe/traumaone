import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PRIMARY = '#00b6e9';
const SIDEBAR_BG = '#e6f6fb';
const SIDEBAR_ICON = '#00b6e9';
const HEADER_BG = '#fff';
const HEADER_TEXT = '#222c36';

const sidebarStyle: React.CSSProperties = {
  width: '180px',
  height: '100vh',
  background: SIDEBAR_BG,
  color: SIDEBAR_ICON,
  paddingTop: '40px',
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  borderRight: '1.5px solid #d1e7ef',
  boxSizing: 'border-box',
};

const sidebarHeaderStyle: React.CSSProperties = {
  color: PRIMARY,
  fontWeight: 700,
  fontSize: '1.3rem',
  letterSpacing: '1px',
  marginBottom: '32px',
  fontFamily: 'Segoe UI, Arial, sans-serif',
  textAlign: 'left',
  width: '100%',
  padding: '0 24px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const sidebarLinkStyle: React.CSSProperties = {
  width: 'calc(100% - 32px)', // leave space for left/right margin
  marginLeft: '16px',
  marginRight: '16px',
  padding: '12px 24px',
  fontSize: '1.1rem',
  color: '#222c36',
  background: 'none',
  border: 'none',
  borderRadius: '8px',
  textAlign: 'left' as const,
  fontWeight: 500,
  fontFamily: 'Segoe UI, Arial, sans-serif',
  cursor: 'pointer',
  transition: 'background 0.18s, color 0.18s',
  marginBottom: '16px',
  boxSizing: 'border-box',
};

const sidebarLinkActiveStyle: React.CSSProperties = {
  background: PRIMARY,
  color: '#fff',
};

const logoutStyle: React.CSSProperties = {
  ...sidebarLinkStyle,
  color: '#dc2626',
  marginTop: 'auto',
  background: '#fef2f2',
  fontWeight: 600,
  marginBottom: 0,
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  height: '72px',
  background: HEADER_BG,
  color: HEADER_TEXT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 40px',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 100,
  borderBottom: '1px solid #e5e7eb',
  boxSizing: 'border-box',
};

const logoStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '2rem',
  letterSpacing: '1px',
  color: PRIMARY,
  fontFamily: 'Segoe UI, Arial, sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const profileStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  background: '#e0f7fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.3rem',
  color: PRIMARY,
  cursor: 'pointer',
  border: '2px solid #b2ebf2',
  marginLeft: '16px',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = () => {
    if (location.pathname.startsWith('/patients')) return 'patients';
    if (location.pathname.startsWith('/admissions')) return 'admissions';
    if (location.pathname.startsWith('/operating')) return 'operating';
    if (location.pathname === '/' || location.pathname === '/dashboard') return 'dashboard';
    return '';
  };
  const active = getActive();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div>
      {/* Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>
          <span style={{
            background: PRIMARY,
            color: '#fff',
            borderRadius: '12px',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}>T</span>
          Trauma One
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={profileStyle} title="Profile">
            T1
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>Trauma One</div>
        <button
          style={active === 'dashboard' ? { ...sidebarLinkStyle, ...sidebarLinkActiveStyle } : sidebarLinkStyle}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button
          style={active === 'patients' ? { ...sidebarLinkStyle, ...sidebarLinkActiveStyle } : sidebarLinkStyle}
          onClick={() => navigate('/patients')}
        >
          Patients
        </button>
        <button
          style={active === 'admissions' ? { ...sidebarLinkStyle, ...sidebarLinkActiveStyle } : sidebarLinkStyle}
          onClick={() => navigate('/admissions')}
        >
          Admissions
        </button>
        <button
          style={active === 'operating' ? { ...sidebarLinkStyle, ...sidebarLinkActiveStyle } : sidebarLinkStyle}
          onClick={() => navigate('/operating')}
        >
          Operating Room
        </button>
        <button
          style={logoutStyle}
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div style={{
        marginLeft: '180px',
        marginTop: '72px',
        minHeight: 'calc(100vh - 72px)',
        background: '#f6fbfd',
      }}>
        {children}
      </div>
    </div>
  );
}