import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Clock, FileText, Camera, Plus, ArrowLeft, RefreshCw } from "lucide-react";
import api from "@/services/api";

function SuspectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newPhoto, setNewPhoto] = useState(null);
  const [newEvidence, setNewEvidence] = useState({ description: '', photo: null });

  const role = user?.role;
  const isSHO = role === 'sho';
  const isDSP = role === 'dsp';
  const isSuperAdmin = role === 'super_admin';
  const canEdit = isSHO || isSuperAdmin;
  const canView = isSHO || isDSP || isSuperAdmin;

  useEffect(() => {
    fetchSuspect();
  }, [id]);

  const fetchSuspect = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/suspects/${id}`);
      setSuspect(response.data.suspect);
      setFormData(response.data.suspect);
    } catch (error) {
      console.error('Error fetching suspect:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuspect();
    setRefreshing(false);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/suspects/${id}`, formData);
      setEditing(false);
      fetchSuspect();
    } catch (error) {
      console.error('Error updating suspect:', error);
      alert('Failed to update suspect');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/suspects/${id}/status`, { status });
      fetchSuspect();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handlePhotoUpload = async () => {
    if (!newPhoto) return;
    try {
      await api.post(`/suspects/${id}/photo`, { photo: newPhoto });
      setNewPhoto(null);
      fetchSuspect();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    }
  };

  const handleAddEvidence = async () => {
    if (!newEvidence.description) return;
    try {
      await api.post(`/suspects/${id}/evidence`, newEvidence);
      setNewEvidence({ description: '', photo: null });
      fetchSuspect();
    } catch (error) {
      console.error('Error adding evidence:', error);
      alert('Failed to add evidence');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading suspect details...</p>
        </div>
      </div>
    );
  }

  if (!suspect) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Suspect not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'wanted': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_investigation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'captured': return 'bg-green-100 text-green-800 border-green-200';
      case 'cleared': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/suspects')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Suspects
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Suspect Details</h1>
          <Badge className={getStatusColor(suspect.status)}>
            {suspect.status?.replace('_', ' ')}
          </Badge>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column – Photo & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {suspect.photo ? (
                <img src={suspect.photo} alt={suspect.name} className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-gray-400" />
              )}
            </div>
            {canEdit && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setNewPhoto(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newPhoto && (
                  <Button onClick={handlePhotoUpload} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Camera size={16} className="mr-2" />
                    Upload Photo
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Middle column – Core details */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {canEdit && (
              <Button variant="outline" onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Father's Name</label>
                  <Input
                    value={formData.fatherName || ''}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">CNIC</label>
                  <Input
                    value={formData.cnic || ''}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">District</label>
                  <Input
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">Name:</span>
                  <span>{suspect.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">Father's Name:</span>
                  <span>{suspect.fatherName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="font-medium">CNIC:</span>
                  <span>{suspect.cnic || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-medium">District:</span>
                  <span>{suspect.district || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium">Last Seen:</span>
                  <span>{suspect.lastLocation || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="font-medium">Notes:</span>
                  <span>{suspect.notes || 'No notes'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linked FIRs */}
      <Card>
        <CardHeader>
          <CardTitle>Linked FIRs</CardTitle>
        </CardHeader>
        <CardContent>
          {suspect.firIds?.length === 0 ? (
            <p className="text-gray-500">No linked FIRs</p>
          ) : (
            <div className="space-y-2">
              {suspect.firIds.map((fir) => (
                <div key={fir._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{fir.firNumber}</p>
                    <p className="text-sm text-gray-500">{fir.complainantName}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/firs/${fir._id}`)}>
                    View FIR
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suspect.evidence?.length === 0 ? (
            <p className="text-gray-500">No evidence recorded</p>
          ) : (
            <div className="space-y-3">
              {suspect.evidence.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                  {item.photo && (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.photo} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.description || 'No description'}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded by {item.uploadedBy?.name || 'Unknown'} on {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canEdit && (
            <div className="border-t pt-4">
              <div className="space-y-3">
                <Textarea
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  placeholder="Describe the evidence..."
                  rows={2}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setNewEvidence({ ...newEvidence, photo: reader.result });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button onClick={handleAddEvidence} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Add Evidence
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SuspectDetails;