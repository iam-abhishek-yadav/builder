import { Features } from "@/components/landing/features";
import { HeroSection } from "@/components/landing/hero-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { WhoItsFor } from "@/components/landing/who-its-for";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <WhoItsFor />
        <Features />
      </main>
      <SiteFooter />
    </>
  );
}
