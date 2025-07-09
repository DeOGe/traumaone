import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 2px 16px rgba(0,182,233,0.08)',
  padding: '28px 32px',
  marginBottom: '24px',
  border: '1px solid #eaf6fa',
  width: '100%',
  maxWidth: 1000,
  margin: '0 auto 24px auto',
};

interface Admission {
  id: string;
  chief_complaint: string;
  date_of_injury: string;
  time_of_injury: string;
  diagnosis: string;
  status?: string;
  created_at?: string;
}

export default function PatientAdmissionHistory({ patientId }: { patientId: string }) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    supabase
      .from('admissions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAdmissions(data as Admission[]);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) return <div style={{ marginTop: 18, color: '#7a8fa4' }}>Loading admission history...</div>;
  if (!admissions.length) return <div style={{ marginTop: 18, color: '#7a8fa4' }}>No admission history.</div>;

  return (
    <div style={{ ...cardStyle, marginTop: 18 }}>
      <h4 style={{ color: '#00b6e9', marginBottom: 12 }}>Admission History</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr>
            <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '8px 6px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Date/Time</th>
            <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '8px 6px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Chief Complaint</th>
            <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '8px 6px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Diagnosis</th>
            <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '8px 6px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {admissions.map(adm => (
            <tr key={adm.id} style={{ background: '#fafdff' }}>
              <td style={{ padding: '8px 6px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.date_of_injury} {adm.time_of_injury}</td>
              <td style={{ padding: '8px 6px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.chief_complaint}</td>
              <td style={{ padding: '8px 6px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.diagnosis}</td>
              <td style={{ padding: '8px 6px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.status || 'ADMITTED'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
