import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: string;
  hospital_registration_number: string;
  created_at: string;
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

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 24,
  background: '#fff',
  minWidth: '900',
};

const thStyle: React.CSSProperties = {
  background: '#e6f6fb',
  color: '#222c36',
  fontWeight: 600,
  padding: '12px 8px',
  borderBottom: '1.5px solid #d1e7ef',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #eaf6fa',
  fontSize: '1rem',
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

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 2px 16px rgba(0,182,233,0.18)',
  padding: '32px 36px',
  minWidth: 340,
  maxWidth: 420,
  width: '100%',
};

const PAGE_SIZE = 15;

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // for controlled input
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Patient, 'id' | 'created_at'>>({
    first_name: '',
    last_name: '',
    birthdate: '',
    sex: '',
    hospital_registration_number: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  // Fetch patients from Supabase with search and pagination
  async function fetchPatients() {
    setFetching(true);
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search.trim() !== '') {
      // Use ilike for case-insensitive search on multiple columns
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
    } else {
      setPatients([]);
      setTotalPatients(0);
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
    });
    setEditId(null);
    setShowModal(true);
  }

  function openEditModal(patient: Patient) {
    setForm({
      first_name: patient.first_name,
      last_name: patient.last_name,
      birthdate: patient.birthdate,
      sex: patient.sex,
      hospital_registration_number: patient.hospital_registration_number,
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
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      // Update
      const { error } = await supabase
        .from('patients')
        .update(form)
        .eq('id', editId);
      if (!error) {
        await fetchPatients();
        closeModal();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('patients')
        .insert([form]);
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
  }, [page, search]);

  // Pagination controls
  const totalPages = Math.ceil(totalPatients / PAGE_SIZE);

  return (
    <Layout>
      <main style={{ padding: 36, background: '#f6fbfd', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#222c36', margin: 0 }}>Patients</h2>
            <button style={buttonStyle} onClick={openNewPatientModal}>New Patient</button>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <input
                type="text"
                placeholder="Search by name or registration #"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (e.target.value === '') {
                    setSearch(''); // Clear search filter
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearch(searchInput);
                    setPage(1);
                  }
                }}
                style={{
                  width: 260,
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #d1e7ef',
                  fontSize: 16,
                  marginRight: 12,
                }}
                disabled={fetching}
              />
              <button
                style={{ ...buttonStyle, padding: '8px 18px' }}
                onClick={() => { setSearch(searchInput); setPage(1); }}
                disabled={fetching}
              >
                Search
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>First Name</th>
                    <th style={thStyle}>Last Name</th>
                    <th style={thStyle}>Birthdate</th>
                    <th style={thStyle}>Sex</th>
                    <th style={thStyle}>Hospital Reg. #</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr>
                      <td style={tdStyle} colSpan={6}>Loading...</td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td style={tdStyle} colSpan={6}>No patients found.</td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p.id} style={{ background: '#fafdff', borderRadius: 8 }}>
                        <td style={tdStyle}>{p.first_name}</td>
                        <td style={tdStyle}>{p.last_name}</td>
                        <td style={tdStyle}>{p.birthdate}</td>
                        <td style={tdStyle}>{p.sex}</td>
                        <td style={tdStyle}>{p.hospital_registration_number}</td>
                        <td style={tdStyle}>
                          <button
                            style={buttonStyle}
                            onClick={() => navigate(`/patients/${p.id}`)}
                          >
                            Show
                          </button>
                          <button
                            style={secondaryButtonStyle}
                            onClick={() => openEditModal(p)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
              <button
                style={{ ...secondaryButtonStyle, marginRight: 8 }}
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || fetching}
              >
                Previous
              </button>
              <span style={{ fontWeight: 500, color: '#222c36', margin: '0 12px' }}>
                Page {page} of {totalPages || 1}
              </span>
              <button
                style={secondaryButtonStyle}
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || fetching || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
          {/* Modal for New/Edit Patient */}
          {showModal && (
            <div style={modalOverlayStyle} onClick={closeModal}>
              <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{ color: PRIMARY, marginBottom: 18 }}>
                  {editId ? 'Edit Patient' : 'New Patient'}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
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
                      {editId ? 'Update' : 'Save'}
                    </button>
                    <button type="button" style={secondaryButtonStyle} onClick={closeModal} disabled={loading}>
                      Cancel
                    </button>
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