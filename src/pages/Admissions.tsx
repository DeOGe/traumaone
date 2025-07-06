import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import Select from 'react-select';

// Admission and Patient types
interface Admission {
  id?: string;
  patient_id: string;
  chief_complaint: string;
  nature_of_injury: string;
  date_of_injury: string;
  time_of_injury: string;
  place_of_injury: string;
  history_of_present_illness: string;
  past_medical_history: string;
  personal_social_history: string;
  obstetric_gynecologic_history: string;
  blood_pressure: string;
  hr: string;
  rr: string;
  spo2: string;
  temperature: string;
  physical_examination: string;
  imaging_findings: string;
  laboratory: string;
  diagnosis: string;
  initial_management: string;
  surgical_plan: string;
  created_at?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: string;
  hospital_registration_number: string;
}

const initialAdmission: Admission = {
  patient_id: '',
  chief_complaint: '',
  nature_of_injury: '',
  date_of_injury: '',
  time_of_injury: '',
  place_of_injury: '',
  history_of_present_illness: '',
  past_medical_history: '',
  personal_social_history: '',
  obstetric_gynecologic_history: '',
  blood_pressure: '',
  hr: '',
  rr: '',
  spo2: '',
  temperature: '',
  physical_examination: '',
  imaging_findings: '',
  laboratory: '',
  diagnosis: '',
  initial_management: '',
  surgical_plan: '',
};

const PRIMARY = '#00b6e9';
const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 2px 16px rgba(0,182,233,0.08)',
  padding: '28px 32px',
  marginBottom: '24px',
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

export default function Admissions() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Admission>(initialAdmission);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    birthdate: '',
    sex: '',
    hospital_registration_number: '',
  });
  const [patientLoading, setPatientLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null); // admission id
  const [wizardStep, setWizardStep] = useState(0);
  const [formError, setFormError] = useState(''); // Form validation error message
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ADMITTED');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Fetch admissions with search
  async function fetchAdmissions() {
    let query = supabase
      .from('admissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (search.trim() !== '') {
      // Find matching patients first
      const { data: patientMatches, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,hospital_registration_number.ilike.%${search}%`);
      if (!patientError && patientMatches && patientMatches.length > 0) {
        const patientIds = patientMatches.map((p: any) => p.id);
        query = query.in('patient_id', patientIds);
      } else {
        setAdmissions([]);
        return;
      }
    }
    if (filterDate) {
      query = query.eq('date_of_injury', filterDate);
    }
    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }
    const { data, error } = await query;
    if (!error && data) setAdmissions(data);
  }

  // Fetch patients for dropdown
  async function fetchPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPatients(data as Patient[]);
  }

  // Fetch admissions and patients on mount
  useEffect(() => {
    fetchAdmissions();
    fetchPatients();
  }, []);

  // Refetch admissions when filters change (but NOT search)
  useEffect(() => {
    fetchAdmissions();
  }, [filterDate, filterStatus, search]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openForm(admission: Admission | null = null) {
    if (admission) {
      setForm({ ...admission });
      setEditId(admission.id || null);
    } else {
      setForm(initialAdmission);
      setEditId(null);
    }
    setShowForm(true);
    setShowDetails(null);
    setWizardStep(0);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(initialAdmission);
    setWizardStep(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    // Required fields
    if (!form.patient_id) {
      setLoading(false);
      setFormError('Patient is required.');
      return;
    }
    if (!form.chief_complaint) {
      setLoading(false);
      setFormError('Chief complaint is required.');
      return;
    }
    // RR: must be a positive integer (per DB constraint)
    if (form.rr && (!/^[0-9]+$/.test(form.rr) || parseInt(form.rr, 10) <= 0)) {
      setLoading(false);
      setFormError('Respiratory Rate (RR) must be a positive integer.');
      return;
    }
    // HR: must be a positive integer (if present)
    if (form.hr && (!/^[0-9]+$/.test(form.hr) || parseInt(form.hr, 10) <= 0)) {
      setLoading(false);
      setFormError('Heart Rate (HR) must be a positive integer.');
      return;
    }
    // SpO2: must be 0-100 (if present)
    if (form.spo2 && (!/^[0-9]+$/.test(form.spo2) || parseInt(form.spo2, 10) < 0 || parseInt(form.spo2, 10) > 100)) {
      setLoading(false);
      setFormError('SpO2 must be a number between 0 and 100.');
      return;
    }
    // Temperature: must be a number (if present)
    if (form.temperature && isNaN(Number(form.temperature))) {
      setLoading(false);
      setFormError('Temperature must be a number.');
      return;
    }
    if (editId) {
      // Update
      const { error } = await supabase
        .from('admissions')
        .update(form)
        .eq('id', editId);
      if (!error) {
        await fetchAdmissions();
        closeForm();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('admissions')
        .insert([form]);
      if (error) {
        setFormError(error.message);
      } else {
        await fetchAdmissions();
        closeForm();
      }
    }
    setLoading(false);
  }

  // Quick add patient
  async function handleQuickAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setPatientLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .insert([newPatient])
      .select();
    if (!error && data && data[0]) {
      setPatients([data[0], ...patients]);
      setForm({ ...form, patient_id: data[0].id });
      setShowPatientModal(false);
      setNewPatient({
        first_name: '',
        last_name: '',
        birthdate: '',
        sex: '',
        hospital_registration_number: '',
      });
    }
    setPatientLoading(false);
  }

  return (
    <Layout>
      <main style={{ padding: 36, background: '#f6fbfd', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#222c36', margin: 0 }}>Admissions</h2>
            <button style={buttonStyle} onClick={() => openForm()}>New Admission</button>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <input
                type="text"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (e.target.value === '') {
                    setSearch('');
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearch(searchInput);
                  }
                }}
                style={{ width: 260, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', fontSize: 16, marginRight: 12 }}
                placeholder="Search by patient name or reg #"
              />
              <button
                style={{ ...buttonStyle, padding: '8px 18px' }}
                onClick={() => setSearch(searchInput)}
              >
                Search
              </button>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                style={{ marginLeft: 24, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minWidth: 140 }}
                placeholder="Filter by date"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ marginLeft: 12, padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minWidth: 140 }}
              >
                <option value="ADMITTED">Admitted</option>
                <option value="DISCHARGE">Discharged</option>
                <option value="">All Statuses</option>
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24, background: '#fff', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '12px 8px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Patient</th>
                    <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '12px 8px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Chief Complaint</th>
                    <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '12px 8px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Date/Time of Injury</th>
                    <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '12px 8px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Diagnosis</th>
                    <th style={{ background: '#e6f6fb', color: '#222c36', fontWeight: 600, padding: '12px 8px', borderBottom: '1.5px solid #d1e7ef', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 12 }}>No admissions found.</td>
                    </tr>
                  ) : (
                    admissions.map(adm => (
                      <tr key={adm.id} style={{ background: '#fafdff', borderRadius: 8 }}>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{patients.find(p => p.id === adm.patient_id)?.first_name || 'Unknown'} {patients.find(p => p.id === adm.patient_id)?.last_name || ''}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.chief_complaint}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.date_of_injury} {adm.time_of_injury}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>{adm.diagnosis}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #eaf6fa', fontSize: '1rem' }}>
                          <button
                            style={buttonStyle}
                            onClick={() => setShowDetails(adm.id || null)}
                          >
                            Show
                          </button>
                          <button
                            style={secondaryButtonStyle}
                            onClick={() => openForm(adm)}
                          >
                            Edit
                          </button>
                          <button
                            style={{ ...buttonStyle, background: '#e94f4f' }}
                            onClick={async () => {
                              await supabase.from('admissions').update({ status: 'DISCHARGE' }).eq('id', adm.id);
                              await fetchAdmissions();
                            }}
                          >
                            Discharge
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Show Admission Details */}
          {showDetails && (
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,182,233,0.08)', padding: 32, marginBottom: 32 }}>
              <button style={{ float: 'right', marginBottom: 8 }} onClick={() => setShowDetails(null)}>Close</button>
              <h3 style={{ color: '#00b6e9' }}>Admission Details</h3>
              {(() => {
                const adm = admissions.find(a => a.id === showDetails);
                if (!adm) return null;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {Object.entries(adm).map(([k, v]) => (
                      k !== 'id' && k !== 'created_at' && (
                        <div key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {v?.toString()}</div>
                      )
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Admission Modal Wizard */}
          {showForm && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={closeForm}>
              <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,182,233,0.18)', padding: 32, minWidth: 420, maxWidth: 600, width: '100%', minHeight: 540, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ color: '#00b6e9', marginBottom: 18 }}>{editId ? 'Update Admission' : 'New Admission'}</h3>
                {/* Wizard Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {['Patient & Injury', 'History', 'Vitals', 'Exam & Labs', 'Diagnosis'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setWizardStep(idx)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        border: 'none',
                        borderBottom: wizardStep === idx ? '3px solid #00b6e9' : '2px solid #e6f6fb',
                        background: 'none',
                        color: wizardStep === idx ? '#00b6e9' : '#7a8fa4',
                        fontWeight: wizardStep === idx ? 700 : 500,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'color 0.15s, border-bottom 0.15s',
                        borderRadius: 0,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} onKeyDown={e => {
                  // Prevent Enter key from submitting the form except on the last step
                  if (e.key === 'Enter' && wizardStep < 4) {
                    e.preventDefault();
                  }
                }}>
                  {formError && (
                    <div style={{ color: '#e94f4f', fontWeight: 500, marginBottom: 8, textAlign: 'center' }}>{formError}</div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    {/* Wizard Steps */}
                    {wizardStep === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label>Patient <span style={{ color: 'red' }}>*</span></label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ minWidth: 260, flex: 1 }}>
                            <Select
                              options={patients.map(p => ({
                                value: p.id,
                                label: `${p.first_name} ${p.last_name} (${p.hospital_registration_number})${p.birthdate ? ' - ' + p.birthdate : ''}${p.sex ? ' - ' + p.sex : ''}`
                              }))}
                              value={patients.length ? patients.filter(p => p.id === form.patient_id).map(p => ({
                                value: p.id,
                                label: `${p.first_name} ${p.last_name} (${p.hospital_registration_number})${p.birthdate ? ' - ' + p.birthdate : ''}${p.sex ? ' - ' + p.sex : ''}`
                              }))[0] : null}
                              onChange={opt => setForm({ ...form, patient_id: opt ? opt.value : '' })}
                              placeholder="Search or select patient..."
                              isClearable
                              styles={{
                                control: base => ({ ...base, borderRadius: 6, borderColor: '#d1e7ef', minHeight: 40 }),
                                menu: base => ({ ...base, zIndex: 9999 }),
                                option: (base, state) => ({ ...base, color: state.isSelected ? '#fff' : '#222c36', background: state.isSelected ? '#00b6e9' : state.isFocused ? '#e6f6fb' : '#fff' })
                              }}
                            />
                          </div>
                          <button type="button" onClick={() => setShowPatientModal(true)} style={{ background: '#e6f6fb', color: '#00b6e9', border: '1px solid #00b6e9', borderRadius: 6, padding: '8px 12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>+ Quick Add Patient</button>
                        </div>
                        <label>Chief Complaint</label>
                        <input name="chief_complaint" value={form.chief_complaint} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                        <label>Nature of Injury</label>
                        <input name="nature_of_injury" value={form.nature_of_injury} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <label>Date of Injury</label>
                            <input name="date_of_injury" type="date" value={form.date_of_injury} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', width: '100%' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label>Time of Injury</label>
                            <input name="time_of_injury" type="time" value={form.time_of_injury} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', width: '100%' }} />
                          </div>
                        </div>
                        <label>Place of Injury</label>
                        <input name="place_of_injury" value={form.place_of_injury} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                      </div>
                    )}
                    {wizardStep === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label>History of Present Illness</label>
                        <textarea name="history_of_present_illness" value={form.history_of_present_illness} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Past Medical History</label>
                        <textarea name="past_medical_history" value={form.past_medical_history} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Personal Social History</label>
                        <textarea name="personal_social_history" value={form.personal_social_history} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Obstetric Gynecologic History</label>
                        <textarea name="obstetric_gynecologic_history" value={form.obstetric_gynecologic_history} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                      </div>
                    )}
                    {wizardStep === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label>Blood Pressure</label>
                        <input name="blood_pressure" value={form.blood_pressure} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                        <label>HR</label>
                        <input name="hr" type="number" value={form.hr} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                        <label>RR</label>
                        <input name="rr" type="number" value={form.rr} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                        <label>SpO2</label>
                        <input name="spo2" type="number" value={form.spo2} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                        <label>Temperature</label>
                        <input name="temperature" type="number" value={form.temperature} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                      </div>
                    )}
                    {wizardStep === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label>Physical Examination</label>
                        <textarea name="physical_examination" value={form.physical_examination} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Imaging Findings</label>
                        <textarea name="imaging_findings" value={form.imaging_findings} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Laboratory</label>
                        <textarea name="laboratory" value={form.laboratory} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                      </div>
                    )}
                    {wizardStep === 4 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label>Diagnosis</label>
                        <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Initial Management</label>
                        <textarea name="initial_management" value={form.initial_management} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                        <label>Surgical Plan</label>
                        <textarea name="surgical_plan" value={form.surgical_plan} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef', minHeight: 60 }} />
                      </div>
                    )}
                  </div>
                  {/* Wizard Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                    <button type="button" style={{ background: '#e6f6fb', color: '#00b6e9', border: '1px solid #00b6e9', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} onClick={closeForm} disabled={loading}>Cancel</button>
                    {wizardStep < 4 ? (
                      <button type="button" style={{ background: '#00b6e9', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setWizardStep(wizardStep + 1)}>Next</button>
                    ) : (
                      <button type="submit" style={{ background: '#00b6e9', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} disabled={loading}>{editId ? 'Update' : 'Save'} Admission</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Add Patient Modal */}
          {showPatientModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowPatientModal(false)}>
              <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,182,233,0.18)', padding: 32, minWidth: 340, maxWidth: 420, width: '100%' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ color: '#00b6e9', marginBottom: 18 }}>Quick Add Patient</h3>
                <form onSubmit={handleQuickAddPatient} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input name="first_name" placeholder="First Name" value={newPatient.first_name} onChange={e => setNewPatient({ ...newPatient, first_name: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                  <input name="last_name" placeholder="Last Name" value={newPatient.last_name} onChange={e => setNewPatient({ ...newPatient, last_name: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                  <input name="birthdate" type="date" placeholder="Birthdate" value={newPatient.birthdate} onChange={e => setNewPatient({ ...newPatient, birthdate: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                  <select name="sex" value={newPatient.sex} onChange={e => setNewPatient({ ...newPatient, sex: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }}>
                    <option value="">Sex</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                  <input name="hospital_registration_number" placeholder="Hospital Registration #" value={newPatient.hospital_registration_number} onChange={e => setNewPatient({ ...newPatient, hospital_registration_number: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1e7ef' }} />
                  <div style={{ marginTop: 8 }}>
                    <button type="submit" style={{ background: '#00b6e9', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginRight: 8 }} disabled={patientLoading}>Save Patient</button>
                    <button type="button" onClick={() => setShowPatientModal(false)} style={{ background: '#e6f6fb', color: '#00b6e9', border: '1px solid #00b6e9', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} disabled={patientLoading}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
