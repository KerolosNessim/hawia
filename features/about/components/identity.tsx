import { RichHtml } from "@/features/shared/components/rich-html";
import Image from 'next/image';

export default function Identity({title,description,image}: {title: string,description: string,image?:string}) {
  return (
    <div className="container">
      {/* content */}
      <div className="flex items-center">
        <div className='space-y-4'>
          <h1 className='text-brand text-3xl font-bold'>{title}</h1>

            <RichHtml html={description} className="text-lg font-semibold leading-relaxed" />
        </div>
        <div className=" max-lg:hidden shrink-0 w-1/2">
          <Image
            src={image||"/about-identity.webp"}
            alt=""
            width={500}
            height={500}
            className="w-full h-auto mask-blob "
          />
        </div>
      </div>
    </div>
  );
}
