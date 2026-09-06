import React, { useState, useMemo } from 'react';
import { useI18n } from '@/context/I18nContext';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Badge } from '@/components/design-system/Badge';
import {
  ChevronDown,
  Search,
  HelpCircle,
  Package,
  Calendar,
  Truck,
  Shield,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface FaqItem {
  category: string;
  categoryLabel: string;
  q: string;
  a: string;
}

export const FaqPage: React.FC = () => {
  const { content, navigate } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'product', label: 'Product & Formulation' },
    { id: 'program', label: '90-Day Program' },
    { id: 'shipping', label: 'Ordering & Wilayas' },
    { id: 'verification', label: 'Authenticity & Verification' },
    { id: 'safety', label: 'Health & Safety Disclaimers' },
  ];

  const allFaqs: FaqItem[] = [
    // 1. Product & Formulation
    {
      category: 'product',
      categoryLabel: 'Product & Formulation',
      q: 'What is ZIRON?',
      a: 'ZIRON is a sequential 90-day dietary wellness system created by VIREXON BIOSCIENCES. It couples clean, bioavailable micronutrient formulations with structured morning routines to support behavioral consistency, hydration, and long-term habit consolidation.',
    },
    {
      category: 'product',
      categoryLabel: 'Product & Formulation',
      q: 'How many capsules are included in each container?',
      a: 'Each phase container contains exactly 30 vegetarian capsules, providing a 30-day supply taken at one capsule per day. The complete 90-Day Bundle includes three phase containers (Phase 01, Phase 02, and Phase 03) totaling 90 capsules.',
    },
    {
      category: 'product',
      categoryLabel: 'Product & Formulation',
      q: 'What is in the formula and are there proprietary blends?',
      a: 'VIREXON BIOSCIENCES strictly avoids undisclosed proprietary blends. Formulas use bioavailable nutrients without artificial dyes or redundant fillers. Detailed quantitative specifications and analytical testing dossiers will be published as commercial batches are registered.',
    },
    {
      category: 'product',
      categoryLabel: 'Product & Formulation',
      q: 'What is the transparent disclosure policy?',
      a: 'We adhere to absolute factual transparency: we do not publish fabricated clinical trials or unsupported regulatory approvals. All chemical identities, physical screening standards, and batch certificates are documented according to verifiable analytical protocols.',
    },

    // 2. 90-Day Program
    {
      category: 'program',
      categoryLabel: '90-Day Program',
      q: 'Why is the program designed around 90 days?',
      a: 'Neurobiological and behavioral research indicates that establishing durable, autonomous habits requires approximately 66 to 90 days of continuous reinforcement. The 90-day trajectory provides the necessary temporal continuity to move from conscious effort to ingrained baseline behavior.',
    },
    {
      category: 'program',
      categoryLabel: '90-Day Program',
      q: 'Can I purchase just Phase 01, or must I buy the whole bundle?',
      a: 'You may purchase individual 30-day phase containers (Phase 01, Phase 02, or Phase 03) separately to progress month-by-month, or acquire the Complete 90-Day Program Bundle for comprehensive uninterrupted coverage.',
    },
    {
      category: 'program',
      categoryLabel: '90-Day Program',
      q: 'How does digital phase progression work?',
      a: 'In the public presentation, Phase 01, 02, and 03 represent the chronological habit trajectory. In the authenticated digital system (ZIRON Hub), access to digital resources is granted based on verified container security codes, not arbitrary frontend locks.',
    },
    {
      category: 'program',
      categoryLabel: '90-Day Program',
      q: 'What should I do if I miss a day?',
      a: 'Follow the ZIRON Restart Protocol: do not double-dose. Acknowledge the interruption factually, resume your regular single-capsule intake the following morning with water, and re-engage with your companion dashboard and community cohort.',
    },

    // 3. Ordering & Shipping (Algeria)
    {
      category: 'shipping',
      categoryLabel: 'Ordering & Wilayas',
      q: 'What are the product prices in Algerian Dinars (DZD)?',
      a: 'Single 30-day containers (Phase 01, Phase 02, or Phase 03) are priced at 3,500 DZD each. The Complete 90-Day Program Bundle (all three containers, 90 capsules total) is 9,500 DZD.',
    },
    {
      category: 'shipping',
      categoryLabel: 'Ordering & Wilayas',
      q: 'Do you deliver to all 58 Algerian wilayas?',
      a: 'Yes. Orders are shipped across all 58 wilayas of Algeria via vetted national courier delivery services. Standard delivery takes 24–48 hours for northern wilayas and 3–5 business days for southern regions.',
    },
    {
      category: 'shipping',
      categoryLabel: 'Ordering & Wilayas',
      q: 'What payment methods are supported?',
      a: 'We support Cash on Delivery (Paiement à la livraison) across all 58 wilayas, allowing you to inspect package seal integrity prior to completing payment. Electronic payment methods will be integrated upon formal banking rollout.',
    },
    {
      category: 'shipping',
      categoryLabel: 'Ordering & Wilayas',
      q: 'Is package delivery discreet?',
      a: 'Yes. All orders are packed in neutral, opaque outer protective packaging without sensitive external labels, ensuring complete discretion and privacy upon delivery to your home or workplace.',
    },

    // 4. Authenticity & Verification
    {
      category: 'verification',
      categoryLabel: 'Authenticity & Verification',
      q: 'Where is the container verification code located?',
      a: 'Every genuine ZIRON container features an individualized, tamper-evident security seal with a scratch-off protective panel revealing a 16-character alphanumeric code in the format ZR-XXXX-XXXX-XXXX.',
    },
    {
      category: 'verification',
      categoryLabel: 'Authenticity & Verification',
      q: 'What does container verification unlock?',
      a: 'Entering your unique code in the Product Verification portal confirms unit authenticity, verifies manufacturing batch provenance, and provisions your digital participant entitlements in the ZIRON Hub (including access to ZIRON School and moderated community spaces).',
    },
    {
      category: 'verification',
      categoryLabel: 'Authenticity & Verification',
      q: 'What if my verification code reports an error or shows as already used?',
      a: 'If a code returns an invalid response or displays previous activation, do not consume the product. Contact VIREXON Support immediately with your order reference and a clear photograph of the security seal for investigation.',
    },

    // 5. Health, Safety & Medical Disclaimers
    {
      category: 'safety',
      categoryLabel: 'Health & Safety Disclaimers',
      q: 'Is ZIRON a medicine or pharmaceutical drug?',
      a: 'No. ZIRON is a dietary wellness supplement and lifestyle adherence protocol. It is not a pharmaceutical drug and does not require a medical prescription.',
    },
    {
      category: 'safety',
      categoryLabel: 'Health & Safety Disclaimers',
      q: 'Can ZIRON cure substance addiction or psychiatric disorders?',
      a: 'No. ZIRON does not diagnose, treat, cure, or prevent substance abuse disorders, physiological dependence, alcoholism, clinical depression, or psychiatric illness. It is not an addiction cure or a substitute for professional rehabilitation or clinical healthcare.',
    },
    {
      category: 'safety',
      categoryLabel: 'Health & Safety Disclaimers',
      q: 'Who should NOT take ZIRON?',
      a: 'ZIRON is intended solely for healthy adults aged 18 and older. Individuals who are pregnant, nursing, under medical supervision, or taking prescription drugs must consult their physician before starting.',
    },
    {
      category: 'safety',
      categoryLabel: 'Health & Safety Disclaimers',
      q: 'Do I need to consult a doctor before starting?',
      a: 'We strongly advise consulting a licensed physician or healthcare professional prior to initiating any new dietary supplement program, particularly if you manage pre-existing health conditions or take regular medications.',
    },
  ];

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold">
                VIREXON INFORMATION REGISTRY
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Transparent answers regarding the ZIRON product formulation, 90-day program mechanics, nationwide Algerian delivery, security verification, and health boundaries.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. capsules, wilaya, verification, prescription)..."
              className="w-full bg-white border border-[#E2E8F0] pl-11 pr-4 py-3 text-sm text-[#0B2346] focus:outline-none focus:ring-2 focus:ring-[#0B2346] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-gray-600"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B2346] text-white shadow-xs'
                      : 'bg-white border border-[#E2E8F0] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 text-center text-gray-500">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-[#0B2346] text-base mb-1">No matching questions found</p>
              <p className="text-xs text-gray-500">
                Try searching with different keywords or switch categories.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 flex items-start justify-between text-start cursor-pointer hover:bg-gray-50/70 gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                        {item.categoryLabel}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#0B2346]">
                        {item.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0B2346]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Direct Action Box */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-[#0B2346] mb-1">
              Have a specific question not covered here?
            </h3>
            <p className="text-xs text-gray-600">
              Our support team assists with batch verification, order status across all 58 wilayas, and technical questions.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('verify')}
              className="cursor-pointer"
            >
              Verify Code
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('shop')}
              className="cursor-pointer"
            >
              View Shop
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
