import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@heroui/react";
import { Logo } from "../../Icons";

interface SideBarItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface SidebarMenuProps {
  sideBarItems: SideBarItem[];
}

const SidebarMenu = ({ sideBarItems }: SidebarMenuProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-default-200">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-2 text-lg font-bold text-foreground",
            collapsed && "justify-center"
          )}
        >
          <Logo />
          {!collapsed && <span>EVENTIDE</span>}
        </Link>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => {
            setCollapsed(!collapsed);
            setMobileOpen(false);
          }}
          className="hidden md:flex"
        >
          <Menu size={18} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => setMobileOpen(false)}
          className="md:hidden"
        >
          <X size={18} />
        </Button>
      </div>

      <nav className="flex flex-col gap-1 mt-4 px-2 flex-1">
        {sideBarItems.map(({ name, icon: Icon, path }) => {
          const isActive =
            path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(path);
          return (
            <Link
              key={name}
              to={path}
              onClick={() => setMobileOpen(false)}
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

      <div
        className={cn(
          "mt-auto py-4 text-center text-xs text-default-500 border-t border-default-200",
          collapsed && "text-[10px]"
        )}
      >
        © {new Date().getFullYear()} Eventide
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        isIconOnly
        variant="light"
        className="md:hidden fixed top-3 left-3 z-50"
        onPress={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 h-screen w-64 bg-background border-r border-default-200 z-50 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen border-r border-default-200 bg-background sticky top-0 flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default SidebarMenu;
