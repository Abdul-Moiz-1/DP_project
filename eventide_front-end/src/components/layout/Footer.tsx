import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { Logo } from '../Icons';

const productLinks = [
  { label: 'Browse Events', href: '/events' },
  { label: 'Create Event', href: '/dashboard/create-event' },
  { label: 'Dashboard', href: '/dashboard' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-divider mt-12">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-white">
                <Logo size={16} />
              </div>
              <span className="font-display font-semibold text-base text-foreground">Eventide</span>
            </Link>
            <p className="text-sm text-default-500 leading-relaxed max-w-xs">
              Discover and explore the best local events, concerts, and experiences near you.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-default-400 hover:text-foreground transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-default-500 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-default-500 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-3">
              Connect
            </h3>
            <ul className="space-y-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-default-500 hover:text-foreground transition-colors"
                  >
                    <Icon size={14} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-default-400">
          <p>© {year} Eventide. All rights reserved.</p>
          <p>Built with HeroUI &amp; React</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
