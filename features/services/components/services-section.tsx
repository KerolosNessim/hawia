import SectionHeader from '@/features/shared/components/section-header'
import { getTranslations } from 'next-intl/server'
import React from 'react'
import ServicesCard from './services-card';
import { BadgeDollarSign, CodeXml, FileImage, Megaphone, MonitorPlay, Search, Store, Users } from 'lucide-react';

export default async function ServicesSection() {
  const t = await getTranslations("servicesSection")
  const items = t.raw("items") as { title: string, description: string }[];
  const icons = [
    Search,
    Megaphone,
    Users,
    Store,
    FileImage,
    MonitorPlay,
    CodeXml,
    BadgeDollarSign,
  ];
  
  return (
    <section className="container py-16 space-y-8">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        align="center"
        subtitleColor="text-gray-500"
      />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {items.map((item, index) => (
          <ServicesCard icon={icons[index]} key={index} item={item}  index={index}/>
        ))}
      </div>
    </section>
  );
}
