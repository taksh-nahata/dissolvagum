"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/business-interest', label: 'Business Interest' },
  { href: '/support-interest', label: 'Support Interest' },
  { href: '/contact', label: 'Contact' },
];

const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // On the home page the header floats over the sidewalk hero until the story scrolls past.
  const [overHero, setOverHero] = useState(isHome);
  const [top, setTop] = useState(0);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setOverHero(false);
      setTop(0);
      return;
    }
    const update = () => {
      const banner = document.getElementById('site-banner');
      setTop(Math.max(0, (banner?.offsetHeight ?? 0) - window.scrollY));
      const story = document.getElementById('story');
      setOverHero(story ? story.getBoundingClientRect().bottom > 72 : false);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isHome, mounted]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next.toString());
    document.documentElement.classList.toggle('dark', next);
  };

  if (!mounted) return null;

  const linkClass = (href: string) =>
    `ds-label whitespace-nowrap py-2 underline-offset-[10px] decoration-2 transition-opacity ${
      pathname === href ? 'underline' : 'opacity-80 hover:opacity-100'
    }`;
  const iconButton =
    'rounded-full p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    (overHero ? 'hover:bg-black/5' : 'hover:bg-secondary');

  return (
    <header
      className={`${isHome ? 'fixed inset-x-0' : 'sticky top-0'} z-40 w-full transition-colors duration-300 ${
        overHero ? 'bg-transparent text-[#12261d]' : 'bg-background/85 text-foreground backdrop-blur'
      }`}
      style={isHome ? { top } : undefined}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-[clamp(16px,2.8vw,44px)] py-4">
        <Link href="/" className="text-2xl uppercase tracking-[0.12em]">
          DissolvaGum
        </Link>
        <nav className="hidden items-center gap-7 xl:flex" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={pathname === l.href ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={toggleDarkMode} className={iconButton} aria-label="Toggle dark mode">
            {darkMode ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
          </button>
          <button className={`${iconButton} xl:hidden`} onClick={() => setIsMobileMenuOpen(true)} aria-label="Open mobile menu">
            <Menu size={24} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-deep text-white">
          <div className="flex items-center justify-between px-[clamp(16px,2.8vw,44px)] py-4">
            <span className="text-2xl uppercase tracking-[0.12em]">DissolvaGum</span>
            <button className="rounded-full p-2.5 hover:bg-white/10" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close mobile menu">
              <X size={24} strokeWidth={1.75} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-[clamp(16px,2.8vw,44px)]" aria-label="Mobile">
            {[{ href: '/', label: 'Home' }, ...links].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-3 text-3xl font-bold tracking-tight transition-opacity ${pathname === l.href ? 'underline decoration-2 underline-offset-8' : 'opacity-80 hover:opacity-100'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
