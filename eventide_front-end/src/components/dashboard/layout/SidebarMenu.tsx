// src/components/dashboard/DashboardSidebar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@heroui/react";
import { Logo } from "../../Icons";

interface SideBarItem {
  name: string;
  icon: React.ComponentType<any>; 
  path: string 
}

interface SidebarMenuProps {
  sideBarItems: SideBarItem[];
}


const SidebarMenu = ({sideBarItems}: SidebarMenuProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen border-r border-default-200 bg-background sticky top-0 flex flex-col transition-all duration-300",
        collapsed ? "w-19" : "w-64"
      )}
    >
      {/* Header Section */}
      <div
        className={cn(
          "flex items-center justify-baseline px-4 py-4 border-b border-default-200"
        )}
      >
        {/* Toggle Button */}
        {/* <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => setCollapsed(!collapsed)}
          className="hidden md:flex"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button> */}
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-2 text-lg font-bold text-foreground",
            collapsed && "justify-center items-center"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Logo />
          {!collapsed && <span>EVENTIDE</span>}
        </Link>


      </div>

      {/* Sidebar Navigation */}
      <nav className="flex flex-col gap-1 mt-4 px-2 flex-1">
        {sideBarItems.map(({ name, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-default-100 text-default-700",
                collapsed && "justify-center"
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "mt-auto py-4 text-center text-xs text-default-500 border-t border-default-200",
          collapsed && "text-[10px]"
        )}
      >
        © 2025 Eventide
      </div>
    </aside>
  );
};

export default SidebarMenu;
