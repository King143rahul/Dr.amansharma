import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { TimelineSection } from '../components/TimelineSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TimelineSection />
      <AboutSection />
    </main>
  );
}
