import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import Card from '../components/Card';

// ...existing code...

// Utility to calculate age from birthdate string (YYYY-MM-DD)
// Utility to format date as '11 Jul 2025'
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Utility to format time as '14:00'
function formatTime(timeStr?: string): string {
  if (!timeStr) return '-';
  // Accepts 'HH:mm' or 'HH:mm:ss', returns 'HH:mm'
  const [h, m] = timeStr.split(':');
  if (h && m) return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  return '-';
}
function getAge(birthdate?: string): string | number {
  if (!birthdate) return '-';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// DRY section generator for copy
function formatAdmissionForChat(patient: Patient, admission: Admission): string {
  // Format date and time for injury
  let dateStr = '-';
  let timeStr = '-';
  if (admission.date_of_injury) {
    const dateObj = new Date(admission.date_of_injury);
    if (!isNaN(dateObj.getTime())) {
      dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }
  if (admission.time_of_injury) {
    // Ensure time is in HH:mm 24-hour format
    const [h, m] = admission.time_of_injury.split(':');
    if (h && m) {
      timeStr = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    }
  }
  const lines = [
    `Name: ${patient.first_name} ${patient.last_name}`,
    `Sex: ${patient.sex}`,
    `Age: ${getAge(patient.birthdate)}`,
    `Registered: ${patient.birthdate ? new Date(patient.birthdate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}`,
    `Hospital Reg. #: ${patient.hospital_registration_number}`,
    `Status: ${admission.status || 'ADMITTED'}`,
    `Created: ${admission.created_at ? new Date(admission.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}`,
    `Chief Complaint: ${admission.chief_complaint}`,
    `Nature of Injury: ${admission.nature_of_injury}`,
    `Date and Time of Injury: ${dateStr} ${timeStr}`,
    `Place of Injury: ${admission.place_of_injury}`,
    `History of Present Illness: ${admission.history_of_present_illness}`,
    `Past Medical History: ${admission.past_medical_history}`,
    `Personal Social History: ${admission.personal_social_history}`,
    `Obstetric/Gynecologic History: ${admission.obstetric_gynecologic_history}`,
    `Blood Pressure: ${admission.blood_pressure}`,
    `HR: ${admission.hr}`,
    `RR: ${admission.rr}`,
    `SpO2: ${admission.spo2}`,
    `Temperature: ${admission.temperature}`,
    `Physical Examination: ${admission.physical_examination}`,
    `Imaging Findings: ${admission.imaging_findings}`,
    `Laboratory: ${admission.laboratory}`,
    `Diagnosis: ${admission.diagnosis}`,
    `Initial Management: ${admission.initial_management}`,
    `Surgical Plan: ${admission.surgical_plan}`,
  ];
  return lines.join('\n');
}

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
  status?: string;
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

export default function AdmissionDetails() {
  const { id } = useParams<{ id: string }>();
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Admission>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed unused navigate
  const [copySuccess, setCopySuccess] = useState(false);
  const [dischargeLoading, setDischargeLoading] = useState(false);

  // Copy handler
  const handleCopy = () => {
    if (admission && patient) {
      const text = formatAdmissionForChat(patient, admission);
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1500);
      });
    }
  };

  // Edit modal handlers
  const openEditModal = () => {
    setEditForm(admission || {});
    setEditModalOpen(true);
    setError(null);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setError(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admission?.id) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('admissions').update(editForm).eq('id', admission.id);
    setLoading(false);
    if (error) {
      setError('Failed to update.');
    } else {
      setEditModalOpen(false);
      // Refresh admission
      const { data } = await supabase.from('admissions').select('*').eq('id', admission.id).single();
      if (data) setAdmission(data as Admission);
    }
  };
  // Discharge handler
  const handleDischarge = async () => {
    if (!admission?.id) return;
    setDischargeLoading(true);
    setError(null);
    const { error } = await supabase.from('admissions').update({ status: 'DISCHARGED' }).eq('id', admission.id);
    setDischargeLoading(false);
    if (error) {
      setError('Failed to discharge.');
    } else {
      // Refresh admission
      const { data } = await supabase.from('admissions').select('*').eq('id', admission.id).single();
      if (data) setAdmission(data as Admission);
      setEditModalOpen(false);
    }
  };

  useEffect(() => {
    async function fetchAdmission() {
      if (!id) return;
      const { data } = await supabase.from('admissions').select('*').eq('id', id).single();
      if (data) {
        setAdmission(data as Admission);
        // Fetch patient
        const { data: patientData } = await supabase.from('patients').select('*').eq('id', data.patient_id).single();
        if (patientData) setPatient(patientData as Patient);
      }
    }
    fetchAdmission();
  }, [id]);

  if (!admission || !patient) {
    return (
      <Layout>
        <main className="p-9 bg-[#f6fbfd] min-h-screen font-sans">
          <div className="max-w-6xl mx-auto">
            <Card>
              <div>Loading admission details...</div>
            </Card>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="p-0 bg-[#f6fbfd] min-h-screen font-sans">
        <div className="max-w-5xl mx-auto py-10 px-2 md:px-8">
          {/* Top Bar, Modal, Discharge Button, and all sections wrapped in fragment */}
          <>
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="text-[#222c36] text-2xl font-bold flex items-center gap-2">
                Admission Details
              </h2>
              <div className="flex gap-2 md:ml-auto">
                <button
                  onClick={handleCopy}
                  className="bg-white text-sky-400 border border-sky-400 rounded-md px-5 py-2 font-semibold text-base cursor-pointer hover:bg-sky-100 transition-colors duration-150 shadow-sm flex items-center gap-2 relative"
                  disabled={copySuccess}
                  title="Copy all details to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor"/><rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor"/></svg>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={openEditModal}
                  className="bg-white text-amber-500 border border-amber-400 rounded-md px-5 py-2 font-semibold text-base cursor-pointer hover:bg-amber-50 transition-colors duration-150 shadow-sm flex items-center gap-2"
                  disabled={editModalOpen}
                  title="Edit admission details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 1 1 2.828 2.828L11.828 15.828a2 2 0 0 1-1.414.586H7v-3a2 2 0 0 1 .586-1.414z" stroke="currentColor"/></svg>
                  Edit
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white rounded-md px-5 py-2 font-semibold hover:bg-red-600 transition-colors"
                  onClick={handleDischarge}
                  disabled={dischargeLoading || (admission?.status === 'DISCHARGED')}
                  title="Discharge patient"
                >
                  {dischargeLoading ? 'Discharging...' : 'Discharge'}
                </button>
              </div>
            </div>
            {/* Edit Admission Modal */}
            {editModalOpen && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[3000]" onClick={closeEditModal}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[420px] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <h3 className="text-sky-400 text-xl font-bold mb-4">Edit Admission</h3>
                  {error && <div className="text-red-500 font-semibold mb-2 text-center">{error}</div>}
                  <form onSubmit={handleEditSave} className="flex flex-col gap-6">
                    {/* Group 1: Status, Chief Complaint, Nature of Injury */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Status</label>
                        <input name="status" value={editForm.status || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Chief Complaint</label>
                        <input name="chief_complaint" value={editForm.chief_complaint || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Nature of Injury</label>
                        <input name="nature_of_injury" value={editForm.nature_of_injury || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Place of Injury</label>
                        <input name="place_of_injury" value={editForm.place_of_injury || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                    </div>
                    {/* Group 2: Date/Time of Injury */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Date of Injury</label>
                        <input name="date_of_injury" type="date" value={editForm.date_of_injury || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Time of Injury</label>
                        <input name="time_of_injury" type="time" value={editForm.time_of_injury || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                    </div>
                    {/* Group 3: History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">History of Present Illness</label>
                        <textarea name="history_of_present_illness" value={editForm.history_of_present_illness || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Past Medical History</label>
                        <textarea name="past_medical_history" value={editForm.past_medical_history || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Personal Social History</label>
                        <textarea name="personal_social_history" value={editForm.personal_social_history || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Obstetric/Gynecologic History</label>
                        <textarea name="obstetric_gynecologic_history" value={editForm.obstetric_gynecologic_history || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                    </div>
                    {/* Group 4: Vitals */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Blood Pressure</label>
                        <input name="blood_pressure" value={editForm.blood_pressure || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">HR</label>
                        <input name="hr" value={editForm.hr || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">RR</label>
                        <input name="rr" value={editForm.rr || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">SpO2</label>
                        <input name="spo2" value={editForm.spo2 || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Temperature</label>
                        <input name="temperature" value={editForm.temperature || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1" />
                      </div>
                    </div>
                    {/* Group 5: Exam & Labs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Physical Examination</label>
                        <textarea name="physical_examination" value={editForm.physical_examination || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Imaging Findings</label>
                        <textarea name="imaging_findings" value={editForm.imaging_findings || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Laboratory</label>
                        <textarea name="laboratory" value={editForm.laboratory || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                    </div>
                    {/* Group 6: Diagnosis & Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Diagnosis</label>
                        <textarea name="diagnosis" value={editForm.diagnosis || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Initial Management</label>
                        <textarea name="initial_management" value={editForm.initial_management || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Surgical Plan</label>
                        <textarea name="surgical_plan" value={editForm.surgical_plan || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 min-h-[40px]" />
                      </div>
                    </div>
                    {/* Modal Actions */}
                    <div className="flex flex-col md:flex-row gap-3 justify-end mt-2">
                      <button type="button" className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md px-5 py-2 font-semibold" onClick={closeEditModal} disabled={loading}>Cancel</button>
                      <button type="submit" className="bg-sky-400 text-white rounded-md px-5 py-2 font-semibold hover:bg-sky-500 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Discharge Button removed from below, now in Top Bar */}
            {/* Personal Information Section */}
            <section className="bg-white rounded-xl shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold text-[#222c36] mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Last Name</div>
                  <div className="text-base text-[#222c36]">{patient.last_name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">First Name</div>
                  <div className="text-base text-[#222c36]">{patient.first_name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Sex</div>
                  <div className="text-base text-[#222c36]">{patient.sex}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Birthdate</div>
                  <div className="text-base text-[#222c36]">{formatDate(patient.birthdate)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Age</div>
                  <div className="text-base text-[#222c36]">{getAge(patient.birthdate)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Hospital Reg. #</div>
                  <div className="text-base text-[#222c36]">{patient.hospital_registration_number}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Hospital Day</div>
                  <div className="text-base text-[#222c36]">{admission.created_at ? formatDate(admission.created_at) : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Injury Day</div>
                  <div className="text-base text-[#222c36]">
                    {admission.date_of_injury ? formatDate(admission.date_of_injury) : '-'}
                    {admission.time_of_injury ? (
                      <span> {formatTime(admission.time_of_injury)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
            {/* Admission Information Section */}
            <section className="bg-white rounded-xl shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold text-[#222c36] mb-4">Admission Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Status</div>
                    <div className="text-base text-[#222c36]">{admission.status || 'ADMITTED'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Created</div>
                    <div className="text-base text-[#222c36]">{admission.created_at ? formatDate(admission.created_at) : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Chief Complaint</div>
                    <div className="text-base text-[#222c36]">{admission.chief_complaint}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Nature of Injury</div>
                    <div className="text-base text-[#222c36]">{admission.nature_of_injury}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Date/Time of Injury</div>
                    <div className="text-base text-[#222c36]">{formatDate(admission.date_of_injury)} {formatTime(admission.time_of_injury)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Place of Injury</div>
                    <div className="text-base text-[#222c36]">{admission.place_of_injury}</div>
                  </div>
                </div>
            </section>
            {/* History Section */}
            <section className="bg-white rounded-xl shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold text-[#222c36] mb-4">History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">History of Present Illness</div>
                    <div className="text-base text-[#222c36]">{admission.history_of_present_illness}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Past Medical History</div>
                    <div className="text-base text-[#222c36]">{admission.past_medical_history}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Personal Social History</div>
                    <div className="text-base text-[#222c36]">{admission.personal_social_history}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Obstetric/Gynecologic History</div>
                    <div className="text-base text-[#222c36]">{admission.obstetric_gynecologic_history}</div>
                  </div>
                </div>
            </section>
            {/* Vitals Section */}
            <section className="bg-white rounded-xl shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold text-[#222c36] mb-4">Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Blood Pressure</div>
                    <div className="text-base text-[#222c36]">{admission.blood_pressure}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">HR</div>
                    <div className="text-base text-[#222c36]">{admission.hr}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">RR</div>
                    <div className="text-base text-[#222c36]">{admission.rr}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">SpO2</div>
                    <div className="text-base text-[#222c36]">{admission.spo2}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Temperature</div>
                    <div className="text-base text-[#222c36]">{admission.temperature}</div>
                  </div>
                </div>
            </section>
            {/* Exam & Labs Section */}
            <section className="bg-white rounded-xl shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold text-[#222c36] mb-4">Exam & Labs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Physical Examination</div>
                    <div className="text-base text-[#222c36]">{admission.physical_examination}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Imaging Findings</div>
                    <div className="text-base text-[#222c36]">{admission.imaging_findings}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Laboratory</div>
                    <div className="text-base text-[#222c36]">{admission.laboratory}</div>
                  </div>
                </div>
            </section>
            {/* Diagnosis & Plan Section */}
            <section className="bg-white rounded-xl shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold text-[#222c36] mb-4">Diagnosis & Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Diagnosis</div>
                    <div className="text-base text-[#222c36]">{admission.diagnosis}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Initial Management</div>
                    <div className="text-base text-[#222c36]">{admission.initial_management}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">Surgical Plan</div>
                    <div className="text-base text-[#222c36]">{admission.surgical_plan}</div>
                  </div>
                </div>
            </section>
            {/* Edit Mode Section (removed, now all fields are inline editable above) */}
          </>
        </div>
      </main>
    </Layout>
  );
}
