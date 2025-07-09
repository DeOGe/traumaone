
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import PatientAdmissionHistory from './PatientAdmissionHistory';


const PAGE_SIZE = 15;

async function uploadProfilePicture(file: File, patientId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${patientId}.${fileExt}`;

  // Ensure user is signed in
  const { data: { session } } = await supabase.auth.getSession();
  console.log(session);
  if (!session) {
    console.error('User is not signed in');
    return null;
  }

  // No need to manually set Authorization header; supabase-js handles it
  const { error } = await supabase
    .storage
    .from('avatar')
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Upload failed:', error.message);
    return null;
  }

  return filePath;
}


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
  const [profileFile, setProfileFile] = useState<File | null>(null);
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openNewPatientModal() {
    setForm({
      first_name: '',
      last_name: '',
      birthdate: '',
      sex: '',
      hospital_registration_number: '',
      blood_type: '',
    });
    setProfileFile(null);
    setEditId(null);
    setShowModal(true);
  }

  // openEditModal is not used, so we can remove it or leave it for future use

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
    setProfileFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let patientId = editId || crypto.randomUUID();
    let profilePath = undefined;
    // If a new file is selected, upload it and get the file path
    if (profileFile) {
      const uploadedPath = await uploadProfilePicture(profileFile, patientId);
      if (uploadedPath) profilePath = uploadedPath;
    }
    if (editId) {
      // Update
      const { error } = await supabase
        .from('patients')
        .update(profilePath ? { ...form, profile_picture: profilePath } : form)
        .eq('id', editId);
      if (!error) {
        await fetchPatients();
        closeModal();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('patients')
        .insert([{ ...form, ...(profilePath ? { profile_picture: profilePath } : {}), id: patientId }]);
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

  // --- Details logic ---
  // Edit profile picture for selected patient
  async function handleProfilePictureUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedPatient) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const uploadedPath = await uploadProfilePicture(file, selectedPatient.id);
    if (uploadedPath) {
      // Update patient record with new profile picture path
      const { error } = await supabase
        .from('patients')
        .update({ profile_picture: uploadedPath })
        .eq('id', selectedPatient.id);
      if (!error) {
        await fetchPatients();
        // Optionally update selectedPatient in state
        setSelectedPatient((prev) => prev ? { ...prev, profile_picture: uploadedPath } : prev);
      }
    }
    setLoading(false);
  }

  return (
    <Layout>
      <main className="p-9 bg-[#f6fbfd] min-h-screen font-sans">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[#222c36] m-0 text-2xl font-bold">Patients</h2>
            <button className="bg-[#00b6e9] text-white rounded-md px-5 py-2 font-semibold text-base hover:bg-[#009fcc] transition" onClick={openNewPatientModal}>+ New Patient</button>
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
                  <div className="bg-white rounded-[28px] shadow-2xl border border-[#eaf6fa] mb-10 p-0 w-full max-w-full flex overflow-hidden min-h-[220px]">
                    {/* Left: Profile Image and Basic Info */}
                    <div className="w-[220px] min-w-[220px] bg-[#f6fbfd] flex flex-col items-center justify-center py-8 border-r border-[#eaf6fa]">
                      <div className="w-[100px] h-[100px] rounded-full bg-[#e6f6fb] flex items-center justify-center text-[54px] text-[#b3d8e6] mb-4 relative overflow-hidden">
                        {selectedPatient.profile_picture ? (
                          <ProfileImageSignedUrl filePath={selectedPatient.profile_picture} />
                        ) : (
                          <span role="img" aria-label="Patient">🧑‍⚕️</span>
                        )}
                      </div>
                      {/* Update profile picture button */}
                      <div className="w-full flex justify-center mt-2">
                        <label htmlFor="update-profile-picture" className="bg-[#00b6e9] bg-opacity-85 text-white text-center font-semibold text-sm px-5 py-2 cursor-pointer rounded-full shadow-md">
                          Update Profile Picture
                          <input
                            id="update-profile-picture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpdate}
                            className="hidden"
                            disabled={loading}
                          />
                        </label>
                      </div>
                      <div className="font-bold text-lg text-[#222c36] mb-1">{selectedPatient.first_name} {selectedPatient.last_name}</div>
                      <div className="text-[#7a8fa4] text-xs mb-3">{selectedPatient.hospital_registration_number}</div>
                    </div>
                    {/* Right: Chart Info */}
                    <div className="flex-1 flex flex-col justify-center px-10 py-8 min-w-0">
                      <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-[15.5px] text-[#222c36] items-center">
                        <div>
                          <div className="text-[#7a8fa4] font-medium">Sex</div>
                          <div className="font-bold">{selectedPatient.sex}</div>
                        </div>
                        <div>
                          <div className="text-[#7a8fa4] font-medium">Age</div>
                          <div className="font-bold">{selectedPatient.birthdate ? `${new Date().getFullYear() - new Date(selectedPatient.birthdate).getFullYear()}` : '-'}</div>
                        </div>
                        <div>
                          <div className="text-[#7a8fa4] font-medium">Blood</div>
                          <div className="font-bold">{selectedPatient.blood_type || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[#7a8fa4] font-medium">Registered Date</div>
                          <div className="font-bold">{selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
                        </div>
                        <div>
                          <div className="text-[#7a8fa4] font-medium">Patient ID</div>
                          <div className="font-bold">{selectedPatient.id}</div>
                        </div>
                        <div>
                          <div className="text-[#7a8fa4] font-medium">Hospital Reg. #</div>
                          <div className="font-bold">{selectedPatient.hospital_registration_number}</div>
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
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[2000]" onClick={closeModal}>
                  <div className="bg-white rounded-2xl shadow-2xl p-9 min-w-[340px] max-w-[420px] w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-[#00b6e9] mb-4 font-bold text-lg">{editId ? 'Edit Patient' : 'New Patient'}</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                      {/* Profile Picture Upload - Interactive */}
                      <div className="flex flex-col items-center mb-2.5">
                        <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center">
                          <div className="w-[110px] h-[110px] rounded-full bg-[#e6f6fb] flex items-center justify-center border-4 border-[#b3d8e6] mb-2.5 overflow-hidden relative">
                            {profileFile ? (
                              <img src={URL.createObjectURL(profileFile)} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#b3d8e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 16v1a4 4 0 0 1-8 0v-1"/></svg>
                            )}
                            <div className="absolute bottom-0 left-0 w-full bg-[#00b6e9] bg-opacity-85 text-white text-center font-semibold text-sm py-1.5 opacity-95 rounded-b-full">
                              Upload Image <span className="ml-1 text-base">⭳</span>
                            </div>
                          </div>
                          <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            onChange={e => setProfileFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required className="px-2 py-2 rounded-md border border-[#d1e7ef]" />
                      <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required className="px-2 py-2 rounded-md border border-[#d1e7ef]" />
                      <input name="birthdate" type="date" placeholder="Birthdate" value={form.birthdate} onChange={handleChange} required className="px-2 py-2 rounded-md border border-[#d1e7ef]" />
                      <select name="sex" value={form.sex} onChange={handleChange} required className="px-2 py-2 rounded-md border border-[#d1e7ef]">
                        <option value="">Sex</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                      <input name="hospital_registration_number" placeholder="Hospital Registration #" value={form.hospital_registration_number} onChange={handleChange} required className="px-2 py-2 rounded-md border border-[#d1e7ef]" />
                      <input name="blood_type" placeholder="Blood Type" value={form.blood_type || ''} onChange={handleChange} className="px-2 py-2 rounded-md border border-[#d1e7ef]" />
                      <div className="mt-2 flex justify-end gap-2.5">
                        <button type="submit" className="bg-[#00b6e9] text-white rounded-md px-5 py-2 font-semibold min-w-[110px]" disabled={loading}>{editId ? 'Update' : 'Save'}</button>
                        <button type="button" onClick={closeModal} className="bg-[#e6f6fb] text-[#00b6e9] border border-[#00b6e9] rounded-md px-5 py-2 font-semibold min-w-[110px]" disabled={loading}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
// Helper component to fetch and display a signed URL for a profile image
function ProfileImageSignedUrl({ filePath }: { filePath: string }) {
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function getSignedUrl() {
      setError(null);
      const { data, error } = await supabase.storage.from('avatar').createSignedUrl(filePath, 60 * 60); // 1 hour expiry
      if (error) {
        if (isMounted) setError('Could not load image');
      } else {
        if (isMounted) setSignedUrl(data?.signedUrl || null);
      }
    }
    getSignedUrl();
    return () => { isMounted = false; };
  }, [filePath]);

  if (error) {
    return <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#ffeaea', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, textAlign: 'center' }}>Image unavailable</div>;
  }
  if (!signedUrl) {
    return <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e6f6fb' }} />;
  }
  return (
    <img
      src={signedUrl}
      alt="Profile"
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
      onError={() => setError('Could not load image')}
    />
  );
}