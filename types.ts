
export enum AgentType {
  COORDINATOR = 'COORDINATOR',
  PATIENT_MGMT = 'PATIENT_MANAGEMENT',
  SCHEDULER = 'APPOINTMENT_SCHEDULER',
  RECORDS = 'MEDICAL_RECORDS',
  BILLING = 'BILLING_INSURANCE',
  TECH_SUPPORT = 'TECHNICAL_SUPPORT'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  agent?: AgentType; // The agent responsible for this message
  timestamp: Date;
  isToolCall?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  contact: string;
  lastVisit: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctor: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface MedicalRecord {
  date: string;
  diagnosis: string;
  vitals: {
    bp: string;
    heartRate: number;
  };
}

export interface Invoice {
  id: string;
  patientId: string;
  amount: number;
  status: 'Paid' | 'Pending';
  description: string;
}
