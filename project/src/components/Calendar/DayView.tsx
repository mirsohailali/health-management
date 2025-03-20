import React from 'react';
import { format, setHours, setMinutes, isSameDay } from 'date-fns';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const DayView: React.FC<DayViewProps> = ({ 
  currentDate, 
  appointments, 
  onTimeSlotClick,
  onAppointmentClick 
}) => {
  const startHour = 8;
  const endHour = 19;
  const timeSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  const getAppointmentsForSlot = (hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, currentDate) && aptDate.getHours() === hour;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b">
        <div className="text-lg font-medium">{format(currentDate, 'EEEE')}</div>
        <div className="text-sm text-gray-500">{format(currentDate, 'MMMM d, yyyy')}</div>
      </div>

      {/* Time slots */}
      <div className="divide-y">
        {timeSlots.map((hour) => {
          const slotDate = setMinutes(setHours(currentDate, hour), 0);
          const slotAppointments = getAppointmentsForSlot(hour);

          return (
            <div key={hour} className="flex">
              <div className="w-24 p-4 text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {format(setHours(new Date(), hour), 'h:mm a')}
              </div>
              <div
                className="flex-1 p-2 min-h-[100px] relative cursor-pointer hover:bg-gray-50 border-l"
                onClick={() => onTimeSlotClick(slotDate)}
              >
                {slotAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`absolute inset-x-1 p-2 rounded-md text-sm cursor-pointer hover:shadow-md transition-shadow ${
                      apt.type === 'telehealth'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                    style={{ top: `${slotAppointments.indexOf(apt) * 40}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    <div className="font-medium">
                      {apt.patient?.user?.first_name} {apt.patient?.user?.last_name}
                    </div>
                    <div className="text-xs">
                      {apt.type === 'telehealth' ? 'Video Visit' : 'In-Person Visit'}
                    </div>
                    <div className="text-xs">
                      {format(new Date(apt.startTime), 'h:mm a')} - {format(new Date(apt.endTime), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;