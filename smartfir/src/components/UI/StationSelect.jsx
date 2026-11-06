import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import api from '../../services/api';

export function StationSelect({ value, onValueChange, placeholder = 'Select Police Station' }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        console.log('🔍 Fetching stations...');
        const response = await api.get('/stations');
        console.log('📦 Full API response:', response);
        console.log('📦 Stations data:', response.data);
        console.log('📦 Stations array:', response.data.stations);
        setStations(response.data.stations || []);
      } catch (error) {
        console.error('❌ Error fetching stations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading stations...</div>;
  }

  // Show a message if no stations are found
  if (stations.length === 0) {
    return <div className="text-sm text-red-500">No stations found. Please run the seeder.</div>;
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {stations.map((station) => (
          <SelectItem key={station._id} value={station._id}>
            {station.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}