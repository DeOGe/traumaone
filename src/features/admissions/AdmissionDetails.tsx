import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

// Utility functions
import { formatDate, formatTime, getAge } from '../../lib/utils';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: string;
  hospital_registration_no: string;
}

interface Admission {
  id: string;
  created_at: string;
  date_of_injury: string;
  time_of_injury: string;
  severity: string;
  status: string;
  chief_complaint: string;
  diagnosis: string;
  physical_examination: string;
  initial_management: string;
  initial_trauma_score: string;
  final_trauma_score: string;
  gcs: string;
  blood_pressure: string;
  hr: number;
  spo2: number;
  temperature: number;
  surgical_plan?: string;
  nature_of_injury?: string;
  place_of_injury?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  personal_social_history?: string;
  obstetric_gynecologic_history?: string;
  rr?: number;
  imaging_findings?: string;
  surgery_done?: boolean;
  surgery_done_at?: string;
  remarks?: string;
  patients: Patient;
}

export default function AdmissionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdmissionDetails() {
      if (!id) {
        setLoading(false);
        setError('No admission ID provided.');
        return;
      }
      const res = await supabase
        .from('admissions')
        .select('*, patients(*)')
        .eq('id', id)
        .single();
      if (res && res.data) setAdmission(res.data as Admission);
      setLoading(false);
    }
    fetchAdmissionDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-red-500">
        <AlertCircle className="h-8 w-8" />
        <p className="mt-2">Failed to load admission details: {error}</p>
        <Button className="mt-4" onClick={() => navigate('/admissions')}>Go back</Button>
      </div>
    );
  }

  const age = getAge(admission.patients.birthdate);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Sticky Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admissions')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (!admission) return;
              const details = [
                `Name: ${admission.patients.first_name} ${admission.patients.last_name}`,
                `Sex: ${admission.patients.sex}`,
                `Age: ${getAge(admission.patients.birthdate)}`,
                '',
                `Chief Complaint: ${admission.chief_complaint || '-'}`,
                '',
                `Nature of Injury: ${admission.nature_of_injury || '-'}`,
                `Date of injury: ${formatDate(admission.date_of_injury)}`,
                `Time of Injury: ${formatTime(admission.time_of_injury)}`,
                `Place of Injury: ${admission.place_of_injury || '-'}`,
                '',
                `History of Present Illness:\n${admission.history_of_present_illness || '-'}`,
                '',
                `Past Medical History:\n${admission.past_medical_history || '-'}`,
                `Personal Social History: ${admission.personal_social_history || '-'}`,
                `Obstetric/Gynecologic History: ${admission.obstetric_gynecologic_history || '-'}`,
                '',
                `Blood Pressure: ${admission.blood_pressure || '-'}`,
                `HR: ${admission.hr ?? '-'}`,
                `RR: ${admission.rr ?? '-'}`,
                `SpO2: ${admission.spo2 ?? '-'}`,
                `Temperature: ${admission.temperature ?? '-'}`,
                '',
                `Physical Examination:\n${admission.physical_examination || '-'}`,
                '',
                `Imaging Findings:\n${admission.imaging_findings || '-'}`,
                '',
                `Diagnosis:\n${admission.diagnosis || '-'}`,
                '',
                `Initial Management: \n${admission.initial_management || '-'}`,
                '',
                `Surgical Plan:\n${admission.surgical_plan || '-'}`
              ].join('\n');
              navigator.clipboard.writeText(details);
            }}
            variant="outline"
          >
            Copy
          </Button>
          <Button
            onClick={async () => {
              if (!admission) return;
              try {
                // Optionally show loading state
                await supabase
                  .from('admissions')
                  .update({ status: 'DISCHARGED' })
                  .eq('id', admission.id);
                window.location.reload();
              } catch {
                alert('Failed to update status.');
              }
            }}
            variant="destructive_outline"
          >
            Discharge
          </Button>
          <Button onClick={() => window.location.href = `/admission/${id}/update`}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column for Patient and Injury Details */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className='flex flex-col gap-2'>
                  <h1 className='text-2xl font-bold'>{`${admission.patients.first_name} ${admission.patients.last_name}`}</h1>
                  <div className='flex gap-2'>
                    <div className='flex-1'>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={`capitalize px-3 py-1 ${admission.status === 'discharged' ? 'bg-red-500 text-white' : admission.status === 'admitted' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>{admission.status || '-'}</Badge>
                    </div>
                    <div className='flex-1'>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <Badge className={`capitalize px-3 py-1 ${admission.severity === 'critical' ? 'bg-red-600 text-white' : admission.severity === 'severe' ? 'bg-orange-500 text-white' : admission.severity === 'moderate' ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'}`}>{admission.severity || '-'}</Badge>
                    </div>
                  </div>
               </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{age} years</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Sex</p>
                  <p className="font-medium">{admission.patients.sex}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Hospital Reg. No.</p>
                  <p className="font-medium">{admission.patients.hospital_registration_no || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Injury Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Chief Complaint</p>
                  <p className="font-medium">{admission.chief_complaint || '-'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Injury</p>
                  <p className="font-medium">{formatDate(admission.date_of_injury)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Time of Injury</p>
                  <p className="font-medium">{formatTime(admission.time_of_injury)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column for Medical Information */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vitals & Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Initial Trauma Score</p>
                  <p className="font-medium">{admission.initial_trauma_score || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Final Trauma Score</p>
                  <p className="font-medium">{admission.final_trauma_score || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GCS</p>
                  <p className="font-medium">{admission.gcs || '-'}</p>
                </div>
                <div className="col-span-full">
                  <p className="text-sm text-muted-foreground">Vitals</p>
                  <div className="flex flex-wrap gap-4">
                    <Badge variant="secondary">BP: {admission.blood_pressure || '-'}</Badge>
                    <Badge variant="secondary">HR: {admission.hr ?? '-'}</Badge>
                    <Badge variant="secondary">SpO2: {admission.spo2 ?? '-'}%</Badge>
                    <Badge variant="secondary">Temp: {admission.temperature ?? '-'}°C</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Physical Examination</p>
                <p className="text-base">{admission.physical_examination || '-'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Initial Management</p>
                <p className="text-base">{admission.initial_management || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnosis & Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Diagnosis</p>
                <p className="text-base">{admission.diagnosis || '-'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Surgical Plan</p>
                <p className="text-base">{admission.surgical_plan || '-'}</p>
              </div>
      <Separator />
      <div>
        <p className="text-sm text-muted-foreground">Surgery Done</p>
        <p className="text-base">{admission.surgery_done || '-'}</p>
      </div>
      <Separator />
      <div>
        <p className="text-sm text-muted-foreground">Surgery Done At</p>
        <p className="text-base">{admission.surgery_done_at ? formatDate(admission.surgery_done_at) : '-'}</p>
      </div>
      <Separator />
      <div>
        <p className="text-sm text-muted-foreground">Remarks</p>
        <p className="text-base">{admission.remarks || '-'}</p>
      </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}