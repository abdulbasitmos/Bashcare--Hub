import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Hero from './Hero';
import Features from './Features';
import HealthStatsTicker from '../../components/landing/HealthStatsTicker';
import CertificationStrip from '../../components/landing/CertificationStrip';
import FAQ from '../../components/landing/FAQ';
import HowItWorks from '../../components/landing/HowItWorks';
import Newsletter from '../../components/landing/Newsletter';
import Testimonials from '../../components/landing/Testimonials';
import FeaturedSpecialists from '../../components/landing/FeaturedSpecialists';

const LandingPage = () => {
  return (
    <PageWrapper>
      <HealthStatsTicker />
      <Hero />
      <CertificationStrip />
      <Features />
      <HowItWorks />
      <FeaturedSpecialists />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </PageWrapper>
  );
};

export default LandingPage;
