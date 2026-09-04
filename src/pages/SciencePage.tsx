import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const SciencePage: React.FC = () => {
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
                {content.science.dossierTag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.science.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {content.science.subtitle}
            </p>
          </div>
        </div>

        {/* Science Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card variant="default" padding="lg">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-3">
              {content.science.pillar1Title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content.science.pillar1Body}
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-3">
              {content.science.pillar2Title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content.science.pillar2Body}
            </p>
          </Card>
        </div>

        {/* Evidence Disclosure Statement */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[#0B2346] uppercase tracking-wider mb-1">
              Scientific Evidence Disclosure
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {content.science.evidenceDisclosure}
            </p>
            <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
              Statements regarding dietary wellness routines have not been evaluated by regulatory food and drug agencies for therapeutic claims.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
