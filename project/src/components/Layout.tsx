import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  Video,
  LogOut,
  Menu,
  Home,
  Clock,
  FileCheck,
  UserCog
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, setUser } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isPatient = user.role === 'patient';

  const navigation = isPatient
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Records', href: '/records', icon: FileCheck },
        { name: 'Appointments', href: '/appointments', icon: Clock },
      ]
    : [
        { name: 'Schedule', href: '/schedule', icon: Calendar },
        { name: 'Patients', href: '/patients', icon: Users },
        { name: 'Charts', href: '/charts', icon: FileText },
        { name: 'Billing', href: '/billing', icon: CreditCard },
        { name: 'Telehealth', href: '/telehealth', icon: Video },
      ];

  const handleSignOut = async () => {
    setUser(null);
  };

  const switchToPatient = () => {
    setUser({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'patient@example.com',
      role: 'patient',
      firstName: 'John',
      lastName: 'Doe'
    });
  };

  const switchToDoctor = () => {
    setUser({
      id: '22222222-2222-2222-2222-222222222222',
      email: 'dr.sarah.wilson@example.com',
      role: 'doctor',
      firstName: 'Sarah',
      lastName: 'Wilson'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white px-4 py-2 flex items-center justify-center space-x-4">
        <span className="flex items-center">
          <UserCog className="h-5 w-5 mr-2" />
          View As:
        </span>
        <button
          onClick={switchToPatient}
          className={`px-4 py-1 rounded-full transition-colors ${
            isPatient 
              ? 'bg-white text-indigo-600' 
              : 'bg-indigo-500 hover:bg-indigo-400'
          }`}
        >
          Patient
        </button>
        <button
          onClick={switchToDoctor}
          className={`px-4 py-1 rounded-full transition-colors ${
            !isPatient 
              ? 'bg-white text-indigo-600' 
              : 'bg-indigo-500 hover:bg-indigo-400'
          }`}
        >
          Doctor
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out mt-12`}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-indigo-600">HealthClinic</h1>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-12 left-0 right-0 z-30 bg-white shadow-sm h-16 flex items-center px-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-indigo-600">HealthClinic</h1>
      </div>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'lg:pl-64' : ''} flex flex-col min-h-screen`}>
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-28 lg:mt-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;