import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import Card from '../components/Card';
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

// Tailwind button classes
const buttonClass =
  'bg-sky-400 text-white border-none rounded-md px-5 py-2 font-semibold cursor-pointer text-base transition-colors duration-150 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed';
const secondaryButtonClass =
  'bg-[#e6f6fb] text-sky-400 border border-sky-400 rounded-md px-5 py-2 font-semibold cursor-pointer text-base transition-colors duration-150 hover:bg-sky-100 disabled:opacity-60 disabled:cursor-not-allowed';
const dangerButtonClass =
  'bg-red-500 text-white border-none rounded-md px-5 py-2 font-semibold cursor-pointer text-base transition-colors duration-150 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed';

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
      <main className="p-9 bg-[#f6fbfd] min-h-screen font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[#222c36] text-2xl font-bold m-0">Admissions</h2>
            <button className={buttonClass} onClick={() => openForm()}>New Admission</button>
          </div>
          <Card>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <input
                type="text"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (e.target.value === '') setSearch('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') setSearch(searchInput);
                }}
                className="w-64 px-3 py-2 rounded-md border border-[#d1e7ef] text-base mr-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Search by patient name or reg #"
              />
              <button className={buttonClass} onClick={() => setSearch(searchInput)}>
                Search
              </button>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="ml-6 px-3 py-2 rounded-md border border-[#d1e7ef] min-w-[140px] text-base focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Filter by date"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="ml-3 px-3 py-2 rounded-md border border-[#d1e7ef] min-w-[140px] text-base focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="ADMITTED">Admitted</option>
                <option value="DISCHARGE">Discharged</option>
                <option value="">All Statuses</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mt-6 bg-white min-w-[900px]">
                <thead>
                  <tr>
                    <th className="bg-[#e6f6fb] text-[#222c36] font-semibold py-3 px-2 border-b border-[#d1e7ef] text-left">Patient</th>
                    <th className="bg-[#e6f6fb] text-[#222c36] font-semibold py-3 px-2 border-b border-[#d1e7ef] text-left">Chief Complaint</th>
                    <th className="bg-[#e6f6fb] text-[#222c36] font-semibold py-3 px-2 border-b border-[#d1e7ef] text-left">Date/Time of Injury</th>
                    <th className="bg-[#e6f6fb] text-[#222c36] font-semibold py-3 px-2 border-b border-[#d1e7ef] text-left">Diagnosis</th>
                    <th className="bg-[#e6f6fb] text-[#222c36] font-semibold py-3 px-2 border-b border-[#d1e7ef] text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">No admissions found.</td>
                    </tr>
                  ) : (
                    admissions.map(adm => (
                      <tr key={adm.id} className="bg-[#fafdff] rounded-lg">
                        <td className="py-2 px-2 border-b border-[#eaf6fa] text-base">{patients.find(p => p.id === adm.patient_id)?.first_name || 'Unknown'} {patients.find(p => p.id === adm.patient_id)?.last_name || ''}</td>
                        <td className="py-2 px-2 border-b border-[#eaf6fa] text-base">{adm.chief_complaint}</td>
                        <td className="py-2 px-2 border-b border-[#eaf6fa] text-base">{adm.date_of_injury} {adm.time_of_injury}</td>
                        <td className="py-2 px-2 border-b border-[#eaf6fa] text-base">{adm.diagnosis}</td>
                        <td className="py-2 px-2 border-b border-[#eaf6fa] text-base">
                          <a
                            href={`/admission/${adm.id}`}
                            className={buttonClass + ' mr-2 inline-block text-center'}
                          >
                            Show
                          </a>
                          <button
                            className={secondaryButtonClass + ' mr-2'}
                            onClick={() => openForm(adm)}
                          >
                            Edit
                          </button>
                          <button
                            className={dangerButtonClass}
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
          </Card>

          {/* ...existing code... (removed inline admission details display) */}

          {/* Admission Modal Wizard */}
          {showForm && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[2000]" onClick={closeForm}>
              <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[420px] max-w-lg w-full min-h-[540px] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-sky-400 text-xl font-bold mb-4">{editId ? 'Update Admission' : 'New Admission'}</h3>
                {/* Wizard Tabs */}
                <div className="flex gap-2 mb-6">
                  {['Patient & Injury', 'History', 'Vitals', 'Exam & Labs', 'Diagnosis'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setWizardStep(idx)}
                      className={`flex-1 py-2 border-b-2 text-base font-semibold transition-colors duration-150 ${
                        wizardStep === idx
                          ? 'border-sky-400 text-sky-400 bg-sky-50'
                          : 'border-[#e6f6fb] text-slate-400 bg-transparent hover:bg-sky-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1" onKeyDown={e => {
                  if (e.key === 'Enter' && wizardStep < 4) e.preventDefault();
                }}>
                  {formError && (
                    <div className="text-red-500 font-semibold mb-2 text-center">{formError}</div>
                  )}
                  <div className="flex-1 flex flex-col justify-start">
                    {/* Wizard Steps */}
                    {wizardStep === 0 && (
                      <div className="flex flex-col gap-4">
                        <label>Patient <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2">
                          <div className="min-w-[260px] flex-1">
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
                          <button type="button" onClick={() => setShowPatientModal(true)} className={secondaryButtonClass + ' px-3 py-2 text-base font-semibold'}>+ Quick Add Patient</button>
                        </div>
                        <label>Chief Complaint</label>
                        <input name="chief_complaint" value={form.chief_complaint} onChange={handleChange} required className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                        <label>Nature of Injury</label>
                        <input name="nature_of_injury" value={form.nature_of_injury} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label>Date of Injury</label>
                            <input name="date_of_injury" type="date" value={form.date_of_injury} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] w-full" />
                          </div>
                          <div className="flex-1">
                            <label>Time of Injury</label>
                            <input name="time_of_injury" type="time" value={form.time_of_injury} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] w-full" />
                          </div>
                        </div>
                        <label>Place of Injury</label>
                        <input name="place_of_injury" value={form.place_of_injury} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                      </div>
                    )}
                    {wizardStep === 1 && (
                      <div className="flex flex-col gap-4">
                        <label>History of Present Illness</label>
                        <textarea name="history_of_present_illness" value={form.history_of_present_illness} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Past Medical History</label>
                        <textarea name="past_medical_history" value={form.past_medical_history} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Personal Social History</label>
                        <textarea name="personal_social_history" value={form.personal_social_history} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Obstetric Gynecologic History</label>
                        <textarea name="obstetric_gynecologic_history" value={form.obstetric_gynecologic_history} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                      </div>
                    )}
                    {wizardStep === 2 && (
                      <div className="flex flex-col gap-4">
                        <label>Blood Pressure</label>
                        <input name="blood_pressure" value={form.blood_pressure} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                        <label>HR</label>
                        <input name="hr" type="number" value={form.hr} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                        <label>RR</label>
                        <input name="rr" type="number" value={form.rr} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                        <label>SpO2</label>
                        <input name="spo2" type="number" value={form.spo2} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                        <label>Temperature</label>
                        <input name="temperature" type="number" value={form.temperature} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                      </div>
                    )}
                    {wizardStep === 3 && (
                      <div className="flex flex-col gap-4">
                        <label>Physical Examination</label>
                        <textarea name="physical_examination" value={form.physical_examination} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Imaging Findings</label>
                        <textarea name="imaging_findings" value={form.imaging_findings} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Laboratory</label>
                        <textarea name="laboratory" value={form.laboratory} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                      </div>
                    )}
                    {wizardStep === 4 && (
                      <div className="flex flex-col gap-4">
                        <label>Diagnosis</label>
                        <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Initial Management</label>
                        <textarea name="initial_management" value={form.initial_management} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                        <label>Surgical Plan</label>
                        <textarea name="surgical_plan" value={form.surgical_plan} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] min-h-[60px]" />
                      </div>
                    )}
                  </div>
                  {/* Wizard Navigation */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className={secondaryButtonClass} onClick={closeForm} disabled={loading}>Cancel</button>
                    {wizardStep < 4 ? (
                      <button type="button" className={buttonClass} onClick={() => setWizardStep(wizardStep + 1)}>Next</button>
                    ) : (
                      <button type="submit" className={buttonClass} disabled={loading}>{editId ? 'Update' : 'Save'} Admission</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Add Patient Modal */}
          {showPatientModal && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[2000]" onClick={() => setShowPatientModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[340px] max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-sky-400 text-xl font-bold mb-4">Quick Add Patient</h3>
                <form onSubmit={handleQuickAddPatient} className="flex flex-col gap-3">
                  <input name="first_name" placeholder="First Name" value={newPatient.first_name} onChange={e => setNewPatient({ ...newPatient, first_name: e.target.value })} required className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                  <input name="last_name" placeholder="Last Name" value={newPatient.last_name} onChange={e => setNewPatient({ ...newPatient, last_name: e.target.value })} required className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                  <input name="birthdate" type="date" placeholder="Birthdate" value={newPatient.birthdate} onChange={e => setNewPatient({ ...newPatient, birthdate: e.target.value })} required className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                  <select name="sex" value={newPatient.sex} onChange={e => setNewPatient({ ...newPatient, sex: e.target.value })} required className="px-3 py-2 rounded-md border border-[#d1e7ef]">
                    <option value="">Sex</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                  <input name="hospital_registration_number" placeholder="Hospital Registration #" value={newPatient.hospital_registration_number} onChange={e => setNewPatient({ ...newPatient, hospital_registration_number: e.target.value })} required className="px-3 py-2 rounded-md border border-[#d1e7ef]" />
                  <div className="mt-2 flex gap-2">
                    <button type="submit" className={buttonClass + ' mr-2'} disabled={patientLoading}>Save Patient</button>
                    <button type="button" onClick={() => setShowPatientModal(false)} className={secondaryButtonClass} disabled={patientLoading}>Cancel</button>
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
