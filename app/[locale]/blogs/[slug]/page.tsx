import RatingSection from "@/features/blogs/components/rating-section";
import RelatedBlogsSection from "@/features/blogs/components/related-blogs-section";
import ShareSection from "@/features/blogs/components/share-sction";
import PageHeader from "@/features/shared/components/page-header";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";

export default function SingleBlogPage() {
  return (
    <div className="pb-16 space-y-16">
      <PageHeader
        image="/blogs-banner.jfif"
        title="أنواع التجارة الإلكترونية | دليل شامل لأشهر الأنواع وفوائدها"
      />

      {/* main image  */}
      <div className="lg:w-2/3 mx-auto max-lg:container space-y-8">
        <Image
          src={"/blog.webp"}
          width={500}
          height={500}
          alt="single blog"
          className="w-full "
        />
        <div className="flex items-center justify-between">
          {/* logo and name */}
          <div className="flex items-center gap-4">
            <Image
              src={"/logo.png"}
              width={200}
              height={200}
              alt="logo"
              className="size-12 bg-white rounded-full object-contain ring-2 ring-offset-2 ring-brand"
            />
            <p className="text-gray-900 font-bold">
              هُوِيَّة للحلول التسويقية والرقمية
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* date */}
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-brand" />
              <p className="text-gray-900 font-bold">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            {/* time */}
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-brand" />
              <p className="text-gray-900 font-bold">
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* rate */}
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className="size-5 text-yellow-500 " />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="container text-gray-900 font-semibold ">
        <p className="text-lg">
          <span className="text-brand font-bold">
            أنواع التجارة الإلكترونية
          </span>{" "}
          تتنوع بناءً على أطراف المعاملة (بائع ومشتري)، وتشمل الأنواع الرئيسية:
          بيع الشركات للمستهلكين (B2C) كالمتاجر، والبيع بين الشركات (B2B)، وبين
          المستهلكين (C2C) كالمزادات، وبيع المستهلك للشركات (C2B). تتميز هذه
          الأنواع بالسرعة، وتنوع المنتجات، وتوفر طرق دفع رقمية، وتساهم في تقليل
          التكاليف التشغيلية.
        </p>
      </div>

      {/* describtion */}
      <div className="lg:w-2/3 mx-auto max-lg:container space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-bold  text-brand">
          ما هي التجارة الإلكترونية؟
        </h1>

        {/* Paragraph */}
        <p>
          هي عملية بيع وشراء المنتجات أو الخدمات عبر الإنترنت، وتشمل تبادل
          البيانات والمعلومات بين الشركات والأفراد باستخدام التكنولوجيا الحديثة.
        </p>

        {/* List */}
        <ul className="list-disc marker:text-brand  space-y-2 ">
          <li>توفر الوقت والجهد للعملاء.</li>
          <li>تسمح بالوصول إلى عملاء عالميين.</li>
          <li>تقلل التكاليف التشغيلية.</li>
          <li>تساعد في تحليل سلوك العملاء.</li>
        </ul>

        {/* Image Placeholder */}
        <div>
          <div className="w-full h-[300px] relative rounded-xl overflow-hidden ">
            <Image
              src="/single-blog-1.webp"
              alt="blog"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Section */}
        <h2 className="text-2xl font-bold  text-brand">
          أنواع التجارة الإلكترونية
        </h2>

        {/* Subsection */}
        <h3 className="text-xl font-bold ">التجارة بين الشركات (B2B)</h3>

        <p>يتم فيها تبادل المنتجات أو الخدمات بين الشركات وبعضها البعض.</p>

        <ul className="list-disc marker:text-brand  space-y-2 ">
          <li>بيع بالجملة</li>
          <li>توريد المنتجات</li>
          <li>عقود طويلة الأمد</li>
        </ul>

        {/* Subsection */}
        <h3 className="text-xl font-bold ">
          التجارة بين الشركات والمستهلك (B2C)
        </h3>

        <p>وهي الأكثر انتشارًا، حيث تبيع الشركات منتجاتها مباشرة للمستهلكين.</p>

        <ul className="list-disc marker:text-brand  space-y-2 ">
          <li>متاجر إلكترونية</li>
          <li>تجربة مستخدم سهلة</li>
          <li>خيارات دفع متعددة</li>
        </ul>

        {/* Image Placeholder */}
        <div>
          <div className="w-full h-[300px] relative rounded-xl overflow-hidden ">
            <Image
              src="/single-blog-2.webp"
              alt="blog"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Subsection */}
        <h3 className="text-xl font-bold ">التجارة بين المستهلكين (C2C)</h3>

        <p className="mb-4">
          تتم بين الأفراد مثل البيع عبر المنصات الإلكترونية.
        </p>

        <ul className="list-disc marker:text-brand space-y-2">
          <li>منصات بيع مستعمل</li>
          <li>مزادات إلكترونية</li>
          <li>تبادل المنتجات</li>
        </ul>
        <div className="w-full h-[300px] relative rounded-xl overflow-hidden ">
          <Image
            src="/single-blog-3.webp"
            alt="blog"
            fill
            className="object-contain"
          />
        </div>
        {/* Subsection */}
        <h3 className="text-xl font-bold ">
          التجارة الإلكترونية من شركة إلى حكومة (B2G)
        </h3>

        <p className="mb-4">
          تشمل الشركات التي تقدم خدمات أو منتجات للقطاعات الحكومية، مثل شركات
          تصميم مواقع إلكترونية للمؤسسات الحكومية.
        </p>

        <ul className="list-disc marker:text-brand space-y-2">
          <li>منصات بيع مستعمل</li>
          <li>مزادات إلكترونية</li>
          <li>تبادل المنتجات</li>
        </ul>
        {/* Subsection */}
        <h3 className="text-xl font-bold ">
          التجارة الإلكترونية من المستهلك إلى حكومة (C2G)
        </h3>

        <p className="mb-4">
          يتضمن معاملات المستهلك مع الحكومة إلكترونيًا، مثل تقديم الإقرارات
          الضريبية أو إصدار السجلات التجارية عبر الإنترنت.
        </p>

        <ul className="list-disc marker:text-brand space-y-2">
          <li>منصات بيع مستعمل</li>
          <li>مزادات إلكترونية</li>
          <li>تبادل المنتجات</li>
        </ul>
      </div>


      {/* rating section */}
      <RatingSection />

      {/* share section  */}
      <ShareSection />
      
      {/* related blogs section */}
      <RelatedBlogsSection />
    </div>
  );
}
