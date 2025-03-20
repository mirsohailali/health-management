import { Database } from './types/supabase';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  firstName: string;
  lastName: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'telehealth';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  patient?: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  provider?: {
    first_name: string;
    last_name: string;
  };
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender?: string;
  bloodType?: string;
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
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  visitDate: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  visitType: string;
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MedicalFile {
  id: string;
  recordId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface CustomForm {
  id: string;
  title: string;
  description?: string;
  formFields: {
    id: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
    label: string;
    required: boolean;
    options?: string[];
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  patientId: string;
  submittedData: Record<string, any>;
  submittedAt: string;
}