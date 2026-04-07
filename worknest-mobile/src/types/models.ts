export type User = {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  currentLocation?: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
};

export type AuthPayload = {
  accessToken: string;
  user: User;
};

export type Job = {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType?: string;
  salaryRange?: string;
  description?: string;
  requirement?: string[];
  applicationQuestions?: string[];
  isSaved?: boolean;
  createdAt?: string;
};

export type Application = {
  id: string;
  status: string;
  createdAt: string;
  job: Partial<Job>;
  personalInfo?: Record<string, string>;
  answers?: Array<{ question: string; answer: string }>;
  interview_questions?: Array<{ question: string; answer?: string }>;
};
