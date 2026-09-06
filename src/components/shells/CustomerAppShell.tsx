import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { PublicRoute } from '@/types';
import { LOCALES } from '@/lib/i18n/config';
import { Locale } from '@/types';
import {
  LayoutDashboard,
  Compass,
  Package,
  QrCode,
  MessageSquare,
  GraduationCap,
  Gift,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Lock,
  CheckCircle2,
  ExternalLink,
  Globe,
  Bell,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NavItem {
  id: PublicRoute;
  label: string;
  labelAr: string;
  labelFr: string;
  icon: React.ComponentType<{ className?: string }>;
  gatedBy?: 'COMMUNITY_ACCESS' | 'SCHOOL_ACCESS';
  badge?: string;
}

const CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    id: 'app',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    labelFr: 'Tableau de bord',
    icon: LayoutDashboard,
  },
  {
    id: 'app/journey',
    label: 'My Journey',
    labelAr: 'مساري',
    labelFr: 'Mon Parcours',
    icon: Compass,
  },
  {
    id: 'app/products',
    label: 'My Products',
    labelAr: 'منتجاتي',
    labelFr: 'Mes Produits',
    icon: Package,
  },
  {
    id: 'app/products/activate',
    label: 'Activate Product',
    labelAr: 'تفعيل منتج',
    labelFr: 'Activer un Produit',
    icon: QrCode,
    badge: 'NEW',
  },
  {
    id: 'app/community',
    label: 'Community',
    labelAr: 'المجتمع',
    labelFr: 'Communauté',
    icon: MessageSquare,
    gatedBy: 'COMMUNITY_ACCESS',
  },
  {
    id: 'app/school',
    label: 'ZIRON School',
    labelAr: 'مدرسة ZIRON',
    labelFr: 'École ZIRON',
    icon: GraduationCap,
    gatedBy: 'SCHOOL_ACCESS',
  },
  {
    id: 'app/rewards',
    label: 'Rewards',
    labelAr: 'المكافآت',
    labelFr: 'Récompenses',
    icon: Gift,
  },
  {
    id: 'app/certificates',
    label: 'Certificates',
    labelAr: 'الشهادات',
    labelFr: 'Certificats',
    icon: Award,
  },
  {
    id: 'app/profile',
    label: 'Profile',
    labelAr: 'الملف الشخصي',
    labelFr: 'Profil',
    icon: User,
  },
];

export const CustomerAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading: authLoading, isStaff, logout } = useAuth();
  const { route, navigate, locale, setLocale, dir } = useI18n();
  const { hasCommunityAccess, hasSchoolAccess } = useCustomerEntitlements();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B2346] flex flex-col items-center justify-center text-white font-mono text-xs p-6">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin mb-4" />
        <div className="tracking-widest uppercase">INITIALIZING BIOTECH ENVIRONMENT...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-[#0B2346] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
            PARTICIPANT AUTHENTICATION REQUIRED
          </span>
          <h1 className="text-xl font-black text-[#0B2346] mb-3">
            ZIRON Ecosystem
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Please authenticate your verified customer profile to access the personalized ZIRON platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('login')}
              className="flex-1 px-4 py-2.5 bg-[#0B2346] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#07162c] cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('')}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-[#0B2346] text-xs font-bold uppercase tracking-wider hover:bg-gray-200 cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getLocalizedLabel = (item: NavItem) => {
    if (locale === 'ar') return item.labelAr;
    if (locale === 'fr') return item.labelFr;
    return item.label;
  };

  const handleNav = (target: PublicRoute) => {
    navigate(target);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#0B2346] flex flex-col antialiased" dir={dir}>
      {/* Top Clinical Utility Bar */}
      <aside aria-label="System status" className="bg-[#0B2346] text-white text-[11px] py-1.5 px-4 border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2E9E45] animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-white/90 text-[10px]">
              VIREXON BIOSCIENCES
            </span>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span className="text-white/70 hidden sm:inline text-[10px]">
              ZIRON Digital Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isStaff && (
              <button
                onClick={() => navigate('admin')}
                className="text-[10px] font-mono font-bold bg-[#D62828] text-white px-2 py-0.5 uppercase tracking-wider hover:bg-red-700 cursor-pointer inline-flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>Command Center</span>
              </button>
            )}

            {/* Locale Selector */}
            <div className="flex items-center gap-1 text-[10px] font-mono border border-white/20 px-1 py-0.5 bg-black/20">
              <Globe className="w-3 h-3 text-white/70" />
              {Object.values(LOCALES).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code as Locale)}
                  className={`px-1 rounded-xs uppercase cursor-pointer ${
                    locale === l.code
                      ? 'bg-white text-[#0B2346] font-bold'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l.code}
                </button>
              ))}
            </div>

            {/* Return to Public Site */}
            <button
              onClick={() => navigate('')}
              className="text-white/60 hover:text-white text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 cursor-pointer"
              title="Return to Public Site"
            >
              <span>Site</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <div
            onClick={() => handleNav('app')}
            className="flex items-center gap-3 cursor-pointer select-none"
            role="button"
            tabIndex={0}
          >
            <div className="w-9 h-9 bg-[#0B2346] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xs">
              ZR
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-widest text-[#0B2346] leading-none">
                ZIRON
              </span>
              <span className="text-[8px] font-bold tracking-[0.25em] text-gray-400 uppercase mt-0.5">
                BY VIREXON
              </span>
            </div>
          </div>

          {/* Desktop Primary Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {CUSTOMER_NAV_ITEMS.map((item) => {
              const isActive = route === item.id;
              const isGated =
                (item.gatedBy === 'COMMUNITY_ACCESS' && !hasCommunityAccess) ||
                (item.gatedBy === 'SCHOOL_ACCESS' && !hasSchoolAccess);

              return (
                <button
                  key={item.id}
                  id={`customer-nav-desktop-${item.id.replace(/\//g, '-')}`}
                  onClick={() => handleNav(item.id)}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'text-[#0B2346] border-b-2 border-[#0B2346] bg-gray-50/50'
                      : 'text-gray-600 hover:text-[#0B2346] hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0B2346]' : 'text-gray-400'}`} />
                  <span>{getLocalizedLabel(item)}</span>
                  {isGated && (
                    <Lock className="w-2.5 h-2.5 text-gray-400 shrink-0" title="Activation required" />
                  )}
                  {item.badge && !isActive && (
                    <span className="text-[8px] font-mono px-1 py-0.2 bg-[#F28C28] text-white font-bold tracking-tighter">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right User Dossier & Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              id="customer-profile-dossier-btn"
              onClick={() => handleNav('app/profile')}
              className="flex items-center gap-2 p-1.5 pl-2.5 bg-gray-50 border border-[#E2E8F0] hover:border-gray-300 text-left transition-colors cursor-pointer"
            >
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[#0B2346] leading-tight">
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.displayName || 'Participant'}
                </span>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                  {profile?.roles?.[0] || 'CUSTOMER'}
                </span>
              </div>
              <div className="w-7 h-7 bg-[#0B2346] text-white flex items-center justify-center font-bold text-[11px]">
                {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
              </div>
            </button>

            <button
              id="customer-logout-btn"
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-[#D62828] hover:bg-red-50 border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="customer-mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-[#E2E8F0] text-[#0B2346] hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
            {/* User header in mobile */}
            <div className="p-3 bg-gray-50 border border-[#E2E8F0] flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center font-bold text-xs">
                  {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2346]">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.displayName || 'Participant'}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-500 hover:text-[#D62828] text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {CUSTOMER_NAV_ITEMS.map((item) => {
                const isActive = route === item.id;
                const isGated =
                  (item.gatedBy === 'COMMUNITY_ACCESS' && !hasCommunityAccess) ||
                  (item.gatedBy === 'SCHOOL_ACCESS' && !hasSchoolAccess);

                return (
                  <button
                    key={item.id}
                    id={`customer-nav-mobile-${item.id.replace(/\//g, '-')}`}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#0B2346] text-white'
                        : 'bg-gray-50 text-[#0B2346] hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span>{getLocalizedLabel(item)}</span>
                    </div>
                    {isGated && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-gray-200 text-gray-700">
                        <Lock className="w-2.5 h-2.5" />
                        <span>LOCKED</span>
                      </span>
                    )}
                    {item.badge && !isGated && !isActive && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 bg-[#F28C28] text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Application Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Structured Customer App Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0B2346]">ZIRON</span>
            <span>•</span>
            <span>VIREXON BIOSCIENCES Research & Innovation</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Educational & wellness support platform. Neutral bio-scientific research guidance.
          </div>
        </div>
      </footer>
    </div>
  );
};
