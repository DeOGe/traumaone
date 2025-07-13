
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import PatientFormModal from '../components/PatientFormModal';
import PatientAdmissionHistory from './PatientAdmissionHistory';


const PAGE_SIZE = 15;

// Profile picture upload removed


type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: string;
  hospital_registration_number: string;
  created_at: string;
  blood_type?: string;
  profile_picture?: string;
};

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    birthdate: string;
    sex: string;
    hospital_registration_number: string;
    blood_type?: string;
  }>({
    first_name: '',
    last_name: '',
    birthdate: '',
    sex: '',
    hospital_registration_number: '',
    blood_type: '',
  });
  // Profile picture state removed
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [fetching, setFetching] = useState(false);

  // Fetch patients from Supabase with search and pagination
  async function fetchPatients() {
    setFetching(true);
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search.trim() !== '') {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,hospital_registration_number.ilike.%${search}%`
      );
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await query.range(from, to);

    if (!error && data) {
      setPatients(data as Patient[]);
      setTotalPatients(count || 0);
      // Auto-select first patient if none selected
      if (!selectedPatient && data.length > 0) setSelectedPatient(data[0] as Patient);
      // If selected patient is not in the new list, select first
      if (selectedPatient && !data.find((p: Patient) => p.id === selectedPatient.id) && data.length > 0) setSelectedPatient(data[0] as Patient);
      if (data.length === 0) setSelectedPatient(null);
    } else {
      setPatients([]);
      setTotalPatients(0);
      setSelectedPatient(null);
    }
    setFetching(false);
  }

  // handleChange is no longer needed; PatientFormModal handles input changes

  function openNewPatientModal() {
    setForm({
      first_name: '',
      last_name: '',
      birthdate: '',
      sex: '',
      hospital_registration_number: '',
      blood_type: '',
    });
    setEditId(null);
    setShowModal(true);
  }


  function openEditPatientModal(patient: Patient) {
    setForm({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      birthdate: patient.birthdate || '',
      sex: patient.sex || '',
      hospital_registration_number: patient.hospital_registration_number || '',
      blood_type: patient.blood_type || '',
    });
    setEditId(patient.id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditId(null);
    setForm({
      first_name: '',
      last_name: '',
      birthdate: '',
      sex: '',
      hospital_registration_number: '',
      blood_type: '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let patientId = editId || crypto.randomUUID();
    // Prevent sending empty string for birthdate (should be null)
    const formToSend = {
      ...form,
      birthdate: form.birthdate === '' ? null : form.birthdate,
    };
    if (editId) {
      // Update
      const { data, error } = await supabase
        .from('patients')
        .update(formToSend)
        .eq('id', editId)
        .select();
      if (!error) {
        await fetchPatients();
        // Refresh selectedPatient with latest data
        if (data && data[0]) setSelectedPatient(data[0]);
        closeModal();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('patients')
        .insert([{ ...formToSend, id: patientId }]);
      if (!error) {
        // If on last page and not full, stay, else go to first page
        if (patients.length < PAGE_SIZE) {
          await fetchPatients();
        } else {
          setPage(1);
        }
        closeModal();
      }
    }
    setLoading(false);
  }

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Fetch patients on mount, page, or search change
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line
  }, [page, search]);

  // Pagination controls
  const totalPages = Math.ceil(totalPatients / PAGE_SIZE);

  // Profile picture update logic removed

  return (
    <Layout>
      <main className="p-9 bg-[#f6fbfd] min-h-screen font-sans">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[#222c36] m-0 text-2xl font-bold">Patients</h2>
            <button className="bg-[#00b6e9] text-white rounded-md px-5 py-2 font-semibold text-base hover:bg-[#009fcc] transition" onClick={openNewPatientModal}>New Patient</button>
          </div>
          {/* Search and List Row */}
          <div className="flex gap-8 items-start">
            {/* Left: Patient List */}
            <div className="w-[340px] min-w-[280px] bg-white rounded-2xl shadow-lg border border-[#eaf6fa] flex flex-col h-[80vh] overflow-hidden">
              <div className="px-5 pt-5 pb-0 border-b border-[#eaf6fa] bg-[#fafdff]">
                <div className="flex gap-2 items-center mb-2.5">
                  <input
                    type="text"
                    placeholder="Search by name or registration #"
                    value={searchInput}
                    onChange={e => {
                      setSearchInput(e.target.value);
                      if (e.target.value === '') setSearch('');
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setSearch(searchInput);
                    }}
                    className="flex-1 px-2 py-2 rounded-md border border-[#d1e7ef] text-base focus:outline-none"
                    disabled={fetching}
                  />
                  <button
                    className="bg-[#00b6e9] text-white rounded-md px-4 py-2 font-semibold text-base hover:bg-[#009fcc] transition"
                    onClick={() => setSearch(searchInput)}
                    disabled={fetching}
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {fetching ? (
                  <div className="p-5 text-[#7a8fa4]">Loading...</div>
                ) : patients.length === 0 ? (
                  <div className="p-5 text-[#7a8fa4]">No patients found.</div>
                ) : (
                  patients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`px-4 py-3 border-b border-[#eaf6fa] cursor-pointer transition font-medium text-[17px] ${selectedPatient?.id === p.id ? 'bg-[#e6f6fb] text-[#00b6e9] font-bold' : 'bg-white text-[#222c36]'}`}
                    >
                      {p.first_name} {p.last_name}
                      <div className="text-xs text-[#7a8fa4] font-normal">{p.hospital_registration_number}</div>
                    </div>
                  ))
                )}
              </div>
              {/* Pagination */}
              <div className="flex justify-center items-center py-3 border-t border-[#eaf6fa] bg-[#fafdff]">
                <button
                  className="bg-[#e6f6fb] text-[#00b6e9] border border-[#00b6e9] rounded-md px-4 py-2 font-semibold mr-2 disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || fetching}
                >
                  Previous
                </button>
                <span className="font-medium text-[#222c36] mx-3">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  className="bg-[#e6f6fb] text-[#00b6e9] border border-[#00b6e9] rounded-md px-4 py-2 font-semibold disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || fetching || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
            {/* Right: Patient Details & History */}
            <div className="flex-1 min-w-0">
              {!selectedPatient ? (
                <div className="bg-white rounded-2xl shadow-lg border border-[#eaf6fa] min-h-[220px] flex items-center justify-center text-[#7a8fa4] text-lg">
                  Select a patient to view details.
                </div>
              ) : (
                <div className="w-full max-w-[1000px] mx-auto">
                  <div className="bg-white rounded-2xl shadow-lg border border-[#eaf6fa] mb-10 w-full max-w-full p-0 flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 pt-8 pb-2">
                      <button
                        className="ml-auto bg-[#e6f6fb] text-[#00b6e9] border border-[#00b6e9] rounded-md px-4 py-2 font-semibold text-sm hover:bg-[#d1e7ef] transition"
                        onClick={() => openEditPatientModal(selectedPatient)}
                      >
                        Edit Patient
                      </button>
                    </div>
                    <div className="px-8 pb-8">
                      <div className="mb-2 text-base font-semibold text-[#222c36]">Patient Record</div>
                      <div className="bg-[#f9fafb] rounded-xl p-6 flex flex-col md:flex-row gap-8">
                        {/* Left: Patient Summary */}

                        <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#eaf6fa] pb-6 md:pb-0 md:pr-8">
                          <div className="font-bold text-xl text-[#00b6e9] mb-1 text-center">{selectedPatient.last_name}, {selectedPatient.first_name}</div>
                          <div className="text-lg text-[#222c36]">{selectedPatient.hospital_registration_number || " "}</div>
                          <div className="text-md text-[#222c36]"> {selectedPatient.birthdate ? `AGE: ${new Date().getFullYear() - new Date(selectedPatient.birthdate).getFullYear()}` : " "}</div>
                          <div className="text-md text-[#222c36]">SEX: {selectedPatient.sex}</div>

                        </div>
                        {/* Right: Other Patient Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <div className="text-[#7a8fa4] text-xs font-semibold mb-1">Last Name</div>
                            <div className="font-bold text-base text-[#222c36]">{selectedPatient.last_name || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[#7a8fa4] text-xs font-semibold mb-1">First Name</div>
                            <div className="font-bold text-base text-[#222c36]">{selectedPatient.first_name || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[#7a8fa4] text-xs font-semibold mb-1">Sex</div>
                            <div className="font-bold text-base text-[#222c36]">{selectedPatient.sex || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[#7a8fa4] text-xs font-semibold mb-1">Birthdate</div>
                            <div className="font-bold text-base text-[#222c36]">{selectedPatient.birthdate ? new Date(selectedPatient.birthdate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                          </div>
                          <div>
                            <div className="text-[#7a8fa4] text-xs font-semibold mb-1">Blood Type</div>
                            <div className="font-bold text-base text-[#222c36]">{selectedPatient.blood_type || '-'}</div>
                          </div>
                          <div>
                            <div className="text-[#7a8fa4] text-xs font-semibold mb-1">Registration Date</div>
                            <div className="font-bold text-base text-[#222c36]">{selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Patient Admission History */}
                  <div className="w-full max-w-full">
                    <PatientAdmissionHistory patientId={selectedPatient.id} />
                  </div>
                </div>
              )}
              {/* New/Edit Patient Modal */}
              {showModal && (
                <PatientFormModal
                  open={showModal}
                  onClose={closeModal}
                  onSubmit={handleSubmit}
                  loading={loading}
                  form={form}
                  setForm={setForm}
                  title={editId ? 'Edit' : 'New Patient'}
                  submitLabel={editId ? 'Update' : 'Save'}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
// Profile image helper component removed