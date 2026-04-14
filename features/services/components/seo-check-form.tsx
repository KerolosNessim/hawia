"use client"
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
export default function SeoCheckForm() {
  const t = useTranslations("singleService.seoCheckForm");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="container bg-[#F8FDF1] py-10 px-4 relative overflow-hidden my-16 rounded-3xl mx-4 ">
        <h2 className="text-2xl md:text-3xl text-center font-bold text-gray-800 mb-8  mx-auto leading-normal">
          {t('title')}
        </h2>
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        
        <form className="max-w-2xl mx-auto flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="url" 
            placeholder={t('websitePlaceholder')}
            className="w-full px-6 py-4 rounded-xl border border-transparent focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm text-gray-800 bg-white"
            required
          />
          
          <input 
            type="email" 
            placeholder={t('emailPlaceholder')}
            className="w-full px-6 py-4 rounded-xl border border-transparent focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm text-gray-800 bg-white"
            required
          />
          
          <div className="flex items-start gap-3 text-start px-2">
            <input 
              type="checkbox" 
              id="agreement" 
              className="mt-1 w-4 h-4 accent-brand shrink-0"
              required
            />
            <label htmlFor="agreement" className="text-sm text-gray-600 font-medium leading-relaxed cursor-pointer select-none">
              {t('agreement')}
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full mt-2 bg-brand text-white font-bold text-lg py-4 rounded-xl hover:bg-brand/90 transition-colors shadow-md border-b-4 border-black/10 active:border-b-0 active:translate-y-1"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
