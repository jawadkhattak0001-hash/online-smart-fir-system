import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, User, Clock, MapPin, FileText, Edit, RefreshCw, Plus, X } from "lucide-react";
import api from "@/services/api";

function CaseManagement() {
  const { user } = useAuth();
  const { data, loading, actions, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ notes: "", evidence: "" });

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isDSP = role === 'dsp';
  const isSHO = role === 'sho';
  const isSI = role === 'si';

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Filter cases (based on FIR data)
  const getFilteredCases = () => {
    let cases = data.firs || [];  // ✅ Use FIRs as cases

    if (isSI) {
      cases = cases.filter(c => c.assignedOfficer === user?.id);
    } else if (isSHO) {
      cases = cases.filter(c => c.stationId === user?.stationId);
    }
    // DSP and Super Admin see all

    return cases.filter(c =>
      c.firNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complainantName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCases = getFilteredCases();

  const stationSIs = (data.officers || []).filter(o =>
    o.role === 'si' && o.stationId === user?.stationId
  );

  const handleAssignOfficer = async (caseId, officerId) => {
    if (!officerId) return;
    try {
      await api.put(`/firs/${caseId}`, { assignedOfficer: officerId, status: 'assigned' });
      refreshData();
      alert('Officer assigned successfully!');
    } catch (error) {
      alert('Failed to assign officer.');
    }
  };

  // ✅ FIXED: Use /firs/investigate instead of /cases
  const handleUpdateStatus = async (caseId, newStatus, notes = "", evidence = "") => {
    try {
      const payload = { firId: caseId, status: newStatus };
      if (notes) payload.notes = notes;
      if (evidence) payload.evidence = evidence;
      await api.post('/firs/investigate', payload);
      refreshData();
      setShowUpdateModal(false);
      alert('Case updated successfully!');
    } catch (error) {
      alert('Failed to update case.');
    }
  };

  const openUpdateModal = (caseItem) => {
    setSelectedCase(caseItem);
    setUpdateData({ notes: "", evidence: "" });
    setShowUpdateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'submitted_to_dsp': return 'bg-orange-100 text-orange-800';
      case 'challan': return 'bg-green-600 text-white';
      case 'c_report': return 'bg-gray-600 text-white';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? 'View all cases across all stations' :
             isDSP ? 'View all cases across all stations' :
             isSHO ? 'Manage cases in your station' :
             'Track your assigned investigation cases'}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCases.length}</div>
            <p className="text-xs text-muted-foreground">All cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filteredCases.filter(c => c.status === 'investigating').length}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted to DSP</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{filteredCases.filter(c => c.status === 'submitted_to_dsp').length}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{filteredCases.filter(c => c.status === 'closed').length}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search cases by FIR number or complainant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No cases found</p>
              <p className="text-sm text-gray-400 mt-2">
                {isSI ? 'No cases assigned to you' : isSHO ? 'No cases in your station' : 'No cases available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              user={user}
              stationSIs={stationSIs}
              onAssign={handleAssignOfficer}
              onUpdate={openUpdateModal}
            />
          ))
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Update Investigation</CardTitle>
              <p className="text-sm text-gray-500">Case: {selectedCase.firNumber}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    placeholder="Add investigation notes..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Evidence</label>
                  <Textarea
                    value={updateData.evidence}
                    onChange={(e) => setUpdateData({ ...updateData, evidence: e.target.value })}
                    placeholder="Describe evidence or paste URLs..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">New Status</label>
                  <Select onValueChange={(value) => handleUpdateStatus(selectedCase.id, value, updateData.notes, updateData.evidence)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigating">Under Investigation</SelectItem>
                      <SelectItem value="submitted_to_dsp">Submit to DSP</SelectItem>
                      <SelectItem value="closed">Close Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CaseCard({ caseItem, user, stationSIs, onAssign, onUpdate }) {
  const role = user?.role;
  const isSHO = role === 'sho';
  const isSI = role === 'si';
  const isAssignedToMe = isSI && caseItem.assignedOfficer === user?.id;

  const getStatusColor = (status) => {
    switch (status) {
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'submitted_to_dsp': return 'bg-orange-100 text-orange-800';
      case 'challan': return 'bg-green-600 text-white';
      case 'c_report': return 'bg-gray-600 text-white';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{caseItem.firNumber}</h3>
              <Badge className={getStatusColor(caseItem.status)}>
                {caseItem.status?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span><strong>Complainant:</strong> {caseItem.complainantName || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span><strong>Assigned:</strong> {caseItem.assignedDate ? new Date(caseItem.assignedDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span><strong>Location:</strong> {caseItem.placeOfIncident || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Created: {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : 'Unknown'}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye size={16} className="mr-1" />
                  View Details
                </Button>

                {isSHO && stationSIs.length > 0 && (
                  <Select onValueChange={(value) => onAssign(caseItem.id, value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign SI" />
                    </SelectTrigger>
                    <SelectContent>
                      {stationSIs.map((si) => (
                        <SelectItem key={si.id} value={si.id}>{si.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {isAssignedToMe && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onUpdate(caseItem)}>
                    <Edit size={16} className="mr-1" />
                    Update Investigation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CaseManagement;