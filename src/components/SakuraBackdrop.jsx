import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export function SakuraBackdrop() {
  const { sakuraEnabled } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!sakuraEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const count = width < 640 ? 11 : 15;
    const colors = [
      { fill: 'rgba(244, 114, 182, 0.34)', stroke: 'rgba(236, 72, 153, 0.28)' },
      { fill: 'rgba(251, 113, 133, 0.30)', stroke: 'rgba(244, 63, 94, 0.24)' },
      { fill: 'rgba(249, 168, 212, 0.36)', stroke: 'rgba(244, 114, 182, 0.26)' },
    ];

    const petals = Array.from({ length: count }, (_, i) => {
      const size = 10 + (i % 4) * 2.2;
      // Stratified horizontal & vertical distribution so petals cover the whole screen evenly
      const xSlot = (i + 0.15 + ((i * 37) % 70) * 0.01) / count;
      const ySlot = ((i * 7 + 3) % count + 0.2) / count;
      return {
        x: xSlot * width,
        y: ySlot * height,
        size,
        baseVy: 0.42 + (i % 5) * 0.1,
        baseVx: (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 3) * 0.05),
        vx: 0,
        vy: 0,
        swayAmp: 0.4 + (i % 4) * 0.14,
        swayFreq: 0.011 + (i % 3) * 0.004,
        phase: i * 1.3,
        angle: (i * 0.7) % (Math.PI * 2),
        spinSpeed: (i % 2 === 0 ? 1 : -1) * (0.005 + (i % 3) * 0.002),
        spinExtra: 0,
        tilt: (i * 0.5) % Math.PI,
        tiltSpeed: 0.01 + (i % 4) * 0.003,
        color: colors[i % colors.length],
      };
    });

    // Subtle local breeze wake points along pointer path
    const wakes = [];
    const pointer = {
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      lastTime: 0,
    };

    const addWake = (x, y) => {
      const now = performance.now();
      const dt = Math.max(8, now - pointer.lastTime);
      if (pointer.lastX !== -9999 && dt < 160) {
        const dx = x - pointer.lastX;
        const dy = y - pointer.lastY;
        const dist = Math.hypot(dx, dy);
        if (dist > 3) {
          // Very gentle breeze vector capped tightly
          const vx = Math.max(-2.2, Math.min(2.2, (dx / dt) * 2.2));
          const vy = Math.max(-2.2, Math.min(2.2, (dy / dt) * 2.2));
          wakes.push({
            x,
            y,
            vx,
            vy,
            radius: width < 640 ? 110 : 140,
            life: 1.0,
          });
          if (wakes.length > 10) wakes.shift();
        }
      }
      pointer.lastX = x;
      pointer.lastY = y;
      pointer.x = x;
      pointer.y = y;
      pointer.lastTime = now;
    };

    const onMouseMove = (e) => addWake(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        addWake(t.clientX, t.clientY);
      }
    };
    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        pointer.lastX = t.clientX;
        pointer.lastY = t.clientY;
        pointer.lastTime = performance.now();
      }
    };
    const onTouchEnd = () => {
      pointer.lastX = -9999;
      pointer.lastY = -9999;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    const drawPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      const scaleY = 0.65 + 0.35 * Math.cos(p.tilt);
      ctx.scale(1, scaleY);

      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.85);
      ctx.bezierCurveTo(s * 0.65, -s * 0.75, s * 0.85, 0, 0, s * 0.88);
      ctx.bezierCurveTo(-s * 0.85, 0, -s * 0.65, -s * 0.75, 0, -s * 0.85);
      ctx.closePath();

      ctx.fillStyle = p.color.fill;
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = p.color.stroke;
      ctx.stroke();

      ctx.restore();
    };

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = wakes.length - 1; i >= 0; i--) {
        wakes[i].life *= 0.9;
        if (wakes[i].life < 0.05) {
          wakes.splice(i, 1);
        }
      }

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.phase += p.swayFreq;
        p.tilt += p.tiltSpeed;

        // Apply soft local breeze from nearby pointer wakes
        for (let w = 0; w < wakes.length; w++) {
          const wake = wakes[w];
          const dx = p.x - wake.x;
          const dy = p.y - wake.y;
          const dist = Math.hypot(dx, dy);
          if (dist < wake.radius && dist > 0.1) {
            const falloff = Math.pow(1 - dist / wake.radius, 2) * wake.life;
            // Gentle nudge in movement direction + slight outward drift
            p.vx += (wake.vx * 0.045 + (dx / dist) * 0.025) * falloff;
            p.vy += (wake.vy * 0.035 + (dy / dist) * 0.02) * falloff;
            p.spinExtra += (wake.vx * 0.0005) * falloff;
          }
        }

        // Smooth air damping
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.spinExtra *= 0.95;

        // Clamp max extra velocity so it never looks like a hurricane
        p.vx = Math.max(-1.2, Math.min(1.2, p.vx));
        p.vy = Math.max(-0.9, Math.min(0.9, p.vy));
        p.spinExtra = Math.max(-0.015, Math.min(0.015, p.spinExtra));

        const swayX = Math.sin(p.phase) * p.swayAmp;
        p.x += p.baseVx + swayX + p.vx;
        p.y += p.baseVy + p.vy;
        p.angle += p.spinSpeed + p.spinExtra;

        if (p.y > height + 30) {
          p.y = -25;
          const slot = (i + 0.1 + ((tick * 0.13 + i * 0.37) % 0.8)) / count;
          p.x = slot * width;
          p.vx = 0;
          p.vy = 0;
        } else if (p.y < -40) {
          p.y = height + 20;
        }
        if (p.x > width + 35) {
          p.x = -25;
        } else if (p.x < -35) {
          p.x = width + 25;
        }

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [sakuraEnabled]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full opacity-35 dark:opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.16) 0%, rgba(244, 114, 182, 0.10) 45%, transparent 75%)',
        }}
      />
      {sakuraEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
}
