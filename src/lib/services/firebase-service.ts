import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, BrandIdentity, TrainerSummary } from '../types';
import { getFirebase } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Firestore, getDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ROOT_COLLECTION = 'trainers';

const COLLECTIONS = {
  PROFILE: 'profile',
  IDENTITY: 'brand_identity',
  CERTS: 'certifications',
  TRANS: 'transformations',
  CLASSES: 'classes',
  TESTIMONIALS: 'testimonials',
};

const PROFILE_DOC_ID = 'main';
const IDENTITY_DOC_ID = 'main';

export class FirebaseDataService implements DataProviderType {
  private db: Firestore;

  constructor() {
    const { db } = getFirebase();
    if (!db) {
      throw new Error("Failed to initialize Firebase Firestore. Check your configuration.");
    }
    this.db = db;
  }

  // Helper to determine slug for read/write
  // For Write: MUST rely on Authenticated User -> Map UID to Slug (Not implemented yet fully, assuming context handles it or passed)
  // For Read: `slug` is passed.

  // NOTE: In a real app, we need a way to map the currently logged-in user to their slug for write operations.
  // Since we can't easily query "who am I" without a `users` collection mapping UID -> Slug,
  // we will assume for now the client might pass the slug or we store it in the Auth Profile.
  // However, `DataProvider` interface doesn't pass slug for writes.
  // Solution: We need to look up the slug based on the current Auth UID.

  private async getMySlug(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // Query 'trainers' collection where 'ownerUid' == user.uid
    // This requires a Firestore index on 'ownerUid' for optimal performance.
    // If you experience performance issues, create an index for 'ownerUid' in the 'trainers' collection.
    const trainersRef = collection(this.db, ROOT_COLLECTION);
    const q = query(trainersRef, where('ownerUid', '==', user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("No trainer profile associated with this account.");
    }

    // Assuming one trainer per ownerUid for simplicity. If multiple, this would need refinement.
    const myDoc = snapshot.docs[0];
    return myDoc.id; // The slug is the doc ID
  }



  // --- Read ---
  getTrainers = async (): Promise<TrainerSummary[]> => {
    try {
      const trainersRef = collection(this.db, ROOT_COLLECTION);
      const snapshot = await getDocs(trainersRef);

      if (snapshot.empty) {
        // Fallback generic data as requested
        return [
          {
            slug: 'generic-trainer-1',
            name: 'Titan Trainer',
            heroTitle: 'Generic Fitness Expert',
          },
          {
            slug: 'generic-trainer-2',
            name: 'Power Coach',
            heroTitle: 'Strength Specialist',
          }
        ];
      }

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          slug: doc.id,
          name: data.name || 'Unknown Trainer',
          heroTitle: data.heroTitle || 'Personal Trainer',
          profileImage: data.profileImageUrl
        };
      });
    } catch (e) {
      console.error("Error fetching trainers:", e);
      // Fallback on error to ensure page loads
      return [
        {
          slug: 'error-fallback',
          name: 'Fallback Trainer',
          heroTitle: 'System Maintenance',
        }
      ];
    }
  }

  private async _resolveTrainerSlug(slug?: string): Promise<string | null> {
    if (slug) return slug;

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await this.getMySlug();
    }
    return null; // No slug provided and not authenticated to resolve one
  }

  getProfile = async (slug?: string): Promise<TrainerProfile> => {
    const finalSlug = await this._resolveTrainerSlug(slug);

    if (!finalSlug) {
      console.warn("Attempted to fetch profile without slug and not authenticated. Returning default profile.");
      return {
        name: "Trainer Not Found",
        bio: "This profile could not be loaded.",
        heroTitle: "Titan Fitness",
        heroSubtitle: "",
        contactEmail: "",
        contactPhone: "",
        instagramUrl: "",
        youtubeUrl: "",
      };
    }

    try {
      const docRef = doc(this.db, ROOT_COLLECTION, finalSlug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
         return docSnap.data() as TrainerProfile;
      }
    } catch (e) {
      console.warn(`Error fetching profile for slug ${finalSlug}, using fallback`, e);
    }

    return {
      name: "Trainer Not Found",
      bio: "This profile could not be loaded.",
      heroTitle: "Titan Fitness",
      heroSubtitle: "",
      contactEmail: "",
      contactPhone: "",
      instagramUrl: "",
      youtubeUrl: "",
    };
  }

  getBrandIdentity = async (slug?: string): Promise<BrandIdentity> => {
    const finalSlug = await this._resolveTrainerSlug(slug);

    if (!finalSlug) {
      console.warn("Attempted to fetch brand identity without slug and not authenticated. Returning default identity.");
      return {
        brandName: "Titan Fitness",
        logoUrl: "",
        primaryColor: "#000000",
        secondaryColor: "#ffffff"
      };
    }

    try {
      const identityDoc = await getDoc(doc(this.db, ROOT_COLLECTION, finalSlug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID));
      if (identityDoc.exists()) {
        return identityDoc.data() as BrandIdentity;
      }
    } catch (e) {
      console.warn("Error fetching identity, using fallback", e);
    }

    return {
      brandName: "Titan Fitness",
      logoUrl: "",
      primaryColor: "#000000",
      secondaryColor: "#ffffff"
    };
  }

  getCertifications = async (slug?: string): Promise<Certification[]> => {
    const finalSlug = await this._resolveTrainerSlug(slug);
    if (!finalSlug) return []; // No slug, no certs

    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, finalSlug, 'certifications'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
  }

  getTransformations = async (slug?: string): Promise<Transformation[]> => {
    const finalSlug = await this._resolveTrainerSlug(slug);
    if (!finalSlug) return []; // No slug, no transformations

    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, finalSlug, 'transformations'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transformation));
  }

  getClasses = async (slug?: string): Promise<GymClass[]> => {
    const finalSlug = await this._resolveTrainerSlug(slug);
    if (!finalSlug) return []; // No slug, no classes

    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, finalSlug, 'classes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
  }

  getTestimonials = async (slug?: string): Promise<Testimonial[]> => {
    const finalSlug = await this._resolveTrainerSlug(slug);
    if (!finalSlug) return []; // No slug, no testimonials

    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, finalSlug, 'testimonials'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  }

  // --- Write (Scoped to Authenticated User) ---

  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    const slug = await this.getMySlug();
    await setDoc(doc(this.db, ROOT_COLLECTION, slug), profile, { merge: true });
  }

  updateBrandIdentity = async (identity: BrandIdentity): Promise<void> => {
    const slug = await this.getMySlug();
    await setDoc(doc(this.db, ROOT_COLLECTION, slug, COLLECTIONS.IDENTITY, IDENTITY_DOC_ID), identity, { merge: true });
  }

  addCertification = async (cert: Omit<Certification, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    await addDoc(collection(this.db, ROOT_COLLECTION, slug, 'certifications'), cert);
  }

  removeCertification = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    await deleteDoc(doc(this.db, ROOT_COLLECTION, slug, 'certifications', id));
  }

  addTransformation = async (trans: Omit<Transformation, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    await addDoc(collection(this.db, ROOT_COLLECTION, slug, 'transformations'), trans);
  }

  removeTransformation = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    await deleteDoc(doc(this.db, ROOT_COLLECTION, slug, 'transformations', id));
  }

  addClass = async (gymClass: Omit<GymClass, 'id'>): Promise<void> => {
    const slug = await this.getMySlug();
    await addDoc(collection(this.db, ROOT_COLLECTION, slug, 'classes'), gymClass);
  }

  removeClass = async (id: string): Promise<void> => {
    const slug = await this.getMySlug();
    await deleteDoc(doc(this.db, ROOT_COLLECTION, slug, 'classes', id));
  }

  updateClass = async (id: string, updates: Partial<GymClass>): Promise<void> => {
    const slug = await this.getMySlug();
    await updateDoc(doc(this.db, ROOT_COLLECTION, slug, 'classes', id), updates);
  }
}
