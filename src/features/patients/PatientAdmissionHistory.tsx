import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 2px 16px rgba(0,182,233,0.08)',
  padding: '28px 32px',
  marginBottom: '24px',
  border: '1px solid #eaf6fa',
  width: '100%',
  maxWidth: 1000,
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
  if (!admissions.length) return <div style={{...cardStyle, marginTop: 18, color: '#7a8fa4' }}>No admission history.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#eaf6fa] mt-5 mb-6 w-full max-w-[1000px] mx-auto p-0">
      <h4 className="text-[#00b6e9] font-bold text-lg px-8 pt-8 pb-2">Admission History</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Date & Time of Injury</th>
              <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Chief Complaint</th>
              <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Diagnosis</th>
              <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map(adm => (
              <tr key={adm.id} className="hover:bg-[#f3fafd] transition">
                <td className="px-6 py-3 border-b border-[#eaf6fa] text-[15px] whitespace-nowrap">
                  {(() => {
                    if (!adm.date_of_injury) return '-';
                    // Combine date and time, fallback to just date if time missing
                    const dateStr = adm.date_of_injury;
                    const timeStr = adm.time_of_injury || '';
                    // Parse date and time
                    let dateObj: Date | null = null;
                    if (dateStr && timeStr) {
                      dateObj = new Date(`${dateStr}T${timeStr}`);
                    } else if (dateStr) {
                      dateObj = new Date(dateStr);
                    }
                    if (!dateObj || isNaN(dateObj.getTime())) return '-';
                    // Format: Fri, 12 Jul 2024, 14:30
                    const datePart = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                    const timePart = timeStr ? dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
                    return `${datePart}${timePart ? ' ' + timePart : ''}`;
                  })()}
                </td>
                <td className="px-6 py-3 border-b border-[#eaf6fa] text-[15px]">{adm.chief_complaint}</td>
                <td className="px-6 py-3 border-b border-[#eaf6fa] text-[15px] max-w-[180px]">
                  <div
                    className="overflow-hidden whitespace-nowrap text-ellipsis"
                    style={{ maxWidth: 160 }}
                    title={adm.diagnosis}
                  >
                    {adm.diagnosis}
                  </div>
                </td>
                <td className="px-6 py-3 border-b border-[#eaf6fa] text-[15px]">
                  {adm.status === 'DISCHARGED' ? (
                    <span className="bg-[#e6f6fb] text-[#00b6e9] px-3 py-1 rounded-md text-xs font-semibold">Discharged</span>
                  ) : (
                    <span className="bg-[#eaf6fa] text-[#7a8fa4] px-3 py-1 rounded-md text-xs font-semibold">Admitted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
