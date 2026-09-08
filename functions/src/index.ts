import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

admin.initializeApp();

/**
 * Authoritative Named Firestore Database
 * Connects to the designated named Firestore database for the VIREXON / ZIRON platform.
 */
export const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-zironvirexonbios-f7d3e78d-aa70-4ff3-ae14-d8f7ce2b420b';

const db = getFirestore(FIRESTORE_DATABASE_ID);

// Server-authoritative bootstrap identity configuration.
// Sourced securely from environment variables or Firebase Functions runtime config.
// Never hard-coded. Never exposed to client-side code.
export function getBootstrapSuperAdminEmail(): string | null {
  const email = (
    process.env.BOOTSTRAP_SUPERADMIN_EMAIL ||
    functions.config()?.system?.bootstrap_email ||
    ''
  ).toLowerCase().trim();
  return email || null;
}

/**
 * Canonical Application Roles
 */
export const CANONICAL_APP_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'PRODUCT_MANAGER',
  'SCHOOL_MANAGER',
  'COMMUNITY_MANAGER',
  'CONTENT_MANAGER',
  'SECURITY_OFFICER',
  'AUDITOR',
  'CUSTOMER',
  'BETA_TESTER',
  'RESEARCH_PARTICIPANT',
] as const;

export type AppRole = (typeof CANONICAL_APP_ROLES)[number];

/**
 * Bootstrap Lifecycle Helper
 * 
 * 1. Initial State: No active user profile in `users` holds the `SUPER_ADMIN` role, and
 *    `_system/governance` does not indicate bootstrap completion.
 *    In this state, the configured BOOTSTRAP_SUPERADMIN_EMAIL with a verified email is permitted
 *    to invoke initializeBootstrapGovernance once to establish the initial permanent SUPER_ADMIN account.
 * 
 * 2. Permanent State: Once an active user profile possesses the SUPER_ADMIN role (or bootstrapCompleted
 *    is marked true in `_system/governance`), the bootstrap shortcut is PERMANENTLY DISABLED.
 *    Any subsequent authentication by the bootstrap email alone will NOT grant administrative authority;
 *    authorization strictly requires authoritative Firestore user roles (`users/{uid}.roles`) or custom claims.
 */
export async function isBootstrapModeAuthorized(
  callerEmail: string,
  isEmailVerified: boolean
): Promise<boolean> {
  if (!callerEmail || !isEmailVerified) return false;
  const targetBootstrapEmail = getBootstrapSuperAdminEmail();
  if (!targetBootstrapEmail) {
    // If BOOTSTRAP_SUPERADMIN_EMAIL is not configured, fail safely. Never guess or use a fallback.
    return false;
  }
  if (callerEmail.toLowerCase().trim() !== targetBootstrapEmail) return false;

  try {
    const govSnap = await db.collection('_system').doc('governance').get();
    if (govSnap.exists && govSnap.data()?.bootstrapCompleted === true) {
      return false; // Bootstrap path permanently closed
    }
  } catch {
    // Continue to database role check
  }

  const existingSuperAdmins = await db
    .collection('users')
    .where('roles', 'array-contains', 'SUPER_ADMIN')
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (!existingSuperAdmins.empty) {
    return false; // Permanent active SUPER_ADMIN already established; shortcut closed
  }

  return true;
}

/**
 * Authoritative Server-Side SUPER_ADMIN Check
 * Permanent authorization strictly comes from authoritative users/{uid}.roles in Firestore
 * (or Firebase custom claims).
 * The bootstrap identity is ONLY temporary initialization authority for initializeBootstrapGovernance.
 * Email matching alone MUST NEVER authorize SUPER_ADMIN on any administrative endpoint.
 */
export async function checkIsSuperAdmin(
  callerUid: string,
  callerRoles: string[],
  _callerEmail?: string,
  _isEmailVerified?: boolean
): Promise<boolean> {
  if (callerRoles && callerRoles.includes('SUPER_ADMIN')) {
    return true;
  }
  return false;
}

/**
 * Trusted Server-Side Audit Helper
 * Authoritative audit logs must ONLY be created by trusted server-side execution.
 * Captures verified server timestamp and authenticated caller identity.
 */
export interface ServerAuditParams {
  actorUserId: string;
  actorEmail?: string;
  actorRoles: string[];
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuthoritativeAuditLog(
  firestore: admin.firestore.Firestore,
  params: ServerAuditParams,
  transaction?: admin.firestore.Transaction
): Promise<string> {
  const auditDocRef = firestore.collection('auditLogs').doc();
  const auditData = {
    id: auditDocRef.id,
    actorUserId: params.actorUserId,
    actorEmail: params.actorEmail || 'unknown',
    actorRoles: params.actorRoles || [],
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    timestamp: new Date().toISOString(),
    metadata: {
      ...params.metadata,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  };

  if (transaction) {
    transaction.set(auditDocRef, auditData);
  } else {
    await auditDocRef.set(auditData);
  }
  return auditDocRef.id;
}

/**
 * Callable Function: Initial System Bootstrap
 * Used once to establish the initial permanent SUPER_ADMIN and permanently seal bootstrap mode.
 */
export const initializeBootstrapGovernance = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;

  const targetBootstrapEmail = getBootstrapSuperAdminEmail();
  if (!targetBootstrapEmail) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'System bootstrap configuration missing. BOOTSTRAP_SUPERADMIN_EMAIL environment variable is not configured.'
    );
  }

  const canBootstrap = await isBootstrapModeAuthorized(callerEmail, isEmailVerified);
  if (!canBootstrap) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Bootstrap initialization is only available during uninitialized system deployment.'
    );
  }

  const now = new Date().toISOString();
  const userDocRef = db.collection('users').doc(callerUid);
  const govDocRef = db.collection('_system').doc('governance');

  const batch = db.batch();
  batch.set(
    userDocRef,
    {
      roles: ['SUPER_ADMIN'],
      status: 'active',
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(govDocRef, {
    bootstrapCompleted: true,
    completedAt: now,
    initialSuperAdminUid: callerUid,
    initialSuperAdminEmail: callerEmail,
  });

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: ['SUPER_ADMIN'],
    action: 'BOOTSTRAP_INITIALIZED',
    resourceType: '_system',
    resourceId: 'governance',
    timestamp: now,
    metadata: {
      bootstrapEmail: callerEmail,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, message: 'Permanent SUPER_ADMIN established. Bootstrap path closed.' };
});

/**
 * Callable Function: Authoritative Server-Side Role Governance
 * Strictly validates caller privilege and prevents privilege escalation.
 * ONLY SUPER_ADMIN may assign, alter, or remove the SUPER_ADMIN role.
 * ADMIN cannot grant SUPER_ADMIN or modify any SUPER_ADMIN account.
 */
export const assignUserRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The caller must be authenticated to invoke role governance.'
    );
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const { targetUid, newRoles } = data;

  if (!targetUid || !Array.isArray(newRoles) || newRoles.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing or invalid targetUid or newRoles parameters. User must retain at least one role.'
    );
  }

  // Validate every requested role against the canonical AppRole list
  for (const r of newRoles) {
    if (!CANONICAL_APP_ROLES.includes(r as AppRole)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Role "${r}" is not a recognized canonical application role.`
      );
    }
  }

  // 1. Fetch caller's profile to establish authority
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile does not exist.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
  const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN');

  if (!isCallerAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller does not possess administrative authority (CUSTOMER cannot manage roles).'
    );
  }

  // 2. Fetch target user profile
  const targetDocRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetDocRef.get();
  if (!targetSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user profile does not exist.');
  }
  const targetData = targetSnap.data();
  const currentTargetRoles: string[] = targetData?.roles || [];

  // 3. Anti-escalation check: Only SUPER_ADMIN can alter SUPER_ADMIN or grant SUPER_ADMIN
  const targetIsSuperAdmin = currentTargetRoles.includes('SUPER_ADMIN');
  const grantingSuperAdmin = newRoles.includes('SUPER_ADMIN');

  if ((targetIsSuperAdmin || grantingSuperAdmin) && !isCallerSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Privilege Escalation Guard: Only root SUPER_ADMIN may assign, promote, or alter the SUPER_ADMIN role.'
    );
  }

  const now = new Date().toISOString();

  // 4. Update Target User Profile in Firestore
  await targetDocRef.update({
    roles: newRoles,
    updatedAt: now,
  });

  // 5. Append immutable Audit Record via authoritative helper
  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'USER_ROLE_CHANGED',
    resourceType: 'users',
    resourceId: targetUid,
    metadata: {
      targetEmail: targetData?.email,
      previousRoles: currentTargetRoles,
      newRoles,
    },
  });

  return { success: true, targetUid, newRoles };
});

/**
 * Canonical Product Catalog SKUs supported for serial generation
 */
export const CANONICAL_CATALOG_SKUS: Record<
  string,
  { name: string; phasePrefix: string; phase: number }
> = {
  'ZR-PH01-30C': { name: 'ZIRON Phase 01 (30 Capsules)', phasePrefix: 'PH01', phase: 1 },
  'ZR-PH02-30C': { name: 'ZIRON Phase 02 (30 Capsules)', phasePrefix: 'PH02', phase: 2 },
  'ZR-PH03-30C': { name: 'ZIRON Phase 03 (30 Capsules)', phasePrefix: 'PH03', phase: 3 },
  'ZR-BNDL-90C': { name: 'ZIRON Complete Bundle (90 Capsules)', phasePrefix: 'BNDL', phase: 1 },
};

export const CROCKFORD_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Normalizes user-submitted or generated product codes.
 * Removes spaces, hyphens, and punctuation, and uppercases.
 */
export function normalizeProductCode(code: string): string {
  return (code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Generates an unambiguous random Crockford Base32 segment of specified length.
 * Uses cryptographically secure random bytes from Node.js crypto.
 */
export function generateCrockfordSegment(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CROCKFORD_ALPHABET[bytes[i] % CROCKFORD_ALPHABET.length];
  }
  return result;
}

/**
 * Generates a human-readable, cryptographically secure ZIRON container serial.
 * Format: ZR-<PHASE>-<XXXX>-<XXXX>-<XXXX> (e.g., ZR-PH01-7K9A-3F2W-M8PX)
 */
export function generateSecureProductCode(phasePrefix: string): string {
  const seg1 = generateCrockfordSegment(4);
  const seg2 = generateCrockfordSegment(4);
  const seg3 = generateCrockfordSegment(4);
  return `ZR-${phasePrefix}-${seg1}-${seg2}-${seg3}`;
}

/**
 * Authoritative RBAC verification for product code and batch management.
 * Strictly verifies SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER roles from the server Firestore profile.
 */
async function assertCanManageCodes(
  context: functions.https.CallableContext
): Promise<{ callerUid: string; callerEmail: string; callerRoles: string[] }> {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('PRODUCT_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to manage product codes (requires SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER).'
    );
  }

  return { callerUid, callerEmail, callerRoles };
}

/**
 * Callable Function: Public Container Serial Verification
 * Returns non-sensitive public validation status, phase, batch, and sku.
 */
export const verifyContainerCode = functions.https.onCall(async (data) => {
  const rawCode = (data?.code || '').trim().toUpperCase();

  if (!rawCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Product verification code is required.'
    );
  }

  // Pre-locate product code document reference (supports direct docId, code field, or normalized code)
  const codeDocRef = db.collection('productCodes').doc(rawCode);
  let codeSnap = await codeDocRef.get();

  if (!codeSnap.exists) {
    const codeQuery = await db
      .collection('productCodes')
      .where('code', '==', rawCode)
      .limit(1)
      .get();
    if (codeQuery.empty) {
      const normalized = normalizeProductCode(rawCode);
      const normQuery = await db
        .collection('productCodes')
        .where('normalizedCode', '==', normalized)
        .limit(1)
        .get();
      if (normQuery.empty) {
        return {
          isValid: false,
          isAuthentic: false,
          message: `Product container code "${rawCode}" not found in serialization catalog.`,
        };
      }
      codeSnap = normQuery.docs[0];
    } else {
      codeSnap = codeQuery.docs[0];
    }
  }

  const codeData = codeSnap.data()!;
  const now = new Date().toISOString();

  // Check batch status if associated with a manufacturing batch
  let batchStatus: string | null = null;
  if (codeData.batchId) {
    const batchSnap = await db.collection('batches').doc(codeData.batchId).get();
    if (batchSnap.exists) {
      batchStatus = batchSnap.data()?.status || null;
    }
  }

  const isCodeDisabled = codeData.status === 'DISABLED' || codeData.status === 'REVOKED';
  const isBatchDisabled = batchStatus === 'DISABLED' || batchStatus === 'ARCHIVED';

  return {
    isValid: !isCodeDisabled && !isBatchDisabled,
    isAuthentic: true,
    isActivated: !!codeData.isActivated || codeData.status === 'ACTIVATED',
    status: codeData.status || (codeData.isActivated ? 'ACTIVATED' : 'UNUSED'),
    phase: codeData.phase || null,
    batchNumber: codeData.batchNumber || codeData.batchId || null,
    batchStatus,
    productSku: codeData.productSku || 'ZIRON Bio-Formulation',
    verificationId: crypto.randomBytes(6).toString('hex').toUpperCase(),
    verifiedAt: now,
  };
});

/**
 * Callable Function: Authoritative Product Code Activation & Entitlement Granting
 * CONCURRENCY-SAFE ATOMIC TRANSACTION:
 * 1. Locates product code inside transaction
 * 2. Verifies code is unactivated and not DISABLED/REVOKED
 * 3. Verifies parent batch is ACTIVE (not DISABLED or ARCHIVED)
 * 4. Marks code activated and increments batch activatedCodes
 * 5. Creates activation record
 * 6. Creates authoritative entitlements
 * 7. Updates user cache flags, XP (+50 XP), and level
 * 8. Writes authoritative activation audit log
 */
export const activateContainerCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to activate a product container code.'
    );
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const callerSnap = await db.collection('users').doc(callerUid).get();
  const callerRoles: string[] = callerSnap.data()?.roles || ['CUSTOMER'];
  const rawCode = (data?.code || '').trim().toUpperCase();

  if (!rawCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Product verification code is required.'
    );
  }

  // Pre-locate product code document reference (supports direct docId, field lookup, or normalizedCode)
  let codeDocRef = db.collection('productCodes').doc(rawCode);
  const directSnap = await codeDocRef.get();
  if (!directSnap.exists) {
    const codeQuery = await db
      .collection('productCodes')
      .where('code', '==', rawCode)
      .limit(1)
      .get();
    if (codeQuery.empty) {
      const normalized = normalizeProductCode(rawCode);
      const normQuery = await db
        .collection('productCodes')
        .where('normalizedCode', '==', normalized)
        .limit(1)
        .get();
      if (normQuery.empty) {
        throw new functions.https.HttpsError(
          'not-found',
          `Product container code "${rawCode}" is not registered in the VIREXON serialization catalog.`
        );
      }
      codeDocRef = normQuery.docs[0].ref;
    } else {
      codeDocRef = codeQuery.docs[0].ref;
    }
  }

  // Concurrency-safe atomic transaction
  return await db.runTransaction(async (transaction) => {
    const codeSnap = await transaction.get(codeDocRef);
    if (!codeSnap.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Product container code "${rawCode}" not found in serialization catalog.`
      );
    }

    const codeData = codeSnap.data()!;
    if (codeData.status === 'ACTIVATED' || codeData.isActivated) {
      throw new functions.https.HttpsError(
        'already-exists',
        'This container has already been activated.'
      );
    }

    if (codeData.status === 'DISABLED' || codeData.status === 'REVOKED') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `This container code is ${codeData.status.toLowerCase()} and cannot be activated.`
      );
    }

    // Read parent batch using batchId if present
    let batchDocRef: admin.firestore.DocumentReference | null = null;
    if (codeData.batchId) {
      batchDocRef = db.collection('batches').doc(codeData.batchId);
      const batchSnap = await transaction.get(batchDocRef);
      if (batchSnap.exists) {
        const batchData = batchSnap.data()!;
        if (batchData.status === 'DISABLED') {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'This manufacturing batch is currently on hold or disabled.'
          );
        }
        if (batchData.status === 'ARCHIVED') {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'This manufacturing batch has been archived.'
          );
        }
      }
    }

    // Authoritative qualification logic:
    // Restart School access requires THREE DIFFERENT PRODUCT CONTAINERS successfully activated by the SAME user.
    // Uniqueness is strictly based on distinct container/code identity (not phase, not SKU).
    // Retrieve user's existing activation records within the transaction to calculate distinct activated containers.
    const userActivationsQuery = db.collection('activations').where('userId', '==', callerUid);
    const existingActivationsSnap = await transaction.get(userActivationsQuery);

    const distinctContainerCodes = new Set<string>();
    existingActivationsSnap.docs.forEach((doc) => {
      const codeVal = (doc.data().code || '').trim().toUpperCase();
      if (codeVal) {
        distinctContainerCodes.add(codeVal);
      }
    });
    // Add current container being activated
    distinctContainerCodes.add(codeData.code || rawCode);
    const qualifyingContainerCount = distinctContainerCodes.size;

    // Check if user already holds an earned SCHOOL_ACCESS entitlement (Earned Access Rule)
    // Once unlocked, School access is earned and not revoked by subsequent product state changes.
    const schoolEntDocRef = db.collection('entitlements').doc(`${callerUid}_SCHOOL_ACCESS`);
    const schoolEntSnap = await transaction.get(schoolEntDocRef);
    const hasEarnedSchoolAccess = schoolEntSnap.exists && schoolEntSnap.data()?.status === 'ACTIVE';

    const qualifiesForSchool = qualifyingContainerCount >= 3 || hasEarnedSchoolAccess;

    // Read current user document inside transaction for atomic XP and reward calculation
    const userDocRef = db.collection('users').doc(callerUid);
    const userSnap = await transaction.get(userDocRef);
    const userData = userSnap.exists ? userSnap.data() : null;
    const currentXp = typeof userData?.xp === 'number' ? userData.xp : 0;
    const awardedXp = 50;
    const totalXp = currentXp + awardedXp;
    const level = Math.floor(totalXp / 100) + 1;

    const now = new Date().toISOString();
    const productSku = codeData.productSku || 'VIR-CONTAINER-DEFAULT';
    const activationDocRef = db.collection('activations').doc();

    // 1. Mark code as activated (permanently bound to callerUid)
    transaction.update(codeDocRef, {
      status: 'ACTIVATED',
      isActivated: true,
      activatedByUserId: callerUid,
      activatedAt: now,
      activationId: activationDocRef.id,
      updatedAt: now,
    });

    // Increment parent batch's activatedCodes if batch exists
    if (batchDocRef) {
      transaction.update(batchDocRef, {
        activatedCodes: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });
    }

    // 2. Base container entitlements granted on every container
    const entitlementsToGrant: string[] = ['COMMUNITY_ACCESS', 'PHASE_TRAJECTORY'];
    if (qualifiesForSchool) {
      entitlementsToGrant.push('SCHOOL_ACCESS');
    }

    // 3. Create activation record
    transaction.set(activationDocRef, {
      id: activationDocRef.id,
      code: codeData.code || rawCode,
      normalizedCode: codeData.normalizedCode || normalizeProductCode(rawCode),
      userId: callerUid,
      productSku,
      batchId: codeData.batchId || null,
      batchNumber: codeData.batchNumber || null,
      activatedAt: now,
      entitlementsGranted: entitlementsToGrant,
      qualifyingContainerCount,
    });

    // 4. Create/update Authoritative Entitlement records for container perks
    for (const entType of ['COMMUNITY_ACCESS', 'PHASE_TRAJECTORY']) {
      const entDocRef = db.collection('entitlements').doc(`${callerUid}_${entType}`);
      transaction.set(entDocRef, {
        id: `${callerUid}_${entType}`,
        userId: callerUid,
        entitlementType: entType,
        sourceProductSku: productSku,
        sourceCode: codeData.code || rawCode,
        activationId: activationDocRef.id,
        status: 'ACTIVE',
        grantedAt: now,
        expiresAt: null,
        grantedBy: 'PRODUCT_ACTIVATION',
      }, { merge: true });
    }

    // 5. Authoritatively manage SCHOOL_ACCESS entitlement
    if (qualifiesForSchool) {
      transaction.set(schoolEntDocRef, {
        id: `${callerUid}_SCHOOL_ACCESS`,
        userId: callerUid,
        entitlementType: 'SCHOOL_ACCESS',
        sourceProductSku: productSku,
        sourceCode: codeData.code || rawCode,
        source: 'THREE_CONTAINERS',
        activationId: activationDocRef.id,
        status: 'ACTIVE',
        grantedAt: schoolEntSnap.exists && schoolEntSnap.data()?.grantedAt ? schoolEntSnap.data()?.grantedAt : now,
        unlockedAt: schoolEntSnap.exists && schoolEntSnap.data()?.unlockedAt ? schoolEntSnap.data()?.unlockedAt : now,
        expiresAt: null,
        grantedBy: 'THREE_CONTAINERS',
        qualifyingContainerCount,
      }, { merge: true });
    }

    // 6. Update user profile quick access flags and reward/XP state
    transaction.set(userDocRef, {
      communityAccess: true,
      schoolAccess: qualifiesForSchool,
      qualifyingContainerCount,
      xp: totalXp,
      level,
      updatedAt: now,
    }, { merge: true });

    // 7. Authoritative activation audit log
    const auditDocRef = db.collection('auditLogs').doc();
    transaction.set(auditDocRef, {
      id: auditDocRef.id,
      actorUserId: callerUid,
      actorEmail: callerEmail,
      actorRoles: callerRoles,
      action: 'PRODUCT_CODE_ACTIVATED',
      resourceType: 'productCodes',
      resourceId: codeDocRef.id,
      timestamp: now,
      metadata: {
        code: codeData.code || rawCode,
        productSku,
        batchId: codeData.batchId || null,
        batchNumber: codeData.batchNumber || null,
        activationId: activationDocRef.id,
        qualifyingContainerCount,
        schoolUnlocked: qualifiesForSchool,
        xpAwarded: awardedXp,
        totalXp,
        level,
        enforcedBy: 'SERVER_TRANSACTION',
      },
    });

    return {
      success: true,
      activationId: activationDocRef.id,
      entitlements: entitlementsToGrant,
      qualifyingContainerCount,
      schoolUnlocked: qualifiesForSchool,
      xpAwarded: awardedXp,
      totalXp,
      level,
    };
  });
});

/**
 * Callable Function: Cryptographically Secure Product Code Generation
 * Generates unique, Crockford Base32-formatted serialization serials for containers.
 * Restricts access to SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER.
 * Validates batch existence and active status.
 * Updates batch totalCodes atomically.
 */
export const generateProductCodes = functions.https.onCall(async (data, context) => {
  const { callerUid, callerEmail, callerRoles } = await assertCanManageCodes(context);

  const { quantity, productSku, batchId } = data || {};

  // 1. Validate quantity
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Quantity must be an integer between 1 and 500.'
    );
  }

  // 2. Validate productSku
  if (!productSku || typeof productSku !== 'string' || !CANONICAL_CATALOG_SKUS[productSku]) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Product SKU "${productSku}" is not recognized in the canonical catalog. Allowed: ${Object.keys(CANONICAL_CATALOG_SKUS).join(', ')}`
    );
  }

  // 3. Validate batchId and batch ACTIVE status
  if (!batchId || typeof batchId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid batchId is required.');
  }

  const batchDocRef = db.collection('batches').doc(batchId);
  const batchSnap = await batchDocRef.get();
  if (!batchSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Batch "${batchId}" does not exist.`);
  }

  const batchData = batchSnap.data()!;
  if (batchData.status !== 'ACTIVE') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Batch "${batchId}" is not ACTIVE (current status: ${batchData.status}). Codes can only be generated for ACTIVE batches.`
    );
  }

  const skuConfig = CANONICAL_CATALOG_SKUS[productSku];

  // 4. Cryptographically generate unique codes (in-memory candidate generation)
  const generatedCodes = new Set<string>();
  const codeItems: { code: string; normalizedCode: string }[] = [];

  while (codeItems.length < quantity) {
    const code = generateSecureProductCode(skuConfig.phasePrefix);
    const normalized = normalizeProductCode(code);
    if (!generatedCodes.has(normalized)) {
      generatedCodes.add(normalized);
      codeItems.push({ code, normalizedCode: normalized });
    }
  }

  // 5. Check collisions against existing productCodes in Firestore
  const validCodeItems: { code: string; normalizedCode: string }[] = [];
  const candidateDocRefs = codeItems.map((item) => db.collection('productCodes').doc(item.code));

  // Chunk reads to respect Firestore getAll limits
  const CHUNK_READ_SIZE = 100;
  const existingSnapshots: admin.firestore.DocumentSnapshot[] = [];
  for (let i = 0; i < candidateDocRefs.length; i += CHUNK_READ_SIZE) {
    const chunk = candidateDocRefs.slice(i, i + CHUNK_READ_SIZE);
    const snaps = await db.getAll(...chunk);
    existingSnapshots.push(...snaps);
  }

  for (let i = 0; i < existingSnapshots.length; i++) {
    if (!existingSnapshots[i].exists) {
      validCodeItems.push(codeItems[i]);
    } else {
      // Collision detected! Regenerate unique replacement
      let replacementFound = false;
      while (!replacementFound) {
        const repCode = generateSecureProductCode(skuConfig.phasePrefix);
        const repNorm = normalizeProductCode(repCode);
        if (!generatedCodes.has(repNorm)) {
          generatedCodes.add(repNorm);
          const repSnap = await db.collection('productCodes').doc(repCode).get();
          if (!repSnap.exists) {
            validCodeItems.push({ code: repCode, normalizedCode: repNorm });
            replacementFound = true;
          }
        }
      }
    }
  }

  const now = new Date().toISOString();
  const codeDocs = validCodeItems.map((item) => ({
    id: item.code,
    code: item.code,
    normalizedCode: item.normalizedCode,
    productSku,
    phase: skuConfig.phase,
    batchId,
    batchNumber: batchData.batchNumber || batchId,
    status: 'UNUSED',
    isActivated: false,
    activatedByUserId: null,
    activatedAt: null,
    activationId: null,
    grantsSchoolAccess: true,
    grantsCommunityAccess: true,
    createdAt: now,
    createdBy: callerUid,
    exportCount: 0,
    lastExportedAt: null,
  }));

  // 6. Commit documents in safe chunks of 400 (under Firestore's 500-op batch write limit)
  const WRITE_CHUNK_SIZE = 400;
  for (let i = 0; i < codeDocs.length; i += WRITE_CHUNK_SIZE) {
    const chunk = codeDocs.slice(i, i + WRITE_CHUNK_SIZE);
    const batchWrite = db.batch();
    for (const docData of chunk) {
      batchWrite.set(db.collection('productCodes').doc(docData.id), docData);
    }
    await batchWrite.commit();
  }

  // 7. Atomically increment batch totalCodes count
  await batchDocRef.update({
    totalCodes: admin.firestore.FieldValue.increment(quantity),
    updatedAt: now,
  });

  // 8. Write authoritative audit log
  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'PRODUCT_CODES_GENERATED',
    resourceType: 'productCodes',
    resourceId: batchId,
    metadata: {
      batchId,
      batchNumber: batchData.batchNumber || batchId,
      productSku,
      quantity,
      sampleCodes: codeDocs.slice(0, 3).map((d) => d.code),
    },
  });

  return {
    success: true,
    batchId,
    batchNumber: batchData.batchNumber || batchId,
    productSku,
    quantity,
    codes: codeDocs.map((d) => d.code),
  };
});

/**
 * Callable Function: Authoritative Manufacturing Batch Creation
 * Initializes a new manufacturing batch record with status ACTIVE and 0 initial codes.
 * Requires SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER role.
 */
export const createProductBatch = functions.https.onCall(async (data, context) => {
  const { callerUid, callerEmail, callerRoles } = await assertCanManageCodes(context);

  const {
    productSku,
    batchNumber: rawBatchNumber,
    manufactureDate,
    expiryDate,
    notes,
    coaUrl,
  } = data || {};

  if (!productSku || typeof productSku !== 'string' || !CANONICAL_CATALOG_SKUS[productSku]) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Valid productSku from catalog is required. Allowed: ${Object.keys(CANONICAL_CATALOG_SKUS).join(', ')}`
    );
  }

  const batchNumber = (rawBatchNumber || '').trim().toUpperCase();
  if (!batchNumber || batchNumber.length < 3) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid batchNumber is required (minimum 3 characters).'
    );
  }

  if (!manufactureDate || typeof manufactureDate !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid manufactureDate is required.'
    );
  }

  if (!expiryDate || typeof expiryDate !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid expiryDate is required.'
    );
  }

  // Ensure unique batchNumber across batches collection
  const existingBatchQuery = await db
    .collection('batches')
    .where('batchNumber', '==', batchNumber)
    .limit(1)
    .get();

  if (!existingBatchQuery.empty) {
    throw new functions.https.HttpsError(
      'already-exists',
      `Batch with batchNumber "${batchNumber}" already exists.`
    );
  }

  const batchRef = db.collection('batches').doc();
  const now = new Date().toISOString();
  const skuInfo = CANONICAL_CATALOG_SKUS[productSku];

  const batchDoc = {
    id: batchRef.id,
    batchNumber,
    productSku,
    productName: skuInfo.name,
    manufactureDate,
    expiryDate,
    status: 'ACTIVE',
    testingStatus: 'PENDING',
    totalCodes: 0,
    activatedCodes: 0,
    disabledCodes: 0,
    notes: typeof notes === 'string' ? notes.trim() : '',
    coaUrl: typeof coaUrl === 'string' ? coaUrl.trim() : null,
    createdAt: now,
    createdBy: callerUid,
    updatedAt: now,
  };

  await batchRef.set(batchDoc);

  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'BATCH_CREATED',
    resourceType: 'batches',
    resourceId: batchRef.id,
    metadata: {
      batchId: batchRef.id,
      batchNumber,
      productSku,
      productName: skuInfo.name,
      manufactureDate,
      expiryDate,
    },
  });

  return {
    success: true,
    batchId: batchRef.id,
    batchNumber,
    productSku,
    status: 'ACTIVE',
  };
});

/**
 * Callable Function: Authoritative Batch Status Transition
 * Allows SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER to transition batch status between ACTIVE, DISABLED, and ARCHIVED.
 * Centralized batch status protects all child codes without modifying every code document individually.
 */
export const updateBatchStatus = functions.https.onCall(async (data, context) => {
  const { callerUid, callerEmail, callerRoles } = await assertCanManageCodes(context);

  const { batchId, status } = data || {};

  if (!batchId || typeof batchId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid batchId is required.');
  }

  const allowedStatuses = ['ACTIVE', 'DISABLED', 'ARCHIVED'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Invalid status "${status}". Allowed: ${allowedStatuses.join(', ')}`
    );
  }

  const batchRef = db.collection('batches').doc(batchId);
  const batchSnap = await batchRef.get();
  if (!batchSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Batch "${batchId}" not found.`);
  }

  const batchData = batchSnap.data()!;
  const previousStatus = batchData.status;

  if (previousStatus === status) {
    return {
      success: true,
      batchId,
      previousStatus,
      newStatus: status,
      message: 'Status unchanged.',
    };
  }

  const now = new Date().toISOString();
  await batchRef.update({
    status,
    updatedAt: now,
    updatedBy: callerUid,
  });

  await writeAuthoritativeAuditLog(db, {
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'BATCH_STATUS_CHANGED',
    resourceType: 'batches',
    resourceId: batchId,
    metadata: {
      batchId,
      batchNumber: batchData.batchNumber || batchId,
      previousStatus,
      newStatus: status,
    },
  });

  return {
    success: true,
    batchId,
    previousStatus,
    newStatus: status,
  };
});

/**
 * Callable Function: Concurrency-Safe Community Post Liking
 * Deterministic single-like record at communityPostLikes/{postId_userId}.
 * Aggregate likesCount on communityPosts is managed exclusively by this server-side transaction.
 */
export const togglePostLike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const postId = data.postId;
  if (!postId || typeof postId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid postId is required.');
  }

  const likeDocId = `${postId}_${callerUid}`;
  const likeDocRef = db.collection('communityPostLikes').doc(likeDocId);
  const postDocRef = db.collection('communityPosts').doc(postId);

  return await db.runTransaction(async (transaction) => {
    const postSnap = await transaction.get(postDocRef);
    if (!postSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Community post not found.');
    }

    const postData = postSnap.data()!;
    const currentLikes = typeof postData.likesCount === 'number' ? postData.likesCount : 0;
    const likeSnap = await transaction.get(likeDocRef);
    const now = new Date().toISOString();

    if (likeSnap.exists) {
      // User already liked -> unlike
      transaction.delete(likeDocRef);
      const newCount = Math.max(0, currentLikes - 1);
      transaction.update(postDocRef, { likesCount: newCount, updatedAt: now });
      return { liked: false, likesCount: newCount };
    } else {
      // User has not liked -> like
      transaction.set(likeDocRef, {
        id: likeDocId,
        postId,
        userId: callerUid,
        createdAt: now,
      });
      const newCount = currentLikes + 1;
      transaction.update(postDocRef, { likesCount: newCount, updatedAt: now });
      return { liked: true, likesCount: newCount };
    }
  });
});

/**
 * Callable Function: Authoritative Certificate Issuance
 * Writes full credential to /certificates and minimal non-enumerable public verification
 * record to /publicCertificates/{certNumber}.
 */
export const issueCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  if (!isCallerSuperAdmin && !callerRoles.includes('SCHOOL_MANAGER') && !callerRoles.includes('ADMIN')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only School Managers or Administrators may issue certificates.'
    );
  }

  const { targetUserId, courseId, recipientName, courseTitle } = data;
  if (!targetUserId || !courseId || !recipientName || !courseTitle) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required certificate issuance fields.');
  }

  // 1. Verify target user existence
  const targetUserSnap = await db.collection('users').doc(targetUserId).get();
  if (!targetUserSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Target student "${targetUserId}" does not exist.`);
  }

  // 2. Authoritatively validate course existence in schoolCourses (reject non-existent courses)
  const courseDocRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseDocRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `School course "${courseId}" does not exist in curriculum.`);
  }

  // 3. Prevent duplicate certificate issuance for same targetUserId + courseId
  const existingCertQuery = await db
    .collection('certificates')
    .where('userId', '==', targetUserId)
    .where('courseId', '==', courseId)
    .where('status', '==', 'VALID')
    .limit(1)
    .get();

  if (!existingCertQuery.empty) {
    throw new functions.https.HttpsError(
      'already-exists',
      `A valid certificate has already been issued to student "${targetUserId}" for course "${courseId}".`
    );
  }

  const now = new Date().toISOString();
  // Collision-safe certificate number generation
  const certNumber = `VIR-CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // 4. Collision check
  const publicCertRef = db.collection('publicCertificates').doc(certNumber);
  const existingPublic = await publicCertRef.get();
  if (existingPublic.exists) {
    throw new functions.https.HttpsError('already-exists', 'A certificate with this number already exists. Please retry.');
  }

  const certRef = db.collection('certificates').doc();
  const batch = db.batch();

  // 5. Full private record (includes targetUserId and student details)
  batch.set(certRef, {
    id: certRef.id,
    certificateNumber: certNumber,
    userId: targetUserId,
    recipientName,
    courseId,
    courseTitle,
    issuedAt: now,
    issuedByUid: callerUid,
    status: 'VALID',
  });

  // 6. Public verification record with zero PII
  batch.set(publicCertRef, {
    certificateNumber: certNumber,
    recipientName,
    courseTitle,
    issuedAt: now,
    status: 'VALID',
  });

  // 7. Authoritative audit trail
  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'CERTIFICATE_ISSUED',
    resourceType: 'certificates',
    resourceId: certRef.id,
    timestamp: now,
    metadata: { certNumber, targetUserId, courseId, enforcedBy: 'SERVER_AUTHORITY' },
  });

  await batch.commit();

  return { success: true, certificateId: certRef.id, certificateNumber: certNumber };
});

/**
 * Callable Function: Administrative Community Announcement Creation
 * Authoritative path ensuring validation and immediate audit logging.
 */
export const createCommunityAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to create announcements (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).'
    );
  }

  const { title, content, body, tags = [], isPinned = false } = data;
  if (!title) {
    throw new functions.https.HttpsError('invalid-argument', 'Announcement title is required.');
  }
  const announcementBody = content || body;
  if (!announcementBody) {
    throw new functions.https.HttpsError('invalid-argument', 'Announcement body is required.');
  }

  const now = new Date().toISOString();
  const announcementRef = db.collection('communityAnnouncements').doc();
  const announcementDoc = {
    id: announcementRef.id,
    title,
    content: announcementBody,
    body: announcementBody,
    tags: Array.isArray(tags) ? tags : [],
    isPinned: Boolean(isPinned),
    authorId: callerUid,
    authorName: callerData.displayName || callerEmail || 'Staff',
    authorRoles: callerRoles,
    status: 'published',
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(announcementRef, announcementDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_ANNOUNCEMENT_CREATED',
    resourceType: 'communityAnnouncements',
    resourceId: announcementRef.id,
    timestamp: now,
    metadata: {
      isPinned: Boolean(isPinned),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, id: announcementRef.id };
});

/**
 * Callable Function: Authoritative Community Post Moderation
 * Updates status, lock, and pin fields, and writes authoritative audit logs.
 */
export const moderateCommunityPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to moderate posts (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).'
    );
  }

  const { postId, newStatus, isLocked, isPinned } = data;
  const allowedStatuses = ['published', 'hidden', 'flagged'];
  if (!postId || (newStatus && !allowedStatuses.includes(newStatus))) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid postId or newStatus.');
  }

  const postRef = db.collection('communityPosts').doc(postId);
  const postSnap = await postRef.get();
  if (!postSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Post "${postId}" does not exist.`);
  }
  const existingPost = postSnap.data()!;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    updatedAt: now,
    moderatedBy: callerUid,
    moderatedAt: now,
  };

  if (newStatus) updates.status = newStatus;
  if (typeof isLocked === 'boolean') updates.isLocked = isLocked;
  if (typeof isPinned === 'boolean') updates.isPinned = isPinned;

  const batch = db.batch();
  batch.update(postRef, updates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_POST_MODERATED',
    resourceType: 'communityPosts',
    resourceId: postId,
    timestamp: now,
    metadata: {
      previousStatus: existingPost.status,
      newStatus: updates.status || existingPost.status,
      isLocked: updates.isLocked,
      isPinned: updates.isPinned,
      authorId: existingPost.authorId,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, postId, updates };
});

/**
 * Callable Function: Authoritative Community Report Resolution
 */
export const resolveCommunityReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data();
  if (callerData?.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Account is not active.');
  }

  const callerRoles: string[] = callerData?.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to resolve community reports.'
    );
  }

  const { reportId, status, notes = '' } = data;
  const allowedStatuses = ['RESOLVED', 'DISMISSED', 'INVESTIGATING'];
  if (!reportId || !allowedStatuses.includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid reportId or status.');
  }

  const reportRef = db.collection('communityReports').doc(reportId);
  const reportSnap = await reportRef.get();
  if (!reportSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Report "${reportId}" does not exist.`);
  }
  const existingReport = reportSnap.data()!;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    status,
    resolvedBy: callerUid,
    resolvedAt: now,
    resolutionNotes: notes,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.update(reportRef, updates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_REPORT_RESOLVED',
    resourceType: 'communityReports',
    resourceId: reportId,
    timestamp: now,
    metadata: {
      targetType: existingReport.targetType,
      targetId: existingReport.targetId,
      reporterUserId: existingReport.reporterUserId,
      resolutionStatus: status,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, reportId, status };
});

/**
 * Callable Function: Administrative Account Status Governance
 */
export const updateUserStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
  const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN') || callerRoles.includes('SECURITY_OFFICER');

  if (!isCallerAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks MANAGE_USERS permission.');
  }

  const { targetUid, newStatus } = data;
  const validStatuses = ['active', 'pending', 'suspended', 'archived'];
  if (!targetUid || !validStatuses.includes(newStatus)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid targetUid or status parameter.');
  }

  const targetDocRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetDocRef.get();
  if (!targetSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user profile does not exist.');
  }

  const targetData = targetSnap.data()!;
  const targetRoles: string[] = targetData.roles || [];

  if (targetRoles.includes('SUPER_ADMIN') && !isCallerSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Privilege boundary: Only a SUPER_ADMIN can modify the status of a SUPER_ADMIN account.'
    );
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.update(targetDocRef, {
    status: newStatus,
    updatedAt: now,
  });

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'USER_STATUS_CHANGED',
    resourceType: 'users',
    resourceId: targetUid,
    timestamp: now,
    metadata: {
      targetEmail: targetData.email,
      previousStatus: targetData.status,
      newStatus,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, targetUid, newStatus };
});

/**
 * Callable Function: Administrative Manual Entitlement Grant
 * For special clinical trial or VIP grants.
 */
export const grantEntitlement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
  const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN');

  if (!isCallerAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Actor lacks authority to grant entitlements.');
  }

  const { targetUserId, entitlementType } = data;
  const validTypes = ['COMMUNITY_ACCESS', 'SCHOOL_ACCESS', 'PHASE_TRAJECTORY'];
  if (!targetUserId || !validTypes.includes(entitlementType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid targetUserId or entitlementType.');
  }

  const targetUserSnap = await db.collection('users').doc(targetUserId).get();
  if (!targetUserSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Target user "${targetUserId}" does not exist.`);
  }

  const now = new Date().toISOString();
  const entId = `${targetUserId}_${entitlementType}`;
  const entRef = db.collection('entitlements').doc(entId);

  const batch = db.batch();
  batch.set(entRef, {
    id: entId,
    userId: targetUserId,
    entitlementType,
    sourceProductSku: 'MANUAL_OVERRIDE',
    sourceCode: 'STAFF_GRANT',
    activationId: 'STAFF_ACTION',
    status: 'ACTIVE',
    grantedAt: now,
    expiresAt: null,
    grantedBy: `STAFF_${callerUid}`,
  });

  const userRef = db.collection('users').doc(targetUserId);
  const userUpdates: Record<string, unknown> = { updatedAt: now };
  if (entitlementType === 'COMMUNITY_ACCESS') userUpdates.communityAccess = true;
  if (entitlementType === 'SCHOOL_ACCESS') userUpdates.schoolAccess = true;
  batch.update(userRef, userUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'ENTITLEMENT_GRANTED',
    resourceType: 'entitlements',
    resourceId: entId,
    timestamp: now,
    metadata: { targetUserId, entitlementType, enforcedBy: 'SERVER_CLOUD_FUNCTION' },
  });

  await batch.commit();

  return { success: true, entitlementId: entId };
});

/**
 * Callable Function: Authoritative CMS Content Management
 * Replaces direct client setDoc on /cmsContent.
 * Verifies staff privilege, validates payload schema/size, and logs authoritative audit events.
 */
export const updateCmsSection = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('CONTENT_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to manage CMS content (requires SUPER_ADMIN, ADMIN, or CONTENT_MANAGER).'
    );
  }

  const { sectionKey, data: sectionData } = data;
  if (!sectionKey || typeof sectionKey !== 'string' || sectionKey.trim().length === 0 || sectionKey.length > 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid or missing sectionKey.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(sectionKey)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'sectionKey must contain only alphanumeric characters, underscores, and hyphens.'
    );
  }

  if (!sectionData || typeof sectionData !== 'object' || Array.isArray(sectionData)) {
    throw new functions.https.HttpsError('invalid-argument', 'CMS section payload must be an object.');
  }

  const payloadString = JSON.stringify(sectionData);
  if (payloadString.length > 100000) {
    throw new functions.https.HttpsError('invalid-argument', 'CMS section payload exceeds maximum allowed size (100KB).');
  }

  const now = new Date().toISOString();
  const cmsDocRef = db.collection('cmsContent').doc(sectionKey);

  const batch = db.batch();
  batch.set(
    cmsDocRef,
    {
      sectionKey,
      data: sectionData,
      updatedAt: now,
      updatedBy: callerUid,
    },
    { merge: true }
  );

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'CMS_CONTENT_UPDATED',
    resourceType: 'cmsContent',
    resourceId: sectionKey,
    timestamp: now,
    metadata: {
      sectionKey,
      keysUpdated: Object.keys(sectionData),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, sectionKey };
});

/**
 * Callable Function: Authoritative School Category Creation
 */
export const createSchoolCategory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to manage school categories (requires SUPER_ADMIN, ADMIN, or SCHOOL_MANAGER).'
    );
  }

  const { slug, title, description = {}, displayOrder = 0, isPublished = false } = data;
  if (!slug || typeof slug !== 'string' || !title || typeof title !== 'object' || !title.en) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Category requires a valid slug and at least an English title (title.en).'
    );
  }

  const now = new Date().toISOString();
  const categoryRef = db.collection('schoolCategories').doc();
  const categoryDoc = {
    id: categoryRef.id,
    slug: slug.trim().toLowerCase(),
    title,
    description: typeof description === 'object' ? description : {},
    displayOrder: Number(displayOrder) || 0,
    isPublished: Boolean(isPublished),
    createdBy: callerUid,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(categoryRef, categoryDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_CATEGORY_CREATED',
    resourceType: 'schoolCategories',
    resourceId: categoryRef.id,
    timestamp: now,
    metadata: {
      slug: categoryDoc.slug,
      isPublished: categoryDoc.isPublished,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, id: categoryRef.id };
});

/**
 * Callable Function: Authoritative School Category Update
 */
export const updateSchoolCategory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to update school categories.'
    );
  }

  const { categoryId, updates } = data;
  if (!categoryId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing categoryId or updates payload.');
  }

  const categoryRef = db.collection('schoolCategories').doc(categoryId);
  const categorySnap = await categoryRef.get();
  if (!categorySnap.exists) {
    throw new functions.https.HttpsError('not-found', `Category "${categoryId}" not found.`);
  }

  const allowedFields = ['title', 'description', 'slug', 'displayOrder', 'isPublished'];
  const sanitizedUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  const now = new Date().toISOString();
  sanitizedUpdates.updatedAt = now;

  const batch = db.batch();
  batch.update(categoryRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_CATEGORY_UPDATED',
    resourceType: 'schoolCategories',
    resourceId: categoryId,
    timestamp: now,
    metadata: {
      updatedFields: Object.keys(sanitizedUpdates),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, categoryId };
});

/**
 * Callable Function: Authoritative School Category Deletion
 */
export const deleteSchoolCategory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete school categories.');
  }

  const { categoryId } = data;
  if (!categoryId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid categoryId is required.');
  }

  const categoryRef = db.collection('schoolCategories').doc(categoryId);
  const categorySnap = await categoryRef.get();
  if (!categorySnap.exists) {
    throw new functions.https.HttpsError('not-found', `Category "${categoryId}" not found.`);
  }

  // Prevent orphaned courses: verify no courses are linked to this category
  const courseQuery = await db
    .collection('schoolCourses')
    .where('categoryId', '==', categoryId)
    .limit(1)
    .get();

  if (!courseQuery.empty) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Cannot delete category containing existing courses. Reassign or delete courses first.'
    );
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(categoryRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_CATEGORY_DELETED',
    resourceType: 'schoolCategories',
    resourceId: categoryId,
    timestamp: now,
    metadata: {
      categorySlug: categorySnap.data()?.slug,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, categoryId };
});

/**
 * Callable Function: Authoritative School Course Creation
 */
export const createSchoolCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to create courses.');
  }

  const {
    categoryId,
    slug,
    title,
    description = {},
    level = 'beginner',
    displayOrder = 0,
    isPublished = false,
    lessonsCount = 0,
    estimatedMinutes = 30,
  } = data;

  if (!categoryId || !slug || !title || !title.en) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Course requires categoryId, slug, and at least title.en.'
    );
  }

  const catSnap = await db.collection('schoolCategories').doc(categoryId).get();
  if (!catSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Category "${categoryId}" not found.`);
  }

  const now = new Date().toISOString();
  const courseRef = db.collection('schoolCourses').doc();
  const courseDoc = {
    id: courseRef.id,
    categoryId,
    slug: slug.trim().toLowerCase(),
    title,
    description: typeof description === 'object' ? description : {},
    level,
    displayOrder: Number(displayOrder) || 0,
    isPublished: Boolean(isPublished),
    lessonsCount: Number(lessonsCount) || 0,
    estimatedMinutes: Number(estimatedMinutes) || 30,
    createdBy: callerUid,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(courseRef, courseDoc);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_COURSE_CREATED',
    resourceType: 'schoolCourses',
    resourceId: courseRef.id,
    timestamp: now,
    metadata: {
      courseSlug: courseDoc.slug,
      categoryId,
      isPublished: courseDoc.isPublished,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, id: courseRef.id };
});

/**
 * Callable Function: Authoritative School Course Update
 */
export const updateSchoolCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to update courses.');
  }

  const { courseId, updates } = data;
  if (!courseId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing courseId or updates payload.');
  }

  const courseRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  const allowedFields = [
    'categoryId',
    'slug',
    'title',
    'description',
    'level',
    'displayOrder',
    'isPublished',
    'lessonsCount',
    'estimatedMinutes',
  ];

  const sanitizedUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  const now = new Date().toISOString();
  sanitizedUpdates.updatedAt = now;

  const batch = db.batch();
  batch.update(courseRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_COURSE_UPDATED',
    resourceType: 'schoolCourses',
    resourceId: courseId,
    timestamp: now,
    metadata: {
      updatedFields: Object.keys(sanitizedUpdates),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, courseId };
});

/**
 * Callable Function: Authoritative School Course Deletion
 */
export const deleteSchoolCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('SCHOOL_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete courses.');
  }

  const { courseId } = data;
  if (!courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid courseId is required.');
  }

  const courseRef = db.collection('schoolCourses').doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Course "${courseId}" not found.`);
  }

  // Check if certificates have been issued for this course
  const certQuery = await db
    .collection('certificates')
    .where('courseId', '==', courseId)
    .limit(1)
    .get();

  if (!certQuery.empty) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Cannot delete a course that has issued student certificates. Unpublish the course instead to preserve certification provenance.'
    );
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(courseRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'SCHOOL_COURSE_DELETED',
    resourceType: 'schoolCourses',
    resourceId: courseId,
    timestamp: now,
    metadata: {
      courseSlug: courseSnap.data()?.slug,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, courseId };
});

/**
 * Callable Function: Authoritative Community Announcement Update
 */
export const updateCommunityAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to update announcements (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).'
    );
  }

  const { announcementId, updates } = data;
  if (!announcementId || !updates || typeof updates !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid announcementId and updates object are required.');
  }

  const announcementRef = db.collection('communityAnnouncements').doc(announcementId);
  const announcementSnap = await announcementRef.get();
  if (!announcementSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Announcement "${announcementId}" not found.`);
  }

  const allowedFields = ['title', 'content', 'body', 'tags', 'isPinned', 'priority', 'status'];
  const sanitizedUpdates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      sanitizedUpdates[key] = val;
    }
  }

  const now = new Date().toISOString();
  sanitizedUpdates.updatedAt = now;

  const batch = db.batch();
  batch.update(announcementRef, sanitizedUpdates);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_ANNOUNCEMENT_UPDATED',
    resourceType: 'communityAnnouncements',
    resourceId: announcementId,
    timestamp: now,
    metadata: {
      updatedFields: Object.keys(sanitizedUpdates),
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, announcementId };
});

/**
 * Callable Function: Authoritative Community Announcement Deletion
 */
export const deleteCommunityAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('users').doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerSnap.data()!;
  if (callerData.status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
  }

  const callerRoles: string[] = callerData.roles || [];
  const callerEmail = context.auth.token.email || '';
  const isEmailVerified = context.auth.token.email_verified === true;
  const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);

  const isAuthorized =
    isCallerSuperAdmin ||
    callerRoles.includes('ADMIN') ||
    callerRoles.includes('COMMUNITY_MANAGER');

  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Caller lacks authority to delete announcements.'
    );
  }

  const { announcementId } = data;
  if (!announcementId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid announcementId is required.');
  }

  const announcementRef = db.collection('communityAnnouncements').doc(announcementId);
  const announcementSnap = await announcementRef.get();
  if (!announcementSnap.exists) {
    throw new functions.https.HttpsError('not-found', `Announcement "${announcementId}" not found.`);
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  batch.delete(announcementRef);

  const auditRef = db.collection('auditLogs').doc();
  batch.set(auditRef, {
    id: auditRef.id,
    actorUserId: callerUid,
    actorEmail: callerEmail,
    actorRoles: callerRoles,
    action: 'COMMUNITY_ANNOUNCEMENT_DELETED',
    resourceType: 'communityAnnouncements',
    resourceId: announcementId,
    timestamp: now,
    metadata: {
      title: announcementSnap.data()?.title,
      enforcedBy: 'SERVER_AUTHORITY',
    },
  });

  await batch.commit();

  return { success: true, announcementId };
});

