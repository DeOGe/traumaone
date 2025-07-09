
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-[#f6fbfd] flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl shadow-lg p-10 border border-[#eaf6fa] min-w-[340px] max-w-[400px] w-full flex flex-col items-center">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-[60px] h-[60px] rounded-full bg-[#e6f6fb] flex items-center justify-center text-3xl text-[#00b6e9] font-bold">
            🏥
          </div>
          <div>
            <h2 className="text-[#222c36] font-bold text-2xl m-0">Trauma One</h2>
            <div className="text-[#00b6e9] font-medium text-base mt-1">Hospital Management Login</div>
          </div>
        </div>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="w-full">
            <label className="text-[#222c36] font-semibold mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#d1e7ef] text-base mb-1 focus:outline-none focus:ring-2 focus:ring-[#00b6e9]"
              placeholder="Enter your email"
            />
          </div>
          <div className="w-full">
            <label className="text-[#222c36] font-semibold mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#d1e7ef] text-base mb-1 focus:outline-none focus:ring-2 focus:ring-[#00b6e9]"
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="text-[#e94f4f] font-medium mt-1 text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#00b6e9] text-white rounded-lg py-3 font-bold text-lg mt-2 shadow-sm transition-colors duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#009fcc] cursor-pointer'}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}