import React, { useEffect, useState } from 'react';
import PatientFormModal from '../components/PatientFormModal';
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
  birthdate: string | null;
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
  // Removed editId state: editing is now only in AdmissionDetails
  const [loading, setLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    birthdate: null as string | null,
    sex: '',
    hospital_registration_number: '',
  });
  const [patientLoading, setPatientLoading] = useState(false);
  // const [showDetails, setShowDetails] = useState<string | null>(null); // admission id
  const [wizardStep, setWizardStep] = useState(0);
  const [formError, setFormError] = useState(''); // Form validation error message
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ADMITTED');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  function openForm() {
    setForm(initialAdmission);
    setShowForm(true);
    setWizardStep(0);
  }

  function closeForm() {
    setShowForm(false);
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
    // Only create new admissions here; editing is handled in AdmissionDetails
    const { error } = await supabase
      .from('admissions')
      .insert([form]);
    if (error) {
      setFormError(error.message);
    } else {
      await fetchAdmissions();
      closeForm();
    }
    setLoading(false);
  }

  // Quick add patient
  async function handleQuickAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setPatientLoading(true);
    // Remove empty birthdate before insert to avoid invalid date error
    const patientToInsert = { ...newPatient };
    if (!patientToInsert.birthdate) patientToInsert.birthdate = null;
    const { data, error } = await supabase
      .from('patients')
      .insert([patientToInsert])
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
              <table className="min-w-full bg-white mt-6 rounded-2xl shadow-lg border border-[#eaf6fa]">
                <thead>
                  <tr>
                    <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Patient</th>
                    <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Date & Time of Injury</th>
                    <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Chief Complaint</th>
                    <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Diagnosis</th>
                    <th className="bg-[#fafdff] text-[#222c36] font-semibold px-6 py-3 border-b border-[#eaf6fa] text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">No admissions found.</td>
                    </tr>
                  ) : (
                    admissions.map(adm => (
                      <tr key={adm.id} className="hover:bg-[#f3fafd] transition">
                        <td className="px-6 py-3 border-b border-[#eaf6fa] text-[15px] whitespace-nowrap">
                          {patients.find(p => p.id === adm.patient_id)?.first_name || 'Unknown'} {patients.find(p => p.id === adm.patient_id)?.last_name || ''}
                        </td>
                        <td className="px-6 py-3 border-b border-[#eaf6fa] text-[15px] whitespace-nowrap">
                          {(() => {
                            if (!adm.date_of_injury) return '-';
                            const dateStr = adm.date_of_injury;
                            const timeStr = adm.time_of_injury || '';
                            let dateObj: Date | null = null;
                            if (dateStr && timeStr) {
                              dateObj = new Date(`${dateStr}T${timeStr}`);
                            } else if (dateStr) {
                              dateObj = new Date(dateStr);
                            }
                            if (!dateObj || isNaN(dateObj.getTime())) return '-';
                            // Format: Fri, 12 Jul 2024, 14:30
                            const datePart = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                            const timePart = timeStr ? dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                            return `${datePart}${timePart ? ', ' + timePart : ''}`;
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
                          <a
                            href={`/admission/${adm.id}`}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[#eaf6fa] bg-white text-sky-400 hover:bg-[#fafdff] transition-colors shadow-sm"
                            title="View Admission Details"
                          >
                            {/* Eye icon */}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="currentColor"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor"/>
                            </svg>
                          </a>
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
              <div className="bg-white rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-md w-full flex flex-col max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-sky-400 text-xl font-bold mb-3">New Admission</h3>
                {/* Wizard Tabs */}
                <div className="flex gap-1 mb-4">
                  {['Patient & Injury', 'History', 'Vitals', 'Exam & Labs', 'Diagnosis'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setWizardStep(idx)}
                      className={`flex-1 py-1 border-b-2 text-sm font-semibold transition-colors duration-150 ${
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
                  <div className="flex-1 flex flex-col justify-start gap-2">
                    {/* Wizard Steps */}
                    {wizardStep === 0 && (
                      <div className="flex flex-col gap-4">
                        <label>Patient <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="min-w-[180px] flex-1">
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
                        <div className="flex gap-2 flex-wrap">
                          <div className="flex-1 min-w-[120px]">
                            <label>Date of Injury</label>
                            <input name="date_of_injury" type="date" value={form.date_of_injury} onChange={handleChange} className="px-3 py-2 rounded-md border border-[#d1e7ef] w-full" />
                          </div>
                          <div className="flex-1 min-w-[120px]">
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
                  <div className="flex justify-end gap-2 mt-4 flex-wrap">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
          {/* Custom Cancel Confirmation Modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[3000]">
              <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] max-w-sm w-full flex flex-col items-center">
                <div className="text-lg font-semibold text-[#222c36] mb-4 text-center">Are you sure you want to cancel?<br/>All unsaved changes will be lost.</div>
                <div className="flex gap-4 mt-2">
                  <button
                    className={dangerButtonClass}
                    onClick={() => {
                      setShowCancelConfirm(false);
                      closeForm();
                    }}
                  >
                    Yes, Cancel
                  </button>
                  <button
                    className={secondaryButtonClass}
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    No, Go Back
                  </button>
                </div>
              </div>
            </div>
          )}
                    {wizardStep < 4 ? (
                      <button type="button" className={buttonClass} onClick={() => setWizardStep(wizardStep + 1)}>Next</button>
                    ) : (
                      <button type="submit" className={buttonClass} disabled={loading}>Save Admission</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Add Patient Modal (reused) */}
          <PatientFormModal
            open={showPatientModal}
            onClose={() => setShowPatientModal(false)}
            onSubmit={handleQuickAddPatient}
            loading={patientLoading}
            form={newPatient}
            setForm={setNewPatient}
            title="Quick Add Patient"
            submitLabel="Save Patient"
          />
        </div>
      </main>
    </Layout>
  );
}
