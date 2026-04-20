import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/features/shared/components/page-header";
import { useTranslations } from "next-intl";
import ClientCard from "@/features/clients/components/client-card";

export default function ClientsPage() {
  const t = useTranslations("clients");
  const tabs = t.raw("tabs") as string[];

  const clientsData = [
    {
      title: "تطبيق أهديك",
      category: "تطبيقات جوال",
      logo: "/logo.png",
      phoneImage: "/clients/phone-bicycle.png",
      flowerImage: "/clients/flowers.png",
      categoryKey: "الكل",
    },
    {
      title: "متجر الدراجات",
      category: "تجارة إلكترونية",
      logo: "/logo.png",
      phoneImage: "/clients/phone-bicycle.png",
      flowerImage: "/clients/flowers.png",
      categoryKey: "تصميم المواقع",
    },
    {
      title: "خدمة توصيل",
      category: "تطبيقات جوال",
      logo: "/logo.png",
      phoneImage: "/clients/phone-bicycle.png",
      flowerImage: "/clients/flowers.png",
      categoryKey: "التسويق الالكتروني",
    },
    {
      title: "نظام إدارة",
      category: "برمجيات",
      logo: "/logo.png",
      phoneImage: "/clients/phone-bicycle.png",
      flowerImage: "/clients/flowers.png",
      categoryKey: "seo",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      <PageHeader
        title={t("title")}
        description={t("description")}
        image="/hero-bg.webp"
      />
      <div className="container mx-auto px-4">
        <Tabs
          defaultValue="tab-0"
          className="static flex w-full flex-col items-center max-md:gap-12"
        >
          <TabsList className="mb-26 md:mb-12 flex h-auto flex-wrap justify-center gap-2 bg-transparent">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={`tab-${index}`}
                className="rounded-full bg-gray-900 px-6 h-12 text-sm text-white transition duration-300 hover:bg-brand hover:text-white data-[state=active]:bg-brand data-[state=active]:text-white shadow-sm md:text-base"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab, index) => (
            <TabsContent key={index} value={`tab-${index}`} className="w-full">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 ">
                {clientsData
                  .filter((client) => index === 0 || client.categoryKey === tab)
                  .map((client, clientIndex) => (
                    <ClientCard
                      key={clientIndex}
                      title={client.title}
                      category={client.category}
                      logo={client.logo}
                      phoneImage={client.phoneImage}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
