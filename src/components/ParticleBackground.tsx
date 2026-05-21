import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const getWindowSize = () => ({
  width: typeof window === 'undefined' ? 0 : window.innerWidth,
  height: typeof window === 'undefined' ? 0 : window.innerHeight,
});

const seededValue = (seed: number) => {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
};

export const ParticleBackground = () => {
  const [windowSize, setWindowSize] = useState(getWindowSize);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: seededValue(i + 1) * windowSize.width,
        y: seededValue(i + 31) * windowSize.height,
        size: seededValue(i + 61) * 4 + 1,
        duration: seededValue(i + 91) * 30 + 20,
        delay: seededValue(i + 121) * -40,
        driftXOne: seededValue(i + 151) * 100 - 50,
        driftXTwo: seededValue(i + 181) * 100 - 50,
      })),
    [windowSize.height, windowSize.width],
  );

  if (windowSize.width === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-academic-bg">
        {/* Extremely subtle radial gradients for depth */}
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-slate-300/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[50rem] h-[50rem] bg-emerald-900/5 rounded-full blur-[150px]" />
      </div>
      
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-academic-brand/20 blur-[1px]"
          style={{
            width: particle.size,
            height: particle.size,
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            y: [particle.y, particle.y - windowSize.height * 1.5],
            x: [
              particle.x, 
              particle.x + particle.driftXOne, 
              particle.x + particle.driftXTwo
            ],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};
