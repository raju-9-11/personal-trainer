import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, BrandIdentity, TrainerSummary, LandingPageContent, PlatformTestimonial } from '../types';
import { getFirebase } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Firestore, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { DEFAULT_BRAND_IDENTITY } from '../constants';

const ROOT_COLLECTION = 'trainers';
const PLATFORM_COLLECTION = 'platform_settings';

const COLLECTIONS = {
  PROFILE: 'profile',
  IDENTITY: 'brand_identity',
  CERTS: 'certifications',
  TRANS: 'transformations',
  CLASSES: 'classes',
  TESTIMONIALS: 'testimonials',
};

const IDENTITY_DOC_ID = 'main';

// Default values to use when data is missing or service is uninitialized
const DEFAULT_IDENTITY: BrandIdentity = DEFAULT_BRAND_IDENTITY;

const DEFAULT_PROFILE: TrainerProfile = {
    name: "New Trainer",
    bio: "",
    heroTitle: "Welcome",
    heroSubtitle: "Start your journey",
    contactEmail: "",
    contactPhone: "",
    socialLinks: [],
};

const DEFAULT_LANDING: LandingPageContent = {
    heroTitle: "UNLEASH YOUR POTENTIAL",
    heroSubtitle: "Elite personal training.",
    heroImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
};

export class FirebaseDataService implements DataProviderType {
  private db: Firestore | undefined;
  private currentUser: User | null;

  constructor(user: User | null) {
    const { db } = getFirebase();
    if (!db) {
       console.warn("Firebase Firestore not available. Service is in limited mode.");
    }
    this.db = db || undefined;
    this.currentUser = user;
  }

  // Helper to ensure DB is available
  private ensureDb(): Firestore {
      if (!this.db) {
          throw new Error("Firebase Firestore is not initialized. Please check your environment variables and configuration.");
      }
      return this.db;
  }

  // Helper to determine slug for read/write
  private async getMySlug(): Promise<string> {
    if (!this.currentUser) throw new Error("Not authenticated");
    const db = this.ensureDb();

    // Super Admin Check
    if (this.currentUser.uid === 'super-admin-uid') {
        return 'platform';
    }

    // Query 'trainers' collection where 'ownerUid' == user.uid
    const trainersRef = collection(db, ROOT_COLLECTION);
    const q = query(trainersRef, where('ownerUid', '==', this.currentUser.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
       return snapshot.docs[0].id;
    }

    // CREATE NEW TRAINER DOC AUTOMATICALLY
    console.log("No trainer profile found for user. Creating one...");
    const newSlug = `trainer-${Date.now()}`; // Simple generation strategy

    // Create the document
    await setDoc(doc(db, ROOT_COLLECTION, newSlug), {
        ...DEFAULT_PROFILE,
        contactEmail: this.currentUser.email || "",
        ownerUid: this.currentUser.uid,
        createdAt: Timestamp.now()
    });

    // Create default identity subcollection
    await setDoc(doc(db, ROOT_COLLECTION, newSlug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID), DEFAULT_IDENTITY);

    return newSlug;
  }

  // --- Read ---
  getTrainers = async (): Promise<TrainerSummary[]> => {
    try {
      if (!this.db) return [];
      const trainersRef = collection(this.db, ROOT_COLLECTION);
      const snapshot = await getDocs(trainersRef);

      const summaries: TrainerSummary[] = [];
      for (const docSnap of snapshot.docs) {
         const data = docSnap.data();
         summaries.push({
             slug: docSnap.id,
             name: data.name || 'Unnamed Trainer',
             heroTitle: data.heroTitle || 'Personal Trainer',
             profileImage: data.profileImageUrl
         });
      }
      return summaries;
    } catch (e) {
      console.error("Error fetching trainers:", e);
      return [];
    }
  }

  getProfile = async (slug?: string): Promise<TrainerProfile> => {
    if (!slug) return DEFAULT_PROFILE;

    try {
      if (!this.db) throw new Error("DB not init");
      const docRef = doc(this.db, ROOT_COLLECTION, slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
         return docSnap.data() as TrainerProfile;
      }
    } catch (e) {
      console.warn("Error fetching profile", e);
    }
    return DEFAULT_PROFILE;
  }

  getBrandIdentity = async (slug?: string): Promise<BrandIdentity> => {
    if (!slug) return DEFAULT_IDENTITY;

    try {
      if (!this.db) {
        console.warn("DB not init; returning default brand identity");
        return DEFAULT_IDENTITY;
      }
      let docRef;
      if (slug === 'platform') {
        docRef = doc(this.db, PLATFORM_COLLECTION, 'identity');
      } else {
        docRef = doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID);
      }

      const identityDoc = await getDoc(docRef);
      if (identityDoc.exists()) {
        return identityDoc.data() as BrandIdentity;
      }
    } catch (e) {
      console.warn("Error fetching identity", e);
    }

    return DEFAULT_IDENTITY;
  }

  getLandingPageContent = async (): Promise<LandingPageContent> => {
      try {
          if (!this.db) throw new Error("DB not init");
          const docRef = doc(this.db, PLATFORM_COLLECTION, 'landing');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
              return snap.data() as LandingPageContent;
          }
      } catch (e) {
          console.warn("Error fetching landing content", e);
      }
      return DEFAULT_LANDING;
  }

  getPlatformTestimonials = async (): Promise<PlatformTestimonial[]> => {
      try {
          if (!this.db) return [];
          const snapshot = await getDocs(collection(this.db, PLATFORM_COLLECTION, 'testimonials', 'items'));
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlatformTestimonial));
      } catch (e) {
          console.warn("Error fetching platform testimonials", e);
          return [];
      }
  }

  getCertifications = async (slug?: string): Promise<Certification[]> => {
    if (!slug || !this.db) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CERTS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
    } catch (e) {
        return [];
    }
  }

  getTransformations = async (slug?: string): Promise<Transformation[]> => {
    if (!slug || !this.db) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.TRANS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transformation));
    } catch (e) {
        return [];
    }
  }

  getClasses = async (slug?: string): Promise<GymClass[]> => {
    if (!slug || !this.db) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
    } catch (e) {
        return [];
    }
  }

  getTestimonials = async (slug?: string): Promise<Testimonial[]> => {
    if (!slug || !this.db) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.TESTIMONIALS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
    } catch (e) {
        return [];
    }
  }

  // --- Write (Scoped to Authenticated User) ---

  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await setDoc(doc(db, ROOT_COLLECTION, slug), profile, { merge: true });
  }

  updateBrandIdentity = async (identity: BrandIdentity): Promise<void> => {
    const slug = await this.getMySlug();
    const db = this.ensureDb();
    if (slug === 'platform') {
         await setDoc(doc(db, PLATFORM_COLLECTION, 'identity'), identity, { merge: true });
         return;
    }
    await setDoc(doc(db, ROOT_COLLECTION, slug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID), identity, { merge: true });
  }

  updateLandingPageContent = async (content: LandingPageContent): Promise<void> => {
      const slug = await this.getMySlug();
      const db = this.ensureDb();
      if (slug !== 'platform') throw new Error("Unauthorized");

      await setDoc(doc(db, PLATFORM_COLLECTION, 'landing'), content, { merge: true });
  }

  addPlatformTestimonial = async (t: Omit<PlatformTestimonial, 'id'>): Promise<void> => {
       const slug = await this.getMySlug();
       const db = this.ensureDb();
       if (slug !== 'platform') throw new Error("Unauthorized");
       await addDoc(collection(db, PLATFORM_COLLECTION, 'testimonials', 'items'), t);
  }

  removePlatformTestimonial = async (id: string): Promise<void> => {
      const slug = await this.getMySlug();
      const db = this.ensureDb();
      if (slug !== 'platform') throw new Error("Unauthorized");
      await deleteDoc(doc(db, PLATFORM_COLLECTION, 'testimonials', 'items', id));
  }

  addCertification = async (cert: Omit<Certification, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await addDoc(collection(db, ROOT_COLLECTION, slug, COLLECTIONS.CERTS), cert);
  }

  removeCertification = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await deleteDoc(doc(db, ROOT_COLLECTION, slug, COLLECTIONS.CERTS, id));
  }

  addTransformation = async (trans: Omit<Transformation, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await addDoc(collection(db, ROOT_COLLECTION, slug, COLLECTIONS.TRANS), trans);
  }

  removeTransformation = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await deleteDoc(doc(db, ROOT_COLLECTION, slug, COLLECTIONS.TRANS, id));
  }

  addClass = async (gymClass: Omit<GymClass, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await addDoc(collection(db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES), gymClass);
  }

  removeClass = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await deleteDoc(doc(db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES, id));
  }

  updateClass = async (id: string, updates: Partial<GymClass>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    const db = this.ensureDb();
    await updateDoc(doc(db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES, id), updates);
  }
}
