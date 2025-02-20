import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/footer/Footer";
import Contact from "../contact/Contact";
import Cta from "./Cta";
import Hero from "./Hero";
import ImageSlider from "./ImageSlider";
import { Slider } from "./Slider";
import State from "./State";

export default function Home() {
  return (
    <>
      <Header fixed />
      <Hero />
      <State />
      <Slider />
      <ImageSlider />
      <Contact />
      <Cta />
      <Footer />
    </>
  );
}
