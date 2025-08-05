

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SidebarLink from './SidebarLink';
import SidebarHeader from './SidebarHeader';
import ProfileAvatar from './ProfileAvatar';
import Logo from './Logo';


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
    <div className="min-h-screen font-sans bg-[#f6fbfd]">
      {/* Header */}
      <header className="w-full h-[72px] bg-white text-[#222c36] flex items-center justify-between px-10 fixed top-0 left-0 z-[100] border-b border-[#eaf6fa] shadow-sm">
        <Logo />
        <div className="flex items-center">
          <ProfileAvatar />
        </div>
      </header>

      {/* Sidebar */}
      <aside className="w-[200px] px-2 h-screen bg-[#e6f6fb] text-primary pt-10 fixed top-0 left-0 flex flex-col items-stretch border-r border-[#eaf6fa] box-border z-50 shadow-sm">
        <SidebarHeader />
        <SidebarLink active={active === 'dashboard'} onClick={() => navigate('/dashboard')}>Dashboard</SidebarLink>
        <SidebarLink active={active === 'patients'} onClick={() => navigate('/patients')}>Patients</SidebarLink>
        <SidebarLink active={active === 'admissions'} onClick={() => navigate('/admissions')}>Admissions</SidebarLink>
        {/* <SidebarLink active={active === 'operating'} onClick={() => navigate('/operating')}>Operating Room</SidebarLink> */}
        <button
          className="w-[calc(100%-32px)] ml-4 mr-4 px-6 py-3 text-base rounded-lg text-left font-semibold font-sans mt-auto mb-4 transition-colors duration-150 text-red-600 bg-red-50 hover:bg-red-100 border-none shadow-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="ml-[200px] pt-[72px] min-h-[calc(100vh-72px)] bg-[#f6fbfd] transition-all duration-200">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}