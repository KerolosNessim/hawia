import SectionHeader from '@/features/shared/components/section-header'
import { useTranslations } from 'next-intl'
import * as motion  from 'framer-motion/client'

interface OfferServiceItemProps {
  id: string;
  title: string;
  description: string;
  points: string[];
}

export default function OfferServiceSection() {
  const t = useTranslations("singleService.whatWeOffer");
  const items = t.raw("cards") as OfferServiceItemProps[];
  return (
    <div className='container space-y-6'>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} subtitleColor='text-gray-500' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {items.map((item,index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 , delay: 0.2 * index }}
            viewport={{ once: true }}
            key={item.id} className=' p-6 rounded-xl  space-y-4 leading-loose border-2 border-brand hover:bg-gray-900 hover:text-white transition-all duration-300 group'>
            <h2 className='text-lg font-bold text-brand'> <span className='text-gray-900 group-hover:text-white'> {item?.id}. </span>{item?.title}</h2>
            <p className='text-sm'>{item?.description}</p>
            <ul className='space-y-3'>
              {item?.points.map((point, index) => (
                <li key={index} className='text-xs flex items-baseline gap-2'>
                  <span className='w-2 h-2 bg-brand rounded-full shrink-0'></span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
