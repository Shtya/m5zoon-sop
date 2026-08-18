export type SopStep = { id: string; text: string; imageUrl?: string };
export type DecisionRule = { condition: string; action: string };
export type EscalationContact = {
  problemType: string;
  userId?: string;
  name: string;
  position: string;
  phone: string;
  whatsapp?: string;
};
export type Attachment = { type: "google_doc" | "word" | "other"; label: string; url: string };

export type SopContentSnapshot = {
  department: string;
  title: string;
  objective: string;
  steps: SopStep[];
  decisionRules: DecisionRule[];
  escalationContacts: EscalationContact[];
  commonMistakes: string[];
  videoLink: string;
  attachments: Attachment[];
  keywords: string[];
  relatedStatuses: string[];
  relatedActions: string[];
  countries: string[];
  reviewDate: string | null;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string | null;
  phone: string | null;
  avatar: string | null;
  active: boolean;
  extraPermissions?: string[];
  deniedPermissions?: string[];
  allowedCountries?: string[];
  allowedDepartments?: string[];
  createdAt: string;
};

export type PublicSop = {
  id: string;
  department: string;
  title: string;
  objective: string;
  steps: SopStep[];
  decisionRules: DecisionRule[];
  escalationContacts: EscalationContact[];
  commonMistakes: string[];
  videoLink: string;
  keywords: string[];
  relatedStatuses: string[];
  relatedActions: string[];
  attachments: Attachment[];
  countries: string[];
  views: number;
  helpfulCount: number;
  notHelpfulCount: number;
  reviewDate: string | null;
  version: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  history: {
    version: string;
    date: string;
    by: string;
    note: string;
    previousContent?: unknown;
    currentContent?: unknown;
  }[];
  comments: { id: string; userId: string; text: string; date: string }[];
  acknowledgments: string[];
  myFeedback: "helpful" | "notHelpful" | null;
};

export type PublicIssue = {
  id: string;
  title: string;
  department: string;
  category: string;
  severity: string;
  status: string;
  date: string;
  reportedBy: string;
  affectedUsers: string[];
  description: string;
  rootCauses: string[];
  solution: string;
  preventionSteps: string[];
  videoLink: string;
  isRecurring: boolean;
  recurrenceCount: number;
  countries: string[];
  comments: { id: string; userId: string; text: string; date: string }[];
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrainingStepType = "read_sop" | "watch_video" | "read_content" | "task";

export type PublicTrainingStep = {
  id: string;
  sortOrder: number;
  type: TrainingStepType;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  sopId: string | null;
  sopTitle?: string | null;
  required: boolean;
  completed: boolean;
  completedAt: string | null;
  locked: boolean;
};

export type PublicTrainingPath = {
  id: string;
  title: string;
  department: string;
  description: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  steps: PublicTrainingStep[];
  enrollment: {
    id: string;
    status: "not_started" | "in_progress" | "completed";
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  progress: {
    done: number;
    total: number;
    percent: number;
  };
  enrolledCount: number;
};
