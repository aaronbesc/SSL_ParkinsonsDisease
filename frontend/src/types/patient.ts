export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  recordNumber: string;
  age: number;
  height: string;
  weight: string;
  labResults: string;
  doctorNotes: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  patientId: string;
  name: string;
  type: 'stand-and-sit' | 'palm-open';
  date: Date;
  status: 'completed' | 'in-progress' | 'pending';
  videoUrl?: string;
  results?: TestResults;
}

export interface TestResults {
  duration: number;
  score: number;
  keypoints: Keypoint[];
  analysis: string;
}

export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
  timestamp: number;
}

export const AVAILABLE_TESTS = [
  { id: 'stand-and-sit', name: 'Stand and Sit Test', description: 'Measures motor function through standing and sitting movements' },
  { id: 'palm-open', name: 'Palm Open Test', description: 'Evaluates hand motor function and dexterity' },
  { id: 'finger-tapping', name: 'Finger Tapping Test', description: 'Measures rapid finger tapping for motor speed and coordination' },
  { id: 'fist-open-close', name: 'Fist Open and Close Test', description: 'Assesses hand opening and closing cycles for bradykinesia' }
] as const;