import React from 'react';

export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-[#eaf6fa] p-8 mb-6 w-full max-w-full ${className}`}>
      {children}
    </div>
  );
}
