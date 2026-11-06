import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit2, Trash2, Video, MapPin, Wifi, WifiOff, RefreshCw } from "lucide-react";

function CameraManagement() {
  const { user } = useAuth();
  const { data, loading, actions, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    feedUrl: "",
    type: "CCTV"
  });

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isSHO = role === 'sho';

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Only Super Admin and SHO can manage cameras
  if (!isSuperAdmin && !isSHO) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Video size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Camera management is only available to Super Admin and SHO.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter cameras by role
  const getFilteredCameras = () => {
    let filtered = data.cameras || [];
    
    // SHO sees only cameras in their station
    if (isSHO) {
      filtered = filtered.filter(c => c.stationId === user?.stationId);
    }
    // Super Admin sees all cameras
    
    return filtered.filter(camera =>
      camera.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCameras = getFilteredCameras();

  const handleAddCamera = async () => {
    try {
      await actions.addCamera({
        ...formData,
        stationId: isSHO ? user?.stationId : formData.stationId || user?.stationId
      });
      setShowAddForm(false);
      setFormData({ name: "", location: "", feedUrl: "", type: "CCTV" });
    } catch (error) {
      alert('Failed to add camera');
    }
  };

  const handleUpdateCamera = async (cameraId, updates) => {
    await actions.updateCamera(cameraId, updates);
  };

  const handleEdit = (camera) => {
    setEditingCamera(camera);
    setFormData({
      name: camera.name,
      location: camera.location,
      feedUrl: camera.feedUrl || "",
      type: camera.type || "CCTV"
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camera Management</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? 'Manage all cameras across all stations' :
             'Manage cameras in your station'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Add Camera
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCameras.length}</div>
            <p className="text-xs text-muted-foreground">In network</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredCameras.filter(c => c.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredCameras.filter(c => c.status === 'offline').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredCameras.length > 0 ? Math.round(filteredCameras.filter(c => c.status === 'active').length / filteredCameras.length * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search cameras by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <Video size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No cameras found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCameras.map((camera) => (
            <CameraCard 
              key={camera.id} 
              camera={camera} 
              onUpdate={handleUpdateCamera}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Add/Edit Camera Modal */}
      {(showAddForm || editingCamera) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {editingCamera ? 'Edit Camera' : 'Add New Camera'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Camera Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Feed URL</label>
                  <Input
                    value={formData.feedUrl}
                    onChange={(e) => setFormData({ ...formData, feedUrl: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Camera Type</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCTV">CCTV</SelectItem>
                      <SelectItem value="Traffic">Traffic Camera</SelectItem>
                      <SelectItem value="PTZ">PTZ Camera</SelectItem>
                      <SelectItem value="ANPR">ANPR Camera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Station selection for Super Admin */}
                {isSuperAdmin && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Station</label>
                    <Select 
                      value={formData.stationId} 
                      onValueChange={(value) => setFormData({ ...formData, stationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Station" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.stations?.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowAddForm(false);
                    setEditingCamera(null);
                    setFormData({ name: "", location: "", feedUrl: "", type: "CCTV" });
                  }}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddCamera}>
                    {editingCamera ? 'Update Camera' : 'Add Camera'}
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

function CameraCard({ camera, onUpdate, onEdit }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <Video size={20} className="text-gray-400" />
          </div>
          <Badge className={
            camera.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }>
            {camera.status}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2">{camera.name}</h3>
        <p className="text-sm text-gray-500 mb-1">{camera.id}</p>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin size={14} />
          <span>{camera.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">Type: {camera.type}</span>
          <span className="text-xs text-gray-500">
            Last active: {camera.lastActive ? new Date(camera.lastActive).toLocaleDateString() : 'Unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={camera.status === 'active'}
              onCheckedChange={(checked) => onUpdate(camera.id, { status: checked ? 'active' : 'offline' })}
            />
            <span className="text-sm text-gray-600">
              {camera.status === 'active' ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onEdit(camera)}>
              <Edit2 size={14} />
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CameraManagement;