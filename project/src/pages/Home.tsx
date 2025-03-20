import React from 'react';
import { Users, Calendar, FileText, TrendingUp, Clock, Bell, Building2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HealthClinic Dashboard</h1>
            <p className="mt-2 text-blue-100">Welcome to your medical practice management system</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center bg-white/10 backdrop-blur-lg px-4 py-2 rounded-lg">
              <Building2 className="h-5 w-5 mr-2" />
              <span>Main Clinic</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-200" />
              <div className="ml-4">
                <p className="text-blue-100">Total Patients</p>
                <p className="text-2xl font-semibold">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-200" />
              <div className="ml-4">
                <p className="text-blue-100">Today's Appointments</p>
                <p className="text-2xl font-semibold">28</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-200" />
              <div className="ml-4">
                <p className="text-blue-100">Avg. Wait Time</p>
                <p className="text-2xl font-semibold">12 min</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-200" />
              <div className="ml-4">
                <p className="text-blue-100">Patient Satisfaction</p>
                <p className="text-2xl font-semibold">96%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                <Link
                  to="/schedule"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  View Full Schedule
                </Link>
              </div>
              <div className="space-y-4">
                {[
                  {
                    time: '9:00 AM',
                    patient: 'Sarah Johnson',
                    type: 'Check-up',
                    status: 'Checked In',
                    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
                  },
                  {
                    time: '10:30 AM',
                    patient: 'Michael Chen',
                    type: 'Follow-up',
                    status: 'Scheduled',
                    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random',
                  },
                  {
                    time: '11:45 AM',
                    patient: 'Emily Davis',
                    type: 'Consultation',
                    status: 'In Progress',
                    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=random',
                  },
                ].map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-500 w-20">
                        {appointment.time}
                      </div>
                      <img
                        src={appointment.avatar}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patient}</p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'Checked In'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'In Progress'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: FileText,
                    title: 'Medical record updated',
                    description: "Dr. Thompson updated Sarah Johnson's medical records",
                    time: '2 hours ago',
                  },
                  {
                    icon: UserCheck,
                    title: 'New patient registered',
                    description: 'Robert Martinez completed registration',
                    time: '4 hours ago',
                  },
                  {
                    icon: Calendar,
                    title: 'Appointment rescheduled',
                    description: 'Emily Davis rescheduled to next Tuesday',
                    time: '5 hours ago',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Patient Check-ins</span>
                  <span className="text-sm font-medium text-gray-900">24/30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Room Availability</span>
                  <span className="text-sm font-medium text-gray-900">5/8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Staff Present</span>
                  <span className="text-sm font-medium text-gray-900">12/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Tasks</h2>
            <div className="space-y-4">
              {[
                {
                  task: 'Review lab results',
                  patient: 'Sarah Johnson',
                  time: '11:00 AM',
                  priority: 'high',
                },
                {
                  task: 'Team meeting',
                  patient: null,
                  time: '2:00 PM',
                  priority: 'medium',
                },
                {
                  task: 'Follow-up calls',
                  patient: 'Multiple patients',
                  time: '4:00 PM',
                  priority: 'low',
                },
              ].map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{task.task}</p>
                    {task.patient && (
                      <p className="text-sm text-gray-500">{task.patient}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{task.time}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;