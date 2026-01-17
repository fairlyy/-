export enum AppStep {
  CASE_SELECTION = 'CASE_SELECTION',
  CONSULTATION = 'CONSULTATION',
  CONFIRM_POINTS = 'CONFIRM_POINTS',
  DIAGNOSIS = 'DIAGNOSIS',
  REPORT = 'REPORT',
  HISTORY = 'HISTORY'
}

export interface CaseScenario {
  id: string;
  title: string;
  difficulty: '基础' | '进阶' | '困难';
  category: string;
  patientInfo: {
    age: number;
    gender: '男' | '女';
    occupation: string;
    chiefComplaint: string; // 主诉
  };
  // Hidden from user, used for AI prompting
  hiddenProfile: string;
  standardDiagnosis: {
    syndrome: string; // 证候
    treatment: string; // 治法
    evidence: string; // 辨证依据
  };
}

export interface Message {
  id: string;
  role: 'doctor' | 'patient' | 'system';
  content: string;
  timestamp: number;
}

// Four Examinations Categories
export enum ExamCategory {
  WANG = '望诊',
  WEN_SMELL = '闻诊',
  WEN_ASK = '问诊',
  QIE = '切诊'
}

export interface ClinicalPoint {
  id: string;
  category: ExamCategory; // Four examinations category
  subCategory: string; // e.g., "寒热", "汗", "头身"
  content: string; // The specific symptom extracted
  sourceMessageId?: string; // Link back to chat
  status: 'detected' | 'confirmed';
}

export interface DiagnosisSubmission {
  syndrome: string;
  treatment: string;
}

export interface ReportResult {
  score: number;
  feedback: string;
  syndromeCheck: {
    studentInput: string;
    standard: string;
    isCorrect: boolean;
    explanation: string;
  };
  treatmentCheck: {
    studentInput: string;
    standard: string;
    isCorrect: boolean;
    explanation: string;
  };
  evidenceChain: string[];
  missedPoints: string[];
}

export interface HistoryRecord {
  id: string;
  caseId: string;
  date: string;
  messages: Message[];
  points: ClinicalPoint[];
  submission: DiagnosisSubmission;
  report: ReportResult;
}