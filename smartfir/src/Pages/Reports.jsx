import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, BarChart3, PieChart, TrendingUp, Calendar, Users, Camera, RefreshCw } from "lucide-react";

function Reports() {
  const { user } = useAuth();
  const { data, loading, refreshData } = useData();
  const [dateRange, setDateRange] = useState("month");
  const [crimeType, setCrimeType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isDSP = role === 'dsp';
  const isSHO = role === 'sho';
  const canViewReports = isSuperAdmin || isDSP || isSHO;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Reports and analytics are only available to Super Admin, DSP, and SHO.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const crimeDistribution = data.reports?.crimeDistribution || {};
  const dailyStats = data.reports?.dailyStats || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive station performance and crime analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Filter size={20} className="text-gray-400" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={crimeType} onValueChange={setCrimeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Crime Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crimes</SelectItem>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Assault">Assault</SelectItem>
                  <SelectItem value="Burglary">Burglary</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Officer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Officers</SelectItem>
                  {data.officers?.map(officer => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FIRs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.reports?.totalFIRs || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reports?.totalFIRs > 0 
                ? Math.round((data.reports?.closedCases || 0) / data.reports.totalFIRs * 100) + '%'
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Resolution rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.alerts?.filter(a => a.status === 'new').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">AI detection</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Crime Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(crimeDistribution).length === 0 ? (
                <p className="text-center text-gray-500">No crime data available</p>
              ) : (
                Object.entries(crimeDistribution).map(([crime, percentage]) => (
                  <div key={crime} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-gray-700 capitalize min-w-20">
                        {crime}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 min-w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "FIR Resolution Rate", value: data.reports?.totalFIRs > 0 ? Math.round((data.reports?.closedCases || 0) / data.reports.totalFIRs * 100) + '%' : '0%' },
                { label: "Alert Response Rate", value: data.alerts?.length > 0 ? Math.round(data.alerts.filter(a => a.status === 'acknowledged').length / data.alerts.length * 100) + '%' : '0%' },
                { label: "Suspect Detection", value: "92%" },
                { label: "Camera Uptime", value: data.cameras?.length > 0 ? Math.round(data.cameras.filter(c => c.status === 'active').length / data.cameras.length * 100) + '%' : '0%' },
                { label: "Officer Activity", value: data.officers?.length > 0 ? Math.round(data.officers.filter(o => o.status === 'active').length / data.officers.length * 100) + '%' : '0%' }
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{metric.label}</span>
                  <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Officer Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Officer Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.officers || []).slice(0, 4).map((officer, index) => (
                <div key={officer.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{officer.name}</p>
                    <p className="text-xs text-gray-500">{officer.badgeNumber}</p>
                  </div>
                  <Badge variant={
                    index === 0 ? "default" : 
                    index === 1 ? "secondary" : "outline"
                  }>
                    {Math.floor(Math.random() * 20) + 80}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Camera Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Camera Status</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Active Cameras</span>
                <span className="text-sm font-bold text-green-600">
                  {data.cameras?.filter(c => c.status === 'active').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Offline Cameras</span>
                <span className="text-sm font-bold text-red-600">
                  {data.cameras?.filter(c => c.status === 'offline').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total Uptime</span>
                <span className="text-sm font-bold text-gray-900">
                  {data.cameras?.length > 0 ? Math.round(data.cameras.filter(c => c.status === 'active').length / data.cameras.length * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Alerts Generated</span>
                <span className="text-sm font-bold text-gray-900">{data.alerts?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Response Metrics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Avg FIR Approval</span>
                <span className="text-sm font-bold text-gray-900">2.4 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Case Resolution</span>
                <span className="text-sm font-bold text-gray-900">
                  {data.reports?.totalFIRs > 0 
                    ? Math.round((data.reports?.closedCases || 0) / data.reports.totalFIRs * 100) + '%'
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Alert Response</span>
                <span className="text-sm font-bold text-gray-900">
                  {data.alerts?.length > 0 ? Math.round(data.alerts.filter(a => a.status === 'acknowledged').length / data.alerts.length * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Citizen Satisfaction</span>
                <span className="text-sm font-bold text-gray-900">4.2/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Reports;