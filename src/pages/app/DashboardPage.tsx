import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
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
} from 'lucide-react';
import { calculateProfileCompleteness, maskPhoneNumber } from '@/lib/validation/profileValidation';

export const DashboardPage: React.FC = () => {
  const { user, profile, loading, isStaff } = useAuth();
  const { navigate } = useI18n();

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        INITIALIZING PARTICIPANT PROFILE...
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
    <div className="py-10 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider">
                <User className="w-3.5 h-3.5" />
                SUBJECT DOSSIER
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346]">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile?.displayName || 'Participant'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="font-mono">{user.email}</span>
                {profile?.country && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {profile.country}{profile.wilaya ? ` • ${profile.wilaya}` : ''}
                  </span>
                )}
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Email Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-amber-700 text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Email Verification Pending
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="p-3 bg-gray-50 border border-gray-100 min-w-[200px]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#0B2346] mb-1">
                  <span>Completeness</span>
                  <span className="font-mono text-emerald-700">{completeness}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600"
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
                  <span>Profile Dossier</span>
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

        {/* Entitlements & Activation Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Community Entitlement Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 text-[#2E9E45] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                    profile?.communityAccess
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {profile?.communityAccess ? 'ACTIVE' : 'LOCKED'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">ZIRON Community</h3>
              <p className="text-xs text-gray-600 mb-4">
                Access verified peer discussions and official clinical broadcast announcements.
              </p>
            </div>
            <Button
              onClick={() => navigate(profile?.communityAccess ? 'app/community' : 'community')}
              variant="outline"
              size="sm"
              className="w-full justify-center cursor-pointer"
            >
              {profile?.communityAccess ? 'Open Forum' : 'Unlock Forum'}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          {/* School Entitlement Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 text-[#0B2346] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                    profile?.schoolAccess
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {profile?.schoolAccess ? 'ACTIVE' : 'LOCKED'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">ZIRON School</h3>
              <p className="text-xs text-gray-600 mb-4">
                Dynamic learning tracks covering biopharma, precision agriculture, and applied mastery.
              </p>
            </div>
            <Button
              onClick={() => navigate(profile?.schoolAccess ? 'app/school' : 'school')}
              variant="outline"
              size="sm"
              className="w-full justify-center cursor-pointer"
            >
              {profile?.schoolAccess ? 'Open Academy' : 'Unlock Curricula'}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          {/* 90-Day Trajectory Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 text-[#F28C28] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">
                  PHASE: UNLINKED
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">90-Day Trajectory</h3>
              <p className="text-xs text-gray-600 mb-4">
                Verify container serials to link Phase 01 (Foundation), Phase 02, or Phase 03.
              </p>
            </div>
            <Button
              onClick={() => navigate('verify')}
              variant="primary"
              size="sm"
              className="w-full justify-center cursor-pointer"
            >
              Verify Container Code
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Explicit Empty State: Activity Stream */}
        <div className="bg-white border border-[#E2E8F0] p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346] mb-4">
            Subject Activity & Milestone Stream
          </h2>
          <div className="p-8 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-gray-700 mb-1">
              No milestones recorded yet
            </div>
            <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
              Once your first 30-capsule phase container is verified, daily protocol logs, adherence streaks, and XP points will track here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
