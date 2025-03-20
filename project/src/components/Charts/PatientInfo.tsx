import React from 'react';
import { User, Phone, Mail, AlertCircle, Activity, FileText } from 'lucide-react';
import { PatientProfile } from '../../types';

interface PatientInfoProps {
  patient: PatientProfile;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${patient.user?.first_name}+${patient.user?.last_name}&background=random`}
              alt=""
              className="h-16 w-16 rounded-full"
            />
            <div className="ml-4">
              <h2 className="text-xl font-medium">
                {patient.user?.first_name} {patient.user?.last_name}
              </h2>
              <div className="mt-1 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {patient.gender}, {age} years
                </div>
                <div className="flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  {patient.emergencyContact?.phone}
                </div>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {patient.user?.email}
                </div>
              </div>
            </div>
          </div>
          <button className="text-indigo-600 hover:text-indigo-900">
            Edit Profile
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center text-sm font-medium text-gray-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              Allergies
            </h3>
            <div className="mt-2 space-y-1">
              {patient.allergies?.map((allergy, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2"
                >
                  {allergy}
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="flex items-center text-sm font-medium text-gray-500">
              <Activity className="h-4 w-4 mr-1" />
              Medical Conditions
            </h3>
            <div className="mt-2 space-y-1">
              {patient.medicalConditions?.map((condition, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2"
                >
                  {condition}
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="flex items-center text-sm font-medium text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              Current Medications
            </h3>
            <div className="mt-2 space-y-1">
              {patient.medications?.map((medication, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                >
                  {medication}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Insurance Information</h3>
          <div className="mt-2 text-sm">
            <p>Provider: {patient.insuranceInfo?.provider}</p>
            <p>Policy Number: {patient.insuranceInfo?.policyNumber}</p>
            <p>Group Number: {patient.insuranceInfo?.groupNumber}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
          <div className="mt-2 text-sm">
            <p>Name: {patient.emergencyContact?.name}</p>
            <p>Relationship: {patient.emergencyContact?.relationship}</p>
            <p>Phone: {patient.emergencyContact?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;