import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  Ticket,
  BarChart2,
  Settings,
  ShoppingBag,
  Bookmark,
  Star,
  Compass,
} from 'lucide-react';

export interface SideBarItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

export const organizerSidebarItems: SideBarItem[] = [
  { name: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Events',    icon: CalendarDays,    path: '/dashboard/events' },
  { name: 'Create Event', icon: Plus,            path: '/dashboard/events/create' },
  { name: 'Bookings',     icon: Ticket,          path: '/dashboard/bookings' },
  { name: 'Analytics',    icon: BarChart2,       path: '/dashboard/analytics' },
  { name: 'Settings',     icon: Settings,        path: '/dashboard/settings' },
];

export const userSidebarItems: SideBarItem[] = [
  { name: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Tickets',   icon: Ticket,          path: '/dashboard/my-tickets' },
  { name: 'Saved Events', icon: Bookmark,        path: '/dashboard/saved-events' },
  { name: 'My Reviews',   icon: Star,            path: '/dashboard/reviews' },
  { name: 'Browse Events',icon: Compass,         path: '/events' },
  { name: 'Settings',     icon: Settings,        path: '/dashboard/settings' },
];

/** Map route path → page title for the TopBar */
export const ALL_SIDEBAR_ITEMS = [...organizerSidebarItems, ...userSidebarItems];
