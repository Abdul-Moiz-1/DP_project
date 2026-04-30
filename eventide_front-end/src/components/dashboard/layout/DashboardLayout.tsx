import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarMenu from './SidebarMenu';
import TopBar from './TopBar';
import { organizerSidebarItems, userSidebarItems } from './sideBarConfig';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const sideBarItems =
    user?.role === 'ORGANIZER' ? organizerSidebarItems : userSidebarItems;

  return (
    <div className="flex h-screen overflow-hidden bg-default-50">
      <SidebarMenu
        sideBarItems={sideBarItems}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed((v) => !v)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMobileMenuToggle={() => setMobileOpen((v) => !v)} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
