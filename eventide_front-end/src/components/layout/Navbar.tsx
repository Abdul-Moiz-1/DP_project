import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { Logo, SearchIcon, UserIcon } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeSwitch } from '../theme-switch';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const searchInput = (
    <Input
      aria-label="Search events"
      classNames={{
        inputWrapper: "bg-default-100/50 backdrop-blur-md border border-default-200 group-data-[focus=true]:bg-default-100",
        input: "text-sm",
      }}
      placeholder="Search events..."
      startContent={
        <SearchIcon className="text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          navigate(`/events?search=${encodeURIComponent(e.currentTarget.value)}`);
        }
      }}
    />
  );

  return (
    <HeroNavbar 
      maxWidth="xl" 
      position="sticky"
      className="bg-background/70 backdrop-blur-lg border-b border-default-200/50"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarMenuToggle className="sm:hidden" />
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-2 group"
            to="/"
          >
            <div className="p-1 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Logo />
            </div>
            <p className="font-display font-bold text-inherit tracking-tight text-xl">EVENTIDE</p>
          </Link>
        </NavbarBrand>
        
        <div className="hidden sm:flex gap-6 justify-start ml-8">
          {menuItems.map((item) => (
            <NavbarItem key={item.path} isActive={isActive(item.path)}>
              <Link
                to={item.path}
                className={`font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex" justify="center">
        <NavbarItem className="w-full max-w-xs xl:max-w-md">
          {searchInput}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-3">
          <ThemeSwitch />
          {!isAuthenticated ? (
            <>
              <Button
                as={Link}
                to="/login"
                variant="light"
                className="font-medium"
              >
                Sign In
              </Button>
              <Button
                as={Link}
                to="/register"
                color="primary"
                variant="solid"
                className="font-medium shadow-md shadow-primary/20"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform hover:scale-105"
                  color="primary"
                  name={user?.name || 'U'}
                  size="sm"
                  icon={<UserIcon />}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue="Signed in as">
                  <p className="font-semibold text-xs text-default-500">Signed in as</p>
                  <p className="font-semibold">{user?.email}</p>
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
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-background/90 backdrop-blur-xl pt-6">
        {searchInput}
        <div className="mx-2 mt-6 flex flex-col gap-4">
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.path} isActive={isActive(item.path)}>
              <Link
                to={item.path}
                className={`w-full text-xl font-medium ${
                  isActive(item.path) ? 'text-primary' : 'text-foreground/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          
          <div className="h-px w-full bg-default-200 my-2" />
          
          {!isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <NavbarMenuItem>
                <Button as={Link} to="/login" variant="flat" className="w-full font-medium" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Button>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button as={Link} to="/register" color="primary" className="w-full font-medium" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Button>
              </NavbarMenuItem>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <NavbarMenuItem>
                <Link to="/dashboard" className="w-full text-lg font-medium text-foreground/80 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link to="/dashboard/my-tickets" className="w-full text-lg font-medium text-foreground/80 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  My Tickets
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-lg text-left font-medium text-danger"
                >
                  Sign Out
                </button>
              </NavbarMenuItem>
            </div>
          )}
        </div>
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;