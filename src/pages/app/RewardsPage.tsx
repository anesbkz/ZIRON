import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Gift,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  Star,
} from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { navigate } = useI18n();
  const { hasActivatedProduct } = useCustomerEntitlements();

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Gift className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>MILESTONE REWARDS REGISTRY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                ZIRON Rewards & Milestones
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                Track your trajectory consistency, protocol check-in milestones, and educational achievements across the ZIRON ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  Level
                </div>
                <div className="text-xl font-black text-[#0B2346] font-mono">
                  {level}
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  Total XP
                </div>
                <div className="text-xl font-black text-[#F28C28] font-mono">
                  {xp}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Foundation Status */}
        <div className="bg-white border border-[#E2E8F0] p-8 text-center shadow-xs">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#0B2346] mb-2">
            Milestone Rewards Architecture (Phase Foundation)
          </h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
            The ZIRON reward and milestone tracking engine is configured to recognize adherence consistency and course curriculum milestones. As you complete structured activities in ZIRON School and log protocol consistency, your milestone achievements will appear here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left mb-6">
            <div className="p-4 bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-[#0B2346]">
                30-Day Checkpoint
              </div>
              <p className="text-[11px] text-gray-500">
                Unlock Phase 01 adherence badge upon completing your initial 30 days.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-[#0B2346]">
                Curriculum Mastery
              </div>
              <p className="text-[11px] text-gray-500">
                Earn verified completion badges by finishing courses in ZIRON School.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-[#0B2346]">
                Peer Contribution
              </div>
              <p className="text-[11px] text-gray-500">
                Receive peer recognition for constructive contributions in the Community.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => navigate(hasActivatedProduct ? 'app/journey' : 'app/products/activate')}
              variant="outline"
              size="sm"
              className="cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{hasActivatedProduct ? 'Return to Journey' : 'Activate Product'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
