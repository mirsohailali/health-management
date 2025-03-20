import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  setHours,
} from 'date-fns';
import { Appointment } from '../../types';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onTimeSlotClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  currentDate, 
  appointments, 
  onTimeSlotClick,
  onAppointmentClick 
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.startTime), day));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-sm font-medium text-gray-500 text-center"
          >
            {day}
          </div>
        ))}
        {days.map((day, dayIdx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toString()}
              className={`min-h-[120px] bg-white p-2 relative ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              }`}
              onClick={() => onTimeSlotClick(setHours(day, 9))}
            >
              <div className={`text-sm ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </div>
              <div className="mt-2">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-75 ${
                      apt.type === 'telehealth'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    <div className="font-medium">
                      {apt.patient?.user?.first_name} {apt.patient?.user?.last_name}
                    </div>
                    <div>
                      {format(new Date(apt.startTime), 'h:mm a')} - {apt.type}
                    </div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;