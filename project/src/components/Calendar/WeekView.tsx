import React from 'react';
import { format, addDays, startOfWeek, setHours, setMinutes, isSameDay } from 'date-fns';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  appointments, 
  onTimeSlotClick,
  onAppointmentClick 
}) => {
  const startHour = 8;
  const endHour = 19;
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const timeSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-4 text-sm font-medium text-gray-500">Time</div>
        {weekDays.map((day, i) => (
          <div key={i} className="p-4 text-center border-l">
            <div className="font-medium">{format(day, 'EEE')}</div>
            <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="divide-y">
        {timeSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-8">
            <div className="p-4 text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {format(setHours(new Date(), hour), 'h:mm a')}
            </div>
            {weekDays.map((day, dayIndex) => {
              const slotDate = setMinutes(setHours(day, hour), 0);
              const slotAppointments = getAppointmentsForSlot(day, hour);
              
              return (
                <div
                  key={dayIndex}
                  className="border-l p-2 min-h-[100px] relative group cursor-pointer hover:bg-gray-50"
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;