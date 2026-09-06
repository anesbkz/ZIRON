import { PublicCatalogItem } from './types';
import { Locale } from '@/types';

export type CatalogItem = PublicCatalogItem;
export type { PublicCatalogItem };

/**
 * ZIRON Product Catalog Model
 * Initial target market: Algeria (DZD).
 * 
 * Strict specifications:
 * - Phase 01: 30 capsules / 30-day supply (3,500 DZD)
 * - Phase 02: 30 capsules / 30-day supply (3,500 DZD)
 * - Phase 03: 30 capsules / 30-day supply (3,500 DZD)
 * - Complete Bundle: 3 x 30 capsules = 90 capsules total (9,500 DZD)
 */
export const ZIRON_CATALOG: PublicCatalogItem[] = [
  {
    id: 'ziron-phase-01',
    sku: 'ZR-PH01-30C',
    phase: 1,
    name: 'ZIRON Phase 01',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 3500,
    description: 'Phase 01 nutritional formulation container designed for the initial 30-day program phase.',
    badgeText: 'PHASE 01 — PROGRAM PHASE',
    containerColorHex: '#D62828',
    colorName: 'CRIMSON',
  },
  {
    id: 'ziron-phase-02',
    sku: 'ZR-PH02-30C',
    phase: 2,
    name: 'ZIRON Phase 02',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 3500,
    description: 'Phase 02 nutritional formulation container designed for the intermediate 30-day program phase.',
    badgeText: 'PHASE 02 — PROGRAM PHASE',
    containerColorHex: '#F28C28',
    colorName: 'AMBER',
  },
  {
    id: 'ziron-phase-03',
    sku: 'ZR-PH03-30C',
    phase: 3,
    name: 'ZIRON Phase 03',
    capsuleCount: 30,
    supplyDays: 30,
    priceDzd: 3500,
    description: 'Phase 03 nutritional formulation container designed for the final 30-day program phase.',
    badgeText: 'PHASE 03 — PROGRAM PHASE',
    containerColorHex: '#2E9E45',
    colorName: 'EMERALD',
  },
  {
    id: 'ziron-complete-bundle',
    sku: 'ZR-BNDL-90C',
    phase: 'BUNDLE',
    name: 'ZIRON 90-Day Complete Program Bundle',
    capsuleCount: 90, // Exactly 3 x 30 capsules = 90 capsules total
    supplyDays: 90,
    priceDzd: 9500,
    description: 'Complete three-phase protocol kit comprising three 30-capsule containers (Phase 01, Phase 02, and Phase 03) providing 90 capsules total.',
    badgeText: 'COMPLETE 90-DAY PROTOCOL BUNDLE',
    containerColorHex: '#0B2346',
    colorName: 'TRI-PHASE NAVY',
  },
];

/**
 * Formats DZD pricing for Algeria target market or returns localized configuration status.
 */
export function formatDzdPrice(priceDzd: number | null, locale: Locale = 'en'): string {
  if (priceDzd === null || priceDzd === undefined) {
    if (locale === 'ar') return 'السعر قيد التحديد';
    if (locale === 'fr') return 'Prix à configurer';
    return 'Price to be configured';
  }

  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(priceDzd);
  return locale === 'ar' ? `${formatted} د.ج` : `${formatted} DZD`;
}
