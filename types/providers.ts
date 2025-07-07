export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  medicalHistory?: string;
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReport {
  id: number;
  patientId: number;
  diagnosis: string;
  date: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Study {
  id: number;
  medicalReportId: number;
  studyTypeId: number;
  result: string;
  notes: string;
  date: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface StudyType {
  id: number;
  categoryId: number;
  name: string;
  description: string;
}

export interface EmailData {
  to: string;
  subject: string;
  nombreDeUsuario: string;
  fecha: string;
  url: string;
}

export interface MergePdfData {
  pdfUrls: string[];
}

export interface MergePdfResult {
  success: boolean;
  url: string;
  message?: string;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type CRUDOperation<T> = {
  create: (data: Omit<T, 'id'>) => Promise<APIResponse<T>>;
  read: (id: number) => Promise<APIResponse<T>>;
  update: (id: number, data: Partial<T>) => Promise<APIResponse<T>>;
  delete: (id: number) => Promise<APIResponse<boolean>>;
  list: () => Promise<APIResponse<T[]>>;
};

export interface DemoData {
  patients: Patient[];
  medicalReports: MedicalReport[];
  categories: Category[];
  studyTypes: StudyType[];
  studies: Study[];
}
