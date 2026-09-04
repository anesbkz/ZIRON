import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { UserProfile } from '@/types/models';
import { AppRole, AppPermission } from '@/types/rbac';
import {
  aggregatePermissions,
  hasRole as checkRole,
  hasAnyRole as checkAnyRole,
  hasPermission as checkPermission,
  isStaff as checkStaff,
  isAdmin as checkAdmin,
  isSuperAdmin as checkSuperAdmin,
} from '@/lib/rbac/permissions';
import {
  getUserProfile,
  createInitialUserProfile,
} from '@/services/userService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  roles: AppRole[];
  permissions: Set<AppPermission>;
  isStaff: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasPermission: (permission: AppPermission) => boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendEmailVerificationLink: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserProfile = async (firebaseUser: User | null): Promise<UserProfile | null> => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }

    try {
      let p = await getUserProfile(firebaseUser.uid);
      if (!p) {
        // First-time registration or missing profile in Firestore: create profile
        p = await createInitialUserProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || ''
        );
      }
      setProfile(p);
      return p;
    } catch (error) {
      console.error('Failed to load user profile from Firestore:', error);
      // Construct fallback transient representation to avoid total crash
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Subject',
        status: 'active',
        roles: ['CUSTOMER'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
        communityAccess: false,
        schoolAccess: false,
        xp: 0,
        level: 1,
        locale: 'en',
      };
      setProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await loadUserProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      await createInitialUserProfile(cred.user.uid, email, name);
      await loadUserProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendEmailVerificationLink = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  const roles = profile?.roles || [];
  const permissions = aggregatePermissions(roles);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    roles,
    permissions,
    isStaff: checkStaff(profile),
    isAdmin: checkAdmin(profile),
    isSuperAdmin: checkSuperAdmin(profile),
    hasRole: (r: AppRole) => checkRole(profile, r),
    hasAnyRole: (rs: AppRole[]) => checkAnyRole(profile, rs),
    hasPermission: (p: AppPermission) => checkPermission(profile, p),
    login,
    register,
    logout,
    resetPassword,
    sendEmailVerificationLink,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
