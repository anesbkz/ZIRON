import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { ZIRON_CATALOG } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { ArrowRight, Shield, CheckCircle2, Layers, Compass, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { content, navigate, locale } = useI18n();

  const phaseItems = ZIRON_CATALOG.filter((item) => item.phase !== 'BUNDLE');

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0] pt-14 pb-20 sm:pt-20 sm:pb-28">
        <GridPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-[#E2E8F0] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0B2346]" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#0B2346]">
                {content.home.heroTag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-[1.15] mb-6">
              {content.home.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              {content.home.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('ziron')}
                className="flex items-center gap-2"
              >
                <span>{content.home.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('program')}
              >
                {content.home.secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Three-Phase Architecture Overview */}
      <section className="py-16 sm:py-20 bg-[#F5F7FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-2">
              SEQUENTIAL SYSTEM
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2346] mb-3">
              {content.home.phasesHeader}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {content.home.phasesDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  <h3 className="text-lg font-bold text-[#0B2346] mb-1">
                    {item.name}
                  </h3>

                  <div className="flex items-baseline gap-2 text-xs text-gray-500 font-medium mb-3">
                    <span className="font-semibold text-[#0B2346]">
                      {item.capsuleCount} capsules
                    </span>
                    <span>•</span>
                    <span>{item.supplyDays}-day supply</span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">
                    CONTAINER COLOR: {item.colorName}
                  </span>
                  <button
                    onClick={() => navigate('ziron')}
                    className="text-xs font-bold text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('shop')}
            >
              View Complete 90-Day Bundle in Catalog →
            </Button>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2346]">
              {content.home.pillarTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346] mb-2">
                {content.home.pillar1Title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {content.home.pillar1Desc}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346] mb-2">
                {content.home.pillar2Title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {content.home.pillar2Desc}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346] mb-2">
                {content.home.pillar3Title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {content.home.pillar3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification CTA Banner */}
      <section className="py-14 bg-[#0B2346] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>SERIALIZED PRODUCT IDENTIFIER SYSTEM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {content.home.verificationSectionTitle}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {content.home.verificationSectionBody}
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('verify')}
            className="shrink-0 bg-white text-[#0B2346] hover:bg-gray-100"
          >
            Go to Product Verification →
          </Button>
        </div>
      </section>
    </div>
  );
};
