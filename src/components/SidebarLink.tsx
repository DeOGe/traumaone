import React from 'react';

interface SidebarLinkProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function SidebarLink({ active, onClick, children }: SidebarLinkProps) {
  return (
    <button
      className={`w-full  text-left px-6 py-3 mb-4 rounded-lg font-medium text-base transition-colors select-none focus:outline-none focus:ring-2 focus:ring-sky-400/50 ${
        active
          ? 'bg-sky-400 text-white shadow-sm'
          : 'bg-transparent text-slate-800 hover:bg-sky-100'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
