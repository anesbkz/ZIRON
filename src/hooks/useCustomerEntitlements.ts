import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getUserEntitlements,
  getUserActivations,
} from '@/services/entitlementService';
import { EntitlementRecord, ActivationRecord } from '@/types/entitlements';

export interface CustomerEntitlementState {
  loading: boolean;
  hasActivatedProduct: boolean;
  hasCommunityAccess: boolean;
  hasSchoolAccess: boolean;
  qualifyingContainerCount: number;
  activations: ActivationRecord[];
  entitlements: EntitlementRecord[];
  latestActivation: ActivationRecord | null;
  refresh: () => Promise<void>;
}

export function useCustomerEntitlements(): CustomerEntitlementState {
  const { user, profile, refreshProfile, isStaff } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [activations, setActivations] = useState<ActivationRecord[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementRecord[]>([]);

  const loadData = useCallback(async () => {
    if (!user) {
      setActivations([]);
      setEntitlements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [acts, ents] = await Promise.all([
        getUserActivations(user.uid),
        getUserEntitlements(user.uid),
      ]);
      setActivations(acts);
      setEntitlements(ents);
    } catch (err) {
      console.warn('Error loading customer entitlements or activations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await refreshProfile();
    await loadData();
  }, [refreshProfile, loadData]);

  const hasActivatedProduct = activations.length > 0;

  // Qualification logic:
  // Count distinct activated container identities (code values) belonging to user
  const distinctContainerCodes = new Set<string>();
  activations.forEach((a) => {
    const codeVal = (a.code || '').trim().toUpperCase();
    if (codeVal) {
      distinctContainerCodes.add(codeVal);
    }
  });
  const qualifyingContainerCount = Math.max(
    distinctContainerCodes.size,
    profile?.qualifyingContainerCount || 0
  );
  
  // Authoritative entitlement check: Staff bypass OR authoritative ACTIVE entitlement document.
  // Earned access: Once a user has legitimately unlocked School, treat School access as EARNED ACCESS.
  // Do NOT automatically revoke School access merely because a product entitlement later becomes EXPIRED or INACTIVE.
  const hasCommunityAccess = Boolean(
    isStaff ||
    entitlements.some(
      (e) => e.entitlementType === 'COMMUNITY_ACCESS' && e.status === 'ACTIVE'
    )
  );

  const hasSchoolAccess = Boolean(
    isStaff ||
    qualifyingContainerCount >= 3 ||
    profile?.schoolAccess === true ||
    entitlements.some(
      (e) => e.entitlementType === 'SCHOOL_ACCESS' && e.status !== 'REVOKED'
    )
  );

  const latestActivation = activations.length > 0 ? activations[0] : null;

  return {
    loading,
    hasActivatedProduct,
    hasCommunityAccess,
    hasSchoolAccess,
    qualifyingContainerCount,
    activations,
    entitlements,
    latestActivation,
    refresh,
  };
}
