import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  storage,
} from '../lib/firebase';
import { CourseLevel, StudentProfile } from '../types/academy';

export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  country: string;
  countyOrState: string;
  townOrCity: string;
  selectedCourseId: string;
  selectedLevel: CourseLevel;
  avatarFile?: File | null;
}

interface AuthContextValue {
  user: User | null;
  profile: StudentProfile | null;
  authReady: boolean;
  isAdmin: boolean;
  registerWithEmail: (payload: RegistrationPayload) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (
    updates: Partial<
      Pick<
        StudentProfile,
        | 'firstName'
        | 'lastName'
        | 'phone'
        | 'country'
        | 'countyOrState'
        | 'townOrCity'
        | 'avatarUrl'
        | 'selectedCourseId'
        | 'selectedLevel'
      >
    >,
    avatarFile?: File | null,
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  uploadAvatar: (uid: string, file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const uploadAvatar = async (uid: string, file: File): Promise<string> => {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `avatars/${uid}/${Date.now()}_${safeName}`);
      const uploadTask = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timed out')), 10000),
      );
      await Promise.race([uploadTask, timeoutPromise]);
      const url = await getDownloadURL(storageRef);
      return url.slice(0, 1000);
    } catch (err) {
      console.warn('Avatar upload to Storage unavailable or blocked; continuing with initials avatar.', err);
      return '';
    }
  };

  const loadUserProfile = async (firebaseUser: User) => {
    const userPath = `users/${firebaseUser.uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (snap.exists()) {
        setProfile(snap.data() as StudentProfile);
      } else {
        const displayParts = (firebaseUser.displayName || 'LIWAI Student').trim().split(/\s+/);
        const firstName = (displayParts[0] || 'Student').slice(0, 80);
        const lastName = (displayParts.slice(1).join(' ') || 'Learner').slice(0, 80);
        const isOwnerAdmin =
          firebaseUser.email === BOOTSTRAPPED_ADMIN_EMAIL && firebaseUser.emailVerified;

        const newProfile: StudentProfile = {
          uid: firebaseUser.uid,
          firstName,
          lastName,
          email: (firebaseUser.email || '').slice(0, 160),
          phone: '',
          country: '',
          countyOrState: '',
          townOrCity: '',
          avatarUrl: (firebaseUser.photoURL || '').slice(0, 1000),
          selectedCourseId: 'web-design-systems',
          selectedLevel: 'Beginner',
          role: isOwnerAdmin ? 'admin' : 'student',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, userPath);
    }

    try {
      const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
      setHasAdminDoc(adminSnap.exists());
    } catch {
      setHasAdminDoc(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await loadUserProfile(firebaseUser);
        } catch (err) {
          console.error('Failed loading user profile:', err);
        }
      } else {
        setProfile(null);
        setHasAdminDoc(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isBootstrappedAdmin = Boolean(
    user?.email === BOOTSTRAPPED_ADMIN_EMAIL && user?.emailVerified,
  );

  const isAdmin = Boolean(isBootstrappedAdmin || hasAdminDoc || profile?.role === 'admin');

  const registerWithEmail = async (payload: RegistrationPayload) => {
    const cred = await createUserWithEmailAndPassword(auth, payload.email.trim(), payload.password);
    const createdUser = cred.user;

    await updateProfile(createdUser, {
      displayName: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
    });

    let avatarUrl = '';
    if (payload.avatarFile) {
      avatarUrl = await uploadAvatar(createdUser.uid, payload.avatarFile);
    }

    const profileDoc: StudentProfile = {
      uid: createdUser.uid,
      firstName: payload.firstName.trim().slice(0, 80),
      lastName: payload.lastName.trim().slice(0, 80),
      email: payload.email.trim().slice(0, 160),
      phone: payload.phone.trim().slice(0, 40),
      country: payload.country.trim().slice(0, 80),
      countyOrState: payload.countyOrState.trim().slice(0, 80),
      townOrCity: payload.townOrCity.trim().slice(0, 80),
      avatarUrl,
      selectedCourseId: payload.selectedCourseId.slice(0, 128),
      selectedLevel: payload.selectedLevel,
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'users', createdUser.uid), profileDoc);
      setProfile(profileDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${createdUser.uid}`);
    }

    try {
      await sendEmailVerification(createdUser);
    } catch (err) {
      console.warn('Email verification send skipped:', err);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setHasAdminDoc(false);
  };

  const updateProfileData: AuthContextValue['updateProfileData'] = async (updates, avatarFile) => {
    if (!user) throw new Error('You must be signed in to update your profile.');

    let nextAvatarUrl = updates.avatarUrl ?? profile?.avatarUrl ?? '';
    if (avatarFile) {
      const uploaded = await uploadAvatar(user.uid, avatarFile);
      if (uploaded) nextAvatarUrl = uploaded;
    }

    const sanitized = {
      firstName: (updates.firstName ?? profile?.firstName ?? '').trim().slice(0, 80),
      lastName: (updates.lastName ?? profile?.lastName ?? '').trim().slice(0, 80),
      phone: (updates.phone ?? profile?.phone ?? '').trim().slice(0, 40),
      country: (updates.country ?? profile?.country ?? '').trim().slice(0, 80),
      countyOrState: (updates.countyOrState ?? profile?.countyOrState ?? '').trim().slice(0, 80),
      townOrCity: (updates.townOrCity ?? profile?.townOrCity ?? '').trim().slice(0, 80),
      avatarUrl: nextAvatarUrl.slice(0, 1000),
      selectedCourseId: (updates.selectedCourseId ?? profile?.selectedCourseId ?? '').slice(0, 128),
      selectedLevel: updates.selectedLevel ?? profile?.selectedLevel ?? 'Beginner',
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), sanitized);
      await updateProfile(user, {
        displayName: `${sanitized.firstName} ${sanitized.lastName}`,
      });
      setProfile((prev) => (prev ? { ...prev, ...sanitized } : prev));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await user.reload();
      await loadUserProfile(user);
    }
  };

  const resendVerification = async () => {
    if (!user) return;
    await sendEmailVerification(user);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authReady,
        isAdmin,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        updateProfileData,
        refreshProfile,
        resendVerification,
        sendPasswordReset,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
