import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface Blog
   {
    title: string;
    description: string;
    date: string;
    image: string;
    link: string;
  }
 

  interface BlogCardProps{
    article: Blog;
    index: number;
    isRtl: boolean;
    t: (key: string) => string;
    isLight?: boolean;
  }

export default function BlogCard({
  article,
  index,
  isRtl,
  t,
  isLight=false,
}: BlogCardProps) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card
        className={`p-0 h-full flex flex-col ${isLight ? "bg-white" : "bg-gray-900  border "} border-brand overflow-hidden hover:shadow-xl hover:border-brand/50 transition-all duration-300`}
      >
        <CardHeader className="p-0 border-b-2 border-brand">
          <div className="relative w-full h-[240px]  overflow-hidden">
            <Image
              src={"/blog.webp"}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1 flex flex-col pt-8 ">
          <h3 className={`text-xl font-bold mb-4  leading-snug line-clamp-2 hover:text-brand transition-colors cursor-pointer ${isLight ? "text-gray-900" : "text-white"}`}>
            {article.title}
          </h3>
          <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isLight ? "text-gray-500" : "text-gray-300"}`}>
            {article.description}
          </p>

          <div className="mt-auto">
            <Link
              href={article.link}
              className="inline-flex items-center text-brand font-bold hover:text-brand/80 transition-colors text-sm"
            >
              {t("readMore")}
              {isRtl ? (
                <ChevronLeft className="ms-1 w-4 h-4" />
              ) : (
                <ChevronRight className="ms-1 w-4 h-4" />
              )}
            </Link>
          </div>
        </CardContent>

        <CardFooter className={`border-t border-brand p-4 ${isLight ? "bg-brand text-white" : "bg-gray-900"}`}>
          <span className={`text-xs font-medium w-full  ${isLight ? "text-white" : "text-brand"}`}>
            {article.date}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
