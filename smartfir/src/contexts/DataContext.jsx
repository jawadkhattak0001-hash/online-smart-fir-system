// src/contexts/DataContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState({
    firs: [],
    officers: [],
    cameras: [],
    alerts: [],
    suspects: [],
    cases: [],
    reports: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const officersEndpoint = user?.role === 'sho' 
        ? `/admin/officers?role=si&stationId=${user?.stationId}`
        : '/officers';

      // Promise.allSettled with custom catch to prevent 403 console errors
      const results = await Promise.allSettled([
        api.get('/firs'),
        api.get(officersEndpoint),
        api.get('/cameras'),
        api.get('/alerts'),
        api.get('/suspects', { validateStatus: (status) => status < 500 }).catch(() => ({ data: { suspects: [] } })),
        api.get('/cases'),
        api.get('/reports/overview')
      ]);

      const [
        firsRes,
        officersRes,
        camerasRes,
        alertsRes,
        suspectsRes,
        casesRes,
        reportsRes
      ] = results;

      setData({
        firs: firsRes.status === 'fulfilled' ? firsRes.value?.data?.firs || [] : [],
        officers: officersRes.status === 'fulfilled' ? officersRes.value?.data?.officers || [] : [],
        cameras: camerasRes.status === 'fulfilled' ? camerasRes.value?.data?.cameras || [] : [],
        alerts: alertsRes.status === 'fulfilled' ? alertsRes.value?.data?.alerts || [] : [],
        suspects: suspectsRes.status === 'fulfilled' && suspectsRes.value?.status !== 403 ? suspectsRes.value?.data?.suspects || [] : [],
        cases: casesRes.status === 'fulfilled' ? casesRes.value?.data?.cases || [] : [],
        reports: reportsRes.status === 'fulfilled' ? reportsRes.value?.data?.stats || {} : {}
      });
    } catch (error) {
      // Catch any unhandled errors silently
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchAllData();

    const interval = setInterval(() => {
      fetchAllData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // ─── CRUD Operations ──────────────────────────────

  const updateFIR = async (firId, updates) => {
    try {
      const response = await api.put(`/firs/${firId}`, updates);
      setData(prev => ({
        ...prev,
        firs: prev.firs.map(fir => (fir._id === firId || fir.id === firId) ? { ...fir, ...response.data.fir } : fir)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const addOfficer = async (officerData) => {
    try {
      const response = await api.post('/officers', officerData);
      setData(prev => ({
        ...prev,
        officers: [...prev.officers, response.data.officer]
      }));
      return { success: true, data: response.data.officer };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateOfficer = async (officerId, updates) => {
    try {
      const response = await api.put(`/officers/${officerId}`, updates);
      setData(prev => ({
        ...prev,
        officers: prev.officers.map(officer => officer._id === officerId ? { ...officer, ...response.data.officer } : officer)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const addCamera = async (cameraData) => {
    try {
      const response = await api.post('/cameras', cameraData);
      setData(prev => ({
        ...prev,
        cameras: [...prev.cameras, response.data.camera]
      }));
      return { success: true, data: response.data.camera };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateCamera = async (cameraId, updates) => {
    try {
      const response = await api.put(`/cameras/${cameraId}`, updates);
      setData(prev => ({
        ...prev,
        cameras: prev.cameras.map(camera => camera._id === cameraId ? { ...camera, ...response.data.camera } : camera)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await api.put(`/alerts/${alertId}/acknowledge`);
      setData(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => alert._id === alertId ? { ...alert, ...response.data.alert } : alert)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const addSuspect = async (suspectData) => {
    try {
      const response = await api.post('/suspects', suspectData);
      setData(prev => ({
        ...prev,
        suspects: [...prev.suspects, response.data.suspect]
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateSuspect = async (suspectId, updates) => {
    try {
      const response = await api.put(`/suspects/${suspectId}`, updates);
      setData(prev => ({
        ...prev,
        suspects: prev.suspects.map(suspect => suspect._id === suspectId ? { ...suspect, ...response.data.suspect } : suspect)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateCase = async (caseId, updates) => {
    try {
      const response = await api.put(`/cases/${caseId}`, updates);
      setData(prev => ({
        ...prev,
        cases: prev.cases.map(c => c._id === caseId ? { ...c, ...response.data.case } : c)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const refreshData = () => fetchAllData();

  const value = {
    data,
    loading,
    actions: {
      updateFIR,
      addOfficer,
      updateOfficer,
      addCamera,
      updateCamera,
      acknowledgeAlert,
      addSuspect,
      updateSuspect,
      updateCase,
      refreshData
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);