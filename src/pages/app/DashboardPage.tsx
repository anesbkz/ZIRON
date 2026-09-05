import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  User,
  Shield,
  GraduationCap,
  MessageSquare,
  QrCode,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Package,
  Compass,
  Calendar,
  Layers,
  Award,
  Loader2,
} from 'lucide-react';
import { calculateProfileCompleteness } from '@/lib/validation/profileValidation';

export const DashboardPage: React.FC = () => {
  const { user, profile, loading: authLoading, isStaff } = useAuth();
  const { navigate } = useI18n();
  const {
    loading: entLoading,
    hasActivatedProduct,
    hasCommunityAccess,
    hasSchoolAccess,
    activations,
    entitlements,
    latestActivation,
  } = useCustomerEntitlements();

  if (authLoading || (user && entLoading)) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        SYNCHRONIZING PARTICIPANT PROFILE & ENTITLEMENTS...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
            <Lock className="w-8 h-8 text-[#0B2346] mx-auto mb-3" />
            <h1 className="text-xl font-bold text-[#0B2346] mb-2">Authentication Required</h1>
            <p className="text-xs text-gray-600 mb-6">
              Sign in to view your verified participant dashboard.
            </p>
            <Button onClick={() => navigate('login')} variant="primary" size="md" className="w-full">
              Authenticate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completeness = profile?.profileCompleteness ?? calculateProfileCompleteness(profile);

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section A: Welcome Dossier Area */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <User className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>PARTICIPANT PROFILE DOSSIER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile?.displayName || 'Participant'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="font-mono text-gray-700 font-medium">{user.email}</span>
                {profile?.country && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {profile.country}{profile.wilaya ? ` • ${profile.wilaya}` : ''}
                  </span>
                )}
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Email Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 text-[10px] font-bold bg-amber-50 px-2 py-0.5 border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Email Pending Verification
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="p-3.5 bg-gray-50 border border-gray-200 min-w-[220px]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#0B2346] mb-1.5">
                  <span className="uppercase tracking-wider">Profile Completeness</span>
                  <span className="font-mono text-emerald-700">{completeness}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate('app/profile')}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
                {isStaff && (
                  <Button
                    onClick={() => navigate('admin')}
                    variant="primary"
                    size="sm"
                    className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Command Center</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Product Status Banner */}
        {!hasActivatedProduct ? (
          <div className="bg-white border-2 border-dashed border-[#F28C28] p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-[#F28C28] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>NO PRODUCT LINKED</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2346]">
                  Activate your ZIRON product
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Enter the unique cryptographic verification code found on the security seal of your ZIRON 30-capsule container. Activating your container unlocks the ZIRON Peer Community, ZIRON School curricula, and begins tracking your 90-day trajectory.
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-[#F28C28] hover:bg-[#e07b1d] text-white border-none cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Activate Product</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>VERIFIED PRODUCT CONTAINER ACTIVE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2346]">
                  {latestActivation?.productSku || 'ZIRON Bio-Formulation Container'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    Serial: {latestActivation?.code || 'VERIFIED'}
                  </span>
                  {latestActivation?.activatedAt && (
                    <span className="inline-flex items-center gap-1 font-mono text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Activated: {new Date(latestActivation.activatedAt).toLocaleDateString()}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {entitlements.length} Active Entitlement{entitlements.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button
                  onClick={() => navigate('app/journey')}
                  variant="primary"
                  size="md"
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>View My Journey</span>
                </Button>
                <Button
                  onClick={() => navigate('app/products')}
                  variant="outline"
                  size="md"
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>Manage Products ({activations.length})</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Section C & D & E: Core Ecosystem Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* C. Community Access Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 flex items-center justify-center ${hasCommunityAccess ? 'bg-emerald-50 text-[#2E9E45]' : 'bg-gray-100 text-gray-400'}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                    hasCommunityAccess
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {hasCommunityAccess ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">ZIRON Community</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {hasCommunityAccess
                  ? 'Access verified peer discussions, research updates, and official broadcast announcements.'
                  : 'Requires active product activation. Unlocks peer support and official scientific updates.'}
              </p>
            </div>
            <div>
              {hasCommunityAccess ? (
                <Button
                  onClick={() => navigate('app/community')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Open Forum</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center cursor-pointer inline-flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>Activate to Unlock</span>
                </Button>
              )}
            </div>
          </div>

          {/* D. School Access Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 flex items-center justify-center ${hasSchoolAccess ? 'bg-blue-50 text-[#0B2346]' : 'bg-gray-100 text-gray-400'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                    hasSchoolAccess
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {hasSchoolAccess ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">ZIRON School</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {hasSchoolAccess
                  ? 'Access structured curricula across digital literacy, precision agriculture, and applied competencies.'
                  : 'Requires active product activation. Unlocks educational modules and verified certificates.'}
              </p>
            </div>
            <div>
              {hasSchoolAccess ? (
                <Button
                  onClick={() => navigate('app/school')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Open Academy</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center cursor-pointer inline-flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>Activate to Unlock</span>
                </Button>
              )}
            </div>
          </div>

          {/* E. My Journey Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 text-[#F28C28] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">
                  {hasActivatedProduct ? 'FOUNDATION PHASE' : 'INITIALIZING'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">Your ZIRON Journey</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {hasActivatedProduct
                  ? 'Track your educational progress, community milestones, and personalized wellness resources.'
                  : 'Start your journey by verifying your product container to begin structured phase tracking.'}
              </p>
            </div>
            <div>
              <Button
                onClick={() => navigate(hasActivatedProduct ? 'app/journey' : 'app/products/activate')}
                variant={hasActivatedProduct ? 'primary' : 'outline'}
                size="sm"
                className="w-full justify-center cursor-pointer inline-flex items-center gap-1"
              >
                <span>{hasActivatedProduct ? 'Open Journey' : 'Begin Journey'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Section E Part 2: Journey Activity / Milestone Status */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346]">
              Participant Journey Status & Milestones
            </h2>
            <span className="text-[10px] font-mono text-gray-500">
              {hasActivatedProduct ? 'PHASE 01 • ACTIVE' : 'PENDING ACTIVATION'}
            </span>
          </div>

          {!hasActivatedProduct ? (
            <div className="p-8 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-[#0B2346] mb-1">
                No Journey Activity Logged
              </div>
              <p className="text-[11px] text-gray-500 max-w-md mx-auto mb-4 leading-relaxed">
                Your structured journey begins once your first 30-capsule ZIRON container is activated. Milestone check-ins, educational achievements, and community contributions will record here.
              </p>
              <Button
                onClick={() => navigate('app/products/activate')}
                variant="primary"
                size="sm"
                className="cursor-pointer inline-flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Activate Product Code</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-mono uppercase text-gray-500 mb-1">
                    Verified Containers
                  </div>
                  <div className="text-xl font-bold text-[#0B2346] font-mono">
                    {activations.length}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-mono uppercase text-gray-500 mb-1">
                    Active Entitlements
                  </div>
                  <div className="text-xl font-bold text-emerald-700 font-mono">
                    {entitlements.length}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-mono uppercase text-gray-500 mb-1">
                    Learning Track
                  </div>
                  <div className="text-xl font-bold text-[#0B2346]">
                    {hasSchoolAccess ? 'Enrolled' : 'Pending'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-bold text-[#0B2346]">Next Milestone: </span>
                  Explore the ZIRON School curricula to select your foundational learning track, and join your peer discussions in the ZIRON Community.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
