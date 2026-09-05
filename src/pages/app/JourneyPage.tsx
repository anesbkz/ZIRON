import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Package,
  GraduationCap,
  MessageSquare,
  QrCode,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { navigate } = useI18n();
  const {
    loading,
    hasActivatedProduct,
    hasCommunityAccess,
    hasSchoolAccess,
    activations,
    entitlements,
    latestActivation,
  } = useCustomerEntitlements();

  const startDate = latestActivation?.activatedAt
    ? new Date(latestActivation.activatedAt).toLocaleDateString()
    : null;

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Journey Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Compass className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>STRUCTURED WELLNESS & EDUCATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                Your ZIRON Journey
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                Follow your structured trajectory combining nutritional bio-support, applied educational curricula, and verified peer community exchange.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {!hasActivatedProduct ? (
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="bg-[#F28C28] hover:bg-[#e07b1d] text-white border-none cursor-pointer inline-flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Activate Product</span>
                </Button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-right">
                  <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                    STATUS: ACTIVE
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    {startDate ? `Started: ${startDate}` : 'Verified Participant'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Activation Status & Phase Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 01: Foundation */}
          <div className={`bg-white border p-6 flex flex-col justify-between shadow-xs ${hasActivatedProduct ? 'border-[#0B2346]' : 'border-[#E2E8F0]'}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-blue-50 text-[#0B2346]">
                  PHASE 01
                </span>
                {hasActivatedProduct ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LINKED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-gray-400">UNLINKED</span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                Foundation & Cellular Alignment
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Initial 30-day foundational protocol with ZIRON micronutrient complexes and routine baseline establishment.
              </p>
            </div>
            <div className="text-xs font-mono text-gray-500">
              {hasActivatedProduct ? 'Active phase container' : 'Pending container activation'}
            </div>
          </div>

          {/* Phase 02: Regeneration */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between opacity-85 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">
                  PHASE 02
                </span>
                <span className="text-[10px] font-mono text-gray-400">FUTURE</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                Regeneration & Cognitive Fortification
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Day 31–60 advanced regimen focusing on sustained stamina, cognitive clarity, and continued curricular progress.
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              Requires Phase 02 container serial
            </div>
          </div>

          {/* Phase 03: Mastery */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between opacity-85 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">
                  PHASE 03
                </span>
                <span className="text-[10px] font-mono text-gray-400">FUTURE</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                Mastery & Long-Term Vitality
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Day 61–90 consolidation protocol reinforcing self-directed habit architecture and community leadership.
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              Requires Phase 03 container serial
            </div>
          </div>
        </div>

        {/* Available Resources & Next Steps */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-[#0B2346]">Available Resources</h2>
            <p className="text-xs text-gray-500">
              Integrated components of your ZIRON trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Learning Resource */}
            <div className="p-4 border border-[#E2E8F0] bg-gray-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#0B2346]" />
                  <span className="text-xs font-bold text-[#0B2346]">Learning</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  ZIRON School modules covering digital competencies, precision agriculture, and practical entrepreneurship.
                </p>
              </div>
              <Button
                onClick={() => navigate(hasSchoolAccess ? 'app/school' : 'app/products/activate')}
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer"
              >
                {hasSchoolAccess ? 'Access' : 'Unlock'}
              </Button>
            </div>

            {/* Community Resource */}
            <div className="p-4 border border-[#E2E8F0] bg-gray-50/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2E9E45]" />
                  <span className="text-xs font-bold text-[#0B2346]">Community</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Peer exchange network with verified participants and official announcements from the VIREXON team.
                </p>
              </div>
              <Button
                onClick={() => navigate(hasCommunityAccess ? 'app/community' : 'app/products/activate')}
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer"
              >
                {hasCommunityAccess ? 'Access' : 'Unlock'}
              </Button>
            </div>
          </div>
        </div>

        {/* Future Milestones: Clean empty state */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346]">
              Your Progress & Future Milestones
            </h2>
            <span className="text-[10px] font-mono text-gray-400">FOUNDATION STAGE</span>
          </div>

          {!hasActivatedProduct ? (
            <div className="p-8 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-[#0B2346] mb-1">
                Milestones Awaiting Initial Activation
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-4 leading-relaxed">
                Your personal progression timeline will be initiated once your first container is verified.
              </p>
              <Button
                onClick={() => navigate('app/products/activate')}
                variant="primary"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Activate First Container</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0B2346]">
                    Container Verification Complete
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Serial {latestActivation?.code} activated on {startDate}. Community and School privileges initialized.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-dashed border-gray-300">
                <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-700">
                    Upcoming: 30-Day Checkpoint & School Course Completion
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Complete your first learning module in ZIRON School to qualify for verified completion credentials.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
