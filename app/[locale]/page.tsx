import DependenciesSection from "@/features/home/component/depndnces-sction";
import HeroSection from "@/features/home/component/hero";
import { HeroStats } from "@/features/home/component/hero-stats";
import StepsSection from "@/features/home/component/steps-sections";
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
    </main>
  );
}
