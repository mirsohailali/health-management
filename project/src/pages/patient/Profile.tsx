import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { PatientProfile } from '../../types';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
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
        `)
        .eq('user_id', user?.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>Error loading profile: {error || 'Profile not found'}</p>
            <button
              onClick={fetchProfile}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${profile.user?.first_name}+${profile.user?.last_name}&background=random&size=128`}
              alt=""
              className="h-24 w-24 rounded-full"
            />
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.user?.first_name} {profile.user?.last_name}
              </h1>
              <p className="text-gray-500 mt-1">Age: {age} • {profile.gender}</p>
              <p className="text-gray-500">{profile.user?.email}</p>
            </div>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="mt-1">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Blood Type</label>
                <p className="mt-1">{profile.bloodType || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Allergies</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {allergy}
                    </span>
                  ))}
                  {(!profile.allergies || profile.allergies.length === 0) && (
                    <p className="text-gray-500">No known allergies</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Medical Conditions</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.medicalConditions?.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {condition}
                    </span>
                  ))}
                  {(!profile.medicalConditions || profile.medicalConditions.length === 0) && (
                    <p className="text-gray-500">No medical conditions</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Medications</label>
                <div className="mt-2">
                  {profile.medications?.map((medication, index) => (
                    <div key={index} className="flex items-center text-gray-900 mb-2">
                      <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                      {medication}
                    </div>
                  ))}
                  {(!profile.medications || profile.medications.length === 0) && (
                    <p className="text-gray-500">No current medications</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
              {profile.emergencyContact ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{profile.emergencyContact.name}</p>
                  <p className="text-gray-500">{profile.emergencyContact.relationship}</p>
                  <p className="text-gray-500">{profile.emergencyContact.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500">No emergency contact information</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h2>
              {profile.insuranceInfo ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Provider</label>
                      <p className="text-gray-900">{profile.insuranceInfo.provider}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Policy Number</label>
                      <p className="text-gray-900">{profile.insuranceInfo.policyNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Group Number</label>
                      <p className="text-gray-900">{profile.insuranceInfo.groupNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No insurance information</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;