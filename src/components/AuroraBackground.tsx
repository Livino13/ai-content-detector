'use client';

import React, { useMemo } from 'react';

interface Star {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

export const AuroraBackground: React.FC = () => {
  const cells = useMemo(() => {
    // Deterministic pseudo-random so SSR + client match
    // Palette sampled from reference: pale ice-blues + white
    const palette = [
      '#c9dcee', '#c9dcee',
      '#d4e3f1', '#d4e3f1', '#d4e3f1',
      '#dde9f4', '#dde9f4', '#dde9f4',
      '#e7f0f8', '#e7f0f8',
      '#f2f6fb',
      '#ffffff', '#ffffff',
    ];
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const cols = 18;
    const rows = 32;
    const arr: { bg: string; opacity: number }[] = [];
    for (let i = 0; i < cols * rows; i++) {
      arr.push({
        bg: palette[Math.floor(rand() * palette.length)],
        opacity: 0.85 + rand() * 0.15,
      });
    }
    return { arr, cols, rows };
  }, []);

  // Interactive hover-tile overlay grid (transparent cells over the photo)
  const HOVER_COLS = 40;
  const HOVER_ROWS = 24;
  const hoverTiles = useMemo(
    () => Array.from({ length: HOVER_COLS * HOVER_ROWS }, (_, i) => i),
    []
  );

  const stars = useMemo<Star[]>(() => {    // Deterministic pseudo-random so SSR + client match
    const arr: Star[] = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 140; i++) {
      arr.push({
        left: `${rand() * 100}%`,
        top: `${rand() * 100}%`,
        size: rand() < 0.85 ? 1 + rand() * 1.5 : 2 + rand() * 1.5,
        delay: `${(rand() * 6).toFixed(2)}s`,
        duration: `${(2.5 + rand() * 4).toFixed(2)}s`,
        opacity: 0.35 + rand() * 0.65,
      });
    }
    return arr;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#e9f1f8]"
    >
      {/* Drifting tile layer — overscanned so edges never show while moving.
          Exact user image on top; CSS mosaic behind it as fallback. */}
      <div className="mosaic-drift absolute -inset-[5%]">
        {/* CSS mosaic fallback — recreates the light-blue grid reference */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cells.cols}, 1fr)`,
            gridTemplateRows: `repeat(${cells.rows}, 1fr)`,
            gap: '3px',
            backgroundColor: '#ffffff',
          }}
        >
          {cells.arr.map((c, i) => (
            <div
              key={i}
              style={{ backgroundColor: c.bg, opacity: c.opacity }}
            />
          ))}
        </div>

        {/* Exact user image — public/grid-bg.png */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/grid-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Interactive tile layer — each tile lifts when hovered */}
        <div
          className="pointer-events-auto absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${HOVER_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${HOVER_ROWS}, 1fr)`,
            gap: '3px',
          }}
        >
          {hoverTiles.map((i) => (
            <div key={i} className="mosaic-tile" />
          ))}
        </div>
      </div>

      {/* Light sheen sweeping across the tiles */}
      <div className="mosaic-sheen absolute inset-0" />

      {/* Soft white glow in center, like the reference */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(at 50% 42%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 22%, rgba(255,255,255,0.35) 42%, transparent 62%), radial-gradient(at 50% 110%, rgba(255,255,255,0.6) 0%, transparent 40%)',
        }}
      />

      {/* Starfield — kept very subtle for light theme */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="aurora-star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: 0.25,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* Readability: very light cool vignette so cards pop, no dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(47,72,96,0.06) 0%, transparent 18%, transparent 82%, rgba(47,72,96,0.08) 100%)',
        }}
      />
    </div>
  );
};
