// src/components/DoctorApprovalCard.jsx
import React from 'react';

const cardStyle = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'transform 0.2s',
};

const DoctorApprovalCard = ({ doctor, onApprove, onReject }) => {
  return (
    <div
      style={cardStyle}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0' }}>{doctor.name}</h4>
        <p style={{ margin: 0, color: 'var(--text)' }}>{doctor.specialization}</p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{doctor.email}</p>
      </div>
      <div>
        <button
          onClick={() => onApprove(doctor._id)}
          style={{ marginRight: '0.5rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          Approve
        </button>
        <button
          onClick={() => onReject(doctor._id)}
          style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default DoctorApprovalCard;
