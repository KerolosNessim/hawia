import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as motion  from "framer-motion/client";
import { Gem, Rocket, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/features/shared/components/section-header";

export default function SeoPackages() {
  const t = useTranslations("singleService.seoPackages");
  return (
    <div className="bg-gray-900 py-16 ">
      <div className="container space-y-8">
        <SectionHeader title={t("title")} />
        <RenderPackages />
      </div>
    </div>
  );
}

const RenderPackages = () => {
  const t = useTranslations("singleService.seoPackages");
  const seoPackages = t.raw("seoPackages") as {
    title: string;
    description: string;
    button: string;
    icon: string;
    isPopular?: boolean;
  }[];

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "target":
        return <Target className={className} />;
      case "gem":
        return <Gem className={className} />;
      case "rocket":
        return <Rocket className={className} />;
      default:
        return <Target className={className} />;
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
      {seoPackages.map((pkg, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="h-full"
        >
          <Card
            className={`h-full  transition-shadow duration-300 hover:shadow-xl rounded-2xl flex flex-col ${
              pkg.isPopular
                ? "border-2 border-brand shadow-lg md:scale-107 z-10 bg-white"
                : "border border-gray-200 bg-white"
            }`}
          >
            <CardContent className="p-8 flex flex-col items-center text-center h-full">
              <div className="mb-6 mx-auto bg-gray-50 rounded-full p-4 border border-gray-100 shadow-sm">
                {getIcon(pkg.icon, "w-10 h-10 text-brand")}
              </div>

              <h3
                className={`text-xl font-bold mb-4 ${pkg.isPopular ? "text-brand" : "text-gray-900"}`}
              >
                {pkg.title}
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed text-sm flex-1">
                {pkg.description}
              </p>

              <Button
                className={`w-32 rounded-full font-bold shadow-md transition-all duration-300 ${
                  pkg.isPopular
                    ? "bg-brand hover:bg-brand/90 text-white"
                    : "bg-brand hover:bg-brand/90 text-white"
                }`}
              >
                {pkg.button}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
