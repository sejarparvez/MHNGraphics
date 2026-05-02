'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import CountUp from 'react-countup';
import { FaCrown, FaUserCheck } from 'react-icons/fa';
import { FaSheetPlastic, FaUsers } from 'react-icons/fa6';

// ─── Design System ────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { icon: FaUsers, label: 'মোট শিক্ষার্থী', start: 2000, end: 2230, suffix: '+' },
  {
    icon: FaUserCheck,
    label: 'বর্তমান শিক্ষার্থী',
    start: 100,
    end: 120,
    suffix: '+',
  },
  { icon: FaSheetPlastic, label: 'মোট কোর্স', start: 0, end: 8, suffix: 'টি' },
  { icon: FaCrown, label: 'সফলতার বছর', start: 0, end: 10, suffix: '+' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Insights() {
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
              পরিসংখ্যান
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp(0.1)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
          >
            আমাদের প্রতিষ্ঠানের{' '}
            <span className='italic font-bold text-primary'>অর্জন</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0.15)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl'
          >
            কোর্স শেষে বাংলাদেশ কারিগরি শিক্ষা বোর্ড কর্তৃক পরীক্ষার মাধ্যমে সার্টিফিকেট প্রদান
            করা হয়।
          </motion.p>
        </div>

        {/* Stats strip */}
        <motion.div
          variants={fadeUp(0.2)}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          className='rounded-2xl border border-border overflow-hidden
            grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border'
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className='py-10 px-6 flex flex-col items-center justify-center gap-2'
              >
                <p className='text-4xl md:text-5xl font-bold tabular-nums text-primary'>
                  {inView ? (
                    <CountUp
                      start={stat.start}
                      end={stat.end}
                      duration={2.2}
                      suffix={stat.suffix}
                    />
                  ) : (
                    `${stat.start}${stat.suffix}`
                  )}
                </p>
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Icon className='w-3.5 h-3.5 shrink-0' />
                  <p className='text-xs tracking-wide uppercase font-medium'>
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
