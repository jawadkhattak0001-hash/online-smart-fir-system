import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X, MapPin, Clock, User, RefreshCw } from "lucide-react";

function Alerts() {
  const { user } = useAuth();
  const { data, loading, actions, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isDSP = role === 'dsp';
  const isSHO = role === 'sho';
  const isSI = role === 'si';

  const handleAcknowledgeAlert = async (alertId) => {
    await actions.acknowledgeAlert(alertId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  const alerts = data.alerts || [];
  const newAlerts = alerts.filter(alert => alert.status === 'new');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
  const highConfidence = alerts.filter(a => a.confidence >= 85);

  // Filter alerts by role
  const getFilteredAlerts = () => {
    let filtered = alerts;
    
    // SI sees only alerts from their station
    if (isSI) {
      filtered = alerts.filter(a => a.stationId === user?.stationId);
    }
    // SHO sees alerts from their station
    else if (isSHO) {
      filtered = alerts.filter(a => a.stationId === user?.stationId);
    }
    // DSP sees all alerts from all stations
    // Super Admin sees all alerts
    
    return filtered;
  };

  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suspect Alerts</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? 'All suspect alerts across all stations' :
             isDSP ? 'All suspect alerts across all stations' :
             isSHO ? 'Suspect alerts for your station' :
             isSI ? 'Suspect alerts for your station' :
             'Suspect alerts'}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAlerts.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{newAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <User className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highConfidence.length}</div>
            <p className="text-xs text-muted-foreground">≥85% match</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredAlerts.length > 0 ? Math.round((acknowledgedAlerts.length / filteredAlerts.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Acknowledged</p>
          </CardContent>
        </Card>
      </div>

      {/* New Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Alerts</h2>
        <div className="space-y-4">
          {newAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No new alerts</p>
              </CardContent>
            </Card>
          ) : (
            newAlerts.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onAcknowledge={handleAcknowledgeAlert}
                showActions={true}
              />
            ))
          )}
        </div>
      </div>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acknowledged Alerts</h2>
          <div className="space-y-4">
            {acknowledgedAlerts.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onAcknowledge={handleAcknowledgeAlert}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, onAcknowledge, showActions }) {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (confidence >= 80) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <Card className={`border-l-4 ${
      alert.status === 'new' ? 'border-l-red-500' : 'border-l-yellow-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative">
              <User size={24} className="text-gray-400" />
              <Badge className={`absolute -top-2 -right-2 ${getConfidenceColor(alert.confidence)}`}>
                {alert.confidence}%
              </Badge>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {alert.suspectId?.name || alert.suspectName || 'Unknown'}
                  <Badge className={
                    alert.status === 'new' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {alert.status}
                  </Badge>
                </h3>
                <p className="text-gray-600 mt-1">{alert.suspectId?.description || alert.description || 'No description'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-900 font-medium">{alert.location || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-900">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-gray-400" />
                <span className="text-gray-900">Camera: {alert.cameraId || 'N/A'}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  <Check size={16} className="mr-1" />
                  Acknowledge
                </Button>
                <Button size="sm" variant="outline">View Details</Button>
                <Button size="sm" variant="destructive">
                  <X size={16} className="mr-1" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Alerts;