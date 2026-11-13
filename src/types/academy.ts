export type CourseCategory =
  | 'Web Design'
  | 'Web Development'
  | 'Social Media Management'
  | 'Video Editing'
  | 'AI Prompt Generator';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export const COURSE_CATEGORIES: CourseCategory[] = [
  'Web Design',
  'Web Development',
  'Social Media Management',
  'Video Editing',
  'AI Prompt Generator',
];

export const COURSE_LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

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

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  description: string;
  instructor: string;
  duration: string;
  thumbnailUrl: string;
  lessonCount: number;
  published: boolean;
  isSeeded?: boolean;
  createdAt?: unknown;
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

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  level: CourseLevel;
  completedLessonIds: string[];
  progressPercent: number;
  status: 'in_progress' | 'completed';
  enrolledAt?: unknown;
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

export interface SavedPrompt {
  id: string;
  userId: string;
  category: string;
  platform: string;
  purpose: string;
  tone: string;
  outputFormat: string;
  topic: string;
  generatedPrompt: string;
  createdAt?: unknown;
}

export interface PromptGeneratorRequest {
  category: string;
  platform: string;
  purpose: string;
  tone: string;
  outputFormat: string;
  topic: string;
}

export interface PromptGeneratorResponse {
  title: string;
  prompt: string;
  usageTips: string[];
  variables: string[];
}
