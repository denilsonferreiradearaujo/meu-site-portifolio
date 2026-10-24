'use client';

import React, { useEffect, useState } from 'react';
import { api, defaultProfile, defaultProjects } from '@/services/api';
import { ProfileData, ProjectData, ToastState } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Toast } from '@/components/common/Toast';

export default function PortfolioPage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [projects, setProjects] = useState<ProjectData[]>(defaultProjects);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDarkSection, setIsDarkSection] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Fetch initial profile & projects from NestJS backend
  useEffect(() => {
    // Read stored theme
    const savedTheme = localStorage.getItem('denilson_portfolio_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    }

    // Load data from API
    api.getProfile().then((data) => setProfile(data));
    api.getProjects().then((data) => setProjects(data));
  }, []);

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('denilson_portfolio_theme', nextTheme);
  };

  // Dark section detection for projects section
  useEffect(() => {
    const handleScrollChrome = () => {
      const projEl = document.getElementById('projetos');
      if (!projEl) return;
      const r = projEl.getBoundingClientRect();
      const isUnder = r.top <= 36 && r.bottom > 36;
      setIsDarkSection(isUnder);
    };

    window.addEventListener('scroll', handleScrollChrome, { passive: true });
    window.addEventListener('resize', handleScrollChrome);
    handleScrollChrome();

    return () => {
      window.removeEventListener('scroll', handleScrollChrome);
      window.removeEventListener('resize', handleScrollChrome);
    };
  }, []);

  // IntersectionObserver for reveal elements
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      elements.forEach((el) => {
        if (!el.classList.contains('visible')) {
          observer.observe(el);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, 50);

    return () => clearTimeout(timer);
  }, [profile, projects]);

  return (
    <>
      <Sidebar isDarkSection={isDarkSection} />

      <main className="app">
        <section id="portfolio" className="screen active">
          <TopHeader
            theme={theme}
            onToggleTheme={handleToggleTheme}
            isDarkSection={isDarkSection}
            social={{
              linkedin: profile.linkedin,
              github: profile.github,
              instagram: profile.instagram,
              email: profile.email,
              whatsapp: profile.whatsapp,
              customSocials: profile.customSocials,
            }}
          />

          <HeroSection
            status={profile.status}
            title={profile.title}
            intro={profile.intro}
            cvUrl={profile.cv}
            photoUrl={profile.photo}
          />

          <AboutSection
            aboutTitle={profile.aboutTitle}
            aboutSide={profile.aboutSide}
            aboutText={profile.aboutText}
            years={profile.years}
            projectsCount={projects.length}
            skills={profile.skills}
          />

          <ProjectsSection projects={projects} />

          <ContactSection
            contactTitle={profile.contact}
            social={{
              linkedin: profile.linkedin,
              github: profile.github,
              instagram: profile.instagram,
              email: profile.email,
              whatsapp: profile.whatsapp,
              customSocials: profile.customSocials,
            }}
          />

          <Footer name={profile.name} />
        </section>
      </main>

      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
    </>
  );
}
