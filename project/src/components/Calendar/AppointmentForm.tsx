import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, FileText, Video, Users } from 'lucide-react';
import { Appointment } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface AppointmentFormProps {
  selectedDate: Date;
  appointment?: Appointment | null;
  onSubmit: (appointment: {
    startTime: string;
    endTime: string;
    type: 'in-person' | 'telehealth';
    notes: string;
    patientId: string;
    providerId: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  }) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  appointment,
  onSubmit,
  onClose,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    type: 'in-person' as 'in-person' | 'telehealth',
    duration: '30',
    notes: '',
    patientId: '',
    providerId: user?.role === 'doctor' ? user.id : '',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
  });

  const [patients, setPatients] = useState<Array<{ id: string; user: { first_name: string; last_name: string } }>>([]);
  const [providers, setProviders] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);

  useEffect(() => {
    if (appointment) {
      const duration = Math.round(
        (new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / 60000
      ).toString();

      setFormData({
        type: appointment.type,
        duration,
        notes: appointment.notes || '',
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        status: appointment.status,
      });
    }

    fetchPatients();
    fetchProviders();
  }, [appointment]);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patient_profiles')
      .select(`
        id,
        user:user_profiles!user_id (
          first_name,
          last_name
        )
      `);
    if (data) setPatients(data);
  };

  const fetchProviders = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('role', 'doctor');
    if (data) setProviders(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = selectedDate.toISOString();
    const endTime = new Date(
      selectedDate.getTime() + parseInt(formData.duration) * 60000
    ).toISOString();

    onSubmit({
      startTime,
      endTime,
      type: formData.type,
      notes: formData.notes,
      patientId: formData.patientId,
      providerId: formData.providerId,
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-medium mb-4">
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-2" />
              {format(selectedDate, 'MMMM d, yyyy')}
              <Clock className="h-5 w-5 mx-2" />
              {format(selectedDate, 'h:mm a')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.user.first_name} {patient.user.last_name}
                </option>
              ))}
            </select>
          </div>

          {user?.role !== 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                value={formData.providerId}
                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    Dr. {provider.first_name} {provider.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`flex items-center justify-center p-3 rounded-lg border ${
                  formData.type === 'in-person'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, type: 'in-person' })}
              >
                <Users className="h-5 w-5 mr-2" />
                In-Person
              </button>
              <button
                type="button"
                className={`flex items-center justify-center p-3 rounded-lg border ${
                  formData.type === 'telehealth'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, type: 'telehealth' })}
              >
                <Video className="h-5 w-5 mr-2" />
                Telehealth
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>

          {appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <div className="relative">
              <FileText className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                placeholder="Add appointment notes..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {appointment && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(appointment.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {appointment ? 'Update' : 'Create'} Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;