import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Layout from './Layout';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }
    getSession()
  }, [])

  if (loading) return <p>Loading...</p>
  if (!session) return <Navigate to="/" />
  return (
    <Layout>
      {children}
    </Layout>
  )
}
