'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import img2 from '@/images/best-computer/fff.png';
import img1 from '@/images/best-computer/fiverr.png';
import img3 from '@/images/best-computer/toptal.png';
import img4 from '@/images/best-computer/upwork.png';
import img5 from '@/images/best-computer/youtube.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

const platforms = [
  { src: img1, alt: 'Fiverr' },
  { src: img2, alt: 'Freelancer' },
  { src: img3, alt: 'Toptal' },
  { src: img4, alt: 'Upwork' },
  { src: img5, alt: 'YouTube' },
];

export default function WorkPlace() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className='py-20 md:py-28 border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section header */}
        <div ref={ref} className='mb-12'>
          <motion.div
            className='flex items-center gap-3 mb-5'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0}
          >
            <div className='h-px w-10 bg-primary' />
            <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
              কর্মক্ষেত্র
            </span>
          </motion.div>

          <motion.h2
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.1}
          >
            ছাত্রদের{' '}
            <span className='italic font-bold text-primary'>কর্মক্ষেত্র</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            className='mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.15}
          >
            আপনি যদি সম্পূর্ণরূপে কাজ শিখে নিজেকে দক্ষ ভাবে তৈরি করতে পারেন তাহলে অবশ্যই
            বিভিন্ন মার্কেটপ্লেসে কাজ করতে পারবেন।
          </motion.p>
        </div>

        {/* Platform carousel */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          custom={0.2}
        >
          <Carousel opts={{ align: 'center' }} className='w-full'>
            <CarouselContent className='-ml-4'>
              {platforms.map((platform, i) => (
                <CarouselItem
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  key={i}
                  className='pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/5 pt-1'
                >
                  <motion.div
                    className='group rounded-2xl border border-border p-6 flex items-center justify-center
                      hover:border-primary/30 hover:bg-primary/[0.02] transition-colors duration-300 h-24'
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    <Image
                      src={platform.src}
                      alt={platform.alt}
                      className='h-12 w-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300'
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className='flex items-center gap-2 mt-8'>
              <CarouselPrevious className='static translate-x-0 translate-y-0' />
              <CarouselNext className='static translate-x-0 translate-y-0' />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
