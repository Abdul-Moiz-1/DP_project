import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Menu, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitch } from '../../theme-switch';
import { ALL_SIDEBAR_ITEMS } from './sideBarConfig';

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

const TopBar = ({ onMobileMenuToggle }: TopBarProps) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const getPageTitle = () => {
    if (/^\/dashboard\/event\/\d+\/analytics$/.test(location.pathname)) return 'Analytics';
    if (/^\/dashboard\/event\/\d+$/.test(location.pathname)) return 'Edit Event';

    const currentItem = ALL_SIDEBAR_ITEMS.find((item) =>
      item.path === '/dashboard'
        ? location.pathname === '/dashboard'
        : location.pathname.startsWith(item.path) && item.path !== '/dashboard',
    );

    return currentItem?.name ?? 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-divider bg-background/80 backdrop-blur-md px-6 flex-none">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-default-500 hover:bg-default-100 transition-colors"
        onClick={onMobileMenuToggle}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-lg font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-none">
        <ThemeSwitch />

        <Button
          isIconOnly
          variant="light"
          size="sm"
          className="rounded-full text-default-500"
          aria-label="Notifications"
        >
          <Bell size={17} />
        </Button>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              color="primary"
              name={user?.name || 'U'}
              size="sm"
              className="transition-transform hover:scale-105"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu" variant="flat">
            <DropdownItem key="profile" className="h-12 gap-2" textValue={user?.email || ''}>
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-default-500">{user?.email}</p>
            </DropdownItem>
            <DropdownItem key="settings" onClick={() => navigate('/dashboard/settings')}>
              Settings
            </DropdownItem>
            <DropdownItem key="home" onClick={() => navigate('/')}>
              Go to website
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={logout}>
              Sign out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopBar;
