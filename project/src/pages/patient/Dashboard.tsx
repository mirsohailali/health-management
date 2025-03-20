import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, Bell, Activity, Heart, Pill, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { PatientProfile, Appointment, MedicalRecord } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
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

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // First fetch the patient profile with user data
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
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch patient profile: ${profileError.message}`);
      }
      
      if (!profileData) {
        throw new Error('No patient profile found. Please contact support.');
      }

      setProfile(profileData);

      // Fetch appointments with provider details
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          provider:user_profiles!provider_id(
            first_name,
            last_name
          )
        `)
        .eq('patient_id', profileData.id)
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);

      if (appointmentsError) {
        throw new Error(`Failed to fetch appointments: ${appointmentsError.message}`);
      }
      
      setAppointments(appointmentsData || []);

      // Fetch recent medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', profileData.id)
        .order('visit_date', { ascending: false })
        .limit(3);

      if (recordsError) {
        throw new Error(`Failed to fetch medical records: ${recordsError.message}`);
      }
      
      setRecentRecords(recordsData || []);

    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>Error loading dashboard: {error || 'Profile not found'}</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold">Welcome back, {profile.user?.first_name}! 👋</h1>
        <p className="mt-2 text-indigo-100">Here's an overview of your health journey</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-200" />
              <div className="ml-4">
                <p className="text-indigo-100">Next Check-up</p>
                {appointments[0] ? (
                  <p className="text-lg font-semibold">
                    {new Date(appointments[0].startTime).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-lg font-semibold">No scheduled visits</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-indigo-200" />
              <div className="ml-4">
                <p className="text-indigo-100">Blood Type</p>
                <p className="text-lg font-semibold">{profile.bloodType || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-indigo-200" />
              <div className="ml-4">
                <p className="text-indigo-100">Medications</p>
                <p className="text-lg font-semibold">{profile.medications?.length || 0} Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link 
                  to="/appointments"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
                >
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${
                        appointment.type === 'telehealth' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {appointment.type === 'telehealth' ? (
                          <video className={`h-6 w-6 ${
                            appointment.type === 'telehealth' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        ) : (
                          <Calendar className={`h-6 w-6 ${
                            appointment.type === 'telehealth' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          {appointment.type === 'telehealth' ? 'Video Visit' : 'In-Person Visit'}
                          {appointment.provider && (
                            <span className="text-gray-500 ml-2">
                              with Dr. {appointment.provider.first_name} {appointment.provider.last_name}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(appointment.startTime).toLocaleDateString()}{' '}
                          {new Date(appointment.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {appointment.type === 'telehealth' && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Join Call
                      </button>
                    )}
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming appointments scheduled
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Medical Records */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Medical Records</h2>
                <Link 
                  to="/records"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
                >
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentRecords.map((record) => (
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
                {recentRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent medical records found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Profile Summary */}
          <div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleProfileClick}
          >
            <div className="text-center">
              <img
                src={`https://ui-avatars.com/api/?name=${profile.user?.first_name}+${profile.user?.last_name}&background=random&size=128`}
                alt=""
                className="h-24 w-24 rounded-full mx-auto"
              />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {profile.user?.first_name} {profile.user?.last_name}
              </h3>
              <p className="text-gray-500 text-sm">
                {new Date(profile.dateOfBirth).toLocaleDateString()} • {profile.gender}
              </p>
              <div className="mt-2 flex items-center justify-center text-indigo-600">
                <LinkIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">View Full Profile</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Blood Type</h4>
                <p className="mt-1 text-gray-900">{profile.bloodType || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Allergies</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {profile.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {allergy}
                    </span>
                  ))}
                  {(!profile.allergies || profile.allergies.length === 0) && (
                    <p className="text-gray-500 text-sm">No known allergies</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Current Medications</h4>
                <div className="mt-1 space-y-2">
                  {profile.medications?.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-900"
                    >
                      <Pill className="h-4 w-4 text-gray-400 mr-2" />
                      {medication}
                    </div>
                  ))}
                  {(!profile.medications || profile.medications.length === 0) && (
                    <p className="text-gray-500 text-sm">No current medications</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h2>
            {profile.emergencyContact ? (
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{profile.emergencyContact.name}</p>
                <p className="text-gray-500">{profile.emergencyContact.relationship}</p>
                <p className="text-gray-500">{profile.emergencyContact.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500">No emergency contact set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;