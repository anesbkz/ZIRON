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
  
  // High-reliability check: Staff bypass OR Profile flag hint OR authoritative active entitlement record
  const hasCommunityAccess = Boolean(
    isStaff ||
    profile?.communityAccess ||
    entitlements.some(
      (e) => e.entitlementType === 'COMMUNITY_ACCESS' && e.status === 'ACTIVE'
    )
  );

  const hasSchoolAccess = Boolean(
    isStaff ||
    profile?.schoolAccess ||
    entitlements.some(
      (e) => e.entitlementType === 'SCHOOL_ACCESS' && e.status === 'ACTIVE'
    )
  );

  const latestActivation = activations.length > 0 ? activations[0] : null;

  return {
    loading,
    hasActivatedProduct,
    hasCommunityAccess,
    hasSchoolAccess,
    activations,
    entitlements,
    latestActivation,
    refresh,
  };
}
