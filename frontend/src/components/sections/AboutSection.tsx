'use client';

import React from 'react';

interface AboutSectionProps {
  aboutTitle: string;
  aboutSide: string;
  aboutText: string;
  years: string;
  projectsCount: number;
  skills: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  aboutTitle,
  aboutSide,
  aboutText,
  years,
  projectsCount,
  skills,
}) => {
  const skillChips = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="section" id="sobre">
      <div className="head reveal">
        <div>
          <div className="kicker">Sobre mim</div>
          <h2 id="aboutTitle">{aboutTitle}</h2>
        </div>
        <p id="aboutSide">{aboutSide}</p>
      </div>

      <div className="about reveal reveal-delay-1">
        <div className="card aboutText" id="aboutText">
          {aboutText}
        </div>

        <div>
          <div className="metrics">
            <div className="card metric reveal">
              <b id="years">{years}</b>
              <span>de experiência profissional</span>
            </div>
            <div className="card metric reveal reveal-delay-1">
              <b id="count">{projectsCount}</b>
              <span>projetos publicados</span>
            </div>
            <div className="card metric reveal reveal-delay-2">
              <b>Full<br />Stack</b>
              <span>desenvolvimento e integração</span>
            </div>
            <div className="card metric reveal reveal-delay-3">
              <b>Dados</b>
              <span>indicadores e dashboards</span>
            </div>
          </div>

          <div className="chips reveal reveal-delay-2" id="skills">
            {skillChips.map((skill, index) => (
              <span key={index} className="chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
