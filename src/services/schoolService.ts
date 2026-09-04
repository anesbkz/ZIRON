import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { SchoolCategory, SchoolCourse, UserProfile } from '@/types/models';
import { hasPermission } from '@/lib/rbac/permissions';

const CATEGORIES_COLLECTION = 'schoolCategories';
const COURSES_COLLECTION = 'schoolCourses';

export const DEFAULT_SEED_CATEGORIES: Omit<SchoolCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'skills',
    title: { en: 'Core Skills', fr: 'Compétences Fondamentales', ar: 'المهارات الأساسية' },
    description: {
      en: 'Foundational analytical, cognitive, and organizational execution frameworks.',
      fr: 'Cadres d\'exécution analytiques, cognitifs et organisationnels fondamentaux.',
      ar: 'أطر التنفيذ التحليلية والمعرفية والتنظيمية التأسيسية.',
    },
    iconName: 'Sparkles',
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: 'digital-skills',
    title: { en: 'Digital Skills', fr: 'Compétences Numériques', ar: 'المهارات الرقمية' },
    description: {
      en: 'Modern computational, data management, and software literacy competencies.',
      fr: 'Compétences modernes en informatique, gestion des données et logiciels.',
      ar: 'الكفاءات الحاسوبية الحديثة وإدارة البيانات واستخدام البرمجيات.',
    },
    iconName: 'Cpu',
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: 'agriculture',
    title: { en: 'Agriculture & Bio-Systems', fr: 'Agriculture & Bio-Systèmes', ar: 'الزراعة والأنظمة الحيوية' },
    description: {
      en: 'Modern precision farming, soil regeneration, and sustainable cultivation methods.',
      fr: 'Agriculture de précision moderne, régénération des sols et méthodes de culture durables.',
      ar: 'الزراعة الدقيقة الحديثة، وتجديد التربة، وأساليب الزراعة المستدامة.',
    },
    iconName: 'Sprout',
    displayOrder: 3,
    isPublished: true,
  },
  {
    slug: 'entrepreneurship',
    title: { en: 'Entrepreneurship & Commerce', fr: 'Entrepreneuriat & Commerce', ar: 'ريادة الأعمال والتجارة' },
    description: {
      en: 'Venture establishment, micro-enterprise economics, and product distribution.',
      fr: 'Création d\'entreprises, économie des micro-entreprises et distribution.',
      ar: 'تأسيس المشاريع، واقتصاد المشاريع المتناهية الصغر، وتوزيع المنتجات.',
    },
    iconName: 'TrendingUp',
    displayOrder: 4,
    isPublished: true,
  },
  {
    slug: 'personal-development',
    title: { en: 'Personal Development & Mastery', fr: 'Développement Personnel & Maîtrise', ar: 'التطوير الشخصي والتمكن' },
    description: {
      en: 'Cognitive resilience, behavioral discipline, and performance optimization.',
      fr: 'Résilience cognitive, discipline comportementale et optimisation des performances.',
      ar: 'المرونة المعرفية، والانضباط السلوكي، وتحسين الأداء.',
    },
    iconName: 'Compass',
    displayOrder: 5,
    isPublished: true,
  },
  {
    slug: 'trades',
    title: { en: 'Technical Trades', fr: 'Métiers Techniques', ar: 'الحرف والمهن التقنية' },
    description: {
      en: 'Applied mechanical, electrical, and fabrication technical capabilities.',
      fr: 'Capacités techniques appliquées en mécanique, électricité et fabrication.',
      ar: 'القدرات التقنية التطبيقية في الميكانيكا والكهرباء والتصنيع.',
    },
    iconName: 'Wrench',
    displayOrder: 6,
    isPublished: true,
  },
  {
    slug: 'employment',
    title: { en: 'Professional Employment Readiness', fr: 'Préparation à l\'Emploi', ar: 'الجاهزية للتوظيف المهني' },
    description: {
      en: 'Professional articulation, interview strategies, and workplace coordination.',
      fr: 'Articulation professionnelle, stratégies d\'entretien et coordination.',
      ar: 'التواصل المهني، واستراتيجيات المقابلات، والتنسيق في بيئة العمل.',
    },
    iconName: 'Briefcase',
    displayOrder: 7,
    isPublished: true,
  },
  {
    slug: 'business',
    title: { en: 'Strategic Business Operations', fr: 'Opérations Commerciales Stratégiques', ar: 'إدارة الأعمال الاستراتيجية' },
    description: {
      en: 'Financial literacy, operational supply chains, and managerial governance.',
      fr: 'Littératie financière, chaînes d\'approvisionnement et gouvernance managériale.',
      ar: 'الثقافة المالية، وسلاسل التوريد التشغيلية، والحوكمة الإدارية.',
    },
    iconName: 'BarChart3',
    displayOrder: 8,
    isPublished: true,
  },
];

/**
 * List all categories from Firestore.
 * Fallback to seed list if database collection is not yet populated.
 */
export async function listSchoolCategories(includeUnpublished = false): Promise<SchoolCategory[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      // Return formatted seed items if collection has not been seeded yet
      return DEFAULT_SEED_CATEGORIES.map((cat, idx) => ({
        ...cat,
        id: `seed-${cat.slug}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    const categories = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SchoolCategory, 'id'>),
    }));

    const filtered = includeUnpublished ? categories : categories.filter((c) => c.isPublished);
    return filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.warn('Error reading school categories from Firestore, using default seed:', error);
    return DEFAULT_SEED_CATEGORIES.map((cat, idx) => ({
      ...cat,
      id: `seed-${cat.slug}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Admin: Create a new School Category via authoritative Cloud Function.
 * Direct client addDoc is strictly forbidden by Firestore rules.
 */
export async function createSchoolCategory(
  data: Omit<SchoolCategory, 'id' | 'createdAt' | 'updatedAt'>,
  _actor?: UserProfile
): Promise<string> {
  const createCategoryCallable = httpsCallable<
    Omit<SchoolCategory, 'id' | 'createdAt' | 'updatedAt'>,
    { success: boolean; id: string }
  >(functionsInstance, 'createSchoolCategory');

  try {
    const res = await createCategoryCallable(data);
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create school category.');
  }
}

/**
 * Admin: Update an existing School Category via authoritative Cloud Function.
 * Direct client updateDoc is strictly forbidden by Firestore rules.
 */
export async function updateSchoolCategory(
  id: string,
  data: Partial<SchoolCategory>,
  _actor?: UserProfile
): Promise<void> {
  const updateCategoryCallable = httpsCallable<
    { categoryId: string; updates: Partial<SchoolCategory> },
    { success: boolean; categoryId: string }
  >(functionsInstance, 'updateSchoolCategory');

  try {
    await updateCategoryCallable({ categoryId: id, updates: data });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update school category.');
  }
}

/**
 * Admin: Delete a School Category via authoritative Cloud Function.
 */
export async function deleteSchoolCategory(categoryId: string): Promise<void> {
  const deleteCategoryCallable = httpsCallable<
    { categoryId: string },
    { success: boolean; categoryId: string }
  >(functionsInstance, 'deleteSchoolCategory');

  try {
    await deleteCategoryCallable({ categoryId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete school category.');
  }
}

/**
 * Admin: Create a new School Course via authoritative Cloud Function.
 */
export async function createSchoolCourse(
  data: Omit<SchoolCourse, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const createCourseCallable = httpsCallable<
    Omit<SchoolCourse, 'id' | 'createdAt' | 'updatedAt'>,
    { success: boolean; id: string }
  >(functionsInstance, 'createSchoolCourse');

  try {
    const res = await createCourseCallable(data);
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create school course.');
  }
}

/**
 * Admin: Update an existing School Course via authoritative Cloud Function.
 */
export async function updateSchoolCourse(
  courseId: string,
  updates: Partial<SchoolCourse>
): Promise<void> {
  const updateCourseCallable = httpsCallable<
    { courseId: string; updates: Partial<SchoolCourse> },
    { success: boolean; courseId: string }
  >(functionsInstance, 'updateSchoolCourse');

  try {
    await updateCourseCallable({ courseId, updates });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update school course.');
  }
}

/**
 * Admin: Delete a School Course via authoritative Cloud Function.
 */
export async function deleteSchoolCourse(courseId: string): Promise<void> {
  const deleteCourseCallable = httpsCallable<
    { courseId: string },
    { success: boolean; courseId: string }
  >(functionsInstance, 'deleteSchoolCourse');

  try {
    await deleteCourseCallable({ courseId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete school course.');
  }
}

/**
 * List courses for a specific category.
 */
export async function listCoursesByCategory(
  categoryId: string,
  includeUnpublished = false
): Promise<SchoolCourse[]> {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('categoryId', '==', categoryId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    const courses = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SchoolCourse, 'id'>),
    }));
    return includeUnpublished ? courses : courses.filter((c) => c.isPublished);
  } catch (error) {
    console.warn(`Could not load courses for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Checks whether user has valid entitlement to ZIRON School curriculum.
 * Entitlement must be backend-derived from verified product activations
 * or staff permissions, not arbitrary client claims.
 */
export function checkSchoolEntitlement(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return hasPermission(user, 'ACCESS_SCHOOL');
}

/**
 * Public Certificate Verification
 * Queries /publicCertificates/{certificateNumber} directly by known certificate number.
 * Contains only non-sensitive verification data (certificateNumber, recipientName, courseTitle, issuedAt, status).
 * Prevents enumeration / listing of all student certificates and leaks zero PII.
 */
export async function verifyPublicCertificate(
  certificateNumber: string
): Promise<{ certificateNumber: string; recipientName: string; courseTitle: string; issuedAt: string; status: string } | null> {
  const cleanNumber = certificateNumber.trim().toUpperCase();
  if (!cleanNumber) return null;

  try {
    const certDocRef = doc(db, 'publicCertificates', cleanNumber);
    const snap = await getDoc(certDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as {
      certificateNumber: string;
      recipientName: string;
      courseTitle: string;
      issuedAt: string;
      status: string;
    };
  } catch (error) {
    console.warn('Public certificate verification error:', error);
    return null;
  }
}

/**
 * Lists private certificates issued to a specific student.
 * Firestore rules restrict this to the student owner or staff.
 */
export async function getUserCertificates(userId: string) {
  try {
    const q = query(collection(db, 'certificates'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error reading certificates:', error);
    return [];
  }
}

