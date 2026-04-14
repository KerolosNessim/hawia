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

export default async function Home() {
  return (
    <main>
      <HeroSection />
      <div className="container xl:hidden mb-16">
        <HeroStats />
      </div>
      <WhyUsSection />
      <ServicesSection />
      <StepsSection />
      <DependenciesSection />
      <AdsSection />
      <TestimonialsSection />
      <ClientsSection/>
      <PackagesSection />
      <ArticlesSection />
      <ContactSection />
    </main>
  );
}
