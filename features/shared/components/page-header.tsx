import * as motion from 'framer-motion/client'

interface PageHeaderProps {
  title: string;
  description: string;
}
export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="lg:h-[60vh] md:h-[40vh] h-[30vh]   bg-[url('/seo-banner.jpg')] bg-cover bg-center bg-no-repeat">
      {/* layer */}
      <div className=" bg-black/70 h-full flex items-center justify-center">
        {/* content */}
        <div className="container ">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-brand"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white mt-4"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
