import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { ZIRON_CATALOG, formatDzdPrice } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Check, ShoppingBag, Shield, AlertCircle } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { content, locale } = useI18n();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

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
                {content.shop.tag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.shop.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {content.shop.subtitle}
            </p>
          </div>
        </div>

        {/* Currency Notice */}
        <div className="mb-8 p-4 bg-white border border-[#E2E8F0] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <Shield className="w-4 h-4 text-[#0B2346]" />
            <span>Target Distribution: Algeria Market Protocol</span>
          </div>
          <div className="font-mono text-gray-500 font-medium">
            Currency: DZD (Algerian Dinar)
          </div>
        </div>

        {/* Highlighted Complete Bundle */}
        {bundleItem && (
          <div className="mb-12 bg-white border-2 border-[#0B2346] p-6 sm:p-10 shadow-sm relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <Badge variant="navy" className="mb-3">
                  {bundleItem.badgeText}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2346] mb-2">
                  {bundleItem.name}
                </h2>
                <div className="text-sm font-semibold text-[#0B2346] mb-4">
                  {content.shop.bundleSpecs}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                  {bundleItem.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 border border-gray-200">
                    <span className="block text-[11px] font-mono uppercase text-gray-400">Phase 01</span>
                    <span className="text-xs font-bold text-[#0B2346]">30 capsules (Days 01–30)</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200">
                    <span className="block text-[11px] font-mono uppercase text-gray-400">Phase 02</span>
                    <span className="text-xs font-bold text-[#0B2346]">30 capsules (Days 31–60)</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200">
                    <span className="block text-[11px] font-mono uppercase text-gray-400">Phase 03</span>
                    <span className="text-xs font-bold text-[#0B2346]">30 capsules (Days 61–90)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-100 shrink-0">
                <div className="text-start lg:text-end">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 block">Unit Price (DZD)</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#0B2346]">
                    {formatDzdPrice(bundleItem.priceDzd, locale)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setSelectedProduct(bundleItem.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{content.shop.orderBundle}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Individual Phase Containers */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0B2346]">
            {content.shop.individualTitle}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Standard single phase containers containing 30 capsules each for structured phase replenishment.
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

                <h3 className="text-lg font-bold text-[#0B2346] mb-1">{item.name}</h3>

                <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-3 my-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Capsule Volume:</span>
                    <span className="font-bold text-[#0B2346]">{item.capsuleCount} capsules</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Supply Duration:</span>
                    <span className="font-bold text-[#0B2346]">{item.supplyDays}-day supply</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
                    <span className="text-gray-500 font-medium">Price (DZD):</span>
                    <span className="font-bold font-mono text-[#0B2346]">
                      {formatDzdPrice(item.priceDzd, locale)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-500">
                  {item.colorName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(item.id)}
                >
                  {content.shop.addToCart}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Selection Modal / Confirmation */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white max-w-md w-full p-6 border border-[#E2E8F0] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#0B2346]" />
                  <span className="font-bold text-sm text-[#0B2346]">Catalog Selection</span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-3 mb-6">
                <div className="p-3 bg-gray-50 border border-gray-200">
                  <div className="font-bold text-[#0B2346] mb-1">
                    {ZIRON_CATALOG.find((i) => i.id === selectedProduct)?.name}
                  </div>
                  <div className="text-gray-600">
                    Target Market: Algeria | Pricing in DZD
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed">
                  Notice: Commercial ordering and fulfillment gateway will be enabled following formal price publication and regional distributor onboarding.
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedProduct(null)}
                className="w-full"
              >
                Acknowledge & Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
