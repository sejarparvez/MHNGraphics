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
import img1 from '@/images/best-computer/1.jpg';
import img2 from '@/images/best-computer/2.jpg';
import img3 from '@/images/best-computer/3.jpg';
import img4 from '@/images/best-computer/4.jpg';
import img5 from '@/images/best-computer/5.jpg';
import img6 from '@/images/best-computer/6.jpg';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

const images = [
  { src: img1, label: 'ক্লাসরুম' },
  { src: img2, label: 'ল্যাব' },
  { src: img3, label: 'প্রশিক্ষণ' },
  { src: img4, label: 'কর্মশালা' },
  { src: img5, label: 'সার্টিফিকেশন' },
  { src: img6, label: 'পরিবেশ' },
];

export default function Gallery() {
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
              গ্যালারি
            </span>
          </motion.div>

          <motion.h2
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.1}
          >
            আমাদের <span className='italic font-bold text-primary'>পরিবেশ</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            className='mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.15}
          >
            আমাদের আধুনিক ল্যাব ও শ্রেণীকক্ষের একঝলক।
          </motion.p>
        </div>

        {/* Carousel */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          custom={0.2}
        >
          <Carousel opts={{ align: 'start' }}>
            <CarouselContent className='-ml-5'>
              {images.map((item, i) => (
                <CarouselItem
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  key={i}
                  className='pl-5 basis-4/5 md:basis-1/2 lg:basis-1/3'
                >
                  <motion.div
                    className='group relative rounded-2xl overflow-hidden border border-border
                      hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300'
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    {/* Image */}
                    <div className='relative h-56 overflow-hidden'>
                      <Image
                        src={item.src}
                        alt={item.label}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-700'
                      />
                      {/* Overlay */}
                      <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />
                    </div>

                    {/* Caption */}
                    <div className='absolute bottom-0 left-0 right-0 p-4'>
                      <div className='flex items-center gap-2'>
                        <div className='h-px w-5 bg-white/60' />
                        <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-white/70'>
                          {item.label}
                        </span>
                      </div>
                    </div>
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
