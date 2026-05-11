import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as motion from "framer-motion/client";
import { Crosshair, Eye } from "lucide-react";

import { useTranslations } from "next-intl";
import { VisionSection } from "../types";
import Image from "next/image";

export default function VissionAndMession({data}:{data:VisionSection|undefined}) {
  const t = useTranslations("about");
  return (
    <div className="py-16 bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 container">
        {/* vision */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="h-full group"
        >
          <Card className="h-full group-hover:ring-brand! group-hover:ring-2 group-hover:ring-offset-2  transition-all duration-300">
            <CardHeader>
              <CardTitle className=" gap-2 flex flex-col items-center">
                                {data?.vision_image ? (
                  <Image
                    src={data.vision_image}
                    alt="logo"
                    width={500}
                    height={500}
                    className="w-16 h-auto rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand/20 flex items-center justify-center text-brand ">
                    <Eye className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                )}
                <p className="text-xl  font-bold  ">{ data?.vision_title ||t("vision.title")}</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription dangerouslySetInnerHTML={{ __html: data?.vision_description ||"" }} className="text-center text-base font-semibold leading-relaxed mb-4 ">
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
        {/* mession */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="h-full group"
        >
          <Card className="h-full group-hover:ring-brand! group-hover:ring-2 group-hover:ring-offset-2  transition-all duration-300">
            <CardHeader>
              <CardTitle className=" gap-2 flex flex-col items-center">
                                {data?.message_image ? (
                  <Image
                    src={data?.message_image}
                    alt="logo"
                    width={500}
                    height={500}
                    className="w-16 h-auto rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand/20 flex items-center justify-center text-brand ">
                    <Crosshair className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                )}
                <p className="text-xl  font-bold ">{ data?.message_title ||t("mession.title")}</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription dangerouslySetInnerHTML={{ __html: data?.message_description ||"" }} className="text-center text-base font-semibold leading-relaxed mb-4">
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
