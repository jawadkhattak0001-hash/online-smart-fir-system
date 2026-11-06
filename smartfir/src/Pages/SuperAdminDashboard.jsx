import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Shield, Phone, Lock, Plus, RefreshCw } from 'lucide-react';
import api from '../services/api';

function SuperAdminDashboard() {
  const { user } = useAuth();
  const [dsps, setDsps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    phone: '',
    password: '',
    badgeNumber: ''
  });

  const fetchDsps = async () => {
    try {
      const response = await api.get('/admin/officers?role=dsp');
      setDsps(response.data.officers);
    } catch (error) {
      console.error('Error fetching DSPs:', error);
    }
  };

  useEffect(() => {
    fetchDsps();
  }, []);

  const handleCreateDSP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/create-officer', {
        ...formData,
        role: 'dsp'
      });
      alert('DSP created successfully!');
      setFormData({ name: '', cnic: '', phone: '', password: '', badgeNumber: '' });
      fetchDsps();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating DSP');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">This page is for Super Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600">Create and manage DSPs (Deputy Superintendents)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New DSP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDSP} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
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
            </div>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : <><Plus size={16} className="mr-2" /> Create DSP</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing DSPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dsps.length === 0 ? (
              <p className="text-center text-gray-500">No DSPs created yet</p>
            ) : (
              dsps.map((dsp) => (
                <div key={dsp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dsp.name}</div>
                      <div className="text-xs text-gray-500">DSP • {dsp.badgeNumber}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{dsp.phone}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuperAdminDashboard;