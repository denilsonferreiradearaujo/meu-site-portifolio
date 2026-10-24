'use client';

import React, { useRef } from 'react';
import { ProjectData } from '@/types';
import { getFullAssetUrl } from '@/services/api';

interface ProjectsSectionProps {
  projects: ProjectData[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -800, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 800, behavior: 'smooth' });
    }
  };

  return (
    <section className="section projects" id="projetos">
      <div className="head reveal">
        <div>
          <div className="kicker">Projetos selecionados</div>
          <h2>Imaginação supera conhecimento.</h2>
        </div>
        <p>Aplicações criadas para desafios reais, automação de rotinas e decisões melhores.</p>
      </div>

      <div className="carouselWrap reveal reveal-delay-1">
        <button
          className="arrow prev"
          onClick={handlePrev}
          aria-label="Projeto anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="carousel" id="carousel" ref={carouselRef}>
          {projects.map((proj, i) => {
            const imageUrl = getFullAssetUrl(proj.image);
            const hasImage = Boolean(imageUrl);

            return (
              <article key={proj.id || i} className="project reveal visible">
                <div className={`media ${hasImage ? 'has-image' : ''}`}>
                  {hasImage && (
                    <img
                      src={imageUrl}
                      alt={`Capa do projeto ${proj.title}`}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.parentElement?.classList.remove('has-image');
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="num">{String(i + 1).padStart(2, '0')}</div>
                </div>

                <div className="projectInfo">
                  <small>{proj.category}</small>
                  <h3>{proj.title}</h3>
                  <p>{proj.description}</p>
                  <a
                    className="btn"
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir projeto ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <button
          className="arrow next"
          onClick={handleNext}
          aria-label="Próximo projeto"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
};
