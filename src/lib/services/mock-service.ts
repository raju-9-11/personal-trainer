import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, BrandIdentity } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'trainer_profile',
  IDENTITY: 'trainer_identity',
  CERTS: 'trainer_certs',
  TRANS: 'trainer_trans',
  CLASSES: 'trainer_classes',
  TESTIMONIALS: 'trainer_testimonials',
};

const INITIAL_IDENTITY: BrandIdentity = {
  brandName: "Titan Fitness",
  logoUrl: "https://via.placeholder.com/150?text=TF",
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
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

const INITIAL_DB = {
  'trainer1': TRAINER1_DATA,
  'testtrainer': TESTTRAINER_DATA
};

export class MockDataService implements DataProviderType {
  private isClient = typeof window !== 'undefined';

  private load = <T>(key: string, initial: T): T => {
    if (!this.isClient) return initial;
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initial;
    } catch (e) {
        console.error("MockDataService load error", e);
        return initial;
    }
  }

  private saveDb = (db: any) => {
    if (this.isClient) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error("MockDataService save error", e);
        }
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

  getBrandIdentity = async (): Promise<BrandIdentity> => {
    return this.load(STORAGE_KEYS.IDENTITY, INITIAL_IDENTITY);
  }

  getCertifications = async (): Promise<Certification[]> => {
    return this.load(STORAGE_KEYS.CERTS, INITIAL_CERTS);
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

  updateBrandIdentity = async (identity: BrandIdentity): Promise<void> => {
    this.save(STORAGE_KEYS.IDENTITY, identity);
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
