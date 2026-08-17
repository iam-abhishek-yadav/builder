import { AuthWarmup } from "@/components/auth/auth-warmup";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function Home() {
  return (
    <>
      <AuthWarmup />
      <SiteHeader />
      <main>
        <HeroSection />
        <HowItWorks />
      </main>
      <SiteFooter />
    </>
  );
}
