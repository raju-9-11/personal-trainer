export interface TrainerProfile {
  name: string;
  bio: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  youtubeUrl: string;
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

export interface BrandIdentity {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface DataProviderType {
  // Read
  getProfile: () => Promise<TrainerProfile>;
  getBrandIdentity: () => Promise<BrandIdentity>;
  getCertifications: () => Promise<Certification[]>;
  getTransformations: () => Promise<Transformation[]>;
  getClasses: () => Promise<GymClass[]>;
  getTestimonials: () => Promise<Testimonial[]>;

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
}
