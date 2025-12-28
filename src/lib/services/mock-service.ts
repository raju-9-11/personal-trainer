import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, BrandIdentity, TrainerSummary } from '../types';

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
  identity: {
    brandName: "Titan Fitness",
    logoUrl: "https://via.placeholder.com/150?text=TF",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
  },
  certs: [
    { id: '1', title: 'NASM Certified Personal Trainer', issuer: 'NASM', date: '2015-06-01' },
    { id: '2', title: 'CrossFit Level 2', issuer: 'CrossFit', date: '2018-03-15' },
    { id: '3', title: 'Precision Nutrition Level 1', issuer: 'Precision Nutrition', date: '2019-11-20' },
    { id: '4', title: 'ACE Health Coach', issuer: 'ACE', date: '2020-05-10' }
  ],
  transformations: [
    { id: '1', clientName: 'John Doe', description: 'Lost 30lbs in 3 months and gained significant muscle mass.', beforeImage: 'https://via.placeholder.com/300', afterImage: 'https://via.placeholder.com/300' },
    { id: '2', clientName: 'Jane Smith', description: 'Completed first marathon after 6 months of training.', beforeImage: 'https://via.placeholder.com/300', afterImage: 'https://via.placeholder.com/300' },
    { id: '3', clientName: 'Mike Ross', description: 'Rehabbed shoulder injury and returned to competitive lifting.', beforeImage: 'https://via.placeholder.com/300', afterImage: 'https://via.placeholder.com/300' }
  ],
  classes: [
    { id: '1', title: 'HIIT Blast', description: 'High intensity interval training to burn fat.', time: 'Mon 10:00 AM', durationMinutes: 60, maxSpots: 20, enrolledSpots: 12 },
    { id: '2', title: 'Strength 101', description: 'Basic compound movements for beginners.', time: 'Wed 6:00 PM', durationMinutes: 60, maxSpots: 15, enrolledSpots: 15 },
    { id: '3', title: 'Power Yoga', description: 'Flexibility and core strength fusion.', time: 'Fri 8:00 AM', durationMinutes: 45, maxSpots: 25, enrolledSpots: 20 },
    { id: '4', title: 'Weekend Warriors', description: 'Outdoor boot camp style workout.', time: 'Sat 9:00 AM', durationMinutes: 90, maxSpots: 30, enrolledSpots: 28 }
  ],
  testimonials: [
    { id: '1', clientName: 'Sarah K.', text: 'Best trainer ever! Changed my life completely.', rating: 5 },
    { id: '2', clientName: 'Tom H.', text: 'Alex pushes you to the limit but keeps it safe.', rating: 5 },
    { id: '3', clientName: 'Emily R.', text: 'Great results in just 2 months.', rating: 4 }
  ]
};

const TRAINER2_DATA = {
  ...TRAINER1_DATA,
  profile: {
    ...TRAINER1_DATA.profile,
    name: "Sarah 'Valkyrie' Stone",
    heroTitle: "CONQUER YOUR GOALS",
    bio: "Former Olympic weightlifter turned coach. I help you build strength, confidence, and resilience."
  },
  classes: [
     { id: '5', title: 'Olympic Lifting', description: 'Learn the snatch and clean & jerk.', time: 'Tue 6:00 PM', durationMinutes: 90, maxSpots: 8, enrolledSpots: 8 },
     { id: '6', title: 'Barbell Club', description: 'Squat, bench, deadlift.', time: 'Thu 6:00 PM', durationMinutes: 90, maxSpots: 12, enrolledSpots: 10 }
  ]
};

const TRAINER3_DATA = {
  ...TRAINER1_DATA,
  profile: {
    ...TRAINER1_DATA.profile,
    name: "Marcus 'The Engine' Diesel",
    heroTitle: "FUEL YOUR PERFORMANCE",
    bio: "Endurance athlete and triathlon coach. Let's build an engine that never quits."
  },
  classes: [
     { id: '7', title: 'Spin Class', description: 'High intensity cycling.', time: 'Mon 6:00 AM', durationMinutes: 45, maxSpots: 20, enrolledSpots: 18 },
     { id: '8', title: 'Run Club', description: 'Long distance group run.', time: 'Sat 7:00 AM', durationMinutes: 120, maxSpots: 50, enrolledSpots: 15 }
  ]
};

const EMPTY1_DATA = {
  profile: {
    name: "New Coach One",
    bio: "Just getting started on my journey here!",
    heroTitle: "COMING SOON",
    heroSubtitle: "Watch this space",
    contactEmail: "new1@example.com",
    contactPhone: "",
    instagramUrl: "",
    youtubeUrl: "",
  },
  identity: TRAINER1_DATA.identity,
  certs: [],
  transformations: [],
  classes: [],
  testimonials: []
};

const EMPTY2_DATA = {
  profile: {
    name: "New Coach Two",
    bio: "Excited to join the Titan team.",
    heroTitle: "FRESH ENERGY",
    heroSubtitle: "Personal Training",
    contactEmail: "new2@example.com",
    contactPhone: "",
    instagramUrl: "",
    youtubeUrl: "",
  },
  identity: TRAINER1_DATA.identity,
  certs: [],
  transformations: [],
  classes: [],
  testimonials: []
};

const INITIAL_DB: Record<string, any> = {
  'trainer1': TRAINER1_DATA,
  'trainer2': TRAINER2_DATA,
  'trainer3': TRAINER3_DATA,
  'empty1': EMPTY1_DATA,
  'empty2': EMPTY2_DATA,
  'testtrainer': { ...TRAINER1_DATA, profile: { ...TRAINER1_DATA.profile, name: "Test Trainer" } }
};

export class MockDataService implements DataProviderType {
  private isClient = typeof window !== 'undefined';
  private currentTrainerSlug = 'trainer1'; // Default context

  private getDb = () => {
    if (!this.isClient) return INITIAL_DB;
    try {
      // Using v4 to force refresh of data for existing users
      const stored = localStorage.getItem('mock_db_v4');
      return stored ? JSON.parse(stored) : INITIAL_DB;
    } catch {
      return INITIAL_DB;
    }
  }

  private saveDb = (db: any) => {
    if (this.isClient) {
      localStorage.setItem('mock_db_v4', JSON.stringify(db));
    }
  }

  private getTargetSlug(slug?: string): string {
    return slug || this.currentTrainerSlug;
  }

  // --- Read ---
  getTrainers = async (): Promise<TrainerSummary[]> => {
    const db = this.getDb();
    return Object.keys(db).map(slug => ({
      slug,
      name: db[slug].profile.name,
      heroTitle: db[slug].profile.heroTitle,
      profileImage: 'https://via.placeholder.com/150?text=Profile'
    }));
  }

  getProfile = async (slug?: string): Promise<TrainerProfile> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.profile || TRAINER1_DATA.profile;
  }

  getBrandIdentity = async (slug?: string): Promise<BrandIdentity> => {
    const db = this.getDb();
    const target = this.getTargetSlug(slug);
    return db[target]?.identity || TRAINER1_DATA.identity;
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

  // --- Write ---

  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].profile = profile;
        this.saveDb(db);
    }
  }

  updateBrandIdentity = async (identity: BrandIdentity): Promise<void> => {
    const db = this.getDb();
    const target = this.getTargetSlug();
    if (db[target]) {
        db[target].identity = identity;
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
