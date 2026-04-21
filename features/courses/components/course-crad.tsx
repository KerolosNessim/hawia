"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function CourseCard() {
  return (
    <Link href="/courses/1" className="hover:scale-105 transition-all duration-300">
      <Card className="overflow-hidden rounded-2xl shadow-md border bg-white p-0">
        {/* Top Image Section */}
        <div className="relative">
          <Image
            src="/course.webp" // حط الصورة بتاعتك هنا
            alt="course"
            width={600}
            height={300}
            className="w-full h-[220px] object-cover"
          />
        </div>

        {/* Bottom Content */}
        <CardContent className="text-center py-6 ">
          <h3 className="text-lg font-bold text-gray-900">
            دورة إعلانات ميتا - مع شركة هوية
          </h3>
        </CardContent>

        <CardFooter className="flex justify-between items-center px-6 pb-6 ">
          <Button
            size={"lg"}
            className="flex items-center gap-2 bg-brand text-white hover:scale-105"
          >
            <ShoppingCart size={18} />
            إضافة إلى السلة
          </Button>

          <span className="text-xl font-bold">$200</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
