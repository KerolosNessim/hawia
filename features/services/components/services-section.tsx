"use client"

import SectionHeader from '@/features/shared/components/section-header'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import ServicesCard from './services-card';
import { BadgeDollarSign, CodeXml, FileImage, Megaphone, MonitorPlay, Search, Store, Users } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

export default function ServicesSection() {
  const t = useTranslations("servicesSection")
  const items = t.raw("items") as { title: string, description: string }[];
  const [selectedCountry, setSelectedCountry] = useState("SA");
  
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
      <div className='flex items-center justify-center gap-4'>
        <label className={`cursor-pointer rounded-lg p-1 transition-all flex items-center gap-2 border-2 ${selectedCountry === "SA" ? "border-brand scale-110 shadow-md" : "border-transparent opacity-50 hover:opacity-100"}`}>
          <input 
            type="radio" 
            name="country" 
            value="SA" 
            checked={selectedCountry === "SA"} 
            onChange={(e) => setSelectedCountry(e.target.value)} 
            className="hidden" 
          />
          <ReactCountryFlag
            countryCode="SA"
            svg
            style={{
              width: "60px",
              height: "35px",
            }}
            className="rounded object-cover shadow-sm"
          />
        </label>

        <label className={`cursor-pointer rounded-lg p-1 transition-all flex items-center gap-2 border-2 ${selectedCountry === "OM" ? "border-brand scale-110 shadow-md" : "border-transparent opacity-50 hover:opacity-100"}`}>
          <input 
            type="radio" 
            name="country" 
            value="OM" 
            checked={selectedCountry === "OM"} 
            onChange={(e) => setSelectedCountry(e.target.value)} 
            className="hidden" 
          />
          <ReactCountryFlag
            countryCode="OM"
            svg
            style={{
              width: "60px",
              height: "35px",
            }}
            className="rounded object-cover shadow-sm"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <ServicesCard
            icon={icons[index]}
            key={index}
            item={item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
