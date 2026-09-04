"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommunityAnnouncement = exports.updateCommunityAnnouncement = exports.deleteSchoolCourse = exports.updateSchoolCourse = exports.createSchoolCourse = exports.deleteSchoolCategory = exports.updateSchoolCategory = exports.createSchoolCategory = exports.updateCmsSection = exports.grantEntitlement = exports.updateUserStatus = exports.resolveCommunityReport = exports.moderateCommunityPost = exports.createCommunityAnnouncement = exports.issueCertificate = exports.togglePostLike = exports.activateContainerCode = exports.assignUserRoles = exports.initializeBootstrapGovernance = exports.CANONICAL_APP_ROLES = void 0;
exports.isBootstrapModeAuthorized = isBootstrapModeAuthorized;
exports.checkIsSuperAdmin = checkIsSuperAdmin;
exports.writeAuthoritativeAuditLog = writeAuthoritativeAuditLog;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// [BOOTSTRAP ONLY] Temporary emergency bootstrap email for initial cloud project provisioning.
// Permanent governance strictly relies on authoritative Firestore users/{uid}.roles or custom claims.
const BOOTSTRAP_SUPERADMIN_EMAIL = 'bkzboukhbiza@gmail.com';
/**
 * Canonical Application Roles
 */
exports.CANONICAL_APP_ROLES = [
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
];
/**
 * Bootstrap Lifecycle Helper
 *
 * 1. Initial State: No active user profile in `users` holds the `SUPER_ADMIN` role, and
 *    `_system/governance` does not indicate bootstrap completion.
 *    In this state, the configured BOOTSTRAP_SUPERADMIN_EMAIL with a verified email is permitted
 *    to perform initial provisioning and establish the initial permanent SUPER_ADMIN account.
 *
 * 2. Permanent State: Once an active user profile possesses the SUPER_ADMIN role (or bootstrapCompleted
 *    is marked true in `_system/governance`), the bootstrap shortcut is PERMANENTLY DISABLED.
 *    Any subsequent authentication by the bootstrap email alone will NOT grant administrative authority;
 *    authorization strictly requires authoritative Firestore user roles (`users/{uid}.roles`) or custom claims.
 */
async function isBootstrapModeAuthorized(callerEmail, isEmailVerified) {
    if (!callerEmail || !isEmailVerified)
        return false;
    if (callerEmail.toLowerCase() !== BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase())
        return false;
    try {
        const govSnap = await db.collection('_system').doc('governance').get();
        if (govSnap.exists && govSnap.data()?.bootstrapCompleted === true) {
            return false; // Bootstrap path permanently closed
        }
    }
    catch {
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
async function checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified) {
    if (callerRoles.includes('SUPER_ADMIN')) {
        return true;
    }
    return await isBootstrapModeAuthorized(callerEmail, isEmailVerified);
}
async function writeAuthoritativeAuditLog(firestore, params, transaction) {
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
    }
    else {
        await auditDocRef.set(auditData);
    }
    return auditDocRef.id;
}
/**
 * Callable Function: Initial System Bootstrap
 * Used once to establish the initial permanent SUPER_ADMIN and permanently seal bootstrap mode.
 */
exports.initializeBootstrapGovernance = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const canBootstrap = await isBootstrapModeAuthorized(callerEmail, isEmailVerified);
    if (!canBootstrap) {
        throw new functions.https.HttpsError('permission-denied', 'Bootstrap initialization is only available during uninitialized system deployment.');
    }
    const now = new Date().toISOString();
    const userDocRef = db.collection('users').doc(callerUid);
    const govDocRef = db.collection('_system').doc('governance');
    const batch = db.batch();
    batch.set(userDocRef, {
        roles: ['SUPER_ADMIN'],
        status: 'active',
        updatedAt: now,
    }, { merge: true });
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
exports.assignUserRoles = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The caller must be authenticated to invoke role governance.');
    }
    const callerUid = context.auth.uid;
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const { targetUid, newRoles } = data;
    if (!targetUid || !Array.isArray(newRoles) || newRoles.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid targetUid or newRoles parameters. User must retain at least one role.');
    }
    // Validate every requested role against the canonical AppRole list
    for (const r of newRoles) {
        if (!exports.CANONICAL_APP_ROLES.includes(r)) {
            throw new functions.https.HttpsError('invalid-argument', `Role "${r}" is not a recognized canonical application role.`);
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
    const callerRoles = callerData?.roles || [];
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isCallerAdmin = isCallerSuperAdmin || callerRoles.includes('ADMIN');
    if (!isCallerAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Caller does not possess administrative authority (CUSTOMER cannot manage roles).');
    }
    // 2. Fetch target user profile
    const targetDocRef = db.collection('users').doc(targetUid);
    const targetSnap = await targetDocRef.get();
    if (!targetSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Target user profile does not exist.');
    }
    const targetData = targetSnap.data();
    const currentTargetRoles = targetData?.roles || [];
    // 3. Anti-escalation check: Only SUPER_ADMIN can alter SUPER_ADMIN or grant SUPER_ADMIN
    const targetIsSuperAdmin = currentTargetRoles.includes('SUPER_ADMIN');
    const grantingSuperAdmin = newRoles.includes('SUPER_ADMIN');
    if ((targetIsSuperAdmin || grantingSuperAdmin) && !isCallerSuperAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Privilege Escalation Guard: Only root SUPER_ADMIN may assign, promote, or alter the SUPER_ADMIN role.');
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
 * Callable Function: Authoritative Product Code Activation & Entitlement Granting
 * CONCURRENCY-SAFE ATOMIC TRANSACTION:
 * 1. Locates product code inside transaction
 * 2. Verifies code is unactivated
 * 3. Marks code activated
 * 4. Creates activation record
 * 5. Creates authoritative entitlements
 * 6. Updates user cache flags
 * 7. Writes authoritative activation audit log
 */
exports.activateContainerCode = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required to activate a product container code.');
    }
    const callerUid = context.auth.uid;
    const callerEmail = context.auth.token.email || '';
    const callerSnap = await db.collection('users').doc(callerUid).get();
    const callerRoles = callerSnap.data()?.roles || ['CUSTOMER'];
    const rawCode = (data.code || '').trim().toUpperCase();
    if (!rawCode) {
        throw new functions.https.HttpsError('invalid-argument', 'Product verification code is required.');
    }
    // Pre-locate product code document reference (supports either field lookup or docId lookup)
    let codeDocRef = db.collection('productCodes').doc(rawCode);
    const directSnap = await codeDocRef.get();
    if (!directSnap.exists) {
        const codeQuery = await db
            .collection('productCodes')
            .where('code', '==', rawCode)
            .limit(1)
            .get();
        if (codeQuery.empty) {
            throw new functions.https.HttpsError('not-found', `Product container code "${rawCode}" is not registered in the VIREXON serialization catalog.`);
        }
        codeDocRef = codeQuery.docs[0].ref;
    }
    // Concurrency-safe atomic transaction
    return await db.runTransaction(async (transaction) => {
        const codeSnap = await transaction.get(codeDocRef);
        if (!codeSnap.exists) {
            throw new functions.https.HttpsError('not-found', `Product container code "${rawCode}" not found in serialization catalog.`);
        }
        const codeData = codeSnap.data();
        if (codeData.isActivated) {
            throw new functions.https.HttpsError('already-exists', `This product container code was already activated on ${codeData.activatedAt || 'an earlier date'}.`);
        }
        const now = new Date().toISOString();
        const productSku = codeData.productSku || 'VIR-CONTAINER-DEFAULT';
        // 1. Mark code as activated
        transaction.update(codeDocRef, {
            isActivated: true,
            activatedByUserId: callerUid,
            activatedAt: now,
            updatedAt: now,
        });
        // 2. Create activation record
        const activationDocRef = db.collection('activations').doc();
        const entitlementsToGrant = ['COMMUNITY_ACCESS', 'SCHOOL_ACCESS', 'PHASE_TRAJECTORY'];
        transaction.set(activationDocRef, {
            id: activationDocRef.id,
            code: rawCode,
            userId: callerUid,
            productSku,
            activatedAt: now,
            entitlementsGranted: entitlementsToGrant,
        });
        // 3. Create Authoritative Entitlement records (keyed deterministically: userId_type)
        for (const entType of entitlementsToGrant) {
            const entDocRef = db.collection('entitlements').doc(`${callerUid}_${entType}`);
            transaction.set(entDocRef, {
                id: `${callerUid}_${entType}`,
                userId: callerUid,
                entitlementType: entType,
                sourceProductSku: productSku,
                sourceCode: rawCode,
                activationId: activationDocRef.id,
                status: 'ACTIVE',
                grantedAt: now,
                expiresAt: null,
                grantedBy: 'PRODUCT_ACTIVATION',
            });
        }
        // 4. Update user profile quick access flags (CACHE/UI ONLY hints)
        const userDocRef = db.collection('users').doc(callerUid);
        transaction.update(userDocRef, {
            communityAccess: true,
            schoolAccess: true,
            updatedAt: now,
        });
        // 5. Authoritative activation audit log
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
                code: rawCode,
                productSku,
                activationId: activationDocRef.id,
                enforcedBy: 'SERVER_TRANSACTION',
            },
        });
        return {
            success: true,
            activationId: activationDocRef.id,
            entitlements: entitlementsToGrant,
        };
    });
});
/**
 * Callable Function: Concurrency-Safe Community Post Liking
 * Deterministic single-like record at communityPostLikes/{postId_userId}.
 * Aggregate likesCount on communityPosts is managed exclusively by this server-side transaction.
 */
exports.togglePostLike = functions.https.onCall(async (data, context) => {
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
        const postData = postSnap.data();
        const currentLikes = typeof postData.likesCount === 'number' ? postData.likesCount : 0;
        const likeSnap = await transaction.get(likeDocRef);
        const now = new Date().toISOString();
        if (likeSnap.exists) {
            // User already liked -> unlike
            transaction.delete(likeDocRef);
            const newCount = Math.max(0, currentLikes - 1);
            transaction.update(postDocRef, { likesCount: newCount, updatedAt: now });
            return { liked: false, likesCount: newCount };
        }
        else {
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
exports.issueCertificate = functions.https.onCall(async (data, context) => {
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
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    if (!isCallerSuperAdmin && !callerRoles.includes('SCHOOL_MANAGER') && !callerRoles.includes('ADMIN')) {
        throw new functions.https.HttpsError('permission-denied', 'Only School Managers or Administrators may issue certificates.');
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
        throw new functions.https.HttpsError('already-exists', `A valid certificate has already been issued to student "${targetUserId}" for course "${courseId}".`);
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
exports.createCommunityAnnouncement = functions.https.onCall(async (data, context) => {
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
    const callerRoles = callerData?.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('COMMUNITY_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to create announcements (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).');
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
exports.moderateCommunityPost = functions.https.onCall(async (data, context) => {
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
    const callerRoles = callerData?.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('COMMUNITY_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to moderate posts (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).');
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
    const existingPost = postSnap.data();
    const now = new Date().toISOString();
    const updates = {
        updatedAt: now,
        moderatedBy: callerUid,
        moderatedAt: now,
    };
    if (newStatus)
        updates.status = newStatus;
    if (typeof isLocked === 'boolean')
        updates.isLocked = isLocked;
    if (typeof isPinned === 'boolean')
        updates.isPinned = isPinned;
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
exports.resolveCommunityReport = functions.https.onCall(async (data, context) => {
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
    const callerRoles = callerData?.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('COMMUNITY_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to resolve community reports.');
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
    const existingReport = reportSnap.data();
    const now = new Date().toISOString();
    const updates = {
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
exports.updateUserStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
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
    const targetData = targetSnap.data();
    const targetRoles = targetData.roles || [];
    if (targetRoles.includes('SUPER_ADMIN') && !isCallerSuperAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Privilege boundary: Only a SUPER_ADMIN can modify the status of a SUPER_ADMIN account.');
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
exports.grantEntitlement = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
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
    const userUpdates = { updatedAt: now };
    if (entitlementType === 'COMMUNITY_ACCESS')
        userUpdates.communityAccess = true;
    if (entitlementType === 'SCHOOL_ACCESS')
        userUpdates.schoolAccess = true;
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
exports.updateCmsSection = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('CONTENT_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to manage CMS content (requires SUPER_ADMIN, ADMIN, or CONTENT_MANAGER).');
    }
    const { sectionKey, data: sectionData } = data;
    if (!sectionKey || typeof sectionKey !== 'string' || sectionKey.trim().length === 0 || sectionKey.length > 100) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid or missing sectionKey.');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(sectionKey)) {
        throw new functions.https.HttpsError('invalid-argument', 'sectionKey must contain only alphanumeric characters, underscores, and hyphens.');
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
    batch.set(cmsDocRef, {
        sectionKey,
        data: sectionData,
        updatedAt: now,
        updatedBy: callerUid,
    }, { merge: true });
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
exports.createSchoolCategory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('SCHOOL_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to manage school categories (requires SUPER_ADMIN, ADMIN, or SCHOOL_MANAGER).');
    }
    const { slug, title, description = {}, displayOrder = 0, isPublished = false } = data;
    if (!slug || typeof slug !== 'string' || !title || typeof title !== 'object' || !title.en) {
        throw new functions.https.HttpsError('invalid-argument', 'Category requires a valid slug and at least an English title (title.en).');
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
exports.updateSchoolCategory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('SCHOOL_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to update school categories.');
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
    const sanitizedUpdates = {};
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
exports.deleteSchoolCategory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
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
        throw new functions.https.HttpsError('failed-precondition', 'Cannot delete category containing existing courses. Reassign or delete courses first.');
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
exports.createSchoolCourse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('SCHOOL_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to create courses.');
    }
    const { categoryId, slug, title, description = {}, level = 'beginner', displayOrder = 0, isPublished = false, lessonsCount = 0, estimatedMinutes = 30, } = data;
    if (!categoryId || !slug || !title || !title.en) {
        throw new functions.https.HttpsError('invalid-argument', 'Course requires categoryId, slug, and at least title.en.');
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
exports.updateSchoolCourse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
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
    const sanitizedUpdates = {};
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
exports.deleteSchoolCourse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
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
        throw new functions.https.HttpsError('failed-precondition', 'Cannot delete a course that has issued student certificates. Unpublish the course instead to preserve certification provenance.');
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
exports.updateCommunityAnnouncement = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('COMMUNITY_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to update announcements (requires SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER).');
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
    const sanitizedUpdates = {};
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
exports.deleteCommunityAnnouncement = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
    }
    const callerUid = context.auth.uid;
    const callerSnap = await db.collection('users').doc(callerUid).get();
    if (!callerSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Caller profile not found.');
    }
    const callerData = callerSnap.data();
    if (callerData.status !== 'active') {
        throw new functions.https.HttpsError('permission-denied', 'Caller account is not active.');
    }
    const callerRoles = callerData.roles || [];
    const callerEmail = context.auth.token.email || '';
    const isEmailVerified = context.auth.token.email_verified === true;
    const isCallerSuperAdmin = await checkIsSuperAdmin(callerUid, callerRoles, callerEmail, isEmailVerified);
    const isAuthorized = isCallerSuperAdmin ||
        callerRoles.includes('ADMIN') ||
        callerRoles.includes('COMMUNITY_MANAGER');
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Caller lacks authority to delete announcements.');
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
//# sourceMappingURL=index.js.map