// src/components/DoctorCard.jsx
import React from 'react';

const cardStyle = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
};

const DoctorCard = ({ doctor, onSelect }) => {
  return (
    <div
      style={cardStyle}
      onClick={() => onSelect(doctor)}
      aria-label={`Select Dr. ${doctor.name}`}
    >
      <div>
        <h3 style={{ margin: '0 0 0.25rem 0' }}>{doctor.name}</h3>
        <p style={{ margin: 0, color: 'var(--text)' }}>{doctor.specialization}</p>
      </div>
      <button
        style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          padding: '0.4rem 0.8rem',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={e => {
          e.stopPropagation();
          onSelect(doctor);
        }}
      >
        Book
      </button>
    </div>
  );
};

export default DoctorCard;
