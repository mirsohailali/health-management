import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Appointment, PatientProfile } from '../../types';
import AppointmentForm from '../../components/Calendar/AppointmentForm';

const Appointments: React.FC = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

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
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData) {
        // Fetch all appointments with provider details
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
          .order('start_time', { ascending: true });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async (appointmentData: {
    startTime: string;
    endTime: string;
    type: 'in-person' | 'telehealth';
    notes: string;
    patientId: string;
    providerId: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  }) => {
    try {
      if (selectedAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update({
            start_time: appointmentData.startTime,
            end_time: appointmentData.endTime,
            type: appointmentData.type,
            notes: appointmentData.notes,
            provider_id: appointmentData.providerId,
            status: appointmentData.status,
          })
          .eq('id', selectedAppointment.id);

        if (error) throw error;
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert([{
            start_time: appointmentData.startTime,
            end_time: appointmentData.endTime,
            type: appointmentData.type,
            notes: appointmentData.notes,
            patient_id: profile?.id,
            provider_id: appointmentData.providerId,
            status: 'scheduled',
          }]);

        if (error) throw error;
      }

      await fetchAppointments();
      setShowAppointmentForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleAppointmentDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAppointments();
      setShowAppointmentForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) > new Date()
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) <= new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>Error loading appointments: {error}</p>
            <button 
              onClick={fetchAppointments}
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
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <button 
          onClick={() => {
            setSelectedAppointment(null);
            setShowAppointmentForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Request Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowAppointmentForm(true);
                }}
              >
                <div className="flex items-center">
                  {appointment.type === 'telehealth' ? (
                    <Video className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                  )}
                  <div>
                    <p className="font-medium">
                      {appointment.type === 'telehealth' ? 'Video Visit' : 'In-Person Visit'}
                      {appointment.provider && (
                        <span className="text-gray-500 ml-2">
                          with Dr. {appointment.provider.first_name} {appointment.provider.last_name}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(appointment.startTime).toLocaleDateString()}{' '}
                      {new Date(appointment.startTime).toLocaleTimeString()} - {' '}
                      {new Date(appointment.endTime).toLocaleTimeString()}
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>

      {/* Past Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center">
                  {appointment.type === 'telehealth' ? (
                    <Video className="h-5 w-5 text-gray-400 mr-3" />
                  ) : (
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-gray-600">
                      {appointment.type === 'telehealth' ? 'Video Visit' : 'In-Person Visit'}
                      {appointment.provider && (
                        <span className="text-gray-500 ml-2">
                          with Dr. {appointment.provider.first_name} {appointment.provider.last_name}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(appointment.startTime).toLocaleDateString()}{' '}
                      {new Date(appointment.startTime).toLocaleTimeString()}
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                    )}
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800">
                  View Summary
                </button>
              </div>
            ))}
            {pastAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-4">No past appointments</p>
            )}
          </div>
        </div>
      </div>

      {showAppointmentForm && (
        <AppointmentForm
          selectedDate={selectedAppointment ? new Date(selectedAppointment.startTime) : new Date()}
          appointment={selectedAppointment}
          onSubmit={handleAppointmentSubmit}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
          }}
          onDelete={handleAppointmentDelete}
        />
      )}
    </div>
  );
};

export default Appointments;