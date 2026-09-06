import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { ZIRON_CATALOG, formatDzdPrice, CatalogItem } from '@/lib/content/catalog';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';
import {
  Check,
  ShoppingBag,
  Shield,
  Truck,
  Package,
  Clock,
  EyeOff,
  CheckCircle2,
  X,
  CreditCard,
  MapPin,
  HelpCircle,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { content, locale, navigate } = useI18n();
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>('16 - Alger');

  const phaseItems = ZIRON_CATALOG.filter((item) => item.phase !== 'BUNDLE');
  const bundleItem = ZIRON_CATALOG.find((item) => item.phase === 'BUNDLE');

  const handleOpenOrder = (product: CatalogItem) => {
    setSelectedProduct(product);
    setOrderSubmitted(false);
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
  };

  const wilayasList = [
    '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
    '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
    '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
    '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
    '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
    '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
    '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
    '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
    '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
    '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
    '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
    '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa',
  ];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                COMMERCIAL DISTRIBUTION REGISTRY
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                TERRITORY: ALGERIA (DZD) • 58 WILAYAS
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              Official ZIRON Product Catalog
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-3xl">
              Authentic serialized containers engineered for structured 30-day and 90-day protocol adherence. All orders shipped across all 58 Algerian wilayas with Cash on Delivery and discreet outer packaging.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0B2346]" />
                <span>58 Wilayas Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#0B2346]" />
                <span>Cash on Delivery (Paiement à la livraison)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-[#0B2346]" />
                <span>100% Discreet Packaging</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 90-DAY COMPLETE BUNDLE (FEATURED) */}
        {bundleItem && (
          <section className="bg-white border-2 border-[#0B2346] p-6 sm:p-10 shadow-sm relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="navy">{bundleItem.badgeText}</Badge>
                  <span className="text-xs font-mono text-gray-400">{bundleItem.sku}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                  {bundleItem.name}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {bundleItem.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0]">
                    <span className="block text-[10px] font-mono uppercase text-red-600 font-bold">Month 01 • Red Seal</span>
                    <span className="text-xs font-bold text-[#0B2346]">30 Caps (Days 01–30)</span>
                  </div>
                  <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0]">
                    <span className="block text-[10px] font-mono uppercase text-amber-600 font-bold">Month 02 • Orange Seal</span>
                    <span className="text-xs font-bold text-[#0B2346]">30 Caps (Days 31–60)</span>
                  </div>
                  <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0]">
                    <span className="block text-[10px] font-mono uppercase text-emerald-600 font-bold">Month 03 • Green Seal</span>
                    <span className="text-xs font-bold text-[#0B2346]">30 Caps (Days 61–90)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    90 capsules total
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    3 unique serialized verification codes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Full ZIRON Hub digital entitlement
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-100 shrink-0">
                <div className="text-start lg:text-end">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                    Complete 90-Day Package (DZD)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B2346]">
                    {formatDzdPrice(bundleItem.priceDzd, locale)}
                  </span>
                  <span className="text-[11px] text-emerald-700 block font-medium mt-0.5">
                    Save 1,000 DZD compared to individual phases
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenOrder(bundleItem)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Complete 90-Day Bundle</span>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: INDIVIDUAL 30-DAY CONTAINERS */}
        <section className="space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              INDIVIDUAL REPLENISHMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
              Single 30-Day Phase Containers
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Order single containers as you progress, or replace a lost phase container.
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="navy">{item.badgeText}</Badge>
                    <span className="text-[11px] font-mono text-gray-400">{item.sku}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0B2346]">{item.name}</h3>

                  <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Capsule Volume:</span>
                      <span className="font-bold text-[#0B2346]">{item.capsuleCount} capsules</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Routine Target:</span>
                      <span className="font-bold text-[#0B2346]">{item.supplyDays}-day supply</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
                      <span className="text-gray-500 font-medium">Price (DZD):</span>
                      <span className="font-bold font-mono text-[#0B2346] text-sm">
                        {formatDzdPrice(item.priceDzd, locale)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.description}
                  </p>

                  <ul className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.colorName} tamper-evident seal</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Single serialized 16-character code</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Digital ZIRON Hub phase access</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-500">
                    {item.colorName}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenOrder(item)}
                    className="cursor-pointer"
                  >
                    Order Container
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 4: WHAT EACH PURCHASE INCLUDES */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              DELIVERABLE SPECIFICATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              What Every Purchase Includes
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every unit dispatched from our facilities conforms to strict physical and digital provenance standards:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Package className="w-6 h-6 text-[#0B2346]" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">Physical Container</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                High-density amber container protecting capsules against UV photodegradation and atmospheric moisture.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">30 Capsules / Unit</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Vegetarian capsule shells formulated without synthetic dyes, artificial flow agents, or undisclosed blends.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Shield className="w-6 h-6 text-[#0B2346]" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">Color-Coded Seal</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tamper-evident neck band showing immediate visual evidence of opening or interference.
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <QrCode className="w-6 h-6 text-[#0B2346]" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">Serialized Security Code</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Unique 16-character code verifying product authenticity and provisioning your participant access in ZIRON Hub.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SHIPPING, WILAYAS & DISCRETION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">58 Wilayas Coverage</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Full delivery coverage to all 58 wilayas across Algeria via established national logistics courier networks.
              </p>
              <div className="text-[11px] text-gray-500 font-mono">
                Northern Wilayas: 24–48 Hours<br />
                Southern Wilayas: 3–5 Business Days
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">Paiement à la Livraison</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pay securely in cash upon physical delivery. You are entitled to inspect the unbroken condition of the exterior parcel before completing payment.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">Discreet Packaging</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Packages are shipped in unmarked, opaque protective boxes with zero sensitive branding, preserving complete personal privacy.
              </p>
            </div>
          </div>
        </section>

        {/* ORDER MODAL */}
        {orderModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#E2E8F0] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!orderSubmitted ? (
                <form onSubmit={handleConfirmOrder} className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-mono uppercase text-gray-400">ORDER REQUEST</span>
                    <h3 className="text-lg font-bold text-[#0B2346]">
                      {selectedProduct.name}
                    </h3>
                    <div className="text-xs font-mono font-bold text-[#0B2346] mt-0.5">
                      Price: {formatDzdPrice(selectedProduct.priceDzd, locale)} (Cash on Delivery)
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Full Name (Nom et Prénom)
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Karim Mansouri"
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Phone Number (Numéro de téléphone)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0550 12 34 56"
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Delivery Wilaya (58 Wilayas)
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                      >
                        {wilayasList.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                    <strong>Payment Terms:</strong> Payment is collected in cash upon delivery to your address. Our delivery team will call you to confirm your address prior to dispatch.
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => setOrderModalOpen(false)}
                      className="w-1/2 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-1/2 cursor-pointer"
                    >
                      Confirm Order
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B2346]">
                    Order Request Received
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                    Thank you, <strong>{fullName || 'Customer'}</strong>. Your order for <strong>{selectedProduct.name}</strong> ({formatDzdPrice(selectedProduct.priceDzd, locale)}) for delivery to <strong>{wilaya}</strong> has been logged. Our dispatch team will contact you at <strong>{phone || 'your phone number'}</strong> to coordinate delivery.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setOrderModalOpen(false)}
                    className="cursor-pointer"
                  >
                    Return to Catalog
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
