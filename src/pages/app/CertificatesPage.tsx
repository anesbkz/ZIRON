import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Award,
  GraduationCap,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  FileCheck,
  Search,
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useI18n();
  const { hasSchoolAccess } = useCustomerEntitlements();

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Award className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>CREDENTIAL REGISTRY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                Verified Certificates
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                Review and share verified credentials earned through completion of accredited learning modules in ZIRON School.
              </p>
            </div>

            <Button
              onClick={() => navigate('app/school')}
              variant="primary"
              size="md"
              className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Browse School Curricula</span>
            </Button>
          </div>
        </div>

        {/* Clean Empty State */}
        <div className="bg-white border border-[#E2E8F0] p-10 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-[#0B2346] mb-2">
            No Verified Certificates Issued Yet
          </h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
            Certificates are issued server-authoritatively upon passing all module assessments and curriculum requirements within ZIRON School tracks. Complete your selected course curriculum to earn your first certified credential.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('app/school')}
              variant="primary"
              size="md"
              className="cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore ZIRON School</span>
            </Button>
            <Button
              onClick={() => navigate('app')}
              variant="outline"
              size="md"
              className="cursor-pointer justify-center"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>

        {/* Cryptographic Authenticity Disclosure */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-[#0B2346] uppercase tracking-wider text-[11px] block">
                Tamper-Proof Verification Standard
              </span>
              <p>
                All ZIRON School certificates receive a non-enumerable public verification token stored in our public credentials registry. Third parties and employers can verify authenticity without accessing any personal participant data or private health details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
