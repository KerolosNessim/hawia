"use client";

import { Button } from "@/components/ui/button";
import PageHeader from "@/features/shared/components/page-header";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  ShoppingCart,
  Star,
  Users
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const course = {
  title: "دورة إعلانات ميتا – من الصفر للاحتراف",
  subtitle: "حملات ناجحة وتحويلات فعلية · أمثلة عملية وتطبيقات حقيقية",
  image: "/course.webp",
  price: "$200",
  rating: 4.9,
  reviewsCount: 1240,
  studentsCount: "3,500+",
  duration: "12 ساعة",
  level: "مبتدئ → محترف",
  language: "العربية",
  lastUpdated: "أبريل 2026",
  instructor: "فريق هوية للتسويق",
  badge: "كورس",

  description: `تعلّم كيف تُطلق حملات إعلانية مدفوعة ناجحة على منصة ميتا (فيسبوك وإنستجرام) من الصفر حتى الاحتراف. ستكتسب فهماً عميقاً لمدير الإعلانات، وطرق استهداف الجمهور، وتحليل النتائج، وتحسين العائد على الإنفاق الإعلاني (ROAS).

  صُمِّمت الدورة لتكون عملية 100%: كل درس مدعوم بأمثلة حقيقية من السوق الخليجي، وتطبيقات تفاعلية تُمكّنك من البدء فوراً.`,

  objectives: [
    "إعداد حساب Business Manager وإدارته باحترافية",
    "فهم هيكل الحملات: الحملة، المجموعة، الإعلان",
    "إنشاء جماهير مخصصة وجماهير مشابهة",
    "تصميم إعلانات جذابة بمختلف أنواعها",
    "قراءة التقارير وتحليل مؤشرات الأداء",
    "تقليل تكلفة الاكتساب وتحسين ROAS",
    "إعداد البكسل وتتبع التحويلات",
    "بناء استراتيجية إعلانية متكاملة",
  ],

  curriculum: [
    {
      id: 1,
      title: "مقدمة – عالم إعلانات ميتا",
      lessons: [
        { title: "مرحباً بك في الدورة", duration: "05:00", preview: true },
        { title: "نظرة عامة على منصة ميتا", duration: "08:22", preview: false },
        { title: "إعداد Business Manager", duration: "12:10", preview: false },
      ],
    },
    {
      id: 2,
      title: "هيكل الحملة الإعلانية",
      lessons: [
        {
          title: "الحملة – المجموعة – الإعلان",
          duration: "10:00",
          preview: false,
        },
        {
          title: "أهداف الحملة وكيف تختار الصح",
          duration: "09:30",
          preview: false,
        },
        {
          title: "ميزانية الحملة ومتى تتحكم فيها",
          duration: "07:45",
          preview: false,
        },
      ],
    },
    {
      id: 3,
      title: "الاستهداف والجماهير",
      lessons: [
        {
          title: "الاستهداف الجغرافي والديموغرافي",
          duration: "11:20",
          preview: false,
        },
        { title: "الاهتمامات والسلوكيات", duration: "09:00", preview: false },
        {
          title: "الجماهير المخصصة والمشابهة",
          duration: "14:00",
          preview: false,
        },
      ],
    },
    {
      id: 4,
      title: "تصميم الإعلان وأنواعه",
      lessons: [
        { title: "إعلان الصورة المفردة", duration: "08:00", preview: false },
        { title: "إعلان الفيديو والريلز", duration: "10:30", preview: false },
        {
          title: "إعلان الكاروسيل والكتالوج",
          duration: "12:00",
          preview: false,
        },
      ],
    },
    {
      id: 5,
      title: "البكسل والتتبع",
      lessons: [
        { title: "تثبيت البكسل على موقعك", duration: "09:45", preview: false },
        { title: "إعداد الأحداث المخصصة", duration: "11:00", preview: false },
        {
          title: "تتبع التحويلات وقياس النتائج",
          duration: "13:00",
          preview: false,
        },
      ],
    },
    {
      id: 6,
      title: "التحليل والتحسين",
      lessons: [
        {
          title: "قراءة تقارير مدير الإعلانات",
          duration: "08:30",
          preview: false,
        },
        { title: "كيف تحسّن أداء حملاتك؟", duration: "12:20", preview: false },
        {
          title: "استراتيجية متكاملة من الصفر",
          duration: "20:00",
          preview: false,
        },
      ],
    },
  ],
};



function CurriculumSection() {
  const [open, setOpen] = useState<number | null>(1);

  const totalLessons = course.curriculum.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">منهج الدورة</h2>
      <p className="text-sm text-gray-500 mb-5">
        {course.curriculum.length} أقسام · {totalLessons} درس
      </p>

      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
        {course.curriculum.map((section) => (
          <div key={section.id}>
            {/* Section header */}
            <button
              onClick={() => setOpen(open === section.id ? null : section.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-right"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">
                  {section.id}
                </span>
                <span className="font-semibold text-gray-800 text-sm">
                  {section.title}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{section.lessons.length} دروس</span>
                {open === section.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {/* Lessons */}
            {open === section.id && (
              <div className="bg-gray-50/60 divide-y divide-gray-100">
                {section.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="flex items-center justify-between px-6 py-3 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle size={16} className="text-brand shrink-0" />
                      <span className="text-sm text-gray-700">
                        {lesson.title}
                      </span>
                      {lesson.preview && (
                        <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                          معاينة مجانية
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {lesson.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function CourseSidebar() {
  return (
    <div className="sticky top-24 space-y-4">
      {/* Image preview */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <Image
          src={course.image}
          alt={course.title}
          width={600}
          height={340}
          className="w-full object-cover aspect-video"
        />
      </div>

      {/* Price card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-gray-900">
            {course.price}
          </span>
          <span className="text-xs text-gray-400 line-through">$350</span>
        </div>

        <Button className="w-full bg-brand text-white hover:bg-brand/90 h-12 text-base font-bold rounded-xl gap-2 shadow-md hover:shadow-lg transition-all">
          <ShoppingCart size={18} />
          سجّل في الدورة الآن
        </Button>



      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SingleCoursePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        title={course.title}
        image={course.image}
      />

      {/* ── Body ── */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Left column: content ── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                عن هذه الدورة
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {course.description}
              </p>
            </section>

            {/* Objectives */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                ماذا ستتعلم؟
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={17}
                      className="text-brand mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{obj}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <CurriculumSection />
            </section>


          </div>

          {/* ── Right column: sidebar ── */}
          <div className="lg:col-span-1">
            <CourseSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
