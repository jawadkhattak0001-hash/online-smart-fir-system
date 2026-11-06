import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";

export default function SIDashboard() {
  const { data } = useData();
  const [selectedFir, setSelectedFir] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Officer Dashboard</h2>
      <p>Click any FIR below:</p>
      
      {(data?.firs || []).slice(0, 5).map((fir) => (
        <div
          key={fir._id || fir.id}
          onClick={() => setSelectedFir(fir)}
          style={{
            padding: '12px',
            margin: '8px 0',
            backgroundColor: '#e0f2fe',
            border: '2px solid #0284c7',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {fir.firNumber || fir.id || 'FIR'} - {fir.crimeType || fir.incidentType || 'Incident'}
        </div>
      ))}

      {selectedFir && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
            <h3>FIR Details</h3>
            <p><strong>Complainant:</strong> {selectedFir.complainantName || selectedFir.name || 'Muhammad jawad'}</p>
            <p><strong>Type:</strong> {selectedFir.crimeType || selectedFir.incidentType || 'Robbery'}</p>
            <button onClick={() => setSelectedFir(null)} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}