'use client';
import Hero from "@/_components/ui/hero";
import { CtaBlock } from "./_components/cta-block";
import { EthicalBreeder } from "./_components/ethical-breeder";
import { FeaturedBreedsByType } from "./_components/featured-breed-type";
import { FeaturedBreeds } from "./_components/featured-breeds";
import { FeaturedPuppies } from "./_components/featured-puppies";
import { PromotionBlock } from "./_components/promotion-block";
import { PupsForSale } from "./_components/pups-for-sale";
import { Services } from "./_components/services";
import { Testimonial } from "./_components/testimonial";
import { TrustedBreeder } from "./_components/truster-breeder";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

function Home() {
  return (
    <>
      <Hero />
      <FeaturedBreeds />
      <FeaturedBreedsByType />
      <Services />
      <FeaturedPuppies />
      <PromotionBlock />
      <PupsForSale />
      <EthicalBreeder />
      <TrustedBreeder />
      <Testimonial />
      <CtaBlock />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
