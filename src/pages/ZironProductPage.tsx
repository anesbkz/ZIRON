import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { ZIRON_CATALOG, formatDzdPrice } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Shield,
  Package,
  Check,
  ArrowRight,
  Info,
  Clock,
  Droplet,
  Sun,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
  FileCheck2,
  Calendar,
} from 'lucide-react';

export const ZironProductPage: React.FC = () => {
  const { content, navigate, locale } = useI18n();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const phaseItems = ZIRON_CATALOG.filter((item) => item.phase !== 'BUNDLE');
  const bundleItem = ZIRON_CATALOG.find((item) => item.phase === 'BUNDLE');

  const productFaqs = [
    {
      q: 'What is the capsule count and container schedule?',
      a: 'ZIRON is organized into three sequential 30-day containers. Phase 01 contains 30 capsules (Days 01–30), Phase 02 contains 30 capsules (Days 31–60), and Phase 03 contains 30 capsules (Days 61–90). The complete program bundle contains exactly 90 capsules across all three containers.',
    },
    {
      q: 'How should ZIRON capsules be taken each day?',
      a: 'Take one capsule daily each morning with a full glass of water (approx. 250–300 ml), preferably alongside breakfast. Avoid consuming on an empty stomach if you experience sensitivity. Maintain regular hydration throughout the day.',
    },
    {
      q: 'Does ZIRON use proprietary blends that mask ingredient doses?',
      a: 'No. VIREXON BIOSCIENCES strictly avoids undisclosed proprietary blends. Each compound is selected for biological bioavailability. Quantitative technical dossiers and batch certificates of analysis will be published as production milestones are registered.',
    },
    {
      q: 'Is ZIRON a medical treatment or pharmaceutical addiction cure?',
      a: 'No. ZIRON is a structured dietary wellness and lifestyle protocol. It does not treat, cure, mitigate, or prevent substance use disorders, clinical depression, anxiety, or any medical disease. It is designed solely as a nutritional routine for healthy adults.',
    },
    {
      q: 'How do I confirm my container is authentic before opening?',
      a: 'Every genuine ZIRON container features an individualized, tamper-evident security seal with a unique 16-character alphanumeric verification code (ZR-XXXX-XXXX-XXXX). Enter this code into our Product Verification portal before starting.',
    },
  ];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: HERO DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                VIREXON BIOSCIENCES • SPECIFICATION SHEET
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                DOSSIER REF: VX-ZR-90D-SPEC
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              ZIRON Product System
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              An advanced phase-based dietary wellness formulation engineered to support structured daily routines, nutritional consistency, and disciplined habit formation over 90 days.
            </p>

            {/* Metric Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F5F7FA] border border-[#E2E8F0] mb-8">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Total System Volume</span>
                <span className="text-lg font-black text-[#0B2346]">90 Capsules</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Program Duration</span>
                <span className="text-lg font-black text-[#0B2346]">3 × 30 Days</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Daily Dosage</span>
                <span className="text-lg font-black text-[#0B2346]">1 Capsule / Day</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Authentication</span>
                <span className="text-lg font-black text-[#0B2346]">Serialized Code</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('shop')}
                className="cursor-pointer"
              >
                <span>View in Catalog</span>
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

        {/* SECTION 2: PRODUCT OVERVIEW & PHILOSOPHY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              FOUNDATIONAL PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Structured Nutritional Continuity
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              ZIRON was created to solve the primary failure mode of dietary supplementation: lack of structure and premature discontinuation. Rather than an undifferentiated bulk bottle, ZIRON organizes physical intake into sequential 30-day commitments aligned with progressive behavioral checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">Circadian Morning Rhythm</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ingested once daily at breakfast to reinforce wake-cycle consistency, hydration discipline, and morning focus.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">Phase-Based Segregation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Each 30-capsule container represents a distinct operational milestone: establishing, sustaining, and mastering adherence.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346] mb-1">Individual Traceability</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every container features an individual tamper-evident serialized identity code, linking physical goods with digital accountability.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE THREE PHASE CONTAINERS */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-2">
              PHYSICAL SYSTEM COMPONENTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-2">
              Three Sequential 30-Day Containers
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Each unit contains exactly 30 capsules, sealed under individual color-coded tamper security tags.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phaseItems.map((item) => (
              <Card
                key={item.id}
                variant="default"
                className="flex flex-col justify-between border-t-4"
                style={{ borderTopColor: item.containerColorHex }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="navy">{item.badgeText}</Badge>
                    <span className="text-[11px] font-mono text-gray-400">{item.sku}</span>
                  </div>

                  <div className="text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                    {item.phase === 1
                      ? 'Month 01 (Days 01–30)'
                      : item.phase === 2
                      ? 'Month 02 (Days 31–60)'
                      : 'Month 03 (Days 61–90)'}
                  </div>

                  <h3 className="text-xl font-bold text-[#0B2346] mb-1">{item.name}</h3>

                  <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-3 my-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">Container Volume:</span>
                      <span className="font-bold text-[#0B2346]">{item.capsuleCount} capsules</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">Routine Target:</span>
                      <span className="font-bold text-[#0B2346]">{item.supplyDays}-day supply</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500 font-medium">Retail Currency:</span>
                      <span className="font-bold text-gray-700 font-mono">
                        {formatDzdPrice(item.priceDzd, locale)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gray-600 mb-4 bg-gray-50 p-3 border border-gray-100">
                    <div className="font-bold text-[#0B2346] uppercase text-[10px] mb-1">
                      Phase Focus & Checkpoints:
                    </div>
                    {item.phase === 1 && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Establish morning intake discipline</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Initial hydration & sleep logging</span>
                        </div>
                      </>
                    )}
                    {item.phase === 2 && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Physical movement & habit continuity</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Participate in peer cohort discussions</span>
                        </div>
                      </>
                    )}
                    {item.phase === 3 && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Autonomous routine stabilization</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>ZIRON School curriculum certification</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-500">
                    {item.colorName} SEAL
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('shop')}
                    className="cursor-pointer"
                  >
                    Select Container
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Complete Bundle Highlight */}
          {bundleItem && (
            <div className="bg-white border-2 border-[#0B2346] p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Badge variant="navy">{bundleItem.badgeText}</Badge>
                    <span className="text-xs font-mono text-gray-500">{bundleItem.sku}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B2346] mb-2">
                    {bundleItem.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {bundleItem.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2E9E45]" />
                      <span>3 containers × 30 capsules = 90 capsules total</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2E9E45]" />
                      <span>Full sequential coverage (Days 01 through 90)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2E9E45]" />
                      <span>Individual serialized container verification codes</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 shrink-0">
                  <div className="text-start lg:text-end">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">Catalog Price (DZD)</div>
                    <div className="text-xl font-bold font-mono text-[#0B2346]">
                      {formatDzdPrice(bundleItem.priceDzd, locale)}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('shop')}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    View Bundle in Shop
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: COMPOUND SELECTION & FORMULATION PHILOSOPHY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              FORMULATION DISCLOSURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Transparent Compound Philosophy
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              VIREXON BIOSCIENCES refuses the industry habit of hiding formulations behind arbitrary proprietary names. Every compound is evaluated for biological bioavailability, metabolic tolerability, and harmonious nutrient synergy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2">
                No Proprietary Blends
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                We do not group ingredients under single aggregate numbers to obscure cheap filler proportions. All compounds follow declared standards.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2">
                Zero Gratuitous Fillers
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Capsules are produced without artificial dyes, unnecessary flow agents, or synthetic masking compounds that provide no nutritional value.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2">
                Documented Evidence Policy
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Technical dossiers, certificate of analysis (CoA) templates, and analytical specifications will be published as production lots are released.
              </p>
            </div>
          </div>

          <Alert variant="info" title="Technical Documentation Notice">
            Precise quantitative ingredient specifications and analytical laboratory verification documents will be published upon commercial batch registration.
          </Alert>
        </section>

        {/* SECTION 5: HOW IT FITS INTO THE DAILY PROTOCOL */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              DAILY PROTOCOL INTEGRATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              How ZIRON Fits into Your Day
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Nutritional intake alone is insufficient. ZIRON acts as an anchor for a structured daily wellness routine composed of three disciplined checkpoints:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-2 text-[#0B2346]">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">07:00–09:00 • Morning Intake</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Take 1 capsule with breakfast and at least 250 ml of room-temperature water. Log your morning check-in in the ZIRON Hub companion dossier.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-2 text-[#0B2346]">
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">12:00–14:00 • Hydration & Learning</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ensure adequate hydration (2.0–2.5 L daily target). Complete one bite-sized practical lesson in the ZIRON Restart educational curriculum.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-2 text-[#0B2346]">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider">21:00–22:30 • Sleep Alignment</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Disconnect from high-stimulation screens. Review daily consistency metrics and prepare for 7–8 hours of uninterrupted restorative sleep.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: RESPONSIBLE USE & REGULATORY BOUNDARIES */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 text-amber-700 font-mono text-[10px] uppercase tracking-wider font-bold mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>RESPONSIBLE USE GUIDELINES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Mandatory Health & Safety Disclosures
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              VIREXON BIOSCIENCES enforces strict ethical communication standards. We provide transparent guidance on what ZIRON is—and what it is not.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">NOT A MEDICAL TREATMENT OR ADDICTION CURE</p>
              <p>
                ZIRON is a dietary wellness program. It is not intended to diagnose, treat, cure, or prevent any disease, psychological condition, substance use disorder, or physiological dependence. It is not a substitute for clinical medical care, psychiatric therapy, or medically supervised rehabilitation programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="font-bold text-[#0B2346] block mb-1">Target Demographic</span>
                Intended exclusively for healthy adults aged 18 and older. Do not exceed the recommended daily serving size of one capsule per day.
              </div>

              <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="font-bold text-[#0B2346] block mb-1">Medical Consultation</span>
                Individuals who are pregnant, nursing, taking prescription medications, or under medical supervision must consult a licensed physician before beginning.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: QUALITY & SERIALIZATION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
                SECURITY ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
                Serialized Product Authentication
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Counterfeit and adulterated health supplements represent a severe public health hazard. Every individual ZIRON container features an individualized alphanumeric security code under a tamper-evident seal.
              </p>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unique alphanumeric container serial (ZR-XXXX-XXXX-XXXX)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tamper-evident color-coded seal matched to the respective phase</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Instant authenticity check prior to opening packaging</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('verify')}
                  className="cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 mr-2" />
                  <span>Check Verification Portal</span>
                </Button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                CONTAINER SPECIMEN BREAKDOWN
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">Container Serial</span>
                  <span className="font-bold text-[#0B2346]">ZR-PH01-DEMO-001</span>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">Seal Status</span>
                  <span className="font-bold text-emerald-600">VERIFIED AUTHENTIC</span>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">Capsule Count</span>
                  <span className="font-bold text-[#0B2346]">30 CAPSULES (30-DAY SUPPLY)</span>
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] flex justify-between items-center">
                  <span className="text-gray-500">Market Target</span>
                  <span className="font-bold text-gray-700">ALGERIA (DZD)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: PRODUCT FAQ ACCORDION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              KNOWLEDGE BASE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Clear technical and operational guidance regarding the ZIRON product system.
            </p>
          </div>

          <div className="space-y-3 max-w-4xl">
            {productFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-[#E2E8F0] bg-[#F5F7FA] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#0B2346]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0B2346]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 bg-white border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 9: CALL TO ACTION */}
        <section className="bg-[#0B2346] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Begin Your 90-Day Trajectory
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Explore available phase containers and bundle options in the catalog, or verify an existing container in your possession.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
            >
              Explore Catalog
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('verify')}
              className="border-white/30 text-white hover:bg-white/10 cursor-pointer"
            >
              Verify Product Code
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
