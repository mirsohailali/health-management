import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Phone, Mail, AlertCircle, Activity, FileText, Calendar, ChevronLeft, Clock, Heart, Thermometer, Settings as Lungs, Scale, Ruler } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PatientProfile, MedicalRecord, Appointment } from '../../types';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patient profile with user data
      const { data: profileData, error: profileError } = await supabase
        .from('patient_profiles')
        .select(`
          *,
          user:user_profiles!user_id(
            email,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setPatient(profileData);

      // Fetch recent medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', id)
        .order('visit_date', { ascending: false })
        .limit(5);

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);

      // Fetch upcoming appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', id)
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>Error loading patient profile: {error || 'Patient not found'}</p>
            <Link 
              to="/patients"
              className="mt-4 inline-flex items-center text-red-700 hover:text-red-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Patients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/patients"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Patients
        </Link>
      </div>

      {/* Patient Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${patient.user?.first_name}+${patient.user?.last_name}&background=random&size=128`}
              alt=""
              className="h-24 w-24 rounded-full"
            />
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.user?.first_name} {patient.user?.last_name}
              </h1>
              <div className="mt-2 text-gray-500 space-y-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {patient.gender}, {age} years
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {patient.user?.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.emergencyContact?.phone}
                </div>
              </div>
            </div>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Vitals */}
          {records[0]?.vitalSigns && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Latest Vital Signs</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Heart Rate</p>
                    <p className="text-lg font-semibold">{records[0].vitalSigns.heartRate} bpm</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Thermometer className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Temperature</p>
                    <p className="text-lg font-semibold">{records[0].vitalSigns.temperature}°F</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Lungs className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <p className="text-lg font-semibold">{records[0].vitalSigns.bloodPressure}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">O2 Saturation</p>
                    <p className="text-lg font-semibold">{records[0].vitalSigns.oxygenSaturation}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.type === 'telehealth' ? 'Video Visit' : 'In-Person Visit'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(appointment.startTime).toLocaleDateString()}{' '}
                        {new Date(appointment.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
              )}
            </div>
          </div>

          {/* Recent Medical Records */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Medical Records</h2>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{record.visitType}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  {record.assessment && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{record.assessment}</p>
                  )}
                </div>
              ))}
              {records.length === 0 && (
                <p className="text-center text-gray-500 py-4">No medical records found</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Medical Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Medical Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                <p className="mt-1 text-gray-900">{patient.bloodType || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patient.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {allergy}
                    </span>
                  ))}
                  {(!patient.allergies || patient.allergies.length === 0) && (
                    <p className="text-gray-500 text-sm">No known allergies</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Medical Conditions</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patient.medicalConditions?.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {condition}
                    </span>
                  ))}
                  {(!patient.medicalConditions || patient.medicalConditions.length === 0) && (
                    <p className="text-gray-500 text-sm">No medical conditions</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Medications</h3>
                <div className="mt-2 space-y-2">
                  {patient.medications?.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-900"
                    >
                      <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                      {medication}
                    </div>
                  ))}
                  {(!patient.medications || patient.medications.length === 0) && (
                    <p className="text-gray-500 text-sm">No current medications</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h2>
            {patient.emergencyContact ? (
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{patient.emergencyContact.name}</p>
                <p className="text-gray-500">{patient.emergencyContact.relationship}</p>
                <p className="text-gray-500">{patient.emergencyContact.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500">No emergency contact information</p>
            )}
          </div>

          {/* Insurance Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Insurance Information</h2>
            {patient.insuranceInfo ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium">{patient.insuranceInfo.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Policy Number</p>
                  <p className="font-medium">{patient.insuranceInfo.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Group Number</p>
                  <p className="font-medium">{patient.insuranceInfo.groupNumber}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No insurance information</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;