import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddPatientFormProps {
  onSubmit: (data: {
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
  }) => void;
  onClose: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    allergies: [''],
    medications: [''],
    medicalConditions: [''],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleArrayInput = (
    field: 'allergies' | 'medications' | 'medicalConditions',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'allergies' | 'medications' | 'medicalConditions') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (
    field: 'allergies' | 'medications' | 'medicalConditions',
    index: number
  ) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Add New Patient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
            {formData.allergies.map((allergy, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => handleArrayInput('allergies', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter allergy"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('allergies', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('allergies')}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              + Add Allergy
            </button>
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
            {formData.medications.map((medication, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => handleArrayInput('medications', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter medication"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('medications', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('medications')}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              + Add Medication
            </button>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Conditions
            </label>
            {formData.medicalConditions.map((condition, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => handleArrayInput('medicalConditions', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter medical condition"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('medicalConditions', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('medicalConditions')}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              + Add Medical Condition
            </button>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Name</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500">Relationship</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Provider</label>
                <input
                  type="text"
                  required
                  value={formData.insuranceInfo.provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insuranceInfo: { ...formData.insuranceInfo, provider: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500">Policy Number</label>
                <input
                  type="text"
                  required
                  value={formData.insuranceInfo.policyNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insuranceInfo: { ...formData.insuranceInfo, policyNumber: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500">Group Number</label>
                <input
                  type="text"
                  required
                  value={formData.insuranceInfo.groupNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insuranceInfo: { ...formData.insuranceInfo, groupNumber: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
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
              Create Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;