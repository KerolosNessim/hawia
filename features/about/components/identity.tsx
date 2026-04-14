import Image from 'next/image';
import React from 'react'

export default function Identity({title,description}: {title: string,description: string[]}) {
  return (
    <div className="container">
      {/* content */}
      <div className="flex items-center">
        <div className='space-y-4'>
          <h1 className='text-brand text-3xl font-bold'>{title}</h1>
          {description.map((item, index) => (
            <p key={index} className='text-lg font-semibold'>{item}</p>
          ))}
        </div>
        <div className=" max-lg:hidden shrink-0 w-1/2">
          <Image
            src="/about-identity.webp"
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
