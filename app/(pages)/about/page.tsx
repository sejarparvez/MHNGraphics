'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Globe,
  Heart,
  Layers,
  Megaphone,
  Monitor,
  Pen,
  Shield,
  Star,
  TreePine,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import img1 from '@/assets/teachers/1.jpg';
import img2 from '@/assets/teachers/2.jpg';
import img3 from '@/assets/teachers/3.jpg';
import img4 from '@/assets/teachers/4.jpg';
import { Button } from '@/components/ui/button';
import heroImg from '@/images/best-computer/1.jpg';
import storyImg from '@/images/best-computer/2.jpg';

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

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { icon: Users, label: 'Total Students', value: '5,000+' },
  { icon: Award, label: 'Total Courses', value: '15+' },
  { icon: Star, label: 'Success Rate', value: '95%' },
  { icon: Globe, label: 'Years of Success', value: '10+' },
];

const services = [
  {
    icon: Pen,
    title: 'Graphics Design',
    desc: 'Logo, banner, poster and all kinds of design work done professionally.',
    tag: '01',
  },
  {
    icon: Globe,
    title: 'Web Design',
    desc: 'Modern and responsive websites built with the latest web technologies.',
    tag: '02',
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    desc: 'Social media marketing and all types of digital marketing at affordable cost.',
    tag: '03',
  },
  {
    icon: Video,
    title: 'Video Editing',
    desc: 'High-quality YouTube videos, Islamic video editing and production.',
    tag: '04',
  },
  {
    icon: Monitor,
    title: 'Computer Servicing',
    desc: 'All computer problems solved by skilled engineers with guaranteed quality.',
    tag: '05',
  },
  {
    icon: Layers,
    title: 'Office Applications',
    desc: 'Get proficient in Microsoft Office and Google Workspace for business tasks.',
    tag: '06',
  },
  {
    icon: Zap,
    title: 'AutoCAD',
    desc: 'Professional AutoCAD training for 2D and 3D design and technical drawing.',
    tag: '07',
  },
  {
    icon: Shield,
    title: 'Ethical Hacking',
    desc: 'Cyber security and ethical hacking training with hands-on practical sessions.',
    tag: '08',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Quality Training',
    description:
      'We deliver the highest standard of training at the lowest possible cost — quality education for everyone.',
    tag: 'Quality',
  },
  {
    icon: Shield,
    title: 'Government Certified',
    description:
      'Courses are certified by the Bangladesh Technical Education Board through official examinations.',
    tag: 'Certified',
  },
  {
    icon: TreePine,
    title: 'Hands-on Learning',
    description:
      'Not just theory — students work on real projects to build professional-grade skills.',
    tag: 'Practical',
  },
  {
    icon: Users,
    title: 'Career Support',
    description:
      'Free placement assistance and career counseling to help every graduate land their first job.',
    tag: 'Career',
  },
];

const team = [
  {
    name: 'Md. Mohan',
    role: 'Founder & CEO',
    bio: 'Visionary founder driving the mission of quality tech education.',
    img: img1,
  },
  {
    name: 'Mst. Ria Khatun',
    role: 'Digital Marketing',
    bio: 'Lead instructor for the Digital Marketing department.',
    img: img2,
  },
  {
    name: 'Md. Tanzil Molla',
    role: 'Graphics Design',
    bio: 'Lead instructor for the Graphics Design department.',
    img: img3,
  },
  {
    name: 'Md. Mahbub Hossain',
    role: 'Office Applications',
    bio: 'Lead instructor for the Office Applications department.',
    img: img4,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-60px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });
  const storyInView = useInView(storyRef, { once: true, margin: '-60px' });
  const servicesInView = useInView(servicesRef, {
    once: true,
    margin: '-60px',
  });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-60px' });
  const teamInView = useInView(teamRef, { once: true, margin: '-60px' });

  return (
    <div className='min-h-screen bg-background'>
      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className='relative min-h-[70vh] flex items-center overflow-hidden border-b border-border'>
        <div className='absolute inset-0 z-0'>
          <Image
            src={heroImg}
            alt='Oylkka IT'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-linear-to-r from-black/95 via-black/70 to-black/20' />
        </div>

        <div
          ref={heroRef}
          className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20'
        >
          <div className='max-w-2xl'>
            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate={heroInView ? 'show' : 'hidden'}
              custom={0}
              className='flex items-center gap-3 mb-6'
            >
              <div className='h-px w-10 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
                About Us
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial='hidden'
              animate={heroInView ? 'show' : 'hidden'}
              custom={0.1}
              className='text-5xl sm:text-6xl md:text-7xl text-white font-bold leading-[1.05] tracking-tight mb-6'
            >
              We Are{' '}
              <span className='italic font-bold text-primary'>Oylkka IT</span>
              <span className='text-primary'>.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial='hidden'
              animate={heroInView ? 'show' : 'hidden'}
              custom={0.2}
              className='text-base md:text-lg text-gray-300 max-w-xl leading-relaxed mb-8'
            >
              The most trusted IT training centre in Jhenaidah — offering
              government-certified courses, modern facilities, and real career
              support.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate={heroInView ? 'show' : 'hidden'}
              custom={0.3}
              className='flex flex-row gap-3'
            >
              <Button
                size='lg'
                asChild
                className='h-12 px-8 gap-2 flex-1 sm:flex-none'
              >
                <Link href='/oylkka-it-and-training-center'>
                  Explore Courses
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </Button>
              <Button
                size='lg'
                variant='outline'
                asChild
                className='h-12 px-8 flex-1 sm:flex-none border-white/20 text-white hover:bg-white/10 hover:text-white'
              >
                <Link href='#team'>Meet the Team</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Stats strip ───────────────────────────────────────────────── */}
      <div ref={statsRef}>
        <motion.div
          variants={gridVariants}
          initial='hidden'
          animate={statsInView ? 'show' : 'hidden'}
          className='border-b border-border'
        >
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border'>
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  className='py-10 px-6 flex flex-col items-center justify-center gap-2'
                >
                  <p className='text-4xl md:text-5xl font-bold text-primary tabular-nums'>
                    {stat.value}
                  </p>
                  <div className='flex items-center gap-1.5'>
                    <stat.icon className='w-3.5 h-3.5 text-muted-foreground' />
                    <p className='text-xs text-muted-foreground tracking-wide uppercase font-medium'>
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 3. Our Story ─────────────────────────────────────────────────── */}
      <section className='py-20 md:py-28 border-b border-border'>
        <div ref={storyRef} className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate={storyInView ? 'show' : 'hidden'}
              custom={0}
              className='relative h-105 md:h-130 rounded-2xl overflow-hidden border border-border'
            >
              <Image
                src={storyImg}
                alt='Oylkka IT Training Center'
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='h-px w-5 bg-white/60' />
                  <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60'>
                    Our Story
                  </span>
                </div>
                <p className='text-white text-xl font-bold leading-snug'>
                  Committed to building skilled professionals for a digital
                  Bangladesh
                </p>
              </div>
            </motion.div>

            <div className='space-y-6'>
              <motion.div
                variants={fadeUp}
                initial='hidden'
                animate={storyInView ? 'show' : 'hidden'}
                custom={0.1}
                className='flex items-center gap-3'
              >
                <div className='h-px w-10 bg-primary' />
                <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
                  Our Journey
                </span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                initial='hidden'
                animate={storyInView ? 'show' : 'hidden'}
                custom={0.15}
                className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
              >
                A decade of{' '}
                <span className='italic font-bold text-primary'>
                  empowering
                </span>{' '}
                people through technology
                <span className='text-primary'>.</span>
              </motion.h2>

              <motion.div
                variants={fadeUp}
                initial='hidden'
                animate={storyInView ? 'show' : 'hidden'}
                custom={0.2}
                className='space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base'
              >
                <p>
                  Located at Rafi Tower (5th Floor), Payra Chattor, Jhenaidah,
                  Oylkka IT & Training Center is more than an institution — it's
                  where thousands of young people have turned their ambitions
                  into careers.
                </p>
                <p>
                  For over a decade, we have delivered hands-on training under
                  the approval of the Bangladesh Technical Education Board. Our
                  5,000+ graduates are now working across the country and abroad
                  in design, development, marketing, and beyond.
                </p>
                <p>
                  Our mission is simple: equip the people of Jhenaidah and
                  surrounding areas with modern digital skills and help build a
                  prosperous, tech-ready Bangladesh.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial='hidden'
                animate={storyInView ? 'show' : 'hidden'}
                custom={0.3}
                className='flex items-center gap-4 pt-2'
              >
                <div className='flex -space-x-2.5'>
                  {team.slice(0, 3).map((member) => (
                    <div
                      key={member.name}
                      className='relative w-9 h-9 rounded-full border-2 border-background overflow-hidden'
                    >
                      <Image
                        src={member.img}
                        alt={member.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ))}
                  <div className='relative w-9 h-9 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center'>
                    <span className='text-[10px] font-bold text-primary'>
                      +
                    </span>
                  </div>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Experienced instructors & specialists
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Services ──────────────────────────────────────────────────── */}
      <section className='py-20 md:py-28 border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div ref={servicesRef} className='mb-12'>
            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate={servicesInView ? 'show' : 'hidden'}
              custom={0}
              className='flex items-center gap-3 mb-5'
            >
              <div className='h-px w-10 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
                Services & Courses
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial='hidden'
              animate={servicesInView ? 'show' : 'hidden'}
              custom={0.1}
              className='text-3xl md:text-4xl font-bold leading-tight tracking-tight max-w-xl'
            >
              What we{' '}
              <span className='italic font-bold text-primary'>offer</span>
              <span className='text-primary'>.</span>
            </motion.h2>
          </div>

          <motion.div
            variants={gridVariants}
            initial='hidden'
            animate={servicesInView ? 'show' : 'hidden'}
            className='grid grid-cols-2 md:grid-cols-4 gap-5'
          >
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.tag}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className='group rounded-2xl border border-border p-6
                    hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300
                    flex flex-col gap-4'
                >
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
                      {s.tag}
                    </span>
                  </div>
                  <h3 className='text-base font-bold leading-snug'>
                    {s.title}
                  </h3>
                  <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                    {s.desc}
                  </p>
                  <div className='flex items-center gap-2'>
                    <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                    <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                      Details
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 5. Values ────────────────────────────────────────────────────── */}
      <section className='py-20 md:py-28 border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div ref={valuesRef} className='mb-12'>
            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate={valuesInView ? 'show' : 'hidden'}
              custom={0}
              className='flex items-center gap-3 mb-5'
            >
              <div className='h-px w-10 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
                Our Values
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial='hidden'
              animate={valuesInView ? 'show' : 'hidden'}
              custom={0.1}
              className='text-3xl md:text-4xl font-bold leading-tight tracking-tight max-w-xl'
            >
              What we{' '}
              <span className='italic font-bold text-primary'>stand</span> for
              <span className='text-primary'>.</span>
            </motion.h2>
          </div>

          <motion.div
            variants={gridVariants}
            initial='hidden'
            animate={valuesInView ? 'show' : 'hidden'}
            className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'
          >
            {values.map((v, idx) => (
              <motion.div
                key={v.title}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className='group rounded-2xl border border-border p-6
                  hover:border-primary/30 hover:bg-primary/2 transition-colors duration-300
                  flex flex-col gap-4'
              >
                <div className='flex items-center justify-between'>
                  <div
                    className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                    group-hover:bg-primary/15 transition-colors duration-300'
                  >
                    <v.icon className='w-5 h-5 text-primary' />
                  </div>
                  <span
                    className='text-[10px] font-semibold tracking-[0.18em] uppercase
                    border border-border rounded-full px-2.5 py-1 text-muted-foreground
                    group-hover:border-primary/30 transition-colors duration-300'
                  >
                    {v.tag}
                  </span>
                </div>
                <h3 className='text-base font-bold leading-snug'>{v.title}</h3>
                <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                  {v.description}
                </p>
                <div className='flex items-center gap-2'>
                  <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                  <span className='text-[10px] text-primary/60 font-semibold tracking-wide uppercase'>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 6. Team ──────────────────────────────────────────────────────── */}
      <section id='team' className='py-20 md:py-28 border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div ref={teamRef} className='mb-12'>
            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate={teamInView ? 'show' : 'hidden'}
              custom={0}
              className='flex items-center gap-3 mb-5'
            >
              <div className='h-px w-10 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
                Our Team
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial='hidden'
              animate={teamInView ? 'show' : 'hidden'}
              custom={0.1}
              className='text-3xl md:text-4xl font-bold leading-tight tracking-tight max-w-xl'
            >
              The people{' '}
              <span className='italic font-bold text-primary'>behind</span>{' '}
              Oylkka IT
              <span className='text-primary'>.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial='hidden'
              animate={teamInView ? 'show' : 'hidden'}
              custom={0.15}
              className='mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl'
            >
              A dedicated team of skilled instructors, each directly involved in
              their field of expertise.
            </motion.p>
          </div>

          <motion.div
            variants={gridVariants}
            initial='hidden'
            animate={teamInView ? 'show' : 'hidden'}
            className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className='group rounded-2xl border border-border overflow-hidden
                  hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300'
              >
                <div className='relative h-96 md:h-80 overflow-hidden'>
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-700'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />
                </div>
                <div className='p-5 flex flex-col gap-3'>
                  <div>
                    <h3 className='text-base font-bold leading-tight'>
                      {member.name}
                    </h3>
                    <div className='flex items-center gap-2 mt-2'>
                      <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
                      <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/60'>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 7. CTA ───────────────────────────────────────────────────────── */}
      <section className='py-20 md:py-28'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='rounded-2xl border border-border p-10 md:p-16 text-center flex flex-col items-center gap-6'>
            <div className='flex items-center gap-3'>
              <div className='h-px w-8 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
                Get Started
              </span>
              <div className='h-px w-8 bg-primary' />
            </div>
            <h2 className='text-3xl md:text-4xl font-bold leading-tight tracking-tight max-w-xl'>
              Ready to start your{' '}
              <span className='italic font-bold text-primary'>career</span>{' '}
              today
              <span className='text-primary'>?</span>
            </h2>
            <p className='text-sm md:text-base text-muted-foreground leading-relaxed max-w-md'>
              Get skilled, get hired. Join Oylkka IT and build the career you've
              always wanted with government-certified training.
            </p>
            <div className='flex flex-row gap-3'>
              <Button size='lg' asChild className='h-12 px-8 gap-2'>
                <Link href='/oylkka-it-and-training-center/application'>
                  Apply Now
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </Button>
              <Button size='lg' variant='outline' asChild className='h-12 px-8'>
                <Link href='/contact'>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
