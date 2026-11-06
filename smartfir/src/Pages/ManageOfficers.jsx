import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit2, Trash2, User, Mail, Phone, Shield, RefreshCw } from "lucide-react";
import api from "@/services/api";

function ManageOfficers() {
  const { user } = useAuth();
  const { data, loading, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    badgeNumber: "",
    email: "",
    phone: "",
    password: "",
    role: "si"
  });

  const isSHO = user?.role === 'sho';

  const handleRefresh = async () => {
    setRefreshing(true);
    if (refreshData) {
      await refreshData();
    }
    setRefreshing(false);
  };

  if (!isSHO) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">This page is only for SHO (Station House Officer).</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredOfficers = (data.officers || [])
    .filter(officer => {
      const officerStationId = officer.stationId?._id || officer.stationId;
      const userStationId = user?.stationId?._id || user?.stationId;
      return officer.role === 'si' && officerStationId === userStationId;
    })
    .filter(officer =>
      officer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.badgeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // ✅ FIX: Unified Submit Handler (Handles both Add and Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.cnic || !formData.phone || !formData.password) {
      alert('Please fill all required fields');
      return;
    }
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(formData.cnic)) {
      alert('CNIC format should be XXXXX-XXXXXXX-X');
      return;
    }
    const phoneRegex = /^03\d{2}-?\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Phone format should be 03XX-XXXXXXX');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      if (editingOfficer) {
        // ✅ EDIT mode: Update existing officer
        await api.put(`/admin/officers/${editingOfficer._id}`, {
          name: formData.name,
          cnic: formData.cnic,
          badgeNumber: formData.badgeNumber,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
          // Password is usually not updated in this form, or handled separately
        });
        alert('SI updated successfully!');
      } else {
        // ✅ ADD mode: Create new officer with default status 'active'
        await api.post('/admin/create-officer', {
          ...formData,
          role: 'si',
          stationId: user?.stationId
        });
        alert('SI created successfully!');
      }

      // Reset form and refresh data
      setShowAddForm(false);
      setEditingOfficer(null);
      setFormData({ name: "", cnic: "", badgeNumber: "", email: "", phone: "", password: "", role: "si" });
      if (refreshData) await refreshData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing request');
    }
  };

  // ✅ FIX: Helper to open edit form
  const handleEditClick = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name || "",
      cnic: officer.cnic || "",
      badgeNumber: officer.badgeNumber || "",
      email: officer.email || "",
      phone: officer.phone || "",
      password: "", // Password is not pre-filled for security
      role: officer.role || "si"
    });
    setShowAddForm(true);
  };

  // ✅ NEW: Delete functionality
  const handleDeleteOfficer = async (officerId) => {
    if (!officerId) return;
    if (window.confirm('Are you sure you want to delete this SI?')) {
      try {
        await api.delete(`/admin/officers/${officerId}`);
        if (refreshData) await refreshData();
        alert('SI deleted successfully!');
      } catch (error) {
        alert('Failed to delete officer');
      }
    }
  };

  const handleUpdateStatus = async (officerId, status) => {
    if (!officerId) {
      console.error('Officer ID is undefined');
      return;
    }
    try {
      await api.put(`/admin/officers/${officerId}`, { status });
      if (refreshData) await refreshData();
    } catch (error) {
      alert('Failed to update officer status');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'si': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage SIs</h1>
          <p className="text-gray-600">Add, edit, and manage Sub-Inspectors (SIs) in your station</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Add SI
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SIs</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOfficers.length}</div>
            <p className="text-xs text-muted-foreground">In station</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredOfficers.filter(o => o.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">On duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredOfficers.filter(o => o.status !== 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Off duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Cases</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.firs?.filter(f => f.assignedOfficer && filteredOfficers.some(o => o.id === f.assignedOfficer)).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search SIs by name, badge, or email..."
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No SIs found in your station
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map((officer) => (
                    <tr key={officer._id || officer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {officer.badgeNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{officer.email}</div>
                        <div className="text-sm text-gray-500">{officer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleColor(officer.role)}>
                          {officer.role?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={officer.status === 'active'}
                            onCheckedChange={(checked) => {
                              const id = officer._id || officer.id;
                              if (id) {
                                handleUpdateStatus(id, checked ? 'active' : 'inactive');
                              }
                            }}
                          />
                          <Badge className={
                            officer.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {officer.status || 'inactive'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(officer)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteOfficer(officer._id || officer.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {(showAddForm || editingOfficer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {editingOfficer ? 'Edit SI' : 'Add New SI'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">CNIC</label>
                  <Input
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="XXXXX-XXXXXXX-X"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Badge Number</label>
                  <Input
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="PK-XXXXX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sub-Inspector (SI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowAddForm(false);
                    setEditingOfficer(null);
                    setFormData({ name: "", cnic: "", badgeNumber: "", email: "", phone: "", password: "", role: "si" });
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingOfficer ? 'Update SI' : 'Add SI'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ManageOfficers;