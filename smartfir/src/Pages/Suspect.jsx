import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, MapPin, Clock, Eye, FileText, Plus, RefreshCw } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case 'wanted': return 'bg-red-100 text-red-800 border-red-200';
    case 'under_investigation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'captured': return 'bg-green-100 text-green-800 border-green-200';
    case 'cleared': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

function Suspect() {
  const { user } = useAuth();
  const { data, loading, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

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

  const handleViewDetails = (suspectId) => {
    navigate(`/suspects/${suspectId}`);
  };

  // ── FIX: Convert IDs to strings for reliable comparison ──
  const getFilteredSuspects = () => {
    // Safely handle missing data
    const suspects = (data.suspects || []).map(s => ({
      ...s,
      _id: s._id?.toString() || '',
      stationId: s.stationId?.toString() || '',
      firIds: (s.firIds || []).map(id => id.toString()),
    }));
    const userStationId = user?.stationId?.toString() || '';

    // Role‑based filtering (all IDs are now strings)
    let filtered = suspects;

    if (isSI) {
      // Get assigned FIR IDs as strings
      const myFirIds = (data.firs || [])
        .filter(f => f.assignedOfficer?.toString() === user?.id?.toString())
        .map(f => f._id?.toString() || '');
      filtered = suspects.filter(s =>
        s.firIds?.some(fid => myFirIds.includes(fid))
      );
    } else if (isSHO) {
      filtered = suspects.filter(s => s.stationId === userStationId);
    }
    // DSP and Super Admin see all

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.cnic?.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading suspect database...</p>
        </div>
      </div>
    );
  }

  const filteredSuspects = getFilteredSuspects();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suspect Database</h1>
          <p className="text-gray-600">
            {isDSP ? 'View all suspects across your district' :
             isSHO ? 'Manage suspects in your station' :
             isSI ? 'View suspects from your assigned FIRs' :
             'Manage all suspects'}
          </p>
        </div>
        <div className="flex gap-2">
          {isSHO && (
            <Button onClick={() => navigate('/suspects/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add Suspect
            </Button>
          )}
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
            <CardTitle className="text-sm font-medium">Total Suspects</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSuspects.length}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wanted</CardTitle>
            <User className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredSuspects.filter(s => s.status === 'wanted').length}
            </div>
            <p className="text-xs text-muted-foreground">Active search</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredSuspects.filter(s => s.status === 'under_investigation').length}
            </div>
            <p className="text-xs text-muted-foreground">Being monitored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Captured</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredSuspects.filter(s => s.status === 'captured').length}
            </div>
            <p className="text-xs text-muted-foreground">Apprehended</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search by name, CNIC, or father's name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="wanted">Wanted</SelectItem>
            <SelectItem value="under_investigation">Under Investigation</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suspect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuspects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No suspects match your search' : 'No suspects found in database'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSuspects.map((suspect) => (
            <Card key={suspect._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {suspect.photo ? (
                        <img src={suspect.photo} alt={suspect.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{suspect.name}</h3>
                        <p className="text-sm text-gray-500">{suspect.cnic || 'No CNIC'}</p>
                      </div>
                      <Badge className={getStatusColor(suspect.status)}>
                        {suspect.status?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>Father: {suspect.fatherName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="truncate">Last seen: {suspect.lastLocation || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Updated: {suspect.updatedAt ? new Date(suspect.updatedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDetails(suspect._id)}
                      >
                        <Eye size={14} className="mr-1" />
                        View Details
                      </Button>
                      {isSHO && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleViewDetails(suspect._id)}
                        >
                          <FileText size={14} className="mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Suspect;