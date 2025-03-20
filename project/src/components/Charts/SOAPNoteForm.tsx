import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MedicalRecord } from '../../types';

interface SOAPNoteFormProps {
  patientId: string;
  onSubmit: (note: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const SOAPNoteForm: React.FC<SOAPNoteFormProps> = ({ patientId, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    visitType: 'routine',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    vitalSigns: {
      temperature: 98.6,
      bloodPressure: '120/80',
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 150,
      height: 70,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patientId,
      providerId: 'current-provider-id', // This will be set by the backend
      visitDate: new Date().toISOString(),
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">New SOAP Note</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Type
              </label>
              <select
                value={formData.visitType}
                onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="routine">Routine Check-up</option>
                <option value="follow-up">Follow-up</option>
                <option value="acute">Acute Visit</option>
                <option value="chronic">Chronic Care</option>
                <option value="telehealth">Telehealth Visit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitalSigns: {
                      ...formData.vitalSigns,
                      temperature: parseFloat(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitalSigns: {
                      ...formData.vitalSigns,
                      bloodPressure: e.target.value,
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="120/80"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={formData.vitalSigns.heartRate}
                onChange={(e) => setFormData({
                  ...formData,
                  vitalSigns: {
                    ...formData.vitalSigns,
                    heartRate: parseInt(e.target.value),
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Respiratory Rate
              </label>
              <input
                type="number"
                value={formData.vitalSigns.respiratoryRate}
                onChange={(e) => setFormData({
                  ...formData,
                  vitalSigns: {
                    ...formData.vitalSigns,
                    respiratoryRate: parseInt(e.target.value),
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O2 Saturation (%)
              </label>
              <input
                type="number"
                value={formData.vitalSigns.oxygenSaturation}
                onChange={(e) => setFormData({
                  ...formData,
                  vitalSigns: {
                    ...formData.vitalSigns,
                    oxygenSaturation: parseInt(e.target.value),
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjective
            </label>
            <textarea
              value={formData.subjective}
              onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Patient's description of symptoms, concerns, and history..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objective
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Physical examination findings, test results, measurements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment
            </label>
            <textarea
              value={formData.assessment}
              onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Diagnosis, differential diagnoses, clinical impressions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <textarea
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Treatment plan, medications, follow-up instructions..."
            />
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
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SOAPNoteForm;