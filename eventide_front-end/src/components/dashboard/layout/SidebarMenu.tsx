import { NavLink, Link, useLocation } from 'react-router-dom';
import { Avatar } from '@heroui/react';
import { ChevronRight, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '../../Icons';
import type { SideBarItem } from './sideBarConfig';

interface SidebarMenuProps {
  sideBarItems: SideBarItem[];
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onMobileClose: () => void;
}

const SidebarMenu = ({
  sideBarItems,
  collapsed,
  mobileOpen,
  onCollapse,
  onMobileClose,
}: SidebarMenuProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const isItemActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/dashboard/events') {
      return (
        location.pathname === '/dashboard/events' ||
        location.pathname === '/dashboard/events/create' ||
        /^\/dashboard\/event\/\d+$/.test(location.pathname)
      );
    }
    if (path === '/dashboard/analytics') {
      return (
        location.pathname === '/dashboard/analytics' ||
        /^\/dashboard\/event\/\d+\/analytics$/.test(location.pathname)
      );
    }

    return location.pathname.startsWith(path);
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div className={cn(
        'flex items-center border-b border-divider h-16 flex-none',
        collapsed && !isMobile ? 'justify-center px-0' : 'justify-between px-4',
      )}>
        <Link
          to="/dashboard"
          onClick={isMobile ? onMobileClose : undefined}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white flex-none">
            <Logo size={16} />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-display font-semibold text-base text-foreground truncate">
              Eventide
            </span>
          )}
        </Link>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={onCollapse}
            className="hidden md:flex items-center justify-center h-7 w-7 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-colors flex-none"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        )}

        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="flex items-center justify-center h-7 w-7 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-colors flex-none"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {sideBarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={isMobile ? onMobileClose : undefined}
            title={collapsed && !isMobile ? item.name : undefined}
            className={() =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                collapsed && !isMobile ? 'justify-center' : '',
                isItemActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-default-600 hover:bg-default-100 hover:text-foreground',
              )
            }
          >
            {() => (
              <>
                <item.icon
                  size={17}
                  className={cn(
                    'flex-none transition-colors',
                    isItemActive(item.path)
                      ? 'text-primary'
                      : 'text-default-400 group-hover:text-default-600',
                  )}
                />
                {(!collapsed || isMobile) && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-divider p-3 flex-none">
        <div
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-default-100 transition-colors cursor-pointer',
            collapsed && !isMobile ? 'justify-center' : '',
          )}
          title={collapsed && !isMobile ? `${user?.name} · ${user?.role?.toLowerCase()}` : undefined}
        >
          <Avatar name={user?.name || 'U'} size="sm" color="primary" className="flex-none" />
          {(!collapsed || isMobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-default-400 truncate capitalize">
                  {user?.role?.toLowerCase()}
                </p>
              </div>
              <ChevronRight size={14} className="text-default-300 flex-none" />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-screen w-64 bg-background border-r border-divider z-50 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex h-screen border-r border-divider bg-background flex-col transition-all duration-300 flex-none',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
};

export default SidebarMenu;
