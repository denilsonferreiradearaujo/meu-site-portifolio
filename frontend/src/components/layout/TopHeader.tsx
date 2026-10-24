'use client';

import React from 'react';
import { SocialIcon } from '../common/SocialIcon';
import { CustomSocialLink } from '@/types';

interface TopHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isDarkSection?: boolean;
  social: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    email?: string;
    whatsapp?: string;
    customSocials?: string;
  };
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  theme,
  onToggleTheme,
  isDarkSection = false,
  social,
}) => {
  const networks: Array<{ label: string; url: string; key: string }> = [];

  if (social.whatsapp) {
    const rawNumber = social.whatsapp.replace(/\D/g, '');
    const waUrl = social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${rawNumber || '5519999486552'}`;
    networks.push({ label: 'WhatsApp', url: waUrl, key: 'whatsapp' });
  }
  if (social.linkedin) {
    networks.push({ label: 'LinkedIn', url: social.linkedin, key: 'linkedin' });
  }
  if (social.github) {
    networks.push({ label: 'GitHub', url: social.github, key: 'github' });
  }
  if (social.instagram) {
    networks.push({ label: 'Instagram', url: social.instagram, key: 'instagram' });
  }
  if (social.email) {
    networks.push({
      label: 'Email',
      url: social.email.startsWith('mailto:') ? social.email : `mailto:${social.email}`,
      key: 'email',
    });
  }

  // Parse custom socials
  if (social.customSocials) {
    try {
      const parsed: CustomSocialLink[] = JSON.parse(social.customSocials);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item.url) {
            networks.push({
              label: item.name || 'Link',
              url: item.url,
              key: item.icon || item.name || item.url,
            });
          }
        });
      }
    } catch {}
  }

  return (
    <header className={`top ${isDarkSection ? 'dark' : ''}`}>
      <nav className="links">
        <a href="#home">Home</a>
        <a href="#sobre">Sobre</a>
        <a href="#projetos">Projetos</a>
        <a href="#contato">Contato</a>
      </nav>

      <div className="toplogo">DA</div>

      <div className="social">
        {networks.map((net, i) => (
          <a
            key={i}
            href={net.url}
            target="_blank"
            rel="noopener noreferrer"
            title={net.label}
            aria-label={net.label}
          >
            <SocialIcon nameOrUrl={net.key} size={15} />
          </a>
        ))}
        <button
          className="theme"
          onClick={onToggleTheme}
          title="Alternar tema"
          aria-label="Alternar tema claro/escuro"
        >
          {theme === 'dark' ? '☀' : '◐'}
        </button>
      </div>
    </header>
  );
};
