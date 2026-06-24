// User & Profile Types
export interface Profile {
  id: string
  fullName?: string
  username?: string
  phone?: string
  country?: string
  state?: string
  city?: string
  gender?: string
  bio?: string
  avatarUrl?: string
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
}

// Course Types
export interface Course {
  id: string
  title: string
  code?: string
  category?: string
  subcategory?: string
  shortDescription?: string
  fullDescription?: string
  learningOutcomes?: string
  prerequisites?: string
  targetAudience?: string
  difficultyLevel?: string
  language?: string
  durationHours?: number
  thumbnailUrl?: string
  promoVideoUrl?: string
  price: number
  isFree: boolean
  status: string
  instructorId?: string
  instructor?: Profile
  lessons?: Lesson[]
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string
  orderIndex: number
  materials?: Material[]
  videos?: Video[]
  createdAt: Date
  updatedAt: Date
}

export interface Material {
  id: string
  lessonId: string
  title: string
  type?: string
  fileUrl: string
  visibility: string
  downloadAllowed: boolean
  createdAt: Date
}

export interface Video {
  id: string
  lessonId: string
  title: string
  videoUrl: string
  duration?: number
  provider?: string
  storageType?: string
  orderIndex: number
  createdAt: Date
}

// Enrollment & Progress
export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progressPercent: number
  completed: boolean
  enrolledAt: Date
  course?: Course
}

export interface LearningProgress {
  id: string
  userId: string
  courseId: string
  lessonId: string
  completed: boolean
  watchTime: number
  updatedAt: Date
}

// Certificate
export interface Certificate {
  id: string
  userId: string
  courseId: string
  certificateUrl?: string
  templateUrl?: string
  verificationCode: string
  issuedAt: Date
  status: string
  user?: Profile
  course?: Course
}

// Notification
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: Date
}

// Analytics
export interface AnalyticsEvent {
  id: string
  eventType: string
  userId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
