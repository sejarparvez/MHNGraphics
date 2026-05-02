'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FaRegClipboard,
  FaRegHandshake,
  FaRegKeyboard,
  FaRegLightbulb,
  FaRegUser,
} from 'react-icons/fa';
import { FiClock, FiDollarSign } from 'react-icons/fi';
import { GoVerified } from 'react-icons/go';
import { GrDocument } from 'react-icons/gr';
import { IoCloudyNightOutline } from 'react-icons/io5';
import { LuGraduationCap } from 'react-icons/lu';
import { RiComputerLine } from 'react-icons/ri';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// ─── Design System ────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});

// ─── Data ─────────────────────────────────────────────────────────────────────
const reasons = [
  {
    icon: FiDollarSign,
    text: 'ন্যূনতম কোর্স ফিতে সর্বোৎকৃষ্ট মানের প্রশিক্ষণ',
    index: '01',
  },
  {
    icon: RiComputerLine,
    text: 'আধুনিক ও সুসজ্জিত মাল্টিমিডিয়া কম্পিউটার ল্যাব',
    index: '02',
  },
  { icon: FaRegUser, text: 'এককভাবে প্রশিক্ষণ দেওয়া হয়', index: '03' },
  {
    icon: FaRegClipboard,
    text: 'সিলেবাস অনুযায়ী যত্ন সহকারে পাঠদানের ব্যবস্থা',
    index: '04',
  },
  { icon: GrDocument, text: 'মানসম্মত আধুনিক সিটের ব্যবস্থা', index: '05' },
  { icon: FiClock, text: 'সুবিধা অনুযায়ী ক্লাসের সময় নির্ধারণ', index: '06' },
  {
    icon: IoCloudyNightOutline,
    text: 'চাকুরীজীবীদের জন্য রাত্রিকালীন ক্লাস',
    index: '07',
  },
  { icon: FaRegKeyboard, text: 'পর্যাপ্ত সময় অনুশীলন করার ব্যবস্থা', index: '08' },
  { icon: FaRegLightbulb, text: 'পেশাগত কাজের উপর প্রশিক্ষণ দেওয়া হয়', index: '09' },
  {
    icon: LuGraduationCap,
    text: 'অভিজ্ঞ প্রশিক্ষক মন্ডলি দ্বারা পরিচালিত',
    index: '10',
  },
  {
    icon: FaRegHandshake,
    text: 'প্রশিক্ষণ পরবর্তী যে কোন সমস্যায় সুষ্ঠু পরামর্শ প্রদান',
    index: '11',
  },
  {
    icon: GoVerified,
    text: 'পরীক্ষার মাধ্যমে সরকারি সার্টিফিকেট এর ব্যবস্থা',
    index: '12',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function WhyUs() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className='border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28'>
        {/* Section header */}
        <div ref={ref} className='mb-12'>
          <motion.div
            variants={fadeUp(0)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='flex items-center gap-3 mb-5'
          >
            <div className='h-px w-10 bg-primary' />
            <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
              কেন আমরা
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp(0.1)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
          >
            আমাদের প্রতিষ্ঠানে{' '}
            <span className='italic font-bold text-primary'>কেন</span>
            <span className='text-primary'>?</span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0.15)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl'
          >
            অন্য প্রতিষ্ঠান থেকে আমরা কেন আলাদা? আমাদের প্রতিষ্ঠানকে কেন বেছে নিবেন?
          </motion.p>
        </div>

        {/* Carousel */}
        <motion.div
          variants={fadeUp(0.2)}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
        >
          <Carousel opts={{ align: 'start', loop: true }}>
            <CarouselContent className='-ml-4'>
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <CarouselItem
                    key={reason.index}
                    className='pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
                  >
                    <div
                      className='group rounded-2xl border border-border p-6
                      hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300
                      flex flex-col gap-4 h-full'
                    >
                      {/* Header row */}
                      <div className='flex items-center justify-between'>
                        <div
                          className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                          group-hover:bg-primary/15 transition-colors duration-300'
                        >
                          <Icon className='w-5 h-5 text-primary' />
                        </div>
                        <span
                          className='text-[10px] font-semibold tracking-[0.18em] uppercase
                          border border-border rounded-full px-2.5 py-1 text-muted-foreground
                          group-hover:border-primary/30 transition-colors duration-300'
                        >
                          {reason.index}
                        </span>
                      </div>

                      <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                        {reason.text}
                      </p>

                      {/* Animated rule */}
                      <div className='flex items-center gap-2'>
                        <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                        <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                          সুবিধা
                        </span>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious
              className='w-9 h-9 rounded-xl border border-border
                hover:border-primary/30 hover:bg-primary/5 hover:text-primary
                transition-all duration-200 -left-3'
            />
            <CarouselNext
              className='w-9 h-9 rounded-xl border border-border
                hover:border-primary/30 hover:bg-primary/5 hover:text-primary
                transition-all duration-200 -right-3'
            />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
