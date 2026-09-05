import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { SchoolCategory, SchoolCourse } from '@/types/models';
import {
  listSchoolCategories,
  listCoursesByCategory,
  checkSchoolEntitlement,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import {
  GraduationCap,
  Lock,
  BookOpen,
  Award,
  ChevronRight,
  Loader2,
  Clock,
} from 'lucide-react';

export const AppSchoolPage: React.FC = () => {
  const { user, profile, loading: authLoading, isStaff } = useAuth();
  const { locale, navigate } = useI18n();
  const { hasSchoolAccess } = useCustomerEntitlements();

  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SchoolCategory | null>(null);
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const hasAccess = Boolean(isStaff || hasSchoolAccess || checkSchoolEntitlement(profile));

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

  if (authLoading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        VERIFYING CURRICULAR PRIVILEGES...
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
              Authentication Required
            </h1>
            <p className="text-xs text-gray-600 mb-6">
              Sign in to your ZIRON participant profile to access the dynamic learning academy.
            </p>
            <Button
              onClick={() => navigate('login')}
              variant="primary"
              size="md"
              className="w-full"
            >
              Sign In to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not entitled
  if (!hasAccess) {
    return (
      <div className="py-16 bg-[#F5F7FA]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm relative text-center">
            <GridPattern />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28] font-bold block mb-1">
                ADVANCED ENTITLEMENT REQUIRED
              </span>
              <h1 className="text-2xl font-black text-[#0B2346] mb-3">
                ZIRON School Locked
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Curriculum access requires verified multi-phase container activation. In accordance with the ZIRON journey, verified serial activations from active program phases unlock the mastery curriculum tracks.
              </p>

              <div className="p-4 bg-gray-50 border border-gray-200 text-start text-xs font-mono mb-6 space-y-1">
                <div className="text-gray-500 font-bold uppercase text-[10px]">Entitlement Check</div>
                <div className="flex justify-between">
                  <span>School Entitlement:</span>
                  <span className="text-red-600 font-bold">LOCKED</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Activation:</span>
                  <span className="text-gray-700 font-semibold">Verified ZIRON Phase Container</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="flex-1 cursor-pointer"
                >
                  Activate Product Code
                </Button>
                <Button
                  onClick={() => navigate('app')}
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              CURRICULUM ACCESS ACTIVE
            </div>
            <h1 className="text-2xl font-black text-[#0B2346]">
              ZIRON School of Applied Mastery
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Explore dynamic modular courses across biological, technological, and enterprise tracks.
            </p>
          </div>
        </div>

        {/* Dynamic Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
          {categories.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            const title = cat.title[locale] || cat.title.en;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-[#0B2346] text-white border-[#0B2346]'
                    : 'bg-white text-gray-700 border-[#E2E8F0] hover:bg-gray-50'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Courses Section */}
        {selectedCategory && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] p-6">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1">
                ACTIVE TRACK: {selectedCategory.slug.toUpperCase()}
              </span>
              <h2 className="text-lg font-bold text-[#0B2346]">
                {selectedCategory.title[locale] || selectedCategory.title.en}
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                {selectedCategory.description[locale] || selectedCategory.description.en}
              </p>
            </div>

            {loadingCourses ? (
              <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
                LOADING COURSES...
              </div>
            ) : courses.length === 0 ? (
              /* Explicit empty state */
              <div className="p-12 text-center bg-white border border-[#E2E8F0]">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  No courses published in this track yet
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Curriculum modules for this track are currently being finalized by the scientific and academic advisory board.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border border-[#E2E8F0] p-5 hover:border-[#0B2346] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#0B2346] text-[10px] font-mono font-bold uppercase">
                        {course.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.estimatedHours} Hours
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                      {course.title[locale] || course.title.en}
                    </h3>
                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                      {course.description[locale] || course.description.en}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Curriculum Modules
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
