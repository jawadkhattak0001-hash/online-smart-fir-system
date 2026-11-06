import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Mail, Phone, Lock, Globe, Bell, Save, RefreshCw } from "lucide-react";
import api from "@/services/api";

function Settings() {
  const { user } = useAuth();
  const { data, loading, refreshData } = useData();
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isDSP = role === 'dsp';
  const isSHO = role === 'sho';
  const isSI = role === 'si';
  
  // Only Super Admin can access full settings
  // DSP, SHO, and SI can only view their profile
  const canAccessFullSettings = isSuperAdmin;

  // Profile settings
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    badgeNumber: user?.badgeNumber || '',
    stationName: user?.stationName || ''
  });

  // System settings (Super Admin only)
  const [systemSettings, setSystemSettings] = useState({
    stationName: user?.stationName || 'Gulberg Police Station',
    jurisdiction: 'Gulberg, Lahore',
    notificationEmail: 'alerts@gulbergstation.gov.pk',
    emailNotifications: true,
    smsNotifications: false,
    dashboardAlerts: true,
    autoAssignCases: false,
    evidenceStorageLimit: '10GB'
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update profile via API
      await api.put('/auth/update-profile', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      // Update system settings via API
      await api.put('/settings', systemSettings);
      alert('System settings updated successfully!');
    } catch (error) {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? 'Manage system settings and your profile' :
             'View your profile and account settings'}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Profile Settings (All roles) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isSuperAdmin && !isDSP && !isSHO && !isSI}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isSuperAdmin && !isDSP && !isSHO && !isSI}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isSuperAdmin && !isDSP && !isSHO && !isSI}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">Badge Number</label>
              <Input
                value={profile.badgeNumber}
                onChange={(e) => setProfile({ ...profile, badgeNumber: e.target.value })}
                disabled={true}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5">Station</label>
              <Input
                value={profile.stationName}
                disabled={true}
              />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? 'Saving...' : <><Save size={16} className="mr-2" /> Save Profile</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password (All roles) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} className="text-orange-600" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <div className="mt-6">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Lock size={16} className="mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings (Super Admin only) */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-purple-600" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5">Station Name</label>
                <Input
                  value={systemSettings.stationName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, stationName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5">Jurisdiction</label>
                <Input
                  value={systemSettings.jurisdiction}
                  onChange={(e) => setSystemSettings({ ...systemSettings, jurisdiction: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5">Notification Email</label>
                <Input
                  value={systemSettings.notificationEmail}
                  onChange={(e) => setSystemSettings({ ...systemSettings, notificationEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5">Evidence Storage Limit</label>
                <Select 
                  value={systemSettings.evidenceStorageLimit} 
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, evidenceStorageLimit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5GB">5 GB</SelectItem>
                    <SelectItem value="10GB">10 GB</SelectItem>
                    <SelectItem value="20GB">20 GB</SelectItem>
                    <SelectItem value="50GB">50 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email Notifications</span>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">SMS Notifications</span>
                  <Switch
                    checked={systemSettings.smsNotifications}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Dashboard Alerts</span>
                  <Switch
                    checked={systemSettings.dashboardAlerts}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, dashboardAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto Assign Cases</span>
                  <Switch
                    checked={systemSettings.autoAssignCases}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoAssignCases: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSaveSystemSettings} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                {saving ? 'Saving...' : <><Save size={16} className="mr-2" /> Save System Settings</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Settings;