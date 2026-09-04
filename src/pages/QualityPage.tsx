import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Shield, FileCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export const QualityPage: React.FC = () => {
  const { content } = useI18n();

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Dossier */}
        <div className="mb-10 bg-white border border-[#E2E8F0] p-6 sm:p-10 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346]">
                {content.quality.assuranceTag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.quality.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {content.quality.subtitle}
            </p>
          </div>
        </div>

        {/* Quality Standards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="default" padding="md">
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#0B2346] mb-2">
              {content.quality.standard1Title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.quality.standard1Body}
            </p>
          </Card>

          <Card variant="default" padding="md">
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#0B2346] mb-2">
              {content.quality.standard2Title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.quality.standard2Body}
            </p>
          </Card>

          <Card variant="default" padding="md">
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#0B2346] mb-2">
              {content.quality.standard3Title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.quality.standard3Body}
            </p>
          </Card>
        </div>

        {/* Sample Demonstration Batch Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8">
          {/* Explicit Demonstration Data Disclaimer */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold font-mono tracking-wider">
              {content.quality.sampleNotice}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                ILLUSTRATIVE SAMPLE PROFILE
              </span>
              <h3 className="text-lg font-bold text-[#0B2346]">
                Demo Verification Structure
              </h3>
            </div>
            <div className="text-xs font-mono bg-gray-100 px-3 py-1 text-gray-600">
              SERIAL FORMAT: ZR-XXXX-XXXX-XXXX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1">Batch Format:</div>
              <div className="font-mono font-semibold text-[#0B2346]">Serialized Alphanumeric</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1">Phase Units:</div>
              <div className="font-mono font-semibold text-[#0B2346]">30 capsules / container</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1">Target Market:</div>
              <div className="font-mono font-semibold text-[#0B2346]">Algeria (DZD Pricing)</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1">Verification Status:</div>
              <div className="font-mono font-semibold text-emerald-600">Backend Ready</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
            Note: Production analytical test reports and certificates of analysis will be linked to live verified batch numbers following product manufacturing and registration.
          </div>
        </div>
      </div>
    </div>
  );
};
