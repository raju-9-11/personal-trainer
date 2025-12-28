import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, BrandIdentity, TrainerSummary, LandingPageContent } from '../types';
import { getFirebase } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Firestore, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

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

export class FirebaseDataService implements DataProviderType {
  private db: Firestore;
  private currentUser: User | null;

  constructor(user: User | null) {
    const { db } = getFirebase();
    if (!db) {
      throw new Error("Failed to initialize Firebase Firestore. Check your configuration.");
    }
    this.db = db;
    this.currentUser = user;
  }

  // Helper to determine slug for read/write
  private async getMySlug(): Promise<string> {
    if (!this.currentUser) throw new Error("Not authenticated");

    // Super Admin Check
    if (this.currentUser.uid === 'super-admin-uid') {
        return 'platform';
    }

    // Query 'trainers' collection where 'ownerUid' == user.uid
    const trainersRef = collection(this.db, ROOT_COLLECTION);
    const q = query(trainersRef, where('ownerUid', '==', this.currentUser.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
       return snapshot.docs[0].id;
    }

    // CREATE NEW TRAINER DOC AUTOMATICALLY
    console.log("No trainer profile found for user. Creating one...");
    const newSlug = `trainer-${Date.now()}`; // Simple generation strategy
    const newProfile: TrainerProfile = {
        name: "New Trainer",
        bio: "Bio goes here",
        heroTitle: "Welcome",
        heroSubtitle: "Let's train",
        contactEmail: this.currentUser.email || "",
        contactPhone: "",
        instagramUrl: "",
        youtubeUrl: "",
    };

    // Create the document
    await setDoc(doc(this.db, ROOT_COLLECTION, newSlug), {
        ...newProfile,
        ownerUid: this.currentUser.uid,
        createdAt: Timestamp.now()
    });

    // Create default identity subcollection
    await setDoc(doc(this.db, ROOT_COLLECTION, newSlug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID), {
        brandName: "My Fitness Brand",
        logoUrl: "",
        primaryColor: "#000000",
        secondaryColor: "#ffffff"
    });

    return newSlug;
  }

  // --- Read ---
  getTrainers = async (): Promise<TrainerSummary[]> => {
    try {
      const trainersRef = collection(this.db, ROOT_COLLECTION);
      const snapshot = await getDocs(trainersRef);

      const summaries: TrainerSummary[] = [];
      for (const docSnap of snapshot.docs) {
         const data = docSnap.data();
         // Filter out 'platform' or non-trainer docs if any mixed in (though we separate platform settings)
         // Assuming all docs in 'trainers' are actual trainers.

         // Fetch subcollection for identity? Or assume profileImage in root?
         // Optimally we'd store a summary field in the root doc to avoid N+1 queries.
         // Let's assume root doc has name/heroTitle.

         summaries.push({
             slug: docSnap.id,
             name: data.name || 'Unnamed Trainer',
             heroTitle: data.heroTitle || 'Personal Trainer',
             profileImage: data.profileImageUrl // If saved on root
         });
      }
      return summaries;
    } catch (e) {
      console.error("Error fetching trainers:", e);
      return [];
    }
  }

  getProfile = async (slug?: string): Promise<TrainerProfile> => {
    if (!slug) {
        return {
          name: "New Trainer",
          bio: "",
          heroTitle: "Welcome",
          heroSubtitle: "",
          contactEmail: "",
          contactPhone: "",
          instagramUrl: "",
          youtubeUrl: "",
        };
    }

    try {
      const docRef = doc(this.db, ROOT_COLLECTION, slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
         return docSnap.data() as TrainerProfile;
      }
    } catch (e) {
      console.warn("Error fetching profile", e);
    }
    return {
      name: "Trainer Not Found",
      bio: "",
      heroTitle: "Titan Fitness",
      heroSubtitle: "",
      contactEmail: "",
      contactPhone: "",
      instagramUrl: "",
      youtubeUrl: "",
    };
  }

  getBrandIdentity = async (slug?: string): Promise<BrandIdentity> => {
    // If no slug, return defaults so Dashboard can render empty form
    if (!slug) {
        return {
          brandName: "My Fitness Brand",
          logoUrl: "",
          primaryColor: "#000000",
          secondaryColor: "#ffffff"
        };
    }

    try {
      let docRef;
      if (slug === 'platform') {
        // Read from platform_settings/identity
        docRef = doc(this.db, PLATFORM_COLLECTION, 'identity');
      } else {
        // Read from trainers/{slug}/brand_identity/main
        docRef = doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID);
      }

      const identityDoc = await getDoc(docRef);
      if (identityDoc.exists()) {
        return identityDoc.data() as BrandIdentity;
      }
    } catch (e) {
      console.warn("Error fetching identity", e);
    }

    return {
      brandName: "Titan Fitness",
      logoUrl: "",
      primaryColor: "#000000",
      secondaryColor: "#ffffff"
    };
  }

  getLandingPageContent = async (): Promise<LandingPageContent> => {
      // Fetch from platform_settings/landing
      try {
          const docRef = doc(this.db, PLATFORM_COLLECTION, 'landing');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
              return snap.data() as LandingPageContent;
          }
      } catch (e) {
          console.warn("Error fetching landing content", e);
      }
      // Default
      return {
          heroTitle: "FIND YOUR TITAN",
          heroSubtitle: "Elite personal trainers ready to help you shatter your limits.",
          heroImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
      };
  }

  getCertifications = async (slug?: string): Promise<Certification[]> => {
    if (!slug) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CERTS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
    } catch (e) {
        return [];
    }
  }

  getTransformations = async (slug?: string): Promise<Transformation[]> => {
    if (!slug) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.TRANS));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transformation));
    } catch (e) {
        return [];
    }
  }

  getClasses = async (slug?: string): Promise<GymClass[]> => {
    if (!slug) return [];
    try {
        const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
    } catch (e) {
        return [];
    }
  }

  getTestimonials = async (slug?: string): Promise<Testimonial[]> => {
    if (!slug) return [];
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
    if (slug === 'platform') return; // Platform doesn't have a trainer profile
    await setDoc(doc(this.db, ROOT_COLLECTION, slug), profile, { merge: true });
  }

  updateBrandIdentity = async (identity: BrandIdentity): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') {
         // Platform has global identity?
         // Let's store it in platform_settings/identity
         await setDoc(doc(this.db, PLATFORM_COLLECTION, 'identity'), identity, { merge: true });
         return;
    }
    await setDoc(doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID), identity, { merge: true });
  }

  updateLandingPageContent = async (content: LandingPageContent): Promise<void> => {
      const slug = await this.getMySlug();
      if (slug !== 'platform') throw new Error("Unauthorized");

      await setDoc(doc(this.db, PLATFORM_COLLECTION, 'landing'), content, { merge: true });
  }

  addCertification = async (cert: Omit<Certification, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await addDoc(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CERTS), cert);
  }

  removeCertification = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await deleteDoc(doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CERTS, id));
  }

  addTransformation = async (trans: Omit<Transformation, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await addDoc(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.TRANS), trans);
  }

  removeTransformation = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await deleteDoc(doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.TRANS, id));
  }

  addClass = async (gymClass: Omit<GymClass, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await addDoc(collection(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES), gymClass);
  }

  removeClass = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await deleteDoc(doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES, id));
  }

  updateClass = async (id: string, updates: Partial<GymClass>): Promise<void> => {
    const slug = await this.getMySlug();
    if (slug === 'platform') return;
    await updateDoc(doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.CLASSES, id), updates);
  }
}
