import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { SchoolCategory, SchoolCourse } from '@/types/models';
import {
  listSchoolCategories,
  listCoursesByCategory,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  GraduationCap,
  Lock,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AppSchoolPage: React.FC = () => {
  const { user, loading: authLoading, isStaff } = useAuth();
  const { locale, dir, navigate } = useI18n();
  const t = getAppTranslations(locale);
  const { hasSchoolAccess, qualifyingContainerCount } = useCustomerEntitlements();

  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SchoolCategory | null>(null);
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Access requires staff bypass OR authoritative active SCHOOL_ACCESS entitlement (or qualifying count >= 3)
  const hasAccess = Boolean(isStaff || hasSchoolAccess || qualifyingContainerCount >= 3);

  useEffect(() => {
    async function loadCats() {
      if (!hasAccess) {
        setLoading(false);
        return;
      }
      try {
        const data = await listSchoolCategories(false);
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCats();
  }, [hasAccess]);

  useEffect(() => {
    async function loadCourses() {
      if (!selectedCategory) return;
      setLoadingCourses(true);
      try {
        const c = await listCoursesByCategory(selectedCategory.id, false);
        setCourses(c);
      } finally {
        setLoadingCourses(false);
      }
    }
    if (selectedCategory) {
      loadCourses();
    }
  }, [selectedCategory]);

  const count = Math.max(0, Math.min(3, qualifyingContainerCount));

  // Determine dynamic message based on 3-container count
  const getStatusMessage = () => {
    if (count === 0) return t.school.zeroContainersMsg;
    if (count === 1) return t.school.oneContainerMsg;
    if (count === 2) return t.school.twoContainersMsg;
    return t.school.threeContainersMsg;
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        {t.common.verifying}
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
            <Lock className="w-8 h-8 text-[#0B2346] mx-auto mb-3" />
            <h1 className="text-xl font-bold text-[#0B2346] mb-2">
              {t.shell.authRequiredTitle}
            </h1>
            <p className="text-xs text-gray-600 mb-6">
              {t.shell.authRequiredDesc}
            </p>
            <Button
              onClick={() => navigate('login')}
              variant="primary"
              size="md"
              className="w-full cursor-pointer"
            >
              {t.common.signIn}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not entitled: Show 3-container qualification progress
  if (!hasAccess) {
    const progressPercent = Math.round((count / 3) * 100);

    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm relative text-center">
            <GridPattern />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4 rounded-full">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28] font-bold block mb-1">
                {t.school.lockedTitle}
              </span>
              <h1 className="text-2xl font-black text-[#0B2346] mb-3">
                {t.school.title}
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
                {t.school.ruleExplanation}
              </p>

              {/* 3-Container Qualification Progress Box */}
              <div className="p-5 bg-gray-50 border border-gray-200 text-start text-xs mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B2346] text-xs">
                    {t.school.progressLabel}
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono text-xs font-bold text-[#0B2346] bg-white px-2.5 py-0.5 border border-gray-200"
                  >
                    {count} / 3
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-200 h-2 overflow-hidden">
                  <div
                    className="bg-[#0B2346] h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 3 Step Indicators */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[1, 2, 3].map((step) => {
                    const isCompleted = count >= step;
                    return (
                      <div
                        key={step}
                        className={`p-2 border text-center text-[11px] font-mono transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-white border-gray-200 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shrink-0" />
                          )}
                          <span dir="ltr">#{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Guidance Message */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#0B2346] font-medium leading-relaxed">
                    {getStatusMessage()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>{count === 0 ? t.school.activateFirstBtn : t.school.activateAnotherBtn}</span>
                  {dir === 'rtl' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => navigate('app')}
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                >
                  {t.common.backToDashboard}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked State: Full Curriculum Academy
  return (
    <div className="py-10 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.school.curriculumAccessActive}</span>
              <span className="mx-1">•</span>
              <span dir="ltr">3 / 3 {t.school.containersUnlockedBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346]">
              {t.school.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              {t.school.subtitle}
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Button
              onClick={() => navigate('app/certificates')}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              {t.shell.navCertificates}
            </Button>
          </div>
        </div>

        {/* Dynamic Category Navigation Tabs */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const title = cat.title[locale] || cat.title.en;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-[#0B2346] text-white border-[#0B2346] shadow-sm'
                      : 'bg-white text-gray-700 border-[#E2E8F0] hover:bg-gray-50'
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>
        )}

        {/* Courses Section */}
        {selectedCategory && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] p-6">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1">
                {t.school.activeTrack}: <span dir="ltr">{selectedCategory.slug.toUpperCase()}</span>
              </span>
              <h2 className="text-lg font-bold text-[#0B2346]">
                {selectedCategory.title[locale] || selectedCategory.title.en}
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                {selectedCategory.description[locale] || selectedCategory.description.en}
              </p>
            </div>

            {loadingCourses ? (
              <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
                {t.school.loadingCourses}
              </div>
            ) : courses.length === 0 ? (
              /* Explicit empty state */
              <div className="p-12 text-center bg-white border border-[#E2E8F0] space-y-2">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  {t.school.noCoursesTitle}
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  {t.school.noCoursesDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                  const difficultyLabel =
                    course.difficulty === 'beginner'
                      ? t.school.difficultyBeginner
                      : course.difficulty === 'advanced'
                      ? t.school.difficultyAdvanced
                      : t.school.difficultyIntermediate;

                  return (
                    <div
                      key={course.id}
                      className="bg-white border border-[#E2E8F0] p-6 hover:border-[#0B2346] transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-[#0B2346] text-[10px] font-mono font-bold uppercase border border-blue-100">
                            {difficultyLabel}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span dir="ltr">{course.estimatedHours}</span> {t.school.hoursCount}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0B2346] mb-1.5">
                          {course.title[locale] || course.title.en}
                        </h3>
                        <p className="text-xs text-gray-600 mb-5 leading-relaxed line-clamp-2">
                          {course.description[locale] || course.description.en}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full cursor-pointer">
                        {t.school.viewCurriculumBtn}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
