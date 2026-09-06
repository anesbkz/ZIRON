import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  Gift,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const { profile } = useAuth();
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);
  const { hasActivatedProduct } = useCustomerEntitlements();

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Gift className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.rewards.headerBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {t.rewards.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                {t.rewards.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  {t.rewards.levelLabel}
                </div>
                <div className="text-xl font-black text-[#0B2346] font-mono">
                  {level}
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  {t.rewards.totalXpLabel}
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
            {t.rewards.foundationTitle}
          </h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
            {t.rewards.foundationDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-start mb-6">
            <div className="p-4 bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-[#0B2346]">
                {t.rewards.checkpoint30Title}
              </div>
              <p className="text-[11px] text-gray-500">
                {t.rewards.checkpoint30Desc}
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-[#0B2346]">
                {t.rewards.curriculumMasteryTitle}
              </div>
              <p className="text-[11px] text-gray-500">
                {t.rewards.curriculumMasteryDesc}
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-[#0B2346]">
                {t.rewards.peerEngagementTitle}
              </div>
              <p className="text-[11px] text-gray-500">
                {t.rewards.peerEngagementDesc}
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
              <span>{hasActivatedProduct ? t.rewards.returnToJourneyBtn : t.rewards.activateProductBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
