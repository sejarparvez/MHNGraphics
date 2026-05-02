'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import { CiGlobe } from 'react-icons/ci';
import { FaDigitalOcean } from 'react-icons/fa';
import { FiVideo } from 'react-icons/fi';
import { GiAutoRepair } from 'react-icons/gi';
import { GrAnnounce } from 'react-icons/gr';
import { LuNetwork } from 'react-icons/lu';
import { RiComputerLine } from 'react-icons/ri';

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
const services = [
  {
    icon: RiComputerLine,
    title: 'কম্পিউটার সেলস',
    description: 'সুলভ মূল্যে কম্পিউটারের সকল প্রকার যন্ত্রাংশ বিক্রয় করা হয়।',
    index: '01',
  },
  {
    icon: GiAutoRepair,
    title: 'কম্পিউটার সার্ভিসিং',
    description: 'দক্ষ ইঞ্জিনিয়ার দ্বারা কম্পিউটারের সকল সমস্যার সমাধান করা হয়।',
    index: '02',
  },
  {
    icon: BsPersonWorkspace,
    title: 'ডিজিটাল কনটেন্ট',
    description:
      'শিক্ষা প্রতিষ্ঠান এবং অফিসের জন্য সুন্দর ও দৃষ্টি নন্দন ডিজিটাল কনটেন্ট তৈরি করা হয়।',
    index: '03',
  },
  {
    icon: LuNetwork,
    title: 'গ্রাফিক্স ডিজাইন',
    description: 'লোগো, ব্যানার, পোস্টার সহ সকল প্রকার ডিজাইনের কাজ করা হয়।',
    index: '04',
  },
  {
    icon: CiGlobe,
    title: 'ওয়েব ডিজাইন',
    description: 'আপনি ওয়েবসাইট তৈরির কথা ভাবছেন? তাহলে আমাদের সাথে যোগাযোগ করুন।',
    index: '05',
  },
  {
    icon: FiVideo,
    title: 'ভিডিও এডিটিং',
    description: 'ভালো মানের ইউটিউব ভিডিও, ইসলামিক ভিডিও এডিটিং ও তৈরি করা হয়।',
    index: '06',
  },
  {
    icon: GrAnnounce,
    title: 'ফেসবুক মার্কেটিং',
    description: 'আপনার প্রতিষ্ঠানের পণ্য টার্গেট অডিয়েন্সের কাছে পৌঁছানোর জন্য ফেসবুক অ্যাড।',
    index: '07',
  },
  {
    icon: FaDigitalOcean,
    title: 'ডিজিটাল মার্কেটিং',
    description:
      'সোশ্যাল মিডিয়া মার্কেটিং সহ স্বল্প খরচে সকল প্রকার ডিজিটাল মার্কেটিং করা হয়।',
    index: '08',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Services() {
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
              সেবাসমূহ
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp(0.1)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
          >
            আমাদের <span className='italic font-bold text-primary'>সেবা</span>{' '}
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0.15)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl'
          >
            আমাদের প্রতিষ্ঠান থেকে আপনি স্বল্পমূল্যে প্রফেশনাল মানের বিভিন্ন সেবা পাবেন।
          </motion.p>
        </div>

        {/* Services grid */}
        <motion.div
          variants={gridVariants}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          className='grid grid-cols-2 md:grid-cols-4 gap-5'
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.index}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className='group rounded-2xl border border-border p-6
                  hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300
                  flex flex-col gap-4'
              >
                {/* Header row: icon + tag pill */}
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
                    {service.index}
                  </span>
                </div>

                <h3 className='text-base font-bold leading-snug'>
                  {service.title}
                </h3>
                <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                  {service.description}
                </p>

                {/* Animated rule */}
                <div className='flex items-center gap-2'>
                  <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                  <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                    বিস্তারিত
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
