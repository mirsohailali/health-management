import React, { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, addMonths, subMonths, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import MonthView from '../components/Calendar/MonthView';
import AppointmentForm from '../components/Calendar/AppointmentForm';
import { Appointment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2025-03-01')); // Set initial date to March 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      let query = supabase.from('appointments').select(`
        *,
        patient:patient_profiles(
          id,
          user:user_profiles!user_id(
            first_name,
            last_name
          )
        )
      `);
      
      if (user?.role === 'patient') {
        // Get the patient profile ID first
        const { data: profileData } = await supabase
          .from('patient_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          query = query.eq('patient_id', profileData.id);
        }
      } else if (user?.role === 'doctor') {
        query = query.eq('provider_id', user.id);
      }

      // Add date range filter
      query = query
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString());

      const { data, error } = await query;
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handlePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };
  
  const handleTimeSlotClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(new Date(appointment.startTime));
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
            patient_id: appointmentData.patientId,
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
            patient_id: appointmentData.patientId,
            provider_id: appointmentData.providerId,
            status: appointmentData.status,
          }]);

        if (error) throw error;
      }

      await fetchAppointments();
      setSelectedDate(null);
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
      setSelectedDate(null);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const renderCalendarView = () => {
    const props = {
      currentDate,
      appointments,
      onTimeSlotClick: handleTimeSlotClick,
      onAppointmentClick: handleAppointmentClick,
    };

    switch (view) {
      case 'day':
        return <DayView {...props} />;
      case 'week':
        return <WeekView {...props} />;
      case 'month':
        return <MonthView {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <div className="flex items-center space-x-2 text-gray-500">
            <CalendarIcon className="h-5 w-5" />
            <span>{format(currentDate, 'MMMM yyyy')}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                view === 'day'
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                view === 'week'
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                view === 'month'
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {renderCalendarView()}

      {selectedDate && (
        <AppointmentForm
          selectedDate={selectedDate}
          appointment={selectedAppointment}
          onSubmit={handleAppointmentSubmit}
          onClose={() => {
            setSelectedDate(null);
            setSelectedAppointment(null);
          }}
          onDelete={handleAppointmentDelete}
        />
      )}
    </div>
  );
};

export default Schedule;