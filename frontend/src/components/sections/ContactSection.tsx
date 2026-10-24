'use client';

import React from 'react';
import { SocialIcon } from '../common/SocialIcon';
import { CustomSocialLink } from '@/types';

interface ContactSectionProps {
  contactTitle: string;
  social: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    email?: string;
    whatsapp?: string;
    customSocials?: string;
  };
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactTitle,
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
      label: social.email,
      url: social.email.startsWith('mailto:') ? social.email : `mailto:${social.email}`,
      key: 'email',
    });
  }

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
    <section className="section contact reveal" id="contato">
      <div className="kicker">Vamos conversar</div>
      <h2 id="contactTitle">{contactTitle}</h2>

      <div className="buttons" id="contactLinks">
        {networks.map((net, i) => (
          <a
            key={i}
            className="btn ghost"
            href={net.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <SocialIcon nameOrUrl={net.key} size={16} />
            <span>{net.label} ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
};
