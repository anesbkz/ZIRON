import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export const ProgramPage: React.FC = () => {
  const { content, navigate } = useI18n();

  const phases = [
    {
      phaseNumber: '01',
      title: content.program.phase1Title,
      objective: content.program.phase1Objective,
      days: 'Days 01–30',
      capsules: '30 capsules (1 container)',
      colorHex: '#D62828',
      focusList: [
        'Establish disciplined morning intake routine',
        'Initial nutritional consistency & habit foundation',
        'Access introductory educational modules',
      ],
    },
    {
      phaseNumber: '02',
      title: content.program.phase2Title,
      objective: content.program.phase2Objective,
      days: 'Days 31–60',
      capsules: '30 capsules (1 container)',
      colorHex: '#F28C28',
      focusList: [
        'Reinforce daily hydration & lifestyle habits',
        'Engage with structured physical activity suggestions',
        'Participate in community cohort discussions',
      ],
    },
    {
      phaseNumber: '03',
      title: content.program.phase3Title,
      objective: content.program.phase3Objective,
      days: 'Days 61–90',
      capsules: '30 capsules (1 container)',
      colorHex: '#2E9E45',
      focusList: [
        'Consolidate autonomous daily wellness habits',
        'Evaluate 90-day consistency progress',
        'Prepare long-term independent maintenance routine',
      ],
    },
  ];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Dossier */}
        <div className="mb-10 bg-white border border-[#E2E8F0] p-6 sm:p-10 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346]">
                {content.program.timelineTag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.program.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {content.program.subtitle}
            </p>
          </div>
        </div>

        {/* Timeline Progression */}
        <div className="space-y-6 mb-12">
          {phases.map((phase) => (
            <div
              key={phase.phaseNumber}
              className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative border-s-4"
              style={{ borderInlineStartColor: phase.colorHex }}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span
                      className="px-2 py-0.5 text-xs font-mono font-bold text-white uppercase"
                      style={{ backgroundColor: phase.colorHex }}
                    >
                      PHASE {phase.phaseNumber}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 font-mono">
                      {phase.days}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-600 font-medium">
                      {phase.capsules}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#0B2346] mb-2">
                    {phase.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {phase.objective}
                  </p>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Key Phase Milestones:
                    </div>
                    {phase.focusList.map((focus, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <span>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 pt-2 md:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('ziron')}
                  >
                    View Phase Container
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#0B2346] text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold mb-1">
              Ready to begin the 90-Day Protocol?
            </h3>
            <p className="text-xs text-white/70">
              Each phase consists of a dedicated 30-capsule container providing 30 days of structured routine.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('shop')}
            className="bg-white text-[#0B2346] hover:bg-gray-100 shrink-0"
          >
            Order 90-Day Bundle →
          </Button>
        </div>
      </div>
    </div>
  );
};
