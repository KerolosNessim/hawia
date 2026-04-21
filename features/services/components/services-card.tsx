import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import * as motion from "framer-motion/client";
import Link from "next/link";
import { Service } from "../types";
export default function ServicesCard({
  item,
  icon: Icon,
  index,
}: {
  item: Service;
  icon: LucideIcon;
  index: number;
}) {
  return (
    <Link href={`/services/${item?.slug}`} className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        viewport={{ once: true }}
        className="h-full group"
      >
        <Card className="h-full group-hover:ring-brand! group-hover:ring-2 group-hover:ring-offset-2 group-hover:bg-gray-900 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand/20 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300">
                <Icon className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <p className="text-xl  font-bold text-center group-hover:text-white transition-all duration-300">
                {item?.title}
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className=" text-base font-semibold leading-relaxed text-center group-hover:text-gray-200 transition-all duration-300">
              {item?.description}
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
