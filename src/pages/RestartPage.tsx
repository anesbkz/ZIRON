import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

export const RestartPage: React.FC = () => {
  const { content, navigate } = useI18n();

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Dossier */}
        <div className="mb-10 bg-white border border-[#E2E8F0] p-6 sm:p-10 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346]">
                {content.restart.tag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.restart.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
              {content.restart.subtitle}
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
              {content.restart.protocolNotice}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="default" padding="lg">
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center font-bold text-xs mb-3">
              01
            </div>
            <h2 className="text-base font-bold text-[#0B2346] mb-2">
              {content.restart.step1Title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.restart.step1Body}
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center font-bold text-xs mb-3">
              02
            </div>
            <h2 className="text-base font-bold text-[#0B2346] mb-2">
              {content.restart.step2Title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.restart.step2Body}
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center font-bold text-xs mb-3">
              03
            </div>
            <h2 className="text-base font-bold text-[#0B2346] mb-2">
              {content.restart.step3Title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.restart.step3Body}
            </p>
          </Card>
        </div>

        {/* Restart Action Box */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-[#0B2346] mb-1">
              Need a fresh Phase 01 container?
            </h3>
            <p className="text-xs text-gray-600">
              Obtain a new 30-capsule Phase 01 container to reset your 30-day baseline routine.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('shop')}
            className="shrink-0"
          >
            Order Phase 01 Container →
          </Button>
        </div>
      </div>
    </div>
  );
};
