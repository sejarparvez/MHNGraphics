'use client';

import { motion, useInView } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';
import { useRef } from 'react';
import img1 from '@/assets/teachers/1.jpg';
import img2 from '@/assets/teachers/2.jpg';
import img3 from '@/assets/teachers/3.jpg';
import img4 from '@/assets/teachers/4.jpg';

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
const members = [
  {
    id: 1,
    name: 'মোঃ মোহন',
    designation: 'ফাউন্ডার এন্ড সিইও',
    department: 'FOUNDER & CEO',
    img: img1,
  },
  {
    id: 2,
    name: 'মোছাঃ রিয়া খাতুন',
    designation: 'ইন্সট্রাক্টর',
    department: 'ডিজিটাল মার্কেটিং',
    img: img2,
  },
  {
    id: 3,
    name: 'মোঃ তানজিল মোল্লা',
    designation: 'ইন্সট্রাক্টর',
    department: 'গ্রাফিক্স ডিজাইন',
    img: img3,
  },
  {
    id: 4,
    name: 'মোঃ মাহবুব হোসেন',
    designation: 'ইন্সট্রাক্টর',
    department: 'অফিস অ্যাপ্লিকেশন',
    img: img4,
  },
];

// ─── MembersModel ─────────────────────────────────────────────────────────────
interface MemberProps {
  name: string;
  designation: string;
  department?: string;
  img: StaticImageData;
}

function MembersModel({ name, designation, department, img }: MemberProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className='group rounded-2xl border border-border overflow-hidden
        hover:border-primary/30 hover:shadow-xl hover:shadow-black/5
        transition-all duration-300'
    >
      {/* Photo */}
      <div className='relative aspect-4/5 w-full overflow-hidden'>
        <Image
          src={img}
          alt={name}
          fill
          placeholder='blur'
          className='object-cover group-hover:scale-105 transition-transform duration-700'
        />
        {/* Bottom-up overlay */}
        <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent' />

        {/* Name + role float over image */}
        <div className='absolute bottom-0 left-0 right-0 p-5'>
          <div className='flex items-center gap-2 mb-1.5'>
            <div className='h-px w-5 bg-white/60 group-hover:w-8 transition-all duration-300' />
            <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60'>
              {designation}
            </span>
          </div>
          <h3 className='text-white text-lg font-bold leading-snug'>{name}</h3>
        </div>
      </div>

      {/* Department tag — only when present */}
      {department && (
        <div className='px-5 py-4 flex items-center gap-2'>
          <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
          <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/60'>
            {department}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Members ──────────────────────────────────────────────────────────────────
export default function Members() {
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
              আমাদের দল
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp(0.1)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
          >
            প্রতিষ্ঠানের{' '}
            <span className='italic font-bold text-primary'>সদস্যগণ</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0.15)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl'
          >
            আমাদের কোর্সসমূহ পরিচালনার জন্য রয়েছে একদল দক্ষ ইন্সট্রাক্টর যারা সরাসরি বিভিন্ন
            কাজের সাথে জড়িত।
          </motion.p>
        </div>

        {/* Team grid */}
        <motion.div
          variants={gridVariants}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
        >
          {members.map((member) => (
            <MembersModel key={member.id} {...member} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
