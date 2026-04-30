import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Input,
} from '@heroui/react';
import { Search } from 'lucide-react';
import { Logo } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeSwitch } from '../theme-switch';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'About', href: '/about' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const searchInput = (onSubmit?: () => void) => (
    <Input
      aria-label="Search events"
      size="sm"
      classNames={{
        inputWrapper: 'bg-default-100 border-transparent',
        input: 'text-sm',
      }}
      placeholder="Search events..."
      startContent={<Search size={14} className="text-default-400" />}
      type="search"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          navigate(`/events?search=${encodeURIComponent(e.currentTarget.value)}`);
          onSubmit?.();
        }
      }}
    />
  );

  return (
    <HeroNavbar
      maxWidth="xl"
      position="sticky"
      className="bg-background/80 backdrop-blur-md border-b border-divider"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Logo + nav links */}
      <NavbarContent justify="start" className="gap-6">
        <NavbarMenuToggle className="sm:hidden" />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white">
              <Logo size={18} />
            </div>
            <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
              Eventide
            </span>
          </Link>
        </NavbarBrand>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavbarItem key={link.href}>
              <NavLink
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-primary bg-primary/8'
                      : 'text-default-600 hover:text-foreground hover:bg-default-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Search bar — desktop center */}
      <NavbarContent justify="center" className="hidden sm:flex">
        <NavbarItem className="w-full max-w-xs">
          {searchInput()}
        </NavbarItem>
      </NavbarContent>

      {/* Right actions */}
      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        {!isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm" className="font-medium">
                Sign in
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden sm:flex">
              <Button as={Link} to="/register" color="primary" size="sm" className="font-medium">
                Get started
              </Button>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform hover:scale-105"
                  color="primary"
                  name={user?.name || 'U'}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue={user?.email || ''}>
                  <p className="text-xs text-default-500">Signed in as</p>
                  <p className="font-semibold text-sm">{user?.email}</p>
                  {user?.role && (
                    <p className="text-xs text-primary capitalize">{user.role.toLowerCase()}</p>
                  )}
                </DropdownItem>
                <DropdownItem key="dashboard" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownItem>
                <DropdownItem key="my-tickets" onClick={() => navigate('/dashboard/my-tickets')}>
                  My Tickets
                </DropdownItem>
                <DropdownItem key="saved-events" onClick={() => navigate('/dashboard/saved-events')}>
                  Saved Events
                </DropdownItem>
                <DropdownItem key="logout" color="danger" className="text-danger" onClick={handleLogout}>
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}
      </NavbarContent>

      {/* Mobile slide-in menu */}
      <NavbarMenu className="bg-background/95 backdrop-blur-xl pt-6 gap-2">
        {searchInput(() => setIsMenuOpen(false))}

        <div className="mt-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavbarMenuItem key={link.href}>
              <NavLink
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center px-3 py-3 text-base font-medium rounded-xl transition-colors min-h-[48px]',
                    isActive
                      ? 'text-primary bg-primary/8'
                      : 'text-default-600 hover:text-foreground hover:bg-default-100'
                  )
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            </NavbarMenuItem>
          ))}
        </div>

        <div className="h-px w-full bg-divider my-2" />

        {!isAuthenticated ? (
          <div className="flex flex-col gap-2">
            <Button as={Link} to="/login" variant="flat" className="w-full font-medium" onClick={() => setIsMenuOpen(false)}>
              Sign In
            </Button>
            <Button as={Link} to="/register" color="primary" className="w-full font-medium" onClick={() => setIsMenuOpen(false)}>
              Get Started
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/dashboard/my-tickets', label: 'My Tickets' },
              { to: '/dashboard/saved-events', label: 'Saved Events' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex w-full items-center px-3 py-3 text-base font-medium text-default-600 hover:text-foreground hover:bg-default-100 rounded-xl min-h-[48px] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="flex w-full items-center px-3 py-3 text-base font-medium text-danger hover:bg-danger/8 rounded-xl min-h-[48px] text-left transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;
