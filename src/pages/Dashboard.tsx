import React from 'react';
import Layout from '../components/Layout';

const PRIMARY = '#00b6e9';
const CARD_BG = '#fff';
const CARD_SHADOW = '0 2px 16px rgba(0,182,233,0.08)';
const BORDER_RADIUS = '18px';

const cardStyle: React.CSSProperties = {
  background: CARD_BG,
  borderRadius: BORDER_RADIUS,
  boxShadow: CARD_SHADOW,
  padding: '28px 32px',
  marginBottom: '24px',
  border: '1px solid #eaf6fa',
};

const columnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  minWidth: 0,
};

const rightColumnStyle: React.CSSProperties = {
  width: '320px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  minWidth: 0,
};

export default function Dashboard() {
  return (
    <Layout>
      <main style={{
        display: 'flex',
        gap: '32px',
        padding: '36px',
        background: '#f6fbfd',
        minHeight: 'calc(100vh - 72px)',
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}>
        {/* Left/Main Column */}
        <div style={columnStyle}>
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h2 style={{ color: '#222c36', fontWeight: 700, fontSize: '2rem', margin: 0 }}>Dashboard</h2>
              <div style={{ color: PRIMARY, fontWeight: 500, fontSize: '1.1rem', marginTop: 8 }}>
                Welcome to Trauma One!
              </div>
            </div>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#e6f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', color: PRIMARY, fontWeight: 700
            }}>
              🏥
            </div>
          </div>
          {/* Example: Chart/Card Row */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#222c36', marginBottom: 8 }}>Patients This Month</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: PRIMARY }}>128</div>
              <div style={{ marginTop: 16, height: 60, background: '#e6f6fb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, fontWeight: 600 }}>
                Chart
              </div>
            </div>
            <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#222c36', marginBottom: 8 }}>Admissions</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: PRIMARY }}>42</div>
              <div style={{ marginTop: 16, height: 60, background: '#e6f6fb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, fontWeight: 600 }}>
                Chart
              </div>
            </div>
            <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#222c36', marginBottom: 8 }}>Operating Room</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: PRIMARY }}>7</div>
              <div style={{ marginTop: 16, height: 60, background: '#e6f6fb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, fontWeight: 600 }}>
                Chart
              </div>
            </div>
          </div>
          {/* Example: Appointment History */}
          <div style={{ ...cardStyle, minHeight: 180 }}>
            <div style={{ fontWeight: 600, color: '#222c36', marginBottom: 12 }}>Recent Activity</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#222c36', fontSize: 16 }}>
              <li style={{ marginBottom: 8 }}><span style={{ color: PRIMARY, marginRight: 8 }}>•</span> Patient John Smith admitted</li>
              <li style={{ marginBottom: 8 }}><span style={{ color: PRIMARY, marginRight: 8 }}>•</span> Surgery scheduled for Ellen Barton</li>
              <li><span style={{ color: PRIMARY, marginRight: 8 }}>•</span> New patient: Brittni Lando</li>
            </ul>
          </div>
        </div>
        {/* Right Column */}
        <div style={rightColumnStyle}>
          <div style={cardStyle}>
            <div style={{ fontWeight: 600, color: '#222c36', marginBottom: 12 }}>Patient List</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e6f6fb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: PRIMARY, marginRight: 12
                }}>JS</span>
                <span>John Smith</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e6f6fb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: PRIMARY, marginRight: 12
                }}>HB</span>
                <span>Hilda Hunter</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e6f6fb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: PRIMARY, marginRight: 12
                }}>MB</span>
                <span>Michel Bomb</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e6f6fb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: PRIMARY, marginRight: 12
                }}>EB</span>
                <span>Ellen Barton</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e6f6fb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: PRIMARY, marginRight: 12
                }}>BL</span>
                <span>Brittni Lando</span>
              </li>
            </ul>
          </div>
          <div style={cardStyle}>
            <div style={{ fontWeight: 600, color: '#222c36', marginBottom: 12 }}>Patient Files</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 15 }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: PRIMARY, marginRight: 10 }}>📄</span> Prescription.pdf
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: PRIMARY, marginRight: 10 }}>📄</span> X-ray report.pdf
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: PRIMARY, marginRight: 10 }}>📄</span> Checkup.pdf
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: PRIMARY, marginRight: 10 }}>📄</span> Prescription.pdf
              </li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}