"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// Kept short on purpose: everything else lives in the footer.
const links = [
  { href: '/faq', label: 'FAQ' },
];

const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);
  // On the home page the header floats over the dark street hero until the story scrolls past.
  const [overHero, setOverHero] = useState(isHome);
  const [top, setTop] = useState(0);
  const [hidden, setHidden] = useState(false);

  // Hide while scrolling down, come back on any scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // The dark-mode toggle is gone; clear a choice saved by the old one.
    document.documentElement.classList.remove('dark');
    try { localStorage.removeItem('darkMode'); } catch {}
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
  }, [isHome]);

  const linkClass = (href: string) =>
    `text-[15px] font-bold underline-offset-[8px] decoration-2 transition-opacity ${
      pathname === href ? 'underline' : 'opacity-75 hover:opacity-100'
    }`;

  return (
    <header
      className={`${isHome ? 'fixed inset-x-0' : 'sticky top-0'} z-40 w-full transition-[color,background-color,transform] duration-500 [transition-timing-function:cubic-bezier(.16,.84,.24,1)] ${hidden && !open ? '-translate-y-[120%]' : 'translate-y-0'} ${
        overHero ? 'bg-transparent text-white' : 'bg-background/85 text-foreground backdrop-blur'
      }`}
      style={isHome ? { top } : undefined}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-[clamp(16px,2.8vw,44px)] py-4">
        <Link href="/" className="text-2xl uppercase tracking-[0.12em]">
          DissolvaGum
        </Link>
        <div className="flex items-center gap-7">
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={pathname === l.href ? 'page' : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/get-involved"
            className={`hidden h-10 items-center rounded-lg px-4 text-[15px] font-bold transition-colors md:inline-flex ${
              overHero ? "bg-white text-[#12261d] hover:bg-mint" : "bg-[#12261d] text-white hover:bg-[#1f5133]"
            }`}
          >
            Get involved
          </Link>
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={24} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-deep text-white">
          <div className="flex items-center justify-between px-[clamp(16px,2.8vw,44px)] py-4">
            <span className="text-2xl uppercase tracking-[0.12em]">DissolvaGum</span>
            <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={24} strokeWidth={1.75} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-[clamp(16px,2.8vw,44px)]" aria-label="Mobile">
            {[{ href: '/', label: 'Home' }, ...links, { href: '/get-involved', label: 'Get involved' }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
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
