import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  trigger: boolean;
  onComplete?: () => void;
  sourceRect?: DOMRect | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ trigger, onComplete, sourceRect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const count = 120;

    // Origin point from source rectangle or center
    const startX = sourceRect ? sourceRect.left + sourceRect.width / 2 : window.innerWidth / 2;
    const startY = sourceRect ? sourceRect.top + sourceRect.height / 3 : window.innerHeight / 2;
    const spreadWidth = sourceRect ? sourceRect.width * 0.8 : 300;
    const spreadHeight = sourceRect ? sourceRect.height * 0.5 : 180;

    for (let i = 0; i < count; i++) {
      const px = startX + (Math.random() - 0.5) * spreadWidth;
      const py = startY + (Math.random() - 0.5) * spreadHeight;
      const speed = Math.random() * 2.5 + 0.8;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // Upward drift angle

      particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // Strong upward lift
        radius: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.015 + 0.008,
        color: i % 5 === 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)',
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [trigger, onComplete, sourceRect]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
