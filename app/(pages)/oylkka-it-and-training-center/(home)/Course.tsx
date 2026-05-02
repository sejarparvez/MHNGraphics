'use client';

import { motion, useInView } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import img7 from '@/images/best-computer/auto-cad.jpg';
import img2 from '@/images/best-computer/Databasae-programing.jpg';
import img3 from '@/images/best-computer/Digital-marketing.jpg';
import img8 from '@/images/best-computer/Ethical-hacking1.jpg';
import img4 from '@/images/best-computer/Graphics-design2.jpg';
import img1 from '@/images/best-computer/office-application.jpg';
import img6 from '@/images/best-computer/Video-editing.jpg';
import img5 from '@/images/best-computer/Webdesign-and-devlopment.jpg';

// ─── Design System ────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const courses = [
  { img: img1, title: 'অফিস অ্যাপলিকেশন', index: '01' },
  { img: img2, title: 'ডাটাবেজ প্রোগ্রামিং', index: '02' },
  { img: img3, title: 'ডিজিটাল মার্কেটিং', index: '03' },
  { img: img4, title: 'গ্রাফিক্স ডিজাইন', index: '04' },
  { img: img5, title: 'ওয়েব ডিজাইন', index: '05' },
  { img: img6, title: 'ভিডিও এডিটিং', index: '06' },
  { img: img7, title: 'অটোক্যাড', index: '07' },
  { img: img8, title: 'ইথিক্যাল হ্যাকিং', index: '08' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Courses() {
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
              কোর্সসমূহ
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp(0.1)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
          >
            আমাদের লেটেস্ট{' '}
            <span className='italic font-bold text-primary'>কোর্স</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0.15)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl'
          >
            আমাদের চলমান সেরা কোর্সগুলো থেকে আপনার কাঙ্ক্ষিত কোর্স বেছে নিয়ে ক্যারিয়ার গড়ে
            তুলুন।
          </motion.p>
        </div>

        {/* Course grid */}
        <motion.div
          variants={gridVariants}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          className='grid grid-cols-2 md:grid-cols-4 gap-5'
        >
          {courses.map((course) => (
            <motion.div
              key={course.index}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className='group rounded-2xl border border-border overflow-hidden
                hover:border-primary/30 hover:shadow-xl hover:shadow-black/5
                transition-colors duration-300 cursor-pointer'
            >
              {/* Image */}
              <div className='relative h-36 md:h-44 overflow-hidden'>
                <Image
                  src={course.img}
                  alt={course.title}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-700'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />

                {/* Index badge */}
                <div className='absolute top-3 right-3'>
                  <span
                    className='text-[10px] font-semibold tracking-[0.18em] uppercase
                    border border-white/20 rounded-full px-2 py-0.5 text-white/70 bg-black/30 backdrop-blur-xs'
                  >
                    {course.index}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className='p-4 flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                  <div
                    className='w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0
                    group-hover:bg-primary/15 transition-colors duration-300'
                  >
                    <GraduationCap className='w-3.5 h-3.5 text-primary' />
                  </div>
                  <h3 className='text-sm font-bold leading-snug'>
                    {course.title}
                  </h3>
                </div>

                {/* Animated rule */}
                <div className='flex items-center gap-2'>
                  <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                  <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                    বিস্তারিত
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
