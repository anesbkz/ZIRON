import { db, functionsInstance } from '@/config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { UserProfile } from '@/types/models';
import { AppRole } from '@/types/rbac';
import { validateRoleTransition, isSuperAdmin, hasPermission } from '@/lib/rbac/permissions';

export const BOOTSTRAP_SUPERADMIN_EMAIL = 'bkzboukhbiza@gmail.com';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as UserProfile;
  } catch (error) {
    console.error(`Error getting user profile for ${uid}:`, error);
    return null;
  }
}

export async function createInitialUserProfile(
  uid: string,
  email: string,
  displayName: string,
  initialRoles: AppRole[] = ['CUSTOMER']
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const isBootstrap = email.toLowerCase() === BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase();

  // Client creates base profile conforming to Firestore rule constraints
  const profile: UserProfile = {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: '',
    phoneNumber: '',
    status: 'active',
    roles: ['CUSTOMER'],
    createdAt: now,
    updatedAt: now,
    onboardingCompleted: false,
    communityAccess: false,
    schoolAccess: false,
    xp: 0,
    level: 1,
    locale: 'en',
  };

  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, profile);

  // If bootstrap email or initialRoles has elevated roles, invoke authoritative server governance
  if (isBootstrap || (initialRoles.length === 1 && !initialRoles.includes('CUSTOMER'))) {
    const desiredRoles: AppRole[] = isBootstrap ? ['SUPER_ADMIN'] : initialRoles;
    try {
      const assignCallable = httpsCallable<
        { targetUid: string; newRoles: string[] },
        { success: boolean }
      >(functionsInstance, 'assignUserRoles');
      await assignCallable({ targetUid: uid, newRoles: desiredRoles });
      profile.roles = desiredRoles;
      if (desiredRoles.includes('SUPER_ADMIN')) {
        profile.communityAccess = true;
        profile.schoolAccess = true;
      }
    } catch (e) {
      console.warn('Bootstrap or initial role elevation error:', e);
    }
  }

  return profile;
}

export async function updateSafeProfileFields(
  uid: string,
  fields: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'phoneNumber' | 'locale' | 'onboardingCompleted'>>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...fields,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Administrative Role Governance
 * AUTHORITATIVE ARCHITECTURE:
 * Calls the server-side Cloud Function `assignUserRoles`.
 * Prevents client-side privilege escalation and ensures SUPER_ADMIN guard enforcement.
 */
export async function adminUpdateUserRoles(
  targetUid: string,
  newRoles: AppRole[],
  actor: UserProfile
): Promise<void> {
  // 1. Fetch current target user profile to inspect existing roles
  const targetUser = await getUserProfile(targetUid);
  if (!targetUser) {
    throw new Error(`Target user profile ${targetUid} not found.`);
  }

  // 2. Client-side sanity validation for immediate UX feedback
  const validation = validateRoleTransition(actor, targetUser, newRoles);
  if (!validation.allowed) {
    throw new Error(validation.reason || 'Unauthorized role transition.');
  }

  // 3. Invoke authoritative server-side Cloud Function
  const assignCallable = httpsCallable<
    { targetUid: string; newRoles: string[] },
    { success: boolean }
  >(functionsInstance, 'assignUserRoles');

  try {
    await assignCallable({ targetUid, newRoles });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update user roles via server authority.');
  }
}

/**
 * Administrative Account Status Governance
 * AUTHORITATIVE ARCHITECTURE:
 * Calls the server-side Cloud Function `updateUserStatus`.
 */
export async function adminUpdateUserStatus(
  targetUid: string,
  newStatus: UserProfile['status'],
  actor: UserProfile
): Promise<void> {
  if (!isSuperAdmin(actor) && !hasPermission(actor, 'MANAGE_USERS')) {
    throw new Error('Actor lacks MANAGE_USERS permission to change account status.');
  }

  const targetUser = await getUserProfile(targetUid);
  if (!targetUser) {
    throw new Error(`Target user profile ${targetUid} not found.`);
  }

  if (isSuperAdmin(targetUser) && !isSuperAdmin(actor)) {
    throw new Error('Privilege boundary: Only a SUPER_ADMIN can modify the status of a SUPER_ADMIN account.');
  }

  const statusCallable = httpsCallable<
    { targetUid: string; newStatus: string },
    { success: boolean }
  >(functionsInstance, 'updateUserStatus');

  try {
    await statusCallable({ targetUid, newStatus });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update user status via server authority.');
  }
}

export async function listAllUsers(maxUsers: number = 50): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), limit(maxUsers));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    console.warn('Unable to list users:', error);
    return [];
  }
}
