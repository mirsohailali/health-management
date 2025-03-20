import React, { useState, useEffect } from 'react';
import { FileText, Clock, User, Plus, Search } from 'lucide-react';
import SOAPNoteForm from '../components/Charts/SOAPNoteForm';
import PatientInfo from '../components/Charts/PatientInfo';
import { MedicalRecord, PatientProfile } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const Charts: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [showNewNote, setShowNewNote] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientRecords(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select(`
          *,
          user:user_profiles!user_id(
            email,
            first_name,
            last_name
          )
        `);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatientRecords = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleCreateNote = async (note: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([{ ...note, provider_id: user?.id }]);

      if (error) throw error;

      setShowNewNote(false);
      if (selectedPatient) {
        fetchPatientRecords(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patient Charts</h1>
        <button
          onClick={() => setShowNewNote(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          disabled={!selectedPatient}
        >
          <Plus className="h-5 w-5 mr-2" />
          New SOAP Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  selectedPatient?.id === patient.id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${patient.user?.first_name}+${patient.user?.last_name}&background=random`}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="ml-3">
                    <div className="font-medium">
                      {patient.user?.first_name} {patient.user?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Details and Records */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPatient ? (
            <>
              <PatientInfo patient={selectedPatient} />
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-medium mb-4">Medical Records</h2>
                  <div className="space-y-4">
                    {records.map((record) => (
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
                          <div className="text-sm text-gray-500">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Date(record.createdAt).toLocaleTimeString()}
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
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a patient to view their records
            </div>
          )}
        </div>
      </div>

      {showNewNote && selectedPatient && (
        <SOAPNoteForm
          patientId={selectedPatient.id}
          onSubmit={handleCreateNote}
          onClose={() => setShowNewNote(false)}
        />
      )}
    </div>
  );
};

export default Charts;