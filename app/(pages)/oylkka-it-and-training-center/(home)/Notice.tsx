'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotice } from '@/services/notice';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { SiAnswer } from 'react-icons/si';

// ─── Design System ────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  },
});

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Notice {
  id: string;
  title: string;
  pdfUrl: string;
  pdfPublicId: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatNoticeDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isToday(date)) return 'আজ';
  if (isYesterday(date)) return 'গতকাল';
  const daysAgo = formatDistanceToNow(date, { addSuffix: true });
  if (daysAgo.includes('day') && !daysAgo.includes('month')) {
    const days = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `${days} দিন আগে`;
  }
  return format(date, 'dd MMM yyyy');
};

const DOCUMENTS = [
  'পাসপোর্ট সাইজের এক কপি রঙিন ছবি',
  'এস.এস.সি/জে.এস.সি মার্কশীটের ফটোকপি',
  'এন.আই.ডি/জন্ম নিবন্ধনের ফটোকপি',
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className='space-y-3'>
    {[...Array(5)].map((_, i) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
        key={i}
        className='flex items-start gap-4 rounded-2xl border border-border p-4'
      >
        <Skeleton className='h-10 w-10 shrink-0 rounded-xl' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-3 w-28' />
        </div>
      </div>
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function ModernNoticeBoard() {
  const { data, isLoading, error } = useNotice(1, 5);

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
              নোটিশ ও তথ্য
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp(0.1)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
          >
            সর্বশেষ <span className='italic font-bold text-primary'>ঘোষণা</span>
            <span className='text-primary'>.</span>
          </motion.h2>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-start'>
          {/* ── Notice board ── */}
          <motion.div
            variants={fadeUp(0.15)}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='group rounded-2xl border border-border p-6 flex flex-col gap-5
              hover:border-primary/30 transition-colors duration-300'
          >
            {/* Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                  group-hover:bg-primary/15 transition-colors duration-300'
                >
                  <Bell className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h3 className='text-base font-bold leading-snug'>
                    নোটিশ বোর্ড
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    সর্বশেষ ঘোষণা ও বিজ্ঞপ্তি
                  </p>
                </div>
              </div>
              {data?.totalNotices && (
                <span
                  className='text-[10px] font-semibold tracking-[0.18em] uppercase
                  border border-border rounded-full px-2.5 py-1 text-muted-foreground
                  group-hover:border-primary/30 transition-colors duration-300 flex items-center gap-1.5'
                >
                  <Clock className='w-3 h-3' />
                  {data.totalNotices} টি
                </span>
              )}
            </div>

            {/* Divider */}
            <div className='h-px bg-border' />

            {/* Notice list */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert className='border-red-200 bg-red-50'>
                <AlertDescription className='text-red-700 text-sm'>
                  নোটিশ লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
                </AlertDescription>
              </Alert>
            ) : data?.notices && data.notices.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial='hidden'
                animate={inView ? 'show' : 'hidden'}
                className='space-y-3'
              >
                {data.notices.map((notice: Notice, index: number) => (
                  <motion.div key={notice.id} variants={cardVariants}>
                    <Link
                      href={notice.pdfUrl}
                      target='_blank'
                      className='group/item flex items-start gap-4 rounded-2xl border border-border p-4
                        hover:border-primary/30 hover:bg-primary/2 transition-all duration-300'
                    >
                      <div
                        className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0
                        group-hover/item:bg-primary/15 transition-colors duration-300'
                      >
                        <FileText className='w-4 h-4 text-primary' />
                      </div>

                      <div className='flex-1 min-w-0'>
                        <h4
                          className='text-sm font-bold leading-snug line-clamp-2
                          group-hover/item:text-primary transition-colors duration-200'
                        >
                          {notice.title}
                        </h4>
                        <div className='flex items-center gap-3 mt-2'>
                          <div className='flex items-center gap-1.5 text-muted-foreground'>
                            <Calendar className='w-3 h-3' />
                            <span className='text-xs'>
                              {formatNoticeDate(notice.createdAt)}
                            </span>
                          </div>
                          {index === 0 && (
                            <span
                              className='text-[10px] font-semibold tracking-[0.18em] uppercase
                              border border-primary/30 rounded-full px-2 py-0.5 text-primary
                              flex items-center gap-1'
                            >
                              <Sparkles className='w-2.5 h-2.5' />
                              নতুন
                            </span>
                          )}
                        </div>
                      </div>

                      <ExternalLink
                        className='w-4 h-4 text-muted-foreground shrink-0
                        group-hover/item:text-primary transition-colors duration-200 mt-0.5'
                      />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className='py-12 text-center'>
                <div className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4'>
                  <FileText className='w-5 h-5 text-primary' />
                </div>
                <p className='text-sm text-muted-foreground'>
                  কোন নোটিশ পাওয়া যায়নি
                </p>
              </div>
            )}

            {/* Animated rule + CTA */}
            <div className='flex items-center gap-2 mb-1'>
              <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
              <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                সকল নোটিশ
              </span>
            </div>
            <Link href='/oylkka-it-and-training-center/notice'>
              <Button className='w-full h-11 gap-2'>
                সব নোটিশ দেখুন
                <ChevronRight className='w-4 h-4' />
              </Button>
            </Link>
          </motion.div>

          {/* ── Right column ── */}
          <motion.div
            variants={gridVariants}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            className='grid grid-cols-1 sm:grid-cols-2 gap-5'
          >
            {/* Apply card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className='group rounded-2xl border border-border p-6 flex flex-col gap-4
                hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300'
            >
              <div className='flex items-center justify-between'>
                <div
                  className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                  group-hover:bg-primary/15 transition-colors duration-300'
                >
                  <Users className='w-5 h-5 text-primary' />
                </div>
                <span
                  className='text-[10px] font-semibold tracking-[0.18em] uppercase
                  border border-border rounded-full px-2.5 py-1 text-muted-foreground
                  group-hover:border-primary/30 transition-colors duration-300'
                >
                  ভর্তি
                </span>
              </div>
              <h3 className='text-base font-bold leading-snug'>আজই যোগ দিন</h3>
              <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                আপনার ভবিষ্যৎ গড়ুন আমাদের সাথে।
              </p>
              <div className='flex items-center gap-2 mb-1'>
                <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                  01
                </span>
              </div>
              <Link href='/oylkka-it-and-training-center/application'>
                <Button className='w-full h-10 gap-2'>
                  আবেদন করুন
                  <ArrowRight className='w-4 h-4' />
                </Button>
              </Link>
            </motion.div>

            {/* Quiz card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className='group rounded-2xl border border-border p-6 flex flex-col gap-4
                hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300'
            >
              <div className='flex items-center justify-between'>
                <div
                  className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                  group-hover:bg-primary/15 transition-colors duration-300'
                >
                  <SiAnswer className='w-5 h-5 text-primary' />
                </div>
                <span
                  className='text-[10px] font-semibold tracking-[0.18em] uppercase
                  border border-border rounded-full px-2.5 py-1 text-muted-foreground
                  group-hover:border-primary/30 transition-colors duration-300'
                >
                  কুইজ
                </span>
              </div>
              <h3 className='text-base font-bold leading-snug'>কুইজ শুরু করুন</h3>
              <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                আপনার জ্ঞান পরীক্ষা করুন এবং নতুন কিছু শিখুন।
              </p>
              <div className='flex items-center gap-2 mb-1'>
                <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                  02
                </span>
              </div>
              <Link
                href='https://drive.google.com/file/d/1dz_kKE3bRXAq0kqIm0btfquV4wuoUMLi/view'
                target='_blank'
              >
                <Button className='w-full h-10 gap-2'>
                  অ্যাপ ডাউনলোড করুন
                  <ArrowRight className='w-4 h-4' />
                </Button>
              </Link>
            </motion.div>

            {/* Documents card — full width */}
            <motion.div
              variants={cardVariants}
              className='group rounded-2xl border border-border p-6 flex flex-col gap-4
                hover:border-primary/30 transition-colors duration-300 sm:col-span-2'
            >
              <div className='flex items-center justify-between'>
                <div
                  className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                  group-hover:bg-primary/15 transition-colors duration-300'
                >
                  <Award className='w-5 h-5 text-primary' />
                </div>
                <span
                  className='text-[10px] font-semibold tracking-[0.18em] uppercase
                  border border-border rounded-full px-2.5 py-1 text-muted-foreground
                  group-hover:border-primary/30 transition-colors duration-300'
                >
                  ভর্তি তথ্য
                </span>
              </div>

              <h3 className='text-base font-bold leading-snug'>
                আবেদনের জন্য প্রয়োজনীয় কাগজপত্র
              </h3>

              <div className='space-y-2'>
                {DOCUMENTS.map((item, index) => (
                  <div
                    key={item}
                    className='flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3'
                  >
                    <CheckCircle2 className='w-4 h-4 text-primary shrink-0 mt-0.5' />
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      <span className='font-semibold text-foreground'>
                        {index + 1}.
                      </span>{' '}
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className='flex items-center gap-2 pt-1'>
                <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                <span className='text-xs text-primary font-semibold flex items-center gap-1.5'>
                  <ArrowRight className='w-3.5 h-3.5' />
                  সব কাগজপত্র সাথে নিয়ে আসুন
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
