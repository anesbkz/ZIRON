import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Check,
  ArrowRight,
  Shield,
  Activity,
  Microscope,
} from 'lucide-react';

export const SciencePage: React.FC = () => {
  const { content, navigate } = useI18n();

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: EDITORIAL DOSSIER HEADER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                VIREXON SCIENTIFIC CHARTER
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                DOCUMENT ID: VX-SCI-CHARTER-01
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              Formulation Science & Biochemical Discipline
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              Applying rigorous biotechnology and nutritional principles to phase-based wellness. Honest communication, zero proprietary blends, and clear ethical boundaries.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('ziron')}
                className="cursor-pointer"
              >
                <span>Inspect ZIRON Specifications</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('quality')}
                className="cursor-pointer"
              >
                <span>Quality & Traceability Standards</span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: FORMULATION PHILOSOPHY & NUTRIENT SYNERGY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              CORE SCIENTIFIC PRINCIPLES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Formulation Philosophy
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              In commercial nutraceuticals, formulas frequently feature arbitrary lists of dozens of low-dosed ingredients or hidden proprietary mixtures designed for marketing labels rather than human physiology. VIREXON BIOSCIENCES operates on four non-negotiable formulation principles:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Nutrient Bioavailability Priority</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We select biologically active nutrient forms that the human digestive tract can absorb and utilize efficiently, minimizing unabsorbed compounds that cause gastric discomfort.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Zero Proprietary Masking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We reject the practice of grouping ingredients under aggregate proprietary blend weights. Full compound transparency is a prerequisite for informed consumer autonomy and trust.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Physiological Synergies</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Selected compounds operate in harmony with endogenous metabolic pathways. Individual phases reflect progressive nutritional requirements across the 90-day trajectory.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Clean Capsule Standards</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Formulations are delivered in vegetarian capsule shells free of artificial coloring agents, redundant anti-caking additives, and unnecessary binders.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: INGREDIENT OVERVIEW & FACTUAL POLICY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              DISCLOSURE DISCIPLINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Ingredient Sourcing & Compound Standards
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We separate aspirational marketing claims from verifiable biochemical facts. The compounds selected for the ZIRON 3-phase system reflect peer-reviewed dietary nutrition research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">
                STANDARDS PROTOCOL
              </div>
              <h4 className="text-xs font-bold text-[#0B2346] uppercase mb-2">Identity Confirmation</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Raw materials undergo standard identity screening prior to capsule formulation to confirm chemical identity and purity.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">
                STANDARDS PROTOCOL
              </div>
              <h4 className="text-xs font-bold text-[#0B2346] uppercase mb-2">Bio-Compatability</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nutrient formats are chosen for smooth biological uptake when consumed with food and regular morning water intake.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">
                STANDARDS PROTOCOL
              </div>
              <h4 className="text-xs font-bold text-[#0B2346] uppercase mb-2">Documentation Release</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Quantitative Certificates of Analysis (CoA) will be published per production batch upon laboratory release.
              </p>
            </div>
          </div>

          <Alert variant="info" title="Formulation Dossier Release Notice">
            Precise quantitative ingredient specifications, milligram breakdowns, and laboratory testing certificates will be published alongside commercial batch registration in accordance with regulatory filing schedules.
          </Alert>
        </section>

        {/* SECTION 4: PRODUCT DEVELOPMENT & CHRONOBIOLOGY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              METABOLIC INTEGRATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Circadian Timing & Daily Hydration Synergy
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Nutrient absorption does not occur in a vacuum. The human body operates on circadian metabolic cycles that dictate gastric emptying, cellular nutrient uptake, and enzymatic activity:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Morning Inception Anchor</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ingesting the capsule alongside breakfast leverages post-prandial bile acid release and gastric motility, facilitating optimal absorption of fat-soluble and water-soluble micronutrients alike.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Cellular Hydration Coupling</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Water is the essential physiological transport medium. Consuming 250–300 ml of water with the capsule, followed by 2.0+ liters across the day, supports healthy renal clearance and cellular hydration.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Phase Continuity (90 Days)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cellular turnover and neural habit consolidation require extended temporal continuity. The 90-day trajectory provides the sustained window needed to transform conscious efforts into automatic routines.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: ETHICAL BOUNDARIES & NON-MEDICAL LIMITATIONS */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block mb-1">
              ETHICAL & LEGAL CLASSIFICATION
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              Scientific Boundaries & Responsible Communication
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We explicitly separate our dietary wellness protocol from pharmaceutical drugs or clinical psychiatry. Scientific discipline requires recognizing the exact scope and limitations of our products:
            </p>
          </div>

          <div className="space-y-4 text-xs text-gray-600">
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              <strong className="block mb-1">NO ADDICTION OR CLINICAL CURE CLAIMS:</strong>
              ZIRON is a structured dietary wellness and habit formation program. It is not intended to treat, cure, mitigate, or prevent substance use disorders, clinical depression, anxiety, alcoholism, or any psychiatric pathology. It is not a substitute for clinical medical care or medically supervised rehabilitation.
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] leading-relaxed">
              <strong className="text-[#0B2346] block mb-1">SUPPLEMENTARY NATURE:</strong>
              Nutritional supplementation functions as a supportive lifestyle element alongside adequate restorative sleep, balanced nutrition, daily hydration, and medical guidance. Individuals with chronic medical conditions should always consult a licensed healthcare professional.
            </div>
          </div>
        </section>

        {/* SECTION 6: SCIENTIFIC REFERENCES & EVIDENCE POLICY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="flex items-start gap-4">
            <FileText className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
            <div className="space-y-2 max-w-3xl">
              <h3 className="text-sm font-bold text-[#0B2346] uppercase tracking-wider">
                Scientific References & Evidence Policy
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                VIREXON BIOSCIENCES adheres to strict academic honesty. We do not invent fictional clinical trials or fabricate laboratory names. Comprehensive scientific references, peer-reviewed bibliography items, and formulation technical whitepapers will be published as available alongside formal product registration.
              </p>
              <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                Statements on this platform have not been evaluated by regulatory food or drug administrations for therapeutic efficacy.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
