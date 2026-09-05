/**
 * ============================================================================
 * FIREBASE FIRESTORE SECURITY RULES EMULATOR AUDIT SUITE
 * ZIRON / VIREXON BIOSCIENCES
 *
 * Evaluates production firestore.rules against the live Firestore Emulator.
 * Tests strict enforcement of client write lockouts, field whitelisting,
 * role governance, product code integrity, entitlements, audit logs, CMS,
 * school, community moderation, certificates, and negative fuzzing.
 * ============================================================================
 */

import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc } from 'firebase/firestore';

const PROJECT_ID = 'virexon-biosciences-rules-audit';
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8085,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

describe('PHASE 3 — USER SECURITY TEST MATRIX', () => {
  const validRegistrationPayload = {
    uid: 'cust-1001',
    email: 'customer1001@virexon-biosciences.com',
    displayName: 'Amina Mansouri',
    firstName: 'Amina',
    lastName: 'Mansouri',
    country: 'Algeria',
    wilaya: 'Algiers',
    city: 'Algiers',
    status: 'active',
    roles: ['CUSTOMER'],
    communityAccess: false,
    schoolAccess: false,
    xp: 0,
    level: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('TEST A — CUSTOMER SELF CREATE: Allowed when satisfying strict whitelist and default values', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    await assertSucceeds(setDoc(userRef, validRegistrationPayload));
  });

  it('TEST B — CUSTOMER CREATES ADMIN: Denied when attempting to set ADMIN role', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      roles: ['ADMIN'],
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST C — CUSTOMER CREATES SUPER ADMIN: Denied when attempting to set SUPER_ADMIN role', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      roles: ['SUPER_ADMIN'],
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST D — CUSTOMER SPOOFS EMAIL VERIFICATION: Denied when supplying emailVerified flag', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      emailVerified: true,
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST E — CUSTOMER SPOOFS PHONE VERIFICATION: Denied when supplying phoneVerified flag', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      phoneVerified: true,
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST F — CUSTOMER GRANTS COMMUNITY ACCESS: Denied when setting communityAccess to true', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      communityAccess: true,
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST G — CUSTOMER GRANTS SCHOOL ACCESS: Denied when setting schoolAccess to true', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      schoolAccess: true,
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST H — CUSTOMER SETS XP: Denied when setting xp above 0', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      xp: 5000,
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST I — CUSTOMER SETS LEVEL: Denied when setting level above 1', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      level: 99,
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST J — CUSTOMER CHANGES STATUS: Denied when status is not active (e.g. pending or admin)', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      status: 'pending',
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST K — CUSTOMER CHANGES CREATED AT: Denied if createdAt is invalid/missing', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      createdAt: 123456789, // not a string
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST L — CUSTOMER CHANGES UID: Denied when payload uid does not match auth.uid', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      uid: 'victim-uid',
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });

  it('TEST M — CUSTOMER TARGETS DIFFERENT DOC: Denied when user attempts to create doc for another uid', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-9999');
    const payload = {
      ...validRegistrationPayload,
      uid: 'cust-9999',
    };
    await assertFails(setDoc(userRef, payload));
  });

  it('TEST N — CUSTOMER ADDS UNKNOWN FIELD: Denied when injecting non-whitelisted attributes', async () => {
    const db = testEnv.authenticatedContext('cust-1001').firestore();
    const userRef = doc(db, 'users', 'cust-1001');
    const maliciousPayload = {
      ...validRegistrationPayload,
      isAdmin: true,
      customDiscountTier: 'VIP',
    };
    await assertFails(setDoc(userRef, maliciousPayload));
  });
});

describe('PHASE 4 — USER UPDATE SECURITY', () => {
  beforeEach(async () => {
    // Pre-seed an existing customer document via security rules bypass
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'cust-2001'), {
        uid: 'cust-2001',
        email: 'cust2001@virexon.com',
        displayName: 'Karim Hadj',
        firstName: 'Karim',
        lastName: 'Hadj',
        country: 'Algeria',
        wilaya: 'Oran',
        city: 'Oran',
        status: 'active',
        roles: ['CUSTOMER'],
        communityAccess: false,
        schoolAccess: false,
        xp: 0,
        level: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  it('Allows customer to update own safe demographic fields', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertSucceeds(
      updateDoc(userRef, {
        firstName: 'Karim Updated',
        city: 'Mostaganem',
        updatedAt: new Date().toISOString(),
      })
    );
  });

  it('Denies customer updating roles field directly', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        roles: ['ADMIN'],
      })
    );
  });

  it('Denies customer updating status field', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        status: 'banned',
      })
    );
  });

  it('Denies customer updating communityAccess flag', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        communityAccess: true,
      })
    );
  });

  it('Denies customer updating schoolAccess flag', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        schoolAccess: true,
      })
    );
  });

  it('Denies customer updating xp or level', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        xp: 9999,
      })
    );
    await assertFails(
      updateDoc(userRef, {
        level: 50,
      })
    );
  });

  it('Denies customer updating emailVerified or phoneVerified', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        emailVerified: true,
      })
    );
    await assertFails(
      updateDoc(userRef, {
        phoneVerified: true,
      })
    );
  });

  it('Denies customer updating immutable identity fields (uid, email, createdAt)', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(updateDoc(userRef, { uid: 'other-uid' }));
    await assertFails(updateDoc(userRef, { email: 'hacked@virexon.com' }));
    await assertFails(updateDoc(userRef, { createdAt: '2020-01-01T00:00:00.000Z' }));
  });

  it('Denies mixed update combining a safe field with a protected field', async () => {
    const db = testEnv.authenticatedContext('cust-2001').firestore();
    const userRef = doc(db, 'users', 'cust-2001');
    await assertFails(
      updateDoc(userRef, {
        firstName: 'Karim Safe Name',
        roles: ['SUPER_ADMIN'],
      })
    );
  });
});

describe('PHASE 5 — CROSS-USER ACCESS', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'user-alpha'), {
        uid: 'user-alpha',
        email: 'alpha@virexon.com',
        displayName: 'User Alpha',
        status: 'active',
        roles: ['CUSTOMER'],
        communityAccess: false,
        schoolAccess: false,
        xp: 0,
        level: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      await setDoc(doc(db, 'users', 'user-beta'), {
        uid: 'user-beta',
        email: 'beta@virexon.com',
        displayName: 'User Beta',
        status: 'active',
        roles: ['CUSTOMER'],
        communityAccess: false,
        schoolAccess: false,
        xp: 0,
        level: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      await setDoc(doc(db, 'users', 'staff-admin'), {
        uid: 'staff-admin',
        email: 'staff@virexon.com',
        displayName: 'Staff Administrator',
        status: 'active',
        roles: ['ADMIN'],
        communityAccess: true,
        schoolAccess: true,
        xp: 0,
        level: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  it('Denies Customer Alpha reading Customer Beta profile', async () => {
    const db = testEnv.authenticatedContext('user-alpha').firestore();
    await assertFails(getDoc(doc(db, 'users', 'user-beta')));
  });

  it('Denies Customer Alpha modifying Customer Beta profile', async () => {
    const db = testEnv.authenticatedContext('user-alpha').firestore();
    await assertFails(
      updateDoc(doc(db, 'users', 'user-beta'), {
        firstName: 'Tampered Name',
      })
    );
  });

  it('Denies Customer Alpha deleting Customer Beta profile', async () => {
    const db = testEnv.authenticatedContext('user-alpha').firestore();
    await assertFails(deleteDoc(doc(db, 'users', 'user-beta')));
  });

  it('Denies unauthenticated user reading any customer profile', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users', 'user-alpha')));
  });

  it('Allows staff admin to read customer profiles', async () => {
    const db = testEnv.authenticatedContext('staff-admin', {
      roles: ['ADMIN'],
    }).firestore();
    await assertSucceeds(getDoc(doc(db, 'users', 'user-alpha')));
  });

  it('Denies standard staff/admin from deleting users (restricted to SUPER_ADMIN)', async () => {
    const db = testEnv.authenticatedContext('staff-admin', {
      roles: ['ADMIN'],
    }).firestore();
    await assertFails(deleteDoc(doc(db, 'users', 'user-alpha')));
  });

  it('Allows Super Admin to delete users', async () => {
    const db = testEnv.authenticatedContext('super-root', {
      roles: ['SUPER_ADMIN'],
    }).firestore();
    await assertSucceeds(deleteDoc(doc(db, 'users', 'user-alpha')));
  });
});

describe('PHASE 6 — ROLE GOVERNANCE & SYSTEM METADATA', () => {
  it('Denies client read and write to /_system/governance', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const customerDb = testEnv.authenticatedContext('cust-1').firestore();
    const adminDb = testEnv.authenticatedContext('admin-1', { roles: ['ADMIN'] }).firestore();

    await assertFails(getDoc(doc(unauthDb, '_system', 'governance')));
    await assertFails(setDoc(doc(customerDb, '_system', 'governance'), { bootstrapCompleted: false }));
    await assertFails(setDoc(doc(adminDb, '_system', 'governance'), { bootstrapCompleted: false }));
  });
});

describe('PHASE 7 — PRODUCT CODE SECURITY', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'productCodes', 'CODE-XYZ-123'), {
        id: 'CODE-XYZ-123',
        code: 'CODE-XYZ-123',
        batchId: 'BATCH-2026-A',
        productSku: 'VIR-PROD-01',
        isActivated: false,
        activatedByUserId: null,
        activatedAt: null,
        status: 'AVAILABLE',
      });
      await setDoc(doc(db, 'users', 'prod-mgr'), {
        uid: 'prod-mgr',
        email: 'pm@virexon.com',
        roles: ['PRODUCT_MANAGER'],
        status: 'active',
      });
    });
  });

  it('Denies unauthenticated read of productCodes', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'productCodes', 'CODE-XYZ-123')));
  });

  it('Denies customer read of productCodes', async () => {
    const db = testEnv.authenticatedContext('cust-1').firestore();
    await assertFails(getDoc(doc(db, 'productCodes', 'CODE-XYZ-123')));
  });

  it('Denies customer create of productCodes', async () => {
    const db = testEnv.authenticatedContext('cust-1').firestore();
    await assertFails(
      setDoc(doc(db, 'productCodes', 'NEW-CODE'), {
        code: 'NEW-CODE',
        isActivated: false,
      })
    );
  });

  it('Allows PRODUCT_MANAGER to create unactivated product code', async () => {
    const db = testEnv.authenticatedContext('prod-mgr', {
      roles: ['PRODUCT_MANAGER'],
    }).firestore();
    await assertSucceeds(
      setDoc(doc(db, 'productCodes', 'CODE-NEW-999'), {
        code: 'CODE-NEW-999',
        isActivated: false,
        activatedByUserId: null,
        activatedAt: null,
        batchId: 'BATCH-2026-B',
      })
    );
  });

  it('Denies PRODUCT_MANAGER from creating pre-activated product code', async () => {
    const db = testEnv.authenticatedContext('prod-mgr', {
      roles: ['PRODUCT_MANAGER'],
    }).firestore();
    await assertFails(
      setDoc(doc(db, 'productCodes', 'CODE-ACTIVE-001'), {
        code: 'CODE-ACTIVE-001',
        isActivated: true,
        activatedByUserId: 'prod-mgr',
      })
    );
  });

  it('Denies PRODUCT_MANAGER from directly mutating isActivated from false to true (must use Cloud Function)', async () => {
    const db = testEnv.authenticatedContext('prod-mgr', {
      roles: ['PRODUCT_MANAGER'],
    }).firestore();
    await assertFails(
      updateDoc(doc(db, 'productCodes', 'CODE-XYZ-123'), {
        isActivated: true,
        activatedByUserId: 'prod-mgr',
      })
    );
  });

  it('Allows PRODUCT_MANAGER to update safe product code metadata (notes, description)', async () => {
    const db = testEnv.authenticatedContext('prod-mgr', {
      roles: ['PRODUCT_MANAGER'],
    }).firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'productCodes', 'CODE-XYZ-123'), {
        notes: 'Inspection verified by QA laboratory',
      })
    );
  });
});

describe('PHASE 8 — ACTIVATION & ENTITLEMENT SECURITY', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'entitlements', 'cust-1_COMMUNITY_ACCESS'), {
        id: 'cust-1_COMMUNITY_ACCESS',
        userId: 'cust-1',
        type: 'COMMUNITY_ACCESS',
        active: true,
      });
      await setDoc(doc(db, 'activations', 'ACT-001'), {
        id: 'ACT-001',
        userId: 'cust-1',
        code: 'CODE-XYZ-123',
        timestamp: new Date().toISOString(),
      });
    });
  });

  it('Denies customer from directly creating or modifying entitlements', async () => {
    const db = testEnv.authenticatedContext('cust-1').firestore();
    await assertFails(
      setDoc(doc(db, 'entitlements', 'cust-1_SCHOOL_ACCESS'), {
        userId: 'cust-1',
        type: 'SCHOOL_ACCESS',
        active: true,
      })
    );
    await assertFails(
      updateDoc(doc(db, 'entitlements', 'cust-1_COMMUNITY_ACCESS'), {
        active: false,
      })
    );
  });

  it('Denies customer from directly creating or modifying activations', async () => {
    const db = testEnv.authenticatedContext('cust-1').firestore();
    await assertFails(
      setDoc(doc(db, 'activations', 'ACT-HACK'), {
        userId: 'cust-1',
        code: 'STOLEN-CODE',
      })
    );
    await assertFails(
      updateDoc(doc(db, 'activations', 'ACT-001'), {
        userId: 'other-user',
      })
    );
  });

  it('Allows customer to read own entitlement', async () => {
    const db = testEnv.authenticatedContext('cust-1').firestore();
    await assertSucceeds(getDoc(doc(db, 'entitlements', 'cust-1_COMMUNITY_ACCESS')));
  });

  it('Denies customer from reading another user entitlement', async () => {
    const db = testEnv.authenticatedContext('other-cust').firestore();
    await assertFails(getDoc(doc(db, 'entitlements', 'cust-1_COMMUNITY_ACCESS')));
  });
});

describe('PHASE 9 — AUDIT LOG SECURITY', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'admin-1'), {
        uid: 'admin-1',
        email: 'admin@virexon.com',
        roles: ['ADMIN'],
        status: 'active',
      });
      await setDoc(doc(db, 'auditLogs', 'LOG-001'), {
        id: 'LOG-001',
        action: 'USER_REGISTERED',
        timestamp: new Date().toISOString(),
      });
    });
  });

  it('Denies client writes (create, update, delete) to auditLogs for both customer and admin', async () => {
    const custDb = testEnv.authenticatedContext('cust-1').firestore();
    const adminDb = testEnv.authenticatedContext('admin-1', { roles: ['ADMIN'] }).firestore();

    await assertFails(setDoc(doc(custDb, 'auditLogs', 'FAKE-LOG'), { action: 'SPOOF' }));
    await assertFails(setDoc(doc(adminDb, 'auditLogs', 'ADMIN-LOG'), { action: 'MANUAL_INJECT' }));
    await assertFails(updateDoc(doc(adminDb, 'auditLogs', 'LOG-001'), { action: 'MODIFIED' }));
    await assertFails(deleteDoc(doc(adminDb, 'auditLogs', 'LOG-001')));
  });

  it('Denies customer reading audit logs, allows staff/analyst', async () => {
    const custDb = testEnv.authenticatedContext('cust-1').firestore();
    const adminDb = testEnv.authenticatedContext('admin-1', { roles: ['ADMIN'] }).firestore();

    await assertFails(getDoc(doc(custDb, 'auditLogs', 'LOG-001')));
    await assertSucceeds(getDoc(doc(adminDb, 'auditLogs', 'LOG-001')));
  });
});

describe('PHASE 10 — CMS SECURITY', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'cmsContent', 'homepage_hero'), {
        title: 'Precision Botanical Formulations',
        subtitle: 'Science-backed wellness',
      });
    });
  });

  it('Allows public read of cmsContent', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(unauthDb, 'cmsContent', 'homepage_hero')));
  });

  it('Denies direct client create, update, or delete of cmsContent (must use updateCmsSection Cloud Function)', async () => {
    const custDb = testEnv.authenticatedContext('cust-1').firestore();
    const adminDb = testEnv.authenticatedContext('admin-1', { roles: ['ADMIN'] }).firestore();

    await assertFails(updateDoc(doc(custDb, 'cmsContent', 'homepage_hero'), { title: 'Defaced' }));
    await assertFails(updateDoc(doc(adminDb, 'cmsContent', 'homepage_hero'), { title: 'Staff Direct Edit' }));
  });
});

describe('PHASE 11 — SCHOOL CURRICULA SECURITY', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'admin-1'), {
        uid: 'admin-1',
        email: 'admin@virexon.com',
        roles: ['ADMIN'],
        status: 'active',
      });
      await setDoc(doc(db, 'schoolCategories', 'cat-botany'), {
        title: 'Advanced Phytotherapy',
        isPublished: true,
      });
      await setDoc(doc(db, 'schoolCourses', 'course-draft'), {
        title: 'Unpublished Research Course',
        isPublished: false,
      });
      await setDoc(doc(db, 'schoolCourses', 'course-live'), {
        title: 'Introduction to Bioactive Compounds',
        isPublished: true,
      });
    });
  });

  it('Denies direct client create or update of schoolCategories and schoolCourses', async () => {
    const adminDb = testEnv.authenticatedContext('admin-1', { roles: ['ADMIN'] }).firestore();

    await assertFails(
      setDoc(doc(adminDb, 'schoolCategories', 'cat-new'), { title: 'Direct Category' })
    );
    await assertFails(
      setDoc(doc(adminDb, 'schoolCourses', 'course-new'), { title: 'Direct Course' })
    );
  });

  it('Allows public read of published course, denies unpublished course to customers, allows staff', async () => {
    const custDb = testEnv.authenticatedContext('cust-1').firestore();
    const adminDb = testEnv.authenticatedContext('admin-1', { roles: ['ADMIN'] }).firestore();

    await assertSucceeds(getDoc(doc(custDb, 'schoolCourses', 'course-live')));
    await assertFails(getDoc(doc(custDb, 'schoolCourses', 'course-draft')));
    await assertSucceeds(getDoc(doc(adminDb, 'schoolCourses', 'course-draft')));
  });
});

describe('PHASE 12 — COMMUNITY SECURITY & MODERATION', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      // Pre-seed an entitled user
      await setDoc(doc(db, 'entitlements', 'entitled-cust_COMMUNITY_ACCESS'), {
        userId: 'entitled-cust',
        type: 'COMMUNITY_ACCESS',
        active: true,
      });
      // Pre-seed an existing post
      await setDoc(doc(db, 'communityPosts', 'post-1'), {
        authorId: 'entitled-cust',
        title: 'First Botanical Observation',
        body: 'Observations on micro-dosing and bioavailability.',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
        status: 'published',
      });
    });
  });

  it('Denies unauthenticated user from creating a community post', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      addDoc(collection(db, 'communityPosts'), {
        authorId: 'anon',
        title: 'Anonymous post',
        body: 'Anonymous body',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
      })
    );
  });

  it('Denies customer without COMMUNITY_ACCESS entitlement from creating a post', async () => {
    const db = testEnv.authenticatedContext('unentitled-cust').firestore();
    await assertFails(
      addDoc(collection(db, 'communityPosts'), {
        authorId: 'unentitled-cust',
        title: 'Post attempt',
        body: 'Body attempt',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
      })
    );
  });

  it('Allows entitled customer to create a valid compliant post', async () => {
    const db = testEnv.authenticatedContext('entitled-cust').firestore();
    await assertSucceeds(
      addDoc(collection(db, 'communityPosts'), {
        authorId: 'entitled-cust',
        title: 'Verified Entitled Observation',
        body: 'Clean botanical study discussion points.',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
      })
    );
  });

  it('Denies customer from creating post with pre-set likes or pinned/locked status', async () => {
    const db = testEnv.authenticatedContext('entitled-cust').firestore();
    await assertFails(
      addDoc(collection(db, 'communityPosts'), {
        authorId: 'entitled-cust',
        title: 'Self-boosted Post',
        body: 'Boosting initial metrics',
        status: 'published',
        likesCount: 500, // Forbidden!
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
      })
    );
    await assertFails(
      addDoc(collection(db, 'communityPosts'), {
        authorId: 'entitled-cust',
        title: 'Self-pinned Post',
        body: 'Attempting pinned priority',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: true, // Forbidden!
        isLocked: false,
      })
    );
  });

  it('Denies customer modifying another user post', async () => {
    const db = testEnv.authenticatedContext('other-user').firestore();
    await assertFails(
      updateDoc(doc(db, 'communityPosts', 'post-1'), {
        title: 'Tampered Title',
      })
    );
  });

  it('Allows customer to submit a community report with status PENDING', async () => {
    const db = testEnv.authenticatedContext('entitled-cust').firestore();
    await assertSucceeds(
      addDoc(collection(db, 'communityReports'), {
        reporterUserId: 'entitled-cust',
        targetType: 'POST',
        targetId: 'post-1',
        reason: 'Spam or inappropriate content',
        status: 'PENDING',
      })
    );
  });

  it('Denies customer directly resolving community report (must use resolveCommunityReport Cloud Function)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'communityReports', 'rep-01'), {
        reporterUserId: 'entitled-cust',
        targetId: 'post-1',
        status: 'PENDING',
      });
    });
    const db = testEnv.authenticatedContext('entitled-cust').firestore();
    await assertFails(
      updateDoc(doc(db, 'communityReports', 'rep-01'), {
        status: 'RESOLVED',
      })
    );
  });
});

describe('PHASE 13 — CERTIFICATE SECURITY', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'certificates', 'CERT-PRIV-01'), {
        id: 'CERT-PRIV-01',
        userId: 'student-1',
        courseId: 'course-live',
        certificateNumber: 'VIR-CERT-2026-001',
      });
      await setDoc(doc(db, 'publicCertificates', 'VIR-CERT-2026-001'), {
        certificateNumber: 'VIR-CERT-2026-001',
        recipientName: 'Student One',
        courseTitle: 'Introduction to Bioactive Compounds',
        status: 'VALID',
      });
    });
  });

  it('Denies customer from directly creating or modifying private certificates', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore();
    await assertFails(
      setDoc(doc(db, 'certificates', 'CERT-FORGED'), {
        userId: 'student-1',
        courseId: 'course-master',
      })
    );
    await assertFails(
      updateDoc(doc(db, 'certificates', 'CERT-PRIV-01'), {
        courseId: 'course-phd',
      })
    );
  });

  it('Allows student to read own private certificate, denies other student', async () => {
    const ownerDb = testEnv.authenticatedContext('student-1').firestore();
    const otherDb = testEnv.authenticatedContext('student-2').firestore();

    await assertSucceeds(getDoc(doc(ownerDb, 'certificates', 'CERT-PRIV-01')));
    await assertFails(getDoc(doc(otherDb, 'certificates', 'CERT-PRIV-01')));
  });

  it('Allows anyone to get a public certificate by known certificate number', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(unauthDb, 'publicCertificates', 'VIR-CERT-2026-001')));
  });

  it('Denies listing/enumerating publicCertificates collection to prevent mass scraping', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(unauthDb, 'publicCertificates')));
  });
});

describe('PHASE 15 — RULES NEGATIVE FUZZING & FIELD INJECTION', () => {
  const baseRegistration = {
    uid: 'fuzz-uid',
    email: 'fuzz@virexon-biosciences.com',
    displayName: 'Fuzz Tester',
    firstName: 'Fuzz',
    lastName: 'Tester',
    status: 'active',
    roles: ['CUSTOMER'],
    communityAccess: false,
    schoolAccess: false,
    xp: 0,
    level: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('Fuzz 1: Injected { roles: ["SUPER_ADMIN"] } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        roles: ['SUPER_ADMIN'],
      })
    );
  });

  it('Fuzz 2: Injected { communityAccess: true } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        communityAccess: true,
      })
    );
  });

  it('Fuzz 3: Injected { emailVerified: true } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        emailVerified: true,
      })
    );
  });

  it('Fuzz 4: Injected { phoneVerified: true } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        phoneVerified: true,
      })
    );
  });

  it('Fuzz 5: Injected { xp: 999999 } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        xp: 999999,
      })
    );
  });

  it('Fuzz 6: Injected { level: 99 } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        level: 99,
      })
    );
  });

  it('Fuzz 7: Injected arbitrary field { isAdmin: true } is rejected by strict whitelist', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        isAdmin: true,
      })
    );
  });

  it('Fuzz 8: Injected status { status: "banned" } or { status: "ADMIN" } is rejected', async () => {
    const db = testEnv.authenticatedContext('fuzz-uid').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'fuzz-uid'), {
        ...baseRegistration,
        status: 'ADMIN',
      })
    );
  });
});

describe('PHASE 16 — CUSTOMER EXPERIENCE INTEGRATION & ACCESS CONTROL AUDIT', () => {
  const customerA = 'cust-audit-a';
  const customerB = 'cust-audit-b';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      // Seed Customer A
      await setDoc(doc(db, 'users', customerA), {
        uid: customerA,
        email: 'customer.a@virexon-biosciences.com',
        displayName: 'Customer Alpha',
        firstName: 'Alpha',
        lastName: 'Verified',
        country: 'Algeria',
        wilaya: '16 - Alger',
        roles: ['CUSTOMER'],
        status: 'active',
        communityAccess: true,
        schoolAccess: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Seed Customer B (Unentitled)
      await setDoc(doc(db, 'users', customerB), {
        uid: customerB,
        email: 'customer.b@virexon-biosciences.com',
        displayName: 'Customer Beta',
        firstName: 'Beta',
        lastName: 'Unverified',
        country: 'Algeria',
        wilaya: '31 - Oran',
        roles: ['CUSTOMER'],
        status: 'active',
        communityAccess: false,
        schoolAccess: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Seed Entitlements for Customer A
      await setDoc(doc(db, 'entitlements', `${customerA}_COMMUNITY_ACCESS`), {
        id: `${customerA}_COMMUNITY_ACCESS`,
        userId: customerA,
        entitlementType: 'COMMUNITY_ACCESS',
        status: 'ACTIVE',
        grantedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'entitlements', `${customerA}_SCHOOL_ACCESS`), {
        id: `${customerA}_SCHOOL_ACCESS`,
        userId: customerA,
        entitlementType: 'SCHOOL_ACCESS',
        status: 'ACTIVE',
        grantedAt: new Date().toISOString(),
      });
      // Seed Published & Unpublished Community Posts
      await setDoc(doc(db, 'communityPosts', 'audit-post-published'), {
        authorId: customerA,
        title: 'Authoritative Published Observation',
        body: 'Verified biological observations.',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'communityPosts', 'audit-post-flagged'), {
        authorId: customerA,
        title: 'Flagged Content',
        body: 'Under review.',
        status: 'flagged',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
        createdAt: new Date().toISOString(),
      });
      // Seed Published & Draft School Courses
      await setDoc(doc(db, 'schoolCourses', 'audit-course-live'), {
        title: 'Certified Course',
        isPublished: true,
      });
      await setDoc(doc(db, 'schoolCourses', 'audit-course-draft'), {
        title: 'Draft Internal Curriculum',
        isPublished: false,
      });
      // Seed Product Code & Audit Log
      await setDoc(doc(db, 'productCodes', 'CODE-AUDIT-100'), {
        code: 'CODE-AUDIT-100',
        isActivated: false,
      });
      await setDoc(doc(db, 'auditLogs', 'audit-log-100'), {
        action: 'SYSTEM_BOOTSTRAP',
        timestamp: new Date().toISOString(),
      });
    });
  });

  it('1. CUSTOMER without COMMUNITY_ACCESS cannot create community posts', async () => {
    const dbB = testEnv.authenticatedContext(customerB).firestore();
    await assertFails(
      addDoc(collection(dbB, 'communityPosts'), {
        authorId: customerB,
        title: 'Unauthorized Post Attempt',
        body: 'Should be denied by rules.',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
      })
    );
  });

  it('2. CUSTOMER with COMMUNITY_ACCESS can read authorized published community content and create posts', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertSucceeds(getDoc(doc(dbA, 'communityPosts', 'audit-post-published')));
    await assertSucceeds(
      addDoc(collection(dbA, 'communityPosts'), {
        authorId: customerA,
        title: 'Authorized Post Observation',
        body: 'Compliant clinical discussion.',
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        isPinned: false,
        isLocked: false,
      })
    );
  });

  it('3. CUSTOMER without staff role cannot read protected draft school curriculum', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertFails(getDoc(doc(dbA, 'schoolCourses', 'audit-course-draft')));
  });

  it('4. CUSTOMER can read authorized published school curriculum', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertSucceeds(getDoc(doc(dbA, 'schoolCourses', 'audit-course-live')));
  });

  it('5. CUSTOMER cannot read another customer private profile', async () => {
    const dbB = testEnv.authenticatedContext(customerB).firestore();
    await assertFails(getDoc(doc(dbB, 'users', customerA)));
  });

  it('6. CUSTOMER cannot modify another customer profile', async () => {
    const dbB = testEnv.authenticatedContext(customerB).firestore();
    await assertFails(
      updateDoc(doc(dbB, 'users', customerA), {
        firstName: 'Malicious Edit',
      })
    );
  });

  it('7. CUSTOMER cannot directly create or modify entitlements', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'entitlements', 'forged-entitlement'), {
        userId: customerA,
        entitlementType: 'UNLIMITED_ACCESS',
        status: 'ACTIVE',
      })
    );
    await assertFails(
      updateDoc(doc(dbA, 'entitlements', `${customerA}_COMMUNITY_ACCESS`), {
        status: 'REVOKED',
      })
    );
  });

  it('8. CUSTOMER cannot directly create or modify activations', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'activations', 'forged-act'), {
        userId: customerA,
        code: 'CODE-AUDIT-100',
      })
    );
  });

  it('9. CUSTOMER cannot directly create or modify audit logs', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'auditLogs', 'forged-log'), {
        action: 'FORGED_LOG',
      })
    );
    await assertFails(
      updateDoc(doc(dbA, 'auditLogs', 'audit-log-100'), {
        action: 'ALTERED',
      })
    );
  });

  it('10. CUSTOMER cannot access admin-only collections (/productCodes, /auditLogs, /_system)', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertFails(getDoc(doc(dbA, 'productCodes', 'CODE-AUDIT-100')));
    await assertFails(getDoc(doc(dbA, 'auditLogs', 'audit-log-100')));
    await assertFails(getDoc(doc(dbA, '_system', 'governance')));
  });

  it('11. CUSTOMER cannot manipulate their own roles', async () => {
    const dbA = testEnv.authenticatedContext(customerA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'users', customerA), {
        roles: ['ADMIN'],
      })
    );
  });

  it('12. CUSTOMER cannot manipulate communityAccess or schoolAccess flags on their own profile', async () => {
    const dbB = testEnv.authenticatedContext(customerB).firestore();
    await assertFails(
      updateDoc(doc(dbB, 'users', customerB), {
        communityAccess: true,
      })
    );
    await assertFails(
      updateDoc(doc(dbB, 'users', customerB), {
        schoolAccess: true,
      })
    );
  });
});
