import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, TrainerSummary } from '../types';

// Storage structure for Mock:
// 'mock_data' -> { 'trainer1': { profile, certs... }, 'testtrainer': { ... } }

const STORAGE_KEY = 'titan_mock_db';

// Initial Data for Trainer 1
const TRAINER1_DATA = {
  profile: {
    name: "Alex 'The Forge' Titan",
    bio: "Over 10 years of experience forging elite physiques. I specialize in high-intensity functional training and nutritional coaching. Let's sculpt the best version of you.",
    heroTitle: "UNLEASH YOUR POTENTIAL",
    heroSubtitle: "Elite Personal Training & Fitness Coaching",
    contactEmail: "alex@titanfitness.com",
    contactPhone: "+1 (555) 012-3456",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
  },
  certs: [
    { id: '1', title: "Certified Personal Trainer", issuer: "NASM", date: "2015-06-15" },
    { id: '2', title: "Advanced Nutrition Coach", issuer: "Precision Nutrition", date: "2017-03-10" },
    { id: '3', title: "CrossFit Level 2", issuer: "CrossFit Inc.", date: "2019-11-20" },
  ],
  classes: [
    { id: '1', title: "Morning HIIT", description: "High Intensity Interval Training to start your day.", time: "Mon 06:00 AM", durationMinutes: 45, maxSpots: 15, enrolledSpots: 10 },
    { id: '2', title: "Strength Mastery", description: "Focus on compound lifts and form.", time: "Tue 05:00 PM", durationMinutes: 60, maxSpots: 8, enrolledSpots: 5 },
    { id: '3', title: "Cardio Blast", description: "Endurance based training.", time: "Wed 07:00 AM", durationMinutes: 45, maxSpots: 20, enrolledSpots: 12 },
  ],
  transformations: [
    { id: '1', clientName: "John D.", description: "Lost 30lbs in 3 months.", beforeImage: "https://via.placeholder.com/300?text=Before", afterImage: "https://via.placeholder.com/300?text=After" },
  ],
  testimonials: [
    { id: '1', clientName: "Sarah L.", text: "Alex changed my life. I've never felt stronger!", rating: 5 },
  ]
};

// Initial Data for Test Trainer
const TESTTRAINER_DATA = {
  profile: {
    name: "Jordan 'The Jet' Speed",
    bio: "Former Olympic sprinter dedicated to making you faster and more agile. Speed is power.",
    heroTitle: "SPEED KILLS",
    heroSubtitle: "Agility & Speed Coaching",
    contactEmail: "jordan@speedfitness.com",
    contactPhone: "+1 (555) 999-8888",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
  },
  certs: [
    { id: '1', title: "US Track & Field Coach", issuer: "USATF", date: "2018-01-01" },
  ],
  classes: [
    { id: '1', title: "Sprints 101", description: "Learn proper sprinting mechanics.", time: "Sat 09:00 AM", durationMinutes: 90, maxSpots: 20, enrolledSpots: 5 },
  ],
  transformations: [
    { id: '1', clientName: "Mike T.", description: "Dropped 0.5s off 100m time.", beforeImage: "https://via.placeholder.com/300?text=Slow", afterImage: "https://via.placeholder.com/300?text=Fast" },
  ],
  testimonials: [
    { id: '1', clientName: "Usain B.", text: "Jordan knows speed.", rating: 5 },
  ]
};

const INITIAL_DB = {
  'trainer1': TRAINER1_DATA,
  'testtrainer': TESTTRAINER_DATA
};

export class MockDataService implements DataProviderType {
  private isClient = typeof window !== 'undefined';

  // Default to trainer1 if no context (e.g. initial load before auth check in admin, though strictly admin should check auth)
  // For admin write operations, we need a way to know WHO is writing.
  // In a real app, the AuthContext passes the user ID/Slug.
  // Here, we can simulate "current user" via a local storage key 'mock_current_user' set during login.
  private currentTrainerSlug = 'trainer1';

  constructor() {
    if (this.isClient) {
       // Seed if empty
       if (!localStorage.getItem(STORAGE_KEY)) {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB));
       }
    }
  }

  private getDb = () => {
    if (!this.isClient) return INITIAL_DB;
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_DB));
  }

  private saveDb = (db: any) => {
    if (this.isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  }

  // Helper to determine target slug
  // For reads: prefer argument `slug`, fallback to `currentTrainerSlug` (though for public pages `slug` should always be passed)
  private getTargetSlug = (slug?: string) => {
    // In Mock mode, for Admin writes, we check a specific key
    if (!slug && this.isClient) {
        const storedAuth = localStorage.getItem('mock_auth_user');
        if (storedAuth) return storedAuth; // e.g., 'trainer1'
    }
    return slug || this.currentTrainerSlug;
  }

  // --- Read ---
  getTrainers = async (): Promise<TrainerSummary[]> => {
    const db = this.getDb();
    return Object.keys(db).map(slug => ({
      slug,
      name: db[slug].profile.name,
      heroTitle: db[slug].profile.heroTitle,
      profileImage: undefined // Add placeholder if needed
    }));
  }

  getProfile = async (slug?: string): Promise<TrainerProfile> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.profile || INITIAL_DB['trainer1'].profile;
  }

  getCertifications = async (slug?: string): Promise<Certification[]> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.certs || [];
  }

  getTransformations = async (slug?: string): Promise<Transformation[]> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.transformations || [];
  }

  getClasses = async (slug?: string): Promise<GymClass[]> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.classes || [];
  }

  getTestimonials = async (slug?: string): Promise<Testimonial[]> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.testimonials || [];
  }

  // --- Write (Implicitly acts on logged-in user, which we simulate via getTargetSlug() returning current auth user) ---

  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].profile = profile;
        this.saveDb(db);
    }
  }

  addCertification = async (cert: Omit<Certification, 'id'>): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        const newCert = { ...cert, id: Math.random().toString(36).substr(2, 9) };
        db[target].certs = [...(db[target].certs || []), newCert];
        this.saveDb(db);
    }
  }

  removeCertification = async (id: string): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].certs = db[target].certs.filter((i: Certification) => i.id !== id);
        this.saveDb(db);
    }
  }

  addTransformation = async (trans: Omit<Transformation, 'id'>): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        const newTrans = { ...trans, id: Math.random().toString(36).substr(2, 9) };
        db[target].transformations = [...(db[target].transformations || []), newTrans];
        this.saveDb(db);
    }
  }

  removeTransformation = async (id: string): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].transformations = db[target].transformations.filter((i: Transformation) => i.id !== id);
        this.saveDb(db);
    }
  }

  addClass = async (gymClass: Omit<GymClass, 'id'>): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        const newClass = { ...gymClass, id: Math.random().toString(36).substr(2, 9) };
        db[target].classes = [...(db[target].classes || []), newClass];
        this.saveDb(db);
    }
  }

  removeClass = async (id: string): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].classes = db[target].classes.filter((i: GymClass) => i.id !== id);
        this.saveDb(db);
    }
  }

  updateClass = async (id: string, updates: Partial<GymClass>): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].classes = db[target].classes.map((c: GymClass) => c.id === id ? { ...c, ...updates } : c);
        this.saveDb(db);
    }
  }
}
