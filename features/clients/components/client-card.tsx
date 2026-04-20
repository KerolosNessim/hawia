"use client";

import Image from "next/image";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";

interface ClientCardProps {
  title: string;
  category: string;
  logo: string;
  phoneImage: string;
  className?: string;
}

export default function ClientCard({
  title,
  category,
  logo,
  phoneImage,
  className,
}: ClientCardProps) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "relative aspect-4/5 w-full overflow-hidden rounded-[2.5rem]  p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02]",
        className
      )}
      onClick={() => router.push(`/clients/${title}`)}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[60%] w-[60%] rounded-full bg-[#ccff00] opacity-20 blur-[100px]" />
        <div className="absolute top-0 h-full w-full bg-linear-to-b from-brand  to-white" />
      </div>

      {/* Top Logo */}
      <div className="relative z-20 flex justify-center pt-2">
        <div className="relative h-16 w-16 bg-white overflow-hidden rounded-full ">
          <Image
            src={logo}
            alt="Client Logo"
            fill
            className="object-contain p-2"
          />
        </div>
      </div>

      {/* Main Visuals (Phone & Flowers) */}
      <div className="relative z-10 mt-4 flex h-[65%] w-full flex-col items-center justify-center">
        {/* Phone Mockup */}
        <motion.div 
          className="relative h-full w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src={phoneImage}
            alt="App Interface"
            fill
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </motion.div>

      </div>

      {/* Bottom Labels */}
      <div className="absolute bottom-6 left-6 right-6 z-30 flex items-end justify-between">
        {/* Category Label */}
        <div className="rounded-full bg-gray-950 px-6 py-3 backdrop-blur-xl border border-white/5">
          <p className="text-sm font-medium text-[#ccff00] lg:text-base">
            {category}
          </p>
        </div>

        {/* Title Label */}
        <div className="pb-2">
          <h3 className="text-lg font-bold text-gray-900 lg:text-xl">
             {title}
          </h3>
        </div>
      </div>

      {/* Overlay Glow for Premium Feel */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-[#ccff0010] to-transparent" />
    </motion.div>
  );
}
