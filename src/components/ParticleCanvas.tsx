import React, { useEffect, useRef } from 'react';
import { ReleaseRitual } from '../types';

interface ParticleCanvasProps {
  trigger: boolean;
  ritual?: ReleaseRitual;
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
  rotation?: number;
  vRot?: number;
  shape?: 'circle' | 'square' | 'spark';
  sizeX?: number;
  sizeY?: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  trigger,
  ritual = 'dust',
  onComplete,
  sourceRect,
}) => {
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
    const startX = sourceRect ? sourceRect.left + sourceRect.width / 2 : window.innerWidth / 2;
    const startY = sourceRect ? sourceRect.top + sourceRect.height / 3 : window.innerHeight / 2;
    const spreadWidth = sourceRect ? sourceRect.width * 0.85 : 320;
    const spreadHeight = sourceRect ? sourceRect.height * 0.55 : 200;

    let shockwaveRadius = 0;
    let shockwaveAlpha = ritual === 'supernova' || ritual === 'ocean' ? 0.8 : 0;

    // --- Spawn particles per ritual ---
    if (ritual === 'fire') {
      const count = 160;
      for (let i = 0; i < count; i++) {
        const px = startX + (Math.random() - 0.5) * spreadWidth;
        const py = startY + (Math.random() - 0.5) * spreadHeight;
        const speed = Math.random() * 3.5 + 1.2;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const colors = [
          'rgba(255, 230, 120, 0.95)', // Yellow heat
          'rgba(255, 120, 40, 0.9)',   // Orange flame
          'rgba(240, 60, 30, 0.85)',   // Crimson ember
          'rgba(255, 255, 255, 0.95)', // White core spark
          'rgba(180, 50, 20, 0.7)',
        ];

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(angle) * speed - 2.5, // Rapid upward lift
          radius: Math.random() * 3.5 + 1,
          alpha: Math.random() * 0.9 + 0.3,
          decay: Math.random() * 0.018 + 0.009,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.4 ? 'spark' : 'circle',
        });
      }
    } else if (ritual === 'ocean') {
      const count = 140;
      for (let i = 0; i < count; i++) {
        const px = startX + (Math.random() - 0.5) * spreadWidth;
        const py = startY + (Math.random() - 0.5) * spreadHeight;
        const speed = Math.random() * 2.2 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const colors = [
          'rgba(45, 212, 191, 0.9)',  // Bioluminescent teal
          'rgba(56, 189, 248, 0.85)', // Cyan wave
          'rgba(165, 243, 252, 0.95)',// White-blue crest
          'rgba(99, 102, 241, 0.7)',  // Deep indigo drop
        ];

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8, // gentle float
          radius: Math.random() * 4 + 1.2,
          alpha: Math.random() * 0.85 + 0.25,
          decay: Math.random() * 0.014 + 0.007,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: 'circle',
        });
      }
    } else if (ritual === 'supernova') {
      const count = 180;
      for (let i = 0; i < count; i++) {
        const px = startX + (Math.random() - 0.5) * (spreadWidth * 0.4);
        const py = startY + (Math.random() - 0.5) * (spreadHeight * 0.4);
        const speed = Math.random() * 5.5 + 1.5;
        const angle = Math.random() * Math.PI * 2;
        const colors = [
          'rgba(244, 114, 182, 0.95)', // Cosmic Pink
          'rgba(192, 132, 252, 0.95)', // Nebula Purple
          'rgba(96, 165, 250, 0.9)',   // Star Blue
          'rgba(255, 255, 255, 1.0)',   // Star White
        ];

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 3 + 0.8,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.008,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: 'spark',
        });
      }
    } else if (ritual === 'crumple') {
      const count = 100;
      for (let i = 0; i < count; i++) {
        const px = startX + (Math.random() - 0.5) * spreadWidth;
        const py = startY + (Math.random() - 0.5) * spreadHeight;
        const speed = Math.random() * 3.0 + 0.6;
        const angle = Math.random() * Math.PI * 2;

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.6, // slight gravity drop
          radius: Math.random() * 5 + 2,
          sizeX: Math.random() * 7 + 3,
          sizeY: Math.random() * 7 + 3,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: Math.random() * 0.85 + 0.2,
          decay: Math.random() * 0.016 + 0.008,
          color: i % 3 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(200, 200, 200, 0.65)',
          shape: 'square',
        });
      }
    } else {
      // Classic Dust
      const count = 130;
      for (let i = 0; i < count; i++) {
        const px = startX + (Math.random() - 0.5) * spreadWidth;
        const py = startY + (Math.random() - 0.5) * spreadHeight;
        const speed = Math.random() * 2.5 + 0.8;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          radius: Math.random() * 2.5 + 0.8,
          alpha: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.015 + 0.008,
          color: i % 5 === 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)',
          shape: 'circle',
        });
      }
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render shockwave ring if active
      if (shockwaveAlpha > 0) {
        shockwaveRadius += ritual === 'supernova' ? 12 : 6;
        shockwaveAlpha -= 0.025;
        if (shockwaveAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, shockwaveAlpha);
          ctx.strokeStyle = ritual === 'supernova' ? '#C084FC' : '#2DD4BF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(startX, startY, shockwaveRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (ritual === 'fire') {
          ctx.shadowColor = 'rgba(255, 100, 30, 0.9)';
          ctx.shadowBlur = 10;
        } else if (ritual === 'supernova') {
          ctx.shadowColor = 'rgba(216, 180, 254, 0.9)';
          ctx.shadowBlur = 8;
        } else if (ritual === 'ocean') {
          ctx.shadowColor = 'rgba(45, 212, 191, 0.8)';
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 6;
        }

        if (p.shape === 'square') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillRect(-(p.sizeX || 4) / 2, -(p.sizeY || 4) / 2, p.sizeX || 4, p.sizeY || 4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0 || shockwaveAlpha > 0) {
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
  }, [trigger, ritual, onComplete, sourceRect]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

