import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Shield, QrCode, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { content } = useI18n();
  const [code, setCode] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setHasSubmitted(true);
  };

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Dossier */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8F0] mb-3">
            <Shield className="w-3.5 h-3.5 text-[#0B2346]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B2346]">
              {content.verify.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2346] mb-3">
            {content.verify.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            {content.verify.subtitle}
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-10 shadow-sm mb-8 relative">
          <GridPattern />
          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="verification-code-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0B2346] mb-2"
                >
                  {content.verify.inputLabel}
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
                    placeholder={content.verify.inputPlaceholder}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-[#E2E8F0] font-mono text-sm uppercase tracking-wider text-[#0B2346] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2346] focus:border-[#0B2346] transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="shrink-0"
                    disabled={!code.trim()}
                  >
                    {content.verify.verifyButton}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setIsQrModalOpen(true)}
                    className="shrink-0 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{content.verify.scanQrButton}</span>
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-gray-500 font-mono">
                  Standard format: ZR followed by serialized alphanumeric characters.
                </p>
              </div>
            </form>

            {/* Submission Response: Transparent Backend Integration Status */}
            {hasSubmitted && (
              <div className="mt-8 p-5 bg-blue-50/70 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-[#0B2346] uppercase tracking-wider">
                      Verification Query Logged: {code}
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {content.verify.backendIntegrationNotice}
                    </p>
                    <div className="text-[11px] text-gray-600 bg-white p-3 border border-blue-100 font-mono">
                      Query Parameters: Serial="{code}" | Status="PENDING_FIREBASE_CMS_INTEGRATION"
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security and Integrity Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Card variant="subtle" padding="sm" className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B2346] block mb-0.5">
                Serialized Product Identifier
              </span>
              <p className="text-gray-600 leading-relaxed">
                {content.verify.securityNote}
              </p>
            </div>
          </Card>

          <Card variant="subtle" padding="sm" className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B2346] block mb-0.5">
                Packaging Seal Checklist
              </span>
              <p className="text-gray-600 leading-relaxed">
                Check that outer seals are intact and match the batch designation on the base of your container.
              </p>
            </div>
          </Card>
        </div>

        {/* QR Scan Information Modal */}
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

              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 border border-dashed border-gray-300 mx-auto flex items-center justify-center mb-3">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Camera QR scanning will be linked directly to device cameras and the upcoming Firebase verification database upon commercial batch shipment.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-full"
                >
                  Return to Manual Entry
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
