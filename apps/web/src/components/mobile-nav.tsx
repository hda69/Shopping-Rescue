'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  variant?: 'dark' | 'light';
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}

const CLOSE_MS = 220;

export function MobileNav({
  variant = 'light',
  openLabel,
  closeLabel,
  children,
}: MobileNavProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const isDark = variant === 'dark';
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathnameRef = useRef(pathname);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    setVisible(false);
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setMounted(false);
      closeTimer.current = null;
    }, CLOSE_MS);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    if (mounted) closeMenu();
  }, [pathname, mounted, closeMenu]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, closeMenu]);

  function onPanelClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest('a, button[type="submit"]');
    if (interactive) closeMenu();
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${
          isDark
            ? 'text-white/80 hover:bg-white/10 hover:text-white'
            : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#111]'
        }`}
        aria-expanded={visible}
        aria-controls={panelId}
        aria-label={visible ? closeLabel : openLabel}
        onClick={() => (visible ? closeMenu() : openMenu())}
      >
        <span className="relative h-5 w-5" aria-hidden>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
              visible ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
              visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </span>
      </button>

      {mounted && (
        <>
          <button
            type="button"
            aria-label={closeLabel}
            className={`mobile-nav-backdrop fixed inset-0 z-40 sm:hidden ${
              visible ? 'mobile-nav-backdrop--open' : ''
            }`}
            onClick={closeMenu}
          />
          <div
            id={panelId}
            className={`mobile-nav-panel absolute inset-x-0 top-16 z-50 border-b px-4 py-4 shadow-lg ${
              visible ? 'mobile-nav-panel--open' : ''
            } ${
              isDark
                ? 'border-white/10 bg-[#0b0d14]/95 backdrop-blur-xl'
                : 'border-white/60 bg-white/95 backdrop-blur-xl'
            }`}
            onClick={onPanelClick}
          >
            <div
              className={`section-container flex flex-col gap-1 px-0 ${
                visible ? 'mobile-nav-items--open' : 'mobile-nav-items'
              }`}
            >
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
