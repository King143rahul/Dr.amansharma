import { useEffect, useRef } from 'react';

const seededValue = (seed: number) => {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
};

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = Date.now();

    // Generate particle configuration statically
    const particleConfig = Array.from({ length: 30 }).map((_, i) => ({
      ratioX: seededValue(i + 1),
      ratioY: seededValue(i + 31),
      size: seededValue(i + 61) * 4 + 1,
      duration: (seededValue(i + 91) * 30 + 20) * 1000, // convert to ms
      delay: seededValue(i + 121) * -40 * 1000, // convert to ms
      driftXOne: seededValue(i + 151) * 100 - 50,
      driftXTwo: seededValue(i + 181) * 100 - 50,
    }));

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const resizeCanvas = (force = false) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Only resize if width changes or height changes significantly (prevents address bar lag on mobile)
      if (force || width !== lastWidth || Math.abs(height - lastHeight) > 80) {
        canvas.width = width;
        canvas.height = height;
        lastWidth = width;
        lastHeight = height;
      }
    };

    resizeCanvas(true);
    
    const handleResize = () => resizeCanvas(false);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      const elapsed = now - startTime;

      particleConfig.forEach((p) => {
        // Compute animation progress
        const t = (elapsed - p.delay) % p.duration;
        const progress = t / p.duration;

        // Compute Y coordinate
        const startY = p.ratioY * canvas.height;
        const y = startY - progress * (canvas.height * 1.5);

        // Interpolate X coordinate
        const startX = p.ratioX * canvas.width;
        let x = startX;
        if (progress < 0.5) {
          x = startX + (progress / 0.5) * p.driftXOne;
        } else {
          x = startX + p.driftXOne + ((progress - 0.5) / 0.5) * (p.driftXTwo - p.driftXOne);
        }

        // Interpolate Opacity
        let opacity = 0;
        if (progress < 0.5) {
          opacity = (progress / 0.5) * 0.4;
        } else {
          opacity = 0.4 - ((progress - 0.5) / 0.5) * 0.4;
        }

        // Draw particle (using academic-brand color #05603f, i.e., rgb(5, 96, 63))
        ctx.beginPath();
        ctx.arc(x, y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 96, 63, ${opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-academic-bg">
        {/* Extremely subtle radial gradients for depth */}
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-slate-300/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[50rem] h-[50rem] bg-emerald-900/5 rounded-full blur-[150px]" />
      </div>
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full blur-[1px]"
      />
    </div>
  );
};
