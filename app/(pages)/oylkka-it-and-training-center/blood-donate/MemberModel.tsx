'use client';

import { Card } from '@/components/ui/card';
import img2 from '@/images/best-computer/img1.jpg';
import img1 from '@/images/best-computer/img2.jpg';
import img3 from '@/images/best-computer/img3.jpg';
import { motion } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';

export default function MemberModel({
  img,
  name,
  title,
  number,
  number2,
}: BloodMemberType) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className='flex flex-col items-center gap-4 border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md'>
        <div className='relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20'>
          <Image src={img} alt={name} layout='fill' objectFit='cover' />
        </div>
        <div className='text-center space-y-2'>
          <p className='font-sans text-lg font-bold text-foreground'>{name}</p>
          <p className='text-sm font-medium text-primary'>{title}</p>
          <div className='space-y-1 pt-2 border-t border-border'>
            <p className='text-xs text-muted-foreground'>{number}</p>
            {number2 && (
              <p className='text-xs text-muted-foreground'>{number2}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export const MemberModelData = [
  {
    id: 1,
    name: 'মোঃ মোহন',
    title: 'সভাপতি',
    number: '০১৯৮৯-৪৯১২৪৮',
    number2: '০১৭৯৯-৫৭৪৫৭০',
    img: img1,
  },
  {
    id: 2,
    name: 'মোঃ সুমন ',
    title: 'সহ-সভাপতি',
    number: '০১৩০৩-৯৫৩৪৪১',
    img: img3,
  },
  {
    id: 3,
    name: 'হাবিবুর রহমান',
    title: 'সাধারণ সম্পাদক',
    number: '০১৫৭১-২০৯১৭৮',
    img: img2,
  },
];

interface BloodMemberType {
  img: StaticImageData;
  name: string;
  title: string;
  number: string;
  number2: string | undefined;
}
