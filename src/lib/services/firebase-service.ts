import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial, BrandIdentity } from '../types';
import { getFirebase } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Firestore, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

    // Query 'trainers' collection where field 'ownerUid' == user.uid
    // Since we can't easily add indexes here, let's assume a 'users' collection or similar exists, OR
    // we iterate (slow) or strict naming.
    // BETTER: Store 'slug' in the User's Custom Claims or a 'users/{uid}' doc.
    // FOR NOW: Let's assume we can query `trainers` by ownerUid.

    // Actually, to keep it simple and robust without custom claims:
    // We will query the `trainers` collection for the document that has `ownerUid == user.uid`.
    // Note: This requires an index in Firestore.

    // Alternative: The user profile in `users/{uid}` contains `{ slug: "trainer1" }`.
    // Let's assume `users` collection exists.

    // FALLBACK for this environment:
    // If we can't find it, we might error out.
    // But wait, the prompt said "user cannot be created by admin portal but just login...".

    // Let's implement a lookup.
    const trainersRef = collection(this.db, ROOT_COLLECTION);
    const snapshot = await getDocs(trainersRef);
    // ^ This fetches ALL trainers. In a real large app this is bad. For this scale, it's fine.

    const myDoc = snapshot.docs.find(d => d.data().ownerUid === user.uid);
    if (!myDoc) {
      throw new Error("No trainer profile associated with this account.");
    }
    return myDoc.id; // The slug is the doc ID
  }

  // Helper for Read ops
  private getTargetSlug(slug?: string): string {
    if (slug) return slug;
    // If no slug provided for READ, it might be the home page or admin view needing self-data
    throw new Error("Slug is required for public read operations.");
  }

  // --- Read ---
  getProfile = async (): Promise<TrainerProfile> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.PROFILE));
    if (snapshot.empty) {
      console.warn("Profile not found in Firestore. Returning default profile. Please create a document in 'profile' collection.");
      return {
        name: "Your Name",
        bio: "Your Bio",
        heroTitle: "Your Hero Title",
        heroSubtitle: "Your Hero Subtitle",
        contactEmail: "your.email@example.com",
        contactPhone: "Your Phone",
        instagramUrl: "",
        youtubeUrl: "",
      };
    }
    return snapshot.data() as TrainerProfile;
  }

  getBrandIdentity = async (): Promise<BrandIdentity> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.IDENTITY));
    if (snapshot.empty) {
      return {
        brandName: "",
        logoUrl: "",
        primaryColor: "#000000",
        secondaryColor: "#ffffff"
      };
    }
    return snapshot.docs[0].data() as BrandIdentity;
  }

  getCertifications = async (): Promise<Certification[]> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.CERTS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
  }

  getTransformations = async (slug?: string): Promise<Transformation[]> => {
    if (!slug) throw new Error("Slug required");
    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, 'transformations'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transformation));
  }

  getClasses = async (slug?: string): Promise<GymClass[]> => {
    if (!slug) throw new Error("Slug required");
    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, 'classes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
  }

  getTestimonials = async (slug?: string): Promise<Testimonial[]> => {
    if (!slug) throw new Error("Slug required");
    const snapshot = await getDocs(collection(this.db, ROOT_COLLECTION, slug, 'testimonials'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  }

  // --- Write (Scoped to Authenticated User) ---

  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    const slug = await this.getMySlug();
    await setDoc(doc(this.db, ROOT_COLLECTION, slug), profile, { merge: true });
  }

  updateBrandIdentity = async (identity: BrandIdentity): Promise<void> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.IDENTITY));
    const docId = snapshot.empty ? IDENTITY_DOC_ID : snapshot.docs[0].id;
    await setDoc(doc(this.db, COLLECTIONS.IDENTITY, docId), identity, { merge: true });
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
