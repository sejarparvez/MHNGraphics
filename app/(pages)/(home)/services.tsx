'use client';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  GraduationCap,
  Heart,
  Palette,
  Play,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Service {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge: string;
  link: string;
  showApplyButton?: boolean;
  showQuizButton?: boolean;
  soon?: boolean;
  accentClass?: string;
  borderClass?: string;
  gradientClass?: string;
}

const services: Service[] = [
  {
    id: 'training-center',
    title: 'Oylkka IT & Computer Training Center',
    icon: <GraduationCap className='w-8 h-8' />,
    badge: 'Education',
    link: '/oylkka-it-and-training-center',
    showApplyButton: true,
    showQuizButton: true,
    accentClass:
      'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900/50 text-blue-600 dark:text-blue-400',
    borderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
    gradientClass: 'from-blue-500/5 to-transparent',
  },

  {
    id: 'it-agency',
    title: 'Oylkka IT Agency',
    icon: <Palette className='w-8 h-8' />,
    badge: 'Creative',
    link: '/',
    accentClass:
      'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950 dark:to-purple-900/50 text-purple-600 dark:text-purple-400',
    borderClass: 'hover:border-purple-300 dark:hover:border-purple-700',
    gradientClass: 'from-purple-500/5 to-transparent',
  },
  {
    id: 'ecommerce',
    title: 'Oylkka E-Commerce',
    icon: <ShoppingCart className='w-8 h-8' />,
    badge: 'Commerce',
    link: 'https://www.oylkka.com',
    accentClass:
      'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    borderClass: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    gradientClass: 'from-emerald-500/5 to-transparent',
  },
  {
    id: 'blood-bank',
    title: 'Oylkka Blood Bank',
    icon: <Heart className='w-8 h-8' />,
    badge: 'Healthcare',
    link: '/oylkka-it-and-training-center/blood-donate',
    accentClass:
      'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950 dark:to-red-900/50 text-red-600 dark:text-red-400',
    borderClass: 'hover:border-red-300 dark:hover:border-red-700',
    gradientClass: 'from-red-500/5 to-transparent',
  },
  {
    id: 'foundation',
    title: 'Oylkka Foundation',
    icon: <Heart className='w-8 h-8' />,
    badge: 'Non-Profit',
    link: '#',
    soon: true,
    accentClass:
      'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900/50 text-amber-600 dark:text-amber-400',
    borderClass: 'hover:border-amber-300 dark:hover:border-amber-700',
    gradientClass: 'from-amber-500/5 to-transparent',
  },
];

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const isExternalLink = service.link.startsWith('http');
  const isSoon = service.soon;

  const LearnMoreButton = () => (
    <Button
      className={`w-full font-semibold rounded-xl transition-all duration-300 ${isSoon ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg hover:scale-105'}`}
      disabled={isSoon}
      variant='default'
    >
      {isSoon ? 'Coming Soon' : 'Learn More'}
      {!isSoon && (
        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
      )}
    </Button>
  );

  const ApplyButton = () => (
    <Button
      className='w-full font-semibold bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105'
      variant='secondary'
    >
      Apply Now
    </Button>
  );

  const QuizButton = () => (
    <Button className='w-full font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'>
      <Play className='mr-2 h-4 w-4' />
      Play Quiz
    </Button>
  );

  return (
    <div className={`h-full ${isSoon ? 'cursor-not-allowed' : ''}`}>
      <Card
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-linear-to-br transition-all duration-500 ${
          isSoon
            ? 'opacity-60 border-muted'
            : `border-gray-200 dark:border-gray-700 ${service.borderClass} shadow-sm hover:shadow-2xl hover:border-opacity-100`
        } ${service.gradientClass}`}
      >
        <div
          className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 ${isSoon ? '' : 'group-hover:opacity-100'}`}
          style={{
            background: `radial-gradient(circle at top right, var(--color-accent-light), transparent)`,
          }}
        />
        <CardHeader className='relative z-10 grow p-6 sm:p-8'>
          <div className='flex items-center justify-between mb-6'>
            <motion.div
              className={`p-4 rounded-2xl shadow-md ${service.accentClass}`}
              whileHover={{ scale: isSoon ? 1 : 1.15, rotate: isSoon ? 0 : 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {service.icon}
            </motion.div>
            <Badge variant='secondary' className='rounded-full px-4'>
              {service.badge}
            </Badge>
          </div>
          <CardTitle className='text-2xl font-bold text-foreground transition-colors duration-500 leading-snug'>
            {service.title}
          </CardTitle>
        </CardHeader>
        <CardFooter className='relative z-10 p-6 sm:p-8 pt-2 gap-3 flex flex-col'>
          <div className='w-full flex gap-3'>
            {isExternalLink || isSoon ? (
              <a
                href={isSoon ? '#' : service.link}
                target={isSoon ? '' : '_blank'}
                rel={isSoon ? '' : 'noopener noreferrer'}
                className={service.showApplyButton ? 'flex-1' : 'w-full'}
                onClick={(e) => isSoon && e.preventDefault()}
              >
                <LearnMoreButton />
              </a>
            ) : (
              <Link
                href={service.link}
                className={service.showApplyButton ? 'flex-1' : 'w-full'}
              >
                <LearnMoreButton />
              </Link>
            )}

            {service.showApplyButton && !service.showQuizButton && (
              <Link
                href='/oylkka-it-and-training-center/application'
                className='flex-1'
              >
                <ApplyButton />
              </Link>
            )}

            {service.showApplyButton && service.showQuizButton && (
              <Link
                href='/oylkka-it-and-training-center/application'
                className='flex-1'
              >
                <ApplyButton />
              </Link>
            )}
          </div>

          {service.showQuizButton && (
            <Link href='/quiz' className='w-full'>
              <QuizButton />
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

const ServicesSection: React.FC = () => {
  return (
    <section className='py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background via-background/50 to-background'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-20'>
          <div>
            <h2 className='text-5xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight tracking-tight'>
              Explore Our Services
            </h2>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
              Discover our comprehensive suite of educational, creative, and
              business solutions designed to empower your growth.
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10'>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
