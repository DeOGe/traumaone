


function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-7 mb-6 border border-[#eaf6fa] flex-1 min-w-0 flex flex-col">
      <div className="font-semibold text-[#222c36] mb-2">{title}</div>
      <div className="text-3xl font-bold text-[#00b6e9]">{value}</div>
      <div className="mt-4 h-14 bg-[#e6f6fb] rounded-xl flex items-center justify-center text-[#00b6e9] font-semibold">Chart</div>
    </div>
  );
}

function PatientList() {
  const patients = [
    { initials: 'JS', name: 'John Smith' },
    { initials: 'HB', name: 'Hilda Hunter' },
    { initials: 'MB', name: 'Michel Bomb' },
    { initials: 'EB', name: 'Ellen Barton' },
    { initials: 'BL', name: 'Brittni Lando' },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-lg p-7 border border-[#eaf6fa]">
      <div className="font-semibold text-[#222c36] mb-3">Patient List</div>
      <ul className="m-0 p-0 list-none">
        {patients.map(p => (
          <li key={p.initials} className="flex items-center mb-3 last:mb-0">
            <span className="w-9 h-9 rounded-full bg-[#e6f6fb] inline-flex items-center justify-center font-bold text-[#00b6e9] mr-3">{p.initials}</span>
            <span>{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


function RecentActivity() {
  const activity = [
    'Patient John Smith admitted',
    'Surgery scheduled for Ellen Barton',
    'New patient: Brittni Lando',
  ];
  return (
    <div className="bg-white rounded-2xl shadow-lg p-7 min-h-[180px] border border-[#eaf6fa]">
      <div className="font-semibold text-[#222c36] mb-3">Recent Activity</div>
      <ul className="m-0 p-0 list-none text-base text-[#222c36]">
        {activity.map((a) => (
          <li key={a} className="mb-2 last:mb-0"><span className="text-[#00b6e9] mr-2">•</span>{a}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  return (
      <main className="flex gap-8 p-9 bg-[#f6fbfd] min-h-[calc(100vh-72px)] font-sans">
        {/* Left/Main Column */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="bg-white rounded-2xl shadow-lg p-7 mb-6 border border-[#eaf6fa] flex items-center justify-between gap-6">
            <div>
              <h2 className="text-[#222c36] font-bold text-2xl m-0">Dashboard</h2>
              <div className="text-[#00b6e9] font-medium text-lg mt-2">Welcome to Trauma One!</div>
            </div>
            <div className="w-20 h-20 rounded-full bg-[#e6f6fb] flex items-center justify-center text-3xl text-[#00b6e9] font-bold">
              🏥
            </div>
          </div>
          {/* Chart/Card Row */}
          <div className="flex gap-6">
            <StatCard title="Patients This Month" value={128} />
            <StatCard title="Admissions" value={42} />
            <StatCard title="Operating Room" value={7} />
          </div>
          <RecentActivity />
        </div>
        {/* Right Column */}
        <div className="w-[320px] flex flex-col gap-6 min-w-0">
          <PatientList />
          {/* <PatientFiles /> */}
        </div>
      </main>
  );
}