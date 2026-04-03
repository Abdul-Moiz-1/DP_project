// src/components/dashboard/DashboardHeader.tsx
import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ThemeSwitch } from "../../theme-switch";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "lucide-react";
import { useEffect } from "react";

const TopBar = () => {
  const { isAuthenticated ,user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
        navigate("/");
    }
  })

  return (

    <header className="flex items-center justify-between px-6 py-3 border-b border-default-200 bg-background sticky top-0 z-40">
      <h1 className="text-xl font-semibold text-foreground">{user?.role} Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button isIconOnly variant="light" className="rounded-full">
          <BellIcon size={18} />
        </Button>
        <ThemeSwitch />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              color="primary"
              name={user?.name || "User"}
              size="sm"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Menu" variant="flat">
            <DropdownItem key="profile">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-default-500">{user?.email}</p>
            </DropdownItem>
            {/* <DropdownItem key="settings" onClick={() => navigate("/dashboard/settings")}>
              Settings
            </DropdownItem> */}
            <DropdownItem key="home" color="primary" onClick={() => navigate("/")}>
              Go to Website
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={logout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopBar;
