// src/components/PublicFooter.jsx
import React from 'react';

const PublicFooter = () => {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#cbd5e1',
      borderTop: '1px solid #1e293b',
      marginTop: 'auto',
      padding: '3rem 1.5rem 1.5rem 1.5rem',
      fontSize: '0.875rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Column 1: Hospital Mission & Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.3rem',
              fontWeight: 800
            }}>
              +
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              MediCare<span style={{ color: '#38bdf8' }}>+</span>
            </div>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
            Advanced Integrated Health Network dedicated to world-class clinical excellence, personalized patient care, electronic health records, and emergency trauma support.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#1e293b', color: '#38bdf8', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
              🛡️ JCI Accredited
            </span>
            <span style={{ background: '#1e293b', color: '#4ade80', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
              ✓ ISO 9001:2015
            </span>
            <span style={{ background: '#1e293b', color: '#facc15', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
              🔒 HIPAA Compliant
            </span>
          </div>
        </div>

        {/* Column 2: Clinical Specialties */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
            Clinical Centers of Excellence
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <li>❤️ Cardiology & Heart Institute</li>
            <li>🧴 Dermatology & Trichology Center</li>
            <li>🧠 Neurology & Neurosurgery</li>
            <li>👶 Pediatrics & Child Health</li>
            <li>🦴 Orthopedics & Joint Replacement</li>
            <li>🩺 General Medicine & Preventive Health</li>
          </ul>
        </div>

        {/* Column 3: Hospital Information & Hours */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
            Hospital Timings & Access
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <div>
              <strong style={{ color: '#ffffff' }}>🚨 Emergency & Trauma Unit:</strong><br />
              Open 24 Hours • 7 Days a Week • 365 Days
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>📅 Outpatient Clinics (OPD):</strong><br />
              Monday – Saturday: 08:00 AM – 08:00 PM
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>🧪 Pathology & Radiology Labs:</strong><br />
              24/7 Continuous Automated Diagnostic Testing
            </div>
          </div>
        </div>

        {/* Column 4: Contact & Campus */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
            Campus Location & Contacts
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <div>📍 450 Medical Sciences Boulevard, Health District 2026</div>
            <div>📞 Hospital Main Desk: <strong>+1 (555) 019-2834</strong></div>
            <div>🚑 Ambulance Dispatch: <strong>1-800-MEDICARE</strong></div>
            <div>✉️ Electronic Inquiries: <strong>helpdesk@gmail.com</strong></div>
          </div>
        </div>
      </div>

      {/* Sub-Footer Strip */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid #1e293b',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        color: '#64748b',
        fontSize: '0.8rem'
      }}>
        <div>
          © {new Date().getFullYear()} MediCare+ Integrated Hospital System. All clinical rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            Hospital EHR Cloud Online
          </span>
          <span>v2.6 Enterprise</span>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
