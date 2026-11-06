import React, { useState } from 'react';

const FirDetailsModal = ({ fir, onClose, onUpdateStatus }) => {
  const [investigationNote, setInvestigationNote] = useState(
    fir?.notes || fir?.investigationNotes?.[0] || ''
  );

  const [loading, setLoading] = useState(false);

  if (!fir) return null;

  const handleStartInvestigation = async () => {
    setLoading(true);

    try {
      const firId = fir._id || fir.id;

      // Backend database mein correct status:
      // "investigating"
      const result = await onUpdateStatus(firId, {
        status: 'investigating',
        notes: investigationNote
      });

      console.log('FIR update result:', result);

      // Agar parent function explicitly failure return kare
      if (result && result.success === false) {
        console.error('FIR update failed:', result.message);
        alert(result.message || 'FIR update failed');
        return;
      }

      // Update successful
      onClose();

    } catch (error) {
      console.error('Start Investigation Error:', error);

      alert(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to start investigation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          color: '#111827'
        }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            fontSize: '22px',
            fontWeight: 'bold',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}
        >
          FIR Details: {fir.firNumber || fir.id || 'FIR Details'}
        </h2>

        {/* FIR Details */}
        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <p>
            <strong>Complainant:</strong>{' '}
            {fir.complainantName || fir.name || 'N/A'}
          </p>

          <p>
            <strong>Incident:</strong>{' '}
            {fir.crimeType || fir.incidentType || 'N/A'}
          </p>

          <p>
            <strong>Current Status:</strong>{' '}
            <span
              style={{
                color:
                  fir.status === 'investigating'
                    ? '#2563eb'
                    : '#dc2626',
                fontWeight: 'bold'
              }}
            >
              {fir.status || 'pending'}
            </span>
          </p>
        </div>

        {/* Investigation Note */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
              color: '#374151'
            }}
          >
            Investigation Note / Remarks:
          </label>

          <textarea
            rows="4"
            value={investigationNote}
            onChange={(e) => setInvestigationNote(e.target.value)}
            placeholder="Enter investigation instructions or remarks..."
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >

          {/* Start Investigation / Save Updates */}
          <button
            disabled={loading}
            onClick={handleStartInvestigation}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading
              ? 'Updating...'
              : fir.status === 'investigating'
              ? 'Save Updates'
              : 'Start Investigation'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Close
          </button>

        </div>
      </div>
    </div>
  );
};

export default FirDetailsModal;