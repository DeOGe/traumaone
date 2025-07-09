import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';

const PRIMARY = '#00b6e9';

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: string;
  hospital_registration_number: string;
  created_at: string;
  blood_type?: string;
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '28px',
  boxShadow: '0 4px 32px rgba(0,182,233,0.10)',
  padding: '40px 56px',
  border: '1px solid #eaf6fa',
  width: '100%',
  maxWidth: '100%',
  margin: '0 0 24px 0',
};

const buttonStyle: React.CSSProperties = {
  background: PRIMARY,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 18px',
  fontWeight: 600,
  cursor: 'pointer',
  marginRight: 8,
  fontSize: '1rem',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#e6f6fb',
  color: PRIMARY,
  border: `1px solid ${PRIMARY}`,
};

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Omit<Patient, 'id' | 'created_at'>>({
    first_name: '',
    last_name: '',
    birthdate: '',
    sex: '',
    hospital_registration_number: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatient();
    // eslint-disable-next-line
  }, [id]);

  // Handle JWT expired error: logout and redirect to login
  useEffect(() => {
    if (!patient) return;
    // Optionally, listen for errors from other supabase calls here
    return () => {};
  }, [patient]);

  // Fetch patient from Supabase with JWT expired handling
  async function fetchPatient() {
    if (!id) return;
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST301' && error.message === 'JWT expired') {
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }
    }
    if (data) {
      setPatient(data as Patient);
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        birthdate: data.birthdate,
        sex: data.sex,
        hospital_registration_number: data.hospital_registration_number,
      });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    const { error } = await supabase
      .from('patients')
      .update(form)
      .eq('id', id);
    if (!error) {
      await fetchPatient();
      setEditMode(false);
    }
    setLoading(false);
  }

  if (!patient) {
    return (
      <Layout>
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '36px',
            background: '#f6fbfd',
            minHeight: 'calc(100vh - 72px)',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            width: '95%',
            maxWidth: '100vw',
            boxSizing: 'border-box',
          }}
        >
          <div style={cardStyle}>
            <div>Loading patient details...</div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          padding: '36px',
          background: '#f6fbfd',
          minHeight: 'calc(100vh - 72px)',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          width: '95%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          background: '#fff',
          borderRadius: '28px',
          boxShadow: '0 4px 32px rgba(0,182,233,0.10)',
          padding: 0,
          border: '1px solid #eaf6fa',
          display: 'flex',
          alignItems: 'stretch',
          marginBottom: 40,
          overflow: 'hidden',
          minHeight: 220,
          width: '100%',
          maxWidth: 1000,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {/* Left: Profile Image and Basic Info */}
          <div style={{
            width: 220,
            minWidth: 220,
            background: '#f6fbfd',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 0',
            borderTopLeftRadius: '28px',
            borderBottomLeftRadius: '28px',
            borderRight: '1px solid #eaf6fa',
            flexShrink: 0,
          }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#e6f6fb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 54,
              color: '#b3d8e6',
              marginBottom: 18,
            }}>
              <span role="img" aria-label="Patient">🧑‍⚕️</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#222c36', marginBottom: 4 }}>{patient.first_name} {patient.last_name}</div>
            <div style={{ color: '#7a8fa4', fontSize: 14, marginBottom: 12 }}>{patient.hospital_registration_number}</div>
            <button style={{
              ...buttonStyle,
              background: '#fff',
              color: PRIMARY,
              border: `1.5px solid ${PRIMARY}`,
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 8,
              padding: '7px 20px',
              margin: 0,
            }} onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          </div>
          {/* Right: Chart Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 40px', minWidth: 0 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              rowGap: 18,
              columnGap: 32,
              fontSize: 15.5,
              color: '#222c36',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ color: '#7a8fa4', fontWeight: 500 }}>Sex</div>
                <div style={{ fontWeight: 700 }}>{patient.sex}</div>
              </div>
              <div>
                <div style={{ color: '#7a8fa4', fontWeight: 500 }}>Age</div>
                <div style={{ fontWeight: 700 }}>{patient.birthdate ? `${new Date().getFullYear() - new Date(patient.birthdate).getFullYear()}` : '-'}</div>
              </div>
              <div>
                <div style={{ color: '#7a8fa4', fontWeight: 500 }}>Blood</div>
                <div style={{ fontWeight: 700 }}>{patient.blood_type || '-'}</div>
              </div>
              <div>
                <div style={{ color: '#7a8fa4', fontWeight: 500 }}>Registered Date</div>
                <div style={{ fontWeight: 700 }}>{patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
              </div>
              <div>
                <div style={{ color: '#7a8fa4', fontWeight: 500 }}>Patient ID</div>
                <div style={{ fontWeight: 700 }}>{patient.id}</div>
              </div>
              <div>
                <div style={{ color: '#7a8fa4', fontWeight: 500 }}>Hospital Reg. #</div>
                <div style={{ fontWeight: 700 }}>{patient.hospital_registration_number}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Admissions List Placeholder */}
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 2px 16px rgba(0,182,233,0.08)',
          padding: '28px 32px',
          border: '1px solid #eaf6fa',
          minHeight: 180,
        }}>
          <h3 style={{ color: '#222c36', margin: 0, marginBottom: 18 }}>Patient History</h3>
          <div style={{ color: '#7a8fa4', fontSize: 16 }}>
            {/* TODO: Render admissions list for this patient here */}
            No history found.
          </div>
        </div>
        {/* Edit Mode Form (unchanged) */}
        {editMode && (
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            boxShadow: '0 2px 16px rgba(0,182,233,0.08)',
            padding: '28px 32px',
            border: '1px solid #eaf6fa',
            marginTop: 24,
            maxWidth: 600,
            alignSelf: 'center',
          }}>
            <form onSubmit={handleUpdate} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <input
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                required
                style={{ flex: 1, minWidth: 140, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }}
              />
              <input
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                required
                style={{ flex: 1, minWidth: 140, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }}
              />
              <input
                name="birthdate"
                type="date"
                placeholder="Birthdate"
                value={form.birthdate}
                onChange={handleChange}
                required
                style={{ flex: 1, minWidth: 140, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }}
              />
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                required
                style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }}
              >
                <option value="">Sex</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              <input
                name="hospital_registration_number"
                placeholder="Hospital Registration #"
                value={form.hospital_registration_number}
                onChange={handleChange}
                required
                style={{ flex: 1, minWidth: 180, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }}
              />
              <div style={{ flexBasis: '100%', marginTop: 8 }}>
                <button type="submit" style={buttonStyle} disabled={loading}>
                  Update
                </button>
                <button type="button" style={secondaryButtonStyle} onClick={() => setEditMode(false)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </Layout>
  );
}