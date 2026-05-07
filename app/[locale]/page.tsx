import AdsSection from "@/features/home/component/ads-section";
import ArticlesSection from "@/features/blogs/components/articles-section";
import ClientsSection from "@/features/home/component/clients-section";
import ContactSection from "@/features/home/component/contact-section";
import DependenciesSection from "@/features/home/component/depndnces-sction";
import HeroSection from "@/features/home/component/hero";
import { HeroStats } from "@/features/home/component/hero-stats";
import PackagesSection from "@/features/home/component/packages-section";
import StepsSection from "@/features/home/component/steps-sections";
import TestimonialsSection from "@/features/home/component/testimonials-section";
import WhyUsSection from "@/features/home/component/why-us-section";
import ServicesSection from "@/features/services/components/services-section";
import { getLandingPageData } from "@/features/home/services/hero";

export default async function Home() {
  const data = await getLandingPageData();
  console.log(data);

  if(!data.data) return null
  
  return (
    <main>
      <HeroSection heroData={data?.data?.hero} />
      <div className="bg-gray-900">
        <div className="container mx-auto lg:-translate-y-16 max-lg:pt-16">
          <HeroStats stats={data?.data?.hero?.stats} />
        </div>
        <WhyUsSection />
      </div>
      <ServicesSection />
      <StepsSection />
      <DependenciesSection accreditation={data?.data?.accreditation} />
      <AdsSection />
      <TestimonialsSection />
      <ClientsSection partners={data?.data?.partners} />
      <PackagesSection />
      <ArticlesSection />
      <ContactSection />
    </main>
  );
}
