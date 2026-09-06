import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Shield,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Thermometer,
  QrCode,
  Package,
  Search,
} from 'lucide-react';

export const QualityPage: React.FC = () => {
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
                VIREXON QUALITY GOVERNANCE
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                FRAMEWORK REF: VX-QA-GOV-2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              Quality Assurance & Batch Traceability
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              End-to-end quality control architecture spanning verified raw-material screening, controlled clean packaging standards, and individual cryptographic serialization.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('verify')}
                className="cursor-pointer"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span>Verify Product Code</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('ziron')}
                className="cursor-pointer"
              >
                <span>Inspect Product Specifications</span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: QUALITY PHILOSOPHY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              FOUNDATIONAL COMMITMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              Our Quality Assurance Philosophy
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              In nutritional health, trust cannot be demanded—it must be systematically verified. VIREXON BIOSCIENCES approaches manufacturing not as a commoditized marketing exercise, but as a disciplined technical pipeline subject to documented internal specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Documented Protocols</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Manufacturing adheres to documented quality control standards, raw material screening protocols, and batch traceability. Quality documentation will be published as available.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Zero Fabricated Claims</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We strictly reject unsubstantiated certifications or fabricated regulatory seals. We state our current standards with absolute factual precision.
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">Container-Level Tracking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Counterfeits are prevented by assigning an individualized serialized verification code to every physical 30-capsule phase container.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: 4-STAGE QUALITY PIPELINE */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-1">
              CONTROL PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
              The Four Pillars of Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 1 */}
            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#0B2346] text-white px-2 py-0.5">
                  STAGE 01
                </span>
                <span className="text-[11px] font-mono text-gray-400">INPUT CONTROLS</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">Raw Material Sourcing & Identity Screening</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Raw compound lots undergo quarantine upon arrival. Ingredients are assessed for chemical identity, physical appearance, and moisture content before release into active formulation batches.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Chemical identity confirmation against standard compound profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Screening for moisture, solubility, and bulk density limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Supplier verification and chain-of-custody documentation</span>
                </li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#0B2346] text-white px-2 py-0.5">
                  STAGE 02
                </span>
                <span className="text-[11px] font-mono text-gray-400">PROCESS MONITORING</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">Controlled Packaging & Clean Standards</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Capsule blending and encapsulation operate under controlled humidity and temperature environments. Equipment contact surfaces adhere to documented clean sanitation protocols.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Continuous environmental humidity and ambient temperature logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Capsule weight variation and fill uniformity checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Quarantine verification between distinct phase production runs</span>
                </li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#0B2346] text-white px-2 py-0.5">
                  STAGE 03
                </span>
                <span className="text-[11px] font-mono text-gray-400">OUTPUT TESTING</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">Finished Product Analytical Testing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Prior to retail container assembly, representative specimens from each blending lot undergo finished-product checks to confirm physical integrity and disintegration parameters.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Capsule disintegration time testing to ensure timely gastric release</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Microbiological limit screening against regulatory thresholds</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Retention sample archiving for long-term stability monitoring</span>
                </li>
              </ul>
            </div>

            {/* Stage 4 */}
            <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#0B2346] text-white px-2 py-0.5">
                  STAGE 04
                </span>
                <span className="text-[11px] font-mono text-gray-400">PROVENANCE</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B2346]">Serialized Tamper-Evident Packaging</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Each finished unit is heat-sealed under a color-coded phase band and imprinted with a randomized 16-character cryptographic verification string (ZR-XXXX-XXXX-XXXX).
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Color-coded tamper seal (Phase 01 Red, Phase 02 Orange, Phase 03 Green)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Individual serialized identifier permanently etched on packaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0B2346] rounded-full shrink-0" />
                  <span>Cryptographic backend registry preventing duplicate or spoofed codes</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: SAMPLE / DEMONSTRATION BATCH DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          {/* Explicit Mandatory Demonstration Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <div className="font-bold font-mono tracking-wider uppercase mb-0.5">
                {content.quality.sampleNotice}
              </div>
              <p>
                The specimen parameters displayed below represent the technical data schema and verification layout used by the VIREXON verification system. Production analytical test reports and certificates of analysis will be linked to live verified batch numbers following product manufacturing and registration.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                VERIFICATION DATA ARCHITECTURE
              </span>
              <h3 className="text-lg font-bold text-[#0B2346]">
                Specimen Container Profile Schema
              </h3>
            </div>
            <div className="text-xs font-mono bg-gray-100 px-3 py-1.5 text-gray-700 border border-gray-200">
              SERIAL TEMPLATE: ZR-XXXX-XXXX-XXXX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">Identifier Format:</div>
              <div className="font-mono font-bold text-[#0B2346]">16-Char Alphanumeric</div>
              <div className="text-[10px] text-gray-400 mt-1">High-entropy cryptographic seed</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">Capsule Count / Container:</div>
              <div className="font-mono font-bold text-[#0B2346]">30 Capsules / Unit</div>
              <div className="text-[10px] text-gray-400 mt-1">Single 30-day supply phase</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">Regional Market:</div>
              <div className="font-mono font-bold text-[#0B2346]">Algeria Launch (DZD)</div>
              <div className="text-[10px] text-gray-400 mt-1">Designated commercial territory</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">Backend Verification:</div>
              <div className="font-mono font-bold text-emerald-700">Firebase Firestore Ready</div>
              <div className="text-[10px] text-gray-400 mt-1">Zero client-side authority</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-gray-500">
            <span>Manufacturing and quality documentation will be published as available.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('verify')}
              className="cursor-pointer"
            >
              Test Verification Interface →
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
