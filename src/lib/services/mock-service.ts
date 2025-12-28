import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'trainer_profile',
  CERTS: 'trainer_certs',
  TRANS: 'trainer_trans',
  CLASSES: 'trainer_classes',
  TESTIMONIALS: 'trainer_testimonials',
};

// Initial Data
const INITIAL_PROFILE: TrainerProfile = {
  name: "Alex 'The Forge' Titan",
  bio: "Over 10 years of experience forging elite physiques. I specialize in high-intensity functional training and nutritional coaching. Let's sculpt the best version of you.",
  heroTitle: "UNLEASH YOUR POTENTIAL",
  heroSubtitle: "Elite Personal Training & Fitness Coaching",
  contactEmail: "alex@titanfitness.com",
  contactPhone: "+1 (555) 012-3456",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com",
};

const INITIAL_CERTS: Certification[] = [
  { id: '1', title: "Certified Personal Trainer", issuer: "NASM", date: "2015-06-15" },
  { id: '2', title: "Advanced Nutrition Coach", issuer: "Precision Nutrition", date: "2017-03-10" },
  { id: '3', title: "CrossFit Level 2", issuer: "CrossFit Inc.", date: "2019-11-20" },
];

const INITIAL_CLASSES: GymClass[] = [
  { id: '1', title: "Morning HIIT", description: "High Intensity Interval Training to start your day.", time: "Mon 06:00 AM", durationMinutes: 45, maxSpots: 15, enrolledSpots: 10 },
  { id: '2', title: "Strength Mastery", description: "Focus on compound lifts and form.", time: "Tue 05:00 PM", durationMinutes: 60, maxSpots: 8, enrolledSpots: 5 },
  { id: '3', title: "Cardio Blast", description: "Endurance based training.", time: "Wed 07:00 AM", durationMinutes: 45, maxSpots: 20, enrolledSpots: 12 },
];

const INITIAL_TRANS: Transformation[] = [
  { id: '1', clientName: "John D.", description: "Lost 30lbs in 3 months.", beforeImage: "https://via.placeholder.com/300?text=Before", afterImage: "https://via.placeholder.com/300?text=After" },
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  { id: '1', clientName: "Sarah L.", text: "Alex changed my life. I've never felt stronger!", rating: 5 },
];

export class MockDataService implements DataProviderType {
  private isClient = typeof window !== 'undefined';

  private load = <T>(key: string, initial: T): T => {
    if (!this.isClient) return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  }

  private save = (key: string, data: any) => {
    if (this.isClient) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // --- Read ---
  getProfile = async (): Promise<TrainerProfile> => {
    return this.load(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  }

  getCertifications = async (): Promise<Certification[]> => {
    return this.load(STORAGE_KEYS.CERTS, INITIAL_CERTS);
  }

  getTransformations = async (): Promise<Transformation[]> => {
    return this.load(STORAGE_KEYS.TRANS, INITIAL_TRANS);
  }

  getClasses = async (): Promise<GymClass[]> => {
    return this.load(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  getTestimonials = async (): Promise<Testimonial[]> => {
    return this.load(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  }

  // --- Write ---
  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    this.save(STORAGE_KEYS.PROFILE, profile);
  }

  addCertification = async (cert: Omit<Certification, 'id'>): Promise<void> => {
    const list = await this.getCertifications();
    const newCert = { ...cert, id: Math.random().toString(36).substr(2, 9) };
    this.save(STORAGE_KEYS.CERTS, [...list, newCert]);
  }

  removeCertification = async (id: string): Promise<void> => {
    const list = await this.getCertifications();
    this.save(STORAGE_KEYS.CERTS, list.filter(i => i.id !== id));
  }

  addTransformation = async (trans: Omit<Transformation, 'id'>): Promise<void> => {
    const list = await this.getTransformations();
    const newTrans = { ...trans, id: Math.random().toString(36).substr(2, 9) };
    this.save(STORAGE_KEYS.TRANS, [...list, newTrans]);
  }

  removeTransformation = async (id: string): Promise<void> => {
    const list = await this.getTransformations();
    this.save(STORAGE_KEYS.TRANS, list.filter(i => i.id !== id));
  }

  addClass = async (gymClass: Omit<GymClass, 'id'>): Promise<void> => {
    const list = await this.getClasses();
    const newClass = { ...gymClass, id: Math.random().toString(36).substr(2, 9) };
    this.save(STORAGE_KEYS.CLASSES, [...list, newClass]);
  }

  removeClass = async (id: string): Promise<void> => {
    const list = await this.getClasses();
    this.save(STORAGE_KEYS.CLASSES, list.filter(i => i.id !== id));
  }

  updateClass = async (id: string, updates: Partial<GymClass>): Promise<void> => {
    const list = await this.getClasses();
    this.save(STORAGE_KEYS.CLASSES, list.map(c => c.id === id ? { ...c, ...updates } : c));
  }
}
