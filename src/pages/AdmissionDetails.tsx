
import { useEffect, useState } from 'react';
// Utility to format admission and patient data for copying (chat-friendly)
function formatAdmissionForChat(patient: Patient, admission: Admission): string {
  return `*Patient Information:*
Name: ${patient.first_name} ${patient.last_name}
Sex: ${patient.sex}
Age: ${getAge(patient.birthdate)}
Registered: ${patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : '-'}
Patient ID: ${patient.id}
Hospital Reg. #: ${patient.hospital_registration_number}

*Admission Details:*
Admission ID: ${admission.id}
Status: ${admission.status || 'ADMITTED'}
Created: ${admission.created_at ? new Date(admission.created_at).toLocaleString() : '-'}

*Injury & Admission:*
Chief Complaint: ${admission.chief_complaint}
Nature of Injury: ${admission.nature_of_injury}
Date/Time of Injury: ${admission.date_of_injury} ${admission.time_of_injury}
Place of Injury: ${admission.place_of_injury}

*History:*
History of Present Illness: ${admission.history_of_present_illness}
Past Medical History: ${admission.past_medical_history}
Personal Social History: ${admission.personal_social_history}
Obstetric/Gynecologic History: ${admission.obstetric_gynecologic_history}

*Vitals:*
Blood Pressure: ${admission.blood_pressure}
HR: ${admission.hr}
RR: ${admission.rr}
SpO2: ${admission.spo2}
Temperature: ${admission.temperature}

*Exam & Labs:*
Physical Examination: ${admission.physical_examination}
Imaging Findings: ${admission.imaging_findings}
Laboratory: ${admission.laboratory}

*Diagnosis & Plan:*
Diagnosis: ${admission.diagnosis}
Initial Management: ${admission.initial_management}
Surgical Plan: ${admission.surgical_plan}
`;
}
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import Card from '../components/Card';

// Utility to calculate age from birthdate string (YYYY-MM-DD)
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

// InfoItem component for consistent display (plain JS, no destructuring, JSX-based, defined before main component)
function InfoItem(props: { label: string; value?: string }) {
  return (
    <div className="mb-2">
      <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">{props.label}</div>
      <div className="text-base text-[#222c36] bg-slate-50 rounded px-3 py-2 min-h-[32px] break-words border border-slate-100">
        {props.value ? props.value : <span className="text-slate-300">—</span>}
      </div>
    </div>
  );
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
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
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
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="bg-white text-sky-400 border border-sky-400 rounded-md px-5 py-2 font-semibold text-base cursor-pointer hover:bg-sky-100 transition-colors duration-150 shadow-sm"
            >
              Back
            </button>
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
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm mb-6 overflow-hidden text-sm">
            <div className="flex flex-col items-center justify-center bg-[#f6fbfd] px-4 py-6 md:w-1/4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#cbd5e1"/><rect x="4" y="16" width="16" height="6" rx="3" fill="#cbd5e1"/></svg>
              </div>
              <div className="font-bold text-base text-[#222c36] text-center leading-tight">{patient.first_name} {patient.last_name}</div>
              <div className="text-slate-400 text-xs text-center">{patient.hospital_registration_number}</div>
            </div>
            <div className="flex-1 px-4 py-6 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-sky-400 font-bold text-xs tracking-wide uppercase bg-[#e6f6fb] px-2 py-1 rounded">Patient Information</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Sex</div>
                  <div className="font-bold text-[#222c36]">{patient.sex}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Age</div>
                  <div className="font-bold text-[#222c36]">{getAge(patient.birthdate)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Registered Date</div>
                  <div className="font-bold text-[#222c36]">{patient.birthdate ? new Date(patient.birthdate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Patient ID</div>
                  <div className="font-bold text-[#222c36] break-all">{patient.id}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Hospital Reg. #</div>
                  <div className="font-bold text-[#222c36]">{patient.hospital_registration_number}</div>
                </div>
              </div>
              {/* Admission Info Below Patient Info */}
              <div className="my-4">
                <div className="border-t border-slate-200 my-3"></div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-bold text-sky-400 text-sm">Admission ID:</span>
                    <span className="font-bold text-[#222c36] text-sm break-all">{admission.id}</span>
                    <span className="font-semibold text-xs text-sky-400 bg-[#e6f6fb] rounded px-2 py-1">Status: {admission.status || 'ADMITTED'}</span>
                  </div>
                  <div className="text-slate-400 text-xs sm:text-right sm:ml-4">Created: {admission.created_at ? new Date(admission.created_at).toLocaleString() : '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Organized Admission Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: History & Injury */}
            <div className="flex flex-col gap-8">
              <section className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sky-400 font-bold mb-4 text-lg flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                  Injury & Admission
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem label="Chief Complaint" value={admission.chief_complaint} />
                  <InfoItem label="Nature of Injury" value={admission.nature_of_injury} />
                  <InfoItem label="Date/Time of Injury" value={`${admission.date_of_injury} ${admission.time_of_injury}`} />
                  <InfoItem label="Place of Injury" value={admission.place_of_injury} />
                </div>
              </section>
              <section className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sky-400 font-bold mb-4 text-lg flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                  History
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem label="History of Present Illness" value={admission.history_of_present_illness} />
                  <InfoItem label="Past Medical History" value={admission.past_medical_history} />
                  <InfoItem label="Personal Social History" value={admission.personal_social_history} />
                  <InfoItem label="Obstetric/Gynecologic History" value={admission.obstetric_gynecologic_history} />
                </div>
              </section>
            </div>
            {/* Right: Vitals, Exam, Diagnosis */}
            <div className="flex flex-col gap-8">
              <section className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sky-400 font-bold mb-4 text-lg flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                  Vitals
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Blood Pressure" value={admission.blood_pressure} />
                  <InfoItem label="HR" value={admission.hr} />
                  <InfoItem label="RR" value={admission.rr} />
                  <InfoItem label="SpO2" value={admission.spo2} />
                  <InfoItem label="Temperature" value={admission.temperature} />
                </div>
              </section>
              <section className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sky-400 font-bold mb-4 text-lg flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                  Exam & Labs
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem label="Physical Examination" value={admission.physical_examination} />
                  <InfoItem label="Imaging Findings" value={admission.imaging_findings} />
                  <InfoItem label="Laboratory" value={admission.laboratory} />
                </div>
              </section>
              <section className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sky-400 font-bold mb-4 text-lg flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                  Diagnosis & Plan
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem label="Diagnosis" value={admission.diagnosis} />
                  <InfoItem label="Initial Management" value={admission.initial_management} />
                  <InfoItem label="Surgical Plan" value={admission.surgical_plan} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
