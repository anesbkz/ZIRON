import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Shield,
  HeartHandshake,
  Sun,
  Activity,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Compass,
} from 'lucide-react';

export const RestartPage: React.FC = () => {
  const { content, navigate } = useI18n();

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                BEHAVIORAL ADHERENCE FRAMEWORK
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                PROTOCOL REF: VX-RST-RECOVERY-01
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              The Restart Protocol
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-3xl">
              A structured, non-punitive framework for navigating routine interruptions, re-establishing nutritional adherence, and maintaining continuous long-term forward momentum.
            </p>

            <div className="p-4 bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed max-w-3xl">
              <strong>Operational Principle:</strong> A missed day is an operational data point, not a moral failure. Long-term behavioral resilience is defined by the speed and composure of your reset.
            </div>
          </div>
        </section>

        {/* SECTION 2: UNDERSTANDING ROUTINE INTERRUPTION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              BEHAVIORAL PSYCHOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Lapse vs. Total Abandonment
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              In habit formation, the primary danger of a missed day is not the biological gap—it is the catastrophic psychological reaction known as the "abstinence violation effect." VIREXON replaces emotional guilt with objective analytical recalibration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold text-[#0B2346]">Recognize the Disruption Factor</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Travel, acute illness, emotional stress, or schedule disruptions frequently interrupt morning routines. Acknowledging the trigger removes confusion.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold text-[#0B2346]">Zero Punitive Framing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Guilt induces shame, and shame invites further avoidance. Treat a missed intake day as an empirical deviation requiring a simple corrective action.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold text-[#0B2346]">Immediate Baseline Re-entry</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Do not attempt double-dosing or extreme compensatory measures. Simply resume the standard single-capsule intake at the next scheduled morning window.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE 3-STEP RESET PROTOCOL */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-1">
              CORRECTIVE ACTION PLAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
              The 3-Step Recalibration Sequence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">
                COGNITIVE PHASE
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">
                Acknowledge & Factual Audit
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Log the missed interval on your tracking record without emotional self-rebuke. Document the environmental cause (e.g., travel, late awakening, misplaced container) to prevent recurrence.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">
                PHYSIOLOGICAL PHASE
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">
                Re-anchor Morning Nutrition
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Place your physical container next to your morning water glass the night before. On waking, consume exactly one capsule with breakfast and at least 250 ml of water. Never double-dose.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">
                ECOSYSTEM RE-ENTRY
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">
                Re-engage Community & School
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Log back into your participant portal. Review one educational lesson in ZIRON Restart and re-engage with your peer cohort discussions for mutual accountability.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: PHYSICAL VS. DIGITAL RESET DISTINCTION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              SYSTEM MECHANICS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              Physical Supply vs. Digital Entitlement Stability
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We separate consecutive daily tracking statistics from fundamental platform access:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 mb-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <span className="font-bold text-[#0B2346] block text-sm">Physical Capsule Supply</span>
              <p className="leading-relaxed">
                Missing a single dose simply extends your 30-capsule supply by 24 hours. Your physical container remains completely valid until all 30 capsules are consumed. If a container is lost or damaged, you may order a replacement phase unit from our catalog.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <span className="font-bold text-[#0B2346] block text-sm">Digital Entitlements & Streak</span>
              <p className="leading-relaxed">
                While consecutive check-in streak counters may reset upon an unlogged day, your foundational account entitlements (ZIRON School curriculum access and Community membership) are never revoked punitively. They remain permanently linked to your verified container code.
              </p>
            </div>
          </div>

          <Alert variant="info" title="Zero Penalty Guarantee">
            Your educational access and verified cohort privileges are permanent entitlements. Routine lapses reset personal streak counters, not your membership status.
          </Alert>
        </section>

        {/* SECTION 5: ETHICAL BOUNDARIES & CLINICAL DISCLOSURE */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block mb-1">
              IMPORTANT HEALTH BOUNDARIES
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              Support Resources & Medical Scope
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              The ZIRON Restart Protocol is a lifestyle adherence tool, not a medical or psychiatric crisis service.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              <strong>NOT A CRISIS CENTER OR MEDICAL DETOX SERVICE:</strong>
              VIREXON BIOSCIENCES does not provide medical emergency assistance, clinical detox monitoring, or psychiatric interventions. If you are experiencing severe physiological withdrawal, psychological crisis, thoughts of self-harm, or substance intoxication, immediately contact local emergency medical services or consult a licensed physician.
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] text-gray-600 leading-relaxed">
              <strong>LICENSED HEALTHCARE CONSULTATION:</strong>
              Participants managing diagnosed health conditions or undergoing medical treatment must make all therapeutic decisions in coordination with their healthcare providers.
            </div>
          </div>
        </section>

        {/* SECTION 6: CTA BANNER */}
        <section className="bg-[#0B2346] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Re-establish Your Routine Today
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Order a replacement Phase 01 container or authenticate your container code to re-enter the ZIRON Hub.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
            >
              Order Phase 01 Container
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('verify')}
              className="border-white/30 text-white hover:bg-white/10 cursor-pointer"
            >
              Verify Container Code
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
