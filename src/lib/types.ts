export interface TrainerProfile {
  slug?: string;
  name: string;
  bio: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  // Deprecated single strings, keeping for compatibility if needed, but moving to socialLinks
  instagramUrl?: string;
  youtubeUrl?: string;
  socialLinks?: SocialLink[];
  profileImageUrl?: string;
  listImageUrl?: string;
  experienceYears?: number;
  experienceMonths?: number;
  clientsHandled?: number;
  clientsHandledRounded?: boolean;
}

export interface SocialLink {
    platform: 'instagram' | 'youtube' | 'facebook' | 'twitter' | 'other';
    url: string;
}

export interface TrainerSummary {
  slug: string;
  name: string;
  heroTitle: string;
  profileImage?: string;
  listImage?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
  url?: string;
}

export interface Transformation {
  id: string;
  clientName: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  // Enhanced fields
  duration?: string;
  weightLost?: string;
  muscleGained?: string;
  keyChallenges?: string;
  trainerNote?: string;
}

export interface GymClass {
  id: string;
  title: string;
  description: string;
  time: string;
  dateIso?: string; // For countdown
  price?: number; // 0 for free
  durationMinutes: number;
  maxSpots: number;
  enrolledSpots: number;
  imageUrl?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  text: string;
  rating: number;
}

export interface PlatformTestimonial {
    id: string;
    name: string;
    testimonial: string;
    imageUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  goal?: string;
  message: string;
  date: string; // ISO string
  read: boolean;
}

export interface BrandIdentity {
  brandName: string;
  logoUrl: string;
  primaryColor: string; // Now acts as Base Color
  secondaryColor: string; // Deprecated but kept for compatibility, ignored if using auto-palette
  // New fields
  baseColor?: string; // Preferred over primaryColor if present
  themePresetId?: string;
  logoScale?: 'fit' | 'fill';
}

export interface LandingPageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
}

export interface DataProviderType {
  // Read
  getTrainers: () => Promise<TrainerSummary[]>;
  getProfile: (slug?: string) => Promise<TrainerProfile>;
  getBrandIdentity: (slug?: string) => Promise<BrandIdentity>;
  getCertifications: (slug?: string) => Promise<Certification[]>;
  getTransformations: (slug?: string) => Promise<Transformation[]>;
  getClasses: (slug?: string) => Promise<GymClass[]>;
  getTestimonials: (slug?: string) => Promise<Testimonial[]>;
  getLandingPageContent: () => Promise<LandingPageContent>;
  getPlatformTestimonials: () => Promise<PlatformTestimonial[]>;

  // Write (Admin)
  updateProfile: (profile: TrainerProfile) => Promise<void>;
  updateBrandIdentity: (identity: BrandIdentity) => Promise<void>;
  addCertification: (cert: Omit<Certification, 'id'>) => Promise<void>;
  removeCertification: (id: string) => Promise<void>;
  addTransformation: (trans: Omit<Transformation, 'id'>) => Promise<void>;
  removeTransformation: (id: string) => Promise<void>;
  addClass: (gymClass: Omit<GymClass, 'id'>) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  updateClass: (id: string, gymClass: Partial<GymClass>) => Promise<void>;
  updateLandingPageContent: (content: LandingPageContent) => Promise<void>;
  addPlatformTestimonial: (t: Omit<PlatformTestimonial, 'id'>) => Promise<void>;
  removePlatformTestimonial: (id: string) => Promise<void>;

  // Messages
  addMessage: (msg: Omit<ContactMessage, 'id' | 'read' | 'date'>, targetSlug?: string) => Promise<void>;
  getMessages: (slug?: string) => Promise<ContactMessage[]>;
  markMessageRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}
