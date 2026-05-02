'use client';

import Autoplay from 'embla-carousel-autoplay';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import Image, { type StaticImageData } from 'next/image';
import { useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import img4 from '@/images/best-computer/adib.webp';
import img3 from '@/images/best-computer/dipu.webp';
import img2 from '@/images/best-computer/refa.webp';
import img1 from '@/images/best-computer/towfiq.webp';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

const testimonials = [
  {
    img: img1,
    name: 'তেীফিক',
    type: 'ছাত্র',
    des: 'বর্তমান প্রতিযোগিতামূলক যুগে কম্পিউটার শিক্ষার কোনো বিকল্প নেই। আপনি যদি কোন কোর্সে দক্ষ হতে চান। তাহলে আমি অবশ্যই সিদ্ধিরগঞ্জ বেস্ট ট্রেনিং সেন্টার থেকে কোর্স করার পরামর্শ দিব।',
  },
  {
    img: img2,
    name: 'রেফা',
    type: 'ছাত্রী',
    des: 'সুন্দর ও মনোরম পরিবেশ। সুসজ্জিত মাল্টিমিডিয়া কম্পিউটার ল্যাব যেখানে পর্যাপ্ত সময় অনুশীলন করা যায়। শিক্ষা প্রতিষ্ঠানে যেমন পরিবেশ থাকা প্রয়োজন এখানে সেই রকম সকল ব্যবস্থায় আছে।',
  },
  {
    img: img3,
    name: 'দিপু',
    type: 'ছাত্র',
    des: 'এখানের প্রশিক্ষকগণ অত্যন্ত বন্ধুসুলভ। তাই যেকোন সমস্যার কথা খুব সহজেই বলা যায়। আমি এখান থেকে কোর্স করে খুবই উপকৃত হয়েছি। কারণ আমি তাদের কাছ থেকে সর্বোচ্চ সহযোগিতা পেয়েছি।',
  },
  {
    img: img4,
    name: 'আদিব',
    type: 'ছাত্র',
    des: 'আমি ষষ্ঠ শ্রেণীর ছাত্র। আমি কম্পিউটার শিখতে পারব কিনা? এ নিয়ে দুশ্চিন্তাই ছিলাম। কিন্তু এখানে এসে আমার ধারণা পাল্টে যায় এবং তাদের শিখানোর পদ্ধতির জন্য খুব সহজ ও সুন্দরভাবেই কোর্স সম্পন্ন করেছি।',
  },
];

function TestimonialCard({
  img,
  name,
  type,
  des,
}: {
  img: StaticImageData;
  name: string;
  type: string;
  des: string;
}) {
  return (
    <motion.div
      className='group rounded-2xl border border-border p-6 flex flex-col gap-5
        hover:border-primary/30 hover:bg-primary/[0.02] transition-colors duration-300 h-full'
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {/* Quote icon */}
      <div
        className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
        group-hover:bg-primary/15 transition-colors duration-300 shrink-0'
      >
        <Quote className='w-5 h-5 text-primary' />
      </div>

      {/* Testimonial text */}
      <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
        {des}
      </p>

      {/* Author row */}
      <div className='flex items-center gap-3 pt-2 border-t border-border'>
        <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-background ring-2 ring-primary/10 shrink-0'>
          <Image src={img} alt={name} fill className='object-cover' />
        </div>
        <div>
          <p className='text-sm font-bold leading-tight'>{name}</p>
          <div className='flex items-center gap-2 mt-1'>
            <div className='h-px w-5 bg-primary/40 group-hover:w-8 transition-all duration-300' />
            <span className='text-[10px] font-semibold tracking-[0.18em] uppercase text-primary/60'>
              {type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeedBack() {
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
              ছাত্র প্রতিক্রিয়া
            </span>
          </motion.div>

          <motion.h2
            className='text-3xl md:text-4xl font-bold leading-tight tracking-tight'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.1}
          >
            শিক্ষার্থীরা যা{' '}
            <span className='italic font-bold text-primary'>বলছেন</span>
            <span className='text-primary'>।</span>
          </motion.h2>

          <motion.p
            className='mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl'
            variants={fadeUp}
            initial='hidden'
            animate={inView ? 'show' : 'hidden'}
            custom={0.15}
          >
            আমাদের শিক্ষার্থীদের সফলতার গল্প এবং অভিজ্ঞতা।
          </motion.p>
        </div>

        {/* Carousel */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate={inView ? 'show' : 'hidden'}
          custom={0.2}
        >
          <Carousel
            plugins={[Autoplay({ delay: 2500, stopOnInteraction: true })]}
            opts={{ align: 'start' }}
          >
            <CarouselContent className='-ml-5'>
              {testimonials.map((t, i) => (
                <CarouselItem
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  key={i}
                  className='pl-5 md:basis-1/2 lg:basis-1/3 pt-2'
                >
                  <TestimonialCard {...t} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className='flex items-center gap-2 mt-8'>
              <CarouselPrevious className='static translate-x-0 translate-y-0' />
              <CarouselNext className='static translate-x-0 translate-y-0' />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
