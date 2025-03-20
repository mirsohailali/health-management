import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddPatientForm from '../components/Patients/AddPatientForm';
import { supabase } from '../lib/supabase';
import { PatientProfile } from '../types';
import { useAuthStore } from '../store/authStore';

const Patients: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patient_profiles')
        .select(`
          *,
          user:user_profiles!user_id(
            email,
            first_name,
            last_name
          )
        `);

      if (fetchError) {
        throw fetchError;
      }

      setPatients(data || []);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (formData: {
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodType: string;
    allergies: string[];
    medications: string[];
    medicalConditions: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    insuranceInfo: {
      provider: string;
      policyNumber: string;
      groupNumber: string;
    };
  }) => {
    try {
      setError(null);

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temppass123', // You should implement a proper password system
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'patient',
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Then create the patient profile
      const { error: profileError } = await supabase
        .from('patient_profiles')
        .insert([
          {
            user_id: authData.user.id,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            blood_type: formData.bloodType,
            allergies: formData.allergies.filter(Boolean),
            medications: formData.medications.filter(Boolean),
            medical_conditions: formData.medicalConditions.filter(Boolean),
            emergency_contact: formData.emergencyContact,
            insurance_info: formData.insuranceInfo,
          },
        ]);

      if (profileError) throw profileError;

      setShowAddForm(false);
      fetchPatients();
    } catch (error: any) {
      console.error('Error creating patient:', error);
      setError(error.message || 'Failed to create patient');
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      (patient.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filter === 'all' || (filter === 'active' && patient.user))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Patient
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading patients...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${patient.user?.first_name}+${patient.user?.last_name}&background=random`}
                            alt=""
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.user?.first_name} {patient.user?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.user?.email}</div>
                        <div className="text-sm text-gray-500">
                          {patient.emergencyContact?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            patient.user ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {patient.user ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          View Profile
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No patients found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <AddPatientForm onSubmit={handleAddPatient} onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
};

export default Patients;