// src/components/AppointmentCard.jsx
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

const AppointmentCard = ({ appointment, onAction }) => {
  const { patientName, date, time, status } = appointment;
  return (
    <div style={cardStyle} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0' }}>{patientName}</h4>
        <p style={{ margin: 0, color: 'var(--text)' }}>
          {date} @ {time}
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: status === 'pending' ? 'orange' : status === 'accepted' ? 'green' : 'red' }}>{status}</p>
      </div>
      {status === 'pending' && (
        <div>
          <button
            onClick={() => onAction(appointment._id, 'accept')}
            style={{ marginRight: '0.5rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Accept
          </button>
          <button
            onClick={() => onAction(appointment._id, 'reject')}
            style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
