export interface TrainerProfile {
  name: string;
  bio: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  youtubeUrl: string;
  // profileImageUrl property might be needed if not present, checking existing usages or implicit logic
}

export interface TrainerSummary {
  slug: string; // The URL part, e.g., 'trainer1'
  name: string;
  heroTitle: string;
  profileImage?: string; // Optional image for the card
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
}

export interface Transformation {
  id: string;
  clientName: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface GymClass {
  id: string;
  title: string;
  description: string;
  time: string; // e.g., "Mon 10:00 AM"
  durationMinutes: number;
  maxSpots: number;
  enrolledSpots: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  text: string;
  rating: number; // 1-5
}

export interface DataProviderType {
  // Read
  // slug is optional. If provided, fetches public data for that trainer.
  // If not provided, it may rely on authenticated context or throw error depending on implementation.
  getProfile: (slug?: string) => Promise<TrainerProfile>;
  getCertifications: (slug?: string) => Promise<Certification[]>;
  getTransformations: (slug?: string) => Promise<Transformation[]>;
  getClasses: (slug?: string) => Promise<GymClass[]>;
  getTestimonials: (slug?: string) => Promise<Testimonial[]>;

  // New method to list all trainers for the directory
  getTrainers: () => Promise<TrainerSummary[]>;

  // Write (Admin) - These typically rely on the authenticated user's context
  updateProfile: (profile: TrainerProfile) => Promise<void>;
  addCertification: (cert: Omit<Certification, 'id'>) => Promise<void>;
  removeCertification: (id: string) => Promise<void>;
  addTransformation: (trans: Omit<Transformation, 'id'>) => Promise<void>;
  removeTransformation: (id: string) => Promise<void>;
  addClass: (gymClass: Omit<GymClass, 'id'>) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  updateClass: (id: string, gymClass: Partial<GymClass>) => Promise<void>;
}
