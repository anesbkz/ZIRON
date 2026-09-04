import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { ZIRON_CATALOG, formatDzdPrice } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Shield, Package, Check, ArrowRight, Info } from 'lucide-react';

export const ZironProductPage: React.FC = () => {
  const { content, navigate, locale } = useI18n();

  const phaseItems = ZIRON_CATALOG.filter((item) => item.phase !== 'BUNDLE');
  const bundleItem = ZIRON_CATALOG.find((item) => item.phase === 'BUNDLE');

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Dossier */}
        <div className="mb-10 bg-white border border-[#E2E8F0] p-6 sm:p-10 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346]">
                {content.ziron.dossierTag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.ziron.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {content.ziron.subtitle}
            </p>
          </div>
        </div>

        {/* Phase Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

                <h3 className="text-xl font-bold text-[#0B2346] mb-1">{item.name}</h3>

                <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-3 my-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Container Volume:</span>
                    <span className="font-bold text-[#0B2346]">{item.capsuleCount} capsules</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Protocol Phase:</span>
                    <span className="font-bold text-[#0B2346]">{item.supplyDays}-day supply</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                    <span className="text-gray-500 font-medium">Price (DZD):</span>
                    <span className="font-bold text-gray-600 font-mono">
                      {formatDzdPrice(item.priceDzd, locale)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-500">
                  {item.colorName} CONTAINER
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('shop')}
                >
                  Order Container
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* 90-Day Complete Bundle Card */}
        {bundleItem && (
          <div className="mb-12 bg-white border-2 border-[#0B2346] p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Badge variant="navy">{bundleItem.badgeText}</Badge>
                  <span className="text-xs font-mono text-gray-500">{bundleItem.sku}</span>
                </div>
                <h2 className="text-2xl font-bold text-[#0B2346] mb-2">
                  {bundleItem.name}
                </h2>
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
                    <span>Full 90-Day Sequence (Phase 01 + Phase 02 + Phase 03)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#2E9E45]" />
                    <span>Individual Serialized Product Verification Codes</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 shrink-0">
                <div className="text-start lg:text-end">
                  <div className="text-[11px] uppercase tracking-wider text-gray-500">Catalog Status</div>
                  <div className="text-base font-bold font-mono text-[#0B2346]">
                    {formatDzdPrice(bundleItem.priceDzd, locale)}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('shop')}
                  className="w-full sm:w-auto"
                >
                  View Bundle in Shop
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quality Oversight Note */}
        <Card variant="subtle" padding="md" className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-gray-600">
            <strong className="text-[#0B2346] block mb-1">
              {content.ziron.qualityCardTitle}
            </strong>
            {content.ziron.qualityCardBody}
          </div>
        </Card>
      </div>
    </div>
  );
};
