import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Droplet,
  Sun,
  Activity,
  Award,
  BookOpen,
  Users,
  Check,
  Compass,
} from 'lucide-react';

export const ProgramPage: React.FC = () => {
  const { content, navigate } = useI18n();
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const phases = [
    {
      phaseNumber: 1,
      name: 'Foundation',
      code: 'PHASE_01',
      title: 'Month 01: Foundation & Habit Inception (Days 01–30)',
      days: 'Days 01–30',
      capsules: '30 capsules (Container 01)',
      sealColor: 'Red (#D62828)',
      colorHex: '#D62828',
      summary:
        'The opening 30 days center on behavioral initiation: overcoming morning inertia, establishing uncompromised daily nutritional adherence, and setting baseline hydration routines.',
      focusList: [
        'Establish disciplined morning intake routine with water',
        'Initial baseline sleep and hydration logging in ZIRON Hub',
        'Access introductory ZIRON Restart educational orientation modules',
        'Learn physiological principles of daily nutrient timing',
      ],
      milestone: 'Consistent 30-Day Check-in Streak Badge',
    },
    {
      phaseNumber: 2,
      name: 'Regeneration',
      code: 'PHASE_02',
      title: 'Month 02: Regeneration & Habit Reinforcement (Days 31–60)',
      days: 'Days 31–60',
      capsules: '30 capsules (Container 02)',
      sealColor: 'Orange (#F28C28)',
      colorHex: '#F28C28',
      summary:
        'The middle 30 days build behavioral resilience: moving from conscious effort to automatic routine, expanding water intake, integrating moderate physical activity, and joining peer cohort exchanges.',
      focusList: [
        'Reinforce daily hydration discipline (target 2.0–2.5 L/day)',
        'Incorporate regular moderate physical movement into weekly rhythm',
        'Engage in moderated peer cohort discussion topics',
        'Complete intermediate practical skills modules (Digital & Ventures)',
      ],
      milestone: 'Mid-Trajectory Adherence Verification Certificate',
    },
    {
      phaseNumber: 3,
      name: 'Mastery',
      code: 'PHASE_03',
      title: 'Month 03: Mastery & Autonomous Stabilization (Days 61–90)',
      days: 'Days 61–90',
      capsules: '30 capsules (Container 03)',
      sealColor: 'Green (#2E9E45)',
      colorHex: '#2E9E45',
      summary:
        'The final 30 days cement long-term autonomy: stabilizing internal discipline, conducting a full milestone review, and bridging wellness routines with tangible economic and trade capabilities.',
      focusList: [
        'Consolidate autonomous daily lifestyle and nutritional routines',
        'Conduct comprehensive 90-day trajectory review and biometric reflection',
        'Prepare personal post-program wellness continuity plan',
        'Attain verified practical trade / business skill certificates in ZIRON School',
      ],
      milestone: '90-Day Trajectory Completion Certificate',
    },
  ];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                VIREXON BEHAVIORAL FRAMEWORK
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                TRAJECTORY REF: 90D-CHRONO-PROTOCOL
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              The 90-Day Sequential Program
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              A structured three-month developmental progression engineered to transform sporadic wellness attempts into disciplined, autonomous, and enduring daily routines.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('ziron')}
                className="cursor-pointer"
              >
                <span>Inspect Phase Containers</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('verify')}
                className="cursor-pointer"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span>Verify Container Code</span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3-MONTH VISUAL TRAJECTORY SELECTOR */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
                PROGRESSIVE MILESTONE BLUEPRINT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                Three Sequential 30-Day Phases
              </h2>
            </div>
            <span className="text-xs font-mono text-gray-500">
              TOTAL PROGRAM VOLUME: 90 DAYS / 90 CAPSULES
            </span>
          </div>

          {/* Stepper Header Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {phases.map((p) => {
              const isSelected = selectedPhase === p.phaseNumber;
              return (
                <button
                  key={p.phaseNumber}
                  type="button"
                  onClick={() => setSelectedPhase(p.phaseNumber)}
                  className={`p-4 border text-left transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white border-[#0B2346] shadow-sm ring-1 ring-[#0B2346]'
                      : 'bg-gray-50 border-[#E2E8F0] hover:bg-white text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 text-[10px] font-mono font-bold text-white uppercase"
                      style={{ backgroundColor: p.colorHex }}
                    >
                      PHASE 0{p.phaseNumber}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-400">
                      {p.days}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0B2346]">{p.name}</h3>
                  <div className="text-[11px] text-gray-500 mt-1 font-mono">
                    {p.capsules}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Detailed Dossier Card */}
          {(() => {
            const current = phases.find((p) => p.phaseNumber === selectedPhase)!;
            return (
              <div
                className="bg-white border border-[#E2E8F0] p-6 sm:p-10 border-s-4 shadow-sm"
                style={{ borderInlineStartColor: current.colorHex }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="max-w-3xl space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="navy">{current.code}</Badge>
                      <span className="text-xs font-mono text-gray-500 font-semibold">
                        {current.days}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 font-mono">
                        SEAL COLOR: {current.sealColor}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#0B2346] tracking-tight">
                      {current.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {current.summary}
                    </p>

                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">
                        Prescribed Phase Objectives & Habit Checkpoints:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {current.focusList.map((focus, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{focus}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#0B2346]" />
                        <span className="font-semibold text-gray-700">Target Phase Milestone:</span>
                        <span className="font-bold text-[#0B2346]">{current.milestone}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">
                        VERIFIABLE
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] shrink-0 w-full lg:w-72 space-y-4">
                    <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                      PHASE CONTAINER METRICS
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Unit Volume:</span>
                        <span className="font-bold text-[#0B2346]">30 Capsules</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Intake Schedule:</span>
                        <span className="font-bold text-[#0B2346]">1 / Day (Morning)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Physical Seal:</span>
                        <span className="font-bold text-gray-700">{current.sealColor}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">Tamper Code:</span>
                        <span className="font-bold text-emerald-700">SERIALIZED</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('ziron')}
                      className="w-full justify-center cursor-pointer"
                    >
                      View Phase Specifications
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* SECTION 3: DAILY ROUTINE ARCHITECTURE */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              OPERATIONAL CADENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              The Daily Protocol Rhythm
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Habits stabilize when tied to predictable environmental anchors. Throughout the 90 days, participants adhere to three foundational daily touchpoints:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-2">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">ANCHOR 01 / MORNING</div>
              <h3 className="text-base font-bold text-[#0B2346]">Nutritional Inception</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Take one capsule with breakfast and 250–300 ml of water. Perform 60-second morning check-in on the companion dashboard.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mb-2">
                <Droplet className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">ANCHOR 02 / MIDDAY</div>
              <h3 className="text-base font-bold text-[#0B2346]">Hydration & Practical Study</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Check hydration balance (target 1.5 L reached by 14:00). Complete one 15-minute practical module in the ZIRON Restart curriculum.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">ANCHOR 03 / EVENING</div>
              <h3 className="text-base font-bold text-[#0B2346]">Restorative Wind-Down</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Review daily consistency logs. Disconnect screens 45 minutes prior to sleep to support circadian melatonin secretion and deep restorative recovery.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: ARCHITECTURAL & ENTITLEMENT CLARIFICATION (MANDATORY) */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              SYSTEM ARCHITECTURE NOTICE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              Phase Concept vs. Authorization Model
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              To ensure transparency and prevent confusion regarding digital access controls, please note the distinction between the educational program presentation and platform authorization:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 mb-6">
            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">Public Program Trajectory</span>
              The 90-Day progression (Phase 01, 02, and 03) represents the physical product packaging sequence and chronological habit formation guidance. It serves as your behavioral calendar and educational milestone roadmap.
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">Digital Platform Authorization</span>
              In the authenticated digital system (ZIRON Hub), access to digital features (such as School curricula and Community rooms) is governed by cryptographically verified container codes and server-authoritative account entitlements, not by artificial client-side locks.
            </div>
          </div>

          <Alert variant="info" title="Verification & Digital Access">
            Authenticating your genuine container serial unlocks your corresponding participant capabilities in the secure customer portal.
          </Alert>
        </section>

        {/* SECTION 5: REALISTIC EXPECTATIONS & RESPONSIBLE FRAMING */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block mb-1">
              EXPECTATIONS & ADHERENCE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              Realistic Expectations & Personal Discipline
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Sustainable lifestyle change requires time, consistency, and active engagement. ZIRON does not promote instantaneous results or overnight transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600">
            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">No Miracle Claims</span>
              ZIRON is an organized dietary supplement protocol. It does not replace medical treatment, physical exercise, or healthy balanced nutrition.
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">Consistency Over Intensity</span>
              Adhering to daily intake and drinking adequate water consistently for 90 days yields vastly superior results to sporadic, extreme interventions.
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
              <span className="font-bold text-[#0B2346] block mb-1">Non-Medical Positioning</span>
              Always consult a licensed medical provider prior to starting any nutritional protocol, particularly if you take prescription medications or manage chronic conditions.
            </div>
          </div>
        </section>

        {/* SECTION 6: CTA BANNER */}
        <section className="bg-[#0B2346] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Take the First Step: Month 01 Foundation
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Acquire the complete 90-Day Program Bundle or begin with the Phase 01 container in our catalog.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
            >
              Order 90-Day Bundle
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('verify')}
              className="border-white/30 text-white hover:bg-white/10 cursor-pointer"
            >
              Verify Existing Container
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
