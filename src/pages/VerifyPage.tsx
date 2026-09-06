import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Shield,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Lock,
  Search,
  Check,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Layers,
  Sparkles,
  BookOpen,
  Users,
  Calendar,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { content, navigate } = useI18n();
  const [code, setCode] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setHasSubmitted(true);
  };

  const handleUseDemoCode = () => {
    setCode('ZR-PH01-DEMO-001');
    setHasSubmitted(false);
  };

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <Shield className="w-3.5 h-3.5 text-[#0B2346]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold">
                VIREXON AUTHENTICATION GATEWAY
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              Product Security & Code Verification
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
              Authenticate your physical ZIRON phase container, confirm batch integrity, and unlock your participant entitlements across the digital ecosystem.
            </p>
          </div>
        </section>

        {/* SECTION 2: VERIFICATION TERMINAL */}
        <section className="bg-white border-2 border-[#0B2346] p-6 sm:p-10 shadow-sm relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                TERMINAL STATUS: READY
              </span>
              <h2 className="text-xl font-bold text-[#0B2346]">
                Enter 16-Character Serialized Code
              </h2>
            </div>
            <button
              type="button"
              onClick={handleUseDemoCode}
              className="text-xs font-mono text-[#0B2346] hover:underline bg-gray-100 px-3 py-1.5 border border-gray-200 cursor-pointer self-start lg:self-auto"
            >
              Use Sample Code: ZR-PH01-DEMO-001
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="verification-code-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2"
              >
                Container Verification Code (Format: ZR-XXXX-XXXX-XXXX)
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="verification-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setHasSubmitted(false);
                  }}
                  placeholder="e.g. ZR-8F92-K4B1-09XA"
                  className="flex-1 px-4 py-3 bg-[#F5F7FA] border border-[#E2E8F0] font-mono text-base uppercase tracking-wider text-[#0B2346] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2346] transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="shrink-0 cursor-pointer"
                  disabled={!code.trim()}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Verify Authenticity</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsQrModalOpen(true)}
                  className="shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Verification Result Feedback */}
          {hasSubmitted && (
            <div className="mt-8 p-6 bg-blue-50/80 border border-blue-200 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0B2346] text-sm uppercase font-mono">
                      Query Logged: {code}
                    </span>
                    <Badge variant="emerald">AUTHENTIC FORMAT</Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    This verification query has been registered in the VIREXON database. If you hold an authenticated customer account, this container unlocks your corresponding 30-day phase companion tracking and educational resources.
                  </p>
                  <div className="p-3 bg-white border border-blue-100 font-mono text-[11px] text-gray-600 space-y-1">
                    <div>Query ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
                    <div>Validation Status: <strong className="text-emerald-700">PASS (VALID ALPHANUMERIC ENTROPY)</strong></div>
                    <div>Target Market: ALGERIA (DZD)</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('app')}
                  className="cursor-pointer"
                >
                  Go to Customer Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCode('');
                    setHasSubmitted(false);
                  }}
                  className="cursor-pointer"
                >
                  Verify Another Container
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: WHERE TO FIND YOUR CODE & TAMPER SEAL */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2346]">Where to Locate Your Code</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every genuine ZIRON container features an individualized security label positioned directly beneath the neck collar. Scratch off the opaque protective coating gently with a coin to reveal your 16-character code.
            </p>
            <div className="p-3 bg-gray-50 border border-gray-200 font-mono text-xs text-gray-700">
              Format: ZR-XXXX-XXXX-XXXX (Alphanumeric)
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2346]">Tamper-Evident Seal Inspection</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Check that your container collar seal is completely intact prior to opening:
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Phase 01: Red Security Seal</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>Phase 02: Orange Security Seal</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Phase 03: Green Security Seal</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: WHAT VERIFICATION UNLOCKS */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              DIGITAL ENTITLEMENTS
            </span>
            <h2 className="text-2xl font-black text-[#0B2346] tracking-tight">
              What Happens After Verification
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Verification bridges your physical nutritional routine with secure digital platform capabilities:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Shield className="w-6 h-6 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">Authenticity Check</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Confirmation that your container was produced under documented VIREXON standards and was not subject to counterfeit duplication.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Calendar className="w-6 h-6 text-[#0B2346]" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">Daily Companion</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Activates your 30-day streak tracker, morning intake reminder logs, and hydration tracking metrics inside ZIRON Hub.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <BookOpen className="w-6 h-6 text-[#0B2346]" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">ZIRON School</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Unlocks access to practical curriculum modules covering habit formation, circadian health, digital skills, and trade ventures.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Users className="w-6 h-6 text-[#0B2346]" />
              <h4 className="text-xs font-bold uppercase text-[#0B2346]">Community Cohort</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Grants participant posting rights within moderated peer cohort rooms for ongoing mutual accountability.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SAFETY & INTEGRITY WARNING */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="flex items-start gap-4 text-amber-900">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-amber-900 uppercase">
                Critical Safety Warning & Support Reporting
              </h3>
              <p>
                <strong>DO NOT CONSUME:</strong> If the neck seal appears broken, sliced, torn, or re-adhered upon delivery, do not open the inner container or consume the capsules. Refuse delivery or contact our support team immediately.
              </p>
              <p>
                <strong>REPORT INVALID CODES:</strong> If your code is flagged as already registered or invalid, immediately retain the container packaging and contact VIREXON Security Support with your order confirmation number for investigation.
              </p>
            </div>
          </div>
        </section>

        {/* QR SCAN MODAL */}
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white max-w-md w-full p-6 border border-[#E2E8F0] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0B2346]" />
                  <span className="font-bold text-sm text-[#0B2346]">
                    Camera QR Scanner
                  </span>
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-gray-100 border border-dashed border-gray-300 mx-auto flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-sm font-bold text-[#0B2346]">Camera Scanner Readiness</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Optical camera verification scans the micro-QR etched on genuine product packaging seals. If your camera is unavailable, enter the 16-character alphanumeric code directly into the input field above.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsQrModalOpen(false);
                      handleUseDemoCode();
                    }}
                    className="w-full cursor-pointer"
                  >
                    Simulate Scan with Demo Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
