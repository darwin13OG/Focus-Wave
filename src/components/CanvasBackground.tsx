import React, { useEffect, useRef } from 'react';
import { SoundChannel, ThemePalette } from '../types';

interface CanvasBackgroundProps {
  channels: SoundChannel[];
  theme: ThemePalette;
}

interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  radius: number;
  angle: number;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ channels, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine active sound influences
  const rainVol = channels.find((c) => c.id === 'rain')?.volume || 0;
  const fireVol = channels.find((c) => c.id === 'fireplace')?.volume || 0;
  const oceanVol = channels.find((c) => c.id === 'ocean')?.volume || 0;
  const windVol = channels.find((c) => c.id === 'wind')?.volume || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particles array
    const particlesCount = 75;
    const particles: Particle[] = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 15 + 5,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        radius: Math.random() * 2 + 0.8,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Subtle gradient background glow
      const isRainActive = rainVol > 0;
      const isFireActive = fireVol > 0;
      const isOceanActive = oceanVol > 0;

      // Draw subtle ambient glow spots
      const cx1 = width * 0.2 + Math.sin(time * 0.5) * 50;
      const cy1 = height * 0.3 + Math.cos(time * 0.3) * 50;
      const g1 = ctx.createRadialGradient(cx1, cy1, 10, cx1, cy1, width * 0.4);
      
      if (isFireActive) {
        g1.addColorStop(0, `rgba(239, 68, 68, ${0.03 + (fireVol / 100) * 0.08})`);
      } else if (isOceanActive) {
        g1.addColorStop(0, `rgba(20, 184, 166, ${0.03 + (oceanVol / 100) * 0.08})`);
      } else {
        g1.addColorStop(0, `${theme.particleColor.replace('0.4', '0.06')}`);
      }
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Render Particles
      particles.forEach((p) => {
        if (isRainActive) {
          // Rain mode: vertical falling streaks
          ctx.beginPath();
          ctx.strokeStyle = `rgba(103, 232, 249, ${p.opacity * (0.3 + (rainVol / 100) * 0.7)})`;
          ctx.lineWidth = 1;
          const dropLength = p.length * (1 + (rainVol / 100) * 0.8);
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1, p.y + dropLength);
          ctx.stroke();

          p.y += p.speed * (2 + (rainVol / 100) * 3);
          p.x -= 0.5;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        } else if (isFireActive) {
          // Fire ember mode: warm floating sparks moving upward
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (0.8 + (fireVol / 100) * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 146, 60, ${p.opacity * (0.4 + (fireVol / 100) * 0.6)})`;
          ctx.fill();

          p.y -= p.speed * 0.8;
          p.x += Math.sin(time + p.y * 0.02) * 0.8;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else if (isOceanActive) {
          // Ocean Wave mode: slow horizontal floating ripples
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(45, 212, 191, ${p.opacity * 0.5})`;
          ctx.fill();

          p.x += Math.sin(time * 0.8 + p.angle) * 1.2;
          p.y += Math.cos(time * 0.5 + p.angle) * 0.5;
        } else {
          // Zen ambient floating dust particles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = theme.particleColor;
          ctx.fill();

          const windFactor = (windVol / 100) * 1.5;
          p.x += Math.cos(time * 0.3 + p.angle) * 0.4 + windFactor;
          p.y += Math.sin(time * 0.3 + p.angle) * 0.4;

          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
          if (p.y > height) p.y = 0;
          if (p.y < 0) p.y = height;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [channels, theme, rainVol, fireVol, oceanVol, windVol]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
};
