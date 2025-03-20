import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { MedicalRecord, PatientProfile } from '../../types';

const Records: React.FC = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch the patient profile
      const { data: profileData, error: profileError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Get the first profile if exists
      const profile = profileData?.[0] || null;
      setProfile(profile);

      if (profile) {
        // Fetch all medical records
        const { data: recordsData, error: recordsError } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', profile.id)
          .order('visit_date', { ascending: false });

        if (recordsError) throw recordsError;
        setRecords(recordsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching patient records:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.visitType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.assessment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.plan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your medical records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>Error loading medical records: {error}</p>
            <button 
              onClick={fetchPatientData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            <p>No patient profile found. Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {record.visitType} - {new Date(record.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Subjective</h4>
                    <p className="mt-1 text-sm">{record.subjective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Objective</h4>
                    <p className="mt-1 text-sm">{record.objective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Assessment</h4>
                    <p className="mt-1 text-sm">{record.assessment}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Plan</h4>
                    <p className="mt-1 text-sm">{record.plan}</p>
                  </div>
                </div>
                {record.vitalSigns && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Vital Signs</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Temperature:</span>
                        <span className="ml-1">{record.vitalSigns.temperature}°F</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Blood Pressure:</span>
                        <span className="ml-1">{record.vitalSigns.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Heart Rate:</span>
                        <span className="ml-1">{record.vitalSigns.heartRate} bpm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">O2 Saturation:</span>
                        <span className="ml-1">{record.vitalSigns.oxygenSaturation}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <p className="text-center text-gray-500 py-4">No records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Records;