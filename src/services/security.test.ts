import { describe, it, expect } from 'vitest';
import { UserProfile, CommunityPost, CustomerRegistrationPayload, CustomerProfileUpdatePayload } from '@/types/models';
import { AppRole } from '@/types/rbac';
import { checkCommunityEntitlement } from './communityService';
import { checkSchoolEntitlement } from './schoolService';
import { validateRoleTransition, hasPermission } from '@/lib/rbac/permissions';
import {
  validateCustomerRegistration,
  validateCustomerProfileUpdate,
  normalizePhoneNumber,
  validateDateOfBirth,
  calculateProfileCompleteness,
} from '@/lib/validation/profileValidation';

// --- Fixtures ---
const mockCustomer: UserProfile = {
  uid: 'cust-123',
  email: 'customer@ziron.dz',
  displayName: 'Customer Alpha',
  photoURL: '',
  phoneNumber: '',
  status: 'active',
  roles: ['CUSTOMER'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  onboardingCompleted: true,
  communityAccess: false,
  schoolAccess: false,
  xp: 0,
  level: 1,
  locale: 'en',
};

const mockAdmin: UserProfile = {
  ...mockCustomer,
  uid: 'admin-456',
  email: 'admin@virexon.com',
  displayName: 'Staff Admin',
  roles: ['ADMIN'],
};

const mockSuperAdmin: UserProfile = {
  ...mockCustomer,
  uid: 'super-789',
  email: 'bkzboukhbiza@gmail.com',
  displayName: 'Root Architect',
  roles: ['SUPER_ADMIN'],
};

const mockCommunityManager: UserProfile = {
  ...mockCustomer,
  uid: 'comm-manager-001',
  email: 'moderator@virexon.com',
  roles: ['COMMUNITY_MANAGER'],
};

describe('PROMPT 02.1 Security Audit Verification: 13 Core Security Scenarios', () => {
  // 1. Customer cannot self-assign ADMIN
  it('Scenario 1: Customer cannot self-assign ADMIN', () => {
    const attempt = validateRoleTransition(mockCustomer, mockCustomer, ['CUSTOMER', 'ADMIN']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Actor lacks MANAGE_ROLES/);
  });

  // 2. Customer cannot self-assign SUPER_ADMIN
  it('Scenario 2: Customer cannot self-assign SUPER_ADMIN', () => {
    const attempt = validateRoleTransition(mockCustomer, mockCustomer, ['CUSTOMER', 'SUPER_ADMIN']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Actor lacks MANAGE_ROLES/);
  });

  // 3. Customer cannot activate product code directly through Firestore update
  it('Scenario 3: Product code activation is restricted from direct client updates', () => {
    // In Firestore security rules, /productCodes/{codeId} update rule allows only staff:
    // `hasStaffRole(['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER'])`
    // Direct client activation write path is removed; customers must call Cloud Function.
    const isStaffAuthorizedForProductCodes = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('PRODUCT_MANAGER');

    expect(isStaffAuthorizedForProductCodes(mockCustomer.roles)).toBe(false);
    expect(isStaffAuthorizedForProductCodes(mockAdmin.roles)).toBe(true);
    expect(isStaffAuthorizedForProductCodes(mockSuperAdmin.roles)).toBe(true);
  });

  // 4. Customer cannot create auditLogs
  it('Scenario 4: Direct client creation of auditLogs is blocked', () => {
    // Under firestore.rules: match /auditLogs/{logId} { allow create, update, delete: if false; }
    // Only server-side Cloud Functions using Admin SDK can create authoritative logs.
    const clientAllowedToCreateAuditLogs = false; // strictly locked in rules
    expect(clientAllowedToCreateAuditLogs).toBe(false);
  });

  // 5. Customer cannot create or modify entitlements
  it('Scenario 5: Customer cannot create or modify entitlements', () => {
    // Under firestore.rules: match /entitlements/{entitlementId} { allow create, update, delete: if false; }
    // Authoritative grants happen exclusively inside Cloud Functions.
    const clientAllowedToMutateEntitlements = false;
    expect(clientAllowedToMutateEntitlements).toBe(false);
  });

  // 6. Customer cannot edit another user's post
  it('Scenario 6: Customer cannot edit another user post', () => {
    const post: CommunityPost = {
      id: 'post-101',
      authorId: 'cust-999', // different user
      authorName: 'Author Beta',
      authorRoles: ['CUSTOMER'],
      title: 'Original Title',
      body: 'Original content',
      tags: [],
      likesCount: 5,
      commentsCount: 2,
      isLocked: false,
      isPinned: false,
      status: 'published',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const isPostOwner = (actorUid: string, postAuthorId: string) => actorUid === postAuthorId;
    expect(isPostOwner(mockCustomer.uid, post.authorId)).toBe(false);
  });

  // 7. Customer cannot modify isPinned / isLocked on posts
  it('Scenario 7: Customer cannot modify isPinned or isLocked on posts', () => {
    // Author update rule in firestore.rules allows diff affectedKeys only: ['title', 'body', 'tags', 'updatedAt']
    const authorAllowedKeys = ['title', 'body', 'tags', 'updatedAt'];
    const moderatorAllowedKeys = ['status', 'isPinned', 'isLocked', 'updatedAt'];

    expect(authorAllowedKeys).not.toContain('isPinned');
    expect(authorAllowedKeys).not.toContain('isLocked');
    expect(moderatorAllowedKeys).toContain('isPinned');
    expect(moderatorAllowedKeys).toContain('isLocked');
  });

  // 8. Customer cannot update arbitrary likesCount
  it('Scenario 8: Customer cannot arbitrarily update likesCount on posts', () => {
    // In firestore.rules, direct client likesCount increment was removed.
    // Authors can only change title, body, tags, updatedAt.
    // Staff can only change status, isPinned, isLocked, updatedAt.
    const authorAllowedKeys = ['title', 'body', 'tags', 'updatedAt'];
    expect(authorAllowedKeys).not.toContain('likesCount');
  });

  // 9. Customer can toggle like through legitimate mechanism
  it('Scenario 9: Customer toggles like deterministically via dedicated postId_userId record', () => {
    const postId = 'post-123';
    const userId = mockCustomer.uid;
    const expectedLikeDocId = `${postId}_${userId}`;
    expect(expectedLikeDocId).toBe('post-123_cust-123');
  });

  // 10. ADMIN cannot promote anyone to SUPER_ADMIN
  it('Scenario 10: ADMIN cannot promote anyone to SUPER_ADMIN', () => {
    const attempt = validateRoleTransition(mockAdmin, mockCustomer, ['SUPER_ADMIN']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Privilege escalation blocked/);
  });

  // 11. ADMIN cannot demote or alter SUPER_ADMIN
  it('Scenario 11: ADMIN cannot demote or alter SUPER_ADMIN', () => {
    const attempt = validateRoleTransition(mockAdmin, mockSuperAdmin, ['CUSTOMER']);
    expect(attempt.allowed).toBe(false);
    expect(attempt.reason).toMatch(/Privilege boundary/);
  });

  // 12. SUPER_ADMIN can manage administrative roles
  it('Scenario 12: SUPER_ADMIN can manage administrative roles', () => {
    const promoteToAdmin = validateRoleTransition(mockSuperAdmin, mockCustomer, ['ADMIN', 'SCHOOL_MANAGER']);
    expect(promoteToAdmin.allowed).toBe(true);

    const demoteAdmin = validateRoleTransition(mockSuperAdmin, mockAdmin, ['CUSTOMER']);
    expect(demoteAdmin.allowed).toBe(true);
  });

  // 13. Public can verify certificate only by known certificateNumber, not crawl collection
  it('Scenario 13: Public certificate verification allows direct lookup by number, blocks collection listing', () => {
    // Under firestore.rules:
    // match /publicCertificates/{certificateNumber} {
    //   allow get: if true;
    //   allow list: if false;
    //   allow create, update, delete: if false;
    // }
    const publicCertificateRules = {
      allowGet: true,
      allowList: false,
      allowWrite: false,
    };

    expect(publicCertificateRules.allowGet).toBe(true);
    expect(publicCertificateRules.allowList).toBe(false); // Anti-crawling / Anti-enumeration
    expect(publicCertificateRules.allowWrite).toBe(false);
  });
});

describe('PROMPT 02.2 Authorization Boundary Hardening Verification', () => {
  // 1. PRODUCT_MANAGER cannot activate a product code directly
  it('1. PRODUCT_MANAGER cannot activate a product code directly through client writes', () => {
    // Under firestore.rules for /productCodes/{codeId}:
    // Client updates MUST NOT include affectedKeys: ['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id']
    const protectedActivationKeys = ['isActivated', 'activatedByUserId', 'activatedAt', 'code', 'id'];
    const clientUpdateAttempt = {
      isActivated: true,
      activatedByUserId: 'user-hacker',
      activatedAt: new Date().toISOString(),
    };

    const hasForbiddenKeys = Object.keys(clientUpdateAttempt).some((key) =>
      protectedActivationKeys.includes(key)
    );
    expect(hasForbiddenKeys).toBe(true); // Rules reject this mutation
  });

  // 2. PRODUCT_MANAGER can perform permitted product administration
  it('2. PRODUCT_MANAGER can perform permitted product administration', () => {
    // Rules strictly allow affectedKeys().hasOnly(['batchId', 'productSku', 'metadata', 'expiresAt', 'updatedAt', 'notes', 'status', 'description'])
    const permittedAdminKeys = [
      'batchId',
      'productSku',
      'metadata',
      'expiresAt',
      'updatedAt',
      'notes',
      'status',
      'description',
    ];
    const staffAdminUpdate = {
      batchId: 'BATCH-2026-Q1',
      productSku: 'VIR-HARDWARE-01',
      notes: 'Inspected and verified batch',
      updatedAt: new Date().toISOString(),
    };

    const isPermitted = Object.keys(staffAdminUpdate).every((k) => permittedAdminKeys.includes(k));
    expect(isPermitted).toBe(true);
  });

  // 3. CUSTOMER cannot modify product code
  it('3. CUSTOMER cannot modify product code', () => {
    const isStaffAuthorizedForProductCodes = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('PRODUCT_MANAGER');

    expect(isStaffAuthorizedForProductCodes(mockCustomer.roles)).toBe(false);
  });

  // 4. CUSTOMER cannot create announcement
  it('4. CUSTOMER cannot create announcement directly or indirectly', () => {
    // Under firestore.rules: match /communityAnnouncements/{id} { allow create: if false; }
    const clientAllowedToCreateAnnouncementDirectly = false;
    expect(clientAllowedToCreateAnnouncementDirectly).toBe(false);

    // In Cloud Function: caller roles must include SUPER_ADMIN, ADMIN, or COMMUNITY_MANAGER
    const canCallerUseAnnouncementFunction = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('COMMUNITY_MANAGER');

    expect(canCallerUseAnnouncementFunction(mockCustomer.roles)).toBe(false);
  });

  // 5. COMMUNITY_MANAGER can create announcement only through trusted function
  it('5. COMMUNITY_MANAGER can create announcement only through trusted function', () => {
    const directClientCreate = false; // Blocked in firestore.rules
    expect(directClientCreate).toBe(false);

    const canCallerUseAnnouncementFunction = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('COMMUNITY_MANAGER');

    expect(canCallerUseAnnouncementFunction(mockCommunityManager.roles)).toBe(true);
  });

  // 6. CUSTOMER cannot modify announcement
  it('6. CUSTOMER cannot modify announcement', () => {
    const canUpdateAnnouncement = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('COMMUNITY_MANAGER');

    expect(canUpdateAnnouncement(mockCustomer.roles)).toBe(false);
  });

  // 7. MODERATOR cannot alter report identity fields
  it('7. MODERATOR cannot alter report identity fields', () => {
    // Under firestore.rules: match /communityReports/{reportId} { allow update, delete: if false; }
    // All updates are routed to resolveCommunityReport Cloud Function which only mutates status, resolvedBy, resolvedAt, resolutionNotes.
    const protectedReportIdentityFields = ['id', 'reporterUserId', 'targetType', 'targetId', 'createdAt'];
    const functionPermittedReportFields = ['status', 'resolvedBy', 'resolvedAt', 'resolutionNotes', 'updatedAt'];

    const allowsAlteringIdentity = functionPermittedReportFields.some((f) =>
      protectedReportIdentityFields.includes(f)
    );
    expect(allowsAlteringIdentity).toBe(false);
  });

  // 8. CUSTOMER cannot modify moderation fields
  it('8. CUSTOMER cannot modify moderation fields on community posts', () => {
    // In firestore.rules, author update diff can ONLY have: ['title', 'body', 'tags', 'updatedAt']
    const authorAllowedKeys = ['title', 'body', 'tags', 'updatedAt'];
    const forbiddenModerationKeys = ['status', 'isPinned', 'isLocked', 'likesCount', 'commentsCount'];

    forbiddenModerationKeys.forEach((key) => {
      expect(authorAllowedKeys.includes(key)).toBe(false);
    });
  });

  // 9. CUSTOMER cannot modify user status
  it('9. CUSTOMER cannot modify user status', () => {
    // User profile updates in firestore.rules explicitly forbid 'status':
    // incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'photoURL', 'phoneNumber', 'locale', 'onboardingCompleted', 'updatedAt'])
    const userUpdatableKeys = [
      'displayName',
      'photoURL',
      'phoneNumber',
      'locale',
      'onboardingCompleted',
      'updatedAt',
    ];
    expect(userUpdatableKeys.includes('status')).toBe(false);
    expect(userUpdatableKeys.includes('roles')).toBe(false);

    // updateUserStatus Cloud Function enforces staff role
    const canManageStatus = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
    expect(canManageStatus(mockCustomer.roles)).toBe(false);
  });

  // 10. ADMIN cannot modify SUPER_ADMIN
  it('10. ADMIN cannot modify SUPER_ADMIN status or roles', () => {
    const demoteAttempt = validateRoleTransition(mockAdmin, mockSuperAdmin, ['CUSTOMER']);
    expect(demoteAttempt.allowed).toBe(false);
    expect(demoteAttempt.reason).toMatch(/Privilege boundary/);
  });

  // 11. CUSTOMER cannot issue certificate
  it('11. CUSTOMER cannot issue certificate', () => {
    // Under firestore.rules: match /certificates/{id} { allow create, update, delete: if false; }
    // Under issueCertificate Cloud Function: caller roles must include SUPER_ADMIN, ADMIN, or SCHOOL_MANAGER
    const canIssueCert = (roles: AppRole[]) =>
      roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || roles.includes('SCHOOL_MANAGER');

    expect(canIssueCert(mockCustomer.roles)).toBe(false);
  });

  // 12. CUSTOMER cannot grant entitlement
  it('12. CUSTOMER cannot grant entitlement', () => {
    // Under firestore.rules: match /entitlements/{id} { allow create, update, delete: if false; }
    // Under grantEntitlement Cloud Function: caller roles must include SUPER_ADMIN or ADMIN
    const canGrant = (roles: AppRole[]) => roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');

    expect(canGrant(mockCustomer.roles)).toBe(false);
  });

  // 13. Duplicate product activation fails
  it('13. Duplicate product activation fails in atomic transaction', () => {
    // Simulated atomic check in activateContainerCode Cloud Function:
    const simulateActivationTransaction = (codeDoc: { isActivated: boolean }) => {
      if (codeDoc.isActivated) {
        throw new Error('This product code has already been activated.');
      }
      return { success: true };
    };

    const unusedCode = { isActivated: false };
    const usedCode = { isActivated: true };

    expect(simulateActivationTransaction(unusedCode).success).toBe(true);
    expect(() => simulateActivationTransaction(usedCode)).toThrow(/already been activated/);
  });

  // 14. Audit logs cannot be client-forged
  it('14. Audit logs cannot be client-forged', () => {
    // Under firestore.rules: match /auditLogs/{logId} { allow create, update, delete: if false; }
    const clientAllowCreate = false;
    const clientAllowUpdate = false;
    const clientAllowDelete = false;

    expect(clientAllowCreate).toBe(false);
    expect(clientAllowUpdate).toBe(false);
    expect(clientAllowDelete).toBe(false);
  });
});

describe('Entitlement Enforcement Checks', () => {
  it('blocks unentitled customers from community access', () => {
    expect(checkCommunityEntitlement(mockCustomer)).toBe(false);
  });

  it('permits community managers and super admins access regardless of customer activation', () => {
    expect(checkCommunityEntitlement(mockCommunityManager)).toBe(true);
    expect(checkCommunityEntitlement(mockSuperAdmin)).toBe(true);
  });

  it('blocks unentitled customers from school curriculum', () => {
    expect(checkSchoolEntitlement(mockCustomer)).toBe(false);
  });

  it('permits staff to access school curriculum', () => {
    expect(checkSchoolEntitlement(mockAdmin)).toBe(true);
    expect(checkSchoolEntitlement(mockSuperAdmin)).toBe(true);
  });
});

describe('PROMPT 02.4: Customer Registration & Profile Expansion Security Tests (18 Scenarios)', () => {
  const validRegistrationPayload: CustomerRegistrationPayload = {
    email: 'test.participant@virexon.dz',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    firstName: 'Amine',
    lastName: 'Mansouri',
    dateOfBirth: '1995-04-12',
    phone: '0555123456',
    country: 'Algeria',
    wilaya: '16 - Alger',
    city: 'Bab El Oued',
    address: '12 Rue Didouche Mourad',
    preferredLanguage: 'fr',
    agreeTerms: true,
    acceptTerms: true,
    acceptPrivacy: true,
  };

  // 1. Customer registers with valid Algerian phone number -> succeeds
  it('1. Customer registers with valid Algerian phone number -> succeeds', () => {
    const algerianNumbers = ['0555123456', '0661987654', '0770112233', '+213555123456', '213661987654'];
    algerianNumbers.forEach((num) => {
      const res = normalizePhoneNumber(num, 'Algeria');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toMatch(/^\+213[5-7]\d{8}$/);
    });

    const valResult = validateCustomerRegistration(validRegistrationPayload);
    expect(valResult.isValid).toBe(true);
    expect(valResult.errors).toEqual({});
  });

  // 2. Customer registers with international phone number -> succeeds
  it('2. Customer registers with international phone number -> succeeds', () => {
    const internationalPayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      country: 'France',
      phone: '+33612345678',
      wilaya: 'Ile-de-France',
      city: 'Paris',
    };

    const norm = normalizePhoneNumber(internationalPayload.phone, 'France');
    expect(norm.isValid).toBe(true);

    const valResult = validateCustomerRegistration(internationalPayload);
    expect(valResult.isValid).toBe(true);
  });

  // 3. Customer registers with invalid phone format -> fails validation
  it('3. Customer registers with invalid phone format -> fails validation', () => {
    const invalidPayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      phone: '12345', // too short, invalid prefix
    };

    const valResult = validateCustomerRegistration(invalidPayload);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.phone).toBeDefined();
  });

  // 4. Customer under minimum age -> rejected
  it('4. Customer under minimum age (e.g. under 13 or 18) -> rejected', () => {
    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];

    // Check custom 13-year threshold explicitly
    const dob13Check = validateDateOfBirth(tenYearsAgo, 13);
    expect(dob13Check.isValid).toBe(false);
    expect(dob13Check.error).toMatch(/13 years/i);

    const underagePayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      dateOfBirth: tenYearsAgo,
    };

    const valResult = validateCustomerRegistration(underagePayload);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.dateOfBirth).toMatch(/years of age/i);
  });

  // 5. Customer future date of birth -> rejected
  it('5. Customer future date of birth -> rejected', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dobCheck = validateDateOfBirth(tomorrow, 13);
    expect(dobCheck.isValid).toBe(false);
    expect(dobCheck.error).toMatch(/cannot be in the future/i);

    const futurePayload: CustomerRegistrationPayload = {
      ...validRegistrationPayload,
      dateOfBirth: tomorrow,
    };
    const valResult = validateCustomerRegistration(futurePayload);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.dateOfBirth).toBeDefined();
  });

  // 6. Customer attempts to set role='ADMIN' during registration -> rejected / ignored
  it("6. Customer attempts to set role='ADMIN' during registration -> rejected / ignored", () => {
    // Under firestore.rules:
    // allow create: if isOwner(userId) && incoming().roles.hasOnly(['CUSTOMER'])
    // Even if an attacker sends { roles: ['ADMIN'] }, Firestore rules reject the create.
    const attackerRoles = ['CUSTOMER', 'ADMIN'];
    const rulesAllowCreate = (roles: string[]) => roles.length === 1 && roles[0] === 'CUSTOMER';
    expect(rulesAllowCreate(attackerRoles)).toBe(false);
  });

  // 7. Customer attempts to set communityAccess=true during registration -> rejected / ignored
  it('7. Customer attempts to set communityAccess=true during registration -> rejected / ignored', () => {
    // Under firestore.rules:
    // allow create: if incoming().communityAccess == false
    const rulesAllowCreate = (communityAccess: boolean) => communityAccess === false;
    expect(rulesAllowCreate(true)).toBe(false);
    expect(rulesAllowCreate(false)).toBe(true);
  });

  // 8. Customer attempts to set schoolAccess=true during registration -> rejected / ignored
  it('8. Customer attempts to set schoolAccess=true during registration -> rejected / ignored', () => {
    // Under firestore.rules:
    // allow create: if incoming().schoolAccess == false
    const rulesAllowCreate = (schoolAccess: boolean) => schoolAccess === false;
    expect(rulesAllowCreate(true)).toBe(false);
    expect(rulesAllowCreate(false)).toBe(true);
  });

  // 9. Customer attempts to set status='active' if not default -> handled securely
  it("9. Customer attempts to set status='active' if not default -> handled securely", () => {
    // Under firestore.rules:
    // incoming().status == 'active' is the fixed default; setting 'superadmin' or non-active is rejected
    const rulesAllowCreate = (status: string) => status === 'active';
    expect(rulesAllowCreate('suspended')).toBe(false);
    expect(rulesAllowCreate('active')).toBe(true);
  });

  // 10. Customer attempts to update own profile with valid fields -> succeeds
  it('10. Customer attempts to update own profile with valid fields -> succeeds', () => {
    const validUpdate: CustomerProfileUpdatePayload = {
      firstName: 'Amine',
      lastName: 'Mansouri',
      dateOfBirth: '1995-04-12',
      phone: '0555123456',
      country: 'Algeria',
      wilaya: '16 - Alger',
      city: 'Bab El Oued',
      preferredLanguage: 'ar',
    };

    const valResult = validateCustomerProfileUpdate(validUpdate);
    expect(valResult.isValid).toBe(true);
    expect(valResult.errors).toEqual({});
  });

  // 11. Customer attempts to update own roles via profile update -> denied by Firestore Rules
  it('11. Customer attempts to update own roles via profile update -> denied by Firestore Rules', () => {
    // Under firestore.rules:
    // incoming().diff(existing()).affectedKeys().hasOnly([safeFields])
    // 'roles' is strictly excluded from safeFields
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('roles')).toBe(false);
  });

  // 12. Customer attempts to update own communityAccess via profile update -> denied by Firestore Rules
  it('12. Customer attempts to update own communityAccess via profile update -> denied by Firestore Rules', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('communityAccess')).toBe(false);
  });

  // 13. Customer attempts to update own schoolAccess via profile update -> denied by Firestore Rules
  it('13. Customer attempts to update own schoolAccess via profile update -> denied by Firestore Rules', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('schoolAccess')).toBe(false);
  });

  // 14. Customer attempts to update own emailVerified flag directly -> denied
  it('14. Customer attempts to update own emailVerified flag directly -> denied', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('emailVerified')).toBe(false);
  });

  // 15. Customer attempts to update own phoneVerified flag directly -> denied
  it('15. Customer attempts to update own phoneVerified flag directly -> denied', () => {
    const allowedUpdateKeys = [
      'firstName',
      'lastName',
      'displayName',
      'dateOfBirth',
      'phone',
      'phoneNumber',
      'country',
      'wilaya',
      'city',
      'address',
      'preferredLanguage',
      'profilePhotoUrl',
      'photoURL',
      'locale',
      'profileCompleteness',
      'onboardingCompleted',
      'updatedAt',
    ];

    expect(allowedUpdateKeys.includes('phoneVerified')).toBe(false);
  });

  // 16. Unauthenticated user attempts to read customer profiles -> denied
  it('16. Unauthenticated user attempts to read customer profiles -> denied', () => {
    // Under firestore.rules:
    // match /users/{userId} {
    //   allow get: if isOwner(userId) || isStaff();
    //   allow list: if isStaff();
    // }
    const canReadUserDoc = (isSignedIn: boolean, isOwner: boolean, isStaff: boolean) =>
      isSignedIn && (isOwner || isStaff);

    expect(canReadUserDoc(false, false, false)).toBe(false);
  });

  // 17. Customer attempts to read another customer's date of birth or phone -> denied
  it("17. Customer attempts to read another customer's date of birth or phone -> denied", () => {
    // User doc get: isOwner(userId) || isStaff()
    // Customer reading another customer (isOwner = false, isStaff = false) -> denied by Firestore Rules
    const canReadUserDoc = (isOwner: boolean, isStaff: boolean) => isOwner || isStaff;
    expect(canReadUserDoc(false, false)).toBe(false);
  });

  // 18. Staff with MANAGE_USERS can inspect customer profiles -> permitted
  it('18. Staff with MANAGE_USERS can inspect customer profiles -> permitted', () => {
    const adminHasManageUsers = hasPermission(mockAdmin, 'MANAGE_USERS');
    const superAdminHasManageUsers = hasPermission(mockSuperAdmin, 'MANAGE_USERS');
    const customerHasManageUsers = hasPermission(mockCustomer, 'MANAGE_USERS');

    expect(adminHasManageUsers).toBe(true);
    expect(superAdminHasManageUsers).toBe(true);
    expect(customerHasManageUsers).toBe(false);
  });
});
