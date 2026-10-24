'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredToken } from '@/services/api';

interface SidebarProps {
  isDarkSection?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isDarkSection = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isPortfolio = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Check if token exists in localStorage or if currently on admin page
    const checkToken = () => {
      const token = getStoredToken();
      setIsAdminLoggedIn(Boolean(token) || isAdmin);
    };

    checkToken();
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, [isAdmin, pathname]);

  // Secret shortcut: 3 clicks on DA logo opens /admin
  const handleBrandClick = (e: React.MouseEvent) => {
    if (isAdmin) return;
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 3) {
      setClickCount(0);
      router.push('/admin');
    }

    setTimeout(() => {
      setClickCount(0);
    }, 1200);
  };

  return (
    <aside className={`side ${isDarkSection ? 'dark' : ''}`}>
      <div
        className="brand"
        title="Denilson Ferreira"
        onClick={handleBrandClick}
        style={{ userSelect: 'none' }}
      >
        DA
      </div>

      <nav>
        <Link
          href="/"
          className={`navbtn ${isPortfolio ? 'active' : ''}`}
          title="Portfólio"
          aria-label="Portfólio"
        >
          ⌂
        </Link>

        {/* Engrenagem oculta para visitante comum: só aparece se já estiver autenticado ou na página /admin */}
        {isAdminLoggedIn && (
          <Link
            href="/admin"
            className={`navbtn ${isAdmin ? 'active' : ''}`}
            title="Configurações (Painel)"
            aria-label="Configurações"
          >
            ⚙
          </Link>
        )}
      </nav>
    </aside>
  );
};
