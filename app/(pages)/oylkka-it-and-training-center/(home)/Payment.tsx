'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import img from '@/images/best-computer/BKash-bKash-Logo.wine.png';
import img1 from '@/images/best-computer/Nagad-Logo.wine.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const methods = [
  { src: img, alt: 'bKash', number: '০১৭৯৯-৫৭৪৫৭০', type: 'পার্সোনাল' },
  { src: img1, alt: 'Nagad', number: '০১৭৯৯-৫৭৪৫৭০', type: 'পার্সোনাল' },
  { src: img, alt: 'bKash', number: '০১৭৭৯-১২০০২৩', type: 'মার্চেন্ট' },
];

export default function Payment() {
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
              পেমেন্ট
            </span>
          </motion.div>

          <motion.h2
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.1}
          >
            মোবাইল <span className='italic font-bold text-primary'>পেমেন্ট</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            className='mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.15}
          >
            নিচের যেকোনো মাধ্যমে সহজেই পেমেন্ট করুন।
          </motion.p>
        </div>

        {/* Payment cards */}
        <motion.div
          className='grid grid-cols-1 sm:grid-cols-3 gap-5'
          variants={gridVariants}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
        >
          {methods.map((method, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
              key={i}
              variants={cardVariants}
              className='group rounded-2xl border border-border p-6 flex flex-col items-center gap-4
                hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300'
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              {/* Logo */}
              <div className='relative h-20 w-full'>
                <Image
                  src={method.src}
                  alt={method.alt}
                  fill
                  className='object-contain'
                />
              </div>

              {/* Divider */}
              <div className='w-full h-px bg-border' />

              {/* Number + type */}
              <div className='flex flex-col items-center gap-1.5 text-center'>
                <p className='text-sm font-bold tabular-nums'>
                  {method.number}
                </p>
                <div className='flex items-center gap-2'>
                  <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                  <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/60'>
                    {method.type}
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
