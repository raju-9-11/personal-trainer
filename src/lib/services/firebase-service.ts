import { DataProviderType, TrainerProfile, Certification, Transformation, GymClass, Testimonial } from '../types';
import { getFirebase } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Firestore } from 'firebase/firestore';

const COLLECTIONS = {
  PROFILE: 'profile',
  CERTS: 'certifications',
  TRANS: 'transformations',
  CLASSES: 'classes',
  TESTIMONIALS: 'testimonials',
};

const PROFILE_DOC_ID = 'main';

export class FirebaseDataService implements DataProviderType {
  private db: Firestore;

  constructor() {
    const { db } = getFirebase();
    if (!db) {
      throw new Error("Failed to initialize Firebase Firestore. Check your configuration.");
    }
    this.db = db;
  }

  // --- Read ---
  getProfile = async (): Promise<TrainerProfile> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.PROFILE));
    if (snapshot.empty) {
      throw new Error("Profile not found in Firestore. Please create a document in 'profile' collection.");
    }
    return snapshot.docs[0].data() as TrainerProfile;
  }

  getCertifications = async (): Promise<Certification[]> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.CERTS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
  }

  getTransformations = async (): Promise<Transformation[]> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.TRANS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transformation));
  }

  getClasses = async (): Promise<GymClass[]> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.CLASSES));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
  }

  getTestimonials = async (): Promise<Testimonial[]> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.TESTIMONIALS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  }

  // --- Write ---
  updateProfile = async (profile: TrainerProfile): Promise<void> => {
    const snapshot = await getDocs(collection(this.db, COLLECTIONS.PROFILE));
    const docId = snapshot.empty ? PROFILE_DOC_ID : snapshot.docs[0].id;
    await setDoc(doc(this.db, COLLECTIONS.PROFILE, docId), profile, { merge: true });
  }

  addCertification = async (cert: Omit<Certification, 'id'>): Promise<void> => {
    await addDoc(collection(this.db, COLLECTIONS.CERTS), cert);
  }

  removeCertification = async (id: string): Promise<void> => {
    await deleteDoc(doc(this.db, COLLECTIONS.CERTS, id));
  }

  addTransformation = async (trans: Omit<Transformation, 'id'>): Promise<void> => {
    await addDoc(collection(this.db, COLLECTIONS.TRANS), trans);
  }

  removeTransformation = async (id: string): Promise<void> => {
    await deleteDoc(doc(this.db, COLLECTIONS.TRANS, id));
  }

  addClass = async (gymClass: Omit<GymClass, 'id'>): Promise<void> => {
    await addDoc(collection(this.db, COLLECTIONS.CLASSES), gymClass);
  }

  removeClass = async (id: string): Promise<void> => {
    await deleteDoc(doc(this.db, COLLECTIONS.CLASSES, id));
  }

  updateClass = async (id: string, updates: Partial<GymClass>): Promise<void> => {
    await updateDoc(doc(this.db, COLLECTIONS.CLASSES, id), updates);
  }
}
