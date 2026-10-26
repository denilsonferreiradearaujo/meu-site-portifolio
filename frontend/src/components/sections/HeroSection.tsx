'use client';

import React, { useEffect, useRef } from 'react';
import { getFullAssetUrl } from '@/services/api';

interface HeroSectionProps {
  status: string;
  title: string;
  intro: string;
  cvUrl?: string;
  photoUrl?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  status,
  title,
  intro,
  cvUrl,
  photoUrl,
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleParallax = () => {
      if (
        window.innerWidth < 851 ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      const hero = heroRef.current;
      if (!hero) return;

      const r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      const progress = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height)));

      if (visualRef.current) {
        visualRef.current.style.transform = `translate3d(0, ${progress * 30}px, 0)`;
      }
      if (copyRef.current) {
        copyRef.current.style.transform = `translate3d(0, ${progress * -18}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    window.addEventListener('resize', handleParallax);

    return () => {
      window.removeEventListener('scroll', handleParallax);
      window.removeEventListener('resize', handleParallax);
    };
  }, []);

  const fullPhotoUrl = getFullAssetUrl(photoUrl);
  const fullCvUrl = getFullAssetUrl(cvUrl);
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <section className="hero" id="home" ref={heroRef}>
      <div className="visual reveal" ref={visualRef}>
        <div className={`portrait ${fullPhotoUrl ? 'has-image' : ''}`}>
          {fullPhotoUrl && (
            <img
              src={fullPhotoUrl}
              alt="Foto de perfil de Denilson Ferreira"
              loading="eager"
              decoding="async"
              {...({ fetchpriority: 'high' } as any)}
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement)?.classList.remove('has-image');
              }}
            />
          )}
        </div>
        <div className="badge">CONHEÇA MEU TRABALHO</div>
      </div>

      <div className="copy reveal reveal-delay-1" ref={copyRef}>
        {status && <small id="status">{status}</small>}
        <h1 id="title">{title}</h1>
        <p id="intro">{intro}</p>
        <div className="buttons">
          <a className="btn" href="#projetos">
            Ver projetos ↗
          </a>
          {fullCvUrl && (
            <a
              className="btn ghost"
              id="cv"
              href={fullCvUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Currículo ↗
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
