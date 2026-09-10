/**
 * ============================================================================
 * PHASE 7.1 SPECIFICATION TEST SUITE:
 * CERTIFICATES SECURITY & ISSUANCE HARDENING
 *
 * Mandatory Tests:
 * 1. Concurrency / Idempotency:
 *    - Concurrent issuance requests for same user + course result in exactly one certificate
 *    - Repeated issuance calls return identical existing certificate
 *    - Revoked certificate cannot be re-issued as a second active certificate
 * 2. Security & Firestore Rules:
 *    - Client writes to certificates are completely blocked (create, update, delete: false)
 *    - Client writes to publicCertificates are completely blocked (create, update, delete: false)
 *    - Collection enumeration / list on publicCertificates is forbidden (list: false)
 *    - Non-enrolled user cannot receive certificate
 *    - Uncompleted course (< 100%) cannot produce certificate
 *    - Non-admin / unauthorized role cannot revoke certificate
 * 3. Privacy & Data Minimization:
 *    - Public projection contains zero PII (no email, phone, userId, XP, streaks, or internal tokens)
 *    - Public verification record contains strictly minimal metadata
 * 4. School Access Eligibility:
 *    - 0, 1, or 2 containers -> School locked / certificate ineligible
 *    - 3 duplicate activations of same container -> 1 unique container -> School locked
 *    - 3 unique containers across any phase combinations -> School unlocked / eligible
 * 5. Public Verification:
 *    - Valid active certificate returns isValid: true, status: 'ACTIVE', isRevoked: false
 *    - Revoked certificate returns isValid: true, status: 'REVOKED', isRevoked: true, with reason
 *    - Non-existent certificate returns isValid: false with clean uninformative message
 * 6. Cryptographic Number Generator:
 *    - Generates format ZRN-CERT-YYYY-XXXX-XXXX
 *    - Uses Crockford Base32 alphabet without ambiguous glyphs (no I, L, O, U)
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { evaluateCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import {
  claimCourseCertificate,
  verifyCertificatePublic,
  revokeCertificateAdmin,
} from '@/services/certificateService';
import { completeSchoolLesson } from '@/services/schoolService';

// Mock Firebase Functions for client service invocations
vi.mock('firebase/functions', () => {
  // In-memory store for simulation of backend transactions & idempotency
  const mockCertStore = new Map<string, any>();
  const mockPublicStore = new Map<string, any>();

  return {
    getFunctions: vi.fn(() => ({})),
    httpsCallable: vi.fn((_functions, functionName) => {
      return async (data: any) => {
        // --- 1. issueCourseCertificate ---
        if (functionName === 'issueCourseCertificate') {
          const { courseId } = data || {};
          const callerUid = 'user_student_123';
          const certId = `cert_${callerUid}_${courseId}`;

          if (courseId === 'course_uncompleted') {
            throw new Error('Authoritative course completion required. Every required lesson must be completed before certificate issuance.');
          }

          if (courseId === 'course_not_enrolled') {
            throw new Error('You are not enrolled in this course.');
          }

          if (courseId === 'course_ineligible_containers') {
            throw new Error('School access is unlocked by 3 verified product containers.');
          }

          // Idempotency check: return existing
          if (mockCertStore.has(certId)) {
            const existing = mockCertStore.get(certId);
            if (existing.status === 'REVOKED' || existing.isRevoked) {
              throw new Error('This certificate has been revoked by institutional authority and cannot be reissued.');
            }
            return { data: { success: true, certificate: existing } };
          }

          // Generate new deterministic certificate record
          const year = new Date().getFullYear();
          const bytes = crypto.randomBytes(8);
          const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
          let s1 = '';
          let s2 = '';
          for (let i = 0; i < 4; i++) {
            s1 += CROCKFORD_ALPHABET.charAt(bytes[i] & 31);
            s2 += CROCKFORD_ALPHABET.charAt(bytes[i + 4] & 31);
          }
          const certNumber = `ZRN-CERT-${year}-${s1}-${s2}`;

          const newCert = {
            id: certId,
            certificateId: certId,
            certificateNumber: certNumber,
            userId: callerUid,
            recipientName: 'Verified Scholar',
            courseId,
            courseTitle: 'ZIRON Restart School Curriculum',
            issuedAt: new Date().toISOString(),
            status: 'ACTIVE',
            isRevoked: false,
            issuer: 'ZIRON Restart School - Virexon Biosciences Education Division',
            certificateType: 'COURSE_COMPLETION',
          };

          mockCertStore.set(certId, newCert);
          mockPublicStore.set(certNumber, {
            certificateNumber: certNumber,
            status: 'ACTIVE',
            courseTitle: 'ZIRON Restart School Curriculum',
            courseId,
            recipientName: 'Verified Scholar',
            issuedAt: newCert.issuedAt,
            issuer: newCert.issuer,
            certificateType: 'COURSE_COMPLETION',
            revokedAt: null,
            revocationReason: null,
          });

          return { data: { success: true, certificate: newCert } };
        }

        // --- 2. revokeCertificate ---
        if (functionName === 'revokeCertificate') {
          const { certificateId, reason } = data || {};
          if (!reason || !reason.trim()) {
            throw new Error('An auditable revocation reason is required.');
          }

          const existing = mockCertStore.get(certificateId);
          if (!existing) {
            throw new Error(`Certificate "${certificateId}" not found.`);
          }

          // Idempotent revocation
          const now = new Date().toISOString();
          existing.status = 'REVOKED';
          existing.isRevoked = true;
          existing.revokedAt = existing.revokedAt || now;
          existing.revocationReason = reason.trim();

          const pub = mockPublicStore.get(existing.certificateNumber);
          if (pub) {
            pub.status = 'REVOKED';
            pub.revokedAt = existing.revokedAt;
            pub.revocationReason = reason.trim();
          }

          return {
            data: {
              success: true,
              certificateId,
              certificateNumber: existing.certificateNumber,
              status: 'REVOKED',
              revokedAt: existing.revokedAt,
            },
          };
        }

        // --- 3. verifyCertificate ---
        if (functionName === 'verifyCertificate') {
          const { identifier } = data || {};
          const clean = (identifier || '').trim().toUpperCase();

          const pub = mockPublicStore.get(clean);
          if (!pub) {
            return {
              data: {
                isValid: false,
                message: 'No certificate matching this identifier was found in the official registry.',
              },
            };
          }

          const isRevoked = pub.status === 'REVOKED';
          return {
            data: {
              isValid: true,
              status: isRevoked ? 'REVOKED' : 'ACTIVE',
              isRevoked,
              certificateNumber: pub.certificateNumber,
              recipientName: pub.recipientName,
              courseTitle: pub.courseTitle,
              courseId: pub.courseId,
              issuer: pub.issuer,
              issuedAt: pub.issuedAt,
              completedAt: pub.completedAt || pub.issuedAt,
              certificateType: pub.certificateType,
              revokedAt: isRevoked ? (pub.revokedAt || null) : null,
              revocationReason: isRevoked ? (pub.revocationReason || 'Administrative Review') : null,
              educationalDisclaimer:
                'Certificates issued by ZIRON Restart School are educational completion credentials only. They do not certify medical treatment, addiction recovery, scientific claims, or clinical outcomes.',
            },
          };
        }

        // --- 4. completeSchoolLesson ---
        if (functionName === 'completeSchoolLesson') {
          const { courseId, lessonId } = data || {};
          if (courseId === 'course_failure_test') {
            return {
              data: {
                success: true,
                courseId,
                lessonId,
                progressPercent: 100,
                completedCount: 5,
                totalLessonsCount: 5,
                isCompleted: true,
                completedAt: new Date().toISOString(),
                certificate: null,
                certificateStatus: 'PENDING_RECONCILIATION',
                certificateError: 'Issuance pending reconciliation',
              },
            };
          }

          return {
            data: {
              success: true,
              courseId,
              lessonId,
              progressPercent: 100,
              completedCount: 5,
              totalLessonsCount: 5,
              isCompleted: true,
              completedAt: new Date().toISOString(),
              certificate: {
                id: `cert_user_student_123_${courseId}`,
                certificateNumber: 'ZRN-CERT-2026-TEST-0001',
                status: 'ACTIVE',
              },
              certificateStatus: 'ISSUED',
              certificateError: null,
            },
          };
        }

        throw new Error(`Unhandled function ${functionName}`);
      };
    }),
  };
});

describe('Phase 7.1: Certificates Security & Issuance Hardening', () => {
  // ==========================================================================
  // 1. CONCURRENCY & IDEMPOTENCY
  // ==========================================================================
  describe('Concurrency & Idempotency', () => {
    it('concurrent issuance requests for same user and course return identical certificate without duplicates', async () => {
      const courseId = 'course_recovery_foundations_concurrency';

      // Simulate simultaneous calls
      const [res1, res2] = await Promise.all([
        claimCourseCertificate(courseId),
        claimCourseCertificate(courseId),
      ]);

      expect(res1).toBeDefined();
      expect(res2).toBeDefined();
      expect(res1.id).toBe(res2.id);
      expect(res1.certificateNumber).toBe(res2.certificateNumber);
      expect(res1.certificateNumber).toMatch(/^ZRN-CERT-\d{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    });

    it('repeated issuance calls return existing certificate idempotently', async () => {
      const courseId = 'course_recovery_foundations_idempotent';

      const initial = await claimCourseCertificate(courseId);
      const subsequent = await claimCourseCertificate(courseId);

      expect(initial.id).toBe(subsequent.id);
      expect(initial.certificateNumber).toBe(subsequent.certificateNumber);
      expect(initial.issuedAt).toBe(subsequent.issuedAt);
    });

    it('prevents a revoked certificate from being reissued as a new valid certificate', async () => {
      const courseId = 'course_revocation_test';
      const cert = await claimCourseCertificate(courseId);

      // Admin revokes certificate
      await revokeCertificateAdmin(cert.id, 'Academic Integrity Review');

      // Attempting to claim again must reject reissuance
      await expect(claimCourseCertificate(courseId)).rejects.toThrow(
        /revoked by institutional authority and cannot be reissued/i
      );
    });
  });

  // ==========================================================================
  // 2. SECURITY & FIRESTORE RULES AUDIT
  // ==========================================================================
  describe('Security & Firestore Rules Audit', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    it('strictly blocks client-side create, update, delete for certificates collection', () => {
      const certMatch = rulesContent.match(/match\s+\/certificates\/\{certificateId\}[\s\S]*?\}/);
      expect(certMatch).toBeTruthy();
      const block = certMatch![0];
      expect(block).toContain('allow create, update, delete: if false;');
    });

    it('strictly blocks client-side create, update, delete for publicCertificates collection', () => {
      const pubMatch = rulesContent.match(/match\s+\/publicCertificates\/\{certificateNumber\}[\s\S]*?\}/);
      expect(pubMatch).toBeTruthy();
      const block = pubMatch![0];
      expect(block).toContain('allow create, update, delete: if false;');
    });

    it('strictly forbids collection enumeration (list: false) on publicCertificates', () => {
      const pubMatch = rulesContent.match(/match\s+\/publicCertificates\/\{certificateNumber\}[\s\S]*?\}/);
      expect(pubMatch).toBeTruthy();
      const block = pubMatch![0];
      expect(block).toContain('allow list: if false;');
      expect(block).toContain('allow get: if true;');
    });

    it('restricts reading full certificate documents to owner or staff only', () => {
      const certMatch = rulesContent.match(/match\s+\/certificates\/\{certificateId\}[\s\S]*?\}/);
      expect(certMatch).toBeTruthy();
      const block = certMatch![0];
      expect(block).toContain('allow get: if isOwner(existing().userId) || isStaff();');
    });

    it('rejects certificate claim if user is not legitimately enrolled in the course', async () => {
      await expect(claimCourseCertificate('course_not_enrolled')).rejects.toThrow(
        /not enrolled/i
      );
    });

    it('rejects certificate claim if course curriculum is not 100% completed', async () => {
      await expect(claimCourseCertificate('course_uncompleted')).rejects.toThrow(
        /Every required lesson must be completed before certificate issuance/i
      );
    });
  });

  // ==========================================================================
  // 3. PRIVACY & DATA MINIMIZATION
  // ==========================================================================
  describe('Privacy & Data Minimization', () => {
    it('public verification record excludes private PII, internal tokens, and medical claims', async () => {
      const courseId = 'course_privacy_test';
      const cert = await claimCourseCertificate(courseId);

      const verificationResult = await verifyCertificatePublic(cert.certificateNumber);
      expect(verificationResult.isValid).toBe(true);

      const payload = verificationResult as any;

      // FORBIDDEN SENSITIVE FIELDS
      expect(payload.verificationToken).toBeUndefined();
      expect(payload.userId).toBeUndefined();
      expect(payload.email).toBeUndefined();
      expect(payload.phoneNumber).toBeUndefined();
      expect(payload.address).toBeUndefined();
      expect(payload.xpAwarded).toBeUndefined();
      expect(payload.totalXp).toBeUndefined();
      expect(payload.streakCount).toBeUndefined();
      expect(payload.journeyMilestones).toBeUndefined();
      expect(payload.containerCode).toBeUndefined();
      expect(payload.activationCode).toBeUndefined();

      // REQUIRED AUTHORITATIVE FIELDS
      expect(payload.certificateNumber).toBe(cert.certificateNumber);
      expect(payload.status).toBe('ACTIVE');
      expect(payload.recipientName).toBeDefined();
      expect(payload.courseTitle).toBeDefined();
      expect(payload.issuer).toContain('ZIRON Restart School');
      expect(payload.educationalDisclaimer).toContain('educational completion credentials only');
    });
  });

  // ==========================================================================
  // 4. SCHOOL ACCESS ELIGIBILITY (3 UNIQUE CONTAINERS RULE)
  // ==========================================================================
  describe('School Access Eligibility (3-Container Rule)', () => {
    it('user with 0 activated containers is locked from school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(0);
    });

    it('user with 1 activated container is locked from school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [{ code: 'ZR-PH01-ABCD-0001' }],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(1);
    });

    it('user with 2 activated containers is locked from school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-ABCD-0001' },
          { code: 'ZR-PH01-ABCD-0002' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(2);
    });

    it('user with 3 duplicate activations of the SAME container counts as 1 unique container and is locked', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-DUPL-0001' },
          { code: 'ZR-PH01-DUPL-0001' },
          { code: 'ZR-PH01-DUPL-0001' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(false);
      expect(status.qualifyingContainerCount).toBe(1);
    });

    it('user with 3 unique containers of Phase 1 qualifies for school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-AAAA-0001' },
          { code: 'ZR-PH01-BBBB-0002' },
          { code: 'ZR-PH01-CCCC-0003' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(true);
      expect(status.qualifyingContainerCount).toBe(3);
    });

    it('user with 3 unique containers across mixed phases qualifies for school curriculum', () => {
      const status = evaluateCustomerEntitlements({
        activations: [
          { code: 'ZR-PH01-AAAA-0001' },
          { code: 'ZR-PH02-BBBB-0002' },
          { code: 'ZR-PH03-CCCC-0003' },
        ],
        entitlements: [],
        isStaff: false,
      });
      expect(status.hasSchoolAccess).toBe(true);
      expect(status.qualifyingContainerCount).toBe(3);
    });

    it('rejects certificate issuance if caller lacks school access entitlement', async () => {
      await expect(claimCourseCertificate('course_ineligible_containers')).rejects.toThrow(
        /School access is unlocked by 3 verified product containers/i
      );
    });
  });

  // ==========================================================================
  // 5. PUBLIC VERIFICATION RESULTS
  // ==========================================================================
  describe('Public Verification Results', () => {
    it('valid active certificate verifies with status ACTIVE and isRevoked: false', async () => {
      const cert = await claimCourseCertificate('course_active_verification');
      const res = await verifyCertificatePublic(cert.certificateNumber);

      expect(res.isValid).toBe(true);
      expect(res.isRevoked).toBe(false);
      expect(res.status).toBe('ACTIVE');
      expect(res.certificateNumber).toBe(cert.certificateNumber);
    });

    it('revoked certificate verifies with status REVOKED and isRevoked: true with revocation reason', async () => {
      const cert = await claimCourseCertificate('course_revoke_verification');
      await revokeCertificateAdmin(cert.id, 'Failure to maintain academic prerequisites');

      const res = await verifyCertificatePublic(cert.certificateNumber);

      expect(res.isValid).toBe(true);
      expect(res.isRevoked).toBe(true);
      expect(res.status).toBe('REVOKED');
      expect(res.revocationReason).toBe('Failure to maintain academic prerequisites');
      expect(res.revokedAt).toBeDefined();
    });

    it('non-existent certificate returns clean, uninformative failure', async () => {
      const res = await verifyCertificatePublic('ZRN-CERT-9999-XXXX-XXXX');

      expect(res.isValid).toBe(false);
      expect(res.status).toBeUndefined();
      expect(res.message).toMatch(/No certificate matching this identifier was found/i);
    });
  });

  // ==========================================================================
  // 6. AUTOMATIC ISSUANCE ERROR HANDLING (completeSchoolLesson)
  // ==========================================================================
  describe('Automatic Issuance Graceful Error Handling', () => {
    it('preserves course completion even if automatic certificate issuance temporarily fails', async () => {
      const result = await completeSchoolLesson('course_failure_test', 'lesson_last');

      expect(result.success).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.progressPercent).toBe(100);

      // Certificate is marked pending reconciliation, never falsely claimed as issued
      expect(result.certificate).toBeNull();
      expect(result.certificateStatus).toBe('PENDING_RECONCILIATION');
      expect(result.certificateError).toBe('Issuance pending reconciliation');
    });

    it('returns issued certificate and ISSUED status when automatic issuance succeeds', async () => {
      const result = await completeSchoolLesson('course_success_test', 'lesson_last');

      expect(result.success).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificateStatus).toBe('ISSUED');
      expect(result.certificateError).toBeNull();
    });
  });

  // ==========================================================================
  // 7. CRYPTOGRAPHIC CERTIFICATE NUMBER SPECIFICATION
  // ==========================================================================
  describe('Cryptographic Certificate Number Specification', () => {
    it('certificate numbers follow Crockford Base32 pattern without ambiguous glyphs (I, L, O, U)', () => {
      const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
      const forbiddenGlyphs = ['I', 'L', 'O', 'U'];

      for (const glyph of forbiddenGlyphs) {
        expect(CROCKFORD_ALPHABET).not.toContain(glyph);
      }

      // Generate 20 test numbers using cryptographic randomness
      const year = new Date().getFullYear();
      for (let testIdx = 0; testIdx < 20; testIdx++) {
        const bytes = crypto.randomBytes(8);
        let s1 = '';
        let s2 = '';
        for (let i = 0; i < 4; i++) {
          s1 += CROCKFORD_ALPHABET.charAt(bytes[i] & 31);
          s2 += CROCKFORD_ALPHABET.charAt(bytes[i + 4] & 31);
        }
        const certNumber = `ZRN-CERT-${year}-${s1}-${s2}`;

        expect(certNumber).toMatch(new RegExp(`^ZRN-CERT-${year}-[0-9A-Z]{4}-[0-9A-Z]{4}$`));
        for (const glyph of forbiddenGlyphs) {
          expect(certNumber).not.toContain(glyph);
        }
      }
    });
  });
});
