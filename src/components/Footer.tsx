import Link from 'next/link';
import { Instagram } from 'lucide-react';

const LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/support-interest', label: 'Support' },
  { href: '/business-interest', label: 'Business' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/accessibility', label: 'Accessibility' },
];

const Footer = () => (
  <footer className="w-full bg-[#0e1a17] px-[clamp(16px,2.8vw,44px)] py-10 text-[#8fa79a]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <p className="text-xl uppercase tracking-[0.12em] text-[#e8f3ec]">DissolvaGum</p>
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="transition-colors hover:text-[#e8f3ec]">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4 text-sm">
        <span>&copy; {new Date().getFullYear()} DissolvaGum</span>
        <a href="https://www.instagram.com/dissolvagum/" aria-label="Instagram" className="transition-colors hover:text-[#e8f3ec]">
          <Instagram size={18} />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
