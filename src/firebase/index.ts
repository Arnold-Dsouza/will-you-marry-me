'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services safely for client-side use.
 */
export function initializeFirebase(): { 
  firebaseApp: FirebaseApp | null; 
  firestore: Firestore | null; 
  auth: Auth | null 
} {
  // Ensure we only run on the client
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    // Check if configuration is present
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'MISSING_API_KEY') {
      console.warn("Firebase configuration is missing. Authentication and Firestore will be disabled.");
      return { firebaseApp: null, firestore: null, auth: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    return { firebaseApp: app, firestore: db, auth };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
