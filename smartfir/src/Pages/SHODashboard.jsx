// src/pages/Dashboard.jsx - BUILT-IN MODAL (WITH ASSIGNMENT & NOTES)
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, AlertTriangle, Clock } from "lucide-react";

function Dashboard() {
  const { user } = useAuth();
  const { data, loading, actions } = useData();
  const [selectedFir, setSelectedFir] = useState(null);
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [investigationNote, setInvestigationNote] = useState("");
  const [updating, setUpdating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const allFirs = data?.firs || [];

  const handleOpenModal = (fir) => {
    setSelectedFir(fir);
    setAssignedOfficer(fir.assignedTo || "");
    setInvestigationNote(fir.notes || "");
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedFir) return;
    setUpdating(true);
    try {
      const updatePayload = { 
        status: newStatus,
        assignedTo: assignedOfficer,
        notes: investigationNote 
      };

      if (actions?.updateFIR) {
        await actions.updateFIR(selectedFir._id || selectedFir.id, updatePayload);
      }
      setSelectedFir(prev => ({ 
        ...prev, 
        status: newStatus,
        assignedTo: assignedOfficer,
        notes: investigationNote 
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const stats = [
    {
      title: "Total FIRs",
      value: allFirs.length,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-50",
      description: "Total in system"
    },
    {
      title: "Active Cases",
      value: allFirs.filter(f => f.status === 'under_investigation' || f.status === 'approved').length,
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Under investigation"
    },
    {
      title: "Pending Review",
      value: allFirs.filter(f => f.status === 'pending' || !f.status).length,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Awaiting action"
    }
  ];

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Station Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Officer'}. Here is your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.bgColor} ml-4`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allFirs.length === 0 ? (
                <p className="text-sm text-gray-500">No FIRs available.</p>
              ) : (
                allFirs.slice(0, 5).map((fir) => (
                  <div
                    key={fir._id || fir.id}
                    onClick={() => handleOpenModal(fir)}
                    className="w-full text-left flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg cursor-pointer transition-all shadow-sm active:bg-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {fir.firNumber || fir.id || 'FIR'} - {fir.crimeType || fir.incidentType || 'Incident'}
                        </p>
                        <p className="text-xs text-gray-600">
                          By {fir.complainantName || fir.name || 'Muhammad jawad'} • {new Date(fir.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={fir.status === 'under_investigation' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}>
                      {fir.status || 'pending'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Built-in Modal Overlay */}
      {selectedFir && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            color: '#111827'
          }}>
            <button
              onClick={() => setSelectedFir(null)}
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

            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
              FIR Details: {selectedFir.firNumber || selectedFir.id || 'FIR-2026-00008'}
            </h2>

            <div style={{ backgroundColor: '#f3f4f6', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p><strong>Complainant:</strong> {selectedFir.complainantName || selectedFir.name || 'Muhammad jawad'}</p>
              <p><strong>Incident:</strong> {selectedFir.crimeType || selectedFir.incidentType || 'Robbery'}</p>
              <p><strong>Status:</strong> <span style={{ color: selectedFir.status === 'under_investigation' ? '#2563eb' : '#dc2626', fontWeight: 'bold' }}>{selectedFir.status || 'pending'}</span></p>
            </div>

            {/* Officer Assignment Dropdown */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                Assign Sub-Inspector (IO):
              </label>
              <select
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Officer...</option>
                <option value="SI Ali Raza">SI Ali Raza</option>
                <option value="SI Usman Khan">SI Usman Khan</option>
                <option value="SI Hamza Ahmed">SI Hamza Ahmed</option>
              </select>
            </div>

            {/* Investigation Remarks Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                Investigation Note / Initial Remarks:
              </label>
              <textarea
                rows="3"
                value={investigationNote}
                onChange={(e) => setInvestigationNote(e.target.value)}
                placeholder="Enter initial investigation instructions..."
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {selectedFir.status !== 'under_investigation' ? (
                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate('under_investigation')}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: updating ? 0.6 : 1
                  }}
                >
                  {updating ? 'Updating...' : 'Start Investigation'}
                </button>
              ) : (
                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate('under_investigation')}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: updating ? 0.6 : 1
                  }}
                >
                  {updating ? 'Saving...' : 'Save Updates'}
                </button>
              )}
              <button
                onClick={() => setSelectedFir(null)}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;