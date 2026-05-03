'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Brush,
  GraduationCap,
  Heart,
  Palette,
  Play,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { type FC, type ReactNode, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Animation config ──────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  tag: string;
  link: string;
  external?: boolean;
  soon?: boolean;
  applyLink?: string;
  quizLink?: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const services: Service[] = [
  {
    id: 'training-center',
    title: 'IT & Computer Training Center',
    description:
      'Professional courses in design, development, and digital skills — taught by industry practitioners.',
    icon: <GraduationCap className='w-5 h-5 text-primary' />,
    tag: 'Education',
    link: '/oylkka-it-and-training-center',
    applyLink: '/oylkka-it-and-training-center/application',
    quizLink:
      'https://drive.google.com/file/d/1dz_kKE3bRXAq0kqIm0btfquV4wuoUMLi/view',
  },
  {
    id: 'it-agency',
    title: 'IT Agency',
    description:
      'End-to-end digital solutions — from strategy and branding to development and launch.',
    icon: <Palette className='w-5 h-5 text-primary' />,
    tag: 'Creative',
    link: '/',
  },
  {
    id: 'graphics',
    title: 'Oylkka Graphics',
    description:
      'A curated library of premium design assets — templates, photos, illustrations, and animations.',
    icon: <Brush className='w-5 h-5 text-primary' />,
    tag: 'Design',
    link: '/design?category=all&query=&page=1',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce',
    description:
      'Shop authentic Bangladeshi products, crafts, and merchandise — delivered to your door.',
    icon: <ShoppingCart className='w-5 h-5 text-primary' />,
    tag: 'Commerce',
    link: 'https://www.oylkka.com',
    external: true,
  },
  {
    id: 'blood-bank',
    title: 'Blood Bank',
    description:
      'Connecting donors and recipients across Bangladesh — because every drop counts.',
    icon: <Heart className='w-5 h-5 text-primary' />,
    tag: 'Healthcare',
    link: '/oylkka-it-and-training-center/blood-donate',
  },
  {
    id: 'foundation',
    title: 'Oylkka Foundation',
    description:
      'Our non-profit arm — funding education, healthcare, and community development initiatives.',
    icon: <Heart className='w-5 h-5 text-primary' />,
    tag: 'Non-Profit',
    link: '#',
    soon: true,
  },
];

// ── Service card ──────────────────────────────────────────────────────────────

const ServiceCard: FC<{ service: Service; index: number }> = ({
  service,
  index,
}) => {
  const {
    title,
    description,
    icon,
    tag,
    link,
    external,
    soon,
    applyLink,
    quizLink,
  } = service;

  const cardContent = (
    <motion.div
      variants={cardVariants}
      whileHover={soon ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`group rounded-2xl border border-border p-6 flex flex-col gap-4 h-full
        transition-colors duration-300
        ${
          soon
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary/30 hover:bg-primary/2'
        }`}
    >
      {/* Header row: icon container + tag pill */}
      <div className='flex items-center justify-between'>
        <div
          className={`w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
          transition-colors duration-300 ${soon ? '' : 'group-hover:bg-primary/15'}`}
        >
          {icon}
        </div>
        <Badge
          variant='outline'
          className={`
          transition-colors duration-300 ${soon ? '' : 'group-hover:border-primary/30'}`}
        >
          {soon ? 'Soon' : tag}
        </Badge>
      </div>

      {/* Title */}
      <h3 className='text-base font-bold leading-snug'>{title}</h3>

      {/* Description */}
      <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
        {description}
      </p>

      {/* CTA row */}
      {!soon && (
        <div className='flex flex-col gap-2'>
          {/* Primary action */}
          <div className='flex gap-2'>
            <Button
              size='sm'
              className='flex-1 h-9 gap-1.5 rounded-xl group/btn'
              asChild
            >
              {external ? (
                <a href={link} target='_blank' rel='noopener noreferrer'>
                  Learn More
                  <ArrowRight className='w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5' />
                </a>
              ) : (
                <Link href={link}>
                  Learn More
                  <ArrowRight className='w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5' />
                </Link>
              )}
            </Button>

            {applyLink && (
              <Button
                size='sm'
                variant='outline'
                className='flex-1 h-9 rounded-xl hover:border-primary/30 hover:text-primary'
                asChild
              >
                <Link href={applyLink}>Apply Now</Link>
              </Button>
            )}
          </div>

          {/* Quiz button — full width secondary row */}
          {quizLink && (
            <Button
              size='sm'
              variant='outline'
              className='w-full h-9 gap-1.5 rounded-xl hover:border-primary/30 hover:text-primary'
              asChild
            >
              <Link href={quizLink}>
                <Play className='w-3.5 h-3.5' />
                Download Apps For Android
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Animated rule + index */}
      <div className='flex items-center gap-2 mt-auto pt-1'>
        <div
          className={`h-px w-5 bg-primary/40 transition-all duration-300 ${soon ? '' : 'group-hover:w-8'}`}
        />
        <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  );

  // Wrap with link only when not soon and not external (external handled inside button)
  return cardContent;
};

// ── Section ───────────────────────────────────────────────────────────────────

const ServicesSection: FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' });

  return (
    <section className='py-20 md:py-28 border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* ── Section header ──────────────────────────────────────────── */}
        <div ref={headerRef} className='mb-14'>
          <motion.div
            variants={fadeUp}
            initial='hidden'
            animate={headerInView ? 'show' : 'hidden'}
            custom={0}
            className='flex items-center gap-3 mb-5'
          >
            <div className='h-px w-10 bg-primary' />
            <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
              Our Services
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            initial='hidden'
            animate={headerInView ? 'show' : 'hidden'}
            custom={0.1}
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight max-w-xl'
          >
            Everything your{' '}
            <span className='italic font-bold text-primary'>business</span>{' '}
            needs
            <span className='text-primary'>.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial='hidden'
            animate={headerInView ? 'show' : 'hidden'}
            custom={0.18}
            className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl'
          >
            A comprehensive suite of educational, creative, and business
            solutions — designed to empower your growth at every stage.
          </motion.p>
        </div>

        {/* ── Cards grid ──────────────────────────────────────────────── */}
        <motion.div
          ref={gridRef}
          variants={gridVariants}
          initial='hidden'
          animate={gridInView ? 'show' : 'hidden'}
          className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'
        >
          {services.map((service, idx) => (
            <ServiceCard key={service.id} service={service} index={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
