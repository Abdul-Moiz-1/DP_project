import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Kbd,
} from '@heroui/react';
import { Logo, SearchIcon, UserIcon } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeSwitch } from '../theme-switch';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>K</Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroNavbar maxWidth="xl" position="sticky" isBordered >
      {/* Main Content - Logo, Search, and Nav Items */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            to="/"
          >
            <Logo />
            <p className="font-bold text-inherit">EVENTIDE</p>
          </Link>
        </NavbarBrand>
        <NavbarItem className="hidden lg:flex flex-1 ml-2">
          {searchInput}
        </NavbarItem>
        <div className="hidden lg:flex gap-4 justify-start ml-4">
          {menuItems.map((item) => (
            <NavbarItem key={item.path}>
              <Link
                to={item.path}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Right Side Content - Auth & Theme */}
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-4">
          <ThemeSwitch />
          {!isAuthenticated ? (
            <>
              <Button
                as={Link}
                to="/login"
                variant="light"
                color="primary"
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/register"
                color="primary"
                variant="solid"
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
                  className="transition-transform"
                  color="primary"
                  name={user?.name || 'User'}
                  size="sm"
                  icon={<UserIcon />}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem key="dashboard" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownItem>
                <DropdownItem key="my-tickets" onClick={() => navigate('dashboard/my-tickets')}>
                  My Tickets
                </DropdownItem>
                {/* <DropdownItem key="settings" onClick={() => navigate('/settings')}>
                  Settings
                </DropdownItem> */}
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu Toggle */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.path}>
              <Link
                to={item.path}
                className="w-full text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {!isAuthenticated ? (
            <>
              <NavbarMenuItem>
                <Link to="/login" className="w-full text-lg text-primary">
                  Login
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link to="/register" className="w-full text-lg font-semibold text-primary">
                  Sign Up
                </Link>
              </NavbarMenuItem>
            </>
          ) : (
            <>
              <NavbarMenuItem>
                <Link to="/dashboard" className="w-full text-lg">
                  Dashboard
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-lg text-left text-danger"
                >
                  Log Out
                </button>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;