import moment from 'moment';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Button } from "@/components/ui/button";
import { PostgrestError } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import {
  FileText,
  Eye
} from "lucide-react"
import { Badge } from '@/components/ui/badge';

function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ADMITTED');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchAdmissions() {
      setLoading(true);
      setError(null);
      // Build Supabase query
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from('admissions')
        .select(`*, patients (id, first_name, last_name, birthdate, sex, hospital_registration_number)`, { count: 'exact' })
        .range(from, to);

      // Filter by date
      if (filterDate) {
        query = query.eq('date_of_injury', filterDate);
      }
      // Filter by status
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error, count } = await query;
      if (error) {
        setError(error);
        setAdmissions([]);
        setFilteredAdmissions([]);
      } else {
        setAdmissions(data || []);
        setTotalPages(count ? Math.ceil(count / pageSize) : 1);
      }
      setLoading(false);
    }
    fetchAdmissions();
  }, [filterDate, filterStatus, page, pageSize]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredAdmissions(admissions);
    } else {
      setFilteredAdmissions(
        admissions.filter(admission => {
          const patient = admission.patients || {};
          const q = searchQuery.toLowerCase();
          return (
            (patient.first_name && patient.first_name.toLowerCase().includes(q)) ||
            (patient.last_name && patient.last_name.toLowerCase().includes(q)) ||
            (patient.hospital_registration_number && patient.hospital_registration_number.toLowerCase().includes(q))
          );
        })
      );
    }
  }, [searchQuery, admissions]);

  // if (loading) return <div>Loading admissions...</div>;
  if (error) return <div>Error: {error?.message || String(error)}</div>;

  return (
    <main className='flex-1 mx-5 my-5 p-4 border bg-white rounded-lg shadow-md min-h-[85vh]'>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admissions</h1>
        <Button onClick={() => window.location.href = '/admission/new'}>New Admission</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          onChange={e => setSearchInput(e.target.value)}
          value={searchInput}
          className="w-64 px-3 py-2 rounded-md border border-[#d1e7ef] text-base mr-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Search by patient name or reg #"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setSearchQuery(searchInput);
              setPage(1);
            }
          }}
        />
        <Button onClick={() => { setSearchQuery(searchInput); setPage(1); }}>
          Search
        </Button>
        <input
          type="date"
          value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setPage(1); }}
          className="ml-6 px-3 py-2 rounded-md border border-[#d1e7ef] min-w-[140px] text-base focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Filter by date"
        />
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="ml-3 px-3 py-2 rounded-md border border-[#d1e7ef] min-w-[140px] text-base focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          <option value="">All Statuses</option>
          <option value="ADMITTED">Admitted</option>
          <option value="DISCHARGED">Discharged</option>
        </select>
      </div>
      <div className="admissions-list">
      {
        loading ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

        ) : error ? (
          <div>Error: {error.message}</div>
        ) : filteredAdmissions.length === 0 ? (
          <p>No admissions found.</p>
        ) : (
          filteredAdmissions.map((admission) => {
            const patient = admission.patients || {};
            const age = Math.floor(moment().diff(moment(patient.birthdate), 'years', true));
            const injuryDay = Math.floor(moment().diff(moment(admission.date_of_injury), 'days', true));
            return (
              <div
                className="flex gap-3 border border-gray-300 rounded-lg p-2 mb-4"
                key={admission.id}
              >
                <div className="flex flex-col justify-center p-2 w-1/4">
                  <span className="font-bold text-lg">{`${patient.last_name}, ${patient.first_name}`}</span>
                  <span className="font-semibold mb-2">{`${age} ${patient.sex}`}</span>
                  <Badge className={`capitalize px-3 py-1 mx-auto mb-2 ${admission.status === 'discharged' ? 'bg-red-500 text-white' : admission.status === 'admitted' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>{admission.status || '-'}</Badge>
                  <span className="font-semibold">{`DOI: ${moment(admission.date_of_injury).format('MM/DD/YYYY')}`}</span>
                  <span className="font-semibold">{`Admitted: ${moment(admission.created_at).format('MM/DD/YYYY')}`}</span>
                  <span className="font-bold">{`Injury day: ${injuryDay}`}</span>
                  <span className="font-bold"></span>
                  
                  <Badge className={`capitalize px-3 py-1 mt-2 mx-auto ${admission.severity === 'critical' ? 'bg-red-600 text-white' : admission.severity === 'severe' ? 'bg-orange-500 text-white' : admission.severity === 'moderate' ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'}`}>{admission.severity || '-'}</Badge>
                </div>
                <div className="flex flex-1 gap-1">
                  <div className="flex flex-col h-full w-1/2">
                    <div className="flex-1 items-center p-2">
                      <h1 className="font-bold">Diagnosis</h1>
                      <span className="flex-1">{admission.diagnosis || 'N/A'}</span>
                    </div>
                    <div className="flex-1 items-center p-2">
                      <h1 className="font-bold">Surgical Plan</h1>
                      <span className="flex-1">{admission.surgical_plan || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col h-full w-1/2">
                    <div className="flex-1 items-center p-2">
                      <h1 className="font-bold">Surgery Done</h1>
                      <span className="flex flex-col">
                        <span>{admission.surgery_done}</span>
                        <span>{admission.surgery_done_at ? `(${admission.surgery_done_at})` : ''}</span>
                      </span>
                    </div>
                    <div className="flex-1 items-center p-2">
                      <h1 className="font-bold">Remarks</h1>
                      <span className="flex-1">{admission.remarks || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center flex-none">
                  <Button variant="outline" asChild>
                    <a
                      href={`/admission/${admission.id}`}
                      className="inline-flex items-center justify-center shadow-sm border w-10 h-10"
                      title="View Admission Details"
                    >
                      <Eye className="size-4" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href="#"
                      className="inline-flex items-center justify-center shadow-sm border w-10 h-10"
                      title="View Admission Details"
                    >
                      <FileText className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </main>
  );
}

export default AdmissionsPage;