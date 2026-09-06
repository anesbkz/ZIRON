import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { ZIRON_CATALOG } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Layers,
  Compass,
  Sparkles,
  Package,
  GraduationCap,
  MessageSquare,
  Award,
  Calendar,
  Activity,
  Check,
  Cpu,
  Sprout,
  Briefcase,
  Wrench,
  TrendingUp,
  FileCheck2,
  Flame,
  Search,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { content, navigate } = useI18n();

  const phaseItems = ZIRON_CATALOG.filter((item) => item.phase !== 'BUNDLE');

  const restartCategories = [
    {
      id: 'digital',
      title: 'Digital Skills & Tech',
      icon: Cpu,
      desc: 'Applied digital literacy, cloud tools, workflow automation, and modern computing fundamentals.',
    },
    {
      id: 'entrepreneurship',
      title: 'Entrepreneurship & Ventures',
      icon: TrendingUp,
      desc: 'Lean venture validation, micro-enterprise operations, customer discovery, and startup discipline.',
    },
    {
      id: 'agritech',
      title: 'Agriculture & Soil Systems',
      icon: Sprout,
      desc: 'Sustainable crop cycles, modern irrigation, agro-ecological management, and soil vitality.',
    },
    {
      id: 'beekeeping',
      title: 'Apiculture & Hive Economy',
      icon: Flame,
      desc: 'Colony health management, seasonal hive cycles, sustainable extraction, and value-added honey products.',
    },
    {
      id: 'trades',
      title: 'Practical Trades & Craft',
      icon: Wrench,
      desc: 'Hands-on technical maintenance, fabrication safety standards, and artisanal trade execution.',
    },
    {
      id: 'business',
      title: 'Financial & Business Literacy',
      icon: Briefcase,
      desc: 'Cashflow planning, cost accounting, commercial agreements, and compliant bookkeeping.',
    },
  ];

  return (
    <div className="relative">
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0] pt-14 pb-20 sm:pt-20 sm:pb-28">
        <GridPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-[#E2E8F0] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0B2346]" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#0B2346] font-mono">
                VIREXON BIOSCIENCES • ZIRON
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-[1.15] mb-6">
              A premium biotechnology-inspired wellness program.
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              A structured 90-day trajectory uniting targeted daily nutritional routines, applied educational curricula, and cryptographic product authentication. Crafted for disciplined personal habit formation.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('ziron')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Discover ZIRON</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('program')}
                className="cursor-pointer"
              >
                Explore the Program
              </Button>
            </div>

            {/* Quick Safety Positioning Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#0B2346] shrink-0" />
              <span>
                Structured dietary wellness program. Non-medical supplement regimen. No clinical cure claims.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — ZIRON ECOSYSTEM ARCHITECTURE */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B2346] font-bold mb-2">
              ECOSYSTEM FOUNDATION
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              More than a supplement. A comprehensive transformation system.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              ZIRON combines precision bio-nutritional formulations with structured habit engineering, practical skills education, and peer community accountability into a single coherent protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* 1. Product */}
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">01 / COMPOUND</div>
                <h3 className="text-base font-bold text-[#0B2346] mb-2">Bio-Formulation</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Three sequential 30-capsule containers formulated with bioavailable compounds, without filler excipients.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/60 text-[11px] font-bold text-[#0B2346]">
                3 x 30-Day Containers →
              </div>
            </div>

            {/* 2. Structured Program */}
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">02 / PROTOCOL</div>
                <h3 className="text-base font-bold text-[#0B2346] mb-2">Structured Program</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  90 days of organized daily routine, morning consistency habits, hydration checkpoints, and sleep alignment.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/60 text-[11px] font-bold text-[#0B2346]">
                Day 01–90 Framework →
              </div>
            </div>

            {/* 3. Customer Journey */}
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">03 / TRACKING</div>
                <h3 className="text-base font-bold text-[#0B2346] mb-2">Customer Journey</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A personalized digital dossier to log adherence, monitor trajectory milestones, and track habit metrics.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/60 text-[11px] font-bold text-[#0B2346]">
                Personalized Hub →
              </div>
            </div>

            {/* 4. Education */}
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">04 / CURRICULUM</div>
                <h3 className="text-base font-bold text-[#0B2346] mb-2">ZIRON School</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Accredited practical curricula covering digital tools, entrepreneurship, sustainable agriculture, and trade skills.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/60 text-[11px] font-bold text-[#0B2346]">
                Restart Academy →
              </div>
            </div>

            {/* 5. Community */}
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">05 / NETWORK</div>
                <h3 className="text-base font-bold text-[#0B2346] mb-2">Peer Community</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Private moderated exchange for verified participants with linked containers, offering cohort mutual accountability.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/60 text-[11px] font-bold text-[#0B2346]">
                Private Cohorts →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE 90-DAY PROGRAM (VISUAL TRAJECTORY) */}
      <section className="py-16 sm:py-24 bg-[#F5F7FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] font-mono uppercase tracking-widest text-gray-500 font-bold mb-2">
              SEQUENTIAL 3-MONTH ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2346] mb-3">
              The 90-Day Trajectory
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Three organized 30-day blocks designed to transition from habit foundation through regenerative stabilization to self-directed mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {phaseItems.map((item) => (
              <Card
                key={item.id}
                variant="default"
                className="relative overflow-hidden flex flex-col justify-between border-t-4"
                style={{ borderTopColor: item.containerColorHex }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="navy">
                      {item.badgeText}
                    </Badge>
                    <span className="text-xs font-mono font-semibold text-gray-400">
                      {item.sku}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                    {item.phase === 1 ? 'Month 01 (Days 01–30)' : item.phase === 2 ? 'Month 02 (Days 31–60)' : 'Month 03 (Days 61–90)'}
                  </div>

                  <h3 className="text-lg font-bold text-[#0B2346] mb-1">
                    {item.name}
                  </h3>

                  <div className="flex items-baseline gap-2 text-xs text-gray-500 font-medium mb-4">
                    <span className="font-semibold text-[#0B2346]">
                      {item.capsuleCount} capsules
                    </span>
                    <span>•</span>
                    <span>{item.supplyDays}-day supply</span>
                    <span>•</span>
                    <span className="font-mono">{item.colorName} SEAL</span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-2 bg-gray-50 p-3 border border-gray-100 text-xs mb-4">
                    <div className="font-bold text-[#0B2346] text-[11px] uppercase tracking-wider">
                      Key Milestone Objectives:
                    </div>
                    <ul className="space-y-1.5 text-gray-600 text-[11px]">
                      {item.phase === 1 && (
                        <>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Establish morning routine adherence and daily intake consistency</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Complete foundational orientation modules in ZIRON School</span>
                          </li>
                        </>
                      )}
                      {item.phase === 2 && (
                        <>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Integrate hydration tracking and structured physical movement habits</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Engage in moderated peer community discussion topics</span>
                          </li>
                        </>
                      )}
                      {item.phase === 3 && (
                        <>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Consolidate independent lifestyle habits for long-term maintenance</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Attain verified curriculum milestone certificates</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">
                    CONTAINER: {item.colorName}
                  </span>
                  <button
                    onClick={() => navigate('ziron')}
                    className="text-xs font-bold text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Specifications</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Explicit Architectural & Compliance Note */}
          <div className="mt-10 p-4 bg-white border border-[#E2E8F0] text-center max-w-3xl mx-auto">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1 font-bold">
              PROGRAM COMPLIANCE ARCHITECTURE
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">
              Program progression follows your personal chronological trajectory. Product authentication unlocks digital capabilities (Community and School access) for verified participants; phase schedules represent educational routine milestones rather than arbitrary digital locks.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('shop')}
              className="cursor-pointer"
            >
              View Complete 90-Day Bundle in Catalog →
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4 — ZIRON HUB (AUTHENTICATED CUSTOMER ECOSYSTEM) */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0B2346] border border-blue-100">
                <Compass className="w-3.5 h-3.5 text-[#0B2346]" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  CUSTOMER EXPERIENCE PLATFORM
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B2346] tracking-tight">
                ZIRON Hub: Your personal command center.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                When you activate your physical ZIRON container with its cryptographic tamper code, the ZIRON Hub opens your personalized participant workspace.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-blue-50 border border-blue-200 text-[#0B2346] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">Personal Journey & Trajectory</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Visual 90-day progress tracker with daily routine check-ins, hydration milestones, and habit logs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 text-[#2E9E45] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">Verified Peer Community</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Private discussions, moderated topic threads, and mutual encouragement strictly with verified participants.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346]">Milestones & Rewards Registry</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Earn verified achievement badges, track trajectory consistency, and generate verifiable certificates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('login')}
                  className="cursor-pointer"
                >
                  Access Participant Hub
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('verify')}
                  className="cursor-pointer"
                >
                  Verify Container Code
                </Button>
              </div>
            </div>

            {/* Hub Preview Visual Matrix */}
            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 text-xs">
                <span className="font-mono font-bold text-[#0B2346] uppercase">PARTICIPANT INTERFACE PREVIEW</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold border border-emerald-200">
                  SYSTEM ACTIVE
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B2346]">Current Protocol Phase</span>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#0B2346] px-2 py-0.5">
                      PHASE 01: FOUNDATION
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2">
                    <div className="bg-[#0B2346] h-2 w-[42%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                    <span>Day 13 of 90</span>
                    <span>42% Adherence</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#E2E8F0]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Community Room</div>
                    <div className="text-xs font-bold text-[#0B2346] mt-1">Foundational Habits Cohort</div>
                    <div className="text-[10px] text-emerald-700 mt-1">● Active discussions</div>
                  </div>
                  <div className="p-3 bg-white border border-[#E2E8F0]">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">School Curricula</div>
                    <div className="text-xs font-bold text-[#0B2346] mt-1">Digital Skills Module 1</div>
                    <div className="text-[10px] text-blue-700 mt-1">● 3 lessons completed</div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">Container Seal: ZR-PH01-VERIFIED</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">AUTHENTIC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — ZIRON RESTART (EDUCATIONAL ECOSYSTEM) */}
      <section className="py-16 sm:py-24 bg-[#F5F7FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B2346] font-bold mb-2">
                APPLIED LEARNING & REINTEGRATION
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
                ZIRON Restart: Practical Academy
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Health routine without purpose is incomplete. ZIRON Restart equips participants with real-world technical, commercial, and practical trade capabilities to empower economic autonomy.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('restart')}
              className="cursor-pointer shrink-0 self-start md:self-auto"
            >
              Explore Full Curriculum →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restartCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="p-6 bg-white border border-[#E2E8F0] flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="w-10 h-10 bg-gray-100 text-[#0B2346] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0B2346] mb-2">{cat.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{cat.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-gray-400">STRUCTURED TRACK</span>
                    <button
                      onClick={() => navigate('restart')}
                      className="font-bold text-[#0B2346] hover:underline cursor-pointer"
                    >
                      View Modules →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-xs text-gray-500 font-mono">
            * Curricular taxonomy is dynamic and continuously expanded by the VIREXON academic board.
          </div>
        </div>
      </section>

      {/* SECTION 6 — SCIENCE & QUALITY ASSURANCE */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B2346] font-bold mb-2">
              CLINICAL INTEGRITY & MANUFACTURING DISCIPLINE
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              Formulation Science & Analytical Quality
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              VIREXON BIOSCIENCES develops dietary nutritional protocols founded on biochemical rationale, compound purity verification, and full manufacturing transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">Bioavailable Compound Selection</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Selected compounds utilize physiological co-factor pairings to facilitate nutrient utilization without gastrointestinal burden. Zero undisclosed proprietary blends.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('science')}
                  className="text-xs font-bold text-[#0B2346] hover:underline cursor-pointer"
                >
                  Read Formulation Science →
                </button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">Controlled Quality Standards</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Manufacturing adheres to documented quality control standards, raw material screening protocols, and batch traceability. Quality documentation will be published as production milestones are registered.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('quality')}
                  className="text-xs font-bold text-[#0B2346] hover:underline cursor-pointer"
                >
                  Inspect Quality Standards →
                </button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">Responsible Lifestyle Integration</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nutritional supplementation serves as an adjunct to sleep hygiene, proper hydration, nutrient-dense nutrition, and medical counsel. Never a substitute for clinical care.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('faq')}
                  className="text-xs font-bold text-[#0B2346] hover:underline cursor-pointer"
                >
                  Review Program FAQ →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CRYPTOGRAPHIC VERIFICATION BANNER */}
      <section className="py-14 bg-[#0B2346] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-2 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>CRYPTOGRAPHIC CONTAINER AUTHENTICITY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Authenticate Your Physical ZIRON Container
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Every authentic ZIRON container features an individualized alphanumeric security seal. Verify your unit to confirm authorized provenance and link digital privileges.
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('verify')}
            className="shrink-0 bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
          >
            Launch Product Verification →
          </Button>
        </div>
      </section>
    </div>
  );
};
