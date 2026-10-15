"use client";

import Link from 'next/link';
import { Instagram } from 'lucide-react';

const linkClass = "transition-colors hover:text-white";

const Footer = () => {
  return (
    <footer className="w-full bg-deep py-12 text-deep-foreground md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <p className="mb-4 text-2xl uppercase tracking-[0.12em] text-white">DissolvaGum</p>
            <p className="max-w-[34ch]">
              Chew some gum. Skip the mess. A gum designed to be safe to swallow, in development in Folsom, California.
            </p>
          </div>
          <div>
            <h4 className="ds-label mb-4 text-white">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className={linkClass}>How it works</Link></li>
              <li><Link href="/about" className={linkClass}>About us</Link></li>
              <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="ds-label mb-4 text-white">Legal and support</h4>
            <ul className="space-y-2">
              <li><Link href="/legal/terms" className={linkClass}>Terms &amp; Conditions</Link></li>
              <li><Link href="/legal/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/legal/accessibility" className={linkClass}>Accessibility Statement</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact Us</Link></li>
              <li><Link href="/business-interest" className={linkClass}>Business Interest</Link></li>
              <li><Link href="/support-interest" className={linkClass}>Support Interest</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 md:flex-row">
          <p className="text-sm">&copy; {new Date().getFullYear()} DissolvaGum. All rights reserved.</p>
          <a href="https://www.instagram.com/dissolvagum/" aria-label="Instagram" className={linkClass}>
            <Instagram size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
