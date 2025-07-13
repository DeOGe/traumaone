import React from 'react';

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  form: {
    first_name: string;
    last_name: string;
    birthdate: string;
    sex: string;
    hospital_registration_number: string;
    blood_type?: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  title?: string;
  submitLabel?: string;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  form,
  setForm,
  title = 'New Patient',
  submitLabel = 'Save',
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-7 min-w-[340px] max-w-[420px] w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-[#00b6e9] mb-5 font-bold text-xl text-center">{title}</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="first_name" className="w-32 text-sm font-semibold text-[#222c36] text-right">First Name <span className="text-red-500">*</span></label>
            <input id="first_name" name="first_name" value={form.first_name} onChange={e => setForm((f: any) => ({ ...f, first_name: e.target.value }))} required className="flex-1 px-3 py-2 rounded-md border border-[#d1e7ef] focus:ring-2 focus:ring-sky-200" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="last_name" className="w-32 text-sm font-semibold text-[#222c36] text-right">Last Name <span className="text-red-500">*</span></label>
            <input id="last_name" name="last_name" value={form.last_name} onChange={e => setForm((f: any) => ({ ...f, last_name: e.target.value }))} required className="flex-1 px-3 py-2 rounded-md border border-[#d1e7ef] focus:ring-2 focus:ring-sky-200" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="birthdate" className="w-32 text-sm font-semibold text-[#222c36] text-right">Birthdate</label>
            <input id="birthdate" name="birthdate" type="date" value={form.birthdate} onChange={e => setForm((f: any) => ({ ...f, birthdate: e.target.value }))} className="flex-1 px-3 py-2 rounded-md border border-[#d1e7ef] focus:ring-2 focus:ring-sky-200" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="sex" className="w-32 text-sm font-semibold text-[#222c36] text-right">Sex <span className="text-red-500">*</span></label>
            <select id="sex" name="sex" value={form.sex} onChange={e => setForm((f: any) => ({ ...f, sex: e.target.value }))} required className="flex-1 px-3 py-2 rounded-md border border-[#d1e7ef] focus:ring-2 focus:ring-sky-200">
              <option value="">Select...</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="hospital_registration_number" className="w-32 text-sm font-semibold text-[#222c36] text-right">Hospital Registration #</label>
            <input id="hospital_registration_number" name="hospital_registration_number" value={form.hospital_registration_number} onChange={e => setForm((f: any) => ({ ...f, hospital_registration_number: e.target.value }))} className="flex-1 px-3 py-2 rounded-md border border-[#d1e7ef] focus:ring-2 focus:ring-sky-200" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="blood_type" className="w-32 text-sm font-semibold text-[#222c36] text-right">Blood Type</label>
            <select
              id="blood_type"
              name="blood_type"
              value={form.blood_type || ''}
              onChange={e => setForm((f: any) => ({ ...f, blood_type: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md border border-[#d1e7ef] focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="mt-3 flex justify-end gap-2.5">
            <button type="submit" className="bg-[#00b6e9] text-white rounded-md px-5 py-2 font-semibold min-w-[110px] hover:bg-[#009fcc] transition" disabled={loading}>{submitLabel}</button>
            <button type="button" onClick={onClose} className="bg-[#e6f6fb] text-[#00b6e9] border border-[#00b6e9] rounded-md px-5 py-2 font-semibold min-w-[110px] hover:bg-[#d1e7ef] transition" disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormModal;
