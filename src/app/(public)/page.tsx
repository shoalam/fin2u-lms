import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PartnersSection from '@/components/home/PartnersSection';
import WhySection from '@/components/home/WhySection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import ShangHaiVideoSection from '@/components/home/ShangHaiVideoSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BecomeAMentor from '@/components/home/BecomeAMentor';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PartnersSection />
        <WhySection />
        <FeaturedCourses />
        <ShangHaiVideoSection />
        <TestimonialsSection />
        <BecomeAMentor />
      </main>
      <Footer />
    </>
  );
}
