export type CourseCategory =
  | 'Web Design'
  | 'Web Development'
  | 'Social Media Management'
  | 'Video Editing'
  | 'AI Prompt Generator'
  | string;

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export const COURSE_CATEGORIES: string[] = [
  'Web Design',
  'Web Development',
  'Social Media Management',
  'Video Editing',
  'AI Prompt Generator',
];

export const COURSE_LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  description: string;
  instructor: string;
  instructorBio?: string;
  duration: string;
  thumbnailUrl: string;
  lessonCount: number;
  published: boolean;
  isSeeded?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  duration: string;
  summary: string;
  videoUrl: string;
  resourceTitle: string;
  resourceUrl?: string;
  resourceContent: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  level: CourseLevel;
  status: 'in_progress' | 'completed';
  enrolledAt?: unknown;
  updatedAt?: unknown;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastLessonId?: string;
  progressPercent: number;
  status: 'in_progress' | 'completed';
  updatedAt?: unknown;
  completedAt?: unknown;
}

export interface Certificate {
  id: string;
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  level: CourseLevel;
  certificateCode: string;
  issuedBy: string;
  issuedAt?: unknown;
}

export interface CertificateVerification {
  certificateCode: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  courseCategory: string;
  level: CourseLevel;
  issuedBy: string;
  valid: boolean;
  issuedAt?: unknown;
}

export interface PromptRecord {
  id: string;
  userId: string;
  title: string;
  platform: string;
  category: string;
  purpose: string;
  tone: string;
  outputFormat: string;
  detailLevel: string;
  topic: string;
  generatedPrompt: string;
  isFavorite: boolean;
  createdAt?: unknown;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'certificate';
  isRead: boolean;
  link?: string;
  createdAt?: unknown;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface CourseLevelConfig {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  active: boolean;
  updatedAt?: unknown;
}

export interface SiteContent {
  id: string;
  heroHeadline: string;
  heroSubtext: string;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'resolved';
  createdAt?: unknown;
}

export interface StudentProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  countyOrState: string;
  townOrCity: string;
  avatarUrl: string;
  selectedCourseId: string;
  selectedLevel: CourseLevel;
  role: 'student' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PromptGeneratorRequest {
  platform: string;
  category: string;
  purpose: string;
  tone: string;
  outputFormat: string;
  detailLevel: string;
  topic: string;
  regenerateSeed?: string;
}

export interface PromptGeneratorResponse {
  title: string;
  prompt: string;
  usageTips: string[];
  variables: string[];
}
