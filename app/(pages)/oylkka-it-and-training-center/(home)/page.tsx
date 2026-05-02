import Footer from '@/components/layout/footer/Footer';
import Header from '@/components/layout/Header/Header';
import Hero from '../../(home)/Hero';
import Courses from './Course';
import FeedBack from './FeedBack';
import Gallery from './Gallery';
import Insights from './Insights';
import Members from './Members';
import Notice from './Notice';
import Payment from './Payment';
import ScrollNotice from './ScrollNotice';
import Services from './Service';
import WorkPlace from './WarkPlace';
import WhyUs from './WhyUs';

export default function page() {
  return (
    <>
      <Header fixed best />
      <div className='overflow-x-clip'>
        <Hero />
        <ScrollNotice />
        <Notice />
        <Courses />
        <Services />
        <WhyUs />
        <Insights />
        <Members />
        <FeedBack />
        <Gallery />
        <WorkPlace />
        <Payment />
      </div>
      <Footer />
    </>
  );
}
